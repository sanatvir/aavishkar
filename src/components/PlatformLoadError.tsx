import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlatformLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div className="max-w-md space-y-3">
        <h1 className="text-xl font-semibold">Could not load platform data</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </div>
  );
}
