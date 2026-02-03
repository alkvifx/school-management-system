'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/src/components/FileUpload';
import {
  Building2,
  Loader2,
  Save,
  MapPin,
  Phone,
  Mail,
  School,
  CheckCircle,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/src/components/LoadingSkeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export default function SchoolPage() {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    try {
      setLoading(true);
      const data = await principalService.getSchool();
      setSchool(data);
      setFormData({
        name: data?.name || '',
        address: data?.address || '',
        phone: data?.phone || '',
        email: data?.email || '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to fetch school');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setIsEdited(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await principalService.updateSchool({
        ...formData,
        logo: logoFile,
      });
      toast.success('School updated successfully');
      fetchSchool();
      setLogoFile(null);
      setIsEdited(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update school');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LoadingSkeleton className="h-96 w-full rounded-xl" />
            </div>
            <div>
              <LoadingSkeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">School Management</h1>
              <p className="text-gray-600 mt-1">Manage and update your school profile and information</p>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              <School className="h-4 w-4 mr-2" />
              Principal Access
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">School Profile</CardTitle>
                      <CardDescription>Update your school's public information</CardDescription>
                    </div>
                  </div>
                  {isEdited && (
                    <Badge variant="secondary" className="animate-pulse">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <School className="h-4 w-4" />
                        School Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter school name"
                      />
                      <p className="text-xs text-gray-500 mt-2">This will be displayed as your school's public name</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="h-11"
                          placeholder="school@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="h-11"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        School Address
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="h-11"
                        placeholder="123 Education Street, City, State ZIP"
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Logo Upload Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">School Logo</h3>
                        <p className="text-sm text-gray-600">Upload your school logo (Max 5MB, PNG or JPG)</p>
                      </div>
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors duration-300">
                      <FileUpload
                        label=""
                        accept="image/*"
                        maxSize={5}
                        currentFile={school?.logo?.url}
                        onFileSelect={(file) => {
                          setLogoFile(file);
                          setIsEdited(true);
                        }}
                      />
                    </div>

                    {school?.logo?.url && (
                      <div className="flex items-center gap-4 mt-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <img
                            src={school.logo.url}
                            alt="Current logo"
                            className="h-12 w-12 object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Logo</p>
                          <p className="text-xs text-gray-500">Click upload to replace</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          name: school?.name || '',
                          address: school?.address || '',
                          phone: school?.phone || '',
                          email: school?.email || '',
                        });
                        setIsEdited(false);
                      }}
                      disabled={!isEdited}
                    >
                      Discard Changes
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !isEdited}
                      className="min-w-[140px] bg-gradient-to-r from-blue-800 to-indigo-700 hover:from-blue-900 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="mr-1 h-4 w-4" />
                          Save All Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Preview Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>How your school appears</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                    {school?.logo?.url ? (
                      <img
                        src={school.logo.url}
                        alt="School logo"
                        className="h-20 w-20 object-contain"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-lg flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {formData.name || school?.name || 'School Name'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{formData.address || school?.address || 'School Address'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{formData.phone || school?.phone || 'Phone Number'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{formData.email || school?.email || 'Email Address'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            {/* <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">School Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-xs text-gray-600">Teachers</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-2xl font-bold text-indigo-600">0</p>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Statistics will appear here once you add teachers and students
                  </p>
                </div>
              </CardContent>
            </Card> */}

            {/* Help Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Quick Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                      Keep contact information up to date
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                      Use a high-quality logo for best display
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                      All changes are saved instantly
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}