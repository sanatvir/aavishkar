import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AavishkarLogo } from "@/components/brand/AavishkarLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import {
  ONBOARDING_STEPS,
  type OnboardingAnswers,
  type OnboardingStep,
  buildOnboardingSubmission,
} from "@/lib/onboarding-quiz";
import { getSessionPortal } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join AAVISHKAR — Student onboarding" },
      { name: "description", content: "Create your AAVISHKAR student profile in a few quick steps." },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const navigate = useNavigate();
  const { ready, needsOnboarding, completeOnboarding } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [submitting, setSubmitting] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  useEffect(() => {
    if (getSessionPortal() !== "student") {
      navigate({ to: "/" });
      return;
    }
    if (ready && !needsOnboarding) {
      navigate({ to: "/app" });
    }
  }, [ready, needsOnboarding, navigate]);

  const canContinue = useMemo(() => validateStep(step, answers), [step, answers]);

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const goNext = () => {
    if (!canContinue) return;
    if (stepIndex < ONBOARDING_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    const submission = buildOnboardingSubmission(answers);
    if (!submission) return;
    setSubmitting(true);
    completeOnboarding(submission);
    navigate({ to: "/app" });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Preparing your onboarding…
      </div>
    );
  }

  return (
    <div className="hero-mesh min-h-screen px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <AavishkarLogo size="sm" />
          <p className="text-xs text-muted-foreground">
            Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
          </p>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="surface page-enter space-y-6 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Welcome to AAVISHKAR</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Answer a few questions so teammates and coordinators can discover you.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{step.question}</h2>
            <div className="mt-4">
              <StepInput step={step} answers={answers} onChange={setAnswer} />
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Button
              variant="ghost"
              className="gap-2"
              disabled={stepIndex === 0 || submitting}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button className="gap-2" disabled={!canContinue || submitting} onClick={goNext}>
              {stepIndex === ONBOARDING_STEPS.length - 1 ? (
                <>
                  Join AAVISHKAR <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your answers create your public student profile on AAVISHKAR.
        </p>
      </div>
    </div>
  );
}

function StepInput({
  step,
  answers,
  onChange,
}: {
  step: OnboardingStep;
  answers: OnboardingAnswers;
  onChange: (id: string, value: string | string[]) => void;
}) {
  if (step.kind === "text") {
    const value = String(answers[step.id] ?? "");
    if (step.multiline) {
      return (
        <Textarea
          rows={4}
          value={value}
          placeholder={step.placeholder}
          onChange={(e) => onChange(step.id, e.target.value)}
          className="rounded-xl"
        />
      );
    }
    return (
      <Input
        value={value}
        placeholder={step.placeholder}
        onChange={(e) => onChange(step.id, e.target.value)}
        className="h-11 rounded-xl"
      />
    );
  }

  const selected = answers[step.id];
  const selectedList = Array.isArray(selected) ? selected : selected ? [selected] : [];

  return (
    <div className="grid gap-2">
      {step.options.map((option) => {
        const active = step.multiple ? selectedList.includes(option) : selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (step.multiple) {
                const next = active
                  ? selectedList.filter((o) => o !== option)
                  : [...selectedList, option];
                onChange(step.id, next);
              } else {
                onChange(step.id, option);
              }
            }}
            className={cn(
              "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
              active
                ? "border-primary bg-primary/10 font-medium text-foreground"
                : "border-border bg-background hover:bg-secondary/60",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function validateStep(step: OnboardingStep, answers: OnboardingAnswers): boolean {
  const value = answers[step.id];
  if (step.kind === "text") {
    return String(value ?? "").trim().length > 0;
  }
  if (step.multiple) {
    const list = Array.isArray(value) ? value : [];
    return list.length >= (step.minSelections ?? 1);
  }
  return typeof value === "string" && value.length > 0;
}
