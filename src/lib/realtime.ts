import { isSupabaseConfigured, supabase } from "./supabase/client";

export function subscribeAppChanges(userId: string, onChange: () => void) {
  if (!isSupabaseConfigured) return () => {};

  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onChange, 400);
  };

  const channel = supabase
    .channel(`aavishkar-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `student_id=eq.${userId}` },
      schedule,
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "events" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "recruitments" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "opportunities" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, schedule)
    .subscribe();

  return () => {
    if (timer) clearTimeout(timer);
    void supabase.removeChannel(channel);
  };
}
