"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, FolderKanban, LayoutGrid } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { AccountMenu } from "./account-menu";

interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
}

const NAV_ITEMS = [
  { label: "Tasks", segment: "tasks", icon: LayoutGrid },
  { label: "Projects", segment: "projects", icon: FolderKanban },
] as const;

export function AppSidebar({
  user,
  workspaces,
  activeWorkspace,
}: {
  user: { fullName: string | null; email: string };
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary;
}) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <AccountMenu
          user={user}
          workspaces={workspaces}
          activeSlug={activeWorkspace.slug}
          trigger={
            <button className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left hover:bg-sidebar-accent/10">
              <UserAvatar />
              <span className="flex-1 truncate text-sm font-medium text-sidebar-foreground">
                {activeWorkspace.name}
              </span>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            </button>
          }
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, segment, icon: Icon }) => {
                const href = `/w/${activeWorkspace.slug}/${segment}`;
                const isActive = pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={segment}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
