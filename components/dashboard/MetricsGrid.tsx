'use client';

import { DashboardCard } from './DashboardCard';
import { MetricCard } from '@/lib/types';

interface MetricsGridProps {
  metrics: MetricCard[];
  columns?: number;
}

export function MetricsGrid({ metrics, columns = 4 }: MetricsGridProps) {
  const gridColsClass = {
    1: 'grid-cols-2',
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }[columns] || 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid gap-4 ${gridColsClass}`}>
      {metrics.map((metric, index) => (
        <DashboardCard key={index} {...metric} />
      ))}
    </div>
  );
}
