import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import {
  Bot,
  CalendarDays,
  Compass,
  Flag,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  Trophy,
  UserSearch,
  Users,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { INSTITUTION_NAME } from "@/lib/brand";
import { useAppState } from "@/lib/app-state";
import { getSessionPortal } from "@/lib/session";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getSessionPortal() !== "admin") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { platformSettings } = useAppState();

  const nav: NavItem[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/talent", label: "Talent", icon: UserSearch },
    { to: "/admin/recruitment", label: "Recruitment", icon: Sparkles },
    { to: "/admin/ideas", label: "Idea review", icon: Lightbulb },
    { to: "/admin/projects", label: "Projects", icon: FolderKanban },
    { to: "/admin/communities", label: "Communities", icon: Compass },
    { to: "/admin/opportunities", label: "Opportunities", icon: Trophy },
    { to: "/admin/events", label: "Events", icon: CalendarDays },
    { to: "/admin/reports", label: "Reports", icon: Flag },
    { to: "/admin/assistant", label: "AI Assistant", icon: Bot },
  ];

  const footerNav: NavItem[] = [{ to: "/admin/settings", label: "Settings", icon: Settings }];

  return (
    <AppShell
      nav={nav}
      footerNav={footerNav}
      subtitle="ATL ADMIN"
      wide
      user={{
        name: platformSettings.coordinatorName,
        initials: platformSettings.coordinatorName
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "AC",
        meta: INSTITUTION_NAME,
        to: "/admin/settings",
        avatarUrl: platformSettings.coordinatorAvatarUrl,
      }}
    >
      <Outlet />
    </AppShell>
  );
}
