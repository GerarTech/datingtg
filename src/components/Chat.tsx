import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../context/AppContext';
import { hapticFeedback, cn } from '../lib/utils';
import { ChevronLeft, Send, Mic, MoreVertical, Search, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import { resolveIcebreakerLines } from '../lib/appSettings';
import type { ProfileViewLocationState } from '../lib/profileNavigation';
import { MAX_VOICE_SECONDS } from '../lib/yeneFeatures';
import { peerStatusLine } from '../lib/presence';
import { useLocalDataRevision } from '../hooks/useLocalDataRevision';

export const Chat: React.FC = () => {
  const {
    chats,
    matches,
    activeChatId,
    setActiveChatId,
    addMessage,
    addVoiceMessage,
    updateChatUser,
    touchMyPresence,
    user,
    blockUser,
    reportUser,
    unmatchUser,
  } = useApp();
  const settingsRev = useLocalDataRevision();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState('');

  const activeChat = chats.find((c) => c.id === activeChatId);
  
  // Check if the current chat user is in matches (unmatch should only show for matched users)
  const isMatched = activeChat ? matches.some(m => 
    (m.id === activeChat.user.id || m.username === activeChat.user.username) && 
    m.id !== 'me' // Exclude self from matches check
  ) : false;

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(
      (c) =>
        c.user.name.toLowerCase().includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q)
    );
  }, [chats, searchQuery]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state === 'inactive') return;
    rec.stop();
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    if (!activeChatId || isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recordStartRef.current = Date.now();
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || mime });
        const sec = Math.min(MAX_VOICE_SECONDS, Math.max(1, (Date.now() - recordStartRef.current) / 1000));
        const url = URL.createObjectURL(blob);
        addVoiceMessage(activeChatId, url, Math.round(sec));
        mediaRecorderRef.current = null;
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setIsRecording(true);
      hapticFeedback();
      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') stopRecording();
      }, MAX_VOICE_SECONDS * 1000);
    } catch {
      // mic denied or unavailable
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    touchMyPresence();
    updateChatUser(activeChatId, { isOnline: true, lastSeenAt: Date.now() });
    const id = activeChatId;
    const t = window.setTimeout(() => {
      updateChatUser(id, { isOnline: false, lastSeenAt: Date.now() });
    }, 4500);
    return () => clearTimeout(t);
  }, [activeChatId, touchMyPresence, updateChatUser]);

  const headerStatus = useMemo(() => {
    if (!activeChat) return { kind: 'lastSeen' as const, text: '' };
    return peerStatusLine(activeChat.user);
  }, [activeChat, nowTick]);

  const iceLines = useMemo(() => {
    if (!activeChat) return [];
    return resolveIcebreakerLines(activeChat.user.name, activeChat.user.interests?.[0]);
  }, [activeChat, settingsRev]);

  const handleSend = () => {
    if (!inputText.trim() || !activeChatId) return;
    hapticFeedback();
    addMessage(activeChatId, inputText);
    setInputText('');
  };

  if (!activeChatId) {
    return (
      <div className="h-full flex flex-col pt-8 sm:pt-12 pb-28 safe-area-top bg-[#0B0D14] text-white">
        <div className="px-4 sm:px-6 mb-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black italic text-[#FF8C00] leading-none tracking-tighter">YENE</h1>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Messages</span>
          </div>
        </div>

        <div className="px-4 sm:px-6 mb-5 shrink-0">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
            <Search className="w-5 h-5 text-white/35 shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${matches.length} matches`}
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder:text-white/35 min-w-0"
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 mb-4 shrink-0">
          <h2 className="text-lg font-black text-white mb-3">New matches</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 yene-scrollbar-thin">
            {matches.slice(0, 12).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  hapticFeedback();
                  navigate(`/profile/${m.username || m.id}`, {
                  state: { profileBack: { path: '/chats' } } satisfies ProfileViewLocationState,
                });
                }}
                className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              >
                <div className="w-[68px] h-[68px] rounded-full overflow-hidden ring-2 ring-[#FF8C00]/30 border border-white/10 shadow-lg">
                  <img src={m.photo} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-white/90 max-w-[72px] truncate">
                  {m.name.split(/\s+/)[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-6 mb-2 shrink-0">
          <h2 className="text-lg font-black text-white">Messages</h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 space-y-2 pb-4 yene-scrollbar">
          {chats.length > 0 ? (
            filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const st = peerStatusLine(chat.user);
                const online = st.kind === 'online';
                const last = chat.messages[chat.messages.length - 1];
                const preview =
                  last?.kind === 'voice'
                    ? 'Voice message'
                    : last?.text || chat.lastMessage || '';
                const fromMe = last?.senderId === 'me';
                const timeAgo = last
                  ? formatDistanceToNow(new Date(last.timestamp), { addSuffix: true })
                  : '';

                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => {
                      hapticFeedback();
                      setActiveChatId(chat.id);
                    }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-[22px] bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] active:scale-[0.99] transition-all text-left"
                  >
                    <div className="relative shrink-0">
                      <div className="w-[56px] h-[56px] rounded-[18px] overflow-hidden ring-1 ring-white/10">
                        <img src={chat.user.photo} className="w-full h-full object-cover" alt="" />
                      </div>
                      <span
                        className={cn(
                          'absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-[3px] border-[#0B0D14]',
                          online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-white/25'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <span className="font-bold text-white text-[16px] truncate block">{chat.user.name}</span>
                      <p className="text-[13px] text-white/45 truncate mt-0.5">{preview}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1 self-stretch justify-between py-0.5">
                      {timeAgo ? (
                        <span className="text-[11px] font-semibold text-white/35">{timeAgo}</span>
                      ) : (
                        <span className="text-[11px] text-transparent">·</span>
                      )}
                      {fromMe && (
                        <CheckCheck
                          className={cn('w-4 h-4', last ? 'text-[#FF8C00]' : 'text-white/25')}
                          aria-hidden
                        />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-8 text-center text-sm text-white/50">
                No conversations match your search.
              </div>
            )
          ) : (
            <div className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center py-16 px-8 rounded-3xl bg-white/[0.03] border border-white/10">
              <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#FF8C00]/20 to-transparent border border-[#FF8C00]/25 flex items-center justify-center mb-5">
                <Send className="w-9 h-9 text-[#FF8C00]/70" />
              </div>
              <h3 className="text-lg font-black mb-2 text-white/90">No conversations yet</h3>
              <p className="text-white/40 text-sm max-w-[260px] leading-relaxed">
                Match with people in Discovery — your chats will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0D14]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,140,0,0.12),transparent)] pointer-events-none" />

      <header className="relative px-3 py-3 flex items-center gap-2 border-b border-white/[0.06] bg-[#0B0D14]/85 backdrop-blur-2xl pt-12 safe-area-top shrink-0">
        <button
          type="button"
          onClick={() => setActiveChatId(null)}
          className="p-2.5 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(`/profile/${activeChat?.user.username || activeChat?.user.id}`, {
              state: { profileBack: { path: '/chats' } } satisfies ProfileViewLocationState,
            })
          }
          className="flex-1 flex items-center gap-3 min-w-0 active:opacity-90 transition-opacity text-left"
        >
          <div className="relative shrink-0">
            <img
              src={activeChat?.user.photo}
              className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/15"
              alt=""
            />
            {headerStatus.kind === 'online' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-[2px] border-[#0B0D14] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[15px] text-white truncate">{activeChat?.user.name}</h3>
            <p
              className={cn(
                'text-[11px] font-medium truncate',
                headerStatus.kind === 'online' && 'text-emerald-400',
                headerStatus.kind === 'hidden' && 'text-white/45',
                headerStatus.kind === 'lastSeen' && 'text-white/45'
              )}
            >
              {headerStatus.text}
            </p>
          </div>
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-transform"
              aria-label="Chat actions"
            >
              <MoreVertical className="w-5 h-5 text-white/70" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[220px] rounded-2xl border border-white/10 bg-[#10131c] p-1.5 shadow-2xl z-[200] backdrop-blur-xl"
              sideOffset={8}
              align="end"
            >
              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white outline-none data-[highlighted]:bg-white/10"
                onSelect={() =>
                  navigate(`/profile/${activeChat?.user.username || activeChat?.user.id}`, {
                    state: { profileBack: { path: '/chats' } } satisfies ProfileViewLocationState,
                  })
                }
              >
                View profile
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white outline-none data-[highlighted]:bg-white/10"
                onSelect={() => {
                  if (!activeChat) return;
                  hapticFeedback();
                  blockUser(activeChat.user.id);
                  toast.success('Blocked — you won’t see this person in discovery.');
                  setActiveChatId(null);
                }}
              >
                Block user
              </DropdownMenu.Item>
              {isMatched && (
                <DropdownMenu.Item
                  className="flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white outline-none data-[highlighted]:bg-white/10"
                  onSelect={() => {
                    if (!activeChat) return;
                    hapticFeedback();
                    unmatchUser(activeChat.user.id);
                    toast.success('Unmatched — this user has been removed from your matches.');
                    setActiveChatId(null);
                  }}
                >
                  Unmatch
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Item
                className="flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 outline-none data-[highlighted]:bg-red-500/15"
                onSelect={() => {
                  if (!activeChat) return;
                  hapticFeedback();
                  reportUser(activeChat.user.id, 'Chat — reported user', {
                    reportedUserName: activeChat.user.name,
                    source: 'chat',
                  });
                  toast.message('Report sent — we’ll review it.');
                }}
              >
                Report
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </header>

      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-4 yene-scrollbar"
      >
        <div className="flex justify-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10">
            <span className="text-[10px] text-white/35 uppercase tracking-[0.25em] font-black">Match</span>
            <span className="w-1 h-1 rounded-full bg-[#FF8C00]/80" />
            <span className="text-[10px] text-white/25 font-mono">
              {user?.premiumPlus ? '🔒 last seen privacy' : 'Say hi 👋'}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {activeChat?.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                'max-w-[88%] px-4 py-2.5 rounded-[20px] text-[15px] leading-relaxed shadow-lg',
                msg.senderId === 'me'
                  ? 'bg-gradient-to-br from-[#FF8C00] to-[#e07600] text-white ml-auto rounded-br-md'
                  : 'bg-white/[0.08] text-white/95 rounded-bl-md border border-white/[0.08]'
              )}
            >
              {msg.kind === 'voice' && msg.audioUrl ? (
                <div className="flex items-center gap-2 min-w-0">
                  <audio src={msg.audioUrl} controls className="h-9 max-w-[min(220px,70vw)] accent-[#FF8C00]" />
                  {msg.voiceDurationSec != null && (
                    <span className="text-[11px] font-bold tabular-nums opacity-80 shrink-0">{msg.voiceDurationSec}s</span>
                  )}
                </div>
              ) : (
                msg.text
              )}
              <div
                className={cn(
                  'text-[9px] mt-1.5 font-bold uppercase tracking-widest',
                  msg.senderId === 'me' ? 'text-white/55 text-right' : 'text-white/25 text-left'
                )}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activeChat && activeChat.messages.length === 0 && (
        <div className="px-4 pb-2 shrink-0 border-t border-white/[0.04] pt-3 bg-[#0B0D14]/90 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Icebreakers</p>
          <div className="flex gap-2 overflow-x-auto pb-1 yene-scrollbar-thin">
            {iceLines.map((line, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!activeChatId) return;
                  hapticFeedback();
                  addMessage(activeChatId, line);
                }}
                className="shrink-0 max-w-[90%] text-left px-3.5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-white/85 leading-snug active:scale-[0.98] transition-transform hover:bg-white/[0.09]"
              >
                {line}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative p-3 pb-10 safe-area-bottom border-t border-white/[0.06] bg-[#080a10]/95 backdrop-blur-xl">
        <div className="rounded-[26px] flex items-stretch p-1 pl-1.5 border border-white/10 bg-white/[0.05] gap-1 shadow-inner shadow-black/20">
          <button
            type="button"
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className={cn(
              'w-11 h-11 rounded-[20px] flex items-center justify-center shrink-0 transition-all active:scale-90 my-auto',
              isRecording ? 'bg-red-500/35 text-red-100 animate-pulse' : 'bg-white/10 text-white/75'
            )}
            aria-label={isRecording ? 'Stop recording' : 'Record voice'}
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? 'Recording… tap mic to stop' : 'Message…'}
            disabled={isRecording}
            className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-[15px] text-white placeholder:text-white/25 disabled:opacity-50 min-w-0"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isRecording}
            className={cn(
              'w-11 h-11 rounded-[20px] flex items-center justify-center transition-all active:scale-90 my-auto shrink-0',
              inputText.trim() && !isRecording
                ? 'bg-[#FF8C00] text-white shadow-lg shadow-[#FF8C00]/25'
                : 'bg-white/5 text-white/20'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
