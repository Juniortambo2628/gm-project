"use client";

import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface RevenueChartProps {
  revenue: number;
}

export default function RevenueChart({ revenue }: RevenueChartProps) {
  const revenueChartData = useMemo(() => {
    return [
      { name: "Jan", total: 0 },
      { name: "Feb", total: 0 },
      { name: "Mar", total: 0 },
      { name: "Apr", total: revenue },
      { name: "May", total: 0 },
      { name: "Jun", total: 0 },
    ];
  }, [revenue]);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={350}>
      <BarChart data={revenueChartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
        <Tooltip 
          cursor={{fill: 'hsl(var(--primary)/0.05)'}} 
          contentStyle={{ borderRadius: '12px', border: 'none', background: 'hsl(var(--card))', boxShadow: 'var(--shadow)', fontWeight: 'bold' }} 
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
