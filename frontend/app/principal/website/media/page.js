'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { cmsService } from '@/src/services/cms.service';
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
import {
  Image,
  Upload,
  Trash2,
  Loader2,
  Search,
  Filter,
  Grid3x3,
  List,
  Eye,
  Copy,
  Download,
  Video,
  FileText,
  Music,
  Folder,
  Calendar,
  File,
  Check,
  X,
  Maximize2,
  Shield,
  HardDrive,
  Cloud,
  Zap,
  MoreVertical,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSkeleton } from '@/src/components/LoadingSkeleton';
import { FileUpload } from '@/src/components/FileUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import { formatDistanceToNow, formatBytes } from '@/src/utils/format';

export default function MediaPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bulkActions, setBulkActions] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    others: 0,
    totalSize: 0,
  });

  useEffect(() => {
    fetchMedia();
  }, [filterType]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const filters = filterType !== 'all' ? { type: filterType } : {};
      const res = await cmsService.getMedia(filters);

      console.log("MEDIA ARRAY:", res.media);
      const mediaArray = Array.isArray(res.media) ? res.media : [];
      setMedia(mediaArray);

      // Calculate statistics
      calculateStats(mediaArray);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch media');
      setMedia([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (mediaArray) => {
    const stats = {
      total: mediaArray.length,
      images: 0,
      videos: 0,
      others: 0,
      totalSize: 0,
    };

    mediaArray.forEach(item => {
      if (item.type === 'image') stats.images++;
      else if (item.type === 'video') stats.videos++;
      else stats.others++;

      stats.totalSize += item.size || 0;
    });

    setStats(stats);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      await cmsService.uploadMedia(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('🎉 Media uploaded successfully', {
        description: `${file.name} has been added to your library.`,
      });

      setTimeout(() => {
        setUploadProgress(0);
        fetchMedia();
      }, 500);
    } catch (error) {
      toast.error('Upload failed', {
        description: error.message || 'Please try again.',
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await cmsService.deleteMedia(mediaToDelete._id || mediaToDelete.id);
      toast.success('🗑️ Media deleted', {
        description: 'The file has been permanently removed.',
      });
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
      setSelectedFiles([]);
      setBulkActions(false);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete media', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedFiles.map(file =>
        cmsService.deleteMedia(file._id || file.id)
      );
      await Promise.all(promises);
      toast.success('🗑️ Files deleted', {
        description: `${selectedFiles.length} files have been removed.`,
      });
      setSelectedFiles([]);
      setBulkActions(false);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete files', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Copied to clipboard!', {
      position: 'bottom-right',
    });
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Download started', {
      description: 'Your file is being downloaded.',
    });
  };

  const handleSelectFile = (file) => {
    if (selectedFiles.some(f => f._id === file._id)) {
      setSelectedFiles(selectedFiles.filter(f => f._id !== file._id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const filteredMedia = Array.isArray(media)
    ? media.filter((item) => {
        if (searchQuery) {
          return item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.filename?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
    : [];

  const getFileIcon = (type, size = 'default') => {
    const iconSize = size === 'large' ? 'h-8 w-8' : 'h-5 w-5';

    switch (type) {
      case 'image':
        return <Image className={`${iconSize} text-blue-500`} />;
      case 'video':
        return <Video className={`${iconSize} text-purple-500`} />;
      case 'audio':
        return <Music className={`${iconSize} text-green-500`} />;
      case 'pdf':
      case 'document':
        return <FileText className={`${iconSize} text-red-500`} />;
      default:
        return <File className={`${iconSize} text-gray-500`} />;
    }
  };

  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <HardDrive className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">Media Library</h1>
                      <p className="text-indigo-100 mt-1">Manage all your school's media assets in one place</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5" />
                        <div>
                          <p className="text-sm text-indigo-200">Total Files</p>
                          <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]">
                      <div className="flex items-center gap-3">
                        <Image className="h-5 w-5" />
                        <div>
                          <p className="text-sm text-indigo-200">Images</p>
                          <p className="text-2xl font-bold">{stats.images}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]">
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5" />
                        <div>
                          <p className="text-sm text-indigo-200">Videos</p>
                          <p className="text-2xl font-bold">{stats.videos}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]">
                      <div className="flex items-center gap-3">
                        <Cloud className="h-5 w-5" />
                        <div>
                          <p className="text-sm text-indigo-200">Storage</p>
                          <p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-indigo-200">Storage Status</p>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min((stats.totalSize / (1024 * 1024 * 100)) * 100, 100)} className="h-2 w-24" />
                          <span className="text-xs">{Math.round((stats.totalSize / (1024 * 1024 * 100)) * 100)}% used</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          </div>

          {/* Bulk Actions Bar */}
          {bulkActions && selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-gray-600">Select actions to perform</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFiles([]);
                      setBulkActions(false);
                    }}
                    className="border-gray-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upload Section */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Upload className="h-6 w-6 text-blue-600" />
                    Upload Files
                  </CardTitle>
                  <CardDescription>
                    Drag & drop files or click to upload (Max 10MB per file)
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-normal">
                  <Zap className="mr-2 h-3 w-3" />
                  Fast upload
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FileUpload
                label="Upload File"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                maxSize={10}
                onFileSelect={handleUpload}
                multiple={true}
                className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors rounded-xl"
              />

              {uploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-blue-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Uploading...</span>
                    <span className="text-sm text-blue-700">{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Media Library */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <HardDrive className="h-6 w-6 text-blue-600" />
                    Media Library
                  </CardTitle>
                  <CardDescription>
                    {filteredMedia.length} of {media.length} file{media.length !== 1 ? 's' : ''} • {formatBytes(stats.totalSize)}
                  </CardDescription>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 w-full sm:w-64"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[140px] border-gray-300">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Filter" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Files</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-none border-0"
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-none border-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkActions(!bulkActions)}
                      className={`border-gray-300 ${bulkActions ? 'bg-blue-50 text-blue-600 border-blue-500' : ''}`}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredMedia.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <EmptyState
                    icon={Folder}
                    title="No media found"
                    description={
                      searchQuery
                        ? "No files match your search criteria"
                        : "Upload your first file to get started"
                    }
                    actionLabel="Upload Files"
                    onAction={() => document.querySelector('input[type="file"]')?.click()}
                    className="bg-white/80 backdrop-blur-sm"
                  />
                </motion.div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <AnimatePresence>
                    {filteredMedia.map((item) => (
                      <motion.div
                        key={item._id || item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group"
                      >
                        <div className={`aspect-square rounded-xl overflow-hidden border-2 ${selectedFiles.some(f => f._id === item._id) ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'} bg-gray-100 transition-all duration-200`}>
                          {bulkActions && (
                            <button
                              onClick={() => handleSelectFile(item)}
                              className="absolute top-2 left-2 z-20 bg-white p-1 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                              {selectedFiles.some(f => f._id === item._id) ? (
                                <div className="bg-blue-500 text-white p-1 rounded">
                                  <Check className="h-3 w-3" />
                                </div>
                              ) : (
                                <div className="border border-gray-300 p-1 rounded">
                                  <Check className="h-3 w-3 text-transparent" />
                                </div>
                              )}
                            </button>
                          )}

                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.filename || 'Media'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onClick={() => {
                                if (!bulkActions) {
                                  setSelectedMedia(item);
                                  setPreviewDialogOpen(true);
                                }
                              }}
                            />
                          ) : item.type === 'video' ? (
                            <div className="relative w-full h-full">
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                onClick={() => {
                                  if (!bulkActions) {
                                    setSelectedMedia(item);
                                    setPreviewDialogOpen(true);
                                  }
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div className="bg-white/90 p-3 rounded-full">
                                  <Play className="h-6 w-6 text-gray-900" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4"
                              onClick={() => {
                                if (!bulkActions) {
                                  setSelectedMedia(item);
                                  setPreviewDialogOpen(true);
                                }
                              }}
                            >
                              {getFileIcon(item.type, 'large')}
                              <span className="mt-2 text-xs font-medium text-gray-700">
                                {getFileExtension(item.filename)}
                              </span>
                            </div>
                          )}

                          {/* Overlay Actions */}
                          {!bulkActions && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <div className="flex items-center justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 bg-white/90 hover:bg-white"
                                        onClick={() => handleCopyUrl(item.url)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy URL</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 bg-white/90 hover:bg-white"
                                        onClick={() => handleDownload(item.url, item.filename)}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 bg-white/90 hover:bg-red-500 hover:text-white"
                                        onClick={() => {
                                          setMediaToDelete(item);
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
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {item.filename || 'Untitled'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              {getFileIcon(item.type)}
                              {item.type}
                            </span>
                            <span>{item.size ? formatBytes(item.size) : 'Unknown size'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                // List View
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredMedia.map((item) => (
                      <motion.div
                        key={item._id || item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border ${selectedFiles.some(f => f._id === item._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          {bulkActions && (
                            <button
                              onClick={() => handleSelectFile(item)}
                              className="flex-shrink-0"
                            >
                              {selectedFiles.some(f => f._id === item._id) ? (
                                <div className="bg-blue-500 text-white p-1 rounded">
                                  <Check className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="border border-gray-300 p-1 rounded">
                                  <Check className="h-4 w-4 text-transparent" />
                                </div>
                              )}
                            </button>
                          )}

                          <div className="flex-shrink-0">
                            {item.type === 'image' ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden">
                                <img
                                  src={item.url}
                                  alt={item.filename || 'Media'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                {getFileIcon(item.type)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">
                                {item.filename || 'Untitled'}
                              </p>
                              <span className="text-xs text-gray-500">
                                {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                {getFileIcon(item.type)}
                                {item.type}
                              </span>
                              <span>•</span>
                              <span>{item.size ? formatBytes(item.size) : 'Unknown size'}</span>
                            </div>
                          </div>

                          {!bulkActions && (
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setSelectedMedia(item);
                                        setPreviewDialogOpen(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Preview</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCopyUrl(item.url)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy URL
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(item.url, item.filename)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setMediaToDelete(item);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Preview Dialog */}
          <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
              {selectedMedia && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      {getFileIcon(selectedMedia.type, 'large')}
                      <div>
                        <span className="text-lg">{selectedMedia.filename || 'Media Preview'}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="capitalize">{selectedMedia.type}</span>
                          {selectedMedia.size && (
                            <>
                              <span>•</span>
                              <span>{formatBytes(selectedMedia.size)}</span>
                            </>
                          )}
                          {selectedMedia.createdAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(selectedMedia.createdAt), { addSuffix: true })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Preview */}
                    <div className="rounded-xl overflow-hidden border bg-gray-100">
                      {selectedMedia.type === 'image' ? (
                        <div className="relative">
                          <img
                            src={selectedMedia.url}
                            alt="Preview"
                            className="w-full max-h-[400px] object-contain"
                          />
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                            onClick={() => window.open(selectedMedia.url, '_blank')}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : selectedMedia.type === 'video' ? (
                        <video
                          src={selectedMedia.url}
                          className="w-full max-h-[400px]"
                          controls
                          autoPlay
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12">
                          {getFileIcon(selectedMedia.type, 'large')}
                          <p className="mt-4 text-lg font-medium text-gray-700">
                            {selectedMedia.filename}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Preview not available for this file type
                          </p>
                        </div>
                      )}
                    </div>

                    {/* URL */}
                    <div className="space-y-2">
                      <Label>File URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={selectedMedia.url}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button onClick={() => handleCopyUrl(selectedMedia.url)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(selectedMedia.url, selectedMedia.filename)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setMediaToDelete(selectedMedia);
                          setDeleteDialogOpen(true);
                          setPreviewDialogOpen(false);
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
            title={bulkActions ? "Delete Multiple Files" : "Delete File"}
            description={
              bulkActions ? (
                <div className="space-y-3">
                  <p>Are you sure you want to delete {selectedFiles.length} selected files?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800">
                      This action will permanently remove:
                    </p>
                    <ul className="text-sm text-red-700 mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {selectedFiles.slice(0, 5).map((file, i) => (
                        <li key={i} className="truncate">• {file.filename || file.url}</li>
                      ))}
                      {selectedFiles.length > 5 && (
                        <li className="text-red-600">... and {selectedFiles.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
                </div>
              ) : mediaToDelete ? (
                <div className="space-y-3">
                  <p>Are you sure you want to delete this file?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="font-medium text-red-800">{mediaToDelete.filename || mediaToDelete.url}</p>
                    <p className="text-sm text-red-600 mt-1">
                      {mediaToDelete.type} • {mediaToDelete.size ? formatBytes(mediaToDelete.size) : 'Unknown size'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              ) : (
                "Are you sure you want to delete this media file? This action cannot be undone."
              )
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