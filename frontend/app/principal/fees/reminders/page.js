'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { principalService } from '@/src/services/principal.service';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Bell, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function FeeRemindersPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    targetType: 'all',
    classId: '',
    onlyDefaulters: false,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await principalService.getClasses();
      setClasses(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      setSending(true);
      const payload = {
        onlyDefaulters: formData.onlyDefaulters,
      };

      // Backend expects classId or studentId (not targetType)
      if (formData.targetType === 'class' && formData.classId) {
        payload.classId = formData.classId;
      }
      // If targetType is 'all', don't send classId or studentId

      const response = await feesService.sendFeeReminders(payload);
      setResult(response);
      setConfirmDialogOpen(false);
      toast.success(
        `Reminders sent: ${response.sent || 0} successful, ${response.failed || 0} failed`
      );
    } catch (error) {
      toast.error(error.message || 'Failed to send reminders');
    } finally {
      setSending(false);
    }
  };

  const canSend = () => {
    if (formData.targetType === 'class' && !formData.classId) {
      return false;
    }
    return true;
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Reminders</h1>
          <p className="text-gray-600 mt-1">Send fee payment reminders to students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Fee Reminders</CardTitle>
            <CardDescription>
              Choose who should receive fee payment reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Target Audience</Label>
              <RadioGroup
                value={formData.targetType}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetType: value, classId: '' })
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Students
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="class" id="class" />
                  <Label htmlFor="class" className="font-normal cursor-pointer">
                    Class-wise
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.targetType === 'class' && (
              <div>
                <Label htmlFor="classId">Select Class</Label>
                {loading ? (
                  <div className="h-10 bg-gray-200 rounded animate-pulse mt-2" />
                ) : (
                  <Select
                    value={formData.classId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, classId: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id || cls.id} value={cls._id || cls.id}>
                          {cls.name}
                          {cls.section && ` - ${cls.section}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyDefaulters"
                checked={formData.onlyDefaulters}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, onlyDefaulters: checked })
                }
              />
              <Label htmlFor="onlyDefaulters" className="font-normal cursor-pointer">
                Only send to defaulters (students with pending fees)
              </Label>
            </div>

            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={!canSend() || sending}
              className="w-full"
              size="lg"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Reminders...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Send Reminders
                </>
              )}
            </Button>

            {result && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sent Successfully</span>
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {result.sent || 0}
                      </Badge>
                    </div>
                    {result.failed > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Failed</span>
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          {result.failed || 0}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Send Reminders</AlertDialogTitle>
              <AlertDialogDescription>
                {formData.targetType === 'all' ? (
                  <>
                    Send fee reminders to{' '}
                    <strong>
                      {formData.onlyDefaulters ? 'all defaulters' : 'all students'}
                    </strong>
                    ?
                  </>
                ) : (
                  <>
                    Send fee reminders to students in the selected class
                    {formData.onlyDefaulters && ' (defaulters only)'}?
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendReminders} disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
