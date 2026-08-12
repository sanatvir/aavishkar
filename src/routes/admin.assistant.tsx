import { createFileRoute } from "@tanstack/react-router";
import { AdminAssistantChat } from "@/components/AdminAssistantChat";
import { PageHeader } from "@/components/ui-kit/primitives";

export const Route = createFileRoute("/admin/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — AAVISHKAR Admin" },
      {
        name: "description",
        content: "AI copilot for ATL coordinators — team matching, platform insights, and drafts.",
      },
      { property: "og:title", content: "AI Assistant — AAVISHKAR Admin" },
      {
        property: "og:description",
        content: "Manage students, projects, and recruitment with an AI assistant grounded in live platform data.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Assistant"
        subtitle="Your ATL copilot — team matching, platform insights, recruitment drafts, and coordinator workflows."
      />
      <AdminAssistantChat />
    </>
  );
}
