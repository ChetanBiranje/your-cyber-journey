import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card3D } from "@/components/Card3D";
import { ProgressRing } from "@/components/ProgressRing";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen,
  Code,
  Shield,
  Coffee,
  Clock,
  History
} from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  duration_minutes: number;
  session_type: string;
  topic: string | null;
  created_at: string;
}

const sessionTypes = [
  { value: "study", label: "Study", icon: BookOpen, color: "primary" },
  { value: "coding", label: "Coding", icon: Code, color: "secondary" },
  { value: "cyber", label: "Cyber Security", icon: Shield, color: "success" },
];

export default function Timer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionType, setSessionType] = useState("study");
  const [topic, setTopic] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [duration, setDuration] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  async function fetchSessions() {
    if (!user) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("session_date", today)
      .order("created_at", { ascending: false });

    if (data) {
      setSessions(data);
    }
  }

  async function handleSessionComplete() {
    setIsRunning(false);
    
    if (!isBreak && user) {
      const durationMinutes = Math.floor((startTimeRef.current - time) / 60) || duration;
      
      await supabase.from("study_sessions").insert({
        user_id: user.id,
        duration_minutes: durationMinutes,
        session_type: sessionType,
        topic: topic || null,
        session_date: format(new Date(), "yyyy-MM-dd"),
      });

      toast({
        title: "Session Complete! 🎉",
        description: `Great job! ${durationMinutes} minutes of ${sessionType} logged.`,
      });

      fetchSessions();
    }

    // Switch to break or back to work
    if (!isBreak) {
      setIsBreak(true);
      setTime(5 * 60); // 5 minute break
    } else {
      setIsBreak(false);
      setTime(duration * 60);
    }
  }

  function toggleTimer() {
    if (!isRunning) {
      startTimeRef.current = time;
    }
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setIsBreak(false);
    setTime(duration * 60);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const totalMinutes = isBreak ? 5 * 60 : duration * 60;
  const progress = ((totalMinutes - time) / totalMinutes) * 100;
  const todayTotal = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  const CurrentIcon = sessionTypes.find(t => t.value === sessionType)?.icon || BookOpen;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold">Study Timer</h1>
          <p className="text-muted-foreground mt-1">
            Focus with Pomodoro technique - {duration} min work, 5 min break
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer */}
          <Card3D 
            variant="deep" 
            className="lg:col-span-2 animate-slide-up stagger-1 opacity-0"
          >
            <div className="flex flex-col items-center py-8">
              <div className="relative mb-8">
                <ProgressRing
                  progress={progress}
                  size={280}
                  strokeWidth={12}
                  color={isBreak ? "warning" : "primary"}
                >
                  <div className="text-center">
                    <p className="text-6xl font-bold font-mono">{formatTime(time)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isBreak ? "☕ Break Time" : "🎯 Focus Time"}
                    </p>
                  </div>
                </ProgressRing>
                
                {/* Floating icon */}
                <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isBreak ? "gradient-warm" : "gradient-primary"
                } ${isRunning ? "animate-pulse-scale" : ""}`}>
                  {isBreak ? (
                    <Coffee className="w-8 h-8 text-warning-foreground" />
                  ) : (
                    <CurrentIcon className="w-8 h-8 text-primary-foreground" />
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mb-8">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-14 rounded-full"
                  onClick={resetTimer}
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  className={`h-20 w-20 rounded-full text-2xl ${
                    isRunning 
                      ? "bg-destructive hover:bg-destructive/90" 
                      : "gradient-primary hover:opacity-90"
                  }`}
                  onClick={toggleTimer}
                >
                  {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                <div className="w-14" /> {/* Spacer for symmetry */}
              </div>

              {/* Settings */}
              {!isRunning && !isBreak && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(v) => {
                        setDuration(parseInt(v));
                        setTime(parseInt(v) * 60);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="25">25 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Session Type</Label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <Input
                      placeholder="What are you studying?"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card3D>

          {/* Stats & History */}
          <div className="space-y-4">
            <Card3D gradient="cyber" className="animate-slide-up stagger-2 opacity-0">
              <div className="flex items-center gap-4">
                <Clock className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-80">Today's Focus Time</p>
                  <p className="text-3xl font-bold font-mono">
                    {Math.floor(todayTotal / 60)}h {todayTotal % 60}m
                  </p>
                </div>
              </div>
            </Card3D>

            <Card3D className="animate-slide-up stagger-3 opacity-0">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Today's Sessions</h3>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {sessions.length > 0 ? (
                  sessions.map((session) => {
                    const TypeIcon = sessionTypes.find(t => t.value === session.session_type)?.icon || BookOpen;
                    return (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {sessionTypes.find(t => t.value === session.session_type)?.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.topic || format(new Date(session.created_at), "h:mm a")}
                          </p>
                        </div>
                        <p className="font-mono text-sm font-medium">
                          {session.duration_minutes}m
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No sessions yet today
                  </p>
                )}
              </div>
            </Card3D>
          </div>
        </div>
      </div>
    </Layout>
  );
}
