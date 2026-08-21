import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProjectSummary {
  id: string;
  name: string;
}

interface TaskSummary {
  id: string;
  title: string;
  status: string;
}

// No GET /projects/:id in the API surface (plan §5) — the list is small enough per workspace
// that finding the project by id from it is the intended pattern, not a missing endpoint.
export default async function ProjectDetailPage({
  params,
}: PageProps<"/w/[workspaceSlug]/projects/[projectId]">) {
  const { workspaceSlug, projectId } = await params;
  const [projects, tasks] = await Promise.all([
    apiFetch<ProjectSummary[]>(`/workspaces/${workspaceSlug}/projects`),
    apiFetch<TaskSummary[]>(`/workspaces/${workspaceSlug}/tasks?projectId=${projectId}`),
  ]);

  const project = projects.find((p) => p.id === projectId);
  if (!project) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/w/${workspaceSlug}/projects`}>Projects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
        <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/w/${workspaceSlug}/tasks/${task.id}`}
              className="flex items-center justify-between p-3 text-sm hover:bg-muted"
            >
              <span>{task.title}</span>
              <span className="text-xs text-muted-foreground">{task.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
