import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, CheckCircle2, XCircle, Keyboard } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  onSuccess: () => void;
}

const QRScanner = ({ onSuccess }: Props) => {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const checkIn = async (code: string) => {
    if (processing) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc("check_in_attendance", { _qr_code: code });
      if (error) throw error;
      const res = data as any;
      setResult({ success: res.success, message: res.message });
      if (res.success) onSuccess();
    } catch (err: any) {
      setResult({ success: false, message: err.message || "오류가 발생했습니다" });
    } finally {
      setProcessing(false);
      stopScanner();
    }
  };

  const startScanner = async () => {
    setResult(null);
    setScanning(true);
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => checkIn(decodedText),
        () => {}
      );
    } catch (err) {
      console.error(err);
      setScanning(false);
      setShowManual(true);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <Card className="lion-shadow border-0">
      <CardHeader>
        <CardTitle className="text-lg">📷 출석 체크</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <div className={`flex flex-col items-center gap-3 py-6 ${result.success ? "text-green-600" : "text-destructive"}`}>
            {result.success ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            <p className="font-medium text-lg">{result.message}</p>
            <Button variant="outline" size="sm" onClick={() => setResult(null)} className="active:scale-95">
              다시 시도
            </Button>
          </div>
        ) : (
          <>
            <div id="qr-reader" className="rounded-xl overflow-hidden" />
            {!scanning && !showManual && (
              <div className="flex gap-2">
                <Button onClick={startScanner} className="flex-1 gap-1.5 active:scale-[0.97]">
                  <Scan className="w-4 h-4" /> 카메라로 스캔
                </Button>
                <Button variant="outline" onClick={() => setShowManual(true)} className="active:scale-95">
                  <Keyboard className="w-4 h-4" />
                </Button>
              </div>
            )}
            {scanning && (
              <Button variant="outline" onClick={stopScanner} className="w-full active:scale-95">
                스캔 중지
              </Button>
            )}
            {showManual && (
              <div className="space-y-2">
                <Input
                  placeholder="QR 코드를 직접 입력"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && manualCode && checkIn(manualCode)}
                />
                <Button
                  onClick={() => checkIn(manualCode)}
                  disabled={!manualCode || processing}
                  className="w-full active:scale-[0.97]"
                >
                  {processing ? "확인 중..." : "출석 확인"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
