'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { superAdminService } from '@/src/services/superAdmin.service';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Plus, School, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getSchools();
      setSchools(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
  const { name, address, phone, email } = formData;

  // Name validation
  if (!name.trim() || name.trim().length < 3) {
    toast.error('School name must be at least 3 characters long');
    return false;
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    toast.error('School name can only contain letters and numbers');
    return false;
  }

  // Address validation
  if (!address.trim() || address.trim().length < 5) {
    toast.error('Address must be at least 5 characters long');
    return false;
  }

  // Phone validation (Indian mobile numbers)
  if (!/^[6-9]\d{9}$/.test(phone)) {
    toast.error('Enter a valid 10-digit mobile number');
    return false;
  }

  // Email validation
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    toast.error('Enter a valid email address');
    return false;
  }

  return true;
};


const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔐 Frontend validation
  if (!validateForm()) return;

  setSubmitting(true);

  try {
    await superAdminService.createSchool(formData);
    toast.success('School created successfully');
    setDialogOpen(false);
    setFormData({ name: '', address: '', phone: '', email: '' });
    fetchSchools();
  } catch (error) {
    toast.error(error.message || 'Failed to create school');
  } finally {
    setSubmitting(false);
  }
};

  const handleDeleteSchool = async (schoolId) => {
    try {
      // 🔴 DELETE SCHOOL API WILL BE CALLED HERE
      // Example:
      // await superAdminService.deleteSchool(schoolId);

      toast.success('School deleted successfully (demo)');
      fetchSchools();
    } catch (error) {
      toast.error(error.message || 'Failed to delete school');
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
            <p className="text-gray-600 mt-1">
              Manage all schools in the system
            </p>
          </div>

          {/* Create School Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create School
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New School</DialogTitle>
                <DialogDescription>
                  Add a new school to the system
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">School Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: value });
                    }}
                    required
                  />

                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                 <Input
                        id="email"
                        type="email"
                        placeholder="school@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />

                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create School'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          </div>
        ) : schools.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <School className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                No schools found. Create your first school.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Card
                key={school._id || school.id}
                className="hover:shadow-lg transition-all"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <School className="h-5 w-5" />
                      {school.name}
                    </div>

                    {/* Delete School */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete School?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete
                            <span className="font-semibold">
                              {' '}
                              {school.name}{' '}
                            </span>
                            and all related data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteSchool(
                                school._id || school.id
                              )
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Yes, Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardTitle>

                  <CardDescription>{school.address}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span>{' '}
                      {school.phone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span>{' '}
                      {school.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
