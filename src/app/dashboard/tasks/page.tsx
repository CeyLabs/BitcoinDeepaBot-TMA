import { redirect } from "next/navigation";

// Tasks are off for now (News took their tab). The page and its components in
// src/components/dashboard/tasks stay for when tasks come back.
export default function TasksPage() {
  redirect("/dashboard");
}
