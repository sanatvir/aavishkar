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
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { clearSession } from "@/lib/session";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AAVISHKAR" },
      { name: "description", content: "Manage your AAVISHKAR profile, privacy, notifications and account." },
      { property: "og:title", content: "Settings — AAVISHKAR" },
      { property: "og:description", content: "Profile, privacy, notifications and account preferences." },
    ],
  }),
  component: SettingsPage,
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

function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, updateProfilePicture, studentSettings, updateStudentSettings } = useAppState();
  const [name, setName] = useState(currentUser.name);
  const [className, setClassName] = useState(currentUser.className);
  const [bio, setBio] = useState(currentUser.bio);
  const [skillsText, setSkillsText] = useState(currentUser.skills.join(", "));

  const saveProfile = () => {
    const skills = skillsText
      .split(/[,·]/)
      .map((s) => s.trim())
      .filter(Boolean);
    updateProfile({ name, className, bio, skills });
  };

  const signOut = () => {
    clearSession();
    toast.message("Signed out");
    navigate({ to: "/" });
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your AAVISHKAR profile and preferences." />
      <Tabs defaultValue="profile">
        <TabsList>
          {["Profile", "Privacy", "Notifications", "Account"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="surface mt-6 space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ProfilePictureUpload
              initials={currentUser.initials}
              accent={currentUser.accent}
              avatarUrl={currentUser.avatarUrl}
              onUpload={async (file) => {
                try {
                  await updateProfilePicture(file);
                } catch {
                  toast.error("Image must be 500 KB or smaller");
                }
              }}
            />
            <div>
              <p className="text-sm font-medium">Profile picture</p>
              <p className="text-xs text-muted-foreground">
                Click your photo to upload. JPG or PNG, max 500 KB.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="class">Class</Label>
              <Input id="class" value={className} onChange={(e) => setClassName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills</Label>
            <Input id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
          </div>
          <Button onClick={saveProfile}>Save changes</Button>
        </TabsContent>

        <TabsContent value="privacy" className="surface mt-6 p-6">
          <Row
            label="Show my profile in Discover People"
            hint="Other students can find and connect with you."
            checked={studentSettings.showInDiscover}
            onCheckedChange={(v) => updateStudentSettings({ showInDiscover: v }, { silent: true })}
          />
          <Row
            label="Show my class"
            hint="Displayed on your profile card."
            checked={studentSettings.showClass}
            onCheckedChange={(v) => updateStudentSettings({ showClass: v }, { silent: true })}
          />
          <Row
            label="Allow direct messages"
            hint="Any APSDK student can message you."
            checked={studentSettings.allowMessages}
            onCheckedChange={(v) => updateStudentSettings({ allowMessages: v }, { silent: true })}
          />
          <Row
            label="Show my projects publicly"
            hint="Appears on your profile."
            checked={studentSettings.showProjectsPublic}
            onCheckedChange={(v) => updateStudentSettings({ showProjectsPublic: v }, { silent: true })}
          />
        </TabsContent>

        <TabsContent value="notifications" className="surface mt-6 p-6">
          <Row
            label="Connection requests"
            hint="When someone wants to connect."
            checked={studentSettings.notifyConnections}
            onCheckedChange={(v) => updateStudentSettings({ notifyConnections: v }, { silent: true })}
          />
          <Row
            label="Project invitations"
            hint="When a team invites you."
            checked={studentSettings.notifyProjects}
            onCheckedChange={(v) => updateStudentSettings({ notifyProjects: v }, { silent: true })}
          />
          <Row
            label="Opportunity deadlines"
            hint="Reminders three days before closing."
            checked={studentSettings.notifyOpportunities}
            onCheckedChange={(v) => updateStudentSettings({ notifyOpportunities: v }, { silent: true })}
          />
          <Row
            label="Community announcements"
            hint="Posts from communities you joined."
            checked={studentSettings.notifyCommunities}
            onCheckedChange={(v) => updateStudentSettings({ notifyCommunities: v }, { silent: true })}
          />
        </TabsContent>

        <TabsContent value="account" className="surface mt-6 space-y-4 p-6">
          <div>
            <p className="text-sm font-medium">School account</p>
            <p className="text-xs text-muted-foreground">
              {currentUser.name} · APS Dhaula Kuan (demo session until Microsoft auth is enabled)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.message("Export will be available with full auth")}>
              Export my data
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
