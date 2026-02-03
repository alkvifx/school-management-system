'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { cmsService } from '@/src/services/cms.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSkeleton, TableSkeleton } from '@/src/components/LoadingSkeleton';
import { Textarea } from '@/components/ui/textarea';

export default function PagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublished: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await cmsService.getPages();
      setPages(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (page = null) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title || '',
        content: page.content || '',
        isPublished: page.isPublished || false,
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        content: '',
        isPublished: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPage) {
        await cmsService.updatePage(editingPage._id || editingPage.id, formData);
        toast.success('Page updated successfully');
      } else {
        await cmsService.createPage(formData);
        toast.success('Page created successfully');
      }
      setDialogOpen(false);
      fetchPages();
    } catch (error) {
      toast.error(error.message || 'Failed to save page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await cmsService.deletePage(pageToDelete._id || pageToDelete.id);
      toast.success('Page deleted successfully');
      setDeleteDialogOpen(false);
      setPageToDelete(null);
      fetchPages();
    } catch (error) {
      toast.error(error.message || 'Failed to delete page');
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Website Pages</h1>
            <p className="text-gray-600 mt-1">Manage your website pages</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : pages.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No pages found"
            description="Create your first page to get started"
            actionLabel="Create Page"
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Pages</CardTitle>
              <CardDescription>Manage and publish your website pages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page._id || page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-gray-600">{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                          {page.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPageToDelete(page);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
              <DialogDescription>
                {editingPage ? 'Update page content' : 'Add a new page to your website'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                {formData.title && (
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: {formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="content">Content (HTML)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter HTML content. For rich text editing, use a WYSIWYG editor.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="isPublished">Publish immediately</Label>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingPage ? 'Update Page' : 'Create Page'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Page"
          description={`Are you sure you want to delete "${pageToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
        />
      </div>
    </ProtectedRoute>
  );
}
