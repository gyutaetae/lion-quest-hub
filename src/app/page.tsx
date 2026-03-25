"use client";

import Link from "next/link";
import { HomeSidebar } from "@/components/layout/HomeSidebar";
import { GrowthLionCard } from "@/components/lion/GrowthLionCard";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_40%),linear-gradient(180deg,_#e8f8fd_0%,_#d9eff7_55%,_#c8e5ee_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[240px_1fr]">
        <HomeSidebar />

        <section className="glass-card lion-shadow rounded-[28px] border border-white/60 p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-lion-blue-dark">
                CYWORLD + LIKELION
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold leading-tight text-lion-blue-dark md:text-5xl">
                  성장하는 사자를 위한
                  <br />
                  감성 미니홈피
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-600">
                  오늘의 출석, 레벨, 방명록 같은 활동을 미니홈피 감성으로 보여주는
                  메인 화면입니다. 요청하신 구조에 맞춰 홈, 로그인, 프로필 페이지
                  기반을 함께 준비했습니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-lion-blue-deep text-white hover:bg-lion-blue-dark">
                  <Link href="/login">구글 로그인</Link>
                </Button>
                <Button asChild variant="outline" className="border-lion-blue-deep/20 bg-white/70">
                  <Link href="/profile">성장 사자 프로필</Link>
                </Button>
              </div>
            </div>

            <GrowthLionCard
              lionName="멋사 새싹"
              level="Lv. 3 Blue Roar"
              message="오늘도 한 걸음씩 성장 중"
              points={1280}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
