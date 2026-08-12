import { createFileRoute } from "@tanstack/react-router";
import { StudentProfile } from "@/components/StudentProfile";
import { PageHeader } from "@/components/ui-kit/primitives";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — AAVISHKAR" },
      { name: "description", content: "Your AAVISHKAR profile: skills, interests, projects and achievements." },
      { property: "og:title", content: "Your Profile — AAVISHKAR" },
      { property: "og:description", content: "Skills, interests, projects and achievements." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser } = useAppState();
  return (
    <>
      <PageHeader title="Your Profile" subtitle="This is how other APSDK students see you." />
      <StudentProfile student={currentUser} />
    </>
  );
}
