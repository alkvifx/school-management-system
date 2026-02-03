'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { superAdminService } from '@/src/services/superAdmin.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, UserCog, Loader2, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PrincipalsPage() {
  const [principals, setPrincipals] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [assignData, setAssignData] = useState({
    principalId: '',
    schoolId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      await superAdminService.createPrincipal(formData);
      toast.success('Principal created successfully');
      setDialogOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to create principal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPrincipal = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await superAdminService.assignPrincipal(assignData.principalId, assignData.schoolId);
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

  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Principals</h1>
            <p className="text-gray-600 mt-1">Manage all principals in the system</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Link2 className="mr-2 h-4 w-4" />
                  Assign Principal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Principal to School</DialogTitle>
                  <DialogDescription>Link a principal to a school</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignPrincipal} className="space-y-4">
                  <div>
                    <Label htmlFor="principal">Principal</Label>
                    <Select
                      value={assignData.principalId}
                      onValueChange={(value) => setAssignData({ ...assignData, principalId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select principal" />
                      </SelectTrigger>
                      <SelectContent>
                        {principals.map((principal) => (
                          <SelectItem key={principal._id || principal.id} value={principal._id || principal.id}>
                            {principal.name} ({principal.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="school">School</Label>
                    <Select
                      value={assignData.schoolId}
                      onValueChange={(value) => setAssignData({ ...assignData, schoolId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school._id || school.id} value={school._id || school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
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
                  <DialogDescription>Add a new principal to the system</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePrincipal} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                      'Create Principal'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
          </div>
        ) : principals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCog className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No principals found. Create your first principal.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principals.map((principal) => (
              <Card key={principal._id || principal.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    {principal.name}
                  </CardTitle>
                  <CardDescription>{principal.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Role:</span> Principal
                    </p>
                    {principal.schoolId && (
                      <p className="text-gray-600">
                        <span className="font-medium">School ID:</span> {principal.schoolId}
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
