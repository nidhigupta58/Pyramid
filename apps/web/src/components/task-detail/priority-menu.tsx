"use client";

import { useRouter } from "next/navigation";
import { Check, SignalHigh } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiMutate } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { PRIORITY_CLASS, PRIORITY_LABEL, PRIORITY_ORDER } from "@/lib/priority";
import type { Priority } from "@/lib/types";

export function PriorityMenu({
  taskId,
  workspaceSlug,
  priority,
  children,
}: {
  taskId: string;
  workspaceSlug: string;
  priority: Priority;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function select(next: Priority) {
    await apiMutate(`/workspaces/${workspaceSlug}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ priority: next }),
    });
    router.refresh();
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1.5">
        <div className="px-2 pb-1.5 text-xs text-muted-foreground-faint">Priority</div>
        {PRIORITY_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => select(p)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
              PRIORITY_CLASS[p],
            )}
          >
            <SignalHigh className="size-3.5" />
            <span className="flex-1 text-left">{PRIORITY_LABEL[p]}</span>
            {p === priority && <Check className="size-3.5 text-foreground" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
