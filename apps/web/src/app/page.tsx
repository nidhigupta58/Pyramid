import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";

interface WorkspaceSummary {
  id: string;
  slug: string;
}

interface Preferences {
  activeWorkspaceId: string | null;
}

export default async function RootPage() {
  let workspaces: WorkspaceSummary[];
  let preferences: Preferences;
  try {
    [workspaces, preferences] = await Promise.all([
      apiFetch<WorkspaceSummary[]>("/workspaces"),
      apiFetch<Preferences>("/me/preferences"),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    throw err;
  }

  const active = workspaces.find((w) => w.id === preferences.activeWorkspaceId) ?? workspaces[0];
  if (!active) redirect("/login");

  redirect(`/w/${active.slug}/tasks`);
}
