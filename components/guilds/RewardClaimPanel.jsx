import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Coins, Gem, Sparkles, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function RewardClaimPanel({ rewards = [], player, onClaim }) {
  const queryClient = useQueryClient();

  const claimRewardMutation = useMutation({
    mutationFn: async (reward) => {
      // Mark reward as claimed
      await base44.entities.EventReward.update(reward.id, {
        claimed: true
      });

      // Award the rewards
      const rewardData = reward.rewards || {};
      const coinsToAdd = rewardData.coins || 0;
      const gemsToAdd = rewardData.gems || 0;

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + coinsToAdd,
        premium_currency: (player.premium_currency || 0) + gemsToAdd
      });

      // Create transaction
      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'reward',
        description: `Event Reward - ${reward.tier} tier`,
        soft_currency_change: coinsToAdd,
        premium_currency_change: gemsToAdd
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['player']);
      if (onClaim) onClaim();
    }
  });

  const unclaimedRewards = rewards.filter(r => !r.claimed && r.recipient_id === player?.id);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-slate-400 to-slate-600';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getTierEmoji = (tier) => {
    switch (tier) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🎁';
    }
  };

  if (unclaimedRewards.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-400" />
          <CardTitle className="text-white">Unclaimed Rewards</CardTitle>
          <Badge className="bg-purple-500/20 text-purple-400">
            {unclaimedRewards.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {unclaimedRewards.map((reward) => {
            const rewardData = reward.rewards || {};
            return (
              <div
                key={reward.id}
                className={`p-4 rounded-lg bg-gradient-to-r ${getTierColor(reward.tier)} bg-opacity-20 border border-white/20`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getTierEmoji(reward.tier)}</span>
                    <div>
                      <Badge className="bg-white/20 text-white capitalize mb-1">
                        {reward.tier} Tier
                      </Badge>
                      <p className="text-slate-300 text-sm">
                        Event on {new Date(reward.event_instance_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  {rewardData.coins > 0 && (
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-bold">{rewardData.coins.toLocaleString()}</span>
                    </div>
                  )}
                  {rewardData.gems > 0 && (
                    <div className="flex items-center gap-2">
                      <Gem className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-bold">{rewardData.gems}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => claimRewardMutation.mutate(reward)}
                  disabled={claimRewardMutation.isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Claim Rewards
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}