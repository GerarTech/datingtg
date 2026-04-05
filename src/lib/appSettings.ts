/** Client-side app config (admin-editable, persisted in localStorage) */

import { FREE_DAILY_LIKES, ICEBREAKERS, PLUS_DAILY_LIKES } from './yeneFeatures';

const KEY_PREMIUM = 'yene_premium_config';
const KEY_ADMIN = 'yene_admin_config';
const KEY_ICEBREAKERS = 'yene_custom_icebreakers';
const KEY_REGISTRY = 'yene_registered_users';
const KEY_REPORTS = 'yene_user_reports';
const KEY_INVITE_URL = 'yene_invite_url';
const KEY_INTEREST_TAGS = 'yene_interest_tags';

const DEFAULT_INTEREST_TAGS = [
  'Travel',
  'Music',
  'Fitness',
  'Art',
  'Coffee',
  'Gaming',
  'Cooking',
  'Movies',
  'Tech',
  'Nature',
  'Ludo',
  'Football',
  'Cricket',
  'Gym',
  'Manga',
  'Sushi',
];

/** Fire when localStorage-backed config changes so UI can re-read (same tab). */
export function notifyLocalDataChanged(): void {
  window.dispatchEvent(new CustomEvent('yene-local-data'));
}

export type PremiumPackage = {
  name: string;
  priceLabel: string;
  priceSubtext: string;
  billingNote: string;
  detailBullets: string[];
  features: {
    unlimitedLikes: boolean;
    superLikes: boolean;
    rewind: boolean;
    boost: boolean;
    passport: boolean;
    hideLastSeen: boolean;
    seeWhoLikedYou: boolean;
    topPicks: boolean;
    advancedFilters: boolean;
  };
};

export type PremiumConfig = {
  packages: {
    basic: PremiumPackage;
    plus: PremiumPackage;
    premium: PremiumPackage;
    daily: PremiumPackage;
    hourly: PremiumPackage;
  };
};

export type AdminConfig = {
  telegramBotToken: string;
  telegramChatId: string;
  recordTimeMinutes: number;
  freeDailyLikes: number;
  plusDailyLikes: number;
};

const defaultAdminConfig = (): AdminConfig => ({
  telegramBotToken: '',
  telegramChatId: '',
  recordTimeMinutes: 1440,
  freeDailyLikes: FREE_DAILY_LIKES,
  plusDailyLikes: PLUS_DAILY_LIKES,
});

export type RegisteredUserSnapshot = {
  id: string;
  name: string;
  username?: string;
  joinedAt: number;
  gender?: string;
  datingIntent?: string;
};

