import type { Student } from "./types";

export type OnboardingMcqStep = {
  kind: "mcq";
  id: string;
  question: string;
  options: string[];
  multiple?: boolean;
  minSelections?: number;
};

export type OnboardingTextStep = {
  kind: "text";
  id: string;
  question: string;
  placeholder?: string;
  multiline?: boolean;
};

export type OnboardingStep = OnboardingMcqStep | OnboardingTextStep;

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    kind: "text",
    id: "name",
    question: "What's your full name?",
    placeholder: "e.g. Shaurya Sharma",
  },
  {
    kind: "mcq",
    id: "className",
    question: "Which class are you in?",
    options: ["Class IX", "Class IX-B", "Class X", "Class X-B", "Class XI", "Class XII"],
  },
  {
    kind: "mcq",
    id: "atlFocus",
    question: "What excites you most at ATL?",
    options: [
      "Building apps & websites",
      "Robotics & hardware",
      "AI & machine learning",
      "Design, posters & media",
      "Science experiments",
      "Entrepreneurship & products",
    ],
  },
  {
    kind: "mcq",
    id: "skills",
    question: "Pick skills you have or want to grow (choose at least 2)",
    options: [
      "Python",
      "Web development",
      "Robotics",
      "Arduino / electronics",
      "CAD & 3D printing",
      "UI/UX design",
      "Video & content",
      "Public speaking",
      "Research & writing",
      "Data & spreadsheets",
    ],
    multiple: true,
    minSelections: 2,
  },
  {
    kind: "mcq",
    id: "projectGoals",
    question: "What do you want to work on through AAVISHKAR?",
    options: [
      "School competitions",
      "ATL exhibition projects",
      "Real-world problems",
      "Startup / product ideas",
      "Learning with friends",
      "Finding teammates",
    ],
    multiple: true,
    minSelections: 1,
  },
  {
    kind: "mcq",
    id: "prevAtlExperience",
    question: "Have you done ATL or project work before?",
    options: ["Yes", "No"],
  },
  {
    kind: "text",
    id: "prevAtlDescription",
    question: "Briefly describe your previous ATL/project experience",
    placeholder: "e.g. Built a line-following robot for the ATL expo last year",
    multiline: true,
  },
  {
    kind: "text",
    id: "reasonForJoining",
    question: "Reason for joining the ATL Club",
    placeholder: "e.g. I want to build real projects and find teammates who love making things",
    multiline: true,
  },
  {
    kind: "mcq",
    id: "availability",
    question: "How available are you for teams right now?",
    options: ["Available", "Open to teams", "Busy"],
  },
  {
    kind: "text",
    id: "bio",
    question: "In one or two sentences, what should people know about you?",
    placeholder: "Interests, what you're looking for, past projects…",
    multiline: true,
  },
  {
    kind: "mcq",
    id: "heardFrom",
    question: "How did you hear about AAVISHKAR?",
    options: ["ATL class", "A friend", "Poster / notice", "Teacher", "Online / social media"],
  },
];

export type OnboardingAnswers = Record<string, string | string[]>;

export type OnboardingSubmission = {
  name: string;
  className: string;
  bio: string;
  skills: string[];
  interests: string[];
  availability: Student["availability"];
  responses: OnboardingAnswers;
};

export function buildOnboardingSubmission(answers: OnboardingAnswers): OnboardingSubmission | null {
  const name = String(answers.name ?? "").trim();
  if (!name) return null;

  const className = String(answers.className ?? "").trim() || "Class —";
  const bio = String(answers.bio ?? "").trim();
  const skills = Array.isArray(answers.skills) ? answers.skills : [];
  const atlFocus = String(answers.atlFocus ?? "");
  const projectGoals = Array.isArray(answers.projectGoals) ? answers.projectGoals : [];
  const availabilityRaw = String(answers.availability ?? "Available");
  const availability = (
    ["Available", "Busy", "Open to teams"].includes(availabilityRaw) ? availabilityRaw : "Available"
  ) as Student["availability"];

  const interests = [atlFocus, ...projectGoals].filter(Boolean);

  return {
    name,
    className,
    bio,
    skills,
    interests,
    availability,
    responses: answers,
  };
}
