import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { ProgressRing } from "@/components/ProgressRing";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Dumbbell,
  Droplets,
  Calendar,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

interface WeightData {
  date: string;
  weight: number;
}

interface Profile {
  current_weight: number;
  target_weight: number;
}

export default function Health() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [workoutDays, setWorkoutDays] = useState(0);
  const [avgWater, setAvgWater] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("current_weight, target_weight")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch last 30 days logs
    const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const { data: logsData } = await supabase
      .from("daily_logs")
      .select("log_date, weight, workout_done, water_liters")
      .eq("user_id", user.id)
      .gte("log_date", thirtyDaysAgo)
      .order("log_date", { ascending: true });

    if (logsData) {
      // Weight chart data
      const weights = logsData
        .filter(log => log.weight)
        .map(log => ({
          date: format(new Date(log.log_date), "MMM d"),
          weight: Number(log.weight),
        }));
      setWeightData(weights);

      // Workout count
      const workouts = logsData.filter(log => log.workout_done).length;
      setWorkoutDays(workouts);

      // Average water
      const waterLogs = logsData.filter(log => log.water_liters);
      const totalWater = waterLogs.reduce((sum, log) => sum + Number(log.water_liters), 0);
      setAvgWater(waterLogs.length > 0 ? totalWater / waterLogs.length : 0);
    }

    setLoading(false);
  }

  const currentWeight = profile?.current_weight || 80;
  const targetWeight = profile?.target_weight || 75;
  const weightDiff = currentWeight - targetWeight;
  const weightProgress = Math.max(0, Math.min(100, ((80 - currentWeight) / (80 - targetWeight)) * 100));

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
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold">Health & Fitness</h1>
          <p className="text-muted-foreground mt-1">
            Track your weight, workouts, and hydration
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weight Progress */}
          <Card3D variant="deep" className="md:col-span-2 animate-slide-up stagger-1 opacity-0">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ProgressRing 
                progress={weightProgress} 
                size={140} 
                strokeWidth={10}
                color="success"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono">{currentWeight}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
              </ProgressRing>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold mb-2">Weight Goal Progress</h3>
                <div className="flex items-center justify-center md:justify-start gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold font-mono">{currentWeight} kg</p>
                  </div>
                  <div className="text-3xl text-muted-foreground">→</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold font-mono text-success">{targetWeight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
                  {weightDiff > 0 ? (
                    <>
                      <TrendingDown className="w-5 h-5 text-warning" />
                      <span className="text-sm">
                        <span className="font-mono font-bold">{weightDiff.toFixed(1)} kg</span> to go
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success">Goal achieved!</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card3D>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card3D className="animate-slide-up stagger-2 opacity-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-warning-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Workouts (30 days)</p>
                  <p className="text-2xl font-bold font-mono">{workoutDays} days</p>
                </div>
              </div>
            </Card3D>
            
            <Card3D className="animate-slide-up stagger-3 opacity-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Water Intake</p>
                  <p className="text-2xl font-bold font-mono">{avgWater.toFixed(1)} L</p>
                </div>
              </div>
            </Card3D>
          </div>
        </div>

        {/* Weight Chart */}
        <Card3D className="animate-slide-up stagger-4 opacity-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Weight Trend (Last 30 Days)</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{weightData.length} entries</span>
            </div>
          </div>
          
          {weightData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No weight data recorded yet</p>
                <p className="text-sm">Start logging your weight in the Habits page</p>
              </div>
            </div>
          )}
        </Card3D>

        {/* Tips */}
        <Card3D variant="glass" className="animate-slide-up stagger-5 opacity-0">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Health Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <p className="font-medium text-success mb-1">💧 Hydration</p>
              <p className="text-sm text-muted-foreground">
                Aim for 2-3 liters of water daily for optimal brain function
              </p>
            </div>
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
              <p className="font-medium text-warning mb-1">🏃 Exercise</p>
              <p className="text-sm text-muted-foreground">
                30 minutes of daily exercise improves focus and memory
              </p>
            </div>
            <div className="p-4 rounded-xl bg-info/10 border border-info/20">
              <p className="font-medium text-info mb-1">😴 Sleep</p>
              <p className="text-sm text-muted-foreground">
                7-8 hours of sleep is crucial for learning and retention
              </p>
            </div>
          </div>
        </Card3D>
      </div>
    </Layout>
  );
}
