import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { MotivationQuote } from "@/components/MotivationQuote";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  Code, 
  Shield, 
  Flame, 
  Target, 
  TrendingUp,
  Calendar,
  Dumbbell,
  Droplets,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Profile {
  full_name: string | null;
  current_weight: number;
  target_weight: number;
  current_streak: number;
  longest_streak: number;
  current_phase: string;
  total_study_hours: number;
  total_coding_hours: number;
}

interface DailyLog {
  study_hours: number;
  coding_hours: number;
  cyber_hours: number;
  workout_done: boolean;
  water_liters: number;
  weight: number | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const [profileRes, logRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("daily_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("log_date", format(new Date(), "yyyy-MM-dd"))
          .single(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }

      if (logRes.data) {
        setTodayLog(logRes.data);
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  const todayStudy = todayLog?.study_hours || 0;
  const todayCoding = todayLog?.coding_hours || 0;
  const todayCyber = todayLog?.cyber_hours || 0;
  const totalTodayHours = todayStudy + todayCoding + todayCyber;
  const dailyGoal = 8;
  const progressPercent = Math.min((totalTodayHours / dailyGoal) * 100, 100);

  const weightProgress = profile 
    ? Math.max(0, ((profile.current_weight - profile.target_weight) / (80 - profile.target_weight)) * 100)
    : 0;

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="text-gradient">{profile?.full_name || "Researcher"}</span>! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")} • {profile?.current_phase}
            </p>
          </div>
          <Link to="/habits">
            <Button className="gradient-primary text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Log Today
            </Button>
          </Link>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Study Hours Today"
            value={todayStudy.toFixed(1)}
            subtitle="hours"
            icon={BookOpen}
            gradient="primary"
            delay={1}
          />
          <StatCard
            title="Coding Hours Today"
            value={todayCoding.toFixed(1)}
            subtitle="hours"
            icon={Code}
            gradient="cyber"
            delay={2}
          />
          <StatCard
            title="Cyber Security"
            value={todayCyber.toFixed(1)}
            subtitle="hours"
            icon={Shield}
            gradient="success"
            delay={3}
          />
          <StatCard
            title="Current Streak"
            value={profile?.current_streak || 0}
            subtitle={`Best: ${profile?.longest_streak || 0} days`}
            icon={Flame}
            trend="up"
            gradient="warm"
            delay={4}
          />
        </div>

        {/* Progress and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Progress */}
          <Card3D variant="deep" className="lg:col-span-1 animate-slide-up stagger-5 opacity-0">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Daily Progress</h3>
              <ProgressRing 
                progress={progressPercent} 
                size={160} 
                strokeWidth={12}
                color="primary"
              >
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono">{totalTodayHours.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">of {dailyGoal}h goal</p>
                </div>
              </ProgressRing>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded-lg bg-primary/10">
                  <p className="font-mono font-bold text-primary">{todayStudy.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Study</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/10">
                  <p className="font-mono font-bold text-secondary">{todayCoding.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Code</p>
                </div>
                <div className="p-2 rounded-lg bg-success/10">
                  <p className="font-mono font-bold text-success">{todayCyber.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Cyber</p>
                </div>
              </div>
            </div>
          </Card3D>

          {/* Health Quick Stats */}
          <Card3D variant="glass" className="animate-slide-up stagger-6 opacity-0">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Health Goals
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Weight</p>
                    <p className="font-bold font-mono">{profile?.current_weight || 80} kg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="font-bold font-mono text-success">{profile?.target_weight || 75} kg</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-success rounded-full transition-all duration-1000"
                  style={{ width: `${100 - weightProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className={`w-5 h-5 ${todayLog?.workout_done ? "text-success" : "text-muted-foreground"}`} />
                  <span className="text-sm">{todayLog?.workout_done ? "Workout Done!" : "No workout yet"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-info" />
                  <span className="text-sm font-mono">{todayLog?.water_liters || 0}L</span>
                </div>
              </div>
            </div>
          </Card3D>

          {/* Motivation */}
          <div className="animate-slide-up stagger-6 opacity-0">
            <MotivationQuote />
          </div>
        </div>

        {/* Quick Actions */}
        <Card3D variant="glass" className="animate-slide-up stagger-6 opacity-0">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/habits">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-primary/5">
                <BookOpen className="w-6 h-6" />
                <span>Log Habits</span>
              </Button>
            </Link>
            <Link to="/timer">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:border-secondary hover:bg-secondary/5">
                <Code className="w-6 h-6" />
                <span>Start Timer</span>
              </Button>
            </Link>
            <Link to="/roadmap">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:border-success hover:bg-success/5">
                <Target className="w-6 h-6" />
                <span>View Roadmap</span>
              </Button>
            </Link>
            <Link to="/finance">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:border-warning hover:bg-warning/5">
                <TrendingUp className="w-6 h-6" />
                <span>Add Expense</span>
              </Button>
            </Link>
          </div>
        </Card3D>
      </div>
    </Layout>
  );
}
