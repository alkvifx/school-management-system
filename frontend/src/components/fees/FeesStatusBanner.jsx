'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Clock, Receipt, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function FeesStatusBanner({ status, loading, onDismiss, className }) {
  const router = useRouter();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-lg border p-4 bg-gray-50 animate-pulse', className)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!status) {
    return null;
  }

  const { status: feeStatus, dueAmount, dueDate, lateFine, noStructure } = status;

  // Handle "no fee structure" case
  if (noStructure || (feeStatus === 'DUE' && dueAmount === 0 && !dueDate)) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'rounded-lg border p-4 shadow-sm bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
            className
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-full bg-gray-100">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="text-xs font-semibold bg-gray-500 text-white">
                    Fee structure not assigned yet
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-1 text-gray-900">
                  Your fee information is not available yet. Please contact the school administration.
                </p>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded-full hover:bg-black/5 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Determine banner style based on status
  const config = {
    PAID: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      text: 'text-green-900',
      badge: 'bg-green-500 text-white',
      message: 'Fees Paid',
      emoji: '✅',
    },
    PARTIAL: {
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
      border: 'border-amber-200',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      text: 'text-amber-900',
      badge: 'bg-amber-500 text-white',
      message: 'Partially Paid',
      emoji: '⚠️',
    },
    DUE: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      text: 'text-red-900',
      badge: 'bg-red-500 text-white',
      message: 'Fees Pending',
      emoji: '🔴',
    },
  };

  const style = config[feeStatus] || config.DUE;
  const Icon = style.icon;

  const handleViewFees = () => {
    router.push('/student/fees');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-lg border p-4 shadow-sm',
          style.bg,
          style.border,
          className
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn('p-2 rounded-full flex-shrink-0', style.iconBg)}>
              <Icon className={cn('h-5 w-5', style.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge className={cn('text-xs font-semibold', style.badge)}>
                  {style.message} {style.emoji}
                </Badge>
                {lateFine > 0 && (
                  <Badge variant="outline" className="text-xs border-red-300 text-red-700 whitespace-nowrap">
                    Late Fine: ₹{lateFine.toLocaleString('en-IN')}
                  </Badge>
                )}
              </div>
              <p className={cn('text-sm font-medium mb-1', style.text)}>
                {feeStatus === 'PAID' ? (
                  'All fees have been paid successfully.'
                ) : feeStatus === 'PARTIAL' ? (
                  <>
                    ₹{dueAmount.toLocaleString('en-IN')} remaining to be paid.
                  </>
                ) : (
                  <>
                    Pay ₹{dueAmount.toLocaleString('en-IN')} before{' '}
                    {dueDate ? format(new Date(dueDate), 'MMM dd, yyyy') : 'the due date'}.
                  </>
                )}
              </p>
              {dueDate && feeStatus !== 'PAID' && (
                <p className={cn('text-xs mt-1', style.text, 'opacity-75')}>
                  Due date: {format(new Date(dueDate), 'PPP')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
            {feeStatus === 'PAID' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewFees}
                className="text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                <Receipt className="h-4 w-4 mr-1" />
                View Receipt
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleViewFees}
                className={cn(
                  feeStatus === 'PARTIAL'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                )}
              >
                View Fees
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded-full hover:bg-black/5 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
