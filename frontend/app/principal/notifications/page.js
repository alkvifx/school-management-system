'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { notificationService } from '@/src/services/notification.service';
import { principalService } from '@/src/services/principal.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bell,
  Plus,
  Trash2,
  Loader2,
  Send,
  Users,
  Calendar,
  Filter,
  Search,
  Eye,
  Copy,
  CheckCircle2,
  Clock,
  Megaphone,
  ChevronRight,
  Sparkles,
  BadgeAlert,
  Shield,
  UserCog,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSkeleton, TableSkeleton } from '@/src/components/LoadingSkeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [notificationToPreview, setNotificationToPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: 'ALL',
    targetClass: '',
    priority: 'NORMAL',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notificationsData, classesData] = await Promise.all([
        notificationService.getSentNotifications(),
        principalService.getClasses(),
      ]);
      console.log(notificationsData);
      setNotifications(notificationsData.notifications || []);
      setClasses(classesData || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        targetRole: formData.targetRole,
        targetClass: formData.targetRole !== 'ALL' && formData.targetClass ? formData.targetClass : null,
        priority: formData.priority,
      };
      await notificationService.createNotification(payload);
      toast.success('🎉 Notification sent successfully!', {
        description: 'Your message has been delivered to all recipients.',
      });
      setDialogOpen(false);
      setFormData({
        title: '',
        message: '',
        targetRole: 'ALL',
        targetClass: '',
        priority: 'NORMAL',
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to send notification', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await notificationService.deleteNotification(
        notificationToDelete._id || notificationToDelete.id
      );
      toast.success('🗑️ Notification deleted', {
        description: 'The notification has been permanently removed.',
      });
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete notification', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', {
      position: 'bottom-right',
    });
  };

  const handlePreviewNotification = (notification) => {
    setNotificationToPreview(notification);
    setPreviewDialogOpen(true);
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      LOW: { label: 'Low', variant: 'outline', color: 'text-gray-600', bg: 'bg-gray-50' },
      NORMAL: { label: 'Normal', variant: 'secondary', color: 'text-blue-600', bg: 'bg-blue-50' },
      HIGH: { label: 'High', variant: 'default', color: 'text-orange-600', bg: 'bg-orange-50' },
      URGENT: { label: 'Urgent', variant: 'destructive', color: 'text-red-600', bg: 'bg-red-50' },
    };

    const config = priorityConfig[priority] || priorityConfig.NORMAL;

    return (
      <Badge variant={config.variant} className={`${config.bg} ${config.color} font-medium px-2 py-1`}>
        {priority === 'HIGH' && '🔥 '}
        {priority === 'URGENT' && '⚠️ '}
        {config.label}
      </Badge>
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'TEACHER':
        return <UserCog className="h-4 w-4" />;
      case 'STUDENT':
        return <GraduationCap className="h-4 w-4" />;
      case 'PRINCIPAL':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTargetDisplay = (notification) => {
    if (notification.targetRole === 'ALL') {
      return (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>All Users</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {getRoleIcon(notification.targetRole)}
        <span className="capitalize">{notification.targetRole.toLowerCase()}</span>
        {notification.targetClass && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">Specific Class</span>
          </>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'ALL' ||
      notification.priority === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <Megaphone className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">Notifications</h1>
                      <p className="text-blue-100 mt-1">Broadcast messages and announcements to your school</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {notifications.length} sent {notifications.length === 1 ? 'notification' : 'notifications'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                      <Send className="h-4 w-4" />
                      <span className="text-sm font-medium">Real-time delivery</span>
                    </div>
                  </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                      Compose Message
                      <Sparkles className="ml-2 h-4 w-4 text-orange-500" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Megaphone className="h-5 w-5 text-blue-600" />
                        </div>
                        <span>Send New Announcement</span>
                      </DialogTitle>
                      <DialogDescription>
                        Create a notification for your school community
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                          <BadgeAlert className="h-4 w-4" />
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter announcement title"
                          className="border-gray-300 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={5}
                          placeholder="Type your announcement message here..."
                          className="border-gray-300 focus:border-blue-500 min-h-[120px]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="targetRole">Target Audience</Label>
                          <Select
                            value={formData.targetRole}
                            onValueChange={(value) => setFormData({ ...formData, targetRole: value, targetClass: '' })}
                            required
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  All Users
                                </div>
                              </SelectItem>
                              <SelectItem value="TEACHER">
                                <div className="flex items-center gap-2">
                                  <UserCog className="h-4 w-4" />
                                  Teachers Only
                                </div>
                              </SelectItem>
                              <SelectItem value="STUDENT">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  Students Only
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority Level</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">📌 Low Priority</SelectItem>
                              <SelectItem value="NORMAL">📢 Normal Priority</SelectItem>
                              <SelectItem value="HIGH">🔥 High Priority</SelectItem>
                              <SelectItem value="URGENT">⚠️ Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {formData.targetRole !== 'ALL' && (
                        <div className="space-y-2">
                          <Label htmlFor="targetClass">Filter by Class (Optional)</Label>
                          <Select
                            value={formData.targetClass}
                            onValueChange={(value) => setFormData({ ...formData, targetClass: value })}
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select class (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL_CLASSES">All Classes</SelectItem>
                              {classes.map((classItem) => (
                                <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                                  {classItem.name} (Grade {classItem.grade} - {classItem.section})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <DialogFooter className="pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          className="border-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Broadcasting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Announcement
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 w-full"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-[180px] border-gray-300">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Priorities</SelectItem>
                      <SelectItem value="LOW">Low Priority</SelectItem>
                      <SelectItem value="NORMAL">Normal Priority</SelectItem>
                      <SelectItem value="HIGH">High Priority</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  className="border-gray-300"
                >
                  <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <EmptyState
                icon={Bell}
                title="No notifications found"
                description={
                  searchQuery || selectedFilter !== 'ALL'
                    ? "Try adjusting your search or filter criteria"
                    : "Send your first announcement to communicate with your school"
                }
                actionLabel="Create Announcement"
                onAction={() => setDialogOpen(true)}
                className="bg-white/80 backdrop-blur-sm"
              />
            </motion.div>
          ) : (
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Megaphone className="h-6 w-6 text-blue-600" />
                      Announcements History
                    </CardTitle>
                    <CardDescription>
                      {filteredNotifications.length} announcement{filteredNotifications.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    <Calendar className="mr-2 h-3 w-3" />
                    Real-time updates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="font-semibold">Announcement</TableHead>
                        <TableHead className="font-semibold">Target</TableHead>
                        <TableHead className="font-semibold">Priority</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredNotifications.map((notification) => (
                          <motion.tr
                            key={notification._id || notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="group hover:bg-gray-50/50 transition-colors border-b"
                          >
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="flex items-start gap-3">
                                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                                    <Megaphone className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                {getTargetDisplay(notification)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {getPriorityBadge(notification.priority || 'NORMAL')}
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                {formatDate(notification.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handlePreviewNotification(notification)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Preview</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleCopyToClipboard(notification.message)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy message</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                          setNotificationToDelete(notification);
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Dialog */}
          <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <span>Announcement Preview</span>
                </DialogTitle>
              </DialogHeader>

              {notificationToPreview && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {notificationToPreview.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          {getPriorityBadge(notificationToPreview.priority || 'NORMAL')}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {formatDate(notificationToPreview.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <Megaphone className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Audience:</span>
                        <span className="text-gray-700">
                          {notificationToPreview.targetRole === 'ALL'
                            ? 'All School Members'
                            : `${notificationToPreview.targetRole}s Only`
                          }
                          {notificationToPreview.targetClass && ' (Specific Class)'}
                        </span>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Message:</h4>
                        <div className="bg-white rounded-lg p-4 border shadow-sm">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {notificationToPreview.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleCopyToClipboard(notificationToPreview.message)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Message
                    </Button>
                    <Button
                      onClick={() => setPreviewDialogOpen(false)}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      Close Preview
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
            title="Delete Announcement"
            description={
              <div className="space-y-2">
                <p>Are you sure you want to delete this announcement?</p>
                {notificationToDelete && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <p className="font-medium text-red-800">{notificationToDelete.title}</p>
                    <p className="text-sm text-red-600 mt-1 line-clamp-2">{notificationToDelete.message}</p>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-3">This action cannot be undone.</p>
              </div>
            }
            confirmText="Delete"
            variant="destructive"
            confirmIcon={<Trash2 className="h-4 w-4" />}
          />
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}