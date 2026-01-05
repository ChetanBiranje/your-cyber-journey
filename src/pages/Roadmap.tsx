import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle,
  BookOpen,
  Code,
  Shield,
  Award,
  FileText,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Milestone {
  id: string;
  phase: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  target_date: string | null;
}

const phaseIcons: Record<string, React.ElementType> = {
  "BCA Year 1": BookOpen,
  "BCA Year 2": Code,
  "BCA Year 3": Shield,
  "Masters Prep": Target,
  "Masters": GraduationCap,
  "PhD Prep": FileText,
  "PhD": Award,
};

const phaseColors: Record<string, string> = {
  "BCA Year 1": "primary",
  "BCA Year 2": "secondary",
  "BCA Year 3": "success",
  "Masters Prep": "warning",
  "Masters": "info",
  "PhD Prep": "accent",
  "PhD": "primary",
};

export default function Roadmap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones();
  }, [user]);

  async function fetchMilestones() {
    if (!user) return;

    const { data, error } = await supabase
      .from("roadmap_milestones")
      .select("*")
      .eq("user_id", user.id)
      .order("target_date", { ascending: true });

    if (data) {
      setMilestones(data);
    }
    setLoading(false);
  }

  async function toggleMilestone(id: string, isCompleted: boolean) {
    const { error } = await supabase
      .from("roadmap_milestones")
      .update({ 
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      });
    } else {
      toast({
        title: !isCompleted ? "Milestone Completed!" : "Milestone Unmarked",
        description: !isCompleted ? "Great progress on your PhD journey!" : "",
      });
      fetchMilestones();
    }
  }

  const groupedMilestones = milestones.reduce((acc, milestone) => {
    if (!acc[milestone.phase]) {
      acc[milestone.phase] = [];
    }
    acc[milestone.phase].push(milestone);
    return acc;
  }, {} as Record<string, Milestone[]>);

  const phases = Object.keys(groupedMilestones);
  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold">PhD Roadmap</h1>
            <p className="text-muted-foreground mt-1">
              Your journey from BCA to Cyber Security PhD
            </p>
          </div>
          <Card3D variant="glass" className="!p-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold font-mono text-gradient">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold font-mono">{totalCount}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold font-mono text-success">{progressPercent.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
            </div>
          </Card3D>
        </div>

        {/* Progress Bar */}
        <Card3D variant="glass" className="animate-slide-up stagger-1 opacity-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-mono font-medium">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-1000 progress-animated"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </Card3D>

        {/* Roadmap Timeline */}
        <div className="space-y-8">
          {phases.map((phase, phaseIndex) => {
            const Icon = phaseIcons[phase] || GraduationCap;
            const color = phaseColors[phase] || "primary";
            const phaseMilestones = groupedMilestones[phase];
            const phaseCompleted = phaseMilestones.every(m => m.is_completed);
            const phaseProgress = (phaseMilestones.filter(m => m.is_completed).length / phaseMilestones.length) * 100;

            return (
              <div 
                key={phase} 
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${0.2 + phaseIndex * 0.1}s` }}
              >
                {/* Phase Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    phaseCompleted ? "gradient-success glow-success" : `bg-${color}/20`
                  )}>
                    <Icon className={cn(
                      "w-7 h-7",
                      phaseCompleted ? "text-success-foreground" : `text-${color}`
                    )} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{phase}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden max-w-[200px]">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            phaseCompleted ? "gradient-success" : "gradient-primary"
                          )}
                          style={{ width: `${phaseProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {phaseMilestones.filter(m => m.is_completed).length}/{phaseMilestones.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="ml-7 border-l-2 border-border pl-8 space-y-4">
                  {phaseMilestones.map((milestone) => (
                    <Card3D 
                      key={milestone.id} 
                      variant={milestone.is_completed ? "glass" : "default"}
                      className={cn(
                        "relative !p-4",
                        milestone.is_completed && "border-success/30"
                      )}
                    >
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute -left-[2.85rem] w-4 h-4 rounded-full border-2",
                        milestone.is_completed 
                          ? "bg-success border-success" 
                          : "bg-background border-muted-foreground"
                      )} />

                      <div className="flex items-start gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 mt-0.5"
                          onClick={() => toggleMilestone(milestone.id, milestone.is_completed)}
                        >
                          {milestone.is_completed ? (
                            <CheckCircle2 className="w-6 h-6 text-success" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            "font-semibold",
                            milestone.is_completed && "line-through text-muted-foreground"
                          )}>
                            {milestone.title}
                          </h3>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {milestone.target_date && (
                              <span>Target: {format(new Date(milestone.target_date), "MMM yyyy")}</span>
                            )}
                            {milestone.completed_at && (
                              <span className="text-success">
                                Completed: {format(new Date(milestone.completed_at), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card3D>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended Courses */}
        <Card3D variant="glass" className="animate-slide-up opacity-0" style={{ animationDelay: "1s" }}>
          <h3 className="text-lg font-semibold mb-4">📚 Recommended Learning Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Coursera - Cyber Security Specialization", type: "Online Course" },
              { name: "NPTEL - Cryptography", type: "MOOC" },
              { name: "TryHackMe / HackTheBox", type: "Practice Platform" },
              { name: "CEH - Certified Ethical Hacker", type: "Certification" },
              { name: "OSCP - Offensive Security", type: "Certification" },
              { name: "GATE CS Preparation", type: "Entrance Exam" },
            ].map((resource, i) => (
              <div 
                key={i} 
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <p className="font-medium text-sm">{resource.name}</p>
                <p className="text-xs text-muted-foreground">{resource.type}</p>
              </div>
            ))}
          </div>
        </Card3D>
      </div>
    </Layout>
  );
}
