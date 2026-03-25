type GrowthLionCardProps = {
  lionName: string;
  level: string;
  message: string;
  points: number;
};

export function GrowthLionCard({
  lionName,
  level,
  message,
  points,
}: GrowthLionCardProps) {
  return (
    <article className="lion-shadow overflow-hidden rounded-[28px] border border-white/70 bg-white/75">
      <div className="lion-gradient p-6 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/80">Lion Avatar</p>
        <h2 className="mt-3 text-3xl font-bold">{lionName}</h2>
        <p className="mt-2 text-sm text-white/85">{level}</p>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex items-center justify-center rounded-[24px] bg-lion-sky px-6 py-8">
          <div className="relative h-40 w-40 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#fff8d9,_#f4c76a_55%,_#d89a2b_100%)] shadow-inner">
            <div className="absolute left-4 top-5 h-10 w-10 rounded-full bg-[#f2bb4f]" />
            <div className="absolute right-4 top-5 h-10 w-10 rounded-full bg-[#f2bb4f]" />
            <div className="absolute left-1/2 top-10 h-20 w-24 -translate-x-1/2 rounded-[50%] bg-[#ffd97a]" />
            <div className="absolute left-9 top-16 h-4 w-4 rounded-full bg-[#2f4858]" />
            <div className="absolute right-9 top-16 h-4 w-4 rounded-full bg-[#2f4858]" />
            <div className="absolute left-1/2 top-24 h-5 w-7 -translate-x-1/2 rounded-full bg-[#8c4f20]" />
            <div className="absolute left-1/2 top-28 h-6 w-12 -translate-x-1/2 rounded-b-full border-b-4 border-[#8c4f20]" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Today Message</p>
            <p className="mt-2 text-sm font-medium text-slate-700">{message}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Point</p>
            <p className="mt-2 text-2xl font-bold text-lion-blue-dark">
              {points.toLocaleString()}P
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
