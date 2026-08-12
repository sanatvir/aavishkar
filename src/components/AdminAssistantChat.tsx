import {
  Bot,
  Copy,
  Loader2,
  SendHorizontal,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, Chip } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  buildPlatformContext,
  clearStoredMessages,
  loadStoredMessages,
  parseAssistantMarkdown,
  QUICK_PROMPTS,
  splitInlineMarkdown,
  storeMessages,
  type AssistantMessage,
} from "@/lib/admin-assistant-context";
import { chatWithAdminAssistant } from "@/lib/admin-assistant";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const WELCOME: AssistantMessage = {
  role: "assistant",
  content:
    "Hello! I'm your **AAVISHKAR admin assistant** — chat with me like any AI helper.\n\nAsk about students, projects, recruitment, or say **hello** to get started. I use your live platform data when you need it.",
};

function InlineText({ text }: { text: string }) {
  const parts = splitInlineMarkdown(text);
  return (
    <>
      {parts.map((part, i) => {
        if (part.bold) return <strong key={i}>{part.text}</strong>;
        if (part.code) {
          return (
            <code key={i} className="rounded bg-secondary px-1 py-0.5 text-[0.85em]">
              {part.text}
            </code>
          );
        }
        return <span key={i}>{part.text}</span>;
      })}
    </>
  );
}

function AssistantContent({ content }: { content: string }) {
  const lines = parseAssistantMarkdown(content);
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line) => {
        if (line.type === "break") return <div key={line.key} className="h-1" />;
        if (line.type === "bullet") {
          return (
            <div key={line.key} className="flex gap-2 pl-1">
              <span className="text-accent">•</span>
              <span>
                <InlineText text={line.text} />
              </span>
            </div>
          );
        }
        if (line.type === "numbered") {
          return (
            <p key={line.key}>
              <InlineText text={line.text} />
            </p>
          );
        }
        return (
          <p key={line.key}>
            <InlineText text={line.text} />
          </p>
        );
      })}
    </div>
  );
}

export function AdminAssistantChat() {
  const app = useAppState();
  const [messages, setMessages] = useState<AssistantMessage[]>(() => {
    const stored = loadStoredMessages();
    return stored.length ? stored : [WELCOME];
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const context = useMemo(
    () =>
      buildPlatformContext({
        coordinatorName: app.platformSettings.coordinatorName,
        adminStats: app.adminStats,
        skillDistribution: app.skillDistribution,
        activity: app.activity,
        students: app.students,
        pendingIdeas: app.pendingIdeas,
        projects: app.projects,
        recruitments: app.recruitments,
        applications: app.applications,
        reports: app.reports,
        events: app.events,
        opportunities: app.opportunities,
      }),
    [app],
  );

  useEffect(() => {
    storeMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      const userMsg: AssistantMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setBusy(true);

      try {
        const payload = nextMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));

        const result = await chatWithAdminAssistant({
          data: { messages: payload, context },
        });

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.reply,
            teamRecommendations: result.teamRecommendations,
            suggestedFollowUps: result.suggestedFollowUps,
            source: result.source,
            errorKind: result.errorKind,
          },
        ]);
      } catch {
        toast.error("Assistant request failed. Check your connection and try again.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry — I couldn't reach the server. Confirm `GROQ_API_KEY` is set and redeploy if you're on Vercel.",
            source: "offline",
          },
        ]);
      } finally {
        setBusy(false);
        textareaRef.current?.focus();
      }
    },
    [busy, context, messages],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const resetChat = () => {
    clearStoredMessages();
    setMessages([WELCOME]);
    setInput("");
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:min-h-[calc(100vh-6rem)]">
      <div className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">Admin AI Assistant</p>
            <p className="text-xs text-muted-foreground">
              Live context: {context.students.filter((s) => s.status === "Active").length} students ·{" "}
              {context.projects.length} projects · {context.pendingIdeas.length} ideas pending
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={resetChat} disabled={busy}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        </div>
      </div>

      <div className="surface flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1 px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const recs = msg.teamRecommendations ?? [];
              const resolvedRecs = recs
                .map((r) => ({ ...r, student: app.findStudent(r.studentId) }))
                .filter((r) => r.student);

              return (
                <div
                  key={idx}
                  className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
                >
                  <div
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                      isUser ? "bg-secondary text-foreground" : "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                    )}
                  >
                    {isUser ? <UserRound className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>

                  <div className={cn("min-w-0 max-w-[85%] space-y-2", isUser && "text-right")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-left",
                        isUser
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "border border-border/80 bg-card/80",
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      ) : (
                        <AssistantContent content={msg.content} />
                      )}
                    </div>

                    {!isUser && (
                      <div className="flex flex-wrap items-center gap-2">
                        {msg.source === "groq" && <Chip tone="accent">Groq</Chip>}
                        {msg.source === "offline" && msg.errorKind === "rate_limit" && (
                          <Chip tone="warning">Rate limit</Chip>
                        )}
                        {msg.source === "offline" && msg.errorKind === "auth" && (
                          <Chip tone="danger">Invalid API key</Chip>
                        )}
                        {msg.source === "offline" && !msg.errorKind && (
                          <Chip className="text-muted-foreground">Offline fallback</Chip>
                        )}
                        {msg.source === "offline" && msg.errorKind && msg.errorKind !== "quota" && msg.errorKind !== "auth" && (
                          <Chip className="text-muted-foreground">Offline fallback</Chip>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                          onClick={() => void copyMessage(msg.content)}
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    )}

                    {resolvedRecs.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {resolvedRecs.map((r) => {
                          const s = r.student!;
                          return (
                            <div key={r.studentId} className="surface flex items-start gap-3 p-3">
                              <Avatar initials={s.initials} accent={s.accent} size="sm" />
                              <div className="min-w-0 flex-1 text-left">
                                <p className="text-sm font-semibold">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.skills.slice(0, 4).join(" · ")}</p>
                                <p className="mt-1.5 text-xs text-primary">{r.reason}</p>
                              </div>
                              <Chip>{s.className}</Chip>
                            </div>
                          );
                        })}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => app.shortlistMany(recs.map((r) => r.studentId))}
                        >
                          Shortlist recommended students
                        </Button>
                      </div>
                    )}

                    {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.suggestedFollowUps.map((followUp) => (
                          <button
                            key={followUp}
                            type="button"
                            disabled={busy}
                            onClick={() => void send(followUp)}
                            className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-left text-xs transition hover:bg-secondary disabled:opacity-50"
                          >
                            {followUp}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                Analyzing platform data…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border/80 bg-card/40 p-4 sm:p-5">
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(prompt)}
                  className="rounded-full border border-border/80 bg-background px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about students, projects, recruitment, drafts… (Enter to send)"
                disabled={busy}
                maxLength={2000}
                className="min-h-[52px] resize-none bg-background text-sm"
              />
              <Button
                className="h-auto shrink-0 px-4"
                onClick={() => void send(input)}
                disabled={busy || !input.trim()}
                aria-label="Send message"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-center text-[0.65rem] text-muted-foreground">
              Uses live roster and dashboard data · Set <code className="text-[0.65rem]">GROQ_API_KEY</code> on the
              server · Model: <code className="text-[0.65rem]">llama-3.1-8b-instant</code> · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
