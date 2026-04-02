import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Clock, Copy, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const QRGenerator = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const { toast } = useToast();
  const [validMinutes, setValidMinutes] = useState("5");
  const [qrData, setQrData] = useState<{ code: string; expiresAt: Date; meetingTitle: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const qrValue = useMemo(() => {
    if (!qrData || typeof window === "undefined") return "";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = new URL("/dashboard", baseUrl);
    url.searchParams.set("checkin", qrData.code);
    return url.toString();
  }, [qrData]);

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
    const minutes = Number(validMinutes);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 30) {
      toast({
        title: "유효시간 설정 오류",
        description: "QR 유효시간은 1분에서 30분 사이로 설정해 주세요.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: meeting, error: meetingErr } = await supabase
        .from("meetings")
        .insert({ title: title.trim(), created_by: user.id })
        .select()
        .single();
      if (meetingErr) throw meetingErr;

      const code = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

      const { error: qrErr } = await supabase
        .from("attendance_qr")
        .insert({
          meeting_id: meeting.id,
          code,
          expires_at: expiresAt.toISOString(),
        });
      if (qrErr) throw qrErr;

      setQrData({ code, expiresAt, meetingTitle: title.trim() });
      setTitle("");
    } catch (err) {
      console.error(err);
      toast({
        title: "QR 생성 실패",
        description: err instanceof Error ? err.message : "QR 생성 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCheckInCode = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast({
      title: "복사 완료",
      description: "출석 링크를 복사했습니다.",
    });
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
            <Input
              inputMode="numeric"
              placeholder="유효시간(분)"
              value={validMinutes}
              onChange={(e) => setValidMinutes(e.target.value.replace(/[^0-9]/g, ""))}
            />
            <Button
              onClick={generateQR}
              disabled={!title.trim() || loading}
              className="w-full active:scale-[0.97]"
            >
              {loading ? "생성 중..." : "QR 코드 생성"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{qrData.meetingTitle}</div>
              <div className="text-xs text-muted-foreground">운영진 화면에 이 QR을 띄우고 부원이 스캔하면 즉시 출석됩니다.</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-inner">
              <QRCodeSVG value={qrValue || qrData.code} size={220} level="H" includeMargin />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={timeLeft < 60 ? "text-destructive" : "text-foreground"}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} 남음
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              부원들이 휴대폰 카메라로 스캔하면 출석 링크를 인식합니다
            </p>
            <div className="w-full rounded-xl border bg-muted/30 p-3 text-xs">
              <div className="font-medium text-foreground">출석 코드</div>
              <div className="mt-1 break-all text-muted-foreground">{qrData.code}</div>
            </div>
            <div className="flex w-full gap-2">
              <Button variant="outline" size="sm" onClick={() => copyCheckInCode(qrValue || qrData.code)} className="flex-1 gap-1.5 active:scale-95">
                <Copy className="w-3.5 h-3.5" /> 링크 복사
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQrData(null)} className="flex-1 gap-1.5 active:scale-95">
                <RefreshCw className="w-3.5 h-3.5" /> 새로 생성
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRGenerator;
