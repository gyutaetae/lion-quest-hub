"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Trophy, LogOut, Scan, Shield, Settings, Home, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import QRGenerator from "@/features/dashboard/components/QRGenerator";
import QRScanner from "@/features/dashboard/components/QRScanner";
import Leaderboard from "@/features/dashboard/components/Leaderboard";
import ProfileEditor from "@/features/dashboard/components/ProfileEditor";
import PointManager from "@/features/dashboard/components/PointManager";
import RecentPointFeed from "@/features/dashboard/components/RecentPointFeed";
import MiniHome from "@/features/social/components/MiniHome";

const LEVEL_NAMES = ["", "응애사자", "아기사자", "코딩사자", "해커사자", "마스터사자"];
const LEVEL_THRESHOLDS = [0, 0, 50, 200, 500, 1000];

const DashboardView = () => {
  const { user, profile, isAdmin, signOut, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("leaderboard");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="leaderboard" className="gap-2 rounded-full border bg-background px-4 py-2">
                <Trophy className="w-4 h-4" /> 리더보드
              </TabsTrigger>
              <TabsTrigger value="qr-scan" className="gap-2 rounded-full border bg-background px-4 py-2">
                <Scan className="w-4 h-4" /> 출석하기
              </TabsTrigger>
              <TabsTrigger value="my-room" className="gap-2 rounded-full border bg-background px-4 py-2">
                <Home className="w-4 h-4" /> 내 미니홈피
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2 rounded-full border bg-background px-4 py-2">
                <Settings className="w-4 h-4" /> 프로필 설정
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin-qr" className="gap-2 rounded-full border bg-background px-4 py-2">
                  <QrCode className="w-4 h-4" /> QR 생성
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="admin-points" className="gap-2 rounded-full border bg-background px-4 py-2">
                  <Sparkles className="w-4 h-4" /> 포인트 관리
                </TabsTrigger>
              )}
            </TabsList>
          </motion.div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <TabsContent value="leaderboard" className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Leaderboard />
              <RecentPointFeed />
            </TabsContent>
            <TabsContent value="qr-scan">
              <QRScanner onSuccess={refreshProfile} />
            </TabsContent>
            <TabsContent value="my-room">
              <MiniHome profileId={profile.id} />
            </TabsContent>
            <TabsContent value="profile">
              <ProfileEditor />
            </TabsContent>
            {isAdmin && (
              <TabsContent value="admin-qr">
                <QRGenerator />
              </TabsContent>
            )}
            {isAdmin && (
              <TabsContent value="admin-points">
                <PointManager />
              </TabsContent>
            )}
          </motion.div>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardView;
