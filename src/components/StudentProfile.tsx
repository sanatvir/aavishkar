import { Link } from "@tanstack/react-router";
import { Award, Compass, MessageSquare, Rocket } from "lucide-react";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { Avatar, Chip } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { communitiesForStudent } from "@/lib/catalog";
import { type Student } from "@/lib/mock-data";
import { toast } from "sonner";

export function StudentProfile({ student, embedded }: { student: Student; embedded?: boolean | undefined }) {
  const { isConnected, toggleConnection, currentUser, updateProfilePicture, communities, communityMembers } =
    useAppState();
  const isMe = student.id === currentUser.id;
  const connected = isConnected(student.id);
  const memberOf = communitiesForStudent(student.id, communityMembers, communities);

  return (
    <div className="space-y-6">
      <div className="surface overflow-hidden">
        <div className="hero-mesh h-28 border-b border-border" />
        <div className="-mt-12 px-6 pb-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 sm:flex sm:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              {isMe ? (
                <ProfilePictureUpload
                  initials={student.initials}
                  accent={student.accent}
                  avatarUrl={student.avatarUrl}
                  onUpload={async (file) => {
                    try {
                      await updateProfilePicture(file);
                    } catch {
                      toast.error("Image must be 500 KB or smaller");
                    }
                  }}
                />
              ) : (
                <Avatar
                  initials={student.initials}
                  accent={student.accent}
                  size="xl"
                  src={student.avatarUrl}
                />
              )}
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-bold">{student.name}</h1>
                <p className="text-sm text-muted-foreground">{student.className}</p>
              </div>
            </div>
            {!isMe && !embedded && (
              <div className="col-span-2 flex gap-2 pt-2">
                <Button
                  variant={connected ? "secondary" : "default"}
                  onClick={() => toggleConnection(student.id)}
                >
                  {connected ? "Connected" : "Connect"}
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/app/messages">
                    <MessageSquare className="h-4 w-4" /> Message
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/80">{student.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone={student.availability === "Available" ? "success" : "neutral"}>
              {student.availability}
            </Chip>
            <Chip>{student.projects.length} projects</Chip>
            <Chip>{student.achievements.length} achievements</Chip>
          </div>
        </div>
      </div>

      <div className={embedded ? "space-y-6" : "grid gap-6 lg:grid-cols-2"}>
        <div className="surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {student.skills.map((s) => (
              <Chip key={s} tone="accent">
                {s}
              </Chip>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Interests
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {student.interests.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Projects</h2>
          <ul className="mt-3 space-y-2">
            {student.projects.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm">
                <Rocket className="h-4 w-4 shrink-0 text-accent" />
                {p}
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Achievements
          </h2>
          <ul className="mt-3 space-y-2">
            {student.achievements.map((a) => (
              <li key={a} className="flex items-center gap-2.5 text-sm">
                <Award className="h-4 w-4 shrink-0 text-warning" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {memberOf.length > 0 && (
        <div className="surface p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Compass className="h-4 w-4" /> Communities
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {memberOf.map((c) => (
              <Button key={c.id} asChild variant="outline" size="sm">
                <Link to="/app/communities/$id" params={{ id: c.id }}>
                  {c.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
