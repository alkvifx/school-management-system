'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeeStatusBadge } from './FeeStatusBadge';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function FeeSummaryCard({ feeDetails, loading = false }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feeDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No fee information available</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalAmount = 0,
    paidAmount = 0,
    pendingAmount = 0,
    lateFine = 0,
    status = 'UNPAID',
    dueDate,
    academicYear,
  } = feeDetails;

  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'PAID';
  const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fee Summary</CardTitle>
          <FeeStatusBadge status={isOverdue ? 'OVERDUE' : status} />
        </div>
        {academicYear && (
          <p className="text-sm text-gray-500 mt-1">Academic Year: {academicYear}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{paidAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Pending Amount</p>
            <p className="text-2xl font-bold text-red-600">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </p>
          </div>
          {lateFine > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Late Fine</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{lateFine.toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment Progress</span>
            <span className="font-medium">{paidPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all',
                paidPercentage === 100
                  ? 'bg-green-500'
                  : paidPercentage > 0
                  ? 'bg-yellow-500'
                  : 'bg-gray-300'
              )}
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        {/* Due Date */}
        {dueDate && (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg',
              isOverdue
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            )}
          >
            {isOverdue ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Calendar className="h-5 w-5 text-blue-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {isOverdue ? 'Overdue' : 'Due Date'}
              </p>
              <p
                className={cn(
                  'text-sm',
                  isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
                )}
              >
                {format(new Date(dueDate), 'PPP')}
              </p>
            </div>
          </div>
        )}

        {/* Status Icons */}
        <div className="flex items-center gap-4 pt-2 border-t">
          {status === 'PAID' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Fully Paid</span>
            </div>
          )}
          {status === 'PARTIAL' && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Partially Paid</span>
            </div>
          )}
          {(status === 'UNPAID' || status === 'DUE') && (
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Payment Pending</span>
            </div>
          )}
          {status === 'OVERDUE' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
