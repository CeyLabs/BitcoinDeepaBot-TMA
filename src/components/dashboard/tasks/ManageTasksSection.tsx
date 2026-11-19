"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Segmented } from "@/components/ui/segmented";
import { TaskHeroCard } from "@/components/dashboard/tasks/TaskHeroCard";
import { ReferralProgressCard } from "@/components/dashboard/tasks/ReferralProgressCard";
import { TaskListCard } from "@/components/dashboard/tasks/TaskListCard";
import { haptic, usePlatform } from "@/platform";
import { useUserCount } from "@/hooks/query/useUserCount";
import { useUser } from "@/hooks/useUser";
import { getInviteUrl, TELEGRAM_BOT_URL } from "@/lib/constants";
import type { Task, TaskFrequency } from "@/lib/types";

type TaskFilter = "all" | TaskFrequency;

const FILTERS = [
  { value: "all", label: "All" },
  { value: "one_time", label: "One-time" },
  { value: "daily", label: "Daily" },
] as const;

/** Tasks that open something real. Anything else in the list shows "Soon". */
const STARTABLE = new Set(["task-setup-wallet", "task-join-community", "task-share-story"]);

export interface ManageTasksSectionProps {
  items: Task[];
}

export function ManageTasksSection({ items }: ManageTasksSectionProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const toast = useToast();
  const platform = usePlatform();
  const { count } = useUserCount();
  const { id: userId } = useUser();

  const filtered = useMemo(() => {
    // Story sharing only exists inside Telegram — hide the task elsewhere.
    const available = platform.capabilities.stories
      ? items
      : items.filter((item) => item.id !== "task-share-story");
    if (filter === "all") return available;
    return available.filter((item) => item.frequency === filter);
  }, [items, filter, platform.capabilities.stories]);

  const handleStart = (taskId: string) => {
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
          toast({
            type: "error",
            title: "Not Available",
            description: "Couldn't open story sharing. Please try again.",
          });
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="stagger flex w-full flex-col gap-5">
      <h1 className="text-center text-[24px] leading-7">Tasks</h1>

      <TaskHeroCard />

      <ReferralProgressCard />

      <Segmented label="Task type" options={FILTERS} value={filter} onChange={setFilter} />

      <TaskListCard items={filtered} startable={STARTABLE} onStart={handleStart} />
    </div>
  );
}
