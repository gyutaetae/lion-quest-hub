import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Clock, RefreshCw } from "lucide-react";
import { useEffect } from "react";

const QRGenerator = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [qrData, setQrData] = useState<{ code: string; expiresAt: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((qrData.expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        setQrData(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData]);

  const generateQR = async () => {
    if (!title.trim() || !user) return;
    setLoading(true);
    try {
      // Create meeting
      const { data: meeting, error: meetingErr } = await supabase
        .from("meetings")
        .insert({ title: title.trim(), created_by: user.id })
        .select()
        .single();
      if (meetingErr) throw meetingErr;

      // Generate unique code
      const code = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const { error: qrErr } = await supabase
        .from("attendance_qr")
        .insert({
          meeting_id: meeting.id,
          code,
          expires_at: expiresAt.toISOString(),
        });
      if (qrErr) throw qrErr;

      setQrData({ code, expiresAt });
      setTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="lion-shadow border-0">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📱 출석 QR 코드 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrData ? (
          <div className="space-y-3">
            <Input
              placeholder="모임 제목 (예: 5주차 정기 모임)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateQR()}
            />
            <Button
              onClick={generateQR}
              disabled={!title.trim() || loading}
              className="w-full active:scale-[0.97]"
            >
              {loading ? "생성 중..." : "QR 코드 생성 (5분 유효)"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-inner">
              <QRCodeSVG value={qrData.code} size={220} level="H" />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={timeLeft < 60 ? "text-destructive" : "text-foreground"}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} 남음
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              부원들에게 이 QR 코드를 보여주세요
            </p>
            <Button variant="outline" size="sm" onClick={() => setQrData(null)} className="gap-1.5 active:scale-95">
              <RefreshCw className="w-3.5 h-3.5" /> 새로 생성
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRGenerator;
