import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Target, Save, Shield } from "lucide-react";

interface Profile {
  full_name: string | null;
  current_weight: number;
  target_weight: number;
  current_phase: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    current_weight: 80,
    target_weight: 75,
    current_phase: "BCA Year 1",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name,
        current_weight: Number(data.current_weight),
        target_weight: Number(data.target_weight),
        current_phase: data.current_phase,
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        current_weight: profile.current_weight,
        target_weight: profile.target_weight,
        current_phase: profile.current_phase,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved.",
      });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse-scale" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <Card3D variant="deep" className="animate-slide-up stagger-1 opacity-0">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name || "Researcher"}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm text-success">{profile.current_phase}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  step="0.1"
                  value={profile.current_weight}
                  onChange={(e) => setProfile({ ...profile, current_weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeight" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Weight (kg)
                </Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={profile.target_weight}
                  onChange={(e) => setProfile({ ...profile, target_weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase">Current Phase</Label>
              <select
                id="phase"
                value={profile.current_phase}
                onChange={(e) => setProfile({ ...profile, current_phase: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="BCA Year 1">BCA Year 1</option>
                <option value="BCA Year 2">BCA Year 2</option>
                <option value="BCA Year 3">BCA Year 3</option>
                <option value="Masters Prep">Masters Prep</option>
                <option value="Masters">Masters</option>
                <option value="PhD Prep">PhD Prep</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>
        </Card3D>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground gap-2 px-8"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
