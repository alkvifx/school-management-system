'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { superAdminService } from '@/src/services/superAdmin.service';
import { authService } from '@/src/services/auth.service';

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Plus,
  UserCog,
  Loader2,
  Link2,
  Trash2,
} from 'lucide-react';

import { toast } from 'sonner';

export default function PrincipalsPage() {
  const [principals, setPrincipals] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  const [step, setStep] = useState(1);

  const [assignData, setAssignData] = useState({
    principalId: '',
    schoolId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  if (resendTimer === 0) return;

  const interval = setInterval(() => {
    setResendTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [resendTimer]);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [principalsData, schoolsData] = await Promise.all([
        superAdminService.getPrincipals(),
        superAdminService.getSchools(),
      ]);
      setPrincipals(principalsData || []);
      setSchools(schoolsData || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrincipal = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    await superAdminService.createPrincipal({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    toast.success('OTP sent to email');
    setStep(2); // 🔥 move to OTP screen
  } catch (error) {
    toast.error(error.message || 'Failed to create principal');
  } finally {
    setSubmitting(false);
  }
};

const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    await authService.verifyEmailOTP(formData.email, formData.otp);

    toast.success('Principal verified successfully');
    setDialogOpen(false);
    setStep(1);
    setFormData({ name: '', email: '', password: '', otp: '' });
    fetchData();
  } catch (error) {
    toast.error(error.message || 'Invalid OTP');
  } finally {
    setSubmitting(false);
  }
};

const handleResendOtp = async () => {
  if (resendTimer > 0) return;

  try {
    setResending(true);

    await authService.resendEmailOTP(formData.email);

    toast.success('OTP resent to your email');
    setResendTimer(30); // ⏱ 30 sec cooldown
  } catch (error) {
    toast.error(error.message || 'Failed to resend OTP');
  } finally {
    setResending(false);
  }
};


  const handleAssignPrincipal = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await superAdminService.assignPrincipal(
        assignData.principalId,
        assignData.schoolId
      );
      toast.success('Principal assigned successfully');
      setAssignDialogOpen(false);
      setAssignData({ principalId: '', schoolId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to assign principal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrincipal = async (principalId) => {
    try {
      // 🔴 DELETE PRINCIPAL API WILL BE CALLED HERE
      // Example:
      // await superAdminService.deletePrincipal(principalId);

      toast.success('Principal deleted successfully (demo)');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete principal');
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Principals
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all principals in the system
            </p>
          </div>

          <div className="flex gap-2">
            {/* Assign Principal */}
            <Dialog
              open={assignDialogOpen}
              onOpenChange={setAssignDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Link2 className="mr-2 h-4 w-4" />
                  Assign Principal
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Assign Principal to School
                  </DialogTitle>
                  <DialogDescription>
                    Link a principal to a school
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleAssignPrincipal}
                  className="space-y-4"
                >
                  <div>
                    <Label>Principal</Label>
                    <Select
                      value={assignData.principalId}
                      onValueChange={(value) =>
                        setAssignData({
                          ...assignData,
                          principalId: value,
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select principal" />
                      </SelectTrigger>
                      <SelectContent>
                        {principals.map((principal) => (
                          <SelectItem
                            key={principal._id || principal.id}
                            value={principal._id || principal.id}
                          >
                            {principal.name} ({principal.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>School</Label>
                    <Select
                      value={assignData.schoolId}
                      onValueChange={(value) =>
                        setAssignData({
                          ...assignData,
                          schoolId: value,
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem
                            key={school._id || school.id}
                            value={school._id || school.id}
                          >
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      'Assign Principal'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Create Principal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Principal
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Principal</DialogTitle>
                  <DialogDescription>
                    Add a new principal to the system
                  </DialogDescription>
                </DialogHeader>

                {/* <form
                  onSubmit={handleCreatePrincipal}
                  className="space-y-4"
                >
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Principal'
                    )}
                  </Button>
                </form> */}
                <form
  onSubmit={step === 1 ? handleCreatePrincipal : handleVerifyOtp}
  className="space-y-4"
>
  {step === 1 && (
    <>
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
      </div>
    </>
  )}

  {step === 2 && (
  <div className="space-y-2">
    <Label>Verify OTP</Label>
    <Input
      value={formData.otp}
      onChange={(e) =>
        setFormData({ ...formData, otp: e.target.value })
      }
      placeholder="Enter 6 digit OTP"
      required
    />

    <div className="text-sm text-right">
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={resendTimer > 0 || resending}
        className="text-blue-600 hover:underline disabled:text-gray-400"
      >
        {resending
          ? 'Resending...'
          : resendTimer > 0
          ? `Resend OTP in ${resendTimer}s`
          : 'Resend OTP'}
      </button>
    </div>
  </div>
)}


  <Button type="submit" disabled={submitting} className="w-full">
    {submitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </>
    ) : step === 1 ? (
      'Send OTP'
    ) : (
      'Verify OTP'
    )}
  </Button>
</form>

              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          </div>
        ) : principals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCog className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                No principals found. Create your first principal.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principals.map((principal) => (
              <Card
                key={principal._id || principal.id}
                className="hover:shadow-lg transition-all"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      {principal.name}
                    </div>

                    {/* Delete Principal */}
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
                            Delete Principal?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete{' '}
                            <span className="font-semibold">
                              {principal.name}
                            </span>{' '}
                            and remove access from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeletePrincipal(
                                principal._id || principal.id
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

                  <CardDescription>
                    {principal.email}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Role:</span>{' '}
                      Principal
                    </p>
                    {principal.schoolId && (
                      <p className="text-gray-600">
                        <span className="font-medium">
                          School ID:
                        </span>{' '}
                        {principal.schoolId}
                      </p>
                    )}
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
