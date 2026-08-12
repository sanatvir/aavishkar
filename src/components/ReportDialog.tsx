import { Flag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import type { NewReport } from "@/lib/types";

export function ReportDialog({
  target,
  defaultKind = "User",
}: {
  target: string;
  defaultKind?: NewReport["kind"];
}) {
  const { submitReport } = useAppState();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<NewReport["kind"]>(defaultKind);
  const [reason, setReason] = useState("");

  return (
    <>
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setOpen(true)}>
        <Flag className="h-3.5 w-3.5" /> Report
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report content</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">{target}</p>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as NewReport["kind"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["User", "Comment", "Idea"] as const).map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What is the issue?"
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (!reason.trim()) return;
                submitReport({ target, kind, reason: reason.trim() });
                setOpen(false);
                setReason("");
              }}
            >
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
