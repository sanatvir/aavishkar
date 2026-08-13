import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { PageHeader } from "@/components/ui-kit/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INSTITUTION_NAME, PLATFORM_NAME, PLATFORM_TAGLINE } from "@/lib/brand";
import { useAppState } from "@/lib/app-state";
import { clearSession } from "@/lib/session";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Admin Settings — AAVISHKAR" },
      { name: "description", content: "Platform settings, permissions, moderation and notification rules." },
      { property: "og:title", content: "Admin Settings — AAVISHKAR" },
      { property: "og:description", content: "Configure the AAVISHKAR platform for ATL APSDK." },
    ],
  }),
  component: AdminSettings,
});

function Row({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function AdminSettings() {
  const navigate = useNavigate();
  const { platformSettings, updatePlatformSettings, updateCoordinatorPicture, pendingIdeas } = useAppState();
  const [coordinatorName, setCoordinatorName] = useState(platformSettings.coordinatorName);

  const saveCoordinatorName = () => {
    updatePlatformSettings({ coordinatorName });
  };

  const signOut = () => {
    clearSession();
    toast.message("Signed out");
    navigate({ to: "/" });
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="ATL coordinator controls for AAVISHKAR."
        action={
          pendingIdeas.length > 0 ? (
            <Button variant="outline" onClick={() => navigate({ to: "/admin/ideas" })}>
              {pendingIdeas.length} ideas to review
            </Button>
          ) : undefined
        }
      />
      <Tabs defaultValue="platform">
        <TabsList>
          {["Platform", "Permissions", "Moderation", "Notifications", "Account"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="platform" className="surface mt-6 space-y-6 p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <ProfilePictureUpload
              initials={
                coordinatorName
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "AC"
              }
              avatarUrl={platformSettings.coordinatorAvatarUrl}
              onUpload={async (file) => {
                try {
                  await updateCoordinatorPicture(file);
                } catch {
                  toast.error("Image must be 500 KB or smaller");
                }
              }}
              size="lg"
            />
            <div>
              <p className="text-sm font-medium">Your profile picture</p>
              <p className="text-xs text-muted-foreground">
                Shown in the admin sidebar. JPG or PNG, max 500 KB.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <p className="text-sm font-semibold">{PLATFORM_NAME}</p>
            <p className="text-xs text-muted-foreground">
              {INSTITUTION_NAME} · {PLATFORM_TAGLINE}
            </p>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">
              Platform and institution names are fixed for all users.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Coordinator display name</Label>
              <Input value={coordinatorName} onChange={(e) => setCoordinatorName(e.target.value)} />
            </div>
          </div>
          <Row
            label="Restrict sign-in to school accounts"
            hint="Only @apsdk.edu.in Microsoft accounts when Microsoft auth is enabled."
            checked={platformSettings.restrictSignin}
            onCheckedChange={(v) => updatePlatformSettings({ restrictSignin: v }, { silent: true })}
          />
          <Row
            label="Allow students to create projects"
            hint="Without coordinator approval."
            checked={platformSettings.allowStudentProjects}
            onCheckedChange={(v) => updatePlatformSettings({ allowStudentProjects: v }, { silent: true })}
          />
          <Button onClick={saveCoordinatorName}>Save coordinator name</Button>
        </TabsContent>

        <TabsContent value="permissions" className="surface mt-6 p-6">
          <Row
            label="Coordinators can close recruitments"
            hint="Applies to all ATL staff accounts."
            checked={platformSettings.coordinatorsCloseRecruitments}
            onCheckedChange={(v) => updatePlatformSettings({ coordinatorsCloseRecruitments: v }, { silent: true })}
          />
          <Row
            label="Teachers can publish opportunities"
            hint="Requires coordinator review."
            checked={platformSettings.teachersPublishOpportunities}
            onCheckedChange={(v) => updatePlatformSettings({ teachersPublishOpportunities: v }, { silent: true })}
          />
          <Row
            label="Student leads can manage communities"
            hint="Assigned per community."
            checked={platformSettings.studentLeadsCommunities}
            onCheckedChange={(v) => updatePlatformSettings({ studentLeadsCommunities: v }, { silent: true })}
          />
        </TabsContent>

        <TabsContent value="moderation" className="surface mt-6 space-y-4 p-6">
          <Row
            label="Auto-flag repeated connection requests"
            hint="More than 20 in an hour."
            checked={platformSettings.autoFlagConnections}
            onCheckedChange={(v) => updatePlatformSettings({ autoFlagConnections: v }, { silent: true })}
          />
          <Row
            label="Require review before idea publishing"
            hint="Adds a moderation step."
            checked={platformSettings.requireIdeaReview}
            onCheckedChange={(v) => updatePlatformSettings({ requireIdeaReview: v }, { silent: true })}
          />
          <Button variant="outline" onClick={() => navigate({ to: "/admin/ideas" })}>
            Open idea review ({pendingIdeas.length})
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: "/admin/reports" })}>
            Open moderation queue
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="surface mt-6 p-6">
          <Row
            label="Deadline reminders to students"
            hint="Three days before an opportunity closes."
            checked={platformSettings.deadlineReminders}
            onCheckedChange={(v) => updatePlatformSettings({ deadlineReminders: v }, { silent: true })}
          />
          <Row
            label="Weekly digest to coordinators"
            hint="Summary of projects and applications."
            checked={platformSettings.weeklyDigest}
            onCheckedChange={(v) => updatePlatformSettings({ weeklyDigest: v }, { silent: true })}
          />
          <Row
            label="Recruitment alerts"
            hint="When a call crosses 25 applications."
            checked={platformSettings.recruitmentAlerts}
            onCheckedChange={(v) => updatePlatformSettings({ recruitmentAlerts: v }, { silent: true })}
          />
          <Button className="mt-4" variant="outline" onClick={() => toast.success("Notification rules saved")}>
            Save notification rules
          </Button>
        </TabsContent>

        <TabsContent value="account" className="surface mt-6 space-y-4 p-6">
          <p className="text-sm text-muted-foreground">Sign out of the coordinator portal on this device.</p>
          <Button variant="destructive" onClick={signOut}>
            Sign out
          </Button>
        </TabsContent>
      </Tabs>
    </>
  );
}
