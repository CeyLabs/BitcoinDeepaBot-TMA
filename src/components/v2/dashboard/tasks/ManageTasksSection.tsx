"use client";

import { useMemo, useState } from "react";
import { TaskFilterTabs, type TaskFilter } from "@/components/v2/dashboard/tasks/TaskFilterTabs";
import { TaskListCard } from "@/components/v2/dashboard/tasks/TaskListCard";
import type { Task } from "@/lib/types";

export interface ManageTasksSectionProps {
  items: Task[];
}

export function ManageTasksSection({ items }: ManageTasksSectionProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.frequency === filter);
  }, [items, filter]);

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] font-bold leading-4 text-[#475569] dark:text-[#94a3b8]">Tasks</p>

      <TaskFilterTabs value={filter} onChange={setFilter} />

      <TaskListCard items={filtered} />
    </div>
  );
}
