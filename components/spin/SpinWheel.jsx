import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, X, Coins, Gem, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDailySpinRewards } from '@/components/economy/EconomyManager';
import adMobService from '@/components/ads/AdMobService';
import RewardConfirmation from '@/components/ads/RewardConfirmation';

const getRewards = () => {
  const baseRewards = getDailySpinRewards();
  return baseRewards.map(r => ({
    ...r,
    color: r.type === 'coins' ? '#eab308' : r.type === 'premium' ? '#a855f7' : '#22c55e'
  }));
};

const REWARDS = getRewards();

export default function SpinWheel({ onSpin, onClose, canSpin = true, player, queryClient }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showRewardConfirmation, setShowRewardConfirmation] = useState(false);

  if (!canSpin) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <Gift className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-2">Daily Spin</h2>
            <p className="text-slate-400 mb-4">Come back tomorrow for your next spin!</p>
            <Button
              id="btn_extra_spin"
              onClick={() => {
                adMobService.showRewardedAd('extra_spin', async () => {
                  // Grant extra spin
                  if (player && queryClient) {
                    await base44.entities.Player.update(player.id, {
                      last_daily_reset: null
                    });
                    queryClient.invalidateQueries(['player']);
                  }
                  setShowRewardConfirmation(true);
                  setTimeout(() => {
                    setShowRewardConfirmation(false);
                    onClose();
                  }, 3000);
                });
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              🎬 Watch Ad for Extra Spin
            </Button>
            <RewardConfirmation 
              show={showRewardConfirmation}
              rewardType="extra_spin"
              onClose={() => setShowRewardConfirmation(false)}
            />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const handleSpin = () => {
    if (!canSpin || spinning) return;
    
    setSpinning(true);
    const selectedIndex = Math.floor(Math.random() * REWARDS.length);
    const reward = REWARDS[selectedIndex];
    
    // Calculate rotation
    const segmentAngle = 360 / REWARDS.length;
    const targetRotation = 360 * 5 + (360 - selectedIndex * segmentAngle);
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setResult(reward);
      onSpin(reward);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center mb-6">
          <Gift className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Daily Spin</h2>
          <p className="text-slate-400 text-sm">Test your luck!</p>
        </div>

        {/* Wheel */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full h-full rounded-full border-4 border-slate-700 overflow-hidden"
            style={{ boxShadow: '0 0 40px rgba(234, 179, 8, 0.3)' }}
          >
            {REWARDS.map((reward, i) => {
              const angle = (360 / REWARDS.length) * i;
              return (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((2 * Math.PI) / REWARDS.length)}% ${50 - 50 * Math.cos((2 * Math.PI) / REWARDS.length)}%)`
                  }}
                >
                  <div 
                    className="w-full h-full flex items-start justify-center pt-4"
                    style={{ backgroundColor: reward.color, opacity: 0.8 }}
                  >
                    <span className="text-white text-xs font-bold rotate-0">
                      {reward.amount}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-yellow-400 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </motion.div>
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500" />
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/50"
            >
              <div className="flex items-center justify-center gap-3">
                {result.type === 'coins' && <Coins className="w-8 h-8 text-yellow-400" />}
                {result.type === 'premium' && <Gem className="w-8 h-8 text-purple-400" />}
                {result.type === 'xp' && <Star className="w-8 h-8 text-green-400" />}
                <div>
                  <p className="text-white font-bold text-xl">You won!</p>
                  <p className="text-yellow-400 text-lg">{result.label}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin Button */}
        {!result && (
          <Button
            onClick={handleSpin}
            disabled={!canSpin || spinning}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50"
          >
            {spinning ? 'Spinning...' : canSpin ? 'Spin Now!' : 'Come Back Tomorrow'}
          </Button>
        )}

        {result && (
          <Button
            onClick={onClose}
            className="w-full py-6 text-lg font-bold bg-green-600 hover:bg-green-700"
          >
            Claim Reward
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}