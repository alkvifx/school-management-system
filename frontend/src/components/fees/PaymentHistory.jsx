'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { EmptyState } from '@/src/components/EmptyState';
import { Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PaymentHistory({ payments, loading = false }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Receipt}
            title="No Payment History"
            description="No payment records found for this student."
          />
        </CardContent>
      </Card>
    );
  }

  const getPaymentModeBadge = (mode) => {
    const modes = {
      CASH: { label: 'Cash', className: 'bg-green-100 text-green-700' },
      ONLINE: { label: 'Online', className: 'bg-blue-100 text-blue-700' },
      CHEQUE: { label: 'Cheque', className: 'bg-purple-100 text-purple-700' },
      DD: { label: 'DD', className: 'bg-orange-100 text-orange-700' },
    };
    return modes[mode] || { label: mode, className: 'bg-gray-100 text-gray-700' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const modeConfig = getPaymentModeBadge(payment.paymentMode);
                return (
                  <TableRow key={payment._id || payment.id}>
                    <TableCell className="font-medium">
                      {format(new Date(payment.paymentDate || payment.createdAt), 'PPp')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{payment.amount?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', modeConfig.className)}>
                        {modeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {payment.referenceId || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500 text-white">
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
