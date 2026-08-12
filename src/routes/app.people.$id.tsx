import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StudentProfile } from "@/components/StudentProfile";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/app/people/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — AAVISHKAR` },
      { name: "description", content: "Student profile on AAVISHKAR." },
    ],
  }),
  component: PersonPage,
});

function PersonPage() {
  const { id } = Route.useParams();
  const { findStudent } = useAppState();
  const student = findStudent(id);

  if (!student) {
    return (
      <div className="surface p-10 text-center">
        <p className="font-medium">That student profile isn&apos;t here.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/people">Back to People</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1.5">
        <Link to="/app/people">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to People
        </Link>
      </Button>
      <StudentProfile student={student} />
    </>
  );
}
