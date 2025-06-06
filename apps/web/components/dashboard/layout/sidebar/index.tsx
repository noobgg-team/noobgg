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
  // The `pathname` variable would typically come from `usePathname()` from `next/navigation`
  // if isActive logic needs to be computed here.
  // However, NavMain likely handles this internally.
  // For the purpose of this modification, we only add the item to data.navMain.
  // If NavMain requires `isActive` to be pre-calculated, this structure might need adjustment
  // or `NavMain` needs to be adapted. The current structure of other items in `data.navMain`
  // does not include an `isActive` property, suggesting `NavMain` handles it.

  const modifiedNavMain = data.navMain.map(item => ({
    ...item,
    // Example: if pathname was available and NavMain expected isActive
    // isActive: pathname.startsWith(item.url)
  }));

  // The new item for Languages does not have isActive defined here,
  // assuming NavMain handles it by comparing item.url with current pathname.
  // If NavMain itself doesn't handle it, the `isActive` property would need to be
  // dynamically added, potentially by making `data.navMain` a function that takes `pathname`.

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Pass the navMain array directly; NavMain should handle active states */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
