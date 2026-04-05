import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, MapPin, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';
import { toast } from 'sonner';
import { UserProfile } from '../context/AppContext';
import { useApp } from '../context/AppContext';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';
import type { ProfileViewLocationState } from '../lib/profileNavigation';

export const ProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { matches, chats, user, addMatch, setActiveChatId, setView, blockUser, reportUser, unmatchUser } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      // First check if this is the current user's profile (by ID or username)
      if (user && (user.id === userId || user.username === userId)) {
        setProfile(user);
        setLoading(false);
        return;
      }

      // First check if user exists in local matches or chats (by ID or username)
      const localUser = matches.find(m => m.id === userId || m.username === userId) || 
                       chats.find(c => c.user.id === userId || c.user.username === userId)?.user;

      if (localUser) {
        setProfile(localUser);
        setLoading(false);
        return;
      }

      // Check if user exists in sample profiles (by ID or username)
      const sampleUser = SAMPLE_PROFILES.find(p => p.id === userId || p.username === userId);
      if (sampleUser) {
        setProfile(sampleUser);
        setLoading(false);
        return;
      }

      // If not found locally or in samples, try to fetch from backend
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8001/users/${userId}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const userData = await response.json();
        setProfile(userData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('User not found');
        // Fallback to a generic profile
        setProfile({
          id: userId,
          name: 'User',
          age: 25,
          gender: 'Person',
          interests: ['Dating', 'Fun'],
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60',
          distance: 'Unknown distance',
          bio: 'This user is exploring Yene!',
          isVerified: false,
          verificationStatus: 'unverified'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, matches, chats, user]);

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [userId]);

  const isMatched = matches.some(m => m.id === userId || m.username === userId);
  const isOwnProfile = user && (userId === user.id || userId === user.username);

  const handleLike = () => {
    if (profile) {
      hapticFeedback();
      addMatch(profile);
      toast.success('Profile liked!');
    }
  };

  const handleMessage = () => {
    hapticFeedback();
    
    if (isMatched) {
      const chat = chats.find((c) => c.user.id === userId || c.user.username === userId);
      if (chat) {
        setActiveChatId(chat.id);
        setView('chats');
        navigate('/chats');
      } else {
        toast.error('Chat not found');
      }
    } else {
      toast.info('Match with this person first to start chatting!');
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    hapticFeedback();
    const slug = profile.username || profile.id;
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(slug)}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `Check out ${profile.name}'s profile`,
          text: `Meet ${profile.name} on Yene!`,
          url: profileUrl,
        });
        return;
      }
    } catch {
      /* dismissed share sheet or share failed — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleBack = () => {
    const st = location.state as ProfileViewLocationState | null;
    if (st?.profileBack) {
      navigate(st.profileBack.path, {
        replace: true,
        state: st.profileBack.openMatches ? { openMatches: true } : st.profileBack.refreshDeck ? { refreshDeck: true } : {},
      });
      return;
    }
    navigate(-1);
  };

  const photos = profile?.photos || [profile?.photo].filter(Boolean) || [];
  const currentPhoto = photos[currentPhotoIndex] || profile?.photo;

  const nextPhoto = () => {
    if (photos.length > 1) {
      hapticFeedback();
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 1) {
      hapticFeedback();
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const goToPhoto = (index: number) => {
    if (index !== currentPhotoIndex) {
      hapticFeedback();
      setCurrentPhotoIndex(index);
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      nextPhoto();
    }
    if (isRightSwipe && photos.length > 1) {
      prevPhoto();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[#0B0D14] text-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full flex flex-col bg-[#0B0D14] text-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-white/60 mb-4">Profile not found</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-[#FF8C00] text-white font-bold rounded-xl"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0B0D14] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <button
          type="button"
          onClick={handleBack}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleShare}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform"
        >
          <Share2 className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Photo Carousel */}
      <div className="px-6 mb-6">
        <div className="relative">
          {/* Main Photo */}
          <div
            className="relative overflow-hidden rounded-[32px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentPhoto}
              alt={`${profile.name} - Photo ${currentPhotoIndex + 1}`}
              className="w-full h-96 object-cover transition-all duration-500 ease-out"
              key={currentPhotoIndex} // Force re-render for smooth transitions
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-[32px]" />

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center active:scale-90 transition-all border border-white/20"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center active:scale-90 transition-all border border-white/20"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Online indicator */}
            {profile.isOnline && (
              <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}

            {/* Verified badge */}
            {profile.isVerified && (
              <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl rounded-2xl px-3 py-1.5 border border-white/20">
                <span className="text-white text-sm font-bold">✓ Verified</span>
              </div>
            )}

            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-xl rounded-2xl px-3 py-1.5 border border-white/20">
                <span className="text-white text-sm font-bold">{currentPhotoIndex + 1}/{photos.length}</span>
              </div>
            )}
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-3 mt-4 px-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={cn(
                    "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 active:scale-95 hover:scale-105",
                    index === currentPhotoIndex
                      ? "border-[#FF8C00] ring-2 ring-[#FF8C00]/30 shadow-lg shadow-[#FF8C00]/20"
                      : "border-white/20 opacity-60 hover:opacity-80 hover:border-white/40"
                  )}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === currentPhotoIndex && (
                    <div className="absolute inset-0 bg-[#FF8C00]/20 rounded-xl" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-black">{profile.name}, {profile.age}</h1>
          {profile.isOnline && (
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-white/70 font-medium mb-4">
          <MapPin className="w-4 h-4 text-[#FF8C00]" />
          <span className="text-sm">{profile.distance}</span>
        </div>

        <p className="text-white/80 text-base leading-relaxed mb-6">
          {profile.bio}
        </p>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {(profile.interests ?? []).map((interest) => (
              <span
                key={interest}
                className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl text-sm font-bold border border-white/10 uppercase tracking-widest text-white/90"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isOwnProfile && (
        <div className="p-6 pt-0 space-y-3">
          <div className="flex gap-4">
            {!isMatched && (
              <button
                onClick={handleLike}
                className="flex-1 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Like
              </button>
            )}
            <button
              onClick={handleMessage}
              disabled={!isMatched}
              className={cn(
                "flex-1 py-4 text-white font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2",
                isMatched 
                  ? "bg-[#FF8C00] shadow-[0_12px_24px_-8px_rgba(255,140,0,0.4)]" 
                  : "bg-white/10 border border-white/20 opacity-60 cursor-not-allowed"
              )}
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              {isMatched ? 'Message' : 'Match First'}
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            {isMatched && (
              <button
                type="button"
                onClick={() => {
                  if (!profile) return;
                  hapticFeedback();
                  unmatchUser(profile.id);
                  toast.success('Unmatched — this user has been removed from your matches.');
                  handleBack();
                }}
                className="text-[11px] font-bold text-white/35 hover:text-white/60 uppercase tracking-widest"
              >
                Unmatch
              </button>
            )}
            {isMatched && <span className="text-white/15" aria-hidden>|</span>}
            <button
              type="button"
              onClick={() => {
                if (!profile) return;
                hapticFeedback();
                blockUser(profile.id);
                toast.success('Blocked — you won’t see each other in discovery.');
                handleBack();
              }}
              className="text-[11px] font-bold text-white/35 hover:text-white/60 uppercase tracking-widest"
            >
              Block
            </button>
            <span className="text-white/15" aria-hidden>|</span>
            <button
              type="button"
              onClick={() => {
                if (!profile) return;
                hapticFeedback();
                reportUser(profile.id, 'Profile — user report', {
                  reportedUserName: profile.name,
                  source: 'profile',
                });
                toast.message('Thanks — we review reports to keep Yene safe.');
              }}
              className="text-[11px] font-bold text-white/35 hover:text-white/60 uppercase tracking-widest"
            >
              Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};