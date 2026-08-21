import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";
import { GroupedTable, type GroupedTableGroup } from "@/components/grouped-table";
import { PriorityCell } from "@/components/priority-cell";
import { MemberCell } from "@/components/member-cell";
import type { ProjectListItem, Status, TaskListItem } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LIST_STATUSES: { status: Status; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "DOING", label: "Doing" },
  { status: "COMPLETED", label: "Completed" },
];

// No GET /projects/:id in the API surface (plan §5) — the list is small enough per workspace
// that finding the project by id from it is the intended pattern, not a missing endpoint.
export default async function ProjectDetailPage({
  params,
}: PageProps<"/w/[workspaceSlug]/projects/[projectId]">) {
  const { workspaceSlug, projectId } = await params;
  const [projects, grouped] = await Promise.all([
    apiFetch<ProjectListItem[]>(`/workspaces/${workspaceSlug}/projects`),
    apiFetch<Record<Status, TaskListItem[]>>(
      `/workspaces/${workspaceSlug}/tasks?projectId=${projectId}&groupBy=status`,
    ),
  ]);

  const project = projects.find((p) => p.id === projectId);
  if (!project) notFound();

  const groups: GroupedTableGroup<TaskListItem>[] = LIST_STATUSES.map(({ status, label }) => ({
    key: status,
    label,
    rows: grouped[status] ?? [],
  }));

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
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <h1 className="text-base font-semibold tracking-tight">Tasks</h1>
        <GroupedTable
          groups={groups}
          nameHeader="Task"
          nameRender={(task) => task.title}
          hrefFor={(task) => `/w/${workspaceSlug}/tasks/${task.id}`}
          addLabel="Add Task"
          columns={[
            { header: "Priority", render: (task) => <PriorityCell priority={task.priority} /> },
            { header: "Members", render: (task) => <MemberCell member={task.assignee} /> },
            {
              header: "Due Date",
              render: (task) => (
                <span className="text-foreground/70">
                  {task.dueDate ? format(new Date(task.dueDate), "d MMM yyyy") : "—"}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
