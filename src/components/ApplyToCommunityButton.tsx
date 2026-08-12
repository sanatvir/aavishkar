import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { useState, type ComponentProps } from "react";

type ApplyToCommunityButtonProps = {
  communityId: string;
  communityName: string;
} & Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

export function ApplyToCommunityButton({
  communityId,
  communityName,
  variant = "default",
  size,
  className,
}: ApplyToCommunityButtonProps) {
  const { getCommunityJoinStatus, applyToCommunity } = useAppState();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const status = getCommunityJoinStatus(communityId);

  if (status === "member") return null;

  if (status === "pending") {
    return (
      <Button variant="secondary" size={size} className={className} disabled>
        Pending approval
      </Button>
    );
  }

  const label = status === "rejected" ? "Apply again" : "Apply to join";

  return (
    <>
      <Button
        variant={status === "rejected" ? "outline" : variant}
        size={size}
        className={className}
        onClick={() => {
          setNote("");
          setOpen(true);
        }}
      >
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to join {communityName}</DialogTitle>
            <DialogDescription>
              Tell the coordinator why you want to join. They&apos;ll review your request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Your interests, skills, what you hope to contribute..."
          />
          <DialogFooter>
            <Button
              disabled={!note.trim()}
              onClick={() => {
                if (applyToCommunity(communityId, note.trim())) {
                  setOpen(false);
                  setNote("");
                }
              }}
            >
              Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
