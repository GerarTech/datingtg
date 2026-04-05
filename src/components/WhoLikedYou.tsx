import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export const WhoLikedYou: React.FC = () => {
  const { matches } = useApp();
  const navigate = useNavigate();

  // Get users who liked the current user (from matches where they were liked first)
  const likers = matches.map(match => ({
    id: match.id,
    name: match.name,
    age: match.age,
    photo: match.photo,
    distance: match.distance || 'Unknown distance',
    isMatch: true // All users in matches are by definition matched
  }));

  return (
    <div className="h-screen w-full flex flex-col bg-[#0B0D14] text-white">
      {/* Header */}
      <div className="shrink-0 p-6 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black">Who Liked You</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
        {likers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {likers.map((liker) => (
              <button
                key={liker.id}
                type="button"
                onClick={() => {
                  if (!liker.isMatch) {
                    // Premium prompt would go here, but for now just navigate
                    navigate(`/profile/${liker.id}`, { state: { profileBack: { path: '/who-liked-you' } } });
                  } else {
                    navigate(`/profile/${liker.id}`, { state: { profileBack: { path: '/who-liked-you' } } });
                  }
                }}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 group"
              >
                <img 
                  src={liker.photo} 
                  alt="" 
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-all duration-300",
                    !liker.isMatch && "blur-xl scale-105"
                  )} 
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-bold">
                  {liker.name}, {liker.age}
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                {!liker.isMatch && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <Heart className="w-8 h-8 text-white/60 mx-auto mb-2" />
                      <p className="text-xs text-white/60">Match to See</p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Heart className="w-16 h-16 text-white/20 mb-4" />
            <h2 className="text-lg font-bold text-white/70 mb-2">No Likes Yet</h2>
            <p className="text-sm text-white/40">Keep swiping to get likes!</p>
          </div>
        )}
      </div>
    </div>
  );
};