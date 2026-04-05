import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, UserProfile } from '../context/AppContext';
import { DatingIntent } from '../lib/yeneFeatures';
import { registerSignedUpUser, getInterestTags } from '../lib/appSettings';
import { useLocalDataRevision } from '../hooks/useLocalDataRevision';
import { hapticFeedback, hapticSuccess, cn, getTelegramWebApp } from '../lib/utils';
import { AgePicker } from '@/components/ui/AgePicker';
import { Camera, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { id: 'name', title: "What's your name?", subtitle: "This will be shown on your profile." },
  { id: 'username', title: "Choose a username", subtitle: "This will be used as your profile URL." },
  { id: 'age', title: "How old are you?", subtitle: "You must be 18 or older to use Yene." },
  { id: 'gender', title: "I am a...", subtitle: "Select your gender and interests." },
  { id: 'intent', title: "What are you looking for?", subtitle: "We'll prioritize people who want something similar. You can change this later." },
  { id: 'contact', title: "Phone Number", subtitle: "We'll use this for account verification." },
  { id: 'location', title: "Where are you?", subtitle: "We'll find matches near you." },
  { id: 'bio', title: "Tell us about you", subtitle: "A short bio helps people start a conversation." },
  { id: 'photo', title: "Add a photo", subtitle: "Profiles with photos get 3x more matches." }
];

