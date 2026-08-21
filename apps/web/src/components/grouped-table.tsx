import type { ReactNode } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus } from "lucide-react";
import { CollapsibleGroup } from "@/components/collapsible-group";
import { cn } from "@/lib/utils";

export interface GroupedTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export interface GroupedTableGroup<T> {
  key: string;
  label: string;
  rows: T[];
}

// Fixed 5-column shape from the refs (§8): a flexible name column, three 7/7/9rem data
// columns, and a 5rem actions column. Both Tasks and Projects reuse this exact grid.
const GRID_COLS = "grid-cols-[minmax(0,1fr)_7rem_7rem_9rem_5rem]";

// A plain (server-renderable) function, not a "use client" component: it just composes JSX
// from `render` callbacks supplied by the calling Server Component page, which is fine as
// long as GroupedTable itself never crosses the server/client boundary as a prop value.
// Only the collapse/expand toggle needs client state, isolated in CollapsibleGroup.
export function GroupedTable<T extends { id: string }>({
  groups,
  nameHeader,
  nameRender,
  columns,
  addLabel,
  hrefFor,
}: {
  groups: GroupedTableGroup<T>[];
  nameHeader: string;
  nameRender: (row: T) => ReactNode;
  columns: [GroupedTableColumn<T>, GroupedTableColumn<T>, GroupedTableColumn<T>];
  addLabel: string;
  hrefFor: (row: T) => string;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {groups.map((group) => (
        <CollapsibleGroup key={group.key} label={group.label}>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div
              className={cn(
                "grid items-center border-b border-border-header bg-muted px-3.5 py-2 text-xs font-medium text-muted-foreground",
                GRID_COLS,
              )}
            >
              <div>{nameHeader}</div>
              {columns.map((col) => (
                <div key={col.header}>{col.header}</div>
              ))}
              <div className="text-right">Actions</div>
            </div>

            {group.rows.map((row) => (
              <Link
                key={row.id}
                href={hrefFor(row)}
                className={cn(
                  "grid items-center border-b border-border-row px-3.5 py-2.5 text-sm text-foreground last:border-b-0 hover:bg-muted/60",
                  GRID_COLS,
                )}
              >
                <div className="min-w-0 truncate font-medium">{nameRender(row)}</div>
                {columns.map((col) => (
                  <div key={col.header}>{col.render(row)}</div>
                ))}
                <div className="text-right text-muted-foreground-placeholder">
                  <MoreHorizontal className="ml-auto size-4" />
                </div>
              </Link>
            ))}

            <div className="flex w-full items-center gap-1 px-3.5 py-2 text-left text-xs text-muted-foreground-faint">
              <Plus className="size-3" />
              {addLabel}
            </div>
          </div>
        </CollapsibleGroup>
      ))}
    </div>
  );
}