const defaultPremium = (): PremiumConfig => ({
  packages: {
    basic: {
      name: 'Basic',
      priceLabel: '$4.99/mo',
      priceSubtext: 'Essential features',
      billingNote: 'Demo: Basic is toggled locally',
      detailBullets: [
        '5 Super Likes per day',
        'See who liked you',
        'Basic filters',
      ],
      features: {
        unlimitedLikes: false,
        superLikes: true,
        rewind: false,
        boost: false,
        passport: false,
        hideLastSeen: false,
        seeWhoLikedYou: true,
        topPicks: false,
        advancedFilters: false,
      },
    },
    plus: {
      name: 'Plus',
      priceLabel: '$9.99/mo',
      priceSubtext: 'Most popular',
      billingNote: 'Demo: Plus is toggled locally',
      detailBullets: [
        `${PLUS_DAILY_LIKES} likes per day (vs ${FREE_DAILY_LIKES} free)`,
        '5 Super Likes per day',
        'Rewind your last swipe',
        'Hide your last seen from others',
        'See who liked you',
        'Advanced filters',
      ],
      features: {
        unlimitedLikes: false,
        superLikes: true,
        rewind: true,
        boost: false,
        passport: false,
        hideLastSeen: true,
        seeWhoLikedYou: true,
        topPicks: false,
        advancedFilters: true,
      },
    },
    premium: {
      name: 'Premium',
      priceLabel: '$19.99/mo',
      priceSubtext: 'All features unlocked',
      billingNote: 'Demo: Premium is toggled locally',
      detailBullets: [
        'Unlimited likes',
        '10 Super Likes per day',
        'Rewind unlimited',
        '5 Boosts per month',
        'Passport: Change location anytime',
        'Hide last seen',
        'See who liked you',
        'Top Picks: Curated matches',
        'Advanced filters & preferences',
      ],
      features: {
        unlimitedLikes: true,
        superLikes: true,
        rewind: true,
        boost: true,
        passport: true,
        hideLastSeen: true,
        seeWhoLikedYou: true,
        topPicks: true,
        advancedFilters: true,
      },
    },
    daily: {
      name: 'Daily',
      priceLabel: '$1.99/day',
      priceSubtext: 'Daily boost',
      billingNote: 'Demo: Daily is toggled locally',
      detailBullets: [
        'Unlimited likes for 24 hours',
        'See who liked you',
        'Top Picks access',
      ],
      features: {
        unlimitedLikes: true,
        superLikes: false,
        rewind: false,
        boost: false,
        passport: false,
        hideLastSeen: false,
        seeWhoLikedYou: true,
        topPicks: true,
        advancedFilters: false,
      },
    },
    hourly: {
      name: 'Hourly',
      priceLabel: '$0.49/hr',
      priceSubtext: 'Quick boost',
      billingNote: 'Demo: Hourly is toggled locally',
      detailBullets: [
        'Unlimited likes for 1 hour',
        'Super Likes',
      ],
      features: {
        unlimitedLikes: true,
        superLikes: true,
        rewind: false,
        boost: false,
        passport: false,
        hideLastSeen: false,
        seeWhoLikedYou: false,
        topPicks: false,
        advancedFilters: false,
      },
    },
  },
});

export function getPremiumConfig(): PremiumConfig {
  try {
    const raw = localStorage.getItem(KEY_PREMIUM);
    if (!raw) return defaultPremium();
    const parsed = JSON.parse(raw) as Partial<PremiumConfig>;
    const d = defaultPremium();
    return {
      packages: {
        basic: { ...d.packages.basic, ...parsed.packages?.basic },
        plus: { ...d.packages.plus, ...parsed.packages?.plus },
        premium: { ...d.packages.premium, ...parsed.packages?.premium },
        daily: { ...d.packages.daily, ...parsed.packages?.daily },
        hourly: { ...d.packages.hourly, ...parsed.packages?.hourly },
      },
    };
  } catch {
    return defaultPremium();
  }
}

export function setPremiumConfig(config: PremiumConfig): void {
  localStorage.setItem(KEY_PREMIUM, JSON.stringify(config));
}

export function getAdminConfig(): AdminConfig {
  try {
    const raw = localStorage.getItem(KEY_ADMIN);
    if (!raw) return defaultAdminConfig();
    const parsed = JSON.parse(raw) as Partial<AdminConfig>;
    const d = defaultAdminConfig();
    return {
      telegramBotToken: parsed.telegramBotToken ?? d.telegramBotToken,
      telegramChatId: parsed.telegramChatId ?? d.telegramChatId,
      recordTimeMinutes: parsed.recordTimeMinutes ?? d.recordTimeMinutes,
      freeDailyLikes: parsed.freeDailyLikes ?? d.freeDailyLikes,
      plusDailyLikes: parsed.plusDailyLikes ?? d.plusDailyLikes,
    };
  } catch {
    return defaultAdminConfig();
  }
}

export function setAdminConfig(config: AdminConfig): void {
  localStorage.setItem(KEY_ADMIN, JSON.stringify(config));
  notifyLocalDataChanged();
}

