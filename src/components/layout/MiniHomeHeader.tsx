export function MiniHomeHeader() {
  return (
    <header className="lion-shadow rounded-[28px] border border-white/70 bg-white/80 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-lion-blue-dark/70">
            Profile
          </p>
          <h1 className="mt-2 text-3xl font-bold text-lion-blue-dark">
            성장 사자 마이홈피
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            URL 경로와 페이지 레이아웃을 확인하기 좋은 기본 프로필 헤더입니다.
          </p>
        </div>

        <div className="rounded-2xl bg-lion-sky px-4 py-3 text-sm font-medium text-lion-blue-dark">
          TODAY 24 | TOTAL 128
        </div>
      </div>
    </header>
  );
}
