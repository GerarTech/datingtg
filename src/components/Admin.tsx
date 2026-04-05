import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Shield,
  XCircle,
  Users,
  Eye,
  Trash2,
  RefreshCw,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Flag,
  Link2,
  Settings,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  getPremiumConfig,
  setPremiumConfig,
  getAdminConfig,
  setAdminConfig,
  getCustomIcebreakerTemplates,
  setCustomIcebreakerTemplates,
  getRegisteredUsers,
  getReports,
  removeReport,
  removeRegisteredUser,
  getInviteUrl,
  setInviteUrl,
  getInterestTags,
  setInterestTags,
  type PremiumConfig,
  type ReportEntry,
} from '../lib/appSettings';
import { FREE_DAILY_LIKES, PLUS_DAILY_LIKES } from '../lib/yeneFeatures';

type VerificationRequest = {
  id: string;
  userId: string;
  selfieDataUrl: string;
  createdAt: number;
};

type AdminUser = {
  id: string;
  name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  phoneNumber?: string;
  telegramUsername?: string;
  createdAt?: number;
  premiumPlus?: boolean;
  premiumPackage?: 'basic' | 'plus' | 'premium' | 'daily' | 'hourly';
  photo?: string;
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
};

type Tab = 'overview' | 'verifications' | 'users' | 'subscribed' | 'reports' | 'app' | 'icebreakers' | 'pricing' | 'packages' | 'payment' | 'telegram' | 'settings';