export const Onboarding: React.FC = () => {
  const { setUser, setView, isUsernameTaken } = useApp();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    username: '',
    age: 24,
    gender: 'Woman',
    interests: [],
    phoneNumber: '',
    telegramUsername: '',
    photo: '',
    location: '',
    datingIntent: 'open' as DatingIntent,
    bio: '',
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tagRev = useLocalDataRevision();
  const interestOptions = useMemo(() => getInterestTags(), [tagRev]);
  const [telegramUserId, setTelegramUserId] = useState<number | undefined>(undefined);

  useEffect(() => {
    console.log('Checking Telegram WebApp availability...');
    
    // Check if we're in Telegram environment
    const isTelegramEnvironment = !!(window as any).Telegram?.WebApp;
    console.log('Is Telegram environment:', isTelegramEnvironment);
    
    if (isTelegramEnvironment) {
      const tg = getTelegramWebApp();
      console.log('Telegram WebApp found:', tg);
      
      tg.ready().then(() => {
        console.log('Telegram WebApp ready');
        tg.ready();
        
        // Get current user info from Telegram
        tg.getMe().then((u) => {
          console.log('Telegram user data:', u);
          
          if (!u?.id) {
            console.log('No Telegram user ID found');
            return;
          }
          
          setTelegramUserId(u.id);
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
          const uname = u.username?.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() ?? '';
          
          console.log('Setting form data from Telegram:', { fullName, uname, photo: u.photo_url });
          
          setFormData((prev) => ({
            ...prev,
            name: fullName || u.username || prev.name,
            username: uname || prev.username,
            telegramUsername: u.username ? `@${u.username}` : prev.telegramUsername,
            photo: u.photo_url || prev.photo,
          }));
        }).catch((error) => {
          console.error('Failed to get Telegram user info:', error);
        });
      }).catch((error) => {
        console.error('Telegram WebApp failed to initialize:', error);
      });
    } else {
      console.log('Not running in Telegram environment - Telegram features disabled');
      // Set telegramUserId to null to disable Telegram features
      setTelegramUserId(null);
    }
  }, []);

  const handlePhotoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateFormData('photo', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const nextStep = () => {
    hapticFeedback();

    if (step === 0 && !formData.name?.trim()) {
      toast.error('Please enter your name');
      return;
    } else if (step === 1) {
      // Username validation
      const username = (formData.username || '').trim();
      if (!username) {
        toast.error('Please choose a username');
        return;
      }
      if (isUsernameTaken(username)) {
        toast.error('Username already taken, please choose another one');
        return;
      }
    } else if (step === 5) {
      // Contact validation - phone is mandatory
      const phone = (formData.phoneNumber || '').trim();
      if (!phone) {
        toast.error('Please enter your phone number');
        return;
      }
      // Basic phone validation
      if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) {
        toast.error('Please enter a valid phone number');
        return;
      }
    } else if (step === 6 && !formData.location?.trim()) {
      toast.error('Please enter your location');
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const primaryPhoto = (formData.photo || '').trim();
      if (!primaryPhoto) {
        toast.error('Add a profile photo', { description: 'A clear photo is required to use Yene.' });
        return;
      }
      const idBase = (formData.name || 'user').split(' ')[0].toLowerCase();
      const uid = `${idBase}-${Math.random().toString(36).substr(2, 9)}`;
      const today = new Date().toISOString().slice(0, 10);
      const newUser = {
        ...formData,
        id: uid,
        photo: primaryPhoto,
        photos: [primaryPhoto],
        likesUsedToday: 0,
        lastLikeResetDate: today,
        cardsSeenToday: 0,
        lastDeckResetDate: today,
        streakDay: 1,
        lastStreakDate: today,
        blockedUserIds: [],
        lastSeenAt: Date.now(),
        isOnline: true,
      } as UserProfile;
      registerSignedUpUser({
        id: uid,
        name: formData.name || 'User',
        username: formData.username,
        joinedAt: Date.now(),
        gender: formData.gender,
        datingIntent: formData.datingIntent,
      });
      setUser(newUser);
      hapticSuccess();
      setView('discovery');
    }
  };

  const updateFormData = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleContinueWithTelegram = () => {
    hapticFeedback();
    const tg = getTelegramWebApp();
    try {
      tg?.expand?.();
    } catch {
      /* ignore */
    }
    
    // Check if we're in Telegram environment
    const isTelegramEnvironment = !!(window as any).Telegram?.WebApp;
    
    if (!isTelegramEnvironment) {
      toast.message('Telegram features only available in Telegram', {
        description: 'Please open this app from Telegram to use Telegram integration.',
      });
      window.open('https://telegram.org/tour/mini-apps', '_blank', 'noopener,noreferrer');
      return;
    }
    
    // If we're in Telegram but telegramUserId is null, try to initialize again
    if (telegramUserId == null) {
      toast.message('Initializing Telegram...', {
        description: 'Please wait while we connect to your Telegram account.',
      });
      // Trigger the Telegram initialization again
      if (tg) {
        tg.ready().then(() => {
          tg.getMe().then((u) => {
            if (u?.id) {
              setTelegramUserId(u.id);
              const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
              const uname = u.username?.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() ?? '';
              setFormData((prev) => ({
                ...prev,
                name: fullName || u.username || prev.name,
                username: uname || prev.username,
                telegramUsername: u.username ? `@${u.username}` : prev.telegramUsername,
                photo: u.photo_url || prev.photo,
              }));
              toast.success('Telegram connected successfully!');
            }
          });
        });
      }
      return;
    }
    
    // If we have telegramUserId, proceed to next step
    if (telegramUserId != null) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const currentStep = steps[step];

  return (
    <div className="flex flex-col h-screen bg-[#0B0D14] p-6 pt-12 safe-area-top">
      <button
        type="button"
        onClick={handleContinueWithTelegram}
        className={cn(
          "w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all active:scale-[0.99] mb-4",
          'w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all active:scale-[0.99] mb-4',
          telegramUserId != null
            ? 'bg-[#FF8C00]/15 border-[#FF8C00]/40 text-[#FF8C00]'
            : 'bg-white/5 border-white/10 text-white hover:bg-white/[0.08]'
        )}
      >
        <span>Continue with Telegram</span>
        {telegramUserId != null && <span className="text-[10px] font-black opacity-90">✓</span>}
      </button>
      {telegramUserId != null && (
        <p className="text-xs text-white/50 text-center -mt-2 mb-4 max-w-[320px] mx-auto leading-relaxed">
          We prefilled your name, username, and photo from Telegram when available. Add anything missing below.
        </p>
      )}

      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              i <= step ? "bg-[#FF8C00]" : "bg-white/10"
            )} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col"
        >
          <h1 className="text-3xl font-bold mb-2 text-white">{currentStep.title}</h1>
          <p className="text-white/60 mb-8">{currentStep.subtitle}</p>

          <div className="flex-1">
            {step === 0 && (
              <input
                type="text"
                autoFocus
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl text-white focus:outline-none focus:border-[#FF8C00] transition-colors"
              />
            )}

            {step === 1 && (
              <div className="flex flex-col items-center justify-center pt-4">
                <div className="w-full">
                  <label className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3 block">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateFormData('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="your_username"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl text-white focus:outline-none focus:border-[#FF8C00] transition-colors"
                    autoFocus
                  />
                  <p className="text-xs text-white/40 mt-2">Choose a unique username. Only letters, numbers, and underscores allowed.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <AgePicker 
                value={formData.age || 24}
                onChange={(age) => updateFormData('age', age)}
                className="max-w-md mx-auto"
              />
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="flex gap-2">
                  {['Woman', 'Man', 'Non-binary'].map(g => (
                    <button
                      key={g}
                      onClick={() => updateFormData('gender', g)}
                      className={cn(
                        "flex-1 py-3 rounded-2xl text-sm font-bold transition-all",
                        formData.gender === g 
                          ? "bg-[#FF8C00] text-white" 
                          : "bg-white/5 text-white/60 border border-white/10"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Interests</p>
                  {(formData.interests?.length ?? 0) > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 yene-scrollbar-thin">
                      {formData.interests?.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const interests = formData.interests || [];
                            updateFormData('interests', interests.filter((i) => i !== tag));
                          }}
                          className="shrink-0 inline-flex items-center gap-1.5 pl-3 pr-2 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FF4B8B] to-[#FF8E53]"
                        >
                          {tag}
                          <span className="opacity-90">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="max-h-40 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3 yene-scrollbar-thin">
                    <div className="flex flex-wrap gap-2">
                      {interestOptions
                        .filter((t) => !formData.interests?.includes(t))
                        .map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => {
                              const interests = formData.interests || [];
                              updateFormData('interests', [...interests, interest]);
                            }}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-white/5 text-white/70 border border-white/10"
                          >
                            {interest}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-white/50 mb-4">Be honest — it helps us show you better matches.</p>
                {(
                  [
                    { id: 'serious' as DatingIntent, label: 'Relationship', sub: 'Something meaningful' },
                    { id: 'casual' as DatingIntent, label: 'Casual dating', sub: 'See where it goes' },
                    { id: 'friends' as DatingIntent, label: 'Friends first', sub: 'Connection without pressure' },
                    { id: 'open' as DatingIntent, label: 'Open / exploring', sub: 'I’m still figuring it out' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateFormData('datingIntent', opt.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-2xl border transition-all',
                      formData.datingIntent === opt.id
                        ? 'bg-[#FF8C00]/20 border-[#FF8C00] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    )}
                  >
                    <span className="font-bold block">{opt.label}</span>
                    <span className="text-xs text-white/40">{opt.sub}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3 block">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl text-white focus:outline-none focus:border-[#FF8C00] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3 block">Telegram Username (Optional)</label>
                  <input
                    type="text"
                    value={formData.telegramUsername}
                    onChange={(e) => updateFormData('telegramUsername', e.target.value)}
                    placeholder="@username"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl text-white focus:outline-none focus:border-[#FF8C00] transition-colors"
                  />
                  <p className="text-xs text-white/40 mt-2">Optional: We'll use this for notifications and verification</p>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col items-center justify-center pt-4">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="Enter your city"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl text-white focus:outline-none focus:border-[#FF8C00] transition-colors mb-6"
                />
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const { latitude, longitude } = position.coords;
                          try {
                            // Reverse geocode to get city name
                            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                            const data = await response.json();
                            const city = data.city || data.locality || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                            updateFormData('location', city);
                            // Store coordinates for backend
                            updateFormData('latitude', latitude);
                            updateFormData('longitude', longitude);
                            toast.success('Location detected!');
                          } catch (error) {
                            updateFormData('location', `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                            toast.success('Location detected!');
                          }
                        },
                        () => toast.error('Location access denied')
                      );
                    }
                  }}
                  className="px-6 py-3 bg-[#FF8C00] text-white font-bold rounded-2xl"
                >
                  Use Current Location
                </button>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="e.g. Coffee nerd, weekend hikes, bad at trivia…"
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF8C00] transition-colors resize-none"
                />
                <p className="text-xs text-white/40">Optional — you can edit this anytime.</p>
              </div>
            )}

            {step === 8 && (
              <div className="flex flex-col items-center justify-center pt-4">
                <p className="text-sm text-[#FF8C00] font-bold mb-4 text-center px-2">
                  A profile photo is required — upload one to continue.
                </p>
                <div className="relative w-56 h-72 rounded-[32px] overflow-hidden bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-4 right-4 bg-[#FF8C00] p-3 rounded-full shadow-lg active:scale-90 transition-transform"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files?.[0] ?? null)}
                  />
                </div>
                <p className="mt-8 text-sm text-white/40 text-center max-w-[220px]">
                  Tap the camera icon to upload your best photo (or use your Telegram photo if shown above).
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto pt-6 safe-area-bottom">
        <button
          onClick={nextStep}
          disabled={
            (step === 0 && !formData.name?.trim()) ||
            (step === 1 && !formData.username?.trim()) ||
            (step === 6 && !formData.location?.trim()) ||
            (step === 8 && !formData.photo?.trim())
          }
          className={cn(
            "w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
            (step === 0 && !formData.name?.trim()) ||
              (step === 1 && !formData.username?.trim()) ||
              (step === 6 && !formData.location?.trim()) ||
              (step === 8 && !formData.photo?.trim())
              ? "bg-white/5 text-white/20"
              : "bg-gradient-to-r from-[#FF4B8B] to-[#FF8E53] text-white shadow-[0_12px_24px_-8px_rgba(255,75,139,0.45)]"
          )}
        >
          {step === steps.length - 1 ? "Start Matching" : "Continue"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};