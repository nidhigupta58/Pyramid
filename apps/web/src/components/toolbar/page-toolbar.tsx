import type { ReactNode } from "react";
import { ListFilter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "./search-box";

export function PageToolbar({
  title,
  addLabel,
  fieldsMenu,
}: {
  title: string;
  addLabel: string;
  fieldsMenu: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        <SearchBox />
        {fieldsMenu}
        <Button variant="outline" size="icon" aria-label="Filter">
          <ListFilter className="size-3.5" />
        </Button>
        <Button size="sm" className="gap-1 text-xs">
          <Plus className="size-3.5" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
