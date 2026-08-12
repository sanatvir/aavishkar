import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/messages")({
  validateSearch: (search: Record<string, unknown>) => ({
    with: typeof search.with === "string" ? search.with : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages — AAVISHKAR" },
      { name: "description", content: "Talk to collaborators, teammates and idea creators at APSDK." },
      { property: "og:title", content: "Messages — AAVISHKAR" },
      { property: "og:description", content: "Direct messages between APSDK students." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { with: withStudentId } = Route.useSearch();
  const { conversations, sendMessage, markConversationRead, findStudent } = useAppState();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [text, setText] = useState("");

  useEffect(() => {
    if (!withStudentId) return;
    const match = conversations.find((c) => c.withId === withStudentId);
    if (match) {
      setActiveId(match.id);
      markConversationRead(match.id);
    }
  }, [withStudentId, conversations, markConversationRead]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const partner = active ? findStudent(active.withId) : undefined;

  return (
    <div className="surface grid h-[calc(100vh-9rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-1">
      <aside className="min-h-0 overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
        <div className="p-4">
          <h1 className="font-semibold">Messages</h1>
        </div>
        <ul>
          {conversations.map((c) => {
            const s = findStudent(c.withId);
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setActiveId(c.id);
                    markConversationRead(c.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                    c.id === active?.id && "bg-secondary",
                  )}
                >
                  <Avatar initials={s?.initials ?? "?"} accent={s?.accent} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{last?.text}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[0.65rem] font-bold text-accent-foreground">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-5 py-3.5">
          <Avatar initials={partner?.initials ?? "?"} accent={partner?.accent} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{partner?.name}</p>
            <p className="text-xs text-muted-foreground">{partner?.className}</p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {active?.messages.map((m, i) => (
            <div key={`${m.time}-${m.text}-${i}`} className={cn("flex", m.fromMe ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  m.fromMe ? "bg-primary text-primary-foreground" : "bg-secondary",
                )}
              >
                {m.text}
                <span
                  className={cn(
                    "mt-1 block text-[0.65rem]",
                    m.fromMe ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <form
          className="flex gap-2 border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim() || !active) return;
            sendMessage(active.id, text.trim());
            setText("");
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            className="h-11"
          />
          <Button type="submit" size="icon" className="h-11 w-11" disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </div>
  );
}
