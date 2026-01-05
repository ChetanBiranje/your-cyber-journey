import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card3D } from "./Card3D";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  gradient?: "primary" | "cyber" | "success" | "warm" | "none";
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  gradient = "none",
  className,
  delay = 0,
}: StatCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card3D
      gradient={gradient}
      className={cn(
        "animate-slide-up opacity-0",
        className
      )}
      style={{ animationDelay: `${delay * 0.1}s` } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            gradient !== "none" ? "opacity-80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold mt-2 font-mono",
            gradient === "none" && "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-xs mt-1",
              gradient !== "none" ? "opacity-70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              gradient !== "none" ? "opacity-90" : trendColors[trend]
            )}>
              <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          gradient !== "none" 
            ? "bg-white/20" 
            : "bg-primary/10"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            gradient !== "none" ? "" : "text-primary"
          )} />
        </div>
      </div>
    </Card3D>
  );
}
