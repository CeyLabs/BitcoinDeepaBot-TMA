import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/ui/emoji";
import { Section } from "@/components/ui/section";

/** Gifting has no backend yet: a coming-soon card in its place. */
export function GiftPlansComingSoon() {
  return (
    <Section title="Gift plans">
      <Card className="flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center">
        <Emoji src="/emoji/gift.webp" size={64} className="animate-float" />
        <h3 className="text-[18px]">Gifting is coming soon</h3>
        <p className="text-ink3 max-w-[290px] text-[14px]">
          You&apos;ll be able to send gift plans and manage them here in a future update.
        </p>
        <Badge>Coming soon</Badge>
      </Card>
    </Section>
  );
}
