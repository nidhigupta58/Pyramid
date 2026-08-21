import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";
import { GroupedTable, type GroupedTableGroup } from "@/components/grouped-table";
import { PriorityCell } from "@/components/priority-cell";
import { MemberCell } from "@/components/member-cell";
import type { ProjectListItem } from "@/lib/types";

export default async function ProjectsPage({ params }: PageProps<"/w/[workspaceSlug]/projects">) {
  const { workspaceSlug } = await params;
  const projects = await apiFetch<ProjectListItem[]>(`/workspaces/${workspaceSlug}/projects`);

  const groups: GroupedTableGroup<ProjectListItem>[] = [{ key: "all", label: "All Projects", rows: projects }];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <h1 className="text-base font-semibold tracking-tight">Projects</h1>
        <GroupedTable
          groups={groups}
          nameHeader="Projects"
          nameRender={(project) => project.name}
          hrefFor={(project) => `/w/${workspaceSlug}/projects/${project.id}`}
          addLabel="Add Projects"
          columns={[
            { header: "Priority", render: (project) => <PriorityCell priority={project.priority} /> },
            { header: "Lead", render: (project) => <MemberCell member={project.lead} /> },
            {
              header: "Due Date",
              render: (project) => (
                <span className="text-foreground/70">
                  {project.dueDate ? format(new Date(project.dueDate), "d MMM yyyy") : "—"}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
