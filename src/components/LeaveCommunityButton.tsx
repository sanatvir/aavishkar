import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import type { ComponentProps, ReactNode } from "react";

type LeaveCommunityButtonProps = {
  communityId: string;
  communityName: string;
  children: ReactNode;
} & Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

export function LeaveCommunityButton({
  communityId,
  communityName,
  children,
  variant = "secondary",
  size,
  className,
}: LeaveCommunityButtonProps) {
  const { leaveCommunity } = useAppState();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave {communityName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave this community? You won&apos;t see its feed updates in your list until you
            apply and are accepted again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => leaveCommunity(communityId, communityName)}>
            Leave community
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
