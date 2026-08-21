import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus } from "lucide-react";
import { CollapsibleGroup } from "@/components/collapsible-group";
import { StubAction } from "@/components/stub-action";

export interface GroupedTableColumn<T> {
  header: string;
  width?: string; // e.g. "7rem" — defaults to 7rem, Due Date columns pass 9rem (matches refs)
  render: (row: T) => ReactNode;
}

export interface GroupedTableGroup<T> {
  key: string;
  label: string;
  rows: T[];
}

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
  columns: GroupedTableColumn<T>[];
  addLabel: string;
  hrefFor: (row: T) => string;
}) {
  // Field toggles (P9) hide/show columns, so the grid can't be a fixed Tailwind class anymore.
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `minmax(0,1fr) ${columns.map((c) => c.width ?? "7rem").join(" ")} 5rem`,
  };

  return (
    <div className="flex flex-col gap-3.5">
      {groups.map((group) => (
        <CollapsibleGroup key={group.key} label={group.label}>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {/* Desktop: fixed grid, columns can be toggled via the Fields menu. */}
            <div
              style={gridStyle}
              className="hidden items-center border-b border-border-header bg-muted px-3.5 py-2 text-xs font-medium text-muted-foreground md:grid"
            >
              <div>{nameHeader}</div>
              {columns.map((col, i) => (
                <div key={`${col.header}-${i}`}>{col.header}</div>
              ))}
              <div className="text-right">Actions</div>
            </div>

            {group.rows.length === 0 ? (
              <p className="px-3.5 py-4 text-center text-xs text-muted-foreground-faint">No {nameHeader.toLowerCase()} yet</p>
            ) : (
              group.rows.map((row) => (
                <Link
                  key={row.id}
                  href={hrefFor(row)}
                  style={gridStyle}
                  className="hidden items-center border-b border-border-row px-3.5 py-2.5 text-sm text-foreground last:border-b-0 hover:bg-muted/60 md:grid"
                >
                  <div className="min-w-0 truncate font-medium">{nameRender(row)}</div>
                  {columns.map((col, i) => (
                    <div key={`${col.header}-${i}`}>{col.render(row)}</div>
                  ))}
                  <div className="text-right text-muted-foreground-placeholder" aria-hidden="true">
                    <MoreHorizontal className="ml-auto size-4" />
                  </div>
                </Link>
              ))
            )}

            {/* Mobile: one stacked card per row instead of a fixed-width grid. */}
            {group.rows.map((row) => (
              <Link
                key={row.id}
                href={hrefFor(row)}
                className="flex flex-col gap-1.5 border-b border-border-row px-3.5 py-3 text-sm text-foreground last:border-b-0 hover:bg-muted/60 md:hidden"
              >
                <div className="truncate font-medium">{nameRender(row)}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {columns.map((col, i) => (
                    <div key={`${col.header}-${i}`} className="flex items-center gap-1">
                      <span className="text-muted-foreground-faint">{col.header}:</span>
                      {col.render(row)}
                    </div>
                  ))}
                </div>
              </Link>
            ))}

            <StubAction
              label={addLabel}
              icon={<Plus className="size-3" />}
              className="w-full px-3.5 py-2 text-left text-xs text-muted-foreground-faint hover:text-foreground"
            >
              {addLabel}
            </StubAction>
          </div>
        </CollapsibleGroup>
      ))}
    </div>
  );
}
