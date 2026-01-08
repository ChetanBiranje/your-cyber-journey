import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card3D } from "@/components/Card3D";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Trash2, GripVertical } from "lucide-react";
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
  display_order: number;
}

interface DraggableMilestoneProps {
  milestone: Milestone;
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}

export function DraggableMilestone({ milestone, onToggle, onDelete }: DraggableMilestoneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card3D 
        variant={milestone.is_completed ? "glass" : "default"}
        className={cn(
          "relative !p-4",
          milestone.is_completed && "border-success/30",
          isDragging && "shadow-lg z-50"
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
          {/* Drag handle */}
          <button
            className="shrink-0 mt-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mt-0.5"
            onClick={() => onToggle(milestone.id, milestone.is_completed)}
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
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(milestone.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card3D>
    </div>
  );
}
