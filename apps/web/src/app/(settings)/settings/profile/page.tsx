import { apiFetch } from "@/lib/api";
import { ProfileForm } from "@/components/settings/profile-form";
import { WorkspaceList } from "@/components/settings/workspace-list";
import { WorkspaceMembers } from "@/components/settings/workspace-members";
import type { CurrentUser, Workspace, WorkspaceMember } from "@/lib/types";

interface Preferences {
  activeWorkspaceId: string | null;
}

export default async function ProfilePage() {
  const [user, workspaces, preferences] = await Promise.all([
    apiFetch<CurrentUser>("/me"),
    apiFetch<Workspace[]>("/workspaces"),
    apiFetch<Preferences>("/me/preferences"),
  ]);

  const activeWorkspace = workspaces.find((w) => w.id === preferences.activeWorkspaceId) ?? workspaces[0] ?? null;
  const members = activeWorkspace
    ? await apiFetch<WorkspaceMember[]>(`/workspaces/${activeWorkspace.slug}/members`)
    : [];
  const myRole = members.find((m) => m.userId === user.id)?.role ?? "MEMBER";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Profile</h1>
        <ProfileForm user={user} />
      </div>

      <WorkspaceList workspaces={workspaces} activeWorkspaceId={activeWorkspace?.id ?? null} />

      {activeWorkspace && (
        <WorkspaceMembers
          workspace={activeWorkspace}
          members={members}
          currentUserId={user.id}
          canManage={myRole === "OWNER" || myRole === "ADMIN"}
        />
      )}
    </div>
  );
}
