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
  splitInlineMarkdown,
  storeMessages,
  type AssistantMessage,
} from "@/lib/admin-assistant-context";
import { chatWithAdminAssistantSafe } from "@/lib/admin-assistant";
import { useAppState } from "@/lib/app-state";
import { WELCOME_MESSAGE } from "@/lib/admin-assistant-voice";
import { cn } from "@/lib/utils";

const WELCOME: AssistantMessage = {
  role: "assistant",
  content: WELCOME_MESSAGE,
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

  const buildLiveContext = useCallback(
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
        communities: app.communities,
        communityMembers: app.communityMembers,
        communityJoinApplications: app.communityJoinApplications,
      }),
    [
      app.platformSettings.coordinatorName,
      app.adminStats,
      app.skillDistribution,
      app.activity,
      app.students,
      app.pendingIdeas,
      app.projects,
      app.recruitments,
      app.applications,
      app.reports,
      app.events,
      app.opportunities,
      app.communities,
      app.communityMembers,
      app.communityJoinApplications,
    ],
  );

  const context = useMemo(() => buildLiveContext(), [buildLiveContext]);

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
          .slice(-24)
          .map((m) => ({ role: m.role, content: m.content }));

        const liveContext = buildLiveContext();

        const result = await chatWithAdminAssistantSafe({
          data: { messages: payload, context: liveContext },
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
      } finally {
        setBusy(false);
        textareaRef.current?.focus();
      }
    },
    [busy, buildLiveContext, messages],
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
                        {msg.source === "openai" && <Chip tone="accent">OpenAI</Chip>}
                        {msg.source === "nvidia" && <Chip tone="accent">NVIDIA</Chip>}
                        {msg.errorKind === "rate_limit" && (
                          <Chip tone="warning">Rate limit</Chip>
                        )}
                        {msg.errorKind === "auth" && (
                          <Chip tone="danger">Invalid API key</Chip>
                        )}
                        {msg.errorKind === "network" && (
                          <Chip tone="warning">Unavailable</Chip>
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
              Live app data on every request · Groq → OpenAI → NVIDIA failover · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
