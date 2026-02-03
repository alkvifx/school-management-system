'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { toast } from 'sonner';
import { FeeSummaryCard } from '@/src/components/fees/FeeSummaryCard';
import { PaymentHistory } from '@/src/components/fees/PaymentHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/src/components/EmptyState';
import { Receipt } from 'lucide-react';

export default function StudentFeesPage() {
  const [feeDetails, setFeeDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const [details, history] = await Promise.all([
        feesService.getStudentFeeDetails(),
        feesService.getPaymentHistory(),
      ]);
      setFeeDetails(details);
      setPaymentHistory(history || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch fee information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Fees</h1>
          <p className="text-gray-600 mt-1">View your fee details and payment history</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        ) : !feeDetails ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Receipt}
                title="No Fee Information"
                description="Your fee information is not available yet. Please contact the school administration."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeeSummaryCard feeDetails={feeDetails} loading={loading} />
            <PaymentHistory payments={paymentHistory} loading={loading} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
