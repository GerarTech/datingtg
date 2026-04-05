import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';
import { hapticFeedback } from '../lib/utils';
import { toast } from 'sonner';

export const BlockedUsers: React.FC = () => {
  const { user, unblockUser } = useApp();
  const navigate = useNavigate();
  const ids = user?.blockedUserIds ?? [];

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white flex flex-col safe-area-top">
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 pt-12 border-b border-white/5 bg-[#0B0D14]/95 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => {
            hapticFeedback();
            navigate(-1);
          }}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Blocked users</h1>
          <p className="text-[11px] text-white/40 font-medium">People you won&apos;t see in discovery</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto yene-scrollbar px-4 py-6 pb-28">
        {ids.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6">
            <div className="w-20 h-20 rounded-[28px] bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6">
              <UserX className="w-9 h-9 text-white/25" />
            </div>
            <h2 className="text-lg font-bold text-white/90 mb-2">No blocked users</h2>
            <p className="text-sm text-white/45 max-w-xs leading-relaxed">
              When you block someone, they appear here. You can unblock anytime.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {ids.map((id) => {
              const p = SAMPLE_PROFILES.find((x) => x.id === id);
              const label = p?.name ?? `User ${id.slice(0, 8)}`;
              const photo =
                p?.photo ??
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60';
              return (
                <li
                  key={id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10"
                >
                  <img src={photo} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{label}</p>
                    <p className="text-[11px] text-white/35 font-mono truncate">{id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback();
                      unblockUser(id);
                      toast.success('Unblocked');
                    }}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs font-black uppercase tracking-widest text-[#FF8C00] active:scale-95 transition-transform"
                  >
                    Unblock
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
