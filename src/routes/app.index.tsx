import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Avatar, Chip, PageHeader, ProgressBar, SectionHeading } from "@/components/ui-kit/primitives";
import { IdeaCard, StudentCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { greetingForHour } from "@/lib/catalog";
import { recommendTeam } from "@/lib/recommendations";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Home — AAVISHKAR" },
      {
        name: "description",
        content: "Your AAVISHKAR dashboard: recommended people, active projects, ideas and events.",
      },
      { property: "og:title", content: "Home — AAVISHKAR" },
      { property: "og:description", content: "Your personalised APSDK innovation dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { connections, projects, ideas, joinedCommunities, students, communities, opportunities, currentUser, events } =
    useAppState();

  const recommended = useMemo(() => {
    const picks = recommendTeam(
      [...currentUser.skills, ...currentUser.interests].join(" "),
      students,
      currentUser.id,
    );
    return picks
      .map((p) => students.find((s) => s.id === p.studentId))
      .filter(Boolean)
      .slice(0, 3) as typeof students;
  }, [students, currentUser]);

  const stats = [
    { label: "Connections", value: connections.length },
    { label: "Active Projects", value: projects.filter((p) => p.mine && p.status === "Active").length },
    { label: "Ideas", value: ideas.length },
    { label: "Communities", value: joinedCommunities.length },
  ];

  const trending = [...ideas].sort((a, b) => b.supports - a.supports).slice(0, 2);
  const myProjects = projects.filter((p) => p.mine);
  const myCommunities = communities.filter((c) => joinedCommunities.includes(c.id));

  return (
    <>
      <PageHeader
        title={`${greetingForHour()}, ${currentUser.name.split(" ")[0]}.`}
        subtitle="Discover. Collaborate. Create."
        action={
          <Button asChild className="gap-2">
            <Link to="/app/ideas">
              <Sparkles className="h-4 w-4" />
              Share an idea
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface lift p-5">
            <p className="text-3xl font-bold tracking-tight">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <SectionHeading
          title="Continue Building"
          subtitle="Your active projects"
          action={
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/app/projects">
                All projects <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {myProjects.map((p) => (
            <Link key={p.id} to="/app/projects/$id" params={{ id: p.id }} className="surface lift p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{p.title}</h3>
                <Chip tone={p.status === "Active" ? "success" : "neutral"}>{p.status}</Chip>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{p.memberIds.length} members</span>
                <span className="font-semibold">{p.progress}%</span>
              </div>
              <ProgressBar value={p.progress} className="mt-2" />
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Deadline {p.deadline}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Recommended People"
          subtitle="Students whose skills and interests match yours"
          action={
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/app/people">
                Discover <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommended.map((s) => (
            <StudentCard key={s.id} student={s} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading title="Trending Ideas" subtitle="What the school is excited about" />
        <div className="grid gap-4 lg:grid-cols-2">
          {trending.map((i) => (
            <IdeaCard key={i.id} idea={i} />
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <SectionHeading title="Upcoming Opportunities" subtitle="Competitions, workshops and ATL events" />
          <div className="space-y-3">
            {opportunities.slice(0, 3).map((o) => (
              <Link
                key={o.id}
                to="/app/opportunities"
                className="surface lift flex items-center gap-4 p-4"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                  {o.deadline.split(" ")[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{o.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.type} · Deadline {o.deadline}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Your Communities" subtitle="Recently active" />
          <div className="space-y-3">
            {myCommunities.map((c) => (
              <Link key={c.id} to="/app/communities/$id" params={{ id: c.id }} className="surface lift flex items-center gap-4 p-4">
                <Avatar initials={c.name.slice(0, 2).toUpperCase()} accent={c.accent} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.activity[0]}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{c.members}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
