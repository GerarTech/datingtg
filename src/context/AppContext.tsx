import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';
import {
  FREE_DAILY_LIKES,
  PLUS_DAILY_LIKES,
  SLOW_DECK_DAILY_CARDS,
  DatingIntent,
} from '../lib/yeneFeatures';
import { addReport, removeRegisteredUser, getAdminConfig } from '../lib/appSettings';

export type UserProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  interests: string[];
  photo: string;
  photos?: string[];
  distance?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  phoneNumber?: string;
  telegramUsername?: string;
  username?: string;
  isOnline?: boolean;
  /** What they're looking for — used for discovery matching */
  datingIntent?: DatingIntent;
  /** Premium Plus — higher limits, insights (client-side for demo) */
  premiumPlus?: boolean;
  /** Which premium package the user has */
  premiumPackage?: 'basic' | 'plus' | 'premium';
  likesUsedToday?: number;
  lastLikeResetDate?: string;
  cardsSeenToday?: number;
  lastDeckResetDate?: string;
  streakDay?: number;
  lastStreakDate?: string;
  referralCode?: string;
  referredBy?: string;
  blurPhotosInDiscovery?: boolean;
  blockedUserIds?: string[];
  /** Unix ms — for last seen (Telegram-style) */
  lastSeenAt?: number;
  /** Plus: hide exact last seen from others */
  hideLastSeenFromOthers?: boolean;
  /** Set when signing up via Telegram WebApp */
  telegramUserId?: number;
};

export type MessageKind = 'text' | 'voice';

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  kind?: MessageKind;
  /** data URL or blob URL for voice */
  audioUrl?: string;
  voiceDurationSec?: number;
};

