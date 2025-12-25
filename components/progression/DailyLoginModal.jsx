import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Gift, Coins, Gem, Zap, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const LOGIN_REWARDS = [
  { day: 1, coins: 150, gems: 3, xp: 75, icon: Coins },
  { day: 2, coins: 200, gems: 5, xp: 100, icon: Gem },
  { day: 3, coins: 300, gems: 8, xp: 150, icon: Gem },
  { day: 4, coins: 450, gems: 12, xp: 200, icon: Gem },
  { day: 5, coins: 600, gems: 15, xp: 300, icon: Star },
  { day: 6, coins: 800, gems: 20, xp: 400, icon: Star },
  { day: 7, coins: 1500, gems: 35, xp: 750, icon: Star },
  // Cycle repeats with increasing rewards
  { day: 8, coins: 1800, gems: 45, xp: 900, icon: Star },
  { day: 9, coins: 2200, gems: 55, xp: 1100, icon: Star },
  { day: 10, coins: 3000, gems: 70, xp: 1500, icon: Star }
];

// Generate rewards dynamically for streaks beyond day 10
const getRewardForDay = (day) => {
  if (day <= 10) {
    return LOGIN_REWARDS[day - 1];
  }
  // Scale rewards for longer streaks
  const baseReward = LOGIN_REWARDS[9]; // Day 10 reward
  const multiplier = Math.floor((day - 10) / 7) + 1;
  return {
    day,
    coins: baseReward.coins * multiplier,
    gems: baseReward.gems * multiplier,
    xp: baseReward.xp * multiplier,
    icon: Star
  };
};

export default function DailyLoginModal({ loginStreak, onClaim, onClose }) {
  const [claimed, setClaimed] = useState(false);
  const currentDay = loginStreak;
  const reward = getRewardForDay(currentDay);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleClaim = () => {
    setClaimed(true);
    onClaim(reward);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
    setTimeout(() => onClose(), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl border-4 border-purple-400 shadow-2xl overflow-hidden"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="p-8 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white/30"
          >
            <Gift className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-4xl font-black text-white mb-2">Daily Bonus!</h2>
          <p className="text-purple-200 mb-6">Welcome back! Here's your reward</p>

          {/* Login Streak */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200 font-bold text-lg">
                {currentDay} Day Streak! 🔥
              </span>
            </div>
            <div className="flex justify-center gap-2 flex-wrap max-w-md mx-auto">
              {[...Array(Math.min(currentDay + 2, 10))].map((_, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    idx < currentDay
                      ? 'bg-green-500 border-green-400'
                      : idx === currentDay - 1
                      ? 'bg-yellow-500 border-yellow-400 animate-pulse'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <span className="text-white font-bold text-xs">{idx + 1}</span>
                </div>
              ))}
              {currentDay > 10 && (
                <div className="text-purple-200 text-sm">+{currentDay - 10} more!</div>
              )}
            </div>
          </div>

          {/* Today's Reward */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-black/30 rounded-2xl p-6 mb-6 border-2 border-purple-400"
          >
            <p className="text-purple-200 text-sm mb-4">Day {currentDay} Reward</p>
            <div className="flex justify-center gap-6">
              {reward.coins > 0 && (
                <div className="flex items-center gap-2">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <span className="text-3xl font-bold text-white">+{reward.coins}</span>
                </div>
              )}
              {reward.gems > 0 && (
                <div className="flex items-center gap-2">
                  <Gem className="w-8 h-8 text-purple-400" />
                  <span className="text-3xl font-bold text-white">+{reward.gems}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Zap className="w-8 h-8 text-orange-400" />
                <span className="text-3xl font-bold text-white">+{reward.xp} XP</span>
              </div>
            </div>
          </motion.div>

          <Button
            onClick={handleClaim}
            disabled={claimed}
            className="w-full py-6 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-2xl"
          >
            {claimed ? '✓ Claimed!' : 'Claim Reward'}
          </Button>

          <p className="text-purple-200 text-sm mt-4">
            Keep logging in daily to maintain your streak! 🔥
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}