"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/components/ui/emoji";
import { fmtSats } from "@/lib/formatters";
import type { Task } from "@/lib/types";

export interface TaskRowProps {
  task: Task;
  /** Omitted for tasks with nothing to open yet: they show "Soon". */
  onStart?: () => void;
}

export function TaskRow({ task, onStart }: TaskRowProps) {
  return (
    <div className="after:bg-line relative flex items-center gap-3 p-3 after:absolute after:right-3 after:bottom-0 after:left-16 after:h-px last:after:hidden">
      <Emoji src={task.icon} size={40} />
      <div className="flex min-w-0 grow flex-col gap-0.5">
        <p className="text-[16px] leading-5 font-semibold">{task.title}</p>
        <p className="text-ink3 text-[12px] leading-4">{task.description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge className="h-[22px]">{fmtSats(task.rewardSats)} sats</Badge>
        {onStart ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onStart}
            aria-label={`Start: ${task.title}`}
          >
            Start
          </Button>
        ) : (
          <span className="text-ink3 text-[12px] font-semibold">Soon</span>
        )}
      </div>
    </div>
  );
}
