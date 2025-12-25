import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Trophy, Crown, Zap, TrendingUp, Swords, Sparkles } from 'lucide-react';

export const PRESTIGE_BADGES = {
  trading_master: {
    id: 'trading_master',
    name: 'Trading Master',
    icon: TrendingUp,
    color: 'from-emerald-500 via-green-500 to-teal-500',
    emblem: '📊',
    ribbon: '🎗️',
    description: 'Master of trading strategies',
    maxLevel: 50,
    levelRequirements: [100, 500, 1500, 3500, 7500, 15000, 30000, 50000, 85000, 150000, 250000, 400000, 600000, 900000, 1300000, 1850000, 2500000, 3300000, 4300000, 5500000, 7000000, 9000000, 11500000, 15000000, 20000000, 26000000, 33000000, 41000000, 50000000, 60000000, 72000000, 86000000, 102000000, 120000000, 141000000, 165000000, 192000000, 223000000, 258000000, 297000000, 341000000, 390000000, 445000000, 506000000, 574000000, 650000000, 735000000, 830000000, 936000000, 1053000000],
    colorMilestones: {
      10: 'from-emerald-600 via-green-600 to-teal-600',
      25: 'from-emerald-700 via-green-700 to-teal-700',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player, transactions) => {
      return transactions.filter(t => t.type === 'purchase').length;
    }
  },
  bubble_legend: {
    id: 'bubble_legend',
    name: 'Bubble Legend',
    icon: Sparkles,
    color: 'from-pink-500 via-rose-500 to-red-500',
    emblem: '🎯',
    ribbon: '🏅',
    description: 'Legendary bubble popper',
    maxLevel: 50,
    levelRequirements: [200, 800, 2000, 5000, 10000, 20000, 40000, 75000, 125000, 200000, 300000, 450000, 650000, 900000, 1200000, 1600000, 2100000, 2700000, 3500000, 4500000, 6000000, 8000000, 10500000, 14000000, 18500000, 24000000, 31000000, 39500000, 49500000, 61500000, 75500000, 92000000, 111500000, 134500000, 161500000, 193000000, 229500000, 271500000, 319500000, 374000000, 435500000, 504500000, 581500000, 667000000, 761500000, 866000000, 981000000, 1107500000, 1246000000, 1397500000],
    colorMilestones: {
      10: 'from-pink-600 via-rose-600 to-red-600',
      25: 'from-purple-500 via-pink-500 to-rose-500',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player) => player.total_bubbles_popped || 0
  },
  guild_commander: {
    id: 'guild_commander',
    name: 'Guild Commander',
    icon: Crown,
    color: 'from-purple-500 via-violet-500 to-indigo-500',
    emblem: '🛡️',
    ribbon: '👑',
    description: 'Guild warfare expert',
    maxLevel: 50,
    levelRequirements: [5, 15, 35, 70, 125, 200, 300, 450, 650, 1000, 1450, 2000, 2700, 3550, 4600, 5850, 7400, 9300, 11600, 14400, 17800, 21900, 26800, 32700, 40000, 48500, 58500, 70000, 83500, 99000, 117000, 137500, 161000, 187500, 217500, 251500, 289500, 332000, 379500, 432500, 491500, 557000, 629500, 709500, 797500, 894000, 999500, 1114500, 1239500, 1375000],
    colorMilestones: {
      10: 'from-purple-600 via-violet-600 to-indigo-600',
      25: 'from-purple-700 via-violet-700 to-pink-700',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player, transactions, raids) => {
      return raids?.filter(r => r.winner === 'attacker').length || 0;
    }
  },
  wealth_baron: {
    id: 'wealth_baron',
    name: 'Wealth Baron',
    icon: Trophy,
    color: 'from-yellow-500 via-amber-500 to-orange-500',
    emblem: '💸',
    ribbon: '🎖️',
    description: 'Accumulator of wealth',
    maxLevel: 50,
    levelRequirements: [10000, 50000, 150000, 400000, 900000, 1800000, 3500000, 6500000, 11000000, 20000000, 35000000, 60000000, 100000000, 160000000, 250000000, 380000000, 550000000, 780000000, 1080000000, 1500000000, 2000000000, 2650000000, 3500000000, 4600000000, 6000000000, 7800000000, 10000000000, 12700000000, 16000000000, 20000000000, 25000000000, 31000000000, 38000000000, 46500000000, 56500000000, 68000000000, 81500000000, 97000000000, 115000000000, 136000000000, 160500000000, 188500000000, 220500000000, 257000000000, 298500000000, 345500000000, 398500000000, 458000000000, 525000000000, 600000000000],
    colorMilestones: {
      10: 'from-yellow-600 via-amber-600 to-orange-600',
      25: 'from-yellow-700 via-amber-700 to-orange-700',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player) => player.soft_currency || 0
  },
  pvp_warrior: {
    id: 'pvp_warrior',
    name: 'PvP Warrior',
    icon: Swords,
    color: 'from-red-500 via-orange-500 to-yellow-500',
    emblem: '⚔️',
    ribbon: '🏆',
    description: 'Battle-hardened champion',
    maxLevel: 50,
    levelRequirements: [10, 30, 70, 140, 250, 420, 680, 1050, 1600, 2500, 3700, 5300, 7400, 10100, 13500, 17700, 22800, 29000, 36500, 45500, 56300, 69200, 84500, 102500, 124000, 149000, 177500, 209500, 245500, 286000, 331500, 382500, 439500, 503000, 573500, 651500, 737500, 832000, 935500, 1048500, 1171500, 1305000, 1450000, 1607000, 1777000, 1961000, 2159500, 2373500, 2604000, 2851500],
    colorMilestones: {
      10: 'from-red-600 via-orange-600 to-yellow-600',
      25: 'from-red-700 via-orange-700 to-yellow-700',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player) => player.pvp_wins || 0
  },
  streak_champion: {
    id: 'streak_champion',
    name: 'Streak Champion',
    icon: Zap,
    color: 'from-orange-500 via-red-500 to-pink-500',
    emblem: '⚡',
    ribbon: '⭐',
    description: 'Unstoppable momentum',
    maxLevel: 50,
    levelRequirements: [5, 10, 20, 35, 55, 80, 115, 160, 220, 300, 400, 525, 680, 870, 1100, 1380, 1720, 2130, 2620, 3200, 3900, 4730, 5720, 6900, 8300, 10000, 12000, 14300, 17000, 20100, 23600, 27600, 32100, 37200, 42900, 49300, 56400, 64300, 73100, 82800, 93500, 105300, 118300, 132600, 148400, 165700, 184700, 205500, 228200, 252900],
    colorMilestones: {
      10: 'from-orange-600 via-red-600 to-pink-600',
      25: 'from-orange-700 via-red-700 to-pink-700',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player) => player.longest_streak || 0
  },
  diamond_collector: {
    id: 'diamond_collector',
    name: 'Diamond Collector',
    icon: Star,
    color: 'from-cyan-500 via-blue-500 to-indigo-500',
    emblem: '💎',
    ribbon: '🌟',
    description: 'Premium currency master',
    maxLevel: 50,
    levelRequirements: [50, 200, 500, 1200, 2500, 5000, 9500, 16000, 26000, 45000, 70000, 105000, 150000, 210000, 290000, 395000, 530000, 700000, 910000, 1170000, 1490000, 1880000, 2360000, 2950000, 3680000, 4580000, 5680000, 7020000, 8640000, 10580000, 12890000, 15630000, 18860000, 22650000, 27080000, 32230000, 38200000, 45090000, 52990000, 62010000, 72280000, 83930000, 97110000, 111980000, 128730000, 147550000, 168660000, 192300000, 218730000, 248230000],
    colorMilestones: {
      10: 'from-cyan-600 via-blue-600 to-indigo-600',
      25: 'from-cyan-700 via-blue-700 to-purple-700',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player) => player.premium_currency || 0
  },
  market_oracle: {
    id: 'market_oracle',
    name: 'Market Oracle',
    icon: Award,
    color: 'from-indigo-500 via-purple-500 to-pink-500',
    emblem: '🔮',
    ribbon: '💫',
    description: 'All-seeing market expert',
    maxLevel: 50,
    levelRequirements: [5, 15, 30, 50, 75, 110, 155, 215, 290, 400, 540, 710, 920, 1180, 1500, 1890, 2370, 2960, 3680, 4550, 5600, 6860, 8370, 10170, 12300, 14820, 17790, 21270, 25330, 30040, 35480, 41730, 48880, 57020, 66250, 76680, 88420, 101600, 116350, 132810, 151140, 171510, 194090, 219070, 246650, 277050, 310500, 347250, 387560, 431700],
    colorMilestones: {
      10: 'from-indigo-600 via-purple-600 to-pink-600',
      25: 'from-indigo-700 via-purple-700 to-pink-700',
      40: 'from-yellow-500 via-orange-500 to-red-500'
    },
    calculateProgress: (player) => player.level || 0
  }
};

