'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, Loader2, AlertCircle, ChevronRight, Receipt, Filter } from 'lucide-react';
import { EmptyState } from '@/src/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export default function InitializeFeesPage() {
  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState('');
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedStructureDetails, setSelectedStructureDetails] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchStructures();
  }, []);

  useEffect(() => {
    // Update selected structure details when selection changes
    if (selectedStructure) {
      const structure = structures.find((s) => (s._id || s.id) === selectedStructure);
      setSelectedStructureDetails(structure || null);
    } else {
      setSelectedStructureDetails(null);
    }
  }, [selectedStructure, structures]);

  const fetchStructures = async () => {
  try {
    setLoading(true);
    const data = await feesService.getFeeStructures({});
    setStructures(data || []); // 👈 NO FILTER HERE
  } catch (error) {
    toast.error(error.message || 'Failed to fetch fee structures');
    setStructures([]);
  } finally {
    setLoading(false);
  }
};


  const handleInitialize = async () => {
    if (!selectedStructure) {
      toast.error('Please select a fee structure');
      return;
    }

    try {
      setInitializing(true);
      const result = await feesService.initializeStudentFees(selectedStructure);

      // Backend returns: { success: true, message: "...", data: { count: X, studentFees: [...] } }
      const count = result?.count || result?.data?.count || 0;
      
      toast.success(
        `Successfully initialized fees for ${count} students`,
        {
          description: `Fee structure: ${getStructureName(selectedStructure)}`
        }
      );

      setConfirmDialogOpen(false);
      setSelectedStructure('');
      setSelectedStructureDetails(null);
      fetchStructures(); // Refresh structures
    } catch (error) {
      toast.error(error.message || 'Failed to initialize fees', {
        description: 'Please try again or contact support'
      });
    } finally {
      setInitializing(false);
    }
  };

  const getStructureName = (structureId) => {
    const structure = structures.find((s) => (s._id || s.id) === structureId);
    if (!structure) return 'Fee Structure';

    const className = structure.classId?.name ?
      `${structure.classId.name}${structure.classId?.section ? ` ${structure.classId.section}` : ''}` :
      'Class';

    return `${className} - ${structure.academicYear || 'N/A'} (${structure.feeType || 'General'})`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getFilteredStructures = () => {
  if (filter === 'all') return structures;

  return structures.filter(structure =>
    filter === 'active'
      ? structure.isActive === true
      : structure.isActive === false
  );
};


  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL, ROLES.ACCOUNTANT]}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Initialize Student Fees</h1>
              <p className="text-gray-600 mt-1 sm:mt-2">
                Initialize fee records for students based on selected fee structure
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchStructures}
              disabled={loading}
              className="self-start sm:self-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Refresh
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'active', 'inactive'].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption)}
                className="capitalize whitespace-nowrap"
              >
                <Filter className="h-3 w-3 mr-2" />
                {filterOption === 'all' ? 'All Structures' :
                 filterOption === 'active' ? 'Active' : 'Inactive'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Fee Structure Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Select Fee Structure</CardTitle>
              <CardDescription>
                Choose a fee structure to initialize fees for all students in that class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : getFilteredStructures().length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title={`No ${filter !== 'all' ? filter : ''} Fee Structures Found`}
                  description={
                    filter === 'active'
                      ? "Create an active fee structure first to initialize student fees"
                      : "No fee structures found matching your filter"
                  }
                  actionLabel={filter !== 'all' ? 'Show All Structures' : undefined}
                  onAction={filter !== 'all' ? () => setFilter('all') : undefined}
                />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fee-structure-select">Fee Structure</Label>
                    <Select
                      value={selectedStructure}
                      onValueChange={setSelectedStructure}
                      disabled={initializing}
                    >
                      <SelectTrigger id="fee-structure-select">
                        <SelectValue placeholder="Select fee structure" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {getFilteredStructures().map((structure) => (
                          <SelectItem
                            key={structure._id || structure.id}
                            value={structure._id || structure.id}
                            disabled={!structure.isActive}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">
                                {getStructureName(structure._id || structure.id)}
                              </span>
                              {!structure.isActive && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStructure && selectedStructureDetails && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Structure Details</h3>
                        <Badge
                          variant={selectedStructureDetails.isActive ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {selectedStructureDetails.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Class</p>
                          <p className="font-medium">
                            {selectedStructureDetails.classId?.name || 'N/A'}
                            {selectedStructureDetails.classId?.section &&
                              ` - Section ${selectedStructureDetails.classId.section}`}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Academic Year</p>
                          <p className="font-medium">{selectedStructureDetails.academicYear || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Fee Type</p>
                          <p className="font-medium">{selectedStructureDetails.feeType || 'General'}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(selectedStructureDetails.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          className="w-full"
                          onClick={() => setConfirmDialogOpen(true)}
                          disabled={initializing || !selectedStructureDetails.isActive}
                          size="lg"
                        >
                          {initializing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Initializing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Initialize Fees
                            </>
                          )}
                        </Button>

                        {!selectedStructureDetails.isActive && (
                          <p className="text-sm text-amber-600 mt-2 text-center">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            This fee structure is inactive and cannot be used for initialization
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Information Panel */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Student Coverage</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Fees will be initialized for all students in the selected class
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Automatic Creation</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Individual fee records will be created for each student
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Important Notes</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
                      <li>Only active fee structures can be used</li>
                      <li>Existing fees for the same period won't be duplicated</li>
                      <li>Process may take a few minutes for large classes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  Contact your system administrator if you encounter issues or need to initialize fees for multiple classes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Confirm Fee Initialization
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 pt-2">
                <p>
                  You are about to initialize fees for <span className="font-semibold">all students</span> in:
                </p>
                {selectedStructureDetails && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{getStructureName(selectedStructure)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Class: {selectedStructureDetails.classId?.name || 'N/A'}
                      {selectedStructureDetails.classId?.section &&
                        ` (Section ${selectedStructureDetails.classId.section})`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Amount: {formatCurrency(selectedStructureDetails.totalAmount)}
                    </p>
                  </div>
                )}
                <p className="text-amber-600 font-medium">
                  This action cannot be undone. Please confirm to proceed.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={initializing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleInitialize}
                disabled={initializing}
                className="bg-green-600 hover:bg-green-700"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Confirm & Initialize'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}