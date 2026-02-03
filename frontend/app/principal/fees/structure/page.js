'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { principalService } from '@/src/services/principal.service';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Receipt,
  IndianRupee,
  Calendar,
  BookOpen,
  Filter,
  RefreshCw,
  Search,
  AlertCircle,
  ChevronRight,
  Eye,
  Download,
  Copy,
  MoreVertical,
} from 'lucide-react';
import { EmptyState } from '@/src/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function FeeStructurePage() {
  const DEFAULT_COMPONENTS = [
    { name: 'Tuition Fee', amount: '', description: '' },
    { name: 'Examination Fee', amount: '', description: '' },
    { name: 'Transport Fee', amount: '', description: '' },
    { name: 'Other Fee', amount: '', description: '' },
  ];

  const [structures, setStructures] = useState([]);
  const [filteredStructures, setFilteredStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [editingStructure, setEditingStructure] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    classId: '',
    academicYear: new Date().getFullYear().toString(),
    feeType: 'YEARLY',
    components: DEFAULT_COMPONENTS,
    dueDate: '',
    lateFinePerDay: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStructures();
  }, [structures, activeTab, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [structuresData, classesData] = await Promise.all([
        feesService.getFeeStructures(),
        principalService.getClasses(),
      ]);
      setStructures(structuresData || []);
      setFilteredStructures(structuresData || []);
      setClasses(classesData || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filterStructures = () => {
    let filtered = structures;

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(structure =>
        activeTab === 'active' ? structure.isActive === true : structure.isActive === false
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(structure => {
        const className = getClassName(structure.classId).toLowerCase();
        const academicYear = structure.academicYear?.toLowerCase() || '';
        const feeType = structure.feeType?.toLowerCase() || '';

        return (
          className.includes(term) ||
          academicYear.includes(term) ||
          feeType.includes(term)
        );
      });
    }

    setFilteredStructures(filtered);
  };

  const handleAddComponent = () => {
    setFormData({
      ...formData,
      components: [...formData.components, { name: '', amount: '', description: '' }],
    });
  };

  const handleRemoveComponent = (index) => {
    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index),
    });
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...formData.components];
    updated[index][field] = value;
    setFormData({ ...formData, components: updated });
  };

  const calculateTotal = () => {
    return formData.components.reduce(
      (sum, comp) => sum + (parseFloat(comp.amount) || 0),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.classId) {
      toast.error('Please select a class');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    if (calculateTotal() === 0) {
      toast.error('Please add at least one fee component with amount');
      return;
    }

    try {
      // Convert components array to proper format for backend
      // Backend expects array with name and amount
      const componentsArray = formData.components
        .filter((c) => c.name && c.amount)
        .map((comp) => ({
          name: comp.name, // Keep original name, backend will normalize
          amount: parseFloat(comp.amount) || 0,
        }));

      const payload = {
        classId: formData.classId,
        academicYear: formData.academicYear,
        feeType: formData.feeType,
        components: componentsArray, // Send as array
        dueDate: formData.dueDate,
        lateFinePerDay: parseFloat(formData.lateFinePerDay) || 0,
      };

      if (editingStructure) {
        await feesService.updateFeeStructure(editingStructure._id, payload);
        toast.success('Fee structure updated successfully', {
          description: `${getClassName(formData.classId)} - ${formData.academicYear}`,
        });
      } else {
        await feesService.createFeeStructure(payload);
        toast.success('Fee structure created successfully', {
          description: `${getClassName(formData.classId)} - ${formData.academicYear}`,
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save fee structure');
    }
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);

    // Convert object components to array format for form
    const componentsArray = structure.components
      ? Object.entries(structure.components)
          .filter(([key, value]) => value > 0) // Only show non-zero components
          .map(([key, value]) => {
            // Map backend keys to display names (must match DEFAULT_COMPONENTS)
            const nameMap = {
              tuitionFee: 'Tuition Fee',
              examFee: 'Examination Fee',
              transportFee: 'Transport Fee',
              otherFee: 'Other Fee',
            };
            const displayName = nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            return {
              name: displayName,
              amount: value?.toString() || '',
              description: '',
            };
          })
      : DEFAULT_COMPONENTS;
    
    // Ensure at least one component exists
    if (componentsArray.length === 0) {
      componentsArray.push({ name: 'Tuition Fee', amount: '', description: '' });
    }

    setFormData({
      classId: structure.classId?._id || structure.classId || '',
      academicYear: structure.academicYear || new Date().getFullYear().toString(),
      feeType: structure.feeType || 'YEARLY',
      components: componentsArray,
      dueDate: structure.dueDate
        ? format(new Date(structure.dueDate), 'yyyy-MM-dd')
        : '',
      lateFinePerDay: structure.lateFinePerDay?.toString() || '',
      description: structure.description || '',
      isActive: structure.isActive !== false,
    });

    setDialogOpen(true);
  };

  const handleToggleStatus = async (structureId, currentStatus) => {
    try {
      await feesService.toggleFeeStructureStatus(structureId, !currentStatus);
      toast.success(
        `Fee structure ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteClick = (structure) => {
    setStructureToDelete(structure);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!structureToDelete) return;

    try {
      await feesService.deleteFeeStructure(structureToDelete._id);
      toast.success('Fee structure deleted successfully');
      setDeleteDialogOpen(false);
      setStructureToDelete(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete fee structure');
    }
  };

  const resetForm = () => {
    setFormData({
      classId: '',
      academicYear: new Date().getFullYear().toString(),
      feeType: 'YEARLY',
      components: DEFAULT_COMPONENTS,
      dueDate: '',
      lateFinePerDay: '',
      description: '',
      isActive: true,
    });
    setEditingStructure(null);
  };

  const getClassName = (classData) => {
    if (!classData) return 'N/A';

    if (typeof classData === 'object') {
      return `${classData.name}${classData.section ? ` - ${classData.section}` : ''}`;
    }

    const classObj = classes.find(
      (c) => c._id === classData || c.id === classData
    );

    return classObj
      ? `${classObj.name}${classObj.section ? ` - ${classObj.section}` : ''}`
      : 'N/A';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getFeeTypeColor = (type) => {
    const colors = {
      MONTHLY: 'bg-blue-100 text-blue-800',
      QUARTERLY: 'bg-purple-100 text-purple-800',
      YEARLY: 'bg-amber-100 text-amber-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL, ROLES.ACCOUNTANT]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Fee Structure
              </h1>
              <p className="text-gray-600 mt-2">
                Create, manage, and track fee structures across classes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Structure
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by class, academic year, or fee type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all" className="text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="text-sm">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Structures</p>
                    <h3 className="text-2xl font-bold text-gray-900">{structures.length}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-green-50 border-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Structures</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {structures.filter(s => s.isActive).length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Classes</p>
                    <h3 className="text-2xl font-bold text-gray-900">{classes.length}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-amber-100">
                    <BookOpen className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Amount</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formatCurrency(
                        structures.reduce((sum, s) => {
                          const total = Object.values(s.components || {}).reduce((a, b) => a + (parseFloat(b) || 0), 0);
                          return sum + total;
                        }, 0) / (structures.length || 1)
                      )}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <IndianRupee className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredStructures.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8">
              <EmptyState
                icon={Receipt}
                title={searchTerm ? "No matching structures found" : "No fee structures"}
                description={
                  searchTerm
                    ? "Try adjusting your search criteria"
                    : "Create your first fee structure to get started"
                }
                actionLabel="Create Fee Structure"
                onAction={() => setDialogOpen(true)}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Fee Structures</CardTitle>
              <CardDescription>
                Showing {filteredStructures.length} of {structures.length} structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Details</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Components</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStructures.map((structure) => {
                      const totalAmount = Object.values(structure.components || {}).reduce(
                        (sum, amount) => sum + (parseFloat(amount) || 0),
                        0
                      );

                      const componentCount = Object.keys(structure.components || {}).length;

                      return (
                        <motion.tr
                          key={structure._id || structure.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-gray-50/50"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getClassName(structure.classId)}
                              </div>
                              {structure.description && (
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {structure.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {structure.academicYear}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getFeeTypeColor(structure.feeType)}>
                              {structure.feeType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-sm text-gray-600">
                                {componentCount} component{componentCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4 text-green-600" />
                              {formatCurrency(totalAmount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {structure.dueDate
                                  ? format(new Date(structure.dueDate), 'dd MMM yyyy')
                                  : '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={structure.isActive !== false}
                                onCheckedChange={() =>
                                  handleToggleStatus(
                                    structure._id || structure.id,
                                    structure.isActive !== false
                                  )
                                }
                                className="data-[state=checked]:bg-green-500"
                              />
                              <Badge variant="outline" className={getStatusColor(structure.isActive)}>
                                {structure.isActive !== false ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(structure)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Structure
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteClick(structure)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                {editingStructure ? 'Edit Fee Structure' : 'Create New Fee Structure'}
              </DialogTitle>
              <DialogDescription>
                Configure fee structure details and components
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classId" className="flex items-center gap-1">
                    Class <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => setFormData({ ...formData, classId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id || cls.id} value={cls._id || cls.id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{cls.name}{cls.section && ` - ${cls.section}`}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear" className="flex items-center gap-1">
                    Academic Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: e.target.value })
                    }
                    placeholder="e.g., 2024-2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeType" className="flex items-center gap-1">
                    Fee Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.feeType}
                    onValueChange={(value) => setFormData({ ...formData, feeType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                      <SelectItem value="TERM">Term-wise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-1">
                    Due Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lateFinePerDay">Late Fine Per Day (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="lateFinePerDay"
                      type="number"
                      step="0.01"
                      value={formData.lateFinePerDay}
                      onChange={(e) =>
                        setFormData({ ...formData, lateFinePerDay: e.target.value })
                      }
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <span className="text-sm">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional notes about this fee structure..."
                  rows={2}
                />
              </div>

              <Separator />

              {/* Fee Components */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Fee Components</Label>
                    <p className="text-sm text-gray-500">Add fee items and their amounts</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddComponent}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Component
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.components.map((component, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 border rounded-lg hover:border-blue-200 transition-colors">
                      <div className="md:col-span-5 space-y-1">
                        <Label htmlFor={`name-${index}`}>Component Name</Label>
                        <Input
                          id={`name-${index}`}
                          placeholder="e.g., Tuition Fee, Transportation, etc."
                          value={component.name}
                          onChange={(e) =>
                            handleComponentChange(index, 'name', e.target.value)
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="md:col-span-4 space-y-1">
                        <Label htmlFor={`amount-${index}`}>Amount (₹)</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id={`amount-${index}`}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={component.amount}
                            onChange={(e) =>
                              handleComponentChange(index, 'amount', e.target.value)
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveComponent(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={formData.components.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Total Amount</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This amount will be charged to each student in the selected class
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                  {editingStructure ? 'Update Structure' : 'Create Structure'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Delete Fee Structure
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the fee structure
                for{' '}
                <span className="font-semibold">
                  {structureToDelete && getClassName(structureToDelete.classId)}
                </span>{' '}
                ({structureToDelete?.academicYear}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}