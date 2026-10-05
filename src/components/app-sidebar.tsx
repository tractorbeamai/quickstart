"use client";

import type { ComponentProps } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GalleryVerticalEndIcon, LayoutGridIcon, UserIcon } from "lucide-react";

const teams = [
  {
    name: "Quickstart",
    logo: <GalleryVerticalEndIcon />,
    plan: "Tractorbeam",
  },
];

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
        <TeamSwitcher teams={teams} />
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
