import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar text-xs font-medium", className)}
    >
      <Link 
        href="/" 
        className="text-muted-foreground/60 hover:text-primary transition-colors flex items-center"
      >
        <Home size={14} />
      </Link>
      
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight size={12} className="text-muted-foreground/30 shrink-0" />
          {item.path ? (
            <Link 
              href={item.path} 
              className="text-muted-foreground/60 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-bold">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
