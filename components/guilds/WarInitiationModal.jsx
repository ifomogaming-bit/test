import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Shield, Users, Trophy, X, Zap, Target, Flame, ArrowLeft, Sparkles, Skull } from 'lucide-react';

export default function WarInitiationModal({ isOpen, onClose, myGuild, opponentGuild, onConfirm }) {
  const myPower = Math.round((myGuild?.member_count * 1000) + (myGuild?.total_portfolio_value * 0.5));
  const opponentPower = Math.round((opponentGuild?.member_count * 1000) + (opponentGuild?.total_portfolio_value * 0.5));
  const powerDiff = Math.abs(myPower - opponentPower);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] bg-transparent border-none p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative"
        >
          {/* Epic background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-orange-950 to-red-950 rounded-2xl" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-red-600/20 to-orange-600/20 rounded-2xl"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
          
          {/* Animated fire particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: i % 2 === 0 ? 'radial-gradient(circle, #ff6b35 0%, #f7931e 50%, transparent 100%)' : 'radial-gradient(circle, #ff4500 0%, #ff8c00 50%, transparent 100%)'
              }}
              animate={{
                x: [Math.random() * 600 - 100, Math.random() * 600 - 100],
                y: [Math.random() * 500 - 50, Math.random() * 500 - 50],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Lightning bolts */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`bolt-${i}`}
              className="absolute w-1 h-20 bg-gradient-to-b from-yellow-400 via-orange-500 to-transparent"
              style={{ 
                left: `${20 + i * 15}%`, 
                top: '-20px',
                filter: 'blur(1px)'
              }}
              animate={{
                opacity: [0, 1, 0],
                scaleY: [0, 1, 0]
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 1.5,
                repeatDelay: 3
              }}
            />
          ))}

          <div className="relative p-4 sm:p-6 md:p-8">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Epic Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-4"
              >
                <div className="relative inline-block">
                  <motion.div
                    className="absolute inset-0 blur-2xl"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Swords className="w-24 h-24 text-orange-500" />
                  </motion.div>
                  <Swords className="w-24 h-24 text-orange-400 relative z-10 drop-shadow-[0_0_30px_rgba(251,146,60,1)]" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ 
                      scale: [1, 1.4, 1], 
                      opacity: [0.8, 0, 0.8],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-24 h-24 text-yellow-400" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Flame className="w-8 h-8 text-orange-500" />
                  </motion.div>
                </div>
              </motion.div>
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-300 to-orange-300 mb-3"
                animate={{ 
                  textShadow: [
                    '0 0 20px rgba(251,146,60,0.5)',
                    '0 0 40px rgba(251,146,60,0.8)',
                    '0 0 20px rgba(251,146,60,0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚔️ DECLARE WAR ⚔️
              </motion.h2>
              <motion.p 
                className="text-orange-200 font-bold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Skull className="w-5 h-5" />
                Battle for glory and dominance!
                <Skull className="w-5 h-5" />
              </motion.p>
            </div>

            {/* Guild vs Guild */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* My Guild */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gradient-to-br from-blue-900/70 to-cyan-900/70 rounded-xl p-6 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/50 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] relative z-10" />
                </motion.div>
                <h3 className="text-white font-black text-center mb-2 relative z-10 text-sm sm:text-base break-words">{myGuild?.name}</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Members:</span>
                    <span className="font-bold text-white">{myGuild?.member_count}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Power:</span>
                    <span className="font-bold text-cyan-400">{myPower.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Level:</span>
                    <span className="font-bold text-white">{myGuild?.level || 1}</span>
                  </div>
                </div>
              </motion.div>

              {/* Epic VS Badge */}
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500 blur-2xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-600 via-orange-600 to-red-600 flex items-center justify-center border-4 border-yellow-400 shadow-2xl shadow-orange-500/80 relative z-10">
                    <motion.span 
                      className="text-white font-black text-4xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        textShadow: [
                          '0 0 20px rgba(255,255,255,0.5)',
                          '0 0 40px rgba(255,255,255,1)',
                          '0 0 20px rgba(255,255,255,0.5)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      VS
                    </motion.span>
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-yellow-400"
                    animate={{ 
                      scale: [1, 1.5, 1], 
                      opacity: [1, 0, 1],
                      rotate: [0, 180]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: '-4px',
                        marginTop: '-4px'
                      }}
                      animate={{
                        x: [0, Math.cos(i * Math.PI / 4) * 60],
                        y: [0, Math.sin(i * Math.PI / 4) * 60],
                        opacity: [1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Opponent Guild */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.05, rotateY: -5 }}
                className="bg-gradient-to-br from-red-900/70 to-orange-900/70 rounded-xl p-6 border-2 border-red-400 shadow-2xl shadow-red-500/50 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-orange-500/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-12 h-12 text-red-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)] relative z-10" />
                </motion.div>
                <h3 className="text-white font-black text-center mb-2 relative z-10 text-sm sm:text-base break-words">{opponentGuild?.name}</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Members:</span>
                    <span className="font-bold text-white">{opponentGuild?.member_count}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Power:</span>
                    <span className="font-bold text-red-400">{opponentPower.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Level:</span>
                    <span className="font-bold text-white">{opponentGuild?.level || 1}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* War Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-slate-400 text-xs text-center mb-1">Match Quality</p>
                <p className="text-white font-black text-center">
                  {powerDiff < myPower * 0.1 ? 'EXCELLENT' : powerDiff < myPower * 0.2 ? 'GOOD' : 'FAIR'}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-slate-400 text-xs text-center mb-1">Prize Pool</p>
                <p className="text-white font-black text-center">15,000</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-slate-400 text-xs text-center mb-1">Duration</p>
                <p className="text-white font-black text-center">5 Days</p>
              </div>
            </div>

            {/* War Rules */}
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-4 md:p-6 border border-orange-500/30 mb-8 max-h-[40vh] md:max-h-none overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <h3 className="text-orange-300 font-bold text-sm md:text-base">War Rules</h3>
              </div>
              <ul className="space-y-2 text-slate-300 text-xs md:text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Challenge opposing guild members to earn points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Win mini-games to score for your guild</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Guild with highest score wins the prize pool</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>War lasts 5 days - time to strategize!</span>
                </li>
              </ul>
            </div>

            {/* Epic Action Buttons */}
            <motion.div 
              className="flex gap-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 py-7 text-lg font-bold transition-all"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <motion.div className="flex-1">
                <Button
                  onClick={onConfirm}
                  className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 shadow-2xl shadow-orange-500/80 py-7 text-xl font-black border-2 border-yellow-400/50 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <Swords className="w-6 h-6 mr-2 relative z-10" />
                  <span className="relative z-10">⚔️ DECLARE WAR ⚔️</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}