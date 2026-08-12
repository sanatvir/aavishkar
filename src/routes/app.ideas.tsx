import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/ideas")({
  component: () => <Outlet />,
});
