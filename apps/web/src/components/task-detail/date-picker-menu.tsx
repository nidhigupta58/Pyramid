"use client";

import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { apiMutate } from "@/lib/api-client";

export function DatePickerMenu({
  taskId,
  workspaceSlug,
  dueDate,
  children,
}: {
  taskId: string;
  workspaceSlug: string;
  dueDate: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function select(date: Date | undefined) {
    if (!date) return;
    await apiMutate(`/workspaces/${workspaceSlug}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ dueDate: date.toISOString() }),
    });
    router.refresh();
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dueDate ? new Date(dueDate) : undefined}
          onSelect={select}
          defaultMonth={dueDate ? new Date(dueDate) : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