export type Chat = {
  id: string;
  user: UserProfile;
  lastMessage: string;
  messages: Message[];
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  matches: UserProfile[];
  addMatch: (profile: UserProfile) => void;
  chats: Chat[];
  addMessage: (chatId: string, text: string) => void;
  addVoiceMessage: (chatId: string, audioUrl: string, durationSec: number) => void;
  view: 'onboarding' | 'discovery' | 'chats' | 'profile';
  isUsernameTaken: (username: string) => boolean;
  setView: (view: 'onboarding' | 'discovery' | 'chats' | 'profile') => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  showMatchOverlay: UserProfile | null;
  setShowMatchOverlay: (profile: UserProfile | null) => void;
  resetApp: () => void;
  unmatchUser: (userId: string) => void;
  /** Daily like budget for right swipes */
  likesRemaining: number;
  /** Theme mode */
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  tryConsumeLike: () => boolean;
  recordCardSeen: () => void;
  cardsRemainingInDeck: number;
  recordDiscoveryOpen: () => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isBlocked: (userId: string) => boolean;
  reportUser: (
    userId: string,
    reason: string,
    opts?: { reportedUserName?: string; source?: 'discovery' | 'profile' | 'chat' }
  ) => void;
  updateChatUser: (chatId: string, patch: Partial<UserProfile>) => void;
  touchMyPresence: () => void;
  deleteAccount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mergeDailyReset = (u: UserProfile): UserProfile => {
  const t = todayISO();
  let next = { ...u };
  if (u.lastLikeResetDate !== t) {
    next = { ...next, likesUsedToday: 0, lastLikeResetDate: t };
  }
  if (u.lastDeckResetDate !== t) {
    next = { ...next, cardsSeenToday: 0, lastDeckResetDate: t };
  }
  return next;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('yene_user');
    if (!saved) return null;
    try {
      const u = JSON.parse(saved) as UserProfile;
      return mergeDailyReset(u);
    } catch {
      return null;
    }
  });

  const [adminConfig, setAdminConfig] = useState(() => getAdminConfig());

  const setUser = useCallback((next: UserProfile | null) => {
    if (next) setUserState(mergeDailyReset(next));
    else setUserState(null);
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const merged = mergeDailyReset({ ...prev, ...patch });
      return merged;
    });
  }, []);

  const [matches, setMatches] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('yene_matches');
    return saved ? JSON.parse(saved) : [];
  });
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('yene_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'onboarding' | 'discovery' | 'chats' | 'profile'>(user ? 'discovery' : 'onboarding');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showMatchOverlay, setShowMatchOverlay] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('yene_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (user) {
      const u = mergeDailyReset(user);
      if (JSON.stringify(u) !== JSON.stringify(user)) setUserState(u);
      localStorage.setItem('yene_user', JSON.stringify(u));
    }
  }, [user]);

  useEffect(() => {
    const onLocalDataChange = () => {
      setAdminConfig(getAdminConfig());
    };
    window.addEventListener('yene-local-data', onLocalDataChange);
    return () => window.removeEventListener('yene-local-data', onLocalDataChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('yene_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('yene_theme', theme);
  }, [theme]);

  const dailyLimit = user?.premiumPlus ? adminConfig.plusDailyLikes : adminConfig.freeDailyLikes;
  const used = user?.likesUsedToday ?? 0;
  const likesRemaining = Math.max(0, dailyLimit - used);

  const deckUsed = user?.cardsSeenToday ?? 0;
  const cardsRemainingInDeck = Math.max(0, SLOW_DECK_DAILY_CARDS - deckUsed);

  const tryConsumeLike = useCallback((): boolean => {
    if (!user) return false;
    const u = mergeDailyReset(user);
    const limit = u.premiumPlus ? adminConfig.plusDailyLikes : adminConfig.freeDailyLikes;
    const usedLikes = u.likesUsedToday ?? 0;
    if (usedLikes >= limit) return false;
    setUserState({
      ...u,
      likesUsedToday: usedLikes + 1,
      lastLikeResetDate: todayISO(),
    });
    return true;
  }, [user, adminConfig]);

  const recordCardSeen = useCallback(() => {
    setUserState((prev) => {
      if (!prev) return prev;
      const u = mergeDailyReset(prev);
      const seen = u.cardsSeenToday ?? 0;
      return {
        ...u,
        cardsSeenToday: seen + 1,
        lastDeckResetDate: todayISO(),
      };
    });
  }, []);

  const recordDiscoveryOpen = useCallback(() => {
    setUserState((prev) => {
      if (!prev) return prev;
      const u = mergeDailyReset(prev);
      const t = todayISO();
      const last = u.lastStreakDate;
      let streak = u.streakDay ?? 0;
      if (last === t) return u;
      if (last === yesterdayISO()) streak += 1;
      else streak = 1;
      return { ...u, streakDay: streak, lastStreakDate: t };
    });
  }, []);

  const blockUser = useCallback((userId: string) => {
    setUserState((prev) => {
      if (!prev) return prev;
      if ((prev.blockedUserIds ?? []).includes(userId)) return prev;
      return { ...prev, blockedUserIds: [...(prev.blockedUserIds ?? []), userId] };
    });
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setUserState((prev) => {
      if (!prev) return prev;
      return { ...prev, blockedUserIds: (prev.blockedUserIds ?? []).filter((id) => id !== userId) };
    });
  }, []);

  const isBlocked = useCallback(
    (userId: string) => (user?.blockedUserIds ?? []).includes(userId),
    [user?.blockedUserIds]
  );

  const reportUser = useCallback(
    (reportedUserId: string, reason: string, opts?: { reportedUserName?: string; source?: 'discovery' | 'profile' | 'chat' }) => {
      addReport({
        reportedUserId,
        reporterId: user?.id,
        reason,
        source: opts?.source ?? 'profile',
        reportedUserName: opts?.reportedUserName,
      });
    },
    [user?.id]
  );

  const resetApp = () => {
    setUser(null);
    setMatches([]);
    setChats([]);
    setView('onboarding');
    setActiveChatId(null);
    setShowMatchOverlay(null);
    localStorage.removeItem('yene_user');
  };

  const deleteAccount = useCallback(() => {
    if (user?.id) removeRegisteredUser(user.id);
    setUser(null);
    setMatches([]);
    setChats([]);
    setView('onboarding');
    setActiveChatId(null);
    setShowMatchOverlay(null);
    localStorage.removeItem('yene_user');
    localStorage.removeItem('yene_matches');
    localStorage.removeItem('yene_chats');
  }, [user?.id]);

  const addMatch = (profile: UserProfile) => {
    const withPresence: UserProfile = {
      ...profile,
      lastSeenAt: profile.lastSeenAt ?? Date.now() - Math.floor(Math.random() * 3_600_000),
      isOnline: profile.isOnline ?? Math.random() > 0.45,
    };
    setMatches((prev) => [...prev, withPresence]);
    setChats((prev) => {
      if (prev.find((c) => c.id === profile.id)) return prev;
      return [
        ...prev,
        {
          id: profile.id,
          user: withPresence,
          lastMessage: "It's a match! Say hello.",
          messages: [],
        },
      ];
    });
  };

  const unmatchUser = (userId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== userId && m.username !== userId));
    setChats((prev) => prev.filter((c) => c.id !== userId && c.user.username !== userId));
  };

  const updateChatUser = useCallback((chatId: string, patch: Partial<UserProfile>) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, user: { ...c.user, ...patch } } : c))
    );
  }, []);

  const touchMyPresence = useCallback(() => {
    setUserState((prev) => {
      if (!prev) return prev;
      return { ...mergeDailyReset(prev), lastSeenAt: Date.now() };
    });
  }, []);

  const addMessage = (chatId: string, text: string) => {
    touchMyPresence();
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: `${Date.now()}-${Math.random()}`, // Add random key to force re-render
            senderId: 'me',
            text,
            timestamp: Date.now(),
            kind: 'text',
          };
          return {
            ...chat,
            lastMessage: text,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );
  };

  const addVoiceMessage = (chatId: string, audioUrl: string, durationSec: number) => {
    touchMyPresence();
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            text: '🎤 Voice message',
            timestamp: Date.now(),
            kind: 'voice',
            audioUrl,
            voiceDurationSec: durationSec,
          };
          return {
            ...chat,
            lastMessage: 'Voice message',
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );
  };

  const isUsernameTaken = (username: string) => {
    const normalized = username.trim().toLowerCase();
    if (!normalized) return false;
    if (user?.username?.toLowerCase() === normalized) return true;
    return (
      matches.some((m) => m.username?.toLowerCase() === normalized) ||
      chats.some((c) => c.user.username?.toLowerCase() === normalized) ||
      SAMPLE_PROFILES.some((p) => p.username?.toLowerCase() === normalized)
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        matches,
        addMatch,
        chats,
        addMessage,
        addVoiceMessage,
        view,
        setView,
        activeChatId,
        setActiveChatId,
        showMatchOverlay,
        setShowMatchOverlay,
        resetApp,
        isUsernameTaken,
        likesRemaining,
        tryConsumeLike,
        recordCardSeen,
        cardsRemainingInDeck,
        recordDiscoveryOpen,
        blockUser,
        unblockUser,
        isBlocked,
        reportUser,
        unmatchUser,
        updateChatUser,
        touchMyPresence,
        deleteAccount,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
