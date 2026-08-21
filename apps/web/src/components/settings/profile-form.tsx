"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { apiMutate } from "@/lib/api-client";
import { UserAvatar } from "@/components/user-avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CurrentUser } from "@/lib/types";

type ProfileField = "fullName" | "title" | "username";

const FIELD_ROWS: { field: ProfileField; label: string; hint?: string; placeholder: string }[] = [
  { field: "fullName", label: "Full name", placeholder: "Your name" },
  { field: "title", label: "Title", hint: "Your job title or role", placeholder: "Designer" },
  { field: "username", label: "Username", hint: "One word, like a nickname or first name", placeholder: "Dexuser" },
];

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [values, setValues] = useState({
    fullName: user.fullName ?? "",
    title: user.title ?? "",
    username: user.username ?? "",
  });

  async function saveField(field: ProfileField, initial: string | null) {
    const value = values[field].trim();
    if (value === (initial ?? "")) return;

    try {
      await apiMutate("/me", { method: "PATCH", body: JSON.stringify({ [field]: value || null }) });
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't save that change. Try again.");
      setValues((prev) => ({ ...prev, [field]: initial ?? "" }));
    }
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 p-4">
        <Label className="text-sm text-foreground">Profile picture</Label>
        <UserAvatar className="size-8" />
      </div>

      <div className="flex items-center justify-between gap-4 p-4">
        <Label className="text-sm text-foreground">Email</Label>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {user.email}
          <Pencil className="size-3.5 text-muted-foreground-faint" />
        </div>
      </div>

      {FIELD_ROWS.map(({ field, label, hint, placeholder }) => {
        const initial = user[field];
        return (
          <div key={field} className="flex items-center justify-between gap-4 p-4">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm text-foreground">{label}</Label>
              {hint && <span className="text-xs text-muted-foreground-faint">{hint}</span>}
            </div>
            <Input
              value={values[field]}
              placeholder={placeholder}
              className="w-56"
              onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
              onBlur={() => saveField(field, initial)}
            />
          </div>
        );
      })}
    </div>
  );
}
