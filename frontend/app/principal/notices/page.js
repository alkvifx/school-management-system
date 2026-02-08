'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { noticeService } from '@/src/services/notice.service';
import { principalService } from '@/src/services/principal.service';
import { cmsService } from '@/src/services/cms.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Megaphone, Plus, Loader2, Pin, Trash2, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const TARGET_OPTIONS = [
  { value: 'all_students', label: 'All Students', targetRole: 'STUDENT' },
  { value: 'all_teachers', label: 'All Teachers', targetRole: 'TEACHER' },
  { value: 'class', label: 'Select Class', targetRole: 'STUDENT' },
  { value: 'student', label: 'Select Student', targetRole: 'STUDENT' },
  { value: 'teacher', label: 'Select Teacher', targetRole: 'TEACHER' },
];

export default function PrincipalNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);

  const fetchNotices = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await noticeService.getMyNotices({ page, limit: 20 });
      setNotices(data.notices || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to load notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const loadDropdownData = useCallback(async () => {
    setListsLoading(true);
    try {
      const [classesRes, studentsRes, teachersRes] = await Promise.all([
        principalService.getClasses(),
        principalService.getStudents(),
        principalService.getTeachers(),
      ]);
      setClasses(Array.isArray(classesRes) ? classesRes : []);
      setStudents(Array.isArray(studentsRes) ? studentsRes : []);
      setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
    } catch (e) {
      toast.error('Failed to load classes/students/teachers');
    } finally {
      setListsLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await noticeService.deleteNotice(id);
      setNotices((prev) => prev.filter((n) => (n._id || n.id) !== id));
      toast.success('Notice deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete notice');
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create and manage announcements</p>
          </div>
          <Button
            onClick={() => {
              loadDropdownData();
              setModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Notice
          </Button>
        </div>

        <CreateNoticeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSuccess={() => {
            setModalOpen(false);
            fetchNotices(1);
            toast.success('Notice sent successfully');
          }}
          classes={classes}
          students={students}
          teachers={teachers}
          listsLoading={listsLoading}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Sent notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No notices yet. Create one to get started.</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {notices.map((notice, i) => (
                      <motion.div
                        key={notice._id || notice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-start justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900">{notice.title}</span>
                            {notice.isImportant && (
                              <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800">
                                <Pin className="h-3 w-3" /> Important
                              </Badge>
                            )}
                            {notice.classId && (
                              <Badge variant="outline" className="text-xs">
                                Class
                              </Badge>
                            )}
                            {notice.studentId && (
                              <Badge variant="outline" className="text-xs">
                                Student
                              </Badge>
                            )}
                            {notice.teacherId && (
                              <Badge variant="outline" className="text-xs">
                                Teacher
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notice.message}</p>
                          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(notice.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(notice._id || notice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {pagination.pages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchNotices(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-2 text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchNotices(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

function CreateNoticeModal({
  open,
  onOpenChange,
  onSuccess,
  classes,
  students,
  teachers,
  listsLoading,
}) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all_students');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setMessage('');
    setTargetType('all_students');
    setClassId('');
    setStudentId('');
    setTeacherId('');
    setIsImportant(false);
    setAttachments([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (targetType === 'class' && !classId) {
      toast.error('Please select a class');
      return;
    }
    if (targetType === 'student' && !studentId) {
      toast.error('Please select a student');
      return;
    }
    if (targetType === 'teacher' && !teacherId) {
      toast.error('Please select a teacher');
      return;
    }
    const opt = TARGET_OPTIONS.find((o) => o.value === targetType);
    const targetRole = opt?.targetRole || 'STUDENT';
    const payload = {
      title: title.trim(),
      message: message.trim(),
      targetRole,
      isImportant,
      attachments: attachments.length ? attachments : undefined,
    };
    if (targetType === 'class' && classId) payload.classId = classId;
    if (targetType === 'student' && studentId) payload.studentId = studentId;
    if (targetType === 'teacher' && teacherId) payload.teacherId = teacherId;

    setSubmitting(true);
    try {
      await noticeService.createNotice(payload);
      reset();
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await cmsService.uploadMedia(file);
      const url = data?.url || data?.secure_url || data?.path;
      if (url) {
        setAttachments((prev) => [...prev, url]);
        toast.success('Attachment added');
      } else {
        toast.error('Upload succeeded but no URL returned');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Create Notice
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notice message..."
              rows={4}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label>Send to</Label>
            <Select value={targetType} onValueChange={setTargetType} disabled={listsLoading}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {targetType === 'class' && (
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id || c.id} value={(c._id || c.id).toString()}>
                      {c.name} {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {targetType === 'student' && (
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.userId || s.id)}>
                      {s.name} ({s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {targetType === 'teacher' && (
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={String(t.userId || t.id)}>
                      {t.name} ({t.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="important" checked={isImportant} onCheckedChange={setIsImportant} />
            <Label htmlFor="important" className="cursor-pointer">Mark as important</Label>
          </div>
          <div>
            <Label>Attachment (optional)</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  {uploading ? 'Uploading...' : 'Add file'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              {attachments.map((url, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[120px]">
                    Link
                  </a>
                  <button type="button" onClick={() => removeAttachment(i)} className="ml-1 hover:text-red-600">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Notice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
