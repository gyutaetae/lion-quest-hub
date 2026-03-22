import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, Trophy, LogOut, Scan, Shield } from "lucide-react";
import { motion } from "framer-motion";
import QRGenerator from "@/components/dashboard/QRGenerator";
import QRScanner from "@/components/dashboard/QRScanner";
import Leaderboard from "@/components/dashboard/Leaderboard";

const LEVEL_NAMES = ["", "응애사자", "아기사자", "코딩사자", "해커사자", "마스터사자"];
const LEVEL_THRESHOLDS = [0, 0, 50, 200, 500, 1000];

const Dashboard = () => {
  const { user, profile, isAdmin, signOut, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "qr-gen" | "qr-scan">("leaderboard");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  const nextLevel = Math.min(profile.level + 1, 5);
  const currentThreshold = LEVEL_THRESHOLDS[profile.level];
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  const progress = nextLevel > profile.level
    ? ((profile.total_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-foreground text-lg">🦁 멋쟁이사자</span>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> 운영진
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={signOut} className="active:scale-95">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="lion-shadow border-0 overflow-hidden">
            <div className="lion-gradient h-20" />
            <CardContent className="relative pt-0 pb-6 px-6">
              <div className="flex items-end gap-4 -mt-10">
                <Avatar className="w-20 h-20 border-4 border-card shadow-md">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-lg font-bold bg-accent text-accent-foreground">
                    {profile.display_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-foreground">{profile.display_name || "이름 없음"}</h2>
                  <p className="text-sm text-muted-foreground">
                    LV.{profile.level} {LEVEL_NAMES[profile.level]}
                  </p>
                </div>
                <div className="ml-auto text-right pb-1">
                  <div className="text-2xl font-bold text-primary tabular-nums">{profile.total_points}</div>
                  <div className="text-xs text-muted-foreground">포인트</div>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>LV.{profile.level} → LV.{nextLevel}</span>
                  <span>{profile.total_points}/{nextThreshold}p</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-2"
        >
          <Button
            variant={activeTab === "leaderboard" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("leaderboard")}
            className="gap-1.5 active:scale-95"
          >
            <Trophy className="w-4 h-4" /> 리더보드
          </Button>
          <Button
            variant={activeTab === "qr-scan" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("qr-scan")}
            className="gap-1.5 active:scale-95"
          >
            <Scan className="w-4 h-4" /> 출석하기
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === "qr-gen" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("qr-gen")}
              className="gap-1.5 active:scale-95"
            >
              <QrCode className="w-4 h-4" /> QR 생성
            </Button>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === "leaderboard" && <Leaderboard />}
          {activeTab === "qr-scan" && <QRScanner onSuccess={refreshProfile} />}
          {activeTab === "qr-gen" && isAdmin && <QRGenerator />}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
