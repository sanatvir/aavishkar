import type { Student } from "./mock-data";

export type TeamRecommendation = { studentId: string; reason: string };

const SKILL_ALIASES: Record<string, string[]> = {
  ai: ["ai", "machine learning", "ml", "deep learning", "computer vision"],
  robotics: ["robotics", "robot", "arduino", "servo", "electronics"],
  coding: ["coding", "code", "python", "javascript", "web", "software"],
  design: ["design", "ui", "ux", "figma", "presentation"],
  research: ["research", "analysis", "data"],
  hardware: ["hardware", "cad", "3d", "printing", "electronics"],
};

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter(Boolean);
}

function scoreStudent(student: Student, promptTokens: string[]): { score: number; matched: string[] } {
  const haystack = [...student.skills, ...student.interests, student.bio, student.className]
    .join(" ")
    .toLowerCase();
  const matched = new Set<string>();

  for (const token of promptTokens) {
    if (haystack.includes(token)) matched.add(token);
    for (const [label, aliases] of Object.entries(SKILL_ALIASES)) {
      if (aliases.some((a) => token.includes(a) || a.includes(token))) {
        if (student.skills.some((s) => s.toLowerCase().includes(label) || aliases.some((a) => s.toLowerCase().includes(a)))) {
          matched.add(label);
        }
      }
    }
  }

  for (const skill of student.skills) {
    const s = skill.toLowerCase();
    if (promptTokens.some((t) => s.includes(t) || t.includes(s))) matched.add(skill);
  }

  const score = matched.size * 10 + (student.availability === "Available" ? 3 : 0);
  return { score, matched: [...matched] };
}

function reasonFor(student: Student, matched: string[], prompt: string): string {
  if (matched.length) {
    return `Strong match on ${matched.slice(0, 3).join(", ")} — ${student.skills.slice(0, 4).join(" · ")}.`;
  }
  const lower = prompt.toLowerCase();
  if (lower.includes("robot")) {
    return `Robotics profile with ${student.skills.join(" · ")}.`;
  }
  if (lower.includes("ai") || lower.includes("machine")) {
    return `AI-oriented skills: ${student.skills.join(" · ")}.`;
  }
  return `Active on platform — ${student.skills.slice(0, 3).join(" · ")}.`;
}

export function recommendTeam(prompt: string, students: Student[], excludeId?: string): TeamRecommendation[] {
  const promptTokens = tokens(prompt);
  const pool = students.filter((s) => s.id !== excludeId && s.status === "Active");

  return pool
    .map((student) => {
      const { score, matched } = scoreStudent(student, promptTokens);
      return { student, score, matched };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ student, matched }) => ({
      studentId: student.id,
      reason: reasonFor(student, matched, prompt),
    }));
}
