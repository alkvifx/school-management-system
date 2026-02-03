// MessageBubble.js (Updated for mobile)
'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/src/utils/constants';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Check,
  CheckCheck,
  Clock,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MessageBubble({
  message,
  previousMessage,
  currentUserId,
  isMobile = false,
}) {
  if (!message) return null;

  const senderId = message.senderId?._id || message.senderId?.id || message.senderId;
  const normalizedCurrentUserId = currentUserId || null;
  const isOwnMessage =
    senderId != null &&
    normalizedCurrentUserId != null &&
    String(senderId) === String(normalizedCurrentUserId);
  const isTeacher = message.senderRole === 'TEACHER';

  const showSender =
    !previousMessage ||
    String(previousMessage?.senderId?._id || previousMessage?.senderId?.id || previousMessage?.senderId || '') !==
      String(senderId || '');

  const getTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : format(d, 'HH:mm');
  };

  const getMediaType = (url) => {
    if (!url) return null;
    const clean = String(url).split('?')[0];
    const ext = clean.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'pdf';
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return 'audio';
    return 'file';
  };

  const baseUrl = API_BASE_URL.replace('/api', '');
  const mediaUrlRaw = message.mediaUrl || null;
  const mediaUrl =
    mediaUrlRaw && String(mediaUrlRaw).startsWith('http')
      ? mediaUrlRaw
      : mediaUrlRaw
        ? `${baseUrl}${mediaUrlRaw}`
        : null;
  const mediaType = mediaUrl ? getMediaType(mediaUrl) : null;

  const getFileIcon = () => {
    switch (mediaType) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    return Math.random() > 0.5 ?
      <CheckCheck className="h-3 w-3" /> :
      <Check className="h-3 w-3" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex gap-2 mb-3 min-w-0',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'flex flex-col min-w-0 overflow-hidden',
          isOwnMessage ? 'items-end' : 'items-start',
          isMobile ? 'max-w-[85%]' : 'max-w-[70%]'
        )}
      >
        {/* Sender info */}
        {showSender && !isOwnMessage && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium text-gray-900 truncate">
              {message.senderId?.name || 'Unknown'}
            </span>
            {isTeacher && (
              <Badge variant="outline" className="h-4 px-1 text-[10px]">
                <Shield className="h-2 w-2 mr-0.5" />
                Teacher
              </Badge>
            )}
          </div>
        )}

        {/* Message bubble: prevent overflow, wrap long text */}
        <div
          className={cn(
            'rounded-xl px-3 py-2 shadow-sm min-w-0 max-w-full overflow-hidden',
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none'
              : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
          )}
        >
          {/* Text content */}
          {!!message.text && (
            <p className="text-sm break-words">{message.text}</p>
          )}

          {/* Media content */}
          {mediaUrl && (
            <div className="mt-2">
              {mediaType === 'image' && (
                <motion.div whileHover={{ scale: 1.02 }}>
                  <img
                    src={mediaUrl}
                    className="rounded-lg max-w-full max-h-48 cursor-pointer hover:opacity-90 transition-all"
                    alt="media"
                    onClick={() => window.open(mediaUrl, '_blank')}
                  />
                </motion.div>
              )}

              {mediaType === 'video' && (
                <video
                  controls
                  className="rounded-lg max-w-full max-h-48"
                >
                  <source src={mediaUrl} />
                  Your browser does not support the video element.
                </video>
              )}

              {(mediaType === 'pdf' || mediaType === 'file') && (
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all',
                    isOwnMessage
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-gray-100 hover:bg-gray-200'
                  )}
                >
                  <div className={cn(
                    'p-1.5 rounded',
                    isOwnMessage ? 'bg-white/30' : 'bg-white'
                  )}>
                    {getFileIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium truncate',
                      isOwnMessage ? 'text-white' : 'text-gray-900'
                    )}>
                      {String(mediaUrlRaw).split('/').pop()?.substring(0, 20) || 'File'}
                    </p>
                    <p className={cn(
                      'text-[10px] mt-0.5',
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {mediaType === 'pdf' ? 'PDF' : 'File'}
                    </p>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* Message footer */}
          <div className={cn(
            'flex items-center justify-end gap-1 mt-1',
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          )}>
            <span className="text-[10px]">{getTime(message.createdAt)}</span>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}