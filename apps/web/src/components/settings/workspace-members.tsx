"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { apiMutate } from "@/lib/api-client";
import { MemberCell } from "@/components/member-cell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Role, Workspace, WorkspaceMember } from "@/lib/types";

const INVITE_ROLES: Exclude<Role, "OWNER">[] = ["MEMBER", "ADMIN"];

export function WorkspaceMembers({
  workspace,
  members: initialMembers,
  currentUserId,
  canManage,
}: {
  workspace: Workspace;
  members: WorkspaceMember[];
  currentUserId: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<Role, "OWNER">>("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function invite() {
    const trimmed = email.trim();
    if (!trimmed) return;

    setInviting(true);
    try {
      await apiMutate(`/workspaces/${workspace.slug}/invitations`, {
        method: "POST",
        body: JSON.stringify({ email: trimmed, role }),
      });
      toast.success(`Invited ${trimmed}`);
      setEmail("");
    } catch {
      toast.error("Couldn't send that invite. Try again.");
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(userId: string) {
    const previous = members;
    setMembers((current) => current.filter((m) => m.userId !== userId));
    try {
      await apiMutate(`/workspaces/${workspace.slug}/members/${userId}`, { method: "DELETE" });
    } catch {
      toast.error("Couldn't remove that member. Try again.");
      setMembers(previous);
    }
  }

  async function leaveWorkspace() {
    if (!window.confirm(`Leave ${workspace.name}?`)) return;

    setLeaving(true);
    try {
      await apiMutate("/me/leave-workspace", {
        method: "POST",
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Couldn't leave the workspace — transfer ownership first if you're the sole owner.");
      setLeaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Workspace access</h2>

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {members.map((member) => (
          <div key={member.userId} className="flex items-center justify-between gap-4 p-3">
            <div className="flex items-center gap-2">
              <MemberCell member={member.user} />
              <div className="flex flex-col">
                <span className="text-sm text-foreground">{member.user.fullName ?? member.user.email}</span>
                <span className="text-xs text-muted-foreground-faint">{member.user.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground capitalize">{member.role.toLowerCase()}</span>
              {canManage && member.userId !== currentUserId && member.role !== "OWNER" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeMember(member.userId)}
                  aria-label={`Remove ${member.user.email}`}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {canManage && (
          <div className="flex items-center gap-2 p-3">
            <Input
              value={email}
              type="email"
              placeholder="Invite by email"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invite()}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Exclude<Role, "OWNER">)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm capitalize outline-none"
            >
              {INVITE_ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <Button type="button" size="sm" disabled={inviting || !email.trim()} onClick={invite}>
              Invite
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 p-3">
          <span className="text-sm text-muted-foreground">Remove yourself from the workspace</span>
          <Button type="button" variant="destructive" size="sm" disabled={leaving} onClick={leaveWorkspace}>
            Leave Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
