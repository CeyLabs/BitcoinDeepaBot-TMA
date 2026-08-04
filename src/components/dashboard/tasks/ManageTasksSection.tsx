"use client";

import { useMemo, useState } from "react";
import { TaskFilterTabs, type TaskFilter } from "@/components/dashboard/tasks/TaskFilterTabs";
import { TaskListCard } from "@/components/dashboard/tasks/TaskListCard";
import { useTMA } from "@/lib/hooks";
import { haptic } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

export interface ManageTasksSectionProps {
  items: Task[];
}

export function ManageTasksSection({ items }: ManageTasksSectionProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const { openTelegramLink, shareStory } = useTMA();
  const { userID, count } = useStore();

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.frequency === filter);
  }, [items, filter]);

  const handleTaskClick = (taskId: string) => {
    switch (taskId) {
      case "task-setup-wallet":
        haptic.impact("light");
        openTelegramLink("https://t.me/BitcoinDeepaBot");
        break;
      case "task-join-community":
        haptic.impact("light");
        openTelegramLink("https://t.me/+iiP-rX7ldYxjZWU1");
        break;
      case "task-share-story": {
        haptic.impact("heavy");
        shareStory("https://ceyloncash.com/bitcoindeepa/tma/story.mp4", {
          text: `Proud OG Member of Bitcoin දීප. ${count} Citizens and Counting 🚀🔥\n\nhttps://t.me/BitcoinDeepaBot/private_invite?startapp=${userID}\n\n#bitcoindeepa @bitcoindeepabot #viralstory`,
          widget_link: {
            url: `https://t.me/BitcoinDeepaBot/private_invite?startapp=${userID}`,
            name: "Inner Circle Entry",
          },
        });
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[14px] leading-4 font-bold text-[#475569] dark:text-[#94a3b8]">Tasks</p>

      <TaskFilterTabs value={filter} onChange={setFilter} />

      <TaskListCard items={filtered} onTaskClick={handleTaskClick} />
    </div>
  );
}
