import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useApp, UserProfile } from '../context/AppContext';
import { hapticFeedback, hapticSuccess, cn } from '../lib/utils';
import { X, Heart, Info, MapPin, SlidersHorizontal, Sparkles, ChevronLeft, RotateCcw, Shield } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';
import { intentCompatible } from '../lib/yeneFeatures';
import { toast } from 'sonner';
import type { ProfileViewLocationState } from '../lib/profileNavigation';
import { getPremiumConfig } from '../lib/appSettings';
import { calculateDistance, formatDistance } from '../lib/distance';
import { OptimizedImage } from './ui/OptimizedImage';

export const Discovery: React.FC = () => {
  const {
    user,
    matches,
    addMatch,
    reportUser,
    blockUser,
    recordCardSeen,
    likesRemaining,
    tryConsumeLike,
    showMatchOverlay,
    setShowMatchOverlay,
    resetApp,
    isUsernameTaken,
    cardsRemainingInDeck,
    recordDiscoveryOpen,
    updateUser,
  } = useApp();
  const navigate = useNavigate();
  const [allProfiles] = useState<UserProfile[]>(SAMPLE_PROFILES);
  const [filters, setFilters] = useState({ ageMin: 18, ageMax: 35, gender: 'Everyone' as 'Men' | 'Women' | 'Everyone', distance: 50 });
  const [lastSwiped, setLastSwiped] = useState<{ profile: UserProfile; direction: 'left' | 'right' } | null>(null);

  // Calculate real distances for all profiles
  const profilesWithDistance = useMemo(() => {
    return allProfiles.map(profile => {
      let distance = 'Unknown distance';
      if (user?.latitude && user?.longitude && profile.latitude && profile.longitude) {
        const calculatedDistance = calculateDistance(
          user.latitude,
          user.longitude,
          profile.latitude,
          profile.longitude
        );
        distance = formatDistance(calculatedDistance);
      }
      return { ...profile, distance };
    });
  }, [allProfiles, user?.latitude, user?.longitude]);

  const passesFilters = useCallback(
    (p: UserProfile, f: typeof filters) =>
      p.age >= f.ageMin &&
      p.age <= f.ageMax &&
      (f.gender === 'Everyone' ||
        (f.gender === 'Men' && p.gender === 'Man') ||
        (f.gender === 'Women' && p.gender === 'Woman')) &&
      parseInt(p.distance?.split(' ')[0] || '0', 10) <= f.distance &&
      !matches.some((m) => m.id === p.id) &&
      !(user?.blockedUserIds ?? []).includes(p.id) &&
      intentCompatible(user?.datingIntent, p.datingIntent),
    [profilesWithDistance, filters, matches, user?.blockedUserIds, user?.datingIntent]
  );

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  useEffect(() => {
    recordDiscoveryOpen();
  }, [recordDiscoveryOpen]);

  useEffect(() => {
    if (!user) return;
    const filteredProfiles = profilesWithDistance.filter((p) => passesFilters(p, filters));
    setProfiles(filteredProfiles);
    // Reset to first profile when filters change
    setCurrentProfileIndex(0);
  }, [user?.id, user?.datingIntent, user?.blockedUserIds, profilesWithDistance, passesFilters, filters]);

  useEffect(() => {
    setProfiles((prev) => prev.filter((p) => !matches.some((m) => m.id === p.id)));
  }, [matches]);

  // Listen for refresh deck signal from navigation
  useEffect(() => {
    const handleRefreshDeck = () => {
      // Move to next profile when returning from profile view
      setCurrentProfileIndex((prev) => {
        const newIndex = prev + 1;
        // Don't exceed available profiles
        return newIndex < profiles.length ? newIndex : prev;
      });
    };

    window.addEventListener('refreshDiscoveryDeck', handleRefreshDeck);
    return () => {
      window.removeEventListener('refreshDiscoveryDeck', handleRefreshDeck);
    };
  }, [profiles.length]);

  const deckBlocked = cardsRemainingInDeck <= 0;
  const rawTop = profiles.length > 0 && currentProfileIndex < profiles.length ? profiles[currentProfileIndex] : null;
  const topProfile = !deckBlocked && rawTop ? rawTop : null;

  const [showFilters, setShowFilters] = useState(false);
  const [showInfo, setShowInfo] = useState<UserProfile | null>(null);

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setProfiles(profilesWithDistance.filter((p) => passesFilters(p, newFilters)));
  };

  const handleRewind = () => {
    if (!lastSwiped) {
      toast.error('No action to rewind');
      return;
    }
    if (!user?.premiumPlus || !getPremiumConfig().packages[user.premiumPackage || 'plus'].features.rewind) {
      toast.message('Rewind is a Premium feature', { description: 'Upgrade to undo swipes.' });
      return;
    }
    hapticFeedback();
    setProfiles((prev) => [...prev, lastSwiped.profile]);
    if (lastSwiped.direction === 'right') {
      // Refund the like
      updateUser({ likesUsedToday: (user.likesUsedToday ?? 0) - 1 });
    }
    setLastSwiped(null);
    toast.success('Rewound last swipe');
  };

  const handleSwipe = (direction: 'left' | 'right', profile: UserProfile) => {
    if (cardsRemainingInDeck <= 0) {
      toast.message('Daily curated deck complete', {
        description: 'Come back tomorrow for fresh profiles — quality over endless swipes.',
      });
      return;
    }
    if (direction === 'right') {
      if (likesRemaining <= 0) {
        toast.error(`Out of likes for today${user?.premiumPlus ? "You've reached your Plus daily limit." : "Yene Plus adds more daily likes — or new likes at midnight."}`);
        return;
      }
      if (!tryConsumeLike()) {
        toast.error('Could not register like');
        return;
      }
    }

    hapticFeedback();
    recordCardSeen();
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    setLastSwiped({ profile, direction });
    
    // Move to next profile index
    setCurrentProfileIndex((prev) => Math.min(prev + 1, profiles.length - 1));

    if (direction === 'right' && Math.random() > 0.4) {
      setTimeout(() => {
        hapticSuccess();
        addMatch(profile);
        setShowMatchOverlay(profile);
      }, 300);
    }
  };

  return (
    <div className="relative h-full min-h-0 flex flex-col pt-8 sm:pt-12 pb-[calc(6rem+5.25rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(6rem+5.5rem+env(safe-area-inset-bottom,0px))] overflow-hidden safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="px-4 sm:px-6 mb-2 sm:mb-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black italic text-[#FF8C00] leading-none tracking-tighter">YENE</h1>
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Premium Dating</span>
        </div>
        <button 
          onClick={() => setShowFilters(true)}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 active:scale-90 transition-transform"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Cards Container — min-h-0 + min height so image/panel stay visible on small viewports */}
      <div className="flex-1 min-h-0 relative mx-2 sm:mx-4 mt-1 sm:mt-2 mb-2 sm:mb-4 min-h-[min(24rem,calc(100dvh-14rem))] sm:min-h-[min(28rem,calc(100dvh-13rem))]">
        <AnimatePresence>
          {topProfile ? (
            <SwipeCard 
              key={topProfile.id} 
              profile={topProfile} 
              blurPhoto={!!user?.blurPhotosInDiscovery}
              onSwipe={(dir) => handleSwipe(dir, topProfile)}
              isTop={true}
              onInfo={() => setShowInfo(topProfile)}
              onProfileClick={() =>
                navigate(`/profile/${topProfile.username || topProfile.id}`, {
                  state: { profileBack: { path: '/', refreshDeck: true } } satisfies ProfileViewLocationState,
                })
              }
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
                <Sparkles className="w-10 h-10 text-[#FF8C00]" />
                <div className="absolute inset-0 rounded-full animate-ping bg-[#FF8C00]/20" />
              </div>
              {deckBlocked && profiles.length > 0 ? (
                <>
                  <h3 className="text-2xl font-bold mb-2">Today&apos;s deck is complete</h3>
                  <p className="text-white/40 max-w-[260px] text-sm">
                    You still have people in your area — we limit daily passes so discovery stays intentional. New cards at midnight.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2">No profiles to show</h3>
                  <p className="text-white/40 max-w-[260px] text-sm">
                    Try widening filters or check back later. You can also reload the sample stack for demo.
                  </p>
                  <button 
                    type="button"
                    onClick={() => setProfiles(allProfiles.filter((p) => passesFilters(p, filters)))}
                    className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold active:scale-95 transition-all"
                  >
                    Reset stack
                  </button>
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons — sit above tab bar (h-24 = 6rem); never overlap nav */}
      {topProfile && (
        <div
          className="fixed left-0 right-0 z-[45] flex items-center justify-center gap-4 min-[380px]:gap-6 sm:gap-8 pointer-events-none px-3 min-[380px]:px-4 max-w-lg mx-auto w-full
          bottom-[calc(6rem+env(safe-area-inset-bottom,0px)+10px)]
          sm:bottom-[calc(6rem+env(safe-area-inset-bottom,0px)+12px)]"
        >
          <button 
            type="button"
            onClick={() => handleSwipe('left', topProfile)}
            className="w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-500 shadow-2xl backdrop-blur-2xl active:scale-90 transition-all border-b-4 border-red-500/20 pointer-events-auto shrink-0"
          >
            <X className="w-6 h-6 min-[380px]:w-7 min-[380px]:h-7 sm:w-8 sm:h-8" />
          </button>
          <button 
            type="button"
            onClick={handleRewind}
            disabled={!lastSwiped}
            className="w-10 h-10 min-[380px]:w-12 min-[380px]:h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 shadow-2xl backdrop-blur-2xl active:scale-90 transition-all border-b-4 border-yellow-500/20 pointer-events-auto shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 sm:w-7 sm:h-7" />
          </button>
          <button 
            type="button"
            onClick={() => handleSwipe('right', topProfile)}
            className="w-[3.75rem] h-[3.75rem] min-[380px]:w-[4.5rem] min-[380px]:h-[4.5rem] sm:w-20 sm:h-20 rounded-full bg-[#FF8C00] flex items-center justify-center text-white shadow-[0_12px_24px_rgba(255,140,0,0.4)] active:scale-90 transition-all border-b-4 border-black/20 pointer-events-auto shrink-0"
          >
            <Heart className="w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-10 sm:h-10 fill-current" />
          </button>
        </div>
      )}

      <Filters isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} onApply={applyFilters} />
      <InfoModal
        profile={showInfo}
        onClose={() => setShowInfo(null)}
        onReport={(p) => {
          reportUser(p.id, 'Discovery — reported profile', {
            reportedUserName: p.name,
            source: 'discovery',
          });
          toast.success('Thanks — we’ll review this report.');
          setShowInfo(null);
        }}
      />
    </div>
  );
};

const SwipeCard: React.FC<{ profile: UserProfile, blurPhoto?: boolean, onSwipe: (dir: 'left' | 'right') => void, isTop: boolean, onInfo: () => void, onProfileClick: () => void }> = ({ profile, blurPhoto, onSwipe, isTop, onInfo, onProfileClick }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -50], [1, 0]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const threshold = 60;
    if (info.offset.x > threshold) {
      x.set(480);
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      x.set(-480);
      onSwipe('left');
    } else {
      x.set(0);
    }
  };

  const handleClick = () => {
    if (!isDragging) {
      hapticFeedback();
      onProfileClick();
    }
  };

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.3}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={{ x, rotate, opacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      initial={{ scale: 0.9, y: 10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
      className="cursor-grab active:cursor-grabbing h-full touch-pan-y"
      whileTap={{ cursor: "grabbing" }}
    >
      <div className="relative h-full min-h-[min(22rem,calc(100dvh-12rem))] w-full rounded-[24px] sm:rounded-[34px] overflow-hidden bg-[#151821] shadow-[0_24px_60px_rgba(0,0,0,0.8)] border border-white/5">
        {/* Optimized background image */}
        <OptimizedImage 
          src={profile.photo} 
          alt={profile.name}
          className={cn(
            'absolute inset-0 w-full h-full object-cover object-center scale-105 transition-[filter]',
            blurPhoto && 'blur-xl scale-110'
          )}
          width={400}
          height={600}
          priority={isTop} // Load top card immediately
          sizes="(max-width: 640px) 100vw, 50vw"
        />

        {/* Vignette + gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,140,0,0.18),_transparent_55%)]" />

        {/* Subtle glass border glow */}
        <div className="absolute inset-px rounded-[32px] border border-white/10/60 pointer-events-none" />

        {/* Swipe Indicators */}
        <motion.div 
          style={{ opacity: likeOpacity }} 
          className="absolute top-6 left-4 sm:top-10 sm:left-8 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-6 sm:py-2 rotate-[-15deg] z-20 bg-[#FF8C00]/10 border border-[#FF8C00]/70 backdrop-blur-xl shadow-[0_0_32px_rgba(255,140,0,0.5)]"
        >
          <span className="text-xl sm:text-3xl font-black text-[#FF8C00] uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            LIKE
          </span>
        </motion.div>
        <motion.div 
          style={{ opacity: nopeOpacity }} 
          className="absolute top-6 right-4 sm:top-10 sm:right-8 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-6 sm:py-2 rotate-[15deg] z-20 bg-red-500/10 border border-red-400/80 backdrop-blur-xl shadow-[0_0_32px_rgba(248,113,113,0.5)]"
        >
          <span className="text-xl sm:text-3xl font-black text-red-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            NOPE
          </span>
        </motion.div>

        {/* Bottom content panel */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pb-4 sm:p-6 sm:pb-7 max-h-[48%] sm:max-h-none overflow-y-auto sm:overflow-visible">
          <div className="relative rounded-[20px] sm:rounded-[28px] bg-gradient-to-t from-black/80 via-black/60 to-black/10 border border-white/10 backdrop-blur-2xl px-3 py-3 sm:px-5 sm:py-4 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
            {/* Name / age / online pill */}
            <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-2.5">
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-[26px] font-black text-white leading-tight tracking-tight truncate">
                    {profile.name}, {profile.age}
                  </h2>
                  {(profile.isVerified || profile.verificationStatus === 'verified') && (
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#22c55e] fill-current shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-white/70 font-medium">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF8C00] shrink-0" />
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.18em] truncate">
                    {profile.distance}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onInfo(); }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all shrink-0"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
              </button>
            </div>

            {/* Bio */}
            <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed line-clamp-3 mt-1">
              {profile.bio}
            </p>

            {/* Interests chips */}
            {profile.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-4">
                {profile.interests.map(i => (
                  <span 
                    key={i} 
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl"
                  >
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Filters: React.FC<{ isOpen: boolean, onClose: () => void, filters: { ageMin: number, ageMax: number, gender: 'Men' | 'Women' | 'Everyone', distance: number }, onApply: (filters: { ageMin: number, ageMax: number, gender: 'Men' | 'Women' | 'Everyone', distance: number }) => void }> = ({ isOpen, onClose, filters, onApply }) => {
  const [showMe, setShowMe] = useState<'Men' | 'Women' | 'Everyone'>(filters.gender);
  const [ageRange, setAgeRange] = useState({ min: filters.ageMin, max: filters.ageMax });
  const [maxDistance, setMaxDistance] = useState(filters.distance);

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const minPercent = ((ageRange.min - 18) / 42) * 100;
  const maxPercent = ((ageRange.max - 18) / 42) * 100;
  const distancePercent = maxDistance;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] p-8 z-[101] focus:outline-none">
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full active:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white/40" />
            </button>
            <h2 className="text-2xl font-black text-white">Filter Settings</h2>
            <div className="w-8" /> {/* Spacer */}
          </div>
          
          <div className="space-y-10">
            <section>
              <div className="flex justify-between mb-6">
                <span className="font-bold text-white/60 uppercase tracking-widest text-xs">Age Range</span>
                <span className="text-[#FF8C00] font-black">{ageRange.min} - {ageRange.max}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full relative">
                <div
                  className="absolute top-0 bottom-0 bg-[#FF8C00] rounded-full"
                  style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-xl border-4 border-[#0B0D14]"
                  style={{ left: `${minPercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-xl border-4 border-[#0B0D14]"
                  style={{ left: `${maxPercent}%` }}
                />
                <input
                  type="range"
                  min={18}
                  max={60}
                  value={ageRange.min}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, min: clamp(Number(e.target.value), 18, prev.max) }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  min={18}
                  max={60}
                  value={ageRange.max}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, max: clamp(Number(e.target.value), prev.min, 60) }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </section>

            <section>
              <span className="block font-bold text-white/60 uppercase tracking-widest text-xs mb-6">Show me</span>
              <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10">
                {['Men', 'Women', 'Everyone'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setShowMe(opt as 'Men' | 'Women' | 'Everyone')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                      showMe === opt ? "bg-[#FF8C00] text-white shadow-lg" : "text-white/40"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between mb-6">
                <span className="font-bold text-white/60 uppercase tracking-widest text-xs">Maximum Distance</span>
                <span className="text-[#FF8C00] font-black">{maxDistance} km</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full relative">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#FF8C00] rounded-full"
                  style={{ width: `${distancePercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-xl border-4 border-[#0B0D14]"
                  style={{ left: `${distancePercent}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </section>
          </div>

          <button 
            onClick={() => { onApply({ ageMin: ageRange.min, ageMax: ageRange.max, gender: showMe, distance: maxDistance }); onClose(); }}
            className="w-full mt-12 py-5 bg-[#FF8C00] text-white font-black text-lg rounded-2xl active:scale-95 transition-all shadow-[0_12px_24px_-8px_rgba(255,140,0,0.4)]"
          >
            Apply Preferences
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const InfoModalSheet: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
  const dragY = useRef<number | null>(null);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight + 8) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) onClose();
  };
  return (
    <>
      <div
        className="shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing select-none touch-pan-y"
        onPointerDown={(e) => {
          dragY.current = e.clientY;
        }}
        onPointerUp={(e) => {
          if (dragY.current !== null && e.clientY - dragY.current > 48) onClose();
          dragY.current = null;
        }}
        onPointerCancel={() => {
          dragY.current = null;
        }}
      >
        <span className="w-12 h-1.5 bg-white/10 rounded-full block hover:bg-white/20 transition-colors" aria-hidden />
      </div>
      <div
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 pb-6 sm:pb-8"
      >
        {children}
      </div>
    </>
  );
};

const InfoModal: React.FC<{
  profile: UserProfile | null;
  onClose: () => void;
  onReport?: (p: UserProfile) => void;
}> = ({ profile, onClose, onReport }) => {
  if (!profile) return null;

  return (
    <Dialog.Root open={!!profile} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-[#0B0D14] border-t border-white/10 rounded-t-[40px] z-[101] flex flex-col max-h-[85vh] p-0 focus:outline-none">
          <InfoModalSheet onClose={onClose}>
          <div className="text-center mb-8">
            <OptimizedImage 
              src={profile.photo} 
              alt={profile.name} 
              width={96}
              height={96}
              className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover"
            />
            <h2 className="text-2xl font-black text-white">{profile.name}, {profile.age}</h2>
            <p className="text-white/60">{profile.bio}</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/60">Gender</span>
              <span className="text-white">{profile.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Interests</span>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-white/10 text-xs font-bold text-white/90">
                    {i}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Distance</span>
              <span className="text-white">{profile.distance}</span>
            </div>
          </div>
          {onReport && (
            <button
              type="button"
              onClick={() => onReport(profile)}
              className="w-full mt-8 py-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold active:scale-[0.99] transition-transform"
            >
              Report profile
            </button>
          )}
          </InfoModalSheet>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};