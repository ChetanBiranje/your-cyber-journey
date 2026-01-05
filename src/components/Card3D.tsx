import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "deep" | "glass";
  gradient?: "primary" | "cyber" | "success" | "warm" | "none";
  glow?: boolean;
  hover?: boolean;
  style?: CSSProperties;
}

export function Card3D({
  children,
  className,
  variant = "default",
  gradient = "none",
  glow = false,
  hover = true,
  style,
}: Card3DProps) {
  const variantClasses = {
    default: "card-3d",
    deep: "card-3d-deep",
    glass: "glass rounded-2xl",
  };

  const gradientClasses = {
    primary: "gradient-primary text-primary-foreground",
    cyber: "gradient-cyber text-secondary-foreground",
    success: "gradient-success text-success-foreground",
    warm: "gradient-warm text-warning-foreground",
    none: "",
  };

  const glowClasses = glow ? "glow-primary" : "";
  const hoverClasses = hover ? "" : "!transform-none";

  return (
    <div
      className={cn(
        variantClasses[variant],
        gradientClasses[gradient],
        glowClasses,
        hoverClasses,
        "p-6",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
