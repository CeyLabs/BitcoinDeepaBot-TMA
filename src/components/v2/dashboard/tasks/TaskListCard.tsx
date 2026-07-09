"use client";

import { Fragment } from "react";
import { TaskRow } from "@/components/v2/dashboard/tasks/TaskRow";
import type { Task } from "@/lib/types";

export interface TaskListCardProps {
  items: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function TaskListCard({ items, onTaskClick }: TaskListCardProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-[14px] text-[#64748b]">No tasks found.</p>;
  }

  return (
    <div className="w-full overflow-hidden rounded-[12px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.07)] dark:bg-[#0B0F14]">
      {items.map((item, i) => (
        <Fragment key={item.id}>
          {i > 0 && <div className="h-px bg-[#e2e8f0] dark:bg-[#334155]" />}
          <TaskRow task={item} onClick={onTaskClick ? () => onTaskClick(item.id) : undefined} />
        </Fragment>
      ))}
    </div>
  );
}
