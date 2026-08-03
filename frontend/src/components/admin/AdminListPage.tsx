"use client";

import { ReactNode } from "react";
import DashboardHero from "@/components/DashboardHero";
import { SkeletonList } from "@/components/ui/skeleton";

interface AdminListPageProps {
  title: string;
  description: string;
  children: ReactNode;
  isLoading?: boolean;
  action?: ReactNode;
}

export function AdminListPage({
  title,
  description,
  children,
  isLoading = false,
  action,
}: AdminListPageProps) {
  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <DashboardHero title={title} description={description} action={action} />

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonList count={4} variant="table-row" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">{children}</div>
      )}
    </div>
  );
}
