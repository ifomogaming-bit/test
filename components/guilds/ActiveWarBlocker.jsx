import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Swords, Flame, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActiveWarBlocker({ isOpen, onClose, currentWar, myGuild, opponentGuild }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-red-950 via-orange-950 to-red-950 border-4 border-red-500/60 shadow-2xl shadow-red-500/50 overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 p-4 sm:p-6 text-center space-y-4 sm:space-y-6">
          {/* Icon display */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-red-500/30 rounded-full blur-xl"
              />
              <Swords className="w-24 h-24 text-red-400 relative z-10 drop-shadow-[0_0_30px_rgba(248,113,113,0.9)]" />
            </div>
          </motion.div>

          {/* Title */}
          <div>
            <motion.h2 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-orange-300 to-red-300 mb-3"
            >
              ⚔️ BATTLE IN PROGRESS ⚔️
            </motion.h2>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center justify-center gap-2 text-orange-300"
            >
              <Flame className="w-5 h-5" />
              <span className="font-bold text-lg">Your guild is already at war!</span>
              <Flame className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Current war info */}
          <div className="bg-slate-900/60 rounded-xl p-6 border-2 border-red-500/40">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-2 text-cyan-400" />
                <p className="text-white font-black text-lg">{myGuild?.name}</p>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="w-8 h-8 text-yellow-400 mb-1" />
                <span className="text-red-400 font-black text-2xl">VS</span>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-2 text-red-400" />
                <p className="text-white font-black text-lg">{opponentGuild?.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-cyan-600/20 rounded-lg p-3">
                <p className="text-cyan-300 text-sm">Your Score</p>
                <p className="text-white text-3xl font-black">{currentWar?.challenger_score || 0}</p>
              </div>
              <div className="bg-red-600/20 rounded-lg p-3">
                <p className="text-red-300 text-sm">Enemy Score</p>
                <p className="text-white text-3xl font-black">{currentWar?.opponent_score || 0}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-lg p-3 sm:p-4">
            <p className="text-orange-200 font-bold text-sm sm:text-base md:text-lg mb-2">
              🔥 Focus on your current battle!
            </p>
            <p className="text-slate-300 text-xs sm:text-sm">
              Complete this war before challenging another guild. Victory awaits!
            </p>
          </div>

          {/* Action button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 text-white font-black text-sm sm:text-base md:text-lg py-4 sm:py-6 shadow-xl shadow-red-500/50 border-2 border-red-400/50"
          >
            <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            RETURN TO BATTLE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}