/** Lines may include `{name}` and `{interest}` placeholders */
export function getCustomIcebreakerTemplates(): string[] | null {
  try {
    const raw = localStorage.getItem(KEY_ICEBREAKERS);
    if (!raw) return null;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch {
    return null;
  }
}

export function setCustomIcebreakerTemplates(lines: string[]): void {
  localStorage.setItem(KEY_ICEBREAKERS, JSON.stringify(lines));
  notifyLocalDataChanged();
}

export function resolveIcebreakerLines(theirName: string, sharedInterest?: string): string[] {
  const custom = getCustomIcebreakerTemplates();
  if (custom && custom.length > 0) {
    return custom.map((line) =>
      line
        .replace(/\{name\}/gi, theirName)
        .replace(/\{interest\}/gi, sharedInterest || 'your interests')
    );
  }
  return ICEBREAKERS(theirName, sharedInterest);
}

export function registerSignedUpUser(snapshot: RegisteredUserSnapshot): void {
  try {
    const raw = localStorage.getItem(KEY_REGISTRY);
    const list: RegisteredUserSnapshot[] = raw ? JSON.parse(raw) : [];
    if (list.some((u) => u.id === snapshot.id)) return;
    list.unshift(snapshot);
    localStorage.setItem(KEY_REGISTRY, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* ignore */
  }
}

export function getRegisteredUsers(): RegisteredUserSnapshot[] {
  try {
    const raw = localStorage.getItem(KEY_REGISTRY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RegisteredUserSnapshot[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function removeRegisteredUser(userId: string): void {
  try {
    const list = getRegisteredUsers().filter((u) => u.id !== userId);
    localStorage.setItem(KEY_REGISTRY, JSON.stringify(list));
    notifyLocalDataChanged();
  } catch {
    /* ignore */
  }
}

export type ReportEntry = {
  id: string;
  reportedUserId: string;
  reportedUserName?: string;
  reporterId?: string;
  reason: string;
  source: 'discovery' | 'profile' | 'chat';
  createdAt: number;
};

export function addReport(entry: Omit<ReportEntry, 'id' | 'createdAt'> & { id?: string }): ReportEntry {
  const full: ReportEntry = {
    id: entry.id ?? `rep-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    reportedUserId: entry.reportedUserId,
    reportedUserName: entry.reportedUserName,
    reporterId: entry.reporterId,
    reason: entry.reason,
    source: entry.source,
    createdAt: Date.now(),
  };
  try {
    const raw = localStorage.getItem(KEY_REPORTS);
    const list: ReportEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(full);
    localStorage.setItem(KEY_REPORTS, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* ignore */
  }
  notifyLocalDataChanged();
  return full;
}

export function getReports(): ReportEntry[] {
  try {
    const raw = localStorage.getItem(KEY_REPORTS);
    if (!raw) return [];
    const list = JSON.parse(raw) as ReportEntry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function removeReport(reportId: string): void {
  try {
    const list = getReports().filter((r) => r.id !== reportId);
    localStorage.setItem(KEY_REPORTS, JSON.stringify(list));
    notifyLocalDataChanged();
  } catch {
    /* ignore */
  }
}

/** Invite / share link for “Invite friends” — set in admin; falls back to site origin */
export function getInviteUrl(): string {
  try {
    const u = localStorage.getItem(KEY_INVITE_URL)?.trim();
    if (u) return u;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function setInviteUrl(url: string): void {
  try {
    localStorage.setItem(KEY_INVITE_URL, url.trim());
    notifyLocalDataChanged();
  } catch {
    /* ignore */
  }
}

/** Interest tags shown in onboarding & edit profile — editable in admin */
export function getInterestTags(): string[] {
  try {
    const raw = localStorage.getItem(KEY_INTEREST_TAGS);
    if (!raw) return [...DEFAULT_INTEREST_TAGS];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const tags = parsed.map((t) => String(t).trim()).filter(Boolean);
      return tags.length > 0 ? tags : [...DEFAULT_INTEREST_TAGS];
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_INTEREST_TAGS];
}

export function setInterestTags(tags: string[]): void {
  const cleaned = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
  try {
    localStorage.setItem(KEY_INTEREST_TAGS, JSON.stringify(cleaned.length > 0 ? cleaned : DEFAULT_INTEREST_TAGS));
    notifyLocalDataChanged();
  } catch {
    /* ignore */
  }
}
