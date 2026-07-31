"use client";

import { TaskHeroCard } from "@/components/dashboard/tasks/TaskHeroCard";
import { ReferralProgressCard } from "@/components/dashboard/tasks/ReferralProgressCard";
import { ManageTasksSection } from "@/components/dashboard/tasks/ManageTasksSection";
import {
  MOCK_TASKS,
  MOCK_TASK_STATS,
  MOCK_REFERRAL_PROGRESS,
} from "@/components/dashboard/tasks/mock-data";
import { useStore } from "@/lib/store";

export default function TasksPage() {
  const { balanceVisible } = useStore();

  return (
    <div className="flex w-full flex-col gap-5">
      <TaskHeroCard stats={MOCK_TASK_STATS} visible={balanceVisible} />
      <ReferralProgressCard {...MOCK_REFERRAL_PROGRESS} />
      <ManageTasksSection items={MOCK_TASKS} />
    </div>
  );
}
