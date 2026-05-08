import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconBlockProps {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  variant?: 'default' | 'solid';
}

export function IconBlock({ 
  icon: Icon, 
  className, 
  iconClassName,
  variant = 'default' 
}: IconBlockProps) {
  return (
    <div className={cn("icon-block", className)}>
      <Icon className={cn("", iconClassName)} />
    </div>
  );
}
