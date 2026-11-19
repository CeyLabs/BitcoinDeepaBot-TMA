import { Badge } from "@/components/ui/badge";
import { Hero } from "@/components/ui/hero";

// Task completion and rewards aren't tracked by the backend yet, so the stats
// show a dash instead of made-up numbers.
const NO_DATA = "–";

function TopStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
      <p className="text-[14px] leading-[14px] font-medium">{label}</p>
      {children}
    </div>
  );
}

function GlassCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 py-3 text-center">
      <p className="text-[14px] leading-[14px] font-medium">{label}</p>
      <p className="num text-[16px] leading-4 font-semibold">{value}</p>
    </div>
  );
}

export function TaskHeroCard() {
  return (
    <Hero src="/bg/hero-blue.webp" priority innerClassName="gap-2 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-[5px]">
          <p className="font-display text-[24px] leading-[26px] font-bold">Your task earnings</p>
          <p className="text-[14px] leading-4">Complete daily tasks to earn more</p>
        </div>
        <Badge variant="onBrand" className="mt-0.5">
          Soon
        </Badge>
      </div>

      <div className="flex gap-2">
        <TopStat label="Tasks completed">
          <p className="num text-[16px] leading-4 font-semibold">{NO_DATA}</p>
        </TopStat>
        <TopStat label="Today’s tasks">
          <p className="flex items-baseline gap-1">
            <span className="num text-[16px] leading-4 font-semibold">{NO_DATA}</span>
            <span className="text-[12px] leading-4">completed</span>
          </p>
        </TopStat>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white/30 px-3">
        <GlassCol label="Total earned" value={NO_DATA} />
        <span aria-hidden className="h-[67px] w-px shrink-0 bg-white/60" />
        <GlassCol label="Today’s earnings" value={NO_DATA} />
      </div>
    </Hero>
  );
}
