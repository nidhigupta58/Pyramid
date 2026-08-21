import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";

interface ProjectSummary {
  id: string;
  name: string;
  priority: string;
  dueDate: string | null;
}

export default async function ProjectsPage({ params }: PageProps<"/w/[workspaceSlug]/projects">) {
  const { workspaceSlug } = await params;
  const projects = await apiFetch<ProjectSummary[]>(`/workspaces/${workspaceSlug}/projects`);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        {/* Full GroupedTable (priority/lead/due date columns) lands in P7 — this just proves the pipe. */}
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/w/${workspaceSlug}/projects/${project.id}`}
              className="flex items-center justify-between p-3 text-sm hover:bg-muted"
            >
              <span>{project.name}</span>
              <span className="text-xs text-muted-foreground">{project.priority}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
