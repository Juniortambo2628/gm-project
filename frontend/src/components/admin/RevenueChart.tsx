"use client";

import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export interface RevenueSeriesPoint {
  month: string;
  year?: number;
  total: number;
}

interface RevenueChartProps {
  /** Monthly revenue series from the dashboard API, oldest month first. */
  series?: RevenueSeriesPoint[];
}

export default function RevenueChart({ series }: RevenueChartProps) {
  const revenueChartData = useMemo(
    () => (series ?? []).map((point) => ({ name: point.month, total: Number(point.total) || 0 })),
    [series]
  );

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={revenueChartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `£${value}`} />
        <Tooltip
          cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
          contentStyle={{ borderRadius: '12px', border: 'none', background: 'hsl(var(--card))', boxShadow: 'var(--shadow)', fontWeight: 'bold' }}
          formatter={(value) => [`£${Number(value).toLocaleString()}`, 'Revenue']}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
