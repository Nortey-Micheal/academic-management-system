'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subValue?: string;
}

export function DashboardCard({
  label,
  value,
  trend,
  trendValue,
  subValue,
}: DashboardCardProps) {
  return (
    <Card className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {subValue}
            </p>
          )}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up'
                ? 'text-green-600 dark:text-green-500'
                : trend === 'down'
                  ? 'text-red-600 dark:text-red-500'
                  : 'text-slate-500 dark:text-slate-500'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
