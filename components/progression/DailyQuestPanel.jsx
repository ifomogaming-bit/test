import React from 'react';
import { motion } from 'framer-motion';
import { Target, Coins, Gem, Zap, CheckCircle, TrendingUp, Swords, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const QUEST_ICONS = {
  answer_questions: Target,
  pop_bubbles: Target,
  open_lootboxes: Package,
  trade_stocks: TrendingUp,
  win_pvp: Swords,
  earn_coins: Coins,
  sector_specific: TrendingUp
};

const REWARD_ICONS = {
  coins: Coins,
  gems: Gem,
  xp: Zap,
  lootbox: Package
};

export default function DailyQuestPanel({ quests, player }) {
  const queryClient = useQueryClient();

  const claimRewardMutation = useMutation({
    mutationFn: async (quest) => {
      // Update player with rewards
      const updates = {};
      if (quest.reward_type === 'coins') {
        updates.soft_currency = (player.soft_currency || 0) + quest.reward_amount;
      } else if (quest.reward_type === 'gems') {
        updates.premium_currency = (player.premium_currency || 0) + quest.reward_amount;
      } else if (quest.reward_type === 'xp') {
        updates.xp = (player.xp || 0) + quest.reward_amount;
      }

      await base44.entities.Player.update(player.id, updates);

      // Mark quest as claimed
      await base44.entities.DailyQuest.update(quest.id, { claimed: true });

      // Record transaction
      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'daily_bonus',
        description: `Quest: ${quest.quest_description}`,
        soft_currency_change: quest.reward_type === 'coins' ? quest.reward_amount : 0,
        premium_currency_change: quest.reward_type === 'gems' ? quest.reward_amount : 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['dailyQuests']);
    }
  });

  if (!quests || quests.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
        <Target className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">No daily quests available. Check back tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quests.map((quest, index) => {
        const Icon = QUEST_ICONS[quest.quest_type] || Target;
        const RewardIcon = REWARD_ICONS[quest.reward_type] || Coins;
        const progress = Math.min(quest.current_progress, quest.target_value);
        const percent = (progress / quest.target_value) * 100;
        const isComplete = quest.completed && !quest.claimed;
        const isClaimed = quest.claimed;

        return (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-xl border transition-all ${
              isClaimed
                ? 'bg-green-500/10 border-green-500/30 opacity-60'
                : isComplete
                ? 'bg-purple-500/20 border-purple-500/50 animate-pulse'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isClaimed ? 'bg-green-500/20' : isComplete ? 'bg-purple-500/20' : 'bg-slate-700/50'
              }`}>
                {isClaimed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Icon className={`w-5 h-5 ${isComplete ? 'text-purple-400' : 'text-slate-400'}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-sm mb-1 truncate">{quest.quest_description}</h4>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${isComplete ? 'bg-purple-500' : 'bg-blue-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-slate-400 text-xs font-medium">
                    {progress}/{quest.target_value}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <RewardIcon className={`w-3.5 h-3.5 ${
                      quest.reward_type === 'coins' ? 'text-yellow-400' :
                      quest.reward_type === 'gems' ? 'text-purple-400' :
                      'text-orange-400'
                    }`} />
                    <span className="text-white font-bold text-xs">
                      +{quest.reward_amount}
                    </span>
                  </div>

                  {isComplete && (
                    <Button
                      onClick={() => claimRewardMutation.mutate(quest)}
                      disabled={claimRewardMutation.isLoading}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-7 px-3 text-xs"
                    >
                      Claim
                    </Button>
                  )}
                  {isClaimed && (
                    <span className="text-green-400 text-xs font-medium">✓</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}