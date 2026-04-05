import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, UserProfile } from '../context/AppContext';
import { Settings, LogOut, Shield, Heart, MapPin, Edit3, Camera, ChevronRight, Share2, RefreshCw, Star, EyeOff, UserX, Gift, Clock, Trash2, X, Plus, TrendingUp, Eye, Sparkles, Filter, Sun, Moon } from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';
import { FREE_DAILY_LIKES, PLUS_DAILY_LIKES, SLOW_DECK_DAILY_CARDS } from '../lib/yeneFeatures';
import { getAdminConfig } from '../lib/appSettings';
import { getPremiumConfig, getInviteUrl, getInterestTags } from '../lib/appSettings';
import type { ProfileViewLocationState } from '../lib/profileNavigation';
import { useLocalDataRevision } from '../hooks/useLocalDataRevision';

type ProfileLocationState = { openMatches?: boolean };

export const Profile: React.FC = () => {
  const { user, resetApp, setUser, updateUser, matches, likesRemaining, deleteAccount, theme, setTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [showTopPicks, setShowTopPicks] = useState(false);
  const [showGoPlus, setShowGoPlus] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const st = location.state as ProfileLocationState | null;
    if (st?.openMatches) {
      navigate('/chats', { state: { openMatches: true } });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const handlePhotoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateUser({ photo: reader.result });
        toast.success('Profile photo updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = () => {
    hapticFeedback();
    setShowEditModal(true);
  };

  const handleMatchesClick = () => {
    hapticFeedback();
    if (!user?.premiumPlus || !getPremiumConfig().packages[user.premiumPackage || 'plus'].features.seeWhoLikedYou) {
      toast.message('See Who Liked You is a Premium feature', {
        description: 'Upgrade to view people who liked you.',
      });
      setShowGoPlus(true);
      return;
    }
    setShowMatches(true);
  };

  const handleGoPlusClick = () => {
    hapticFeedback();
    setShowGoPlus(true);
  };

  const adminConfig = getAdminConfig();

  const handleTopPicksClick = () => {
    hapticFeedback();
    if (!user?.premiumPlus || !getPremiumConfig().packages[user.premiumPackage || 'plus'].features.topPicks) {
      toast.message('Top Picks is a Premium feature', { description: 'Upgrade to see curated top matches.' });
      setShowGoPlus(true);
      return;
    }
    navigate('/top-picks');
  };

  const handleGalleryClick = () => {
    hapticFeedback();
    setShowGallery(true);
  };

  const handleVerificationClick = () => {
    hapticFeedback();
    setShowVerification(true);
  };

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city name
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        const city = data.city || data.locality || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        updateUser({ location: city, latitude, longitude });
        toast.success('Location updated!');
      } catch (error) {
        const locationString = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        updateUser({ location: locationString, latitude, longitude });
        toast.success('Location updated!');
      }
    } catch (error) {
      toast.error('Unable to get your location. Please check your permissions.');
    }
  };

  const refreshUserData = async () => {
    if (!user?.id) return;

    const tryUrls = [
      `/api/users/${user.id}`,
      `http://localhost:8001/users/${user.id}`,
    ];

    try {
      setIsRefreshing(true);
      for (const url of tryUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            toast.success('Profile refreshed!');
            return;
          }
        } catch {
          /* try next */
        }
      }

      const sample = SAMPLE_PROFILES.find((p) => p.id === user.id || p.username === user.username);
      if (sample) {
        setUser(sample);
        toast.success('Profile refreshed (local data)');
        return;
      }

      toast.error('Failed to refresh profile data');
    } catch (error) {
      console.error('Error refreshing user data:', error);
      const sample = SAMPLE_PROFILES.find((p) => p.id === user.id || p.username === user.username);
      if (sample) {
        setUser(sample);
        toast.success('Profile refreshed (local data)');
      } else {
        toast.error('Failed to refresh profile data');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh verification status for pending users
  useEffect(() => {
    if (user?.verificationStatus === 'pending') {
      const interval = setInterval(() => {
        refreshUserData();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.verificationStatus]);

  const handleShareClick = () => {
    hapticFeedback();
    const profileUrl = `${window.location.origin}/profile/${user?.id}`;
    navigator.share?.({
      title: 'Check out my profile',
      text: `Meet ${user?.name}!`,
      url: profileUrl,
    }).catch(() => {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    });
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col pt-12 pb-24 overflow-y-auto yene-scrollbar safe-area-top">
        <div className="px-6 mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black">Profile</h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Settings className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Profile Found</h3>
            <p className="text-white/60">Please complete onboarding first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-12 pb-24 overflow-y-auto yene-scrollbar safe-area-top">
      <div className="px-6 mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black">Profile</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshUserData}
            disabled={isRefreshing}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform disabled:opacity-50"
            title="Refresh profile data"
          >
            <RefreshCw className={`w-6 h-6 text-white/40 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              hapticFeedback();
              setShowSettingsModal(true);
            }}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform"
            title="Open settings"
          >
            <Settings className="w-6 h-6 text-white/40" />
          </button>
          <button
            type="button"
            onClick={() => {
              hapticFeedback();
              if (!user?.premiumPlus || !getPremiumConfig().packages[user.premiumPackage || 'plus'].features.hideLastSeen) {
                toast.message('Hide last seen is Premium', { description: 'Control your online privacy.' });
                return;
              }
              updateUser({ hideLastSeenFromOthers: !user?.hideLastSeenFromOthers });
              toast.message(
                user?.hideLastSeenFromOthers
                  ? 'Last seen visible to others'
                  : 'Last seen hidden from others'
              );
            }}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform"
            title="Toggle last seen"
          >
            <Clock className="w-6 h-6 text-white/40" />
          </button>
        </div>
      </div>

      <div className="px-6 flex flex-col items-center">
        <div className="relative group">
          <button
            onClick={handleGalleryClick}
            className="w-36 h-36 rounded-[40px] overflow-hidden border-4 border-[#FF8C00]/20 p-1 bg-gradient-to-br from-[#FF8C00]/20 via-purple-500/10 to-pink-500/10 shadow-2xl shadow-[#FF8C00]/10 transition-transform group-hover:scale-105 active:scale-95"
          >
            <img 
              src={user?.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60'} 
              className="w-full h-full object-cover rounded-[36px]" 
              alt="My Profile" 
            />
          </button>
          <button
            onClick={handleEditClick}
            className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#FF8C00] to-orange-500 p-3 rounded-2xl shadow-xl border-4 border-[#0B0D14] active:scale-90 transition-all duration-200 hover:shadow-[#FF8C00]/50"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoUpload(e.target.files?.[0] ?? null)}
          />
          
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-full border border-white/40 shadow-lg">
            <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[8px] font-black text-white uppercase tracking-widest backdrop-blur-sm">
              Online
            </div>
          </div>
        </div>

        <div className="text-center mt-6 mb-8">
          <h2 className="text-2xl font-black flex items-center justify-center gap-2">
            <button
              onClick={() => {
                hapticFeedback();
                navigate(`/profile/${user?.username || user?.id}`, {
                  state: {
                    profileBack: { path: '/profile' },
                  } satisfies ProfileViewLocationState,
                });
              }}
              className="active:scale-95 transition-transform"
            >
              <span>{user?.name}, {user?.age}</span>
            </button>
            {user?.isVerified && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2563eb] border border-white/40">
                <span className="w-3 h-3 rounded-full bg-white" />
              </span>
            )}
          </h2>
          <button
            onClick={updateLocation}
            className="flex items-center justify-center gap-1.5 text-white/30 text-xs font-bold uppercase tracking-widest mt-1 hover:text-white/60 transition-colors active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF8C00]" />
            <span>{user.location || 'Location unavailable'}</span>
          </button>
        </div>

        <div className="w-full grid grid-cols-4 gap-3 mb-8">
          <button
            onClick={handleMatchesClick}
            className="bg-white/5 rounded-3xl p-5 flex flex-col items-center justify-center border border-white/10 active:bg-white/10 transition-colors"
          >
            <span className="text-2xl font-black text-[#FF8C00]">{matches.length}</span>
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">Matches</span>
          </button>
          <button
            onClick={handleGoPlusClick}
            className="bg-[#FF8C00] rounded-3xl p-5 flex flex-col items-center justify-center shadow-[0_12px_24px_-8px_rgba(255,140,0,0.4)] active:scale-95 transition-transform"
          >
            <Heart className="w-7 h-7 text-white fill-current mb-1" />
            <span className="text-[9px] text-white font-black uppercase tracking-widest">Go Premium</span>
          </button>
          <button
            onClick={handleTopPicksClick}
            className="bg-white/5 rounded-3xl p-5 flex flex-col items-center justify-center border border-white/10 active:bg-white/10 transition-colors"
          >
            <Sparkles className="w-7 h-7 text-white/40 mb-1" />
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Top Picks</span>
          </button>
          <button
            onClick={handleGalleryClick}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl p-5 flex flex-col items-center justify-center border border-blue-500/30 active:scale-95 transition-transform"
          >
            <Camera className="w-7 h-7 text-blue-400 mb-1" />
            <span className="text-[9px] text-blue-300 font-black uppercase tracking-widest mt-1">Gallery</span>
          </button>
        </div>



        <div className="w-full p-5 rounded-3xl bg-white/[0.03] border border-white/10 mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Today</p>
          <p className="text-sm text-white/80">
            <span className="font-bold text-[#FF8C00]">
              {user?.premiumPlus && getPremiumConfig().packages[user.premiumPackage || 'plus'].features.unlimitedLikes
                ? 'Unlimited'
                : likesRemaining}
            </span> likes left
            {user?.premiumPlus && !getPremiumConfig().packages[user.premiumPackage || 'plus'].features.unlimitedLikes
              ? ` (Plus cap ${adminConfig.plusDailyLikes}/day)`
              : user?.premiumPlus
              ? ' (Unlimited)'
              : ` (Free ${adminConfig.freeDailyLikes}/day)`}
            <span className="text-white/40"> · </span>
            curated deck up to <span className="font-bold text-white/90">{SLOW_DECK_DAILY_CARDS}</span> cards
          </p>
        </div>

        {user?.premiumPlus && user?.premiumPackage && getPremiumConfig().packages[user.premiumPackage].features.seeWhoLikedYou && (
          <button
            type="button"
            onClick={() => navigate('/who-liked-you')}
            className="w-full p-5 rounded-3xl bg-white/[0.03] border border-white/10 mb-3 flex items-center justify-between group active:bg-white/10 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Eye className="w-5 h-5 text-[#FF8C00] group-active:text-white transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-bold text-white/70 text-sm tracking-tight block group-hover:text-white transition-colors">Who Liked You</span>
                <span className="text-[10px] text-white/35">See people who liked your profile</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
          </button>
        )}

        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={() => {
              hapticFeedback();
              navigate('/who-liked-you');
            }}
            className="w-full p-5 rounded-3xl bg-white/[0.03] border border-white/10 mb-3 flex items-center justify-between group active:bg-white/10 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Heart className="w-5 h-5 text-[#FF8C00] group-active:text-white transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-bold text-white/70 text-sm tracking-tight block group-hover:text-white transition-colors">Who Liked You</span>
                <span className="text-[10px] text-white/35">See who liked you back</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback();
              const url = getInviteUrl() || window.location.origin;
              const title = 'Join Yene';
              const text = 'Find intentional connections on Yene.';
              navigator.share?.({ title, text, url }).catch(() => {
                navigator.clipboard.writeText(url).then(() => toast.success('Invite link copied'));
              });
            }}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-[#FF8C00]/10 transition-colors">
                <Gift className="w-5 h-5 text-[#FF8C00] group-active:text-white transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-bold text-white/70 text-sm tracking-tight block group-hover:text-white transition-colors">Invite friends</span>
                <span className="text-[10px] text-white/35">Share the Yene site so friends can join</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback();
              navigate('/blocked');
            }}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <UserX className="w-5 h-5 text-white/40 group-active:text-white transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-bold text-white/70 text-sm tracking-tight block">Blocked</span>
                <span className="text-[10px] text-white/35">Manage who you&apos;ve blocked</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(user?.blockedUserIds?.length ?? 0) > 0 && (
                <span className="text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {user?.blockedUserIds?.length}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-white/10" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback();
              updateUser({ blurPhotosInDiscovery: !user?.blurPhotosInDiscovery });
              toast.message(user?.blurPhotosInDiscovery ? 'Photos clear in discovery' : 'Photos blurred until you open a profile');
            }}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <EyeOff className="w-5 h-5 text-white/40 group-active:text-white transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-bold text-white/70 text-sm tracking-tight block">Blur photos in discovery</span>
                <span className="text-[10px] text-white/35">Extra privacy while browsing</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00]">
              {user?.blurPhotosInDiscovery ? 'On' : 'Off'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticFeedback();
              if (!user?.premiumPlus) {
                toast.message('Hide last seen is a Plus feature', { description: 'Upgrade to control your privacy.' });
                setShowGoPlus(true);
                return;
              }
              updateUser({ hideLastSeenFromOthers: !user?.hideLastSeenFromOthers });
              toast.message(
                user?.hideLastSeenFromOthers
                  ? 'Others can see when you were last active'
                  : 'Your last seen is hidden from others'
              );
            }}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Clock className="w-5 h-5 text-white/40 group-active:text-white transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-bold text-white/70 text-sm tracking-tight block">Hide last seen</span>
                <span className="text-[10px] text-white/35">Plus — like Telegram privacy</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF8C00]">
              {!user?.premiumPlus ? 'Plus' : user?.hideLastSeenFromOthers ? 'Hidden' : 'Visible'}
            </span>
          </button>

          <button
            onClick={handleVerificationClick}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Shield className="w-5 h-5 text-white/40 group-active:text-white transition-colors" />
              </div>
              <span className="font-bold text-white/70 text-sm tracking-tight">Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                user?.verificationStatus === 'verified' ? 'text-[#22c55e]' :
                user?.verificationStatus === 'pending' ? 'text-[#FF8C00]' :
                'text-[#FF8C00]'
              }`}>
                {user?.verificationStatus === 'verified' ? 'Verified' :
                 user?.verificationStatus === 'pending' ? 'Pending' :
                 'Unverified'}
              </span>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </div>
          </button>
          <button
            onClick={handleShareClick}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Share2 className="w-5 h-5 text-white/40 group-active:text-white transition-colors" />
              </div>
              <span className="font-bold text-white/70 text-sm tracking-tight">Share Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/10" />
          </button>
          
          <button
            onClick={() => resetApp()}
            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-colors mt-8"
          >
            <div className="flex items-center gap-4 text-red-500">
              <LogOut className="w-6 h-6" />
              <span className="font-black text-sm uppercase tracking-widest">Log Out</span>
            </div>
          </button>
        </div>
      </div>

      <EditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={user} onSave={setUser} />
      <MatchesModal isOpen={showMatches} onClose={() => setShowMatches(false)} matches={matches} />
      <GoPlusModal
        isOpen={showGoPlus}
        onClose={() => setShowGoPlus(false)}
        premiumPlus={!!user?.premiumPlus}
        onSubscribe={(packageType) => {
          updateUser({ premiumPlus: true, premiumPackage: packageType });
          toast.success(`Yene ${packageType.charAt(0).toUpperCase() + packageType.slice(1)} enabled (demo)`);
          setShowGoPlus(false);
        }}
      />
      <GalleryModal isOpen={showGallery} onClose={() => setShowGallery(false)} user={user} onUpdatePhoto={setUser} />
      <VerificationModal isOpen={showVerification} onClose={() => setShowVerification(false)} user={user} onVerify={setUser} />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onBlocked={() => {
          setShowSettingsModal(false);
          navigate('/blocked');
        }}
        onDeleteAccount={() => {
          if (!confirm('Delete your account and all local data on this device? This cannot be undone.')) return;
          deleteAccount();
          toast.success('Account deleted');
          setShowSettingsModal(false);
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoUpload(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

/** Bottom sheet: drag handle down to dismiss; optional scroll-to-end close (off by default) */
const BottomSheetLayout: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
  closeOnScrollToEnd?: boolean;
  handleClassName?: string;
}> = ({ children, onClose, closeOnScrollToEnd = false, handleClassName = 'bg-white/10' }) => {
  const dragY = useRef<number | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!closeOnScrollToEnd) return;
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight + 8) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      onClose();
    }
  };

  return (
    <>
      <div
        className="shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing select-none touch-pan-y"
        onPointerDown={(e) => {
          dragY.current = e.clientY;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (dragY.current !== null && e.clientY - dragY.current > 48) {
            onClose();
          }
          dragY.current = null;
        }}
        onPointerCancel={() => {
          dragY.current = null;
        }}
      >
        <span
          className={cn('w-12 h-1.5 rounded-full block transition-colors hover:opacity-80', handleClassName)}
          aria-hidden
        />
      </div>
      <div
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 pb-6 sm:pb-8 [overflow-scrolling:touch]"
      >
        {children}
      </div>
    </>
  );
};

const SectionButton: React.FC<{ icon: any, title: string, value?: string, color?: string }> = ({ icon: Icon, title, value, color }) => (
  <button className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group active:bg-white/10 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
        <Icon className="w-5 h-5 text-white/40 group-active:text-white transition-colors" />
      </div>
      <span className="font-bold text-white/70 text-sm tracking-tight">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{value}</span>}
      <ChevronRight className="w-4 h-4 text-white/10" />
    </div>
  </button>
);

const EditModal: React.FC<{ isOpen: boolean, onClose: () => void, user: UserProfile | null, onSave: (user: UserProfile) => void }> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState(user);
  const tagRev = useLocalDataRevision();
  const interestOptions = useMemo(() => getInterestTags(), [tagRev]);

  useEffect(() => {
    if (isOpen && user) setFormData(user);
  }, [isOpen, user]);

  if (!user) return null;

  const handleSave = () => {
    onSave(formData as UserProfile);
    toast.success('Profile updated!');
    onClose();
  };

  const selected = formData.interests ?? [];
  const toggleInterest = (interest: string) => {
    const interests = formData.interests || [];
    if (interests.includes(interest)) {
      setFormData({ ...formData, interests: interests.filter((i) => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...interests, interest] });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] z-[101] flex flex-col max-h-[85vh] p-0 focus:outline-none">
          <BottomSheetLayout onClose={onClose}>
          <h2 className="text-2xl font-black mb-2 text-white">Edit Profile</h2>
          <p className="text-xs text-white/40 mb-6">Update your details and interests.</p>
          <div className="space-y-5">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
            />
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              placeholder="Age"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
            />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
            >
              <option value="Woman">Woman</option>
              <option value="Man">Man</option>
              <option value="Non-binary">Non-binary</option>
            </select>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Bio"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white resize-none"
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2">Interests</p>
              {selected.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1 yene-scrollbar-thin">
                  {selected.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className="shrink-0 inline-flex items-center gap-1.5 pl-3 pr-2 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FF4B8B] to-[#FF8E53] shadow-[0_4px_14px_rgba(255,75,139,0.35)]"
                    >
                      {tag}
                      <X className="w-3.5 h-3.5 opacity-90" />
                    </button>
                  ))}
                </div>
              )}
              <div className="max-h-44 overflow-y-auto pr-1 yene-scrollbar-thin rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex flex-wrap gap-2">
                  {interestOptions
                    .filter((t) => !selected.includes(t))
                    .map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className="px-3 py-2 rounded-full text-xs font-semibold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {interest}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full mt-8 py-5 bg-gradient-to-r from-[#FF4B8B] to-[#FF8E53] text-white font-black text-lg rounded-full shadow-lg shadow-pink-500/20"
          >
            Save Changes
          </button>
          </BottomSheetLayout>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const MatchesModal: React.FC<{ isOpen: boolean, onClose: () => void, matches: UserProfile[] }> = ({ isOpen, onClose, matches }) => {
  const navigate = useNavigate();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] z-[101] flex flex-col max-h-[88vh] p-0 focus:outline-none text-white shadow-[0_-12px_48px_rgba(0,0,0,0.45)]">
          <BottomSheetLayout onClose={onClose}>
          <div className="mb-6">
            <h2 className="text-2xl font-black italic text-[#FF8C00] tracking-tighter leading-none">Liked you</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">People you matched with</p>
          </div>
          {matches.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pb-2">
              {matches.map((match) => {
                const subtitle =
                  match.location?.trim() ||
                  match.interests?.[0] ||
                  (match.bio ? match.bio.slice(0, 36) + (match.bio.length > 36 ? '…' : '') : '');
                return (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => {
                      navigate(`/profile/${match.username || match.id}`, {
                        state: {
                          profileBack: { path: '/profile', openMatches: true },
                        } satisfies ProfileViewLocationState,
                      });
                      onClose();
                    }}
                    className="relative aspect-[3/4] w-full rounded-[22px] overflow-hidden border border-white/10 shadow-lg active:scale-[0.98] transition-transform text-left group"
                  >
                    <img src={match.photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 pt-8">
                      <p className="font-bold text-white text-[15px] leading-tight drop-shadow-sm">
                        {match.name}
                        {match.age ? `, ${match.age}` : ''}
                      </p>
                      {subtitle ? (
                        <p className="text-[11px] text-white/90 font-medium mt-0.5 line-clamp-2 drop-shadow-sm">{subtitle}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-white/50 text-sm py-10">No matches yet. Keep swiping!</p>
          )}
          </BottomSheetLayout>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const TopPicksModal: React.FC<{ isOpen: boolean; onClose: () => void; topPicks: UserProfile[] }> = ({ isOpen, onClose, topPicks }) => {
  const navigate = useNavigate();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] z-[101] flex flex-col max-h-[88vh] p-0 focus:outline-none text-white shadow-[0_-12px_48px_rgba(0,0,0,0.45)]">
          <BottomSheetLayout onClose={onClose}>
          <div className="mb-6">
            <h2 className="text-2xl font-black italic text-[#FF8C00] tracking-tighter leading-none">Top Picks</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Curated for you</p>
          </div>
          {topPicks.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pb-2">
              {topPicks.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    navigate(`/profile/${profile.username || profile.id}`, {
                      state: {
                        profileBack: { path: '/profile' },
                      } satisfies ProfileViewLocationState,
                    });
                    onClose();
                  }}
                  className="relative aspect-[3/4] w-full rounded-[22px] overflow-hidden border border-white/10 shadow-lg active:scale-[0.98] transition-transform text-left group"
                >
                  <img src={profile.photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 pt-8">
                    <p className="font-bold text-white text-[15px] leading-tight drop-shadow-sm">
                      {profile.name}
                      {profile.age ? `, ${profile.age}` : ''}
                    </p>
                    <p className="text-[11px] text-white/90 font-medium mt-0.5 line-clamp-2 drop-shadow-sm">
                      {profile.location || profile.interests?.[0] || ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/50 text-sm py-10">No top picks currently. Keep swiping to build your algorithm.</p>
          )}
          </BottomSheetLayout>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onBlocked: () => void;
  onDeleteAccount: () => void;
}> = ({ isOpen, onClose, onBlocked, onDeleteAccount }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] z-[101] flex flex-col max-h-[85vh] p-0 focus:outline-none">
          <BottomSheetLayout onClose={onClose}>
            <h2 className="text-2xl font-black mb-6 text-white">Settings</h2>
            <div className="space-y-4">
              <button
                type="button"
                onClick={onBlocked}
                className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between active:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <UserX className="w-5 h-5 text-white/40" />
                  <span className="font-bold text-white/80 text-sm">Blocked users</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/10" />
              </button>
              <button
                type="button"
                onClick={onDeleteAccount}
                className="w-full p-5 rounded-3xl bg-red-500/10 border border-red-500/25 flex items-center gap-4 text-left active:scale-[0.99] transition-transform"
              >
                <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <span className="font-bold text-red-400 text-sm block">Delete account</span>
                  <span className="text-[11px] text-white/40">Remove your profile and data from this device</span>
                </div>
              </button>
            </div>
          </BottomSheetLayout>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const GoPlusModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  premiumPlus: boolean;
  onSubscribe: (packageType: 'basic' | 'plus' | 'premium') => void;
}> = ({ isOpen, onClose, premiumPlus, onSubscribe }) => {
  const rev = useLocalDataRevision();
  const [cfg, setCfg] = useState(getPremiumConfig());
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'plus' | 'premium'>('plus');

  useEffect(() => {
    setCfg(getPremiumConfig());
  }, [isOpen, rev]);

  const currentPkg = cfg.packages[selectedPackage];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] z-[101] flex flex-col max-h-[85vh] p-0 focus:outline-none">
          <BottomSheetLayout onClose={onClose}>
          <h2 className="text-2xl font-black mb-2 text-white">Yene Premium</h2>
          <p className="text-xs text-white/40 mb-6 leading-relaxed">
            Choose the plan that works for you. All plans can be modified from the admin dashboard.
          </p>

          <div className="flex gap-2 mb-6">
            {(['basic', 'plus', 'premium'] as const).map((pkg) => (
              <button
                key={pkg}
                onClick={() => setSelectedPackage(pkg)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  selectedPackage === pkg
                    ? 'bg-[#FF8C00] text-white shadow-lg'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {cfg.packages[pkg].name}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white mb-3">What you get</h3>
              <ul className="text-white/65 text-sm space-y-2">
                {currentPkg.detailBullets.map((line, i) => (
                  <li key={i}>• {line}</li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#FF8C00] mb-1">{currentPkg.priceLabel}</p>
              <p className="text-xs text-white/45 mb-1">{currentPkg.priceSubtext}</p>
              <p className="text-[10px] text-white/35 mb-4">{currentPkg.billingNote}</p>
              <button
                type="button"
                disabled={premiumPlus}
                onClick={() => onSubscribe(selectedPackage)}
                className="w-full py-4 bg-[#FF8C00] text-white font-black rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {premiumPlus ? 'You have Premium' : `Subscribe to ${currentPkg.name}`}
              </button>
            </div>
          </div>
          </BottomSheetLayout>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const GALLERY_SLOTS = 6;

const GalleryModal: React.FC<{ isOpen: boolean, onClose: () => void, user: UserProfile | null, onUpdatePhoto: (user: UserProfile) => void }> = ({ isOpen, onClose, user, onUpdatePhoto }) => {
  const [cells, setCells] = useState<(string | null)[]>(() => Array(GALLERY_SLOTS).fill(null));
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    const next = Array(GALLERY_SLOTS).fill(null) as (string | null)[];
    const src = user.photos?.length ? user.photos : user.photo ? [user.photo] : [];
    for (let i = 0; i < Math.min(GALLERY_SLOTS, src.length); i++) next[i] = src[i];
    setCells(next);
  }, [isOpen, user]);

  if (!user) return null;

  const persistFromCells = (c: (string | null)[]) => {
    const photos = c.filter((x): x is string => x != null && x !== '');
    if (photos.length === 0) {
      toast.error('You must keep at least one photo.');
      return;
    }
    setCells(c);
    onUpdatePhoto({ ...user, photo: photos[0], photos });
  };

  const handleAddPhoto = (file: File | undefined) => {
    if (!file || pendingSlot === null) return;
    const slot = pendingSlot;
    setPendingSlot(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const c = [...cells];
      c[slot] = reader.result;
      persistFromCells(c);
    };
    reader.readAsDataURL(file);
  };

  const setAsProfile = (photo: string) => {
    const photos = cells.filter((x): x is string => !!x);
    onUpdatePhoto({ ...user, photo, photos: photos.length ? photos : [photo] });
    toast.success('Profile photo updated!');
  };

  const removePhoto = (index: number) => {
    const compact = cells
      .map((x, i) => (i === index ? null : x))
      .filter((x): x is string => !!x);
    if (compact.length === 0) {
      toast.error('You must keep at least one photo.');
      return;
    }
    const next = Array(GALLERY_SLOTS).fill(null) as (string | null)[];
    compact.slice(0, GALLERY_SLOTS).forEach((url, i) => {
      next[i] = url;
    });
    persistFromCells(next);
  };

  const slots = cells;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/[0.08] rounded-t-[32px] z-[101] flex flex-col max-h-[90vh] p-0 focus:outline-none">
          <BottomSheetLayout onClose={onClose} handleClassName="bg-white/10 hover:bg-white/20">
          <h2 className="text-2xl font-black mb-1 tracking-tight text-white">Add your recent pics</h2>
          <p className="text-xs text-white/50 mb-6">Up to six photos. Tap + to add; star sets your main photo.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {slots.map((src, index) => (
              <div
                key={index}
                className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-white/[0.05] border-2 border-dashed border-white/[0.10]"
              >
                {src ? (
                  <>
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAsProfile(src)}
                      className={cn(
                        'absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-md',
                        src === user.photo ? 'bg-[#FF8C00]' : 'bg-white/10 border border-white/[0.20]'
                      )}
                      title="Set as profile photo"
                    >
                      <Star className={cn('w-4 h-4', src === user.photo ? 'text-white fill-white' : 'text-white/70')} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSlot(index);
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-white/30 hover:bg-white/[0.05] transition-colors"
                  >
                    <Plus className="w-10 h-10" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleAddPhoto(e.target.files?.[0] ?? undefined);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => onClose()}
            className="w-full py-4 rounded-full font-black text-white text-lg bg-gradient-to-r from-[#FF8C00] to-[#c45a00] shadow-lg shadow-[#FF8C00]/20 active:scale-[0.99] transition-transform"
          >
            Done
          </button>
          </BottomSheetLayout>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const VerificationModal: React.FC<{ isOpen: boolean, onClose: () => void, user: UserProfile | null, onVerify: (user: UserProfile) => void }> = ({ isOpen, onClose, user, onVerify }) => {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!user) return null;

  useEffect(() => {
    if (isOpen && !isCameraOpen && !selfie) {
      startCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && !selfie) {
      attachCameraStream();
    }
  }, [isCameraOpen]);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      currentStream?.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
      setIsCameraOpen(false);
      setSelfie(null);
    }
  }, [isOpen, currentStream]);

  const attachCameraStream = () => {
    if (!currentStream || !videoRef.current) return;

    videoRef.current.srcObject = currentStream;
    videoRef.current.onloadedmetadata = () => {
      videoRef.current
        ?.play()
        .catch((err) => {
          console.error('Camera play error:', err);
          toast.error('Could not start camera preview.');
        });
    };
  };

  const startCamera = async () => {
    // Basic feedback so the user knows the tap worked
    hapticFeedback?.();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera is not supported in this browser. Please use Chrome/Edge on desktop or a modern mobile browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
      });

      setCurrentStream(stream);
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Camera access denied or not available');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photo = canvas.toDataURL('image/jpeg', 0.8);
        setSelfie(photo);
        setIsCameraOpen(false);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      } else {
        toast.error('Failed to capture photo');
      }
    }
  };

  const submitForVerification = () => {
    if (!selfie || !user) return;
    setIsSubmitting(true);
    fetch('/api/verification-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, selfieDataUrl: selfie }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        onVerify({ ...user, verificationStatus: 'pending' });
        toast.success('Selfie submitted for verification! Check back later and refresh your profile to see updates.');
        onClose();
      })
      .catch(() => {
        toast.error('Could not submit verification. Try again.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] z-[101] flex flex-col max-h-[85vh] p-0 focus:outline-none">
          <BottomSheetLayout onClose={onClose}>
          <h2 className="text-2xl font-black mb-8 text-white">Get Verified</h2>
          <p className="text-white/60 mb-6">Take a clear selfie to get verified. Our team will review it in the admin panel.</p>
          {selfie ? (
            <img src={selfie} alt="Selfie" className="w-full h-48 rounded-2xl object-cover mb-6" />
          ) : isCameraOpen ? (
            <div className="w-full mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 rounded-2xl object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={takePhoto}
                  className="flex-1 py-3 bg-[#FF8C00] text-white font-bold rounded-xl active:scale-95 transition-all"
                >
                  Take Photo
                </button>
                <button
                  onClick={() => {
                    setIsCameraOpen(false);
                    currentStream?.getTracks().forEach(track => track.stop());
                    setCurrentStream(null);
                  }}
                  className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full h-48 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center mb-6"
            >
              <Camera className="w-12 h-12 text-white/40 mb-4" />
              <p className="text-white/60">Tap to open camera</p>
            </button>
          )}
          {selfie && (
            <button
              onClick={submitForVerification}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#FF8C00] text-white font-black rounded-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          )}
          </BottomSheetLayout>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};