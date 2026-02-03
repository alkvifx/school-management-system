'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function FeeStatusBadge({ status, className }) {
  const statusConfig = {
    PAID: {
      label: 'Paid',
      variant: 'default',
      className: 'bg-green-500 text-white hover:bg-green-600',
    },
    PARTIAL: {
      label: 'Partial',
      variant: 'secondary',
      className: 'bg-yellow-500 text-white hover:bg-yellow-600',
    },
    UNPAID: {
      label: 'Unpaid',
      variant: 'outline',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    OVERDUE: {
      label: 'Overdue',
      variant: 'destructive',
      className: 'bg-red-500 text-white hover:bg-red-600',
    },
  };

  const config = statusConfig[status] || statusConfig.UNPAID;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