export const Admin: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [users, setUsers] = useState<Record<string, AdminUser>>({});
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'plus' | 'premium' | 'daily' | 'hourly'>('plus');
  const [registry, setRegistry] = useState(() => getRegisteredUsers());
  const [reports, setReports] = useState<ReportEntry[]>(() => getReports());

  const [icebreakerText, setIcebreakerText] = useState('');
  const [premiumForm, setPremiumForm] = useState<PremiumConfig>(() => getPremiumConfig());
  const [adminConfigState, setAdminConfigState] = useState(() => getAdminConfig());
  const [inviteUrlField, setInviteUrlField] = useState(() => getInviteUrl());
  const [interestTagsField, setInterestTagsField] = useState(() => getInterestTags().join('\n'));
  
  // Payment settings state
  const [paymentConfig, setPaymentConfig] = useState({
    telebirrApiKey: '',
    telebirrSecretKey: '',
    telebirrMerchantId: '',
    chapaApiKey: '',
    chapaSecretKey: '',
    chapaMerchantId: '',
    enabledProviders: [] as string[],
  });
  
  // Telegram messaging state
  const [telegramMessage, setTelegramMessage] = useState('');
  const [telegramImageUrl, setTelegramImageUrl] = useState('');
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  
  // User editing state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFilters, setUserFilters] = useState({
    search: '',
    premiumStatus: 'all',
    verificationStatus: 'all',
    gender: 'all',
    sortBy: 'joinedAt'
  });

  // Filter users based on current filters
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = userFilters.search === '' || 
      user.name.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      user.id.toLowerCase().includes(userFilters.search.toLowerCase());
    
    const matchesPremium = userFilters.premiumStatus === 'all' || 
      (userFilters.premiumStatus === 'free' && !user.premiumPlus) ||
      (userFilters.premiumStatus === 'premium' && user.premiumPlus);
    
    const matchesVerification = userFilters.verificationStatus === 'all' || 
      (userFilters.verificationStatus === 'verified' && user.isVerified) ||
      (userFilters.verificationStatus === 'unverified' && !user.isVerified);
    
    const matchesGender = userFilters.gender === 'all' || user.gender === userFilters.gender;
    
    return matchesSearch && matchesPremium && matchesVerification && matchesGender;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (userFilters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'age':
        return (a.age || 0) - (b.age || 0);
      case 'joinedAt':
      return (a.createdAt || 0) - (b.createdAt || 0);
      default:
        return 0;
    }
  });

  const updateUserField = async (userId: string, field: string, value: any) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      await load();
      toast.success(`User ${field} updated successfully!`);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  // Save payment configuration to localStorage
  const savePaymentConfig = () => {
    localStorage.setItem('yene_payment_config', JSON.stringify(paymentConfig));
    toast.success('Payment API configuration saved!');
  };
    const sendTelegramMessage = async (newMessage: string, newImageUrl?: string) => {
    if (!adminConfigState.telegramBotToken) {
      toast.error('Telegram bot token not configured. Please set it in System Settings.');
      return;
    }

    setIsSendingTelegram(true);
    try {
      // Prepare payload for Telegram Bot API
      const payload = {
        text: newMessage,
        parse_mode: 'HTML' as const,
      };

      if (newImageUrl) {
        // Send photo with caption
        console.log('Sending to Telegram:', { ...payload, photo: newImageUrl });
        
        // In production, you would call Telegram Bot API here
        // For demo, we'll simulate the API call
        const botToken = adminConfigState.telegramBotToken; 
        const chatId = adminConfigState.telegramChatId; 
        
        // Send message with photo
        const photoPayload = {
          type: 'photo',
          media: newImageUrl,
          caption: newMessage,
          parse_mode: 'HTML'
        };
        
        // Simulate sending photo message
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            ...photoPayload
          })
        }).then(response => {
          if (response.ok) {
            console.log('Photo message sent successfully');
          } else {
            console.error('Failed to send photo message');
          }
        }).catch(error => {
          console.error('Error sending photo message:', error);
        });
      } else {
        // Send text message only
        console.log('Sending to Telegram:', payload);
        
        // Simulate sending text message
        await fetch(`https://api.telegram.org/bot${adminConfigState.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: adminConfigState.telegramChatId,
            ...payload
          })
        }).then(response => {
          if (response.ok) {
            console.log('Text message sent successfully');
          } else {
            console.error('Failed to send text message');
          }
        }).catch(error => {
          console.error('Error sending text message:', error);
        });
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent to Telegram bot successfully!');
      setTelegramMessage('');
      setTelegramImageUrl('');
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      toast.error('Failed to send message to Telegram bot.');
    } finally {
      setIsSendingTelegram(false);
    }
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading admin data...');
    try {
      const [reqRes, usersRes] = await Promise.all([
        fetch('/api/verification-requests'),
        fetch('/api/users'),
      ]);
      
      console.log('API responses:', { 
        verificationRequests: reqRes.ok ? 'success' : 'failed',
        users: usersRes.ok ? 'success' : 'failed',
        verificationStatus: reqRes.status,
        usersStatus: usersRes.status
      });

      if (reqRes.ok) {
        const reqData = (await reqRes.json()) as VerificationRequest[];
        setRequests(reqData);
        console.log('Loaded verification requests:', reqData.length);
      }

      if (usersRes.ok) {
        const allUsersData = (await usersRes.json()) as AdminUser[];
        console.log('Loaded users from API:', allUsersData.length);
        setAllUsers(allUsersData);
        const userMap: Record<string, AdminUser> = {};
        allUsersData.forEach((u) => {
          userMap[u.id] = u;
        });
        setUsers(userMap);
      } else {
        console.error('Failed to load users from API. Status:', usersRes.status);
        console.error('Response text:', await usersRes.text());
        
        if (usersRes.status === 404) {
          toast.error('Users API endpoint not found (404). Please check if the backend is running.');
        } else if (usersRes.status === 500) {
          toast.error('Server error (500). The backend encountered an error. Please check server logs.');
          
          // For development, load mock data if API fails
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Loading mock users data for development...');
            const mockUsers: AdminUser[] = [
              {
                id: 'user1',
                name: 'John Doe',
                age: 28,
                gender: 'Man',
                phoneNumber: '+1234567890',
                telegramUsername: '@johndoe',
                location: 'Addis Ababa',
                premiumPackage: 'premium',
                premiumPlus: true,
                photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                isVerified: true,
                verificationStatus: 'verified',
                createdAt: Date.now() - 86400000,
                interests: ['Sports', 'Music', 'Travel']
              },
              {
                id: 'user2',
                name: 'Jane Smith',
                age: 25,
                gender: 'Woman',
                phoneNumber: '+0987654321',
                telegramUsername: '@janesmith',
                location: 'Addis Ababa',
                premiumPackage: 'basic',
                premiumPlus: true,
                photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
                isVerified: false,
                verificationStatus: 'unverified',
                createdAt: Date.now() - 172800000,
                interests: ['Art', 'Reading', 'Cooking']
              }
            ];
            setAllUsers(mockUsers);
            const mockUserMap: Record<string, AdminUser> = {};
            mockUsers.forEach((u) => {
              mockUserMap[u.id] = u;
            });
            setUsers(mockUserMap);
            toast.success('Loaded mock user data for development');
          }
        } else {
          toast.error(`Failed to load users from API. Status: ${usersRes.status}`);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load admin data. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
    setRegistry(getRegisteredUsers());
    setReports(getReports());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sync = () => {
      setRegistry(getRegisteredUsers());
      setReports(getReports());
      setInviteUrlField(getInviteUrl());
      setInterestTagsField(getInterestTags().join('\n'));
    };
    window.addEventListener('yene-local-data', sync);
    return () => window.removeEventListener('yene-local-data', sync);
  }, []);

  useEffect(() => {
    const custom = getCustomIcebreakerTemplates();
    if (custom?.length) {
      setIcebreakerText(custom.join('\n'));
    } else {
      setIcebreakerText(
        [
          `Hey {name} — what's something you're excited about this week?`,
          'Coffee or tea first date? ☕',
          'If you could travel anywhere this weekend, where would it be?',
          `I saw you're into {interest} — what's your favorite thing about it?`,
        ].join('\n')
      );
    }
    setPremiumForm(getPremiumConfig());
    setAdminConfigState(getAdminConfig());
    
    // Load payment config from localStorage
    const savedPaymentConfig = localStorage.getItem('yene_payment_config');
    if (savedPaymentConfig) {
      try {
        const parsed = JSON.parse(savedPaymentConfig);
        setPaymentConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load payment config:', error);
      }
    }
  }, []);

  const saveIcebreakers = () => {
    const lines = icebreakerText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    setCustomIcebreakerTemplates(lines);
    toast.success('Icebreakers saved — chat will use these lines.');
  };

  const savePricing = () => {
    setPremiumConfig(premiumForm);
    toast.success('Premium settings saved — check the Plus modal in the app.');
  };

  const saveAppSettings = () => {
    setInviteUrl(inviteUrlField.trim());
    const tags = interestTagsField
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    setInterestTags(tags);
    toast.success('Invite link and interest tags saved.');
  };

  const saveAdminSettings = () => {
    setAdminConfig({
      telegramBotToken: adminConfigState.telegramBotToken.trim(),
      telegramChatId: adminConfigState.telegramChatId.trim(),
      recordTimeMinutes: Number(adminConfigState.recordTimeMinutes) || 1440,
      freeDailyLikes: Number(adminConfigState.freeDailyLikes) || FREE_DAILY_LIKES,
      plusDailyLikes: Number(adminConfigState.plusDailyLikes) || PLUS_DAILY_LIKES,
    });
    setAdminConfigState(getAdminConfig());
    toast.success('Admin config saved. Like limits and bot token are now stored.');
  };

  const approve = async (requestId: string, userId: string) => {
    try {
      await fetch(`/api/verification-requests/${requestId}/approve`, { method: 'POST' });
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true, verificationStatus: 'verified' }),
      });
      await load();
    } catch (error) {
      console.error('Failed to approve verification:', error);
    }
  };

  const decline = async (requestId: string) => {
    try {
      await fetch(`/api/verification-requests/${requestId}/decline`, { method: 'POST' });
      await load();
    } catch (error) {
      console.error('Failed to decline verification:', error);
    }
  };

  const updateUserVerification = async (userId: string, isVerified: boolean) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified, verificationStatus: isVerified ? 'verified' : 'unverified' }),
      });
      await load();
    } catch (error) {
      console.error('Failed to update user verification:', error);
    }
  };

  const toggleUserPremium = async (userId: string, premiumPlus: boolean, packageType?: 'basic' | 'plus' | 'premium' | 'daily' | 'hourly') => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premiumPlus, premiumPackage: premiumPlus ? (packageType || 'plus') : undefined }),
      });
      await load();
    } catch (error) {
      console.error('Failed to update user premium:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      await load();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const nav = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'verifications' as const, label: 'Verifications', icon: Shield },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'subscribed' as const, label: 'Subscribed Users', icon: CreditCard },
    { id: 'reports' as const, label: 'Reports', icon: Flag },
    { id: 'app' as const, label: 'App & invites', icon: Link2 },
    { id: 'icebreakers' as const, label: 'Icebreakers', icon: MessageCircle },
    { id: 'pricing' as const, label: 'Premium', icon: CreditCard },
    { id: 'payment' as const, label: 'Payment APIs', icon: Settings },
    { id: 'telegram' as const, label: 'Telegram Bot', icon: MessageCircle },
    { id: 'settings' as const, label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#06080f] text-white flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/[0.08] bg-[#080b14] shrink-0">
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#c45a00] flex items-center justify-center font-black text-sm shadow-lg shadow-[#FF8C00]/20">
              Y
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Console</p>
              <p className="font-bold text-sm tracking-tight">Yene Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/25'
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/90 border border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0 opacity-90" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-[#FF8C00] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Back to app
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 lg:px-8 py-4 border-b border-white/[0.08] bg-[#06080f]/90 backdrop-blur-xl">
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tight">
              {nav.find((n) => n.id === activeTab)?.label ?? 'Admin'}
            </h1>
            <p className="text-[11px] text-white/40 mt-0.5 font-medium">
              Operations & content — live data when API is available
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-semibold hover:bg-white/[0.1] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <div className="lg:hidden flex gap-1 p-3 bg-[#080b14] border-b border-white/[0.06] overflow-x-auto yene-scrollbar-thin">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold ${
                activeTab === item.id ? 'bg-[#FF8C00] text-white' : 'bg-white/5 text-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto yene-scrollbar">
          {isLoading &&
            activeTab !== 'icebreakers' &&
            activeTab !== 'pricing' &&
            activeTab !== 'reports' &&
            activeTab !== 'app' && (
            <p className="text-white/40 text-sm mb-4">Syncing…</p>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
                {[
                  { label: 'API users', value: allUsers.length, sub: 'Server directory' },
                  { label: 'Sign-ups (local)', value: registry.length, sub: 'This browser / device' },
                  { label: 'User reports', value: reports.length, sub: 'Discovery, chat & profile' },
                  { label: 'Pending reviews', value: requests.length, sub: 'Verification queue' },
                  { label: 'Free / Plus likes', value: `${adminConfigState.freeDailyLikes} / ${adminConfigState.plusDailyLikes}`, sub: 'Admin settings' },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-5"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-1">{card.label}</p>
                    <p className="text-2xl font-black text-white tabular-nums">{card.value}</p>
                    <p className="text-[11px] text-white/40 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#FF8C00] shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-bold text-white mb-1">Quick actions</h2>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                      Configure icebreaker prompts and premium copy from the sidebar. Local sign-ups are stored in
                      this browser for demo purposes.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('icebreakers')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF8C00]/20 border border-[#FF8C00]/30 text-sm font-bold text-[#FF8C00]"
                      >
                        Edit icebreakers
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('pricing')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/80"
                      >
                        Premium pricing
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="max-w-3xl space-y-4">
              {requests.length === 0 ? (
                <p className="text-white/40 text-sm py-12 text-center border border-dashed border-white/10 rounded-2xl">
                  No pending verification requests.
                </p>
              ) : (
                requests.map((r) => {
                  const u = users[r.userId];
                  return (
                    <div key={r.id} className="bg-[#080b14] border border-white/[0.08] rounded-2xl p-5">
                      <div className="flex gap-4 items-start">
                        <button type="button" onClick={() => setSelectedSelfie(r.selfieDataUrl)} className="flex-shrink-0">
                          <img
                            src={r.selfieDataUrl}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover hover:opacity-90"
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold">
                            {u?.name || 'Unknown'} {u?.age ? `, ${u.age}` : ''}
                          </p>
                          <p className="text-xs text-white/45 font-mono mt-1">{r.userId}</p>
                          <p className="text-[11px] text-white/35 mt-2">
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() => approve(r.id, r.userId)}
                              className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => decline(r.id)}
                              className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="max-w-3xl space-y-4">
              <p className="text-sm text-white/50 mb-4">
                Reports from Discovery (info modal), chat menu, and profile screens. Stored in this browser.
              </p>
              {reports.length === 0 ? (
                <p className="text-white/40 text-sm py-12 text-center border border-dashed border-white/10 rounded-2xl">
                  No reports yet.
                </p>
              ) : (
                reports.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-4 flex flex-wrap gap-4 items-start justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-white">
                        {r.reportedUserName || r.reportedUserId}{' '}
                        <span className="text-white/35 font-mono text-xs font-normal">({r.reportedUserId})</span>
                      </p>
                      <p className="text-xs text-white/45 mt-1">{r.reason}</p>
                      <p className="text-[10px] text-white/30 mt-2 uppercase tracking-widest">
                        {r.source} · reporter: {r.reporterId ?? '—'} ·{' '}
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeReport(r.id);
                        setReports(getReports());
                      }}
                      className="shrink-0 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10"
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'subscribed' && (
            <div className="space-y-8 max-w-5xl">
              <section>
                <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-3">
                  Premium Subscriptions
                </h2>
                {allUsers.filter(u => u.premiumPlus).length === 0 ? (
                  <p className="text-white/40 text-sm py-8 border border-dashed border-white/10 rounded-2xl text-center">
                    No premium subscribers yet.
                  </p>
                ) : (
                  <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.04] text-left text-[10px] uppercase tracking-widest text-white/40">
                          <th className="px-4 py-3 font-black">User</th>
                          <th className="px-4 py-3 font-black">Package</th>
                          <th className="px-4 py-3 font-black">Since</th>
                          <th className="px-4 py-3 font-black">Status</th>
                          <th className="px-4 py-3 font-black text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.filter(u => u.premiumPlus).map((user) => (
                          <tr key={user.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60'}
                                  alt=""
                                  className="w-10 h-10 rounded-xl object-cover border-2 border-white/10"
                                />
                                <div>
                                  <p className="font-bold text-white">{user.name}</p>
                                  <p className="text-xs text-white/50">{user.age} years old</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "px-2 py-1 rounded-lg text-xs font-bold",
                                user.premiumPackage === 'basic' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                                user.premiumPackage === 'plus' && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                                user.premiumPackage === 'premium' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                                user.premiumPackage === 'daily' && "bg-green-500/20 text-green-400 border border-green-500/30",
                                user.premiumPackage === 'hourly' && "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              )}>
                                {user.premiumPackage || 'Free'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white/60 text-xs">
                              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold text-green-400">
                                Active
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(user)}
                                className="p-1 rounded bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                                title="View details"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8 max-w-7xl">
              {/* Filter Controls */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Filter Users</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Search</label>
                    <input
                      type="text"
                      value={userFilters.search}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Search by name or email..."
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Gender</label>
                    <select
                      value={userFilters.gender}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    >
                      <option value="all">All Genders</option>
                      <option value="Man">Men</option>
                      <option value="Woman">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Premium Status</label>
                    <select
                      value={userFilters.premiumStatus}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, premiumStatus: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    >
                      <option value="all">All Users</option>
                      <option value="free">Free Only</option>
                      <option value="premium">Premium Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Verification</label>
                    <select
                      value={userFilters.verificationStatus}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    >
                      <option value="all">All Users</option>
                      <option value="verified">Verified Only</option>
                      <option value="unverified">Unverified Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Sort By</label>
                    <select
                      value={userFilters.sortBy}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    >
                      <option value="joinedAt">Join Date</option>
                      <option value="name">Name</option>
                      <option value="age">Age</option>
                    </select>
                  </div>
                </div>
              </div>

              <section>
                <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-3">
                  All sign-ups (this device)
                </h2>
                {registry.length === 0 ? (
                  <p className="text-white/40 text-sm py-8 border border-dashed border-white/10 rounded-2xl text-center">
                    No local registrations yet. Complete onboarding in the app on this device.
                  </p>
                ) : (
                  <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.04] text-left text-[10px] uppercase tracking-widest text-white/40">
                          <th className="px-4 py-3 font-black">Name</th>
                          <th className="px-4 py-3 font-black">Username</th>
                          <th className="px-4 py-3 font-black">Joined</th>
                          <th className="px-4 py-3 font-black">Intent</th>
                          <th className="px-4 py-3 font-black text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registry.map((r) => (
                          <tr key={r.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-medium">{r.name}</td>
                            <td className="px-4 py-3 text-white/50 font-mono text-xs">{r.username ?? '—'}</td>
                            <td className="px-4 py-3 text-white/45 text-xs">
                              {new Date(r.joinedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-white/50 text-xs">{r.datingIntent ?? '—'}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!confirm(`Remove ${r.name} from the local registry?`)) return;
                                  removeRegisteredUser(r.id);
                                  setRegistry(getRegisteredUsers());
                                }}
                                className="text-xs font-bold text-red-400 hover:underline"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-3">API users</h2>
                {allUsers.length === 0 ? (
                  <p className="text-white/40 text-sm py-8 border border-dashed border-white/10 rounded-2xl text-center">
                    No users from API. Start the backend or check your network.
                  </p>
                ) : (
                  <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.04] text-left text-[10px] uppercase tracking-widest text-white/40">
                          <th className="px-4 py-3 font-black">User</th>
                          <th className="px-4 py-3 font-black">Gender</th>
                          <th className="px-4 py-3 font-black">Phone</th>
                          <th className="px-4 py-3 font-black">Details</th>
                          <th className="px-4 py-3 font-black">Premium</th>
                          <th className="px-4 py-3 font-black">Verified</th>
                          <th className="px-4 py-3 font-black text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedUsers.map((user) => (
                          <tr key={user.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60'}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/10"
                                />
                                <div>
                                  <p className="font-bold text-white">{user.name}</p>
                                  <p className="text-xs text-white/50">{user.age} years old</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-white/60 font-medium">
                                {user.gender || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-white/60 font-mono">
                                {user.phoneNumber || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs text-white/60">
                                <p>{user.location || '—'}</p>
                                <p>{user.telegramUsername ? `@${user.telegramUsername}` : '—'}</p>
                                <p>Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={user.premiumPackage || 'none'}
                                onChange={(e) => {
                                  const pkg = e.target.value;
                                  if (pkg === 'none' || pkg === 'free') {
                                    toggleUserPremium(user.id, false);
                                  } else {
                                    toggleUserPremium(user.id, true, pkg as 'basic' | 'plus' | 'premium' | 'daily' | 'hourly');
                                  }
                                }}
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                              >
                                <option value="none">Free</option>
                                <option value="basic">Basic</option>
                                <option value="plus">Plus</option>
                                <option value="premium">Premium</option>
                                <option value="daily">Daily</option>
                                <option value="hourly">Hourly</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold ${user.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                                {user.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUser(user)}
                                  className="p-1 rounded bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                                  title="View details"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateUserVerification(user.id, !user.isVerified)}
                                  className="p-1 rounded bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                                  title="Toggle verification"
                                >
                                  <Shield className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!confirm(`Delete ${user.name}? This action cannot be undone.`)) return;
                                    deleteUser(user.id);
                                  }}
                                  className="p-1 rounded bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="max-w-2xl space-y-6">
              <p className="text-sm text-white/50 leading-relaxed">
                Stored in this browser. The invite URL is used for &quot;Invite friends&quot; share/copy. Interest tags
                power onboarding and edit-profile pickers.
              </p>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  Invite / app URL
                </label>
                <input
                  value={inviteUrlField}
                  onChange={(e) => setInviteUrlField(e.target.value)}
                  placeholder="https://yoursite.com or app store link"
                  className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  Interest tags (comma or newline)
                </label>
                <textarea
                  value={interestTagsField}
                  onChange={(e) => setInterestTagsField(e.target.value)}
                  rows={10}
                  className="w-full rounded-2xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm font-mono text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  placeholder={'Travel\nMusic\nFitness'}
                />
              </div>
              <button
                type="button"
                onClick={saveAppSettings}
                className="px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-black text-sm shadow-lg shadow-[#FF8C00]/20"
              >
                Save app settings
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <p className="text-sm text-white/50 leading-relaxed">
                System settings for admin operations. Changes are stored locally and affect the app behavior instantly.
              </p>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  Telegram bot token
                </label>
                <input
                  value={adminConfigState.telegramBotToken}
                  onChange={(e) => setAdminConfigState((prev) => ({ ...prev, telegramBotToken: e.target.value }))}
                  placeholder="123456789:ABCdefGhIJKlmnoPQRstUVwxyZ"
                  className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  Telegram chat ID
                </label>
                <input
                  value={adminConfigState.telegramChatId}
                  onChange={(e) => setAdminConfigState((prev) => ({ ...prev, telegramChatId: e.target.value }))}
                  placeholder="@channel_name or chat_id"
                  className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                    Record time window (minutes)
                  </label>
                  <input
                    type="number"
                    value={adminConfigState.recordTimeMinutes}
                    onChange={(e) => setAdminConfigState((prev) => ({ ...prev, recordTimeMinutes: Number(e.target.value) || 1440 }))}
                    min={60}
                    className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                    Free daily likes
                  </label>
                  <input
                    type="number"
                    value={adminConfigState.freeDailyLikes}
                    onChange={(e) => setAdminConfigState((prev) => ({ ...prev, freeDailyLikes: Number(e.target.value) || FREE_DAILY_LIKES }))}
                    min={0}
                    className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                    Plus daily likes
                  </label>
                  <input
                    type="number"
                    value={adminConfigState.plusDailyLikes}
                    onChange={(e) => setAdminConfigState((prev) => ({ ...prev, plusDailyLikes: Number(e.target.value) || PLUS_DAILY_LIKES }))}
                    min={0}
                    className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={saveAdminSettings}
                className="px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-black text-sm shadow-lg shadow-[#FF8C00]/20"
              >
                Save system settings
              </button>
            </div>
          )}

          {activeTab === 'icebreakers' && (
            <div className="max-w-2xl space-y-4">
              <p className="text-sm text-white/50 leading-relaxed">
                One icebreaker per line. Use <code className="text-[#FF8C00]">{`{name}`}</code> and{' '}
                <code className="text-[#FF8C00]">{`{interest}`}</code> for personalization. Saved to this browser;
                chat loads these for all users.
              </p>
              <textarea
                value={icebreakerText}
                onChange={(e) => setIcebreakerText(e.target.value)}
                rows={12}
                className="w-full rounded-2xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm font-mono text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                placeholder="Hey {name} — ..."
              />
              <button
                type="button"
                onClick={saveIcebreakers}
                className="px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-black text-sm shadow-lg shadow-[#FF8C00]/20"
              >
                Save icebreakers
              </button>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex gap-2 mb-4">
                {(['basic', 'plus', 'premium', 'daily', 'hourly'] as const).map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      selectedPackage === pkg
                        ? 'bg-[#FF8C00] text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                  </button>
                ))}
              </div>

              {(['basic', 'plus', 'premium', 'daily', 'hourly'] as const).map((pkg) => {
                const currentPkg = premiumForm.packages[pkg];
                return (
                  <div key={pkg} className={selectedPackage === pkg ? 'block' : 'hidden'}>
                    <h3 className="text-lg font-bold mb-4">{currentPkg.name} Package</h3>
                    <div className="max-w-xl space-y-5">
                      <p className="text-sm text-white/50">
                        Configure the {pkg} package pricing and features.
                      </p>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Package Name</label>
                      <input
                        value={currentPkg.name}
                        onChange={(e) => setPremiumForm((p) => ({
                          ...p,
                          packages: {
                            ...p.packages,
                            [pkg]: { ...p.packages[pkg], name: e.target.value }
                          }
                        }))}
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Price label</label>
                      <input
                        value={currentPkg.priceLabel}
                        onChange={(e) => setPremiumForm((p) => ({
                          ...p,
                          packages: {
                            ...p.packages,
                            [pkg]: { ...p.packages[pkg], priceLabel: e.target.value }
                          }
                        }))}
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Subtitle</label>
                      <input
                        value={currentPkg.priceSubtext}
                        onChange={(e) => setPremiumForm((p) => ({
                          ...p,
                          packages: {
                            ...p.packages,
                            [pkg]: { ...p.packages[pkg], priceSubtext: e.target.value }
                          }
                        }))}
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Billing note</label>
                      <input
                        value={currentPkg.billingNote}
                        onChange={(e) => setPremiumForm((p) => ({
                          ...p,
                          packages: {
                            ...p.packages,
                            [pkg]: { ...p.packages[pkg], billingNote: e.target.value }
                          }
                        }))}
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">
                        Detail bullets (one per line)
                      </label>
                      <textarea
                        value={currentPkg.detailBullets.join('\n')}
                        onChange={(e) =>
                          setPremiumForm((p) => ({
                            ...p,
                            packages: {
                              ...p.packages,
                              [pkg]: {
                                ...p.packages[pkg],
                                detailBullets: e.target.value.split('\n').map((l) => l.replace(/^•\s*/, '').trim()).filter(Boolean)
                              }
                            }
                          }))
                        }
                        rows={6}
                        className="w-full rounded-2xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Features</label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(currentPkg.features).map(([feature, enabled]) => (
                            <label key={feature} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) => setPremiumForm((p) => ({
                                  ...p,
                                  packages: {
                                    ...p.packages,
                                    [pkg]: {
                                      ...p.packages[pkg],
                                      features: {
                                        ...p.packages[pkg].features,
                                        [feature]: e.target.checked
                                      }
                                    }
                                  }
                                }))}
                                className="rounded"
                              />
                              <span className="text-sm text-white/70 capitalize">
                                {feature.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={savePricing}
                className="px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-black text-sm"
              >
                Save premium settings
              </button>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="max-w-2xl space-y-6">
              <p className="text-sm text-white/50 leading-relaxed">
                Configure payment provider APIs (Telebirr and Chapa). These settings are stored locally and would be used for real payment processing in production.
              </p>
              
              <div className="space-y-8">
                {/* Telebirr Configuration */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Telebirr</h3>
                      <p className="text-xs text-white/40">Ethiopian mobile payment platform</p>
                    </div>
                    <label className="ml-auto flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentConfig.enabledProviders.includes('telebirr')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPaymentConfig(prev => ({
                              ...prev,
                              enabledProviders: [...prev.enabledProviders, 'telebirr']
                            }));
                          } else {
                            setPaymentConfig(prev => ({
                              ...prev,
                              enabledProviders: prev.enabledProviders.filter(p => p !== 'telebirr')
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-white/70">Enabled</span>
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">API Key</label>
                      <input
                        type="password"
                        value={paymentConfig.telebirrApiKey}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, telebirrApiKey: e.target.value }))}
                        placeholder="Enter Telebirr API key"
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Secret Key</label>
                      <input
                        type="password"
                        value={paymentConfig.telebirrSecretKey}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, telebirrSecretKey: e.target.value }))}
                        placeholder="Enter Telebirr secret key"
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Merchant ID</label>
                      <input
                        type="text"
                        value={paymentConfig.telebirrMerchantId}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, telebirrMerchantId: e.target.value }))}
                        placeholder="Enter merchant ID"
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Chapa Configuration */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Chapa</h3>
                      <p className="text-xs text-white/40">African payment gateway</p>
                    </div>
                    <label className="ml-auto flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentConfig.enabledProviders.includes('chapa')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPaymentConfig(prev => ({
                              ...prev,
                              enabledProviders: [...prev.enabledProviders, 'chapa']
                            }));
                          } else {
                            setPaymentConfig(prev => ({
                              ...prev,
                              enabledProviders: prev.enabledProviders.filter(p => p !== 'chapa')
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-white/70">Enabled</span>
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">API Key</label>
                      <input
                        type="password"
                        value={paymentConfig.chapaApiKey}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, chapaApiKey: e.target.value }))}
                        placeholder="Enter Chapa API key"
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Secret Key</label>
                      <input
                        type="password"
                        value={paymentConfig.chapaSecretKey}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, chapaSecretKey: e.target.value }))}
                        placeholder="Enter Chapa secret key"
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Merchant ID</label>
                      <input
                        type="text"
                        value={paymentConfig.chapaMerchantId}
                        onChange={(e) => setPaymentConfig(prev => ({ ...prev, chapaMerchantId: e.target.value }))}
                        placeholder="Enter merchant ID"
                        className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={savePaymentConfig}
                className="px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-black text-sm shadow-lg shadow-[#FF8C00]/20"
              >
                Save payment settings
              </button>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="max-w-2xl space-y-6">
              <p className="text-sm text-white/50 leading-relaxed">
                Send messages, images, and content to your Telegram bot. Configure the bot token in System Settings first.
              </p>
              
              <div className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Send Message to Bot</h3>
                    <p className="text-xs text-white/40">Broadcast to all bot subscribers</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Message Content</label>
                    <textarea
                      value={telegramMessage}
                      onChange={(e) => setTelegramMessage(e.target.value)}
                      placeholder="Enter your message here... (HTML formatting supported)"
                      rows={4}
                      className="w-full rounded-2xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm font-mono text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Image URL (optional)</label>
                    <input
                      type="url"
                      value={telegramImageUrl}
                      onChange={(e) => setTelegramImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-xl bg-[#080b14] border border-white/10 px-4 py-3 text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => sendTelegramMessage(telegramMessage)}
                      disabled={!telegramMessage.trim() || isSendingTelegram}
                      className="flex-1 px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-black text-sm shadow-lg shadow-[#FF8C00]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSendingTelegram ? 'Sending...' : 'Send Message'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => sendTelegramMessage(telegramMessage, telegramImageUrl)}
                      disabled={!telegramMessage.trim() || isSendingTelegram}
                      className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSendingTelegram ? 'Sending...' : 'Send with Image'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTelegramMessage('🔥 New features are live! Check out the latest updates in Yene Dating App.')}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <div className="font-bold text-white mb-1">Feature Announcement</div>
                    <div className="text-xs text-white/40">Notify about new app features</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setTelegramMessage('💕 Weekend special! Upgrade to Premium and get 50% off. Limited time offer!')}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <div className="font-bold text-white mb-1">Promotional Offer</div>
                    <div className="text-xs text-white/40">Send special deals and discounts</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setTelegramMessage('📊 Weekly stats: 1,234 new matches made! Keep swiping and find your perfect match.')}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <div className="font-bold text-white mb-1">Weekly Stats</div>
                    <div className="text-xs text-white/40">Share community achievements</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setTelegramMessage('🎉 Congratulations to our latest premium members! Enjoy unlimited swipes and exclusive features.')}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <div className="font-bold text-white mb-1">Welcome Message</div>
                    <div className="text-xs text-white/40">Greet new premium members</div>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#080b14] p-6">
                <h3 className="text-lg font-bold text-white mb-4">Bot Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Bot Token</span>
                    <span className={`text-xs font-bold ${adminConfigState.telegramBotToken ? 'text-green-400' : 'text-red-400'}`}>
                      {adminConfigState.telegramBotToken ? 'Configured' : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Chat ID</span>
                    <span className={`text-xs font-bold ${adminConfigState.telegramChatId ? 'text-green-400' : 'text-red-400'}`}>
                      {adminConfigState.telegramChatId ? 'Configured' : 'Not Set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-[#080b14] border border-white/[0.1] rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto yene-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">User Details</h2>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl bg-white/5 border border-white/10"
              >
                <XCircle className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <div className="flex gap-4 mb-6">
              <img
                src={selectedUser.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60'}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover mx-auto"
              />
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Name</label>
                    <input
                      type="text"
                      value={selectedUser.name || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Age</label>
                    <input
                      type="number"
                      value={selectedUser.age || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Location</label>
                    <input
                      type="text"
                      value={selectedUser.location || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, location: e.target.value } : null)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Phone</label>
                    <input
                      type="text"
                      value={selectedUser.phoneNumber || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Telegram</label>
                    <input
                      type="text"
                      value={selectedUser.telegramUsername || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, telegramUsername: e.target.value } : null)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Premium Package</label>
                    <select
                      value={selectedUser.premiumPackage || 'none'}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, premiumPackage: e.target.value } : null)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    >
                      <option value="none">Free</option>
                      <option value="basic">Basic</option>
                      <option value="plus">Plus</option>
                      <option value="premium">Premium</option>
                      <option value="daily">Daily</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingUser) {
                        updateUserField(selectedUser.id, 'name', editingUser.name);
                        updateUserField(selectedUser.id, 'age', editingUser.age);
                        updateUserField(selectedUser.id, 'location', editingUser.location);
                        updateUserField(selectedUser.id, 'phoneNumber', editingUser.phoneNumber);
                        updateUserField(selectedUser.id, 'telegramUsername', editingUser.telegramUsername);
                        updateUserField(selectedUser.id, 'premiumPackage', editingUser.premiumPackage);
                        setEditingUser(null);
                      }
                    }}
                    disabled={!editingUser}
                    className="flex-1 px-6 py-3 rounded-xl bg-[#FF8C00] text-white font-black text-sm shadow-lg shadow-[#FF8C00]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {editingUser ? 'Save Changes' : 'Edit User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSelfie && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="relative max-w-2xl max-h-[80vh]">
            <button
              type="button"
              onClick={() => setSelectedSelfie(null)}
              className="absolute -top-12 right-0 p-3 rounded-2xl bg-white/10"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img src={selectedSelfie} alt="" className="w-full h-full object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
