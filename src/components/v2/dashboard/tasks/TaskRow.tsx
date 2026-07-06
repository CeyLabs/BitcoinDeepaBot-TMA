"use client";

import { Cell } from "@telegram-apps/telegram-ui";
import type { Task } from "@/lib/types";

export interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  return (
    <Cell
      before={
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] text-[20px]"
          style={{ background: task.iconBg }}
        >
          {task.icon}
        </div>
      }
      subtitle={
        <span className="text-xs text-[#64748B] dark:text-[#94a3b8]">{task.description}</span>
      }
      after={
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-[#FA7119] px-2 py-0.5 text-[12px] font-semibold text-white">
            {task.rewardSats} sats
          </span>
          <span className="text-[12px] font-medium text-[#3B7DF5]">
            {task.frequency === "daily" ? "Daily" : "One Time"}
          </span>
        </div>
      }
      className="px-3! gap-2!"
    >
      <span className="text-base font-semibold leading-5 text-[#1b2027] dark:text-white">
        {task.title}
      </span>
    </Cell>
  );
}
