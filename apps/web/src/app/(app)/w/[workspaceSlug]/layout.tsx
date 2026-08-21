import { notFound, redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
}

interface CurrentUser {
  fullName: string | null;
  email: string;
}

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps<"/w/[workspaceSlug]">) {
  const { workspaceSlug } = await params;

  let user: CurrentUser;
  let workspaces: WorkspaceSummary[];
  try {
    [user, workspaces] = await Promise.all([
      apiFetch<CurrentUser>("/me"),
      apiFetch<WorkspaceSummary[]>("/workspaces"),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    throw err;
  }

  // WorkspaceGuard on the API 404s for a slug the caller isn't a member of — trust that
  // rather than re-deriving membership here (defense in depth already lives server-side).
  const activeWorkspace = workspaces.find((w) => w.slug === workspaceSlug);
  if (!activeWorkspace) notFound();

  return (
    <SidebarProvider>
      <AppSidebar user={user} workspaces={workspaces} activeWorkspace={activeWorkspace} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
