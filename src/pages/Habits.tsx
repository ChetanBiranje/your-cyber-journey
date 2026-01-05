import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Code, 
  Shield, 
  Dumbbell, 
  Droplets,
  Save,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";

interface DailyLog {
  id?: string;
  study_hours: number;
  coding_hours: number;
  cyber_hours: number;
  workout_done: boolean;
  water_liters: number;
  weight: number | null;
  notes: string;
}

export default function Habits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState<DailyLog>({
    study_hours: 0,
    coding_hours: 0,
    cyber_hours: 0,
    workout_done: false,
    water_liters: 0,
    weight: null,
    notes: "",
  });

  useEffect(() => {
    fetchLog();
  }, [selectedDate, user]);

  async function fetchLog() {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", format(selectedDate, "yyyy-MM-dd"))
      .single();

    if (data) {
      setLog({
        id: data.id,
        study_hours: Number(data.study_hours) || 0,
        coding_hours: Number(data.coding_hours) || 0,
        cyber_hours: Number(data.cyber_hours) || 0,
        workout_done: data.workout_done || false,
        water_liters: Number(data.water_liters) || 0,
        weight: data.weight ? Number(data.weight) : null,
        notes: data.notes || "",
      });
    } else {
      setLog({
        study_hours: 0,
        coding_hours: 0,
        cyber_hours: 0,
        workout_done: false,
        water_liters: 0,
        weight: null,
        notes: "",
      });
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const logData = {
      user_id: user.id,
      log_date: format(selectedDate, "yyyy-MM-dd"),
      study_hours: log.study_hours,
      coding_hours: log.coding_hours,
      cyber_hours: log.cyber_hours,
      workout_done: log.workout_done,
      water_liters: log.water_liters,
      weight: log.weight,
      notes: log.notes,
    };

    const { error } = await supabase
      .from("daily_logs")
      .upsert(logData, { onConflict: "user_id,log_date" });

    if (error) {
      toast({
        title: "Error saving log",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Log saved!",
        description: "Your daily habits have been recorded.",
      });
    }

    setSaving(false);
  }

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Date Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold">Daily Habit Tracker</h1>
            <p className="text-muted-foreground mt-1">Track your study, coding, and wellness habits</p>
          </div>
          
          <Card3D variant="glass" className="inline-flex items-center gap-4 !p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-[180px] justify-center">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {isToday ? "Today" : format(selectedDate, "MMM d, yyyy")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              disabled={isToday}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Card3D>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse-scale" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Hours */}
            <Card3D className="animate-slide-up stagger-1 opacity-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Study Hours</h3>
                    <p className="text-sm text-muted-foreground">Academic learning time</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={log.study_hours}
                    onChange={(e) => setLog({ ...log, study_hours: parseFloat(e.target.value) || 0 })}
                    className="text-2xl font-mono h-14 text-center"
                  />
                  <span className="text-muted-foreground">hours</span>
                </div>
              </div>
            </Card3D>

            {/* Coding Hours */}
            <Card3D className="animate-slide-up stagger-2 opacity-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-cyber flex items-center justify-center">
                    <Code className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Coding Hours</h3>
                    <p className="text-sm text-muted-foreground">Programming practice</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={log.coding_hours}
                    onChange={(e) => setLog({ ...log, coding_hours: parseFloat(e.target.value) || 0 })}
                    className="text-2xl font-mono h-14 text-center"
                  />
                  <span className="text-muted-foreground">hours</span>
                </div>
              </div>
            </Card3D>

            {/* Cyber Security Hours */}
            <Card3D className="animate-slide-up stagger-3 opacity-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                    <Shield className="w-6 h-6 text-success-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Cyber Security</h3>
                    <p className="text-sm text-muted-foreground">Security learning & practice</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={log.cyber_hours}
                    onChange={(e) => setLog({ ...log, cyber_hours: parseFloat(e.target.value) || 0 })}
                    className="text-2xl font-mono h-14 text-center"
                  />
                  <span className="text-muted-foreground">hours</span>
                </div>
              </div>
            </Card3D>

            {/* Workout Toggle */}
            <Card3D className="animate-slide-up stagger-4 opacity-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${log.workout_done ? "gradient-warm" : "bg-muted"}`}>
                    <Dumbbell className={`w-6 h-6 ${log.workout_done ? "text-warning-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Workout</h3>
                    <p className="text-sm text-muted-foreground">Did you exercise today?</p>
                  </div>
                  <Switch
                    checked={log.workout_done}
                    onCheckedChange={(checked) => setLog({ ...log, workout_done: checked })}
                  />
                </div>
                {log.workout_done && (
                  <div className="flex items-center gap-2 text-success animate-scale-in">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Great job! Keep it up!</span>
                  </div>
                )}
              </div>
            </Card3D>

            {/* Water Intake */}
            <Card3D className="animate-slide-up stagger-5 opacity-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Water Intake</h3>
                    <p className="text-sm text-muted-foreground">Stay hydrated!</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={log.water_liters}
                    onChange={(e) => setLog({ ...log, water_liters: parseFloat(e.target.value) || 0 })}
                    className="text-2xl font-mono h-14 text-center"
                  />
                  <span className="text-muted-foreground">liters</span>
                </div>
              </div>
            </Card3D>

            {/* Weight */}
            <Card3D className="animate-slide-up stagger-6 opacity-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                    <span className="text-xl">⚖️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Weight (Optional)</h3>
                    <p className="text-sm text-muted-foreground">Track your progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    value={log.weight || ""}
                    onChange={(e) => setLog({ ...log, weight: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="--"
                    className="text-2xl font-mono h-14 text-center"
                  />
                  <span className="text-muted-foreground">kg</span>
                </div>
              </div>
            </Card3D>

            {/* Notes */}
            <Card3D className="lg:col-span-2 animate-slide-up stagger-6 opacity-0">
              <div className="space-y-4">
                <Label htmlFor="notes" className="text-lg font-semibold">Daily Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="What did you learn today? Any reflections?"
                  value={log.notes}
                  onChange={(e) => setLog({ ...log, notes: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
              </div>
            </Card3D>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground gap-2 px-8"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Log
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
