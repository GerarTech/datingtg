import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export const TopPicks: React.FC = () => {
  const { matches } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0B0D14] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 p-6 pb-4 bg-[#0B0D14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black">Top Picks</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {matches.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {matches.map((match) => (
              <button
                key={match.id}
                type="button"
                onClick={() => {
                  navigate(`/profile/${match.username || match.id}`, { state: { profileBack: { path: '/top-picks' } } });
                }}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 group"
              >
                <img src={match.photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-bold">
                  {match.name}, {match.age}
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Heart className="w-16 h-16 text-white/20 mb-4" />
            <h2 className="text-lg font-bold text-white/70 mb-2">No Top Picks Yet</h2>
            <p className="text-sm text-white/40">Keep swiping to find your perfect matches!</p>
          </div>
        )}
      </div>
    </div>
  );
};