import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Trophy, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRESTIGE_BADGES, calculateBadgeLevel, PrestigeBadgeCard } from '@/components/badges/PrestigeBadgeSystem';

export default function PrestigeBadges() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: player } = useQuery({
    queryKey: ['player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      return players[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Transaction.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: raids = [] } = useQuery({
    queryKey: ['raids'],
    queryFn: () => base44.entities.GuildRaid.list(),
    enabled: !!player?.id
  });

  // Calculate progress for all badges
  const badgeProgress = player ? Object.values(PRESTIGE_BADGES).map(badge => {
    const progress = badge.calculateProgress(player, transactions, raids);
    const levelData = calculateBadgeLevel(badge.id, progress);
    
    return {
      ...badge,
      ...levelData
    };
  }) : [];

  const totalLevels = badgeProgress.reduce((sum, b) => sum + b.level, 0);
  const maxPossibleLevels = Object.values(PRESTIGE_BADGES).length * 25;

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                Prestige Badges
              </h1>
              <p className="text-slate-400 text-sm">Level up your badges through gameplay</p>
            </div>
          </div>
          
          <div className="text-left sm:text-right">
            <p className="text-slate-400 text-sm">Total Progress</p>
            <p className="text-white font-bold text-xl sm:text-2xl">{totalLevels} / {maxPossibleLevels}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Award className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-slate-400 text-sm">Badges</p>
            <p className="text-white font-bold text-xl">{badgeProgress.filter(b => b.level > 0).length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Trophy className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-slate-400 text-sm">Max Level</p>
            <p className="text-white font-bold text-xl">{badgeProgress.filter(b => b.level >= 25).length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Award className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-slate-400 text-sm">Total Levels</p>
            <p className="text-white font-bold text-xl">{totalLevels}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Trophy className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-slate-400 text-sm">Completion</p>
            <p className="text-white font-bold text-xl">{Math.round((totalLevels / maxPossibleLevels) * 100)}%</p>
          </div>
        </motion.div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badgeProgress.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full"
            >
              <PrestigeBadgeCard
                badge={badge}
                level={badge.level}
                progress={badge.progress}
                currentProgress={badge.currentProgress}
                nextLevelAt={badge.nextLevelAt}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}