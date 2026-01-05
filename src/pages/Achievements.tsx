import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy, 
  Flame,
  Target,
  BookOpen,
  Code,
  Shield,
  Zap,
  Star,
  Award,
  Medal,
  Crown,
  Rocket
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  badge_type: string;
  earned_at: string;
}

interface Profile {
  current_streak: number;
  longest_streak: number;
  total_study_hours: number;
  total_coding_hours: number;
}

const badgeIcons: Record<string, React.ElementType> = {
  flame: Flame,
  target: Target,
  book: BookOpen,
  code: Code,
  shield: Shield,
  zap: Zap,
  star: Star,
  award: Award,
  medal: Medal,
  crown: Crown,
  rocket: Rocket,
  trophy: Trophy,
};

const potentialBadges = [
  { id: "first_log", title: "First Steps", description: "Log your first daily habit", icon: "rocket", unlocked: false },
  { id: "week_streak", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "flame", unlocked: false },
  { id: "month_streak", title: "Monthly Master", description: "Maintain a 30-day streak", icon: "crown", unlocked: false },
  { id: "study_10h", title: "Bookworm", description: "Study for 10 hours total", icon: "book", unlocked: false },
  { id: "study_100h", title: "Scholar", description: "Study for 100 hours total", icon: "award", unlocked: false },
  { id: "coding_10h", title: "Code Beginner", description: "Code for 10 hours total", icon: "code", unlocked: false },
  { id: "coding_100h", title: "Developer", description: "Code for 100 hours total", icon: "zap", unlocked: false },
  { id: "cyber_10h", title: "Security Novice", description: "Practice cyber security for 10 hours", icon: "shield", unlocked: false },
  { id: "cyber_100h", title: "Security Expert", description: "Practice cyber security for 100 hours", icon: "medal", unlocked: false },
  { id: "milestone_1", title: "Milestone Achiever", description: "Complete your first roadmap milestone", icon: "target", unlocked: false },
  { id: "milestone_5", title: "Progress Maker", description: "Complete 5 roadmap milestones", icon: "star", unlocked: false },
  { id: "phd_ready", title: "PhD Ready", description: "Complete all preparation phases", icon: "trophy", unlocked: false },
];

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalStudy: 0,
    totalCoding: 0,
    totalCyber: 0,
    completedMilestones: 0,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user) return;

    const [achievementsRes, profileRes, logsRes, milestonesRes] = await Promise.all([
      supabase.from("achievements").select("*").eq("user_id", user.id).order("earned_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("daily_logs").select("study_hours, coding_hours, cyber_hours").eq("user_id", user.id),
      supabase.from("roadmap_milestones").select("is_completed").eq("user_id", user.id).eq("is_completed", true),
    ]);

    if (achievementsRes.data) setAchievements(achievementsRes.data);
    if (profileRes.data) setProfile(profileRes.data);

    const logs = logsRes.data || [];
    const totalStudy = logs.reduce((sum, l) => sum + (Number(l.study_hours) || 0), 0);
    const totalCoding = logs.reduce((sum, l) => sum + (Number(l.coding_hours) || 0), 0);
    const totalCyber = logs.reduce((sum, l) => sum + (Number(l.cyber_hours) || 0), 0);

    setStats({
      totalStudy,
      totalCoding,
      totalCyber,
      completedMilestones: milestonesRes.data?.length || 0,
      totalLogs: logs.length,
    });

    setLoading(false);
  }

  // Calculate unlocked badges based on stats
  const unlockedBadges = potentialBadges.map(badge => {
    let unlocked = false;
    
    switch (badge.id) {
      case "first_log": unlocked = stats.totalLogs >= 1; break;
      case "week_streak": unlocked = (profile?.current_streak || 0) >= 7; break;
      case "month_streak": unlocked = (profile?.current_streak || 0) >= 30; break;
      case "study_10h": unlocked = stats.totalStudy >= 10; break;
      case "study_100h": unlocked = stats.totalStudy >= 100; break;
      case "coding_10h": unlocked = stats.totalCoding >= 10; break;
      case "coding_100h": unlocked = stats.totalCoding >= 100; break;
      case "cyber_10h": unlocked = stats.totalCyber >= 10; break;
      case "cyber_100h": unlocked = stats.totalCyber >= 100; break;
      case "milestone_1": unlocked = stats.completedMilestones >= 1; break;
      case "milestone_5": unlocked = stats.completedMilestones >= 5; break;
      case "phd_ready": unlocked = stats.completedMilestones >= 9; break;
    }
    
    return { ...badge, unlocked };
  });

  const earnedCount = unlockedBadges.filter(b => b.unlocked).length;

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
            <h1 className="text-3xl font-bold">Achievements</h1>
            <p className="text-muted-foreground mt-1">
              Celebrate your wins and track your badges
            </p>
          </div>
          <Card3D variant="glass" className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{earnedCount}/{potentialBadges.length}</p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </Card3D>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card3D className="!p-4 animate-slide-up stagger-1 opacity-0">
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-primary">{stats.totalStudy.toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">Study Hours</p>
            </div>
          </Card3D>
          <Card3D className="!p-4 animate-slide-up stagger-2 opacity-0">
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-secondary">{stats.totalCoding.toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">Coding Hours</p>
            </div>
          </Card3D>
          <Card3D className="!p-4 animate-slide-up stagger-3 opacity-0">
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-success">{stats.totalCyber.toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">Cyber Hours</p>
            </div>
          </Card3D>
          <Card3D className="!p-4 animate-slide-up stagger-4 opacity-0">
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-warning">{profile?.longest_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </Card3D>
        </div>

        {/* Badges Grid */}
        <Card3D className="animate-slide-up stagger-5 opacity-0">
          <h3 className="text-lg font-semibold mb-6">Badge Collection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {unlockedBadges.map((badge, index) => {
              const Icon = badgeIcons[badge.icon] || Trophy;
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "relative group p-4 rounded-2xl border-2 transition-all duration-300 text-center",
                    badge.unlocked
                      ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 hover:border-primary"
                      : "bg-muted/30 border-muted grayscale opacity-50"
                  )}
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                >
                  {badge.unlocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                  )}
                  <div className={cn(
                    "w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                    badge.unlocked ? "gradient-primary" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-7 h-7",
                      badge.unlocked ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                  <p className={cn(
                    "font-semibold text-sm",
                    !badge.unlocked && "text-muted-foreground"
                  )}>
                    {badge.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Card3D>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <Card3D variant="glass" className="animate-slide-up opacity-0" style={{ animationDelay: "1s" }}>
            <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = badgeIcons[achievement.badge_type] || Trophy;
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(achievement.earned_at), "MMM d, yyyy")}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card3D>
        )}
      </div>
    </Layout>
  );
}
