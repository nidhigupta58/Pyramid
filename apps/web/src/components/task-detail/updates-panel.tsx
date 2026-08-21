import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/user-avatar";
import type { ActivityItem } from "@/lib/types";

function describeActivity(entry: ActivityItem): string {
  switch (entry.verb) {
    case "priority_changed":
      return `changed priority from ${entry.meta.from} to ${entry.meta.to}`;
    case "posted_update":
      return `posted an update · ${entry.meta.month}`;
    case "status_changed":
      return `changed status from ${entry.meta.from} to ${entry.meta.to}`;
    default:
      return entry.verb.replace(/_/g, " ");
  }
}

export function UpdatesPanel({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="text-sm font-semibold text-foreground">Updates</div>
      {activity.map((entry) => (
        <div key={entry.id} className="flex items-start gap-1.5">
          <UserAvatar className="mt-0.5 size-4" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">{entry.actor.fullName ?? "Someone"}</div>
            <div className="truncate text-xs text-muted-foreground-faint">
              {describeActivity(entry)} · {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
