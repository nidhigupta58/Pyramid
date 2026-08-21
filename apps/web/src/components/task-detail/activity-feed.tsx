"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Paperclip, Send, User } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { apiMutate } from "@/lib/api-client";
import type { CommentItem } from "@/lib/types";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Composer({ placeholder, onSubmit }: { placeholder: string; onSubmit: (body: string) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(value.trim());
      setValue("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground-placeholder"
      />
      <Paperclip className="size-3.5 text-muted-foreground-placeholder" />
      <button type="button" onClick={submit} disabled={submitting} aria-label="Send">
        <Send className="size-3.5 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
}

export function ActivityFeed({
  taskId,
  workspaceSlug,
  comments,
}: {
  taskId: string;
  workspaceSlug: string;
  comments: CommentItem[];
}) {
  const router = useRouter();

  async function postComment(body: string) {
    try {
      await apiMutate(`/workspaces/${workspaceSlug}/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      router.refresh();
    } catch {
      toast.error("Couldn't post comment. Try again.");
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-sm font-semibold text-foreground">Activity</div>

      <div className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
        {comments.map((comment, i) => (
          <div
            key={comment.id}
            className={i > 0 ? "flex flex-col gap-2 border-t border-border-row pt-2.5" : "flex flex-col gap-2"}
          >
            <div className="flex items-center gap-2">
              <UserAvatar className="size-4.5" />
              <span className="text-sm font-semibold text-foreground">{comment.author.fullName}</span>
              <span className="text-xs text-muted-foreground-faint">{timeAgo(comment.createdAt)}</span>
              <div className="flex-1" />
              <User className="size-3.5 text-muted-foreground-placeholder" />
              <MoreHorizontal className="size-3.5 text-muted-foreground-placeholder" />
            </div>
            <div className="text-sm text-foreground/80">{comment.body}</div>
          </div>
        ))}

        <div
          className={
            comments.length > 0
              ? "flex items-center gap-2 border-t border-border-row pt-2.5"
              : "flex items-center gap-2"
          }
        >
          <UserAvatar className="size-4.5" />
          <Composer placeholder="Leave a reply…" onSubmit={postComment} />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border p-3">
        <Composer placeholder="Add a comment…" onSubmit={postComment} />
      </div>
    </div>
  );
}
