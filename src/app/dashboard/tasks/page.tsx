"use client";

import { ManageTasksSection } from "@/components/dashboard/tasks/ManageTasksSection";
import { MOCK_TASKS } from "@/components/dashboard/tasks/mock-data";

export default function TasksPage() {
  return (
    <div className="flex w-full flex-col gap-5">
      <ManageTasksSection items={MOCK_TASKS} />
    </div>
  );
}
