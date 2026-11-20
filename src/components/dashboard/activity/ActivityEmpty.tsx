import { Emoji } from "@/components/ui/emoji";
import { Button } from "@/components/ui/button";

/** Empty / no-results state: floating notepad, title, body and an optional action. */
export function ActivityEmpty({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-7 text-center">
      <Emoji src="/emoji/notepad.webp" size={60} className="animate-float" />
      <p className="font-bold">{title}</p>
      <p className="text-ink3 text-[14px]">{body}</p>
      {actionLabel && onAction && (
        <Button variant="text" size="text" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
