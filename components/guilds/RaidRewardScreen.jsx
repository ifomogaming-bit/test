import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Coins, Gem, Star, Crown, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RaidRewardScreen({ boss, myContribution, myGuild, onClose, rewards }) {
  const isTopContributor = myContribution?.damage_dealt > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-blue-900/60 border-4 border-yellow-500/60 shadow-2xl shadow-yellow-500/40">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1, delay: 0.2 }}
            >
              <Trophy className="w-32 h-32 mx-auto mb-6 text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,1)]" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 mb-3">
                VICTORY!
              </CardTitle>
              <p className="text-yellow-300 text-2xl font-bold mb-2">
                {boss.name} Has Been Defeated!
              </p>
              <Badge className="bg-purple-500/30 text-purple-200 text-lg px-6 py-2">
                Guild-Wide Celebration
              </Badge>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Fireworks effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ 
                    x: '50%', 
                    y: '50%',
                    scale: 0 
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              ))}
            </div>

            {/* Guild Rewards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-400/50 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-yellow-300 text-3xl font-black text-center flex items-center justify-center gap-3 mb-6">
                <Gift className="w-8 h-8" />
                Guild Rewards
                <Sparkles className="w-8 h-8" />
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="bg-yellow-600/30 rounded-xl p-4 text-center border-2 border-yellow-400/40"
                >
                  <Coins className="w-10 h-10 mx-auto mb-2 text-yellow-400" />
                  <p className="text-3xl font-black text-white">{rewards.coins?.toLocaleString() || 0}</p>
                  <p className="text-yellow-300 text-sm">Coins</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  className="bg-purple-600/30 rounded-xl p-4 text-center border-2 border-purple-400/40"
                >
                  <Gem className="w-10 h-10 mx-auto mb-2 text-purple-400" />
                  <p className="text-3xl font-black text-white">{rewards.gems || 0}</p>
                  <p className="text-purple-300 text-sm">Gems</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, type: "spring" }}
                  className="bg-blue-600/30 rounded-xl p-4 text-center border-2 border-blue-400/40"
                >
                  <Star className="w-10 h-10 mx-auto mb-2 text-blue-400" />
                  <p className="text-3xl font-black text-white">{rewards.guild_xp?.toLocaleString() || 0}</p>
                  <p className="text-blue-300 text-sm">Guild XP</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1, type: "spring" }}
                  className="bg-pink-600/30 rounded-xl p-4 text-center border-2 border-pink-400/40"
                >
                  <Crown className="w-10 h-10 mx-auto mb-2 text-pink-400" />
                  <p className="text-2xl font-black text-white">Rare</p>
                  <p className="text-pink-300 text-sm">Items</p>
                </motion.div>
              </div>

              {/* Exclusive Theme */}
              {rewards.exclusive_theme && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-2 border-indigo-400/60 rounded-xl p-6 text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-16 h-16 mx-auto mb-3 text-indigo-300" />
                  </motion.div>
                  <p className="text-indigo-200 text-lg font-bold mb-2">🎨 EXCLUSIVE THEME UNLOCKED!</p>
                  <p className="text-white text-2xl font-black">{rewards.exclusive_theme}</p>
                  <p className="text-indigo-300 text-sm mt-2">Only available to guilds who defeat this boss!</p>
                </motion.div>
              )}
            </motion.div>

            {/* Personal Contribution Bonus */}
            {isTopContributor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl p-4 text-center"
              >
                <Trophy className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p className="text-green-300 text-xl font-black mb-2">Personal Contribution Bonus!</p>
                <p className="text-white text-lg">+{Math.floor(myContribution.damage_dealt / 100)} extra coins</p>
                <p className="text-emerald-300 text-sm mt-2">
                  You dealt {myContribution.damage_dealt.toLocaleString()} damage!
                </p>
              </motion.div>
            )}

            {/* Rare Items List */}
            {rewards.rare_items && rewards.rare_items.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-600"
              >
                <p className="text-yellow-300 font-bold mb-3 text-center">📦 Rare Items Acquired:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {rewards.rare_items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 + (i * 0.1) }}
                      className="bg-purple-500/20 rounded-lg p-2 text-center border border-purple-400/30"
                    >
                      <p className="text-white text-sm font-bold">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <Button
                onClick={onClose}
                className="w-full py-8 text-2xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 hover:from-yellow-700 hover:via-orange-700 hover:to-red-700 shadow-2xl shadow-yellow-500/50"
              >
                <Trophy className="w-8 h-8 mr-3" />
                Claim Rewards & Continue
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}