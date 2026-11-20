"use client";

import { Card } from "@/components/ui/card";
import { TaskRow } from "@/components/dashboard/tasks/TaskRow";
import type { Task } from "@/lib/types";

export interface TaskListCardProps {
  items: Task[];
  /** Ids of tasks that have something to open; the rest show "Soon". */
  startable: ReadonlySet<string>;
  onStart: (taskId: string) => void;
}

export function TaskListCard({ items, startable, onStart }: TaskListCardProps) {
  if (items.length === 0) {
    return <p className="text-ink3 py-8 text-center text-[14px]">No tasks here yet.</p>;
  }

  return (
    <Card className="py-1">
      {items.map((item) => (
        <TaskRow
          key={item.id}
          task={item}
          onStart={startable.has(item.id) ? () => onStart(item.id) : undefined}
        />
      ))}
    </Card>
  );
}
