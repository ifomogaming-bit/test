import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Gift, Coins, Gem, Sparkles, Crown, Star, Award, Zap, CheckCircle } from 'lucide-react';
import { calculateWarRewards, calculatePlayerRewardShare } from './WarRewardCalculator';

const TIER_COLORS = {
  bronze: { bg: 'from-amber-700 to-amber-900', text: 'text-amber-300', icon: 'text-amber-400' },
  silver: { bg: 'from-slate-400 to-slate-600', text: 'text-slate-200', icon: 'text-slate-300' },
  gold: { bg: 'from-yellow-500 to-yellow-700', text: 'text-yellow-200', icon: 'text-yellow-300' },
  platinum: { bg: 'from-cyan-400 to-cyan-600', text: 'text-cyan-200', icon: 'text-cyan-300' },
  diamond: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-200', icon: 'text-purple-300' }
};

export default function WarSpoilsPanel({ war, myGuild, isLeader }) {
  const [distributing, setDistributing] = useState(false);
  const queryClient = useQueryClient();

  const { data: contributions = [] } = useQuery({
    queryKey: ['warContributions', war.id],
    queryFn: async () => {
      return base44.entities.GuildWarContribution.filter({ war_id: war.id });
    }
  });

  const { data: guildMembers = [] } = useQuery({
    queryKey: ['guildMembers', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildMember.filter({ guild_id: myGuild.id });
    },
    enabled: !!myGuild?.id
  });

  const { data: existingRewards = [] } = useQuery({
    queryKey: ['warRewards', war.id],
    queryFn: async () => {
      return base44.entities.GuildWarReward.filter({ war_id: war.id, guild_id: myGuild.id });
    },
    enabled: !!myGuild?.id
  });

  const isChallenger = war.challenger_guild_id === myGuild?.id;
  const myScore = isChallenger ? war.challenger_score : war.opponent_score;
  const opponentScore = isChallenger ? war.opponent_score : war.challenger_score;
  const isWinner = myScore > opponentScore;
  
  const myContributions = contributions.filter(c => c.guild_id === myGuild?.id);
  const totalContributionPoints = myContributions.reduce((sum, c) => sum + c.points_earned, 0);

  const rewardData = calculateWarRewards(war, contributions, isWinner ? 'winner' : 'loser');
  const rewards = rewardData ? rewardData[isWinner ? 'winner' : 'loser'] : null;

  const distributeRewardsMutation = useMutation({
    mutationFn: async () => {
      if (!rewards || !myGuild) return;

      const playerContributions = {};
      myContributions.forEach(c => {
        playerContributions[c.player_id] = (playerContributions[c.player_id] || 0) + c.points_earned;
      });

      // Distribute to each contributing member
      for (const [playerId, contribution] of Object.entries(playerContributions)) {
        const member = guildMembers.find(m => m.player_id === playerId);
        if (!member) continue;

        const currencyShare = calculatePlayerRewardShare(rewards.currency, contribution, totalContributionPoints);
        const premiumShare = calculatePlayerRewardShare(rewards.premium, contribution, totalContributionPoints);

        // Currency reward
        await base44.entities.GuildWarReward.create({
          war_id: war.id,
          guild_id: myGuild.id,
          player_id: playerId,
          player_name: myContributions.find(c => c.player_id === playerId)?.player_name || 'Unknown',
          reward_type: 'currency',
          reward_name: 'War Victory Coins',
          reward_amount: currencyShare,
          reward_tier: rewards.tier,
          claimed: false
        });

        // Premium currency reward
        if (premiumShare > 0) {
          await base44.entities.GuildWarReward.create({
            war_id: war.id,
            guild_id: myGuild.id,
            player_id: playerId,
            player_name: myContributions.find(c => c.player_id === playerId)?.player_name || 'Unknown',
            reward_type: 'premium_currency',
            reward_name: 'War Victory Gems',
            reward_amount: premiumShare,
            reward_tier: rewards.tier,
            claimed: false
          });
        }

        // Cosmetic rewards for top contributors
        const topContributors = Object.entries(playerContributions)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([id]) => id);

        if (topContributors.includes(playerId)) {
          rewards.cosmetics.forEach(async (cosmetic) => {
            await base44.entities.GuildWarReward.create({
              war_id: war.id,
              guild_id: myGuild.id,
              player_id: playerId,
              player_name: myContributions.find(c => c.player_id === playerId)?.player_name || 'Unknown',
              reward_type: 'cosmetic',
              reward_id: cosmetic.id,
              reward_name: cosmetic.name,
              reward_amount: 1,
              reward_tier: rewards.tier,
              claimed: false
            });
          });
        }

        // Power-up rewards
        rewards.powerUps.forEach(async (powerUp) => {
          await base44.entities.GuildWarReward.create({
            war_id: war.id,
            guild_id: myGuild.id,
            player_id: playerId,
            player_name: myContributions.find(c => c.player_id === playerId)?.player_name || 'Unknown',
            reward_type: 'power_up',
            reward_id: powerUp.id,
            reward_name: powerUp.name,
            reward_amount: 1,
            reward_tier: rewards.tier,
            claimed: false
          });
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warRewards']);
      setDistributing(false);
    }
  });

  if (!rewards) return null;

  const alreadyDistributed = existingRewards.length > 0;
  const tierColor = TIER_COLORS[rewards.tier] || TIER_COLORS.bronze;

  return (
    <Card className={`bg-gradient-to-br ${tierColor.bg} border-2 border-yellow-500/50 shadow-2xl mt-4`}>
      <CardHeader>
        <CardTitle className={`${tierColor.text} font-black text-2xl flex items-center gap-3`}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className={`w-8 h-8 ${tierColor.icon}`} />
          </motion.div>
          War Spoils - {rewards.tier.toUpperCase()} Tier
        </CardTitle>
        <p className={`${tierColor.text} text-sm font-bold`}>
          {isWinner ? '🎉 VICTORY REWARDS!' : '💪 Participation Rewards'}
        </p>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        {rewardData?.statistics && (
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              War Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Duration</p>
                <p className="text-white font-bold">{rewardData.statistics.durationDays} days</p>
              </div>
              <div>
                <p className="text-slate-400">Total Challenges</p>
                <p className="text-white font-bold">{rewardData.statistics.totalChallenges}</p>
              </div>
              <div>
                <p className="text-slate-400">Intensity</p>
                <p className="text-yellow-400 font-bold">{rewardData.statistics.intensityMultiplier}x</p>
              </div>
              <div>
                <p className="text-slate-400">Dominance</p>
                <p className="text-cyan-400 font-bold">{rewardData.statistics.dominanceRatio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 rounded-xl p-4 border-2 border-yellow-500/50"
          >
            <Coins className="w-10 h-10 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm">Total Coins</p>
            <p className="text-white text-3xl font-black">{rewards.currency.toLocaleString()}</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl p-4 border-2 border-purple-500/50"
          >
            <Gem className="w-10 h-10 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm">Total Gems</p>
            <p className="text-white text-3xl font-black">{rewards.premium}</p>
          </motion.div>
        </div>

        {/* Special Rewards */}
        <div className="space-y-3 mb-6">
          {rewards.cosmetics.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Exclusive Cosmetics (Top 3 Contributors)
              </h4>
              <div className="space-y-2">
                {rewards.cosmetics.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.name}</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">{item.rarity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rewards.powerUps.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Power-Up Bonuses
              </h4>
              <div className="space-y-2">
                {rewards.powerUps.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.name}</span>
                    <Badge className="bg-orange-500/20 text-orange-400">{item.duration}h</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Distribution Button */}
        {isLeader && (
          <div className="bg-black/30 rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-4">
              Rewards will be distributed to all {myContributions.length} participating members based on their contribution.
              Top contributors receive exclusive cosmetics!
            </p>
            <Button
              onClick={() => distributeRewardsMutation.mutate()}
              disabled={alreadyDistributed || distributeRewardsMutation.isPending}
              className={`w-full ${alreadyDistributed ? 'bg-green-600' : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'} font-black py-6 text-lg`}
            >
              {alreadyDistributed ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Rewards Distributed
                </>
              ) : distributeRewardsMutation.isPending ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Distributing...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Distribute War Spoils
                </>
              )}
            </Button>
          </div>
        )}

        {!isLeader && alreadyDistributed && (
          <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-green-300 font-bold">War spoils have been distributed!</p>
            <p className="text-slate-300 text-sm">Check your rewards in your profile</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}