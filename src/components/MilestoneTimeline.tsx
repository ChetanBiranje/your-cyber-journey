import { useMemo } from "react";
import { Card3D } from "@/components/Card3D";
import { cn } from "@/lib/utils";
import { format, differenceInMonths, addMonths, startOfMonth } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onToggle: (id: string, isCompleted: boolean) => void;
}

const phaseColorMap: Record<string, string> = {
  "Foundation": "hsl(var(--primary))",
  "Learning": "hsl(var(--secondary))",
  "Practice": "hsl(142 76% 36%)",
  "Certification": "hsl(38 92% 50%)",
  "BCA Year 1": "hsl(var(--primary))",
  "BCA Year 2": "hsl(var(--secondary))",
  "BCA Year 3": "hsl(142 76% 36%)",
  "Masters Prep": "hsl(38 92% 50%)",
  "Masters": "hsl(217 91% 60%)",
  "PhD Prep": "hsl(280 87% 62%)",
  "PhD": "hsl(var(--primary))",
  "Career": "hsl(142 76% 36%)",
  "Custom": "hsl(var(--muted-foreground))",
};

export function MilestoneTimeline({ milestones, onToggle }: MilestoneTimelineProps) {
  const { timelineData, startDate, endDate, monthsCount, phases } = useMemo(() => {
    const milestonesWithDates = milestones.filter(m => m.target_date);
    
    if (milestonesWithDates.length === 0) {
      return { timelineData: [], startDate: new Date(), endDate: new Date(), monthsCount: 12, phases: [] };
    }

    const dates = milestonesWithDates.map(m => new Date(m.target_date!));
    const minDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime()))));
    const maxDate = startOfMonth(new Date(Math.max(...dates.map(d => d.getTime()))));
    
    // Add padding months
    const startDate = addMonths(minDate, -1);
    const endDate = addMonths(maxDate, 2);
    const monthsCount = Math.max(differenceInMonths(endDate, startDate), 12);

    // Group by phase
    const phases = [...new Set(milestonesWithDates.map(m => m.phase))];
    
    const timelineData = phases.map(phase => ({
      phase,
      milestones: milestonesWithDates
        .filter(m => m.phase === phase)
        .map(m => ({
          ...m,
          position: differenceInMonths(new Date(m.target_date!), startDate) / monthsCount * 100,
        }))
        .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime()),
    }));

    return { timelineData, startDate, endDate, monthsCount, phases };
  }, [milestones]);

  // Generate month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    for (let i = 0; i <= monthsCount; i += Math.max(1, Math.floor(monthsCount / 12))) {
      const date = addMonths(startDate, i);
      labels.push({
        label: format(date, "MMM yyyy"),
        position: (i / monthsCount) * 100,
      });
    }
    return labels;
  }, [startDate, monthsCount]);

  const today = new Date();
  const todayPosition = Math.min(100, Math.max(0, differenceInMonths(today, startDate) / monthsCount * 100));

  if (timelineData.length === 0) {
    return (
      <Card3D variant="glass" className="p-6">
        <p className="text-muted-foreground text-center">
          No milestones with target dates to display. Add target dates to your milestones to see them on the timeline.
        </p>
      </Card3D>
    );
  }

  return (
    <Card3D variant="glass" className="p-6 overflow-hidden">
      <div className="space-y-6">
        {/* Month labels */}
        <div className="relative h-8 border-b border-border">
          {monthLabels.map((month, i) => (
            <div
              key={i}
              className="absolute text-xs text-muted-foreground transform -translate-x-1/2"
              style={{ left: `${month.position}%` }}
            >
              <span className="whitespace-nowrap">{month.label}</span>
              <div className="w-px h-2 bg-border mx-auto mt-1" />
            </div>
          ))}
        </div>

        {/* Today marker */}
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
            style={{ left: `${todayPosition}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-destructive font-medium whitespace-nowrap">
              Today
            </div>
          </div>
        </div>

        {/* Phase rows */}
        <TooltipProvider>
          <div className="space-y-4">
            {timelineData.map((phaseData) => (
              <div key={phaseData.phase} className="relative">
                {/* Phase label */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: phaseColorMap[phaseData.phase] || "hsl(var(--muted-foreground))" }}
                  />
                  <span className="text-sm font-medium">{phaseData.phase}</span>
                </div>

                {/* Timeline bar */}
                <div className="relative h-12 bg-muted/30 rounded-lg">
                  {/* Phase duration bar */}
                  {phaseData.milestones.length > 0 && (
                    <div
                      className="absolute h-full rounded-lg opacity-20"
                      style={{
                        left: `${Math.min(...phaseData.milestones.map(m => m.position))}%`,
                        right: `${100 - Math.max(...phaseData.milestones.map(m => m.position))}%`,
                        backgroundColor: phaseColorMap[phaseData.phase] || "hsl(var(--muted-foreground))",
                      }}
                    />
                  )}

                  {/* Milestone markers */}
                  {phaseData.milestones.map((milestone) => (
                    <Tooltip key={milestone.id}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer",
                            milestone.is_completed
                              ? "bg-success text-success-foreground"
                              : "bg-background border-2 hover:border-primary"
                          )}
                          style={{
                            left: `${milestone.position}%`,
                            borderColor: milestone.is_completed ? undefined : phaseColorMap[milestone.phase],
                          }}
                          onClick={() => onToggle(milestone.id, milestone.is_completed)}
                        >
                          {milestone.is_completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" style={{ color: phaseColorMap[milestone.phase] }} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">{milestone.title}</p>
                          {milestone.description && (
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                          )}
                          <p className="text-xs">
                            Target: {format(new Date(milestone.target_date!), "MMM d, yyyy")}
                          </p>
                          {milestone.is_completed && milestone.completed_at && (
                            <p className="text-xs text-success">
                              Completed: {format(new Date(milestone.completed_at), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-success-foreground" />
            </div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
              <Circle className="w-3 h-3 text-muted-foreground" />
            </div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-0.5 bg-destructive" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </Card3D>
  );
}
