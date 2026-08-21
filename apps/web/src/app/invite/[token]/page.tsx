import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { Workspace } from "@/lib/types";

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;

  try {
    const invitation = await apiFetch<{ workspaceId: string }>(`/invitations/${token}/accept`, { method: "POST" });
    const workspaces = await apiFetch<Workspace[]>("/workspaces");
    const workspace = workspaces.find((w) => w.id === invitation.workspaceId);
    redirect(workspace ? `/w/${workspace.slug}/tasks` : "/");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect(`/login?next=/invite/${token}`);
    if (err instanceof ApiError) {
      return (
        <main className="flex min-h-full flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium text-foreground">This invitation isn&apos;t valid</p>
          <p className="text-sm text-muted-foreground">{err.message}</p>
        </main>
      );
    }
    throw err;
  }
}
