import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

/** Panel-toggle icon + an optional route-specific breadcrumb (ref 12: "Projects › Design Homepage"). */
export function TopBar({ breadcrumb }: { breadcrumb?: ReactNode }) {
  return (
    <div className="flex h-11 items-center gap-2 px-4">
      <SidebarTrigger />
      {breadcrumb && (
        <>
          <div className="h-4 w-px bg-border" />
          {breadcrumb}
        </>
      )}
    </div>
  );
}
