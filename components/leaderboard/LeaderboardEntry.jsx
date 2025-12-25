import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import AvatarDisplay from '../avatar/AvatarDisplay';

const RANK_STYLES = {
  1: { bg: 'from-yellow-500/30 to-amber-600/30', border: 'border-yellow-500', icon: Crown, iconColor: 'text-yellow-400' },
  2: { bg: 'from-slate-400/30 to-slate-500/30', border: 'border-slate-400', icon: Medal, iconColor: 'text-slate-300' },
  3: { bg: 'from-amber-700/30 to-orange-800/30', border: 'border-amber-700', icon: Medal, iconColor: 'text-amber-600' }
};

export default function LeaderboardEntry({ player, rank, isCurrentUser = false }) {
  const style = RANK_STYLES[rank] || { bg: 'from-slate-800/50 to-slate-900/50', border: 'border-slate-700', icon: null };
  const RankIcon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`
        flex items-center gap-4 p-4 rounded-xl border 
        bg-gradient-to-r ${style.bg} ${style.border}
        ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Rank */}
      <div className="w-12 h-12 flex items-center justify-center">
        {RankIcon ? (
          <RankIcon className={`w-8 h-8 ${style.iconColor}`} />
        ) : (
          <span className="text-2xl font-bold text-slate-400">#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <AvatarDisplay avatar={player.avatar} size="sm" showBackground={false} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold truncate">{player.username}</h3>
          {player.is_vip && (
            <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full">VIP</span>
          )}
        </div>
        <p className="text-slate-400 text-sm">Level {player.level || 1}</p>
      </div>

      {/* Value */}
      <div className="text-right">
        <div className="flex items-center gap-1 justify-end">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-xl font-bold text-white">${(player.portfolio_value || 0).toLocaleString()}</span>
        </div>
        <p className="text-slate-400 text-xs">{player.total_bubbles_popped || 0} bubbles</p>
      </div>
    </motion.div>
  );
}