export function calculateBadgeLevel(badgeType, progress) {
  const badge = PRESTIGE_BADGES[badgeType];
  if (!badge) return { level: 0, progress: 0, nextLevelAt: 0 };

  let level = 0;
  for (let i = 0; i < badge.levelRequirements.length; i++) {
    if (progress >= badge.levelRequirements[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const nextLevelAt = level < badge.maxLevel ? badge.levelRequirements[level] : badge.levelRequirements[badge.maxLevel - 1];
  const prevLevelAt = level > 0 ? badge.levelRequirements[level - 1] : 0;
  const progressInLevel = progress - prevLevelAt;
  const requiredForNext = nextLevelAt - prevLevelAt;
  const percentProgress = level >= badge.maxLevel ? 100 : (progressInLevel / requiredForNext) * 100;

  return { level, progress: percentProgress, nextLevelAt, currentProgress: progress };
}

export function PrestigeBadgeCard({ badge, level, progress, currentProgress, nextLevelAt }) {
  const Icon = badge.icon;
  
  // Determine color based on milestones
  const getCurrentColor = () => {
    if (badge.colorMilestones) {
      if (level >= 40) return badge.colorMilestones[40] || badge.color;
      if (level >= 25) return badge.colorMilestones[25] || badge.color;
      if (level >= 10) return badge.colorMilestones[10] || badge.color;
    }
    return badge.color;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-xl bg-gradient-to-br ${getCurrentColor()} border-2 border-white/20 shadow-xl w-full h-full min-h-[200px] flex flex-col`}
    >
      {/* Decorative Emblem */}
      <div className="absolute -top-3 -right-3 text-2xl sm:text-3xl animate-pulse">
        {badge.emblem}
      </div>
      
      {/* Ribbon */}
      <div className="absolute -top-2 -left-2 text-xl sm:text-2xl">
        {badge.ribbon}
      </div>

      <div className="flex items-start gap-2 sm:gap-3 mb-3 flex-1">
        <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg truncate">{badge.name}</h3>
          <p className="text-white/80 text-xs sm:text-sm line-clamp-2">{badge.description}</p>
        </div>
      </div>

      {/* Level Display */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-0.5 flex-wrap overflow-hidden max-h-8">
          {[...Array(Math.min(badge.maxLevel, 10))].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < level ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`}
            />
          ))}
          {badge.maxLevel > 10 && level > 10 && (
            <span className="text-yellow-300 text-xs ml-1">+{level - 10}</span>
          )}
        </div>
        <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">Lv {level}/{badge.maxLevel}</span>
      </div>

      {/* Progress Bar */}
      {level < badge.maxLevel && (
        <div className="space-y-1">
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white/90 rounded-full"
            />
          </div>
          <p className="text-white/70 text-xs text-right truncate">
            {currentProgress.toLocaleString()} / {nextLevelAt.toLocaleString()}
          </p>
        </div>
      )}

      {level >= badge.maxLevel && (
        <div className="text-center py-1 sm:py-2">
          <span className="text-yellow-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
            MAX LEVEL
          </span>
        </div>
      )}
    </motion.div>
  );
}