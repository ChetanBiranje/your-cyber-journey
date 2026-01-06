import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Target, Save, Shield, GraduationCap, Briefcase, AlertTriangle, Sparkles } from "lucide-react";

interface Profile {
  full_name: string | null;
  current_weight: number;
  target_weight: number;
  current_phase: string;
  current_education: string | null;
  education_field: string | null;
  goal: string | null;
  challenges: string | null;
}

const educationOptions = [
  "10th Pass",
  "12th Pass", 
  "Diploma",
  "Bachelor's (1st Year)",
  "Bachelor's (2nd Year)",
  "Bachelor's (3rd Year)",
  "Bachelor's Completed",
  "Master's (1st Year)",
  "Master's (2nd Year)",
  "Master's Completed",
  "PhD Candidate",
];

const goalOptions = [
  "PhD in Cyber Security",
  "PhD in Computer Science",
  "Master's in Cyber Security",
  "Master's in Computer Science",
  "CEH Certification",
  "OSCP Certification",
  "Software Engineer",
  "Security Researcher",
  "Penetration Tester",
  "Other",
];

const roadmapTemplates: Record<string, { phase: string; title: string; description: string; monthsFromNow: number }[]> = {
  "PhD in Cyber Security": [
    { phase: "Foundation", title: "Complete Current Degree", description: "Finish your current education with good grades", monthsFromNow: 12 },
    { phase: "Foundation", title: "Learn Programming Basics", description: "Python, C, JavaScript fundamentals", monthsFromNow: 6 },
    { phase: "Foundation", title: "Networking Fundamentals", description: "TCP/IP, OSI Model, Network protocols", monthsFromNow: 8 },
    { phase: "Skills Building", title: "Linux Mastery", description: "Master Linux commands and system administration", monthsFromNow: 10 },
    { phase: "Skills Building", title: "Web Security Basics", description: "OWASP Top 10, SQL Injection, XSS attacks", monthsFromNow: 14 },
    { phase: "Skills Building", title: "Practice on CTF Platforms", description: "TryHackMe, HackTheBox, PicoCTF", monthsFromNow: 16 },
    { phase: "Certifications", title: "CEH Certification", description: "Certified Ethical Hacker certification", monthsFromNow: 24 },
    { phase: "Certifications", title: "OSCP Certification", description: "Offensive Security Certified Professional", monthsFromNow: 30 },
    { phase: "Masters Prep", title: "GATE/GRE Preparation", description: "Prepare for entrance exams", monthsFromNow: 36 },
    { phase: "Masters", title: "M.Tech/MS in Cyber Security", description: "Complete Master's degree with research focus", monthsFromNow: 60 },
    { phase: "PhD Prep", title: "Research Paper Publication", description: "Publish papers in security conferences", monthsFromNow: 66 },
    { phase: "PhD Prep", title: "PhD Entrance & Admission", description: "Apply and get admitted to PhD program", monthsFromNow: 72 },
    { phase: "PhD", title: "PhD Coursework", description: "Complete PhD coursework requirements", monthsFromNow: 84 },
    { phase: "PhD", title: "Thesis Research", description: "Complete doctoral thesis research", monthsFromNow: 108 },
    { phase: "PhD", title: "PhD Defense & Completion", description: "Defend thesis and earn PhD degree", monthsFromNow: 120 },
  ],
  "Master's in Cyber Security": [
    { phase: "Foundation", title: "Complete Current Degree", description: "Finish your current education with good grades", monthsFromNow: 12 },
    { phase: "Foundation", title: "Learn Programming Basics", description: "Python, C, JavaScript fundamentals", monthsFromNow: 6 },
    { phase: "Skills Building", title: "Networking & Linux", description: "Master networking and Linux administration", monthsFromNow: 10 },
    { phase: "Skills Building", title: "Web Security Basics", description: "OWASP Top 10, common vulnerabilities", monthsFromNow: 14 },
    { phase: "Certifications", title: "CompTIA Security+", description: "Entry-level security certification", monthsFromNow: 18 },
    { phase: "Entrance Prep", title: "GATE/GRE Preparation", description: "Prepare for entrance exams", monthsFromNow: 24 },
    { phase: "Masters", title: "M.Tech/MS in Cyber Security", description: "Complete Master's degree", monthsFromNow: 48 },
  ],
  "CEH Certification": [
    { phase: "Foundation", title: "Networking Basics", description: "TCP/IP, protocols, network architecture", monthsFromNow: 2 },
    { phase: "Foundation", title: "Linux Fundamentals", description: "Linux commands and administration", monthsFromNow: 3 },
    { phase: "Preparation", title: "CEH Study Material", description: "EC-Council official courseware", monthsFromNow: 4 },
    { phase: "Preparation", title: "Practice Labs", description: "Hands-on practice with hacking techniques", monthsFromNow: 5 },
    { phase: "Certification", title: "CEH Exam", description: "Pass the CEH certification exam", monthsFromNow: 6 },
  ],
  "OSCP Certification": [
    { phase: "Foundation", title: "Linux Mastery", description: "Advanced Linux skills required", monthsFromNow: 2 },
    { phase: "Foundation", title: "Programming Skills", description: "Python and Bash scripting", monthsFromNow: 3 },
    { phase: "Preparation", title: "PWK Course", description: "Penetration Testing with Kali Linux", monthsFromNow: 6 },
    { phase: "Preparation", title: "Lab Practice", description: "Complete all PWK lab machines", monthsFromNow: 9 },
    { phase: "Certification", title: "OSCP Exam", description: "24-hour practical exam", monthsFromNow: 12 },
  ],
  "default": [
    { phase: "Foundation", title: "Complete Current Education", description: "Finish your current degree/diploma", monthsFromNow: 12 },
    { phase: "Skills Building", title: "Core Technical Skills", description: "Programming, networking, and system fundamentals", monthsFromNow: 18 },
    { phase: "Career Prep", title: "Build Portfolio", description: "Create projects and gain practical experience", monthsFromNow: 24 },
    { phase: "Career", title: "Achieve Your Goal", description: "Land your dream role", monthsFromNow: 36 },
  ],
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    current_weight: 80,
    target_weight: 75,
    current_phase: "BCA Year 1",
    current_education: null,
    education_field: null,
    goal: "PhD in Cyber Security",
    challenges: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name,
        current_weight: Number(data.current_weight),
        target_weight: Number(data.target_weight),
        current_phase: data.current_phase || "BCA Year 1",
        current_education: data.current_education,
        education_field: data.education_field,
        goal: data.goal || "PhD in Cyber Security",
        challenges: data.challenges,
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
        current_education: profile.current_education,
        education_field: profile.education_field,
        goal: profile.goal,
        challenges: profile.challenges,
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

  async function generateRoadmap() {
    if (!user || !profile.goal) return;
    setGeneratingRoadmap(true);

    try {
      // Delete existing milestones
      await supabase
        .from("roadmap_milestones")
        .delete()
        .eq("user_id", user.id);

      // Get the appropriate template
      const template = roadmapTemplates[profile.goal] || roadmapTemplates["default"];

      // Create new milestones based on the goal
      const milestones = template.map((item) => ({
        user_id: user.id,
        phase: item.phase,
        title: item.title,
        description: item.description,
        target_date: new Date(Date.now() + item.monthsFromNow * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: false,
      }));

      const { error } = await supabase
        .from("roadmap_milestones")
        .insert(milestones);

      if (error) throw error;

      toast({
        title: "Roadmap Generated! 🎯",
        description: `Your personalized roadmap for "${profile.goal}" is ready. Check the Roadmap page!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setGeneratingRoadmap(false);
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
          <p className="text-muted-foreground mt-1">Add your details to get a personalized roadmap</p>
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
                <span className="text-sm text-success">{profile.goal || "PhD in Cyber Security"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
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

            {/* Education Info */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education Details
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEducation">Current Education Level</Label>
                  <select
                    id="currentEducation"
                    value={profile.current_education || ""}
                    onChange={(e) => setProfile({ ...profile, current_education: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select your current education</option>
                    {educationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationField">Field of Study</Label>
                  <Input
                    id="educationField"
                    value={profile.education_field || ""}
                    onChange={(e) => setProfile({ ...profile, education_field: e.target.value })}
                    placeholder="e.g., Electronics & Telecommunication, Computer Science, BCA"
                  />
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Your Goal
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">What do you want to achieve?</Label>
                  <select
                    id="goal"
                    value={profile.goal || ""}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select your goal</option>
                    {goalOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Challenges */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Your Challenges
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="challenges">What challenges do you face?</Label>
                <Textarea
                  id="challenges"
                  value={profile.challenges || ""}
                  onChange={(e) => setProfile({ ...profile, challenges: e.target.value })}
                  placeholder="e.g., Limited time for study, Need guidance on resources, Financial constraints, Don't know where to start..."
                  rows={4}
                />
              </div>
            </div>

            {/* Health Goals */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-info" />
                Health Goals
              </h3>
              
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
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={profile.target_weight}
                    onChange={(e) => setProfile({ ...profile, target_weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card3D>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 gap-2"
            onClick={generateRoadmap}
            disabled={generatingRoadmap || !profile.goal}
          >
            {generatingRoadmap ? (
              <>
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Roadmap
              </>
            )}
          </Button>
          
          <Button
            size="lg"
            className="flex-1 gradient-primary text-primary-foreground gap-2"
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
