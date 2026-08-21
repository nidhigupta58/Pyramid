"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Palette, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Profile", segment: "profile", icon: UserRound },
  { label: "Theme", segment: "theme", icon: Palette },
  { label: "Color", segment: "color", icon: null },
] as const;

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-sidebar p-3 md:h-full md:w-[212px] md:border-r md:border-b-0">
      <Link
        href="/"
        className="flex items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to app
      </Link>

      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search"
          className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <nav className="flex gap-0.5 md:flex-col">
        {NAV_ITEMS.map(({ label, segment, icon: Icon }) => {
          const href = `/settings/${segment}`;
          const isActive = pathname === href;
          return (
            <Link
              key={segment}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/10",
                isActive && "bg-sidebar-accent/10 font-medium",
              )}
            >
              {Icon ? <Icon className="size-4" /> : <span className="size-4 shrink-0 rounded-[3px] bg-foreground" />}
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
