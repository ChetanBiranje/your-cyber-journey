import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  BookOpen,
  Code,
  Shield,
  Award,
  FileText,
  Target,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableMilestone } from "@/components/DraggableMilestone";

interface Milestone {
  id: string;
  phase: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  target_date: string | null;
  display_order: number;
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

const phaseOptions = [
  "Foundation",
  "Learning",
  "Practice",
  "Certification",
  "BCA Year 1",
  "BCA Year 2",
  "BCA Year 3",
  "Masters Prep",
  "Masters",
  "PhD Prep",
  "PhD",
  "Career",
  "Custom"
];

export default function Roadmap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    phase: "",
    title: "",
    description: "",
    target_date: ""
  });

  useEffect(() => {
    fetchMilestones();
  }, [user]);

  async function fetchMilestones() {
    if (!user) return;

    const { data, error } = await supabase
      .from("roadmap_milestones")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true });

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
        description: !isCompleted ? "Great progress on your journey!" : "",
      });
      fetchMilestones();
    }
  }

  async function createMilestone() {
    if (!user || !newMilestone.phase || !newMilestone.title) {
      toast({
        title: "Missing fields",
        description: "Please fill in phase and title",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const { error } = await supabase
      .from("roadmap_milestones")
      .insert({
        user_id: user.id,
        phase: newMilestone.phase,
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim() || null,
        target_date: newMilestone.target_date || null,
        is_completed: false
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create milestone",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Milestone Created! 🎯",
        description: "Your custom milestone has been added",
      });
      setNewMilestone({ phase: "", title: "", description: "", target_date: "" });
      setDialogOpen(false);
      fetchMilestones();
    }
    setCreating(false);
  }

  async function deleteMilestone(id: string) {
    const { error } = await supabase
      .from("roadmap_milestones")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Milestone Deleted",
        description: "The milestone has been removed",
      });
      fetchMilestones();
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent, phase: string) {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const phaseMilestones = groupedMilestones[phase];
    const oldIndex = phaseMilestones.findIndex((m) => m.id === active.id);
    const newIndex = phaseMilestones.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedMilestones = arrayMove(phaseMilestones, oldIndex, newIndex);
    
    // Optimistically update UI
    const newMilestones = milestones.map((m) => {
      if (m.phase !== phase) return m;
      const newOrder = reorderedMilestones.findIndex((rm) => rm.id === m.id);
      return { ...m, display_order: newOrder };
    });
    setMilestones(newMilestones);

    // Update database
    const updates = reorderedMilestones.map((milestone, index) => 
      supabase
        .from("roadmap_milestones")
        .update({ display_order: index })
        .eq("id", milestone.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast({
        title: "Error",
        description: "Failed to save new order",
        variant: "destructive",
      });
      fetchMilestones(); // Revert to server state
    }
  }

  const groupedMilestones = milestones.reduce((acc, milestone) => {
    if (!acc[milestone.phase]) {
      acc[milestone.phase] = [];
    }
    acc[milestone.phase].push(milestone);
    return acc;
  }, {} as Record<string, Milestone[]>);

  // Sort each phase's milestones by display_order
  Object.keys(groupedMilestones).forEach((phase) => {
    groupedMilestones[phase].sort((a, b) => a.display_order - b.display_order);
  });

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
            <h1 className="text-3xl font-bold">My Roadmap</h1>
            <p className="text-muted-foreground mt-1">
              Track your journey towards your goals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Milestone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phase">Phase *</Label>
                    <Select
                      value={newMilestone.phase}
                      onValueChange={(value) => setNewMilestone(prev => ({ ...prev, phase: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {phaseOptions.map((phase) => (
                          <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Complete React course"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional details about this milestone"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                      maxLength={500}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_date">Target Date</Label>
                    <Input
                      id="target_date"
                      type="date"
                      value={newMilestone.target_date}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, target_date: e.target.value }))}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={createMilestone}
                    disabled={creating || !newMilestone.phase || !newMilestone.title}
                  >
                    {creating ? "Creating..." : "Create Milestone"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, phase)}
                >
                  <SortableContext
                    items={phaseMilestones.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="ml-7 border-l-2 border-border pl-8 space-y-4">
                      {phaseMilestones.map((milestone) => (
                        <DraggableMilestone
                          key={milestone.id}
                          milestone={milestone}
                          onToggle={toggleMilestone}
                          onDelete={deleteMilestone}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
