'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FeeSummaryCard } from '@/src/components/fees/FeeSummaryCard';
import { PaymentHistory } from '@/src/components/fees/PaymentHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/src/components/EmptyState';
import { Receipt, BookOpen, FileText, Bus, MoreHorizontal } from 'lucide-react';

function FeeBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fee Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FeeBreakdown({ components }) {
  if (!components || (components.tuitionFee == null && components.examFee == null && components.transportFee == null && components.otherFee == null)) {
    return null;
  }
  const items = [
    { key: 'tuitionFee', label: 'Tuition', amount: components.tuitionFee, icon: BookOpen },
    { key: 'examFee', label: 'Exam', amount: components.examFee, icon: FileText },
    { key: 'transportFee', label: 'Transport', amount: components.transportFee, icon: Bus },
    { key: 'otherFee', label: 'Other', amount: components.otherFee, icon: MoreHorizontal },
  ].filter((i) => Number(i.amount) > 0);

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fee Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(({ key, label, amount, icon: Icon }) => (
          <div key={key} className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <Icon className="h-4 w-4 text-gray-400" />
              {label}
            </span>
            <span className="font-medium">₹{Number(amount).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function StudentFeesPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await feesService.getMyFeeDetails();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch fee information');
      toast.error(err.message || 'Failed to fetch fee information');
      if (err.message?.includes('permission') || err.message?.includes('log in')) {
        setTimeout(() => router.push('/login'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasFeeData = data?.feeStructure && data?.payment;
  const feeDetails = hasFeeData
    ? {
        totalAmount: data.payment.totalAmount ?? 0,
        paidAmount: data.payment.paidAmount ?? 0,
        pendingAmount: data.payment.dueAmount ?? 0,
        lateFine: data.payment.lateFine ?? 0,
        status: data.payment.status ?? 'DUE',
        dueDate: data.dueDate ?? data.feeStructure?.dueDate,
        academicYear: data.academicYear ?? data.feeStructure?.academicYear,
      }
    : null;
  const payments = (data?.payment?.transactions || []).map((t) => ({
    ...t,
    paymentDate: t.paidAt,
    createdAt: t.paidAt,
  }));

  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Fees</h1>
          <p className="text-gray-600 mt-1">View your fee details and payment history</p>
          {data?.class && (
            <p className="text-sm text-gray-500 mt-1">Class: {data.class}</p>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeeBreakdownSkeleton />
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Receipt}
                title="Unable to Load Fees"
                description={error}
              />
            </CardContent>
          </Card>
        ) : !hasFeeData ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Receipt}
                title="Fee structure not assigned yet"
                description={data?.message || "Your fee information is not available yet. Please contact the school administration."}
              />
              {data?.academicYear && (
                <p className="text-sm text-gray-500 mt-2 text-center">Academic year: {data.academicYear}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FeeSummaryCard feeDetails={feeDetails} loading={false} />
              <PaymentHistory payments={payments} loading={false} />
            </div>
            {data.feeStructure?.components && (
              <FeeBreakdown components={data.feeStructure.components} />
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
