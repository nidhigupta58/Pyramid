"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { apiMutate } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Workspace } from "@/lib/types";

export function WorkspaceList({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createWorkspace() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      const workspace = await apiMutate<Workspace>("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setName("");
      router.push(`/w/${workspace.slug}/tasks`);
    } catch {
      toast.error("Couldn't create that workspace. Try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Your workspaces</h2>

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {workspaces.map((w) => (
          <Link
            key={w.id}
            href={`/w/${w.slug}/tasks`}
            className="flex items-center justify-between gap-4 p-3 text-sm text-foreground hover:bg-muted"
          >
            {w.name}
            {w.id === activeWorkspaceId && <span className="text-xs text-muted-foreground">Active</span>}
          </Link>
        ))}

        <div className="flex items-center gap-2 p-3">
          <Input
            value={name}
            placeholder="New workspace name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
          />
          <Button type="button" size="sm" disabled={creating || !name.trim()} onClick={createWorkspace}>
            <Plus className="size-3.5" />
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
