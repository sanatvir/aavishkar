import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { Avatar } from "@/components/ui-kit/primitives";
import { cn } from "@/lib/utils";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number | undefined;
  exact?: boolean | undefined;
};

export function AppShell({
  nav,
  footerNav,
  subtitle,
  user,
  children,
  wide,
}: {
  nav: NavItem[];
  footerNav: NavItem[];
  subtitle: string;
  user: { name: string; initials: string; meta: string; to: string; avatarUrl?: string | undefined };
  children: ReactNode;
  wide?: boolean | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const normalize = (path: string) => path.replace(/\/$/, "") || "/";

  const isActive = (item: NavItem) => {
    const current = normalize(pathname);
    const target = normalize(item.to);
    return item.exact
      ? current === target
      : current === target || current.startsWith(`${target}/`);
  };

  const renderItem = (item: NavItem) => (
    <Link
      key={item.to}
      to={item.to}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985]",
        isActive(item)
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
      )}
    >

      <item.icon className="h-4.5 w-4.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {!!item.badge && (
        <span
          className={cn(
            "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-semibold",
            isActive(item) ? "bg-primary-foreground/20" : "bg-accent/20 text-primary",
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <AavishkarLogo size="sm" subtitle={null} />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background"
        >
          {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 top-[57px] z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 z-40 flex w-[264px] flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          "top-[57px] h-[calc(100vh-57px)] lg:top-0 lg:h-screen",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="hidden px-1 lg:block">
          <AavishkarLogo subtitle={subtitle} />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">{nav.map(renderItem)}</nav>

        <div className="flex flex-col gap-1 border-t border-sidebar-border pt-4">
          {footerNav.map(renderItem)}
          <Link
            to={user.to}
            className="mt-2 flex items-center gap-3 rounded-xl border border-sidebar-border bg-card p-2.5 transition-colors hover:border-accent/40"
          >
            <Avatar initials={user.initials} size="sm" src={user.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.meta}</p>
            </div>
          </Link>
        </div>
      </aside>

      <main className="lg:pl-[264px]">
        <div
          key={pathname}
          className={cn("page-enter mx-auto px-4 py-8 sm:px-8 sm:py-10", wide ? "max-w-[1500px]" : "max-w-6xl")}
        >
          {children}
        </div>
      </main>

    </div>
  );
}
