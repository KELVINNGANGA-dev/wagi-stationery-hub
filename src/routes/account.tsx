import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { KENYAN_COUNTIES } from "@/lib/store-config";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | WAGI - STATIONARIES" },
      { name: "description", content: "Update your WAGI profile and saved delivery address." },
      { property: "og:title", content: "My Account | WAGI - STATIONARIES" },
      { property: "og:description", content: "Manage your details for faster checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth message="Sign in to manage your profile.">
      <AccountPage />
    </RequireAuth>
  ),
});

function AccountPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    alt_phone: "",
    county: "Nairobi",
    town: "",
    estate: "",
    street: "",
    building: "",
    house_number: "",
    landmark: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name,
      phone: profile.phone ?? "",
      alt_phone: profile.alt_phone ?? "",
      county: profile.county ?? "Nairobi",
      town: profile.town ?? "",
      estate: profile.estate ?? "",
      street: profile.street ?? "",
      building: profile.building ?? "",
      house_number: profile.house_number ?? "",
      landmark: profile.landmark ?? "",
    });
  }, [profile]);

  const save = async () => {
    if (!user) return;
    if (!form.full_name.trim()) {
      toast.error("Your name cannot be empty");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        alt_phone: form.alt_phone.trim() || null,
        county: form.county,
        town: form.town.trim() || null,
        estate: form.estate.trim() || null,
        street: form.street.trim() || null,
        building: form.building.trim() || null,
        house_number: form.house_number.trim() || null,
        landmark: form.landmark.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile updated");
  };

  const field = (id: keyof typeof form, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={form[id]}
        maxLength={120}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight">My account</h1>
      <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>

      <div className="mt-6 max-w-3xl rounded-2xl border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">Personal details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("full_name", "Full name")}
          {field("phone", "Phone")}
          {field("alt_phone", "Alternative phone")}
        </div>

        <Separator className="my-6" />

        <h2 className="text-sm font-semibold">Default delivery address</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="county">County</Label>
            <Select value={form.county} onValueChange={(v) => setForm((f) => ({ ...f, county: v }))}>
              <SelectTrigger id="county">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {KENYAN_COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {field("town", "Town / area")}
          {field("estate", "Estate")}
          {field("street", "Street")}
          {field("building", "Building / apartment")}
          {field("house_number", "House number")}
          {field("landmark", "Nearest landmark")}
        </div>

        <Button className="mt-6 rounded-full" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
