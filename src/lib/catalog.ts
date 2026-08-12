import type { Community, Idea, Student } from "./types";

export function communitiesForStudent(
  studentId: string,
  communityMembers: Record<string, string[]>,
  communities: Community[],
): Community[] {
  return communities.filter((c) => (communityMembers[c.id] ?? []).includes(studentId));
}

/** Keep community.member counts aligned with the live member roster (not stale seed totals). */
export function communitiesWithLiveMemberCounts(
  communities: Community[],
  communityMembers: Record<string, string[]>,
): Community[] {
  return communities.map((c) => ({
    ...c,
    members: (communityMembers[c.id] ?? []).length,
  }));
}

export function deriveSkills(students: Student[], fallback: string[] = []): string[] {
  const fromDb = Array.from(new Set(students.flatMap((s) => s.skills))).sort();
  return fromDb.length ? fromDb : fallback;
}

export function deriveInterests(students: Student[], fallback: string[] = []): string[] {
  const fromDb = Array.from(new Set(students.flatMap((s) => s.interests))).sort();
  return fromDb.length ? fromDb : fallback;
}

export function deriveClasses(students: Student[], fallback: string[] = []): string[] {
  const fromDb = Array.from(
    new Set(
      students.map((s) => {
        const m = s.className.match(/Class (IX|X|XI|XII)/);
        return m ? `Class ${m[1]}` : s.className;
      }),
    ),
  ).sort();
  return fromDb.length ? fromDb : fallback;
}

export function deriveIdeaCategories(ideas: Idea[], fallback: string[] = []): string[] {
  const fromDb = Array.from(new Set(ideas.map((i) => i.category))).sort();
  return fromDb.length ? fromDb : fallback;
}

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
