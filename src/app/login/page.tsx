"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GrowthLionCard } from "@/components/lion/GrowthLionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  const handleGoogleLogin = async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eef9fc_0%,_#d5edf5_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GrowthLionCard
          lionName="로그인 대기 중"
          level="Lv. 1 Welcome Cub"
          message="Google 계정으로 입장하면 미니홈피가 열려요"
          points={0}
        />

        <section className="glass-card lion-shadow rounded-[28px] border border-white/70 p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-lion-blue-dark/70">
                Login
              </p>
              <h1 className="text-3xl font-bold text-lion-blue-dark">
                구글 로그인 페이지
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                Supabase OAuth와 연결되는 기본 로그인 화면입니다.
              </p>
            </div>

            <div className="grid gap-3">
              <Input value="lion@example.com" readOnly />
              <Input value="Google OAuth로 계속하기" readOnly />
            </div>

            <Button
              onClick={handleGoogleLogin}
              size="lg"
              disabled={!isSupabaseConfigured}
              className="w-full bg-lion-blue-deep text-white hover:bg-lion-blue-dark"
            >
              {isSupabaseConfigured
                ? "Google로 로그인"
                : "환경변수 설정 후 로그인 가능"}
            </Button>

            {!isSupabaseConfigured ? (
              <p className="text-sm leading-6 text-amber-700">
                `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`과
                `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 입력하면 로그인 기능이
                활성화됩니다.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
