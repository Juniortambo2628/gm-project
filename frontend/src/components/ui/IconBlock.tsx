import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconBlockProps {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export function IconBlock({ 
  icon: Icon, 
  className, 
  iconClassName
}: IconBlockProps) {
  return (
    <div className={cn("icon-block", className)}>
      <Icon className={cn("", iconClassName)} />
    </div>
  );
}
