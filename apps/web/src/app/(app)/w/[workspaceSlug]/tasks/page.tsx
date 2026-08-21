import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";
import { GroupedTable, type GroupedTableGroup } from "@/components/grouped-table";
import { PriorityCell } from "@/components/priority-cell";
import { MemberCell } from "@/components/member-cell";
import type { Status, TaskListItem } from "@/lib/types";

// Refs 04/05: the List view only ever shows these three groups, unlike the board's four/five.
const LIST_STATUSES: { status: Status; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "DOING", label: "Doing" },
  { status: "COMPLETED", label: "Completed" },
];

export default async function TasksPage({ params }: PageProps<"/w/[workspaceSlug]/tasks">) {
  const { workspaceSlug } = await params;
  const grouped = await apiFetch<Record<Status, TaskListItem[]>>(
    `/workspaces/${workspaceSlug}/tasks?groupBy=status`,
  );

  const groups: GroupedTableGroup<TaskListItem>[] = LIST_STATUSES.map(({ status, label }) => ({
    key: status,
    label,
    rows: grouped[status] ?? [],
  }));

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
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
