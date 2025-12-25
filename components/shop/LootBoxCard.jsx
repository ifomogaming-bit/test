import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Gem, Sparkles, Gift, TrendingUp, Star, Coins, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBalancedLootBoxReward, ECONOMY_CONFIG, calculateDynamicPricing } from '@/components/economy/EconomyManager';

export default function LootBoxCard({ tier, playerGems, onOpen, economyHealth = 1 }) {
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState(null);

  const baseCost = ECONOMY_CONFIG.LOOT_BOX_PRICES[tier];
  const actualCost = calculateDynamicPricing(baseCost, economyHealth);

  const config = {
    common: { 
      cost: actualCost,
      baseCost: baseCost,
      color: 'from-slate-600 to-slate-800', 
      border: 'border-slate-400',
      glow: 'shadow-slate-500/30',
      name: 'Common Loot Box',
      particles: 30
    },
    rare: { 
      cost: actualCost,
      baseCost: baseCost,
      color: 'from-blue-600 to-blue-900', 
      border: 'border-blue-400',
      glow: 'shadow-blue-500/50',
      name: 'Rare Loot Box',
      particles: 80
    },
    legendary: { 
      cost: actualCost,
      baseCost: baseCost,
      color: 'from-amber-500 to-orange-700', 
      border: 'border-yellow-400',
      glow: 'shadow-yellow-500/60',
      name: 'Legendary Loot Box',
      particles: 150
    },
    mythical: {
      cost: actualCost,
      baseCost: baseCost,
      color: 'from-purple-600 via-pink-600 to-indigo-700',
      border: 'border-purple-300',
      glow: 'shadow-purple-500/80',
      name: 'Mythical Loot Box',
      particles: 250
    }
  }[tier];

  const canAfford = playerGems >= config.cost;

  const handleOpen = () => {
    if (!canAfford) return;
    
    setIsOpening(true);

    setTimeout(() => {
      const selectedReward = getBalancedLootBoxReward(tier);
      setReward(selectedReward);
      
      if (tier === 'mythical') {
        confetti({
          particleCount: 250,
          spread: 130,
          colors: ['#a855f7', '#ec4899', '#f43f5e', '#fbbf24'],
          startVelocity: 45,
          ticks: 300
        });
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            colors: ['#a855f7', '#ec4899'],
            angle: 60,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 150,
            spread: 100,
            colors: ['#a855f7', '#ec4899'],
            angle: 120,
            origin: { x: 1 }
          });
        }, 250);
      } else if (tier === 'legendary') {
        confetti({
          particleCount: 150,
          spread: 100,
          colors: ['#fbbf24', '#f59e0b', '#eab308']
        });
      } else if (tier === 'rare') {
        confetti({
          particleCount: 80,
          spread: 70,
          colors: ['#3b82f6', '#60a5fa']
        });
      }
      
      setIsOpening(false);
    }, 2000);
  };

  const handleClaim = () => {
    onOpen(tier, reward);
    setReward(null);
  };

  const getRewardIcon = () => {
    if (!reward) return null;
    switch (reward.type) {
      case 'coins': return <Coins className="w-16 h-16 text-yellow-400" />;
      case 'gems': return <Gem className="w-16 h-16 text-purple-400" />;
      case 'xp': return <Star className="w-16 h-16 text-green-400" />;
      case 'level': return <Zap className="w-16 h-16 text-orange-400" />;
      case 'stock': return <TrendingUp className="w-16 h-16 text-blue-400" />;
      case 'powerup': return <Sparkles className="w-16 h-16 text-pink-400" />;
      default: return <Gift className="w-16 h-16 text-white" />;
    }
  };

  const getRewardLabel = () => {
    if (!reward) return '';
    switch (reward.type) {
      case 'coins': return `${reward.value.toLocaleString()} Coins`;
      case 'gems': return `${reward.value} Gems`;
      case 'xp': return `${reward.value.toLocaleString()} XP`;
      case 'level': return 'Level Up!';
      case 'stock': return `${reward.shares} ${reward.ticker} Shares`;
      case 'powerup': return reward.name;
      default: return 'Reward';
    }
  };

  const getRewardDescription = () => {
    if (!reward) return '';
    switch (reward.type) {
      case 'coins': return 'Add directly to your balance';
      case 'gems': return 'Premium currency added to account';
      case 'xp': return 'Experience points to level up';
      case 'level': return 'Instant level advancement!';
      case 'stock': return `Random stock shares added to portfolio`;
      case 'powerup': return reward.duration ? `Active for ${Math.floor(reward.duration / 60)} minutes` : 'Instant effect';
      default: return '';
    }
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: canAfford ? 1.05 : 1 }}
        className={`p-6 rounded-2xl border-2 bg-gradient-to-br ${config.color} ${config.border} ${config.glow} transition-all ${
          !canAfford ? 'opacity-50' : 'cursor-pointer'
        }`}
      >
        <div className="text-center">
          <motion.div
            animate={isOpening ? { 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.5, repeat: isOpening ? Infinity : 0 }}
            className="mb-4"
          >
            <Gift className="w-20 h-20 mx-auto text-white" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-white mb-2">{config.name}</h3>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gem className="w-6 h-6 text-purple-400" />
            <span className="text-2xl font-bold text-white">{config.cost}</span>
            {config.cost !== config.baseCost && (
              <span className="text-sm text-slate-400 line-through ml-1">{config.baseCost}</span>
            )}
          </div>

          <Button
            onClick={handleOpen}
            disabled={!canAfford || isOpening}
            className={`w-full ${canAfford ? `bg-gradient-to-r ${config.color} hover:opacity-90` : 'bg-slate-700'}`}
          >
            {isOpening ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              'Open Box'
            )}
          </Button>
        </div>
      </motion.div>

      {/* Reward Popup */}
      <AnimatePresence>
        {reward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-yellow-400 p-6 shadow-2xl max-w-sm">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5 }}
                >
                  {getRewardIcon()}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mt-3">You Got!</h3>
                <p className="text-yellow-400 text-xl font-bold mt-2">{getRewardLabel()}</p>
                <p className="text-slate-400 text-sm mt-1">{getRewardDescription()}</p>
                {reward.rarity && (
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      reward.rarity === 'mythical' ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white animate-pulse' :
                      reward.rarity === 'legendary' ? 'bg-orange-500 text-white' :
                      reward.rarity === 'epic' ? 'bg-purple-500 text-white' :
                      reward.rarity === 'rare' ? 'bg-blue-500 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {reward.rarity.toUpperCase()}
                    </span>
                  </div>
                )}
                <Button
                  onClick={handleClaim}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Claim Reward
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}