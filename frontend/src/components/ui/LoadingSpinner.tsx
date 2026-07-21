"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export function LoadingSpinner({ size = "md", text, className, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
