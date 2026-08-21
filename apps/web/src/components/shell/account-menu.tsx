"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAccent } from "@/components/providers/accent-provider";
import { ACCENT_SWATCH, ACCENTS } from "@/lib/accent";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
}

export function AccountMenu({
  user,
  workspaces,
  activeSlug,
  trigger,
}: {
  user: { fullName: string | null; email: string };
  workspaces: WorkspaceSummary[];
  activeSlug: string;
  trigger: ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const otherWorkspaces = workspaces.filter((w) => w.slug !== activeSlug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="flex items-center gap-3 p-2">
          <UserAvatar className="size-9" />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user.fullName ?? "Guest"}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />

        {otherWorkspaces.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Switch workspace</DropdownMenuLabel>
            {otherWorkspaces.map((w) => (
              <DropdownMenuItem key={w.id} asChild>
                <Link href={`/w/${w.slug}/tasks`}>{w.name}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={() => setTheme("light")}>
                <Sun className="size-4" />
                Light
                {theme === "light" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("dark")}>
                <Moon className="size-4" />
                Dark
                {theme === "dark" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span
              className="size-3.5 rounded-full border border-border"
              style={{ background: ACCENT_SWATCH[accent] ?? "transparent" }}
            />
            Color Mode
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {ACCENTS.map((a) => (
                <DropdownMenuItem key={a} onSelect={() => setAccent(a)} className="capitalize">
                  <span
                    className="size-3.5 rounded-full border border-border"
                    style={{ background: ACCENT_SWATCH[a] ?? "transparent" }}
                  />
                  {a}
                  {accent === a && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
