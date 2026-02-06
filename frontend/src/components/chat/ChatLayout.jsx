'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/src/hooks/useSocket';
import { chatService } from '@/src/services/chat.service';
import { toast } from 'sonner';
import { useAuth } from '@/src/context/auth.context';
import ClassList from './ClassList';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { EmptyState } from '@/src/components/EmptyState';
import {
  MessageSquare,
  Loader2,
  Users,
  Clock,
  TrendingUp,
  Shield,
  Sparkles,
  FileText,
  BarChart3,
  Zap,
  BookOpen,
  GraduationCap,
  MoreVertical,
  Settings,
  Pin,
  Archive,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { API_BASE_URL } from '@/src/utils/constants';

// Dev-only: show debug overlay on chat page (set window.__CHAT_DEBUG__ = true)
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export default function ChatLayout({
  classes,
  loading: classesLoading,
  mobileSidebarOpen,
  onCloseMobileSidebar
}) {
  const { user } = useAuth();
  const { socket, isConnected, error: socketError } = useSocket();

  const [selectedClass, setSelectedClass] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeChatRoomId, setActiveChatRoomId] = useState(null); // Reused for all messages in this class
  const [activeTab, setActiveTab] = useState('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  // PWA fix: default true so on mobile the class list is visible on first load (avoids blank screen)
  const [showClassList, setShowClassList] = useState(true);
  // PWA fix: isMobile only after mount to avoid hydration mismatch and blank layout
  const [isMobile, setIsMobile] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Mock data
  const [classDetails] = useState({
    students: 28,
    activeNow: 12,
    attendance: 94,
    avgScore: 82,
  });

  const messagesEndRef = useRef(null);
  const joinedClassIdRef = useRef(null);
  const activeChatRoomIdRef = useRef(null);

  const currentUserId = user?._id || user?.id || null;

  // Set isMobile only on client after mount (avoids SSR/hydration mismatch and PWA blank screen)
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const shouldShowClassList = isMobile ? showClassList : true;
  const shouldShowDetails = isMobile ? false : showDetails;

  const normalizeMessage = (raw) => {
    if (!raw) return null;
    const msg = raw;
    const senderObj = msg.senderId || msg.sender || null;
    const senderId =
      (typeof senderObj === 'object' ? (senderObj._id || senderObj.id) : senderObj) || null;
    return {
      _id: msg._id || msg.id || null,
      chatRoomId: msg.chatRoomId || msg.roomId || null,
      senderId:
        senderObj && typeof senderObj === 'object'
          ? { _id: senderObj._id || senderObj.id, name: senderObj.name, email: senderObj.email }
          : senderId ? { _id: senderId } : null,
      senderRole: msg.senderRole || msg.role || null,
      messageType: msg.messageType || (msg.mediaUrl ? 'media' : 'text'),
      text: msg.text ?? msg.txt ?? '',
      mediaUrl: msg.mediaUrl ?? msg.media ?? null,
      createdAt: msg.createdAt || msg.created_at || null,
    };
  };

  const sortByCreatedAtAsc = (list) => {
    return [...list].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
      if (Number.isNaN(ta)) return -1;
      if (Number.isNaN(tb)) return 1;
      return ta - tb;
    });
  };

  const classIdRef = useRef(null);
  classIdRef.current = selectedClass ? (selectedClass._id || selectedClass.id) : null;

  // Load messages, get-or-create chat room, and join socket room when class is selected; cleanup on change/unmount
  useEffect(() => {
    const classId = selectedClass ? (selectedClass._id || selectedClass.id) : null;
    if (!classId) {
      setMessages([]);
      setActiveChatRoomId(null);
      activeChatRoomIdRef.current = null;
      joinedClassIdRef.current = null;
      return;
    }

    let cancelled = false;

    const loadMessagesAndRoom = async () => {
      setLoading(true);
      try {
        const list = await chatService.getMessages(classId);
        if (!cancelled && Array.isArray(list)) {
          const normalized = list.map((m) => normalizeMessage(m)).filter(Boolean);
          setMessages(sortByCreatedAtAsc(normalized));
        }
        if (cancelled) return;
        try {
          const room = await chatService.getChatRoom(classId);
          if (!cancelled && room?.id) {
            setActiveChatRoomId(room.id);
            activeChatRoomIdRef.current = room.id;
          } else if (!cancelled && room?._id) {
            setActiveChatRoomId(room._id);
            activeChatRoomIdRef.current = room._id;
          }
        } catch (roomErr) {
          if (!cancelled) {
            // Room may not exist yet; first send will create it. Keep messages.
          }
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.message || 'Failed to load messages');
          setMessages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMessagesAndRoom();

    const onReceiveMessage = (data) => {
      const payload = data?.message;
      if (!payload || cancelled) return;
      const msgClassId = payload.classId?.toString?.() || payload.classId || null;
      const currentClassId = classIdRef.current?.toString?.() || classIdRef.current;
      if (msgClassId && currentClassId && msgClassId !== currentClassId) return;
      const normalized = normalizeMessage(payload);
      if (!normalized?._id) return;
      setMessages((prev) => {
        if (prev.some((m) => (m._id || m.id)?.toString() === (normalized._id || normalized.id)?.toString()))
          return prev;
        return sortByCreatedAtAsc([...prev, normalized]);
      });
    };

    socket?.on('receiveMessage', onReceiveMessage);

    return () => {
      cancelled = true;
      socket?.off('receiveMessage', onReceiveMessage);
      if (classId) socket?.emit('leaveClassRoom', { classId });
      joinedClassIdRef.current = null;
    };
  }, [selectedClass?._id ?? selectedClass?.id, socket]);

  // Join socket room when connected (and re-join on reconnect)
  useEffect(() => {
    const classId = selectedClass ? (selectedClass._id || selectedClass.id) : null;
    if (!classId || !socket) return;
    if (socket.connected) {
      socket.emit('joinClassRoom', { classId }, (ack) => {
        if (ack?.success) joinedClassIdRef.current = classId;
      });
    }
    return () => {
      if (classId) socket.emit('leaveClassRoom', { classId });
      joinedClassIdRef.current = null;
    };
  }, [selectedClass?._id ?? selectedClass?.id, isConnected, socket]);

  /* auto scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* on mobile keyboard open (visualViewport resize), scroll to bottom so input stays visible */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const handler = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    };
    window.visualViewport.addEventListener('resize', handler);
    window.visualViewport.addEventListener('scroll', handler);
    return () => {
      window.visualViewport.removeEventListener('resize', handler);
      window.visualViewport.removeEventListener('scroll', handler);
    };
  }, []);

  /* socket error */
  useEffect(() => {
    if (socketError) toast.error(socketError);
  }, [socketError]);

  // Handle class selection
  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem);
    if (isMobile) {
      setShowClassList(false);
      if (onCloseMobileSidebar) onCloseMobileSidebar();
    }
  };

  // Keyboard shortcuts for mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobile && (showClassList || showDetails)) {
        setShowClassList(false);
        setShowDetails(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, showClassList, showDetails]);

  /* send message: reuse activeChatRoomId when available to avoid duplicate room creation */
  async function handleSendMessage(data) {
    if (!selectedClass) return;

    try {
      setSending(true);
      const classId = selectedClass._id || selectedClass.id;
      const chatRoomId = activeChatRoomIdRef.current || activeChatRoomId;
      const res = await chatService.sendMessage(classId, {
        ...data,
        ...(chatRoomId && { chatRoomId: String(chatRoomId) }),
      });
      const msg = normalizeMessage(res?.message ?? res);
      if (msg?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m?._id === msg._id)) return prev;
          return sortByCreatedAtAsc([...prev, msg]);
        });
      }
      if (res?.chatRoomId) {
        setActiveChatRoomId(res.chatRoomId);
        activeChatRoomIdRef.current = res.chatRoomId;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={cn(
        'w-full flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-white shadow-lg',
        'h-full min-h-0',
        isMobile && 'min-h-[100dvh] min-h-[100svh]',
        isFullscreen && 'fixed inset-0 z-50 rounded-none'
      )}
      style={isMobile ? { height: '100dvh', minHeight: '100dvh' } : undefined}
    >
      {/* Mobile Class List Button */}
      {isMobile && selectedClass && (
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b p-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClassList(true)}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              <span className="font-medium">{selectedClass.name}</span>
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="h-6">
                {isConnected ? '● Online' : '○ Offline'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* LEFT PANEL - Class List */}
      <div className={cn(
        "lg:w-80 xl:w-96 border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 flex flex-col transition-all duration-300",
        isMobile && !shouldShowClassList && "hidden",
        isMobile && "fixed inset-0 z-40 w-full"
      )}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-white border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Classes</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowClassList(false);
                  if (onCloseMobileSidebar) onCloseMobileSidebar();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search classes..."
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Classes</h2>
              <Badge variant="outline" className="font-normal">
                <Zap className="h-3 w-3 mr-1" />
                {classes.length} total
              </Badge>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search classes..."
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <ClassList
            classes={classes}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            loading={classesLoading}
            isMobile={isMobile}
          />
        </div>

        {!isMobile && (
          <div className="p-4 border-t border-gray-200">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - Main Chat: full height; on mobile show when class list is closed (never fully blank) */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-0 overflow-hidden',
          isMobile && shouldShowClassList && 'hidden',
          isMobile && 'min-h-0'
        )}
      >
        {!selectedClass ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Select a Class
              </h3>
              <p className="text-gray-600 mb-6">
                Choose a class from the sidebar to start messaging.
              </p>
              {isMobile && (
                <Button
                  onClick={() => setShowClassList(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Browse Classes
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="shrink-0 border-b border-gray-200 p-3 lg:p-6 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowClassList(true)}
                      className="lg:hidden"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}

                  <div className="hidden lg:block p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg lg:text-2xl text-gray-900 truncate">
                      {selectedClass.name} ({selectedClass.section})
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {classDetails.students}
                      </span>
                      <span className="hidden lg:inline">•</span>
                      <span className="hidden lg:flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {classDetails.activeNow} online
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isMobile && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsFullscreen(!isFullscreen)}
                              className="hidden lg:flex"
                            >
                              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMuted(!muted)}
                              className="hidden lg:flex"
                            >
                              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{muted ? 'Unmute' : 'Mute'}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        className="hidden lg:flex"
                      >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pin className="h-4 w-4 mr-2" />
                        Pin Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Chat Tabs - Single Tabs component for both desktop and mobile */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Desktop Tabs */}
              {!isMobile ? (
                <div className="shrink-0 border-b border-gray-200">
                  <div className="px-4 lg:px-6">
                    <TabsList className="w-full justify-start bg-transparent">
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat
                        <Badge variant="secondary" className="ml-2 h-5 min-w-[20px]">
                          {messages.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="students" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Students
                        <Badge variant="secondary" className="ml-2 h-5 min-w-[20px]">
                          {classDetails.students}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="files" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Files
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              ) : (
                /* Mobile Tabs */
                <div className="border-b border-gray-200">
                  <div className="px-3">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="chat" className="flex items-center gap-2 py-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs">Chat</span>
                      </TabsTrigger>
                      <TabsTrigger value="students" className="flex items-center gap-2 py-2">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Students</span>
                      </TabsTrigger>
                      <TabsTrigger value="files" className="flex items-center gap-2 py-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Files</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              )}

              {/* Desktop Search Bar */}
              {!isMobile && (
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search in messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Chat Content: messages scroll, input sticky at bottom */}
              <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 min-h-0 overflow-hidden">
                {/* Mobile Search */}
                {isMobile && (
                  <div className="shrink-0 p-3 border-b bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                {/* Messages Area: scrollable, flex-1 min-h-0 so it takes remaining space */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 lg:p-6 bg-gradient-to-b from-white to-gray-50/50">
                  {loading ? (
                    <div className="flex items-center justify-center min-h-[200px] py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-500">Loading messages...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((message, index) => (
                          <MessageBubble
                            key={message._id || message.id || index}
                            message={message}
                            previousMessage={index > 0 ? messages[index - 1] : null}
                            currentUserId={currentUserId}
                            isMobile={isMobile}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Connecting / offline banner and retry */}
                {!isConnected && (
                  <div className="shrink-0 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-center gap-2 text-sm">
                    {socketError ? (
                      <>
                        <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="text-amber-800 dark:text-amber-200">
                          {socketError}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-400 text-amber-800 hover:bg-amber-100"
                          onClick={() => socket?.connect?.()}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-600 shrink-0" />
                        <span className="text-amber-800 dark:text-amber-200">
                          Connecting to chat…
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Message Input: sticky at bottom, safe-area for iOS/PWA */}
                <div
                  className={cn(
                    'shrink-0 border-t border-gray-200 p-3 lg:p-4 bg-white',
                    'pb-[max(0.75rem,env(safe-area-inset-bottom))]'
                  )}
                >
                  <MessageInput
                    onSend={handleSendMessage}
                    sending={sending}
                    disabled={!isConnected || loading}
                    isMobile={isMobile}
                  />
                </div>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students" className="flex-1 m-0 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              S
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate text-sm">
                              Student {i + 1}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {i % 3 === 0 ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="flex-1 m-0 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate text-sm">
                              document_{i + 1}.pdf
                            </h4>
                            <p className="text-xs text-gray-600">
                              2.{i} MB • Shared today
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* RIGHT SIDEBAR - Class Details (Desktop only) */}
      {shouldShowDetails && selectedClass && !isMobile && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-80 xl:w-96 border-l border-gray-200 bg-white"
        >
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Class Stats */}
              <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Class Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-700 mb-1">{classDetails.attendance}%</div>
                    <div className="text-xs text-blue-600 font-medium">Attendance</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-700 mb-1">{classDetails.avgScore}%</div>
                    <div className="text-xs text-emerald-600 font-medium">Avg Score</div>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Connection</span>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  {isConnected
                    ? 'Real-time messaging is active'
                    : 'Connection lost, reconnecting...'
                  }
                </p>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      )}

      {/* Dev-only debug overlay: set window.__CHAT_DEBUG__ = true in console to show */}
      {isDev && typeof window !== 'undefined' && (showDebug || window.__CHAT_DEBUG__) && (
        <div
          className="fixed bottom-20 right-2 z-[100] max-w-[280px] rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs shadow-lg dark:bg-amber-950 dark:border-amber-700"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mb-2 font-semibold text-amber-900 dark:text-amber-100">Chat Debug (PWA)</div>
          <ul className="space-y-1 text-amber-800 dark:text-amber-200">
            <li>Route: {typeof window !== 'undefined' ? window.location.pathname : '-'}</li>
            <li>Socket: {isConnected ? '● Connected' : '○ Disconnected'}</li>
            <li>API: {(API_BASE_URL || '').replace(/\/api\/?$/, '')}</li>
            <li>Token: {typeof window !== 'undefined' && localStorage.getItem('token') ? 'yes' : 'no'}</li>
            <li>Messages: {messages.length}</li>
            <li>isMobile: {String(isMobile)}</li>
            <li>showClassList: {String(showClassList)}</li>
            {socketError && <li className="text-red-600">Error: {socketError}</li>}
          </ul>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 h-6 text-xs"
            onClick={() => setShowDebug(false)}
          >
            Close
          </Button>
        </div>
      )}
      {isDev && typeof window !== 'undefined' && !showDebug && !window.__CHAT_DEBUG__ && (
        <button
          type="button"
          aria-label="Toggle chat debug"
          className="fixed bottom-20 right-2 z-[99] rounded-full bg-amber-200 p-2 text-amber-900 shadow dark:bg-amber-800 dark:text-amber-100"
          onClick={() => setShowDebug(true)}
        >
          <span className="text-[10px] font-mono">?</span>
        </button>
      )}
    </div>
  );
}