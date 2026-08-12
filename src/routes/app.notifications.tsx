import { createFileRoute } from "@tanstack/react-router";
import { Bell, FolderKanban, Megaphone, Trophy, UserPlus, X } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AAVISHKAR" },
      { name: "description", content: "Connection requests, project invites, recruitment and deadlines." },
      { property: "og:title", content: "Notifications — AAVISHKAR" },
      { property: "og:description", content: "Everything that needs your attention on AAVISHKAR." },
    ],
  }),
  component: NotificationsPage,
});

const icons = {
  connection: UserPlus,
  project: FolderKanban,
  recruitment: Bell,
  opportunity: Trophy,
  community: Megaphone,
};

function NotificationsPage() {
  const { notifications, markAllRead, dismissNotification, unreadCount } = useAppState();

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread` : "You're all caught up."}
        action={
          <Button variant="outline" onClick={markAllRead} disabled={!unreadCount}>
            Mark all read
          </Button>
        }
      />
      <div className="surface divide-y divide-border">
        {notifications.map((n) => {
          const Icon = icons[n.kind];
          return (
            <div
              key={n.id}
              className={cn("flex items-start gap-4 px-5 py-4", !n.read && "bg-accent/[0.06]")}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", !n.read && "font-medium")}>{n.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
              </div>
              <button
                onClick={() => dismissNotification(n.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">Nothing left here.</p>
        )}
      </div>
    </>
  );
}
