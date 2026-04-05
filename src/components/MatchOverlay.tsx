import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, X, Heart } from 'lucide-react';

export const MatchOverlay: React.FC = () => {
  const navigate = useNavigate();
  const { user, showMatchOverlay, setShowMatchOverlay, setView, setActiveChatId } = useApp();

  if (!showMatchOverlay) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#0B0D14]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 overflow-hidden"
      >
        <button 
          onClick={() => setShowMatchOverlay(null)}
          className="absolute top-12 right-8 p-3 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-transform"
        >
          <X className="w-6 h-6 text-white/40" />
        </button>

        <motion.div
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-black italic text-[#FF8C00] tracking-tighter drop-shadow-[0_0_30px_rgba(255,140,0,0.5)] mb-2">
            IT'S A MATCH!
          </h2>
          <p className="text-white/60 font-medium text-lg">You and {showMatchOverlay.name} are compatible</p>
        </motion.div>

        <div className="relative flex items-center justify-center mb-16 h-48 w-full max-w-xs">
          <motion.div
            initial={{ x: -60, rotate: -15, opacity: 0 }}
            animate={{ x: -30, rotate: -10, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-40 h-52 rounded-[32px] border-4 border-[#0B0D14] overflow-hidden shadow-2xl relative z-10"
          >
            <img src={user?.photo} alt="" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ x: 60, rotate: 15, opacity: 0 }}
            animate={{ x: 30, rotate: 10, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-40 h-52 rounded-[32px] border-4 border-[#0B0D14] overflow-hidden shadow-2xl relative z-10"
          >
            <img src={showMatchOverlay.photo} alt="" className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="absolute z-20 bg-[#FF8C00] p-4 rounded-full shadow-[0_0_30px_#FF8C00] border-4 border-[#0B0D14]"
          >
            <Heart className="w-10 h-10 text-white fill-current" />
          </motion.div>
        </div>

        <div className="w-full space-y-4 max-w-[280px]">
          <button
            onClick={() => {
              setActiveChatId(showMatchOverlay.id);
              setView('chats');
              navigate('/chats');
              setShowMatchOverlay(null);
            }}
            className="w-full py-5 bg-[#FF8C00] text-white font-black text-lg rounded-[24px] shadow-[0_12px_24px_-8px_rgba(255,140,0,0.5)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            Send a Message
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowMatchOverlay(null)}
            className="w-full py-5 bg-white/5 text-white/60 font-black rounded-[24px] border border-white/10 active:scale-[0.98] transition-all"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};