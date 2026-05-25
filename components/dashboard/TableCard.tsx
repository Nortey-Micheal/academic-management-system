'use client';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReactNode } from 'react';

interface TableCardProps {
  title: string;
  description?: string;
  headers: string[];
  children: ReactNode;
}

export function TableCard({
  title,
  description,
  headers,
  children,
}: TableCardProps) {
  return (
    <Card className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                {headers.map((header) => (
                  <TableHead
                    key={header}
                    className="text-slate-600 dark:text-slate-400"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
