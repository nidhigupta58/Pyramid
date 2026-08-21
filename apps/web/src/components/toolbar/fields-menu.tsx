"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiMutate } from "@/lib/api-client";
import { FIELDS_MENU_ROWS, type FieldKey, type FieldsState } from "@/lib/fields";

export function FieldsMenu({
  view,
  listFields,
  boardFields,
}: {
  view: "list" | "board";
  listFields: FieldsState;
  boardFields: FieldsState;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"list" | "board">(view);
  const fields = tab === "list" ? listFields : boardFields;

  function switchTab(next: "list" | "board") {
    setTab(next);
    if (next !== view) {
      const url = new URL(window.location.href);
      if (next === "list") url.searchParams.set("view", "list");
      else url.searchParams.delete("view");
      router.push(url.pathname + url.search);
    }
  }

  async function toggle(key: FieldKey, checked: boolean) {
    const next = { ...fields, [key]: checked };
    const patchKey = tab === "list" ? "listFields" : "boardFields";
    await apiMutate("/me/preferences", { method: "PATCH", body: JSON.stringify({ [patchKey]: next }) });
    router.refresh();
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <LayoutGrid className="size-3.5" />
          Fields
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5">
        <Tabs value={tab} onValueChange={(v) => switchTab(v as "list" | "board")}>
          <TabsList className="mb-1.5 grid w-full grid-cols-2">
            <TabsTrigger value="list" className="gap-1.5 text-xs">
              <ListIcon className="size-3.5" />
              List
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-1.5 text-xs">
              <LayoutGrid className="size-3.5" />
              Board
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col">
          {FIELDS_MENU_ROWS.map((row, i) => (
            <label
              key={`${row.key}-${i}`}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              {row.label}
              <Checkbox
                checked={fields[row.key]}
                onCheckedChange={(checked) => toggle(row.key, checked === true)}
              />
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
