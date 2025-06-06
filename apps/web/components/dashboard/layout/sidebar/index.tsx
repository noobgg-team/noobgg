"use client";
import * as React from "react";
import {
  AudioWaveform,
  Bell,
  Building2,
  Command,
  GalleryVerticalEnd,
  Gamepad2,
  Globe, // Added Globe icon
  Home,
  MessageSquare,
  Monitor,
  Settings,
  Users,
} from "lucide-react";
import { NavMain } from "./nav-main";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      items: [],
    },
    {
      title: "Lobbies",
      url: "/dashboard/lobbies",
      icon: MessageSquare,
      items: [],
    },
    {
      title: "Games",
      url: "/dashboard/games",
      icon: Gamepad2,
      items: [],
    },
    {
      title: "Platforms",
      url: "/dashboard/platforms",
      icon: Monitor,
      items: [],
    },
    {
      title: "Distributors",
      url: "/dashboard/distributors",
      icon: Building2,
      items: [],
    },
    {
      title: "Languages",
      url: "/dashboard/languages",
      icon: Globe,
      // Assuming pathname is available in the scope where NavMain renders these items
      // or NavMain itself handles isActive based on current path and item.url
      // For now, I'll add a placeholder comment for isActive,
      // as its direct implementation depends on how NavMain consumes this.
      // isActive: pathname.startsWith("/dashboard/languages"),
      items: [],
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
      items: [],
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: Bell,
      items: [],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      items: [
        {
          title: "Sub Item Test",
          url: "#",
        },
      ],
    },
  ],
};
export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // The `isActive` property for nav items is handled by the NavMain component itself,
  // likely by comparing the item's URL with the current pathname.
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
