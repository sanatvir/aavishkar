import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

let queryClient: QueryClient | undefined;

export const getRouter = () => {
  queryClient ??= new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 60_000,
    defaultPendingMs: 150,
    defaultPendingMinMs: 300,
  });

  return router;
};
