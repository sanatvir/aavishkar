import { createFileRoute, redirect } from "@tanstack/react-router";

/** /admins/students → /admin/students, etc. */
export const Route = createFileRoute("/admins/$")({
  beforeLoad: ({ location }) => {
    const rest = location.pathname.replace(/^\/admins\/?/, "");
    throw redirect({ href: rest ? `/admin/${rest}` : "/admin" });
  },
});
