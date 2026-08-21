import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";
import { PageToolbar } from "@/components/toolbar/page-toolbar";
import { FieldsMenu } from "@/components/toolbar/fields-menu";
import { GroupedTable, type GroupedTableColumn, type GroupedTableGroup } from "@/components/grouped-table";
import { PriorityCell } from "@/components/priority-cell";
import { MemberCell } from "@/components/member-cell";
import { BoardView } from "@/components/board/board-view";
import { withDefaults } from "@/lib/fields";
import type { BoardData, Status, TaskListItem } from "@/lib/types";

interface Preferences {
  listFields: Record<string, boolean>;
  boardFields: Record<string, boolean>;
}

// Refs 04/05: the List view only ever shows these three groups, unlike the board's four.
const LIST_STATUSES: { status: Status; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "DOING", label: "Doing" },
  { status: "COMPLETED", label: "Completed" },
];

export default async function TasksPage({
  params,
  searchParams,
}: PageProps<"/w/[workspaceSlug]/tasks">) {
  const { workspaceSlug } = await params;
  const { view, q } = await searchParams;
  const isList = view === "list";
  const query = typeof q === "string" ? q : "";

  const [grouped, preferences] = await Promise.all([
    apiFetch<BoardData>(
      `/workspaces/${workspaceSlug}/tasks?groupBy=status${query ? `&q=${encodeURIComponent(query)}` : ""}`,
    ),
    apiFetch<Preferences>("/me/preferences"),
  ]);
  const listFields = withDefaults(preferences.listFields);
  const boardFields = withDefaults(preferences.boardFields);

  const allColumns: (GroupedTableColumn<TaskListItem> | false)[] = [
    listFields.priority && { header: "Priority", render: (task) => <PriorityCell priority={task.priority} /> },
    listFields.members && { header: "Members", render: (task) => <MemberCell member={task.assignee} /> },
    listFields.dueDate && {
      header: "Due Date",
      width: "9rem",
      render: (task) => (
        <span className="text-foreground/70">
          {task.dueDate ? format(new Date(task.dueDate), "d MMM yyyy") : "—"}
        </span>
      ),
    },
  ];
  const columns = allColumns.filter((c): c is GroupedTableColumn<TaskListItem> => c !== false);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <PageToolbar
          title="Tasks"
          addLabel="Add Task"
          fieldsMenu={<FieldsMenu view={isList ? "list" : "board"} listFields={listFields} boardFields={boardFields} />}
        />
        {isList ? (
          <GroupedTable
            groups={LIST_STATUSES.map(({ status, label }): GroupedTableGroup<TaskListItem> => ({
              key: status,
              label,
              rows: grouped[status] ?? [],
            }))}
            nameHeader="Task"
            nameRender={(task) => task.title}
            hrefFor={(task) => `/w/${workspaceSlug}/tasks/${task.id}`}
            addLabel="Add Task"
            columns={columns}
          />
        ) : (
          <BoardView workspaceSlug={workspaceSlug} initialData={grouped} fields={boardFields} />
        )}
      </div>
    </div>
  );
}
