import { Camera } from "lucide-react";
import { useRef } from "react";
import { Avatar } from "@/components/ui-kit/primitives";
import { cn } from "@/lib/utils";

export function ProfilePictureUpload({
  initials,
  accent,
  avatarUrl,
  onUpload,
  size = "xl",
  className,
}: {
  initials: string;
  accent?: string | undefined;
  avatarUrl?: string | undefined;
  onUpload: (file: File) => void | Promise<void>;
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  className?: string | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    await onUpload(file);
  };

  return (
    <div className={cn("group relative w-fit", className)}>
      <Avatar initials={initials} accent={accent} size={size} src={avatarUrl} />
      <button
        type="button"
        aria-label="Change profile picture"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 grid place-items-center rounded-full bg-foreground/45 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Camera className="h-5 w-5 text-primary-foreground" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]).finally(() => {
            e.target.value = "";
          });
        }}
      />
    </div>
  );
}
