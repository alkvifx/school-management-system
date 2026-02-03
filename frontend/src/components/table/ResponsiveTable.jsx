'use client';

import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * ResponsiveTable - Shows as table on desktop, cards on mobile
 * @param {Array} columns - Array of { key, label, render } objects
 * @param {Array} data - Array of data objects
 * @param {Function} renderCard - Function to render custom card layout on mobile
 */
export function ResponsiveTable({ columns, data, renderCard, className }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Desktop Table View
  const TableView = () => (
    <div className="hidden lg:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || row._id || rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.cellClassName}>
                  {column.render ? column.render(row, rowIndex) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Mobile Card View
  const CardView = () => (
    <div className="lg:hidden space-y-4">
      {data.map((row, rowIndex) => {
        if (renderCard) {
          return (
            <motion.div
              key={row.id || row._id || rowIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
            >
              {renderCard(row, rowIndex)}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={row.id || row._id || rowIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
          >
            <Card className="p-4">
              <CardContent className="space-y-3 p-0">
                {columns.map((column) => (
                  <div key={column.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium text-gray-600 sm:w-1/3">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 sm:w-2/3 sm:text-right">
                      {column.render ? column.render(row, rowIndex) : row[column.key]}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      <TableView />
      <CardView />
    </div>
  );
}
