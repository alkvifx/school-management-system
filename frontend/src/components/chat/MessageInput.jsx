// MessageInput.js (Updated for mobile)
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Paperclip,
  Loader2,
  Image,
  FileText,
  Video,
  Smile,
  Mic,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MessageInput({ onSend, sending, disabled, isMobile = false }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);
  const [showAttachments, setShowAttachments] = useState(false);

  const send = async () => {
    if (sending || disabled) return;
    if (!text.trim() && files.length === 0) return;

    try {
      // For demo - in real app you would upload files first
      await onSend({
        text: text.trim() || undefined,
        media: files.length > 0 ? files[0] : undefined,
      });

      setText('');
      setFiles([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error('Failed to send message');
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);

    // Validate file size (5MB max per file)
    const oversized = selected.filter(file => file.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error('Some files exceed 5MB limit');
      return;
    }

    setFiles(prev => [...prev, ...selected]);
    setShowAttachments(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      {/* File preview */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
        >
          {files.map((file, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pl-2 pr-1 py-1 text-xs"
            >
              <div className="flex items-center gap-1">
                {getFileIcon(file)}
                <span className="truncate max-w-[80px]">
                  {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiles([])}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </motion.div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttachments(!showAttachments)}
            disabled={disabled || sending}
            className={cn(
              "text-gray-600 hover:text-blue-600",
              isMobile && "h-8 w-8"
            )}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {showAttachments && (
            <div className="absolute bottom-16 left-2 bg-white border rounded-lg shadow-lg p-2 z-10">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Image className="h-4 w-4" />
                  <span className="text-xs">Image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">File</span>
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type your message..."
            disabled={disabled || sending}
            className={cn(
              "w-full min-h-[40px] max-h-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm",
              isMobile && "text-sm"
            )}
          />
        </div>

        <Button
          onClick={send}
          disabled={(!text.trim() && files.length === 0) || disabled || sending}
          className={cn(
            "h-9 w-9 p-0",
            (text.trim() || files.length > 0) && !disabled && !sending
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              : "bg-gray-300"
          )}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Send className="h-4 w-4 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}