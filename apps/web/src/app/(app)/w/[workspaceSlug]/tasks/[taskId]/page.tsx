import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
}

export default async function TaskDetailPage({ params }: PageProps<"/w/[workspaceSlug]/tasks/[taskId]">) {
  const { workspaceSlug, taskId } = await params;
  const task = await apiFetch<TaskDetail>(`/workspaces/${workspaceSlug}/tasks/${taskId}`);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 flex-col gap-2 px-6 pb-6">
        {/* Full task detail (subtasks, activity, right rail) lands in P10 — this just proves the pipe. */}
        <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
        {task.description && <p className="max-w-xl text-sm text-muted-foreground">{task.description}</p>}
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{task.status}</span>
          <span>·</span>
          <span>{task.priority}</span>
        </div>
      </div>
    </div>
  );
}
