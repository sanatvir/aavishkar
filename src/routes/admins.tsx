import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/** Common typo: /admins → /admin (subpaths handled by admins/$.tsx) */
export const Route = createFileRoute("/admins")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admins" || location.pathname === "/admins/") {
      throw redirect({ to: "/admin" });
    }
  },
  component: () => <Outlet />,
});
