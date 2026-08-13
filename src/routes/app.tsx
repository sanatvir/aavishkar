import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import {
  Bell,
  Compass,
  FolderKanban,
  Home,
  Lightbulb,
  MessageSquare,
  Settings,
  Trophy,
  User,
  Users,
  Sparkles,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { useAppState } from "@/lib/app-state";
import { hasStudentSession } from "@/lib/session";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !hasStudentSession()) {
      throw redirect({ to: "/" });
    }
  },
  component: StudentLayout,
});

function StudentLayout() {
  const { unreadCount, conversations, currentUser } = useAppState();
  const unreadMessages = conversations.reduce((n, c) => n + c.unread, 0);

  const nav: NavItem[] = [
    { to: "/app", label: "Home", icon: Home, exact: true },
    { to: "/app/people", label: "People", icon: Users },
    { to: "/app/ideas", label: "Ideas", icon: Lightbulb },
    { to: "/app/projects", label: "Projects", icon: FolderKanban },
    { to: "/app/communities", label: "Communities", icon: Compass },
    { to: "/app/opportunities", label: "Opportunities", icon: Trophy },
    { to: "/app/recruitment", label: "Recruitment", icon: Sparkles },
    { to: "/app/messages", label: "Messages", icon: MessageSquare, badge: unreadMessages },
    { to: "/app/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
  ];

  const footerNav: NavItem[] = [
    { to: "/app/profile", label: "Profile", icon: User },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ];

  return (
    <AppShell
      nav={nav}
      footerNav={footerNav}
      subtitle="ATL • APSDK"
      user={{
        name: currentUser.name,
        initials: currentUser.initials,
        meta: currentUser.className,
        to: "/app/profile",
        avatarUrl: currentUser.avatarUrl,
      }}
    >
      <Outlet />
    </AppShell>
  );
}
