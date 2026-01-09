import { useMemo, useState } from "react";
import { Card3D } from "@/components/Card3D";
import { cn } from "@/lib/utils";
import { format, differenceInMonths, addMonths, startOfMonth, subMonths } from "date-fns";
import { CheckCircle2, Circle, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type ZoomLevel = "3m" | "6m" | "1y" | "2y" | "all";

const zoomLabels: Record<ZoomLevel, string> = {
  "3m": "3 Months",
  "6m": "6 Months",
  "1y": "1 Year",
  "2y": "2 Years",
  "all": "All",
};

export function MilestoneTimeline({ milestones, onToggle }: MilestoneTimelineProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("all");

  const { timelineData, startDate, monthsCount, phases, hasData } = useMemo(() => {
    const milestonesWithDates = milestones.filter(m => m.target_date);
    
    if (milestonesWithDates.length === 0) {
      return { timelineData: [], startDate: new Date(), monthsCount: 12, phases: [], hasData: false };
    }

    const dates = milestonesWithDates.map(m => new Date(m.target_date!));
    const minMilestoneDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime()))));
    const maxMilestoneDate = startOfMonth(new Date(Math.max(...dates.map(d => d.getTime()))));
    
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    if (zoomLevel === "all") {
      // Show all milestones with padding
      startDate = addMonths(minMilestoneDate, -1);
      endDate = addMonths(maxMilestoneDate, 2);
    } else {
      // Zoom levels centered around today
      const monthsToShow = zoomLevel === "3m" ? 3 : zoomLevel === "6m" ? 6 : zoomLevel === "1y" ? 12 : 24;
      startDate = subMonths(startOfMonth(today), Math.floor(monthsToShow / 3));
      endDate = addMonths(startOfMonth(today), Math.ceil(monthsToShow * 2 / 3));
    }

    const monthsCount = Math.max(differenceInMonths(endDate, startDate), 3);

    // Group by phase
    const phases = [...new Set(milestonesWithDates.map(m => m.phase))];
    
    const timelineData = phases.map(phase => ({
      phase,
      milestones: milestonesWithDates
        .filter(m => m.phase === phase)
        .map(m => {
          const position = differenceInMonths(new Date(m.target_date!), startDate) / monthsCount * 100;
          return {
            ...m,
            position,
            isVisible: position >= -5 && position <= 105,
          };
        })
        .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime()),
    }));

    return { timelineData, startDate, monthsCount, phases, hasData: true };
  }, [milestones, zoomLevel]);

  // Generate month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    const step = Math.max(1, Math.floor(monthsCount / 12));
    for (let i = 0; i <= monthsCount; i += step) {
      const date = addMonths(startDate, i);
      labels.push({
        label: format(date, monthsCount <= 6 ? "MMM yyyy" : "MMM yy"),
        position: (i / monthsCount) * 100,
      });
    }
    return labels;
  }, [startDate, monthsCount]);

  const today = new Date();
  const todayPosition = differenceInMonths(today, startDate) / monthsCount * 100;
  const showTodayMarker = todayPosition >= 0 && todayPosition <= 100;

  const handleZoomIn = () => {
    const levels: ZoomLevel[] = ["all", "2y", "1y", "6m", "3m"];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      setZoomLevel(levels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const levels: ZoomLevel[] = ["all", "2y", "1y", "6m", "3m"];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(levels[currentIndex - 1]);
    }
  };

  if (!hasData) {
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
        {/* Zoom controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleZoomOut}
                    disabled={zoomLevel === "all"}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleZoomIn}
                    disabled={zoomLevel === "3m"}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoomLevel("all")}
                    disabled={zoomLevel === "all"}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fit all</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-1">
            {(Object.keys(zoomLabels) as ZoomLevel[]).map((level) => (
              <Button
                key={level}
                variant={zoomLevel === level ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setZoomLevel(level)}
              >
                {zoomLabels[level]}
              </Button>
            ))}
          </div>
        </div>

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
        {showTodayMarker && (
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
        )}

        {/* Phase rows */}
        <TooltipProvider>
          <div className="space-y-4">
            {timelineData.map((phaseData) => {
              const visibleMilestones = phaseData.milestones.filter(m => m.isVisible);
              
              return (
                <div key={phaseData.phase} className="relative">
                  {/* Phase label */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: phaseColorMap[phaseData.phase] || "hsl(var(--muted-foreground))" }}
                    />
                    <span className="text-sm font-medium">{phaseData.phase}</span>
                    {visibleMilestones.length !== phaseData.milestones.length && (
                      <span className="text-xs text-muted-foreground">
                        ({visibleMilestones.length}/{phaseData.milestones.length} visible)
                      </span>
                    )}
                  </div>

                  {/* Timeline bar */}
                  <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
                    {/* Phase duration bar */}
                    {visibleMilestones.length > 0 && (
                      <div
                        className="absolute h-full rounded-lg opacity-20"
                        style={{
                          left: `${Math.max(0, Math.min(...visibleMilestones.map(m => m.position)))}%`,
                          right: `${Math.max(0, 100 - Math.max(...visibleMilestones.map(m => m.position)))}%`,
                          backgroundColor: phaseColorMap[phaseData.phase] || "hsl(var(--muted-foreground))",
                        }}
                      />
                    )}

                    {/* Milestone markers */}
                    {visibleMilestones.map((milestone) => (
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
                              left: `${Math.max(2, Math.min(98, milestone.position))}%`,
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
              );
            })}
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
