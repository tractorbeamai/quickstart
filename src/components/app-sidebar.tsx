import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GalleryVerticalEndIcon, LayoutGridIcon, UserIcon } from "lucide-react";

// Sidebar sections, also used for the breadcrumb in src/routes/_app.tsx.
export const navMain = [
  {
    title: "Examples",
    icon: <LayoutGridIcon />,
    isActive: true,
    items: [
      { title: "Posts", url: "/example/posts" },
      { title: "Form", url: "/example/form" },
      { title: "Chat", url: "/example/chat" },
      { title: "REST API", url: "/example/rest-api" },
    ],
  },
  {
    title: "Account",
    icon: <UserIcon />,
    isActive: true,
    items: [{ title: "Profile", url: "/example/account" }],
  },
] as const;

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Quickstart</span>
                <span className="truncate text-xs">Tractorbeam</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
