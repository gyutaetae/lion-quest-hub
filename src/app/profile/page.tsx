import { HomeSidebar } from "@/components/layout/HomeSidebar";
import { MiniHomeHeader } from "@/components/layout/MiniHomeHeader";
import { GrowthLionCard } from "@/components/lion/GrowthLionCard";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f4fbfd_0%,_#d8eef5_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[240px_1fr]">
        <HomeSidebar />

        <section className="space-y-6">
          <MiniHomeHeader />

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <GrowthLionCard
              lionName="성장 사자"
              level="Lv. 12 Brave Builder"
              message="출석 21일째, 오늘도 코딩 완료"
              points={3420}
            />

            <article className="glass-card lion-shadow rounded-[28px] border border-white/70 p-6">
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-lion-blue-dark">
                    마이홈피 소개
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    이 페이지는 성장 사자의 상태, 오늘의 한마디, 최근 활동을 보여주는
                    프로필 메인 화면 예시입니다.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      오늘의 기분
                    </p>
                    <p className="mt-2 text-lg font-semibold text-lion-blue-dark">
                      집중 모드
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      최근 미션
                    </p>
                    <p className="mt-2 text-lg font-semibold text-lion-blue-dark">
                      Next.js 구조 정리
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      방문자
                    </p>
                    <p className="mt-2 text-lg font-semibold text-lion-blue-dark">
                      128명
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
