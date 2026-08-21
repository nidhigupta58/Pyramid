import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";
import { PageToolbar } from "@/components/toolbar/page-toolbar";
import { NestedFieldsMenu } from "@/components/toolbar/nested-fields-menu";
import { GroupedTable, type GroupedTableGroup } from "@/components/grouped-table";
import { PriorityCell } from "@/components/priority-cell";
import { MemberCell } from "@/components/member-cell";
import type { ProjectListItem } from "@/lib/types";

export default async function ProjectsPage({
  params,
  searchParams,
}: PageProps<"/w/[workspaceSlug]/projects">) {
  const { workspaceSlug } = await params;
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  const projects = await apiFetch<ProjectListItem[]>(
    `/workspaces/${workspaceSlug}/projects${query ? `?q=${encodeURIComponent(query)}` : ""}`,
  );

  const groups: GroupedTableGroup<ProjectListItem>[] = [{ key: "all", label: "All Projects", rows: projects }];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <PageToolbar title="Projects" addLabel="Add Projects" fieldsMenu={<NestedFieldsMenu />} />
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
              width: "9rem",
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
