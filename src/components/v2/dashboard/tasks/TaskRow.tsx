"use client";

import { Badge, Cell } from "@telegram-apps/telegram-ui";
import Image from "next/image";
import type { Task } from "@/lib/types";

export interface TaskRowProps {
  task: Task;
  onClick?: () => void;
}

export function TaskRow({ task, onClick }: TaskRowProps) {
  return (
    <Cell
      Component={onClick ? "button" : "div"}
      onClick={onClick}
      before={
          <Image src={task.icon} alt="" width={40} height={40} className="size-10 self-center" />
      }
      subtitle={
        <span className="text-xs text-[#64748B] dark:text-[#94a3b8]">{task.description}</span>
      }
      after={
        <div className="flex flex-col items-end gap-1">
          <Badge type="number" className="bg-[#FA7119]! text-white! whitespace-nowrap text-xs! font-light!">
            {task.rewardSats} sats
          </Badge>
          <span className="text-[12px] font-medium text-[#3B7DF5]">
            {task.frequency === "daily" ? "Daily" : "One Time"}
          </span>
        </div>
      }
      className="px-3! gap-2! w-full! text-left!"
    >
      <span className="text-base font-semibold leading-5 text-[#1b2027] dark:text-white">
        {task.title}
      </span>
    </Cell>
  );
}
