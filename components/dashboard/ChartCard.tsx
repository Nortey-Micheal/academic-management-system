'use client';

import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <Card className={`p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </Card>
  );
}
