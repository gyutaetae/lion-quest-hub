import Link from "next/link";

const navItems = [
  { href: "/", label: "메인 홈피" },
  { href: "/login", label: "구글 로그인" },
  { href: "/profile", label: "성장 사자 홈" },
];

export function HomeSidebar() {
  return (
    <aside className="glass-card lion-shadow rounded-[28px] border border-white/70 p-5">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-lion-blue-dark/70">
            My Lion App
          </p>
          <h2 className="mt-2 text-2xl font-bold text-lion-blue-dark">
            싸이월드 감성 메뉴
          </h2>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="rounded-2xl bg-lion-sky p-4 text-sm leading-6 text-slate-600">
          오늘의 배경색은 <strong>#A7D5E5</strong> 테마로 설정되어 있습니다.
        </div>
      </div>
    </aside>
  );
}
