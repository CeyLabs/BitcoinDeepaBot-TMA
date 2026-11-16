"use client";

import { useMemo, useState } from "react";
import { Snackbar } from "@telegram-apps/telegram-ui";
import { AlertCircle } from "lucide-react";
import { TaskFilterTabs, type TaskFilter } from "@/components/dashboard/tasks/TaskFilterTabs";
import { TaskListCard } from "@/components/dashboard/tasks/TaskListCard";
import { haptic, usePlatform } from "@/platform";
import { useStore } from "@/lib/store";
import { useUser } from "@/hooks/useUser";
import { getInviteUrl, TELEGRAM_BOT_URL } from "@/lib/constants";
import type { Task } from "@/lib/types";

export interface ManageTasksSectionProps {
  items: Task[];
}

export function ManageTasksSection({ items }: ManageTasksSectionProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [snackbarError, setSnackbarError] = useState<string | null>(null);
  const platform = usePlatform();
  const { count } = useStore();
  const { id: userId } = useUser();

  const filtered = useMemo(() => {
    // Story sharing only exists inside Telegram — hide the task elsewhere.
    const available = platform.capabilities.stories
      ? items
      : items.filter((item) => item.id !== "task-share-story");
    if (filter === "all") return available;
    return available.filter((item) => item.frequency === filter);
  }, [items, filter, platform.capabilities.stories]);

  const handleTaskClick = (taskId: string) => {
    switch (taskId) {
      case "task-setup-wallet":
        haptic.impact("medium");
        platform.openTelegramLink(TELEGRAM_BOT_URL);
        break;
      case "task-join-community":
        haptic.impact("medium");
        platform.openTelegramLink("https://t.me/+iiP-rX7ldYxjZWU1");
        break;
      case "task-share-story": {
        if (!platform.capabilities.stories) return;
        // The WebApp API can throw on clients without story support.
        try {
          haptic.impact("heavy");
          platform.shareStory("https://ceyloncash.com/bitcoindeepa/tma/story.mp4", {
            text: `Proud OG Member of Bitcoin දීප. ${count} Citizens and Counting 🚀🔥\n\n${getInviteUrl(userId)}\n\n#bitcoindeepa @bitcoindeepabot #viralstory`,
            widget_link: {
              url: getInviteUrl(userId),
              name: "Inner Circle Entry",
            },
          });
        } catch (error) {
          console.error("Failed to share story:", error);
          setSnackbarError("Couldn't open story sharing. Please try again.");
        }
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

      {snackbarError && (
        <Snackbar
          onClose={() => setSnackbarError(null)}
          description={snackbarError}
          className="bottom-24! z-100!"
          before={<AlertCircle size={20} className="text-[#F45A5A]" />}
        >
          Not Available
        </Snackbar>
      )}
    </div>
  );
}
