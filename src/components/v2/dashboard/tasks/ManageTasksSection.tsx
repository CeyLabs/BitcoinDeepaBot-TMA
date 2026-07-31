"use client";

import { useMemo, useState } from "react";
import { initHapticFeedback } from "@telegram-apps/sdk-react";
import { TaskFilterTabs, type TaskFilter } from "@/components/v2/dashboard/tasks/TaskFilterTabs";
import { TaskListCard } from "@/components/v2/dashboard/tasks/TaskListCard";
import { useTMA } from "@/lib/hooks";
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
        openTelegramLink("https://t.me/BitcoinDeepaBot");
        break;
      case "task-join-community":
        openTelegramLink("https://t.me/+iiP-rX7ldYxjZWU1");
        break;
      case "task-share-story": {
        const haptic = initHapticFeedback();
        haptic.impactOccurred("heavy");
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
      <p className="text-[14px] font-bold leading-4 text-[#475569] dark:text-[#94a3b8]">Tasks</p>

      <TaskFilterTabs value={filter} onChange={setFilter} />

      <TaskListCard items={filtered} onTaskClick={handleTaskClick} />
    </div>
  );
}
