'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { principalService } from '@/src/services/principal.service';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, User, IndianRupee, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/src/components/EmptyState';
import { format } from 'date-fns';
import { FeeStatusBadge } from '@/src/components/fees/FeeStatusBadge';

export default function CollectFeesPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMode: 'cash',
    referenceId: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.userId?.name?.toLowerCase().includes(query) ||
            s.rollNumber?.toString().includes(query) ||
            s.classId?.name?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await principalService.getStudents();
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setSelectedFee(null);
    try {
      setLoading(true);
      const fees = await feesService.getStudentFees(student._id || student.id);
      setStudentFees(fees || []);
      if (fees && fees.length > 0) {
        // Auto-select first unpaid/partial fee
        const unpaidFee = fees.find((f) => f.status !== 'PAID');
        if (unpaidFee) {
          setSelectedFee(unpaidFee);
        } else {
          setSelectedFee(fees[0]);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch student fees');
      setStudentFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedFee) {
      toast.error('Please select a student and fee record');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > selectedFee.pendingAmount) {
      toast.error(`Amount cannot exceed pending amount (₹${selectedFee.pendingAmount.toLocaleString('en-IN')})`);
      return;
    }

    if (!['cash', 'online', 'UPI', 'bank'].includes(formData.paymentMode)) {
      toast.error('Please select a valid payment mode');
      return;
    }

    try {
      setSubmitting(true);
      await feesService.collectFee(selectedFee._id || selectedFee.id, {
        amount,
        paymentMode: formData.paymentMode,
        referenceId: formData.referenceId || undefined,
      });

      toast.success('Fee collected successfully');
      
      // Refresh student fees
      const fees = await feesService.getStudentFees(selectedStudent._id || selectedStudent.id);
      setStudentFees(fees || []);
      
      // Update selected fee
      const updatedFee = fees.find((f) => (f._id || f.id) === (selectedFee._id || selectedFee.id));
      if (updatedFee) {
        setSelectedFee(updatedFee);
      }

      // Reset form
      setFormData({
        amount: '',
        paymentMode: 'cash',
        referenceId: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to collect fee');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Collection</h1>
          <p className="text-gray-600 mt-1">Collect fees from students manually</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Student</CardTitle>
                <CardDescription>Search by name, roll number, or class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={fetchStudents} disabled={loading} variant="outline">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {filteredStudents.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id || student.id}
                        onClick={() => handleSelectStudent(student)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedStudent?._id === student._id || selectedStudent?.id === student.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.userId?.name || student.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Roll: {student.rollNumber || 'N/A'} | Class:{' '}
                              {student.classId?.name || 'N/A'}
                              {student.classId?.section && ` - ${student.classId.section}`}
                            </p>
                          </div>
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Records */}
            {selectedStudent && studentFees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fee Records</CardTitle>
                  <CardDescription>Select a fee record to collect payment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentFees.map((fee) => (
                      <div
                        key={fee._id || fee.id}
                        onClick={() => setSelectedFee(fee)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFee?._id === fee._id || selectedFee?.id === fee.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {fee.academicYear || 'N/A'} - {fee.feeStructureId?.feeType || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Due: {fee.dueDate ? format(new Date(fee.dueDate), 'dd MMM yyyy') : 'N/A'}
                            </p>
                          </div>
                          <FeeStatusBadge status={fee.status} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-semibold">{formatCurrency(fee.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Paid</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(fee.paidAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Pending</p>
                            <p className="font-semibold text-amber-600">
                              {formatCurrency(fee.pendingAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fee Collection Form */}
            {selectedStudent && selectedFee && selectedFee.pendingAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Collect Payment</CardTitle>
                  <CardDescription>
                    Pending: {formatCurrency(selectedFee.pendingAmount)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        placeholder="Enter amount"
                        max={selectedFee.pendingAmount}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Max: {formatCurrency(selectedFee.pendingAmount)}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="paymentMode">Payment Mode *</Label>
                      <Select
                        value={formData.paymentMode}
                        onValueChange={(value) =>
                          setFormData({ ...formData, paymentMode: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="referenceId">Reference ID</Label>
                      <Input
                        id="referenceId"
                        value={formData.referenceId}
                        onChange={(e) =>
                          setFormData({ ...formData, referenceId: e.target.value })
                        }
                        placeholder="Transaction ID, Cheque No., etc. (optional)"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <IndianRupee className="h-4 w-4 mr-2" />
                          Collect Fee
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {selectedStudent && studentFees.length === 0 && (
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={CheckCircle}
                    title="No Fee Records"
                    description="This student has no fee records. Please initialize fees first."
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {selectedStudent && selectedFee && (
              <Card>
                <CardHeader>
                  <CardTitle>Fee Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-medium">
                      {selectedStudent.userId?.name || selectedStudent.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Roll: {selectedStudent.rollNumber || 'N/A'} | Class:{' '}
                      {selectedStudent.classId?.name || 'N/A'}
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold">{formatCurrency(selectedFee.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Amount</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(selectedFee.paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Amount</span>
                      <span className="font-semibold text-amber-600">
                        {formatCurrency(selectedFee.pendingAmount)}
                      </span>
                    </div>
                    {selectedFee.lateFineApplied > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Late Fine</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(selectedFee.lateFineApplied)}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedFee.paymentHistory && selectedFee.paymentHistory.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-900 mb-3">Payment History</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedFee.paymentHistory
                          .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
                          .map((payment, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {payment.paymentMode}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {format(new Date(payment.paidAt), 'dd MMM yyyy, hh:mm a')}
                              </p>
                              {payment.referenceId && (
                                <p className="text-xs text-gray-500">Ref: {payment.referenceId}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!selectedStudent && (
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={User}
                    title="Select a Student"
                    description="Search and select a student to view fee details and collect payment"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
