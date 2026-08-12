import type { Idea, Student } from "./types";

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
