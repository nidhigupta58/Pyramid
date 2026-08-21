import { Paperclip } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";
import { GroupedTable, type GroupedTableGroup } from "@/components/grouped-table";
import { PriorityCell } from "@/components/priority-cell";
import { MemberCell } from "@/components/member-cell";
import { DueBadge } from "@/components/due-badge";
import { Chip } from "@/components/chip";
import { StubAction } from "@/components/stub-action";
import { RailActions } from "@/components/task-detail/rail-actions";
import { DetailsPanel } from "@/components/task-detail/details-panel";
import { UpdatesPanel } from "@/components/task-detail/updates-panel";
import { ActivityFeed } from "@/components/task-detail/activity-feed";
import type { TaskDetail, TaskListItem } from "@/lib/types";

export default async function TaskDetailPage({ params }: PageProps<"/w/[workspaceSlug]/tasks/[taskId]">) {
  const { workspaceSlug, taskId } = await params;
  const task = await apiFetch<TaskDetail>(`/workspaces/${workspaceSlug}/tasks/${taskId}`);

  const subtaskGroups: GroupedTableGroup<TaskListItem>[] = [
    { key: "subtasks", label: "Subtasks", rows: task.subtasks },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 flex-col gap-4 px-5 pb-6 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{task.title}</h1>
            {task.description && (
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{task.description}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[78px_1fr] items-center text-sm">
              <div className="text-muted-foreground-faint">Properties</div>
              <div className="flex items-center gap-2">
                {task.assignee && (
                  <div className="flex items-center gap-1.5">
                    <MemberCell member={task.assignee} className="size-4 text-[8px]" />
                    <span className="text-foreground/80">{task.assignee.fullName}</span>
                  </div>
                )}
                {task.dueDate && <DueBadge date={task.dueDate} />}
              </div>
            </div>
            <div className="grid grid-cols-[78px_1fr] items-center text-sm">
              <div className="text-muted-foreground-faint">Labels</div>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map(({ labelId, label }) => (
                  <Chip key={labelId} label={label.name} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[78px_1fr] items-center text-sm">
              <div className="text-muted-foreground-faint">Resources</div>
              <StubAction
                label="Add document or link"
                icon={<Paperclip className="size-3.5" />}
                className="text-muted-foreground-placeholder"
              >
                Add document or link…
              </StubAction>
            </div>
          </div>

          <GroupedTable
            groups={subtaskGroups}
            nameHeader="Task"
            nameRender={(subtask) => subtask.title}
            hrefFor={(subtask) => `/w/${workspaceSlug}/tasks/${subtask.id}`}
            addLabel="Add Subtasks"
            columns={[
              { header: "Priority", render: (subtask) => <PriorityCell priority={subtask.priority} /> },
              { header: "Members", render: (subtask) => <MemberCell member={subtask.assignee} /> },
              {
                header: "Due Date",
                width: "9rem",
                render: (subtask) =>
                  subtask.dueDate ? <DueBadge date={subtask.dueDate} /> : <span className="text-muted-foreground-faint">—</span>,
              },
            ]}
          />

          <ActivityFeed taskId={task.id} workspaceSlug={workspaceSlug} comments={task.comments} />
        </div>

        <div className="flex w-full flex-col gap-3 md:w-[250px] md:shrink-0">
          <RailActions />
          <DetailsPanel task={task} workspaceSlug={workspaceSlug} />
          <UpdatesPanel activity={task.activity} />
        </div>
      </div>
    </div>
  );
}
