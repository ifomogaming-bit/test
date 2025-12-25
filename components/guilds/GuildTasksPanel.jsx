import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Zap, 
  Trophy,
  Coins,
  Gem,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function GuildTasksPanel({ guild, player }) {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['guildTasks', guild?.id],
    queryFn: async () => {
      if (!guild?.id) return [];
      return base44.entities.GuildTaskChallenge.filter({ 
        guild_id: guild.id,
        completed: false 
      }, '-created_date');
    },
    enabled: !!guild?.id
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (taskId) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.completed) return;

      // Update guild treasury
      await base44.entities.Guild.update(guild.id, {
        treasury_balance: (guild.treasury_balance || 0) + task.reward_coins,
        premium_balance: (guild.premium_balance || 0) + task.reward_gems,
        guild_xp: (guild.guild_xp || 0) + task.reward_guild_xp
      });

      // Mark as claimed by deleting
      await base44.entities.GuildTaskChallenge.delete(taskId);

      // Log in guild audit
      await base44.entities.GuildAuditLog.create({
        guild_id: guild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'guild_settings_changed',
        details: { 
          action: 'task_completed',
          task: task.task_description,
          rewards: {
            coins: task.reward_coins,
            gems: task.reward_gems,
            xp: task.reward_guild_xp
          }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildTasks']);
      queryClient.invalidateQueries(['myGuild']);
    }
  });

  const getTaskIcon = (type) => {
    switch (type) {
      case 'stock_quiz': return MessageSquare;
      case 'trading_volume': return TrendingUp;
      case 'portfolio_growth': return Trophy;
      case 'bubble_popping': return Target;
      case 'pvp_wins': return Zap;
      case 'collective_investment': return Coins;
      default: return Target;
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-400" />
          Guild Tasks & Challenges
        </CardTitle>
        <p className="text-slate-400 text-sm">Complete objectives together for rewards</p>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No active tasks. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const Icon = getTaskIcon(task.task_type);
              const progress = Math.min(100, (task.current_progress / task.target_value) * 100);
              const isComplete = task.current_progress >= task.target_value;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border ${
                    isComplete 
                      ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' 
                      : 'bg-slate-700/30 border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Icon className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold mb-1">{task.task_description}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeRemaining(task.expires_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-bold">
                        {task.current_progress} / {task.target_value}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      {task.reward_coins > 0 && (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-bold">{task.reward_coins}</span>
                        </div>
                      )}
                      {task.reward_gems > 0 && (
                        <div className="flex items-center gap-1">
                          <Gem className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-bold">{task.reward_gems}</span>
                        </div>
                      )}
                      {task.reward_guild_xp > 0 && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-bold">{task.reward_guild_xp} XP</span>
                        </div>
                      )}
                    </div>

                    {isComplete && (
                      <Button
                        onClick={() => claimRewardMutation.mutate(task.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Claim
                      </Button>
                    )}
                  </div>

                  {Object.keys(task.participant_contributions || {}).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-slate-400 text-xs mb-2">Top Contributors:</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(task.participant_contributions)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([playerId, contribution]) => (
                            <Badge key={playerId} variant="outline" className="text-xs">
                              {contribution} pts
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}