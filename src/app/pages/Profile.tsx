import { useState } from "react";
import { useNavigate } from "react-router";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAppLanguage } from "../lib/appLanguage";
import { getCurrentUser, getDashboardPath, getRoleLabel, updateCurrentUserProfile } from "../lib/mockData";
import { useAppDataRefresh } from "../lib/useAppDataRefresh";
import { toast } from "sonner";

export default function Profile() {
  useAppDataRefresh();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { language } = useAppLanguage();
  const t = language === "tl"
    ? {
        title: "Profile",
        description: "I-update ang impormasyon ng account mo",
        back: "Bumalik sa Dashboard",
        accountDetails: "Detalye ng Account",
        accountMeta: "Role at impormasyon ng account mo",
        role: "Role",
        memberSince: "Member Since",
        editProfile: "I-edit ang Profile",
        editDescription: "I-update ang puwedeng baguhin na profile details, kasama ang member since date",
        fullName: "Buong Pangalan",
        email: "Email",
        barangay: "Barangay",
        save: "I-save ang Changes",
        cancel: "Cancel",
        success: "Matagumpay na na-update ang profile.",
        error: "Hindi na-update ang profile. I-check ang inputs at siguraduhing unique ang email.",
      }
    : {
        title: "Profile",
        description: "Update your account information",
        back: "Back to Dashboard",
        accountDetails: "Account Details",
        accountMeta: "Your role and account metadata",
        role: "Role",
        memberSince: "Member Since",
        editProfile: "Edit Profile",
        editDescription: "Update editable profile fields below, including your member since date",
        fullName: "Full Name",
        email: "Email",
        barangay: "Barangay",
        save: "Save Changes",
        cancel: "Cancel",
        success: "Profile updated successfully.",
        error: "Unable to update profile. Check your inputs and try a unique email.",
      };

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [barangay, setBarangay] = useState(user?.barangay ?? "");
  const [memberSince, setMemberSince] = useState(
    user ? new Date(user.createdAt.getTime() - user.createdAt.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "",
  );

  if (!user) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateCurrentUserProfile({ name, email, barangay, createdAt: memberSince });

    if (!updated) {
      toast.error(t.error);
      return;
    }

    toast.success(t.success);
    navigate(getDashboardPath(updated));
  };

  return (
    <AppShell
      title={t.title}
      description={t.description}
      maxWidthClassName="max-w-2xl"
      headerActions={
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-slate-200 bg-white"
          onClick={() => navigate(getDashboardPath(user))}
        >
          {t.back}
        </Button>
      }
    >
      <Card className="mb-6 border-white/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>{t.accountDetails}</CardTitle>
          <CardDescription>{t.accountMeta}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">{t.role}</p>
            <p className="font-medium">{getRoleLabel(user)}</p>
          </div>
          <div>
            <p className="text-slate-500">{t.memberSince}</p>
            <p className="font-medium">{user.createdAt.toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/80 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>{t.editProfile}</CardTitle>
          <CardDescription>{t.editDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">{t.fullName}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barangay">{t.barangay}</Label>
              <Input id="barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberSince">{t.memberSince}</Label>
              <Input
                id="memberSince"
                type="date"
                value={memberSince}
                onChange={(e) => setMemberSince(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="h-11 rounded-xl bg-primary hover:bg-primary/90">{t.save}</Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white"
                onClick={() => navigate(getDashboardPath(user))}
              >
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
