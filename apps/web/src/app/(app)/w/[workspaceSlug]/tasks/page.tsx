import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/shell/top-bar";

interface TaskSummary {
  id: string;
  title: string;
  status: string;
}

export default async function TasksPage({ params }: PageProps<"/w/[workspaceSlug]/tasks">) {
  const { workspaceSlug } = await params;
  const grouped = await apiFetch<Record<string, TaskSummary[]>>(
    `/workspaces/${workspaceSlug}/tasks?groupBy=status`,
  );

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
        <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
        {/* Board (P8) and List (P7) views land here — this just proves the pipe end to end. */}
        <div className="flex gap-4 overflow-x-auto">
          {Object.entries(grouped).map(([status, tasks]) => (
            <div key={status} className="w-64 shrink-0 rounded-lg border border-border p-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                {status} ({tasks.length})
              </div>
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/w/${workspaceSlug}/tasks/${task.id}`}
                    className="rounded-md border border-border bg-card p-2 text-sm hover:bg-muted"
                  >
                    {task.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
