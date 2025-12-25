import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Zap, 
  Shield, 
  Trophy,
  Star,
  ArrowUp
} from 'lucide-react';
import NotificationSystem from '@/components/notifications/NotificationSystem';

const UPGRADE_CONFIGS = [
  {
    type: 'treasury_capacity',
    name: 'Treasury Capacity',
    description: 'Increase max bank balance',
    icon: Coins,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    maxLevel: 10,
    baseCost: 5000,
    bonusPerLevel: (level) => `+${level * 10000} max capacity`
  },
  {
    type: 'member_slots',
    name: 'Member Slots',
    description: 'Allow more guild members',
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    maxLevel: 10,
    baseCost: 8000,
    bonusPerLevel: (level) => `+${level * 5} member slots`
  },
  {
    type: 'trading_boost',
    name: 'Trading Boost',
    description: 'All members get bonus on trades',
    icon: TrendingUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    maxLevel: 10,
    baseCost: 10000,
    bonusPerLevel: (level) => `+${level * 2}% trade profits`
  },
  {
    type: 'xp_boost',
    name: 'XP Multiplier',
    description: 'Faster leveling for all members',
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    maxLevel: 10,
    baseCost: 7000,
    bonusPerLevel: (level) => `+${level * 5}% XP gain`
  },
  {
    type: 'coin_generation',
    name: 'Passive Income',
    description: 'Generate coins over time',
    icon: Star,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    maxLevel: 10,
    baseCost: 15000,
    bonusPerLevel: (level) => `${level * 100} coins/hour`
  },
  {
    type: 'raid_power',
    name: 'Raid Power',
    description: 'Stronger in guild raids',
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    maxLevel: 10,
    baseCost: 12000,
    bonusPerLevel: (level) => `+${level * 3}% raid damage`
  },
  {
    type: 'quest_rewards',
    name: 'Quest Rewards',
    description: 'Better rewards from quests',
    icon: Trophy,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    maxLevel: 10,
    baseCost: 9000,
    bonusPerLevel: (level) => `+${level * 10}% quest rewards`
  }
];

export default function GuildUpgradesPanel({ guild, player, isLeader, bankBalance }) {
  const queryClient = useQueryClient();

  const { data: upgrades = [] } = useQuery({
    queryKey: ['guildUpgrades', guild?.id],
    queryFn: async () => {
      if (!guild?.id) return [];
      const existing = await base44.entities.GuildUpgrade.filter({ guild_id: guild.id });
      
      // Initialize missing upgrades
      const existingTypes = existing.map(u => u.upgrade_type);
      const missing = UPGRADE_CONFIGS.filter(c => !existingTypes.includes(c.type));
      
      for (const config of missing) {
        await base44.entities.GuildUpgrade.create({
          guild_id: guild.id,
          upgrade_type: config.type,
          current_level: 0,
          max_level: config.maxLevel
        });
      }
      
      return base44.entities.GuildUpgrade.filter({ guild_id: guild.id });
    },
    enabled: !!guild?.id
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ upgradeId, config, currentLevel }) => {
      const cost = config.baseCost * Math.pow(1.5, currentLevel);
      
      if (bankBalance < cost) {
        throw new Error('Insufficient funds');
      }

      await base44.entities.GuildUpgrade.update(upgradeId, {
        current_level: currentLevel + 1
      });

      const newBalance = bankBalance - cost;
      await base44.entities.Guild.update(guild.id, {
        treasury_balance: newBalance
      });

      await base44.entities.GuildBankTransaction.create({
        guild_id: guild.id,
        player_id: player.id,
        transaction_type: 'upgrade_purchase',
        amount: cost,
        balance_after: newBalance,
        notes: `Upgraded ${config.name} to level ${currentLevel + 1}`
      });
    },
    onSuccess: (_, { config, currentLevel }) => {
      queryClient.invalidateQueries(['guildUpgrades']);
      queryClient.invalidateQueries(['guildBank']);
      NotificationSystem.notify(
        'Upgrade Purchased!',
        `${config.name} upgraded to level ${currentLevel + 1}`,
        'success'
      );
    }
  });

  const getUpgradeCost = (config, level) => {
    return Math.floor(config.baseCost * Math.pow(1.5, level));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Star className="w-6 h-6 text-purple-400" />
            Guild Upgrades
          </CardTitle>
          <p className="text-slate-300 text-sm">Permanent passive bonuses for all guild members</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {UPGRADE_CONFIGS.map(config => {
          const upgrade = upgrades.find(u => u.upgrade_type === config.type);
          const currentLevel = upgrade?.current_level || 0;
          const cost = getUpgradeCost(config, currentLevel);
          const canAfford = bankBalance >= cost;
          const isMaxLevel = currentLevel >= config.maxLevel;
          const Icon = config.icon;

          return (
            <Card key={config.type} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{config.name}</h3>
                      <p className="text-slate-400 text-xs">{config.description}</p>
                    </div>
                  </div>
                  <Badge className={`${config.bgColor} ${config.color} border-0`}>
                    Lv {currentLevel}/{config.maxLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className={config.color}>{config.bonusPerLevel(currentLevel)}</span>
                  </div>
                  <Progress 
                    value={(currentLevel / config.maxLevel) * 100} 
                    className="h-2"
                  />
                </div>

                {!isMaxLevel && (
                  <>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-sm">Next Level Bonus:</span>
                        <span className={`text-sm font-bold ${config.color}`}>
                          {config.bonusPerLevel(currentLevel + 1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Cost:</span>
                        <span className="text-white font-bold">{cost.toLocaleString()}</span>
                      </div>
                    </div>

                    {isLeader ? (
                      <Button
                        onClick={() => upgradeMutation.mutate({ 
                          upgradeId: upgrade?.id, 
                          config, 
                          currentLevel 
                        })}
                        disabled={!canAfford || !upgrade}
                        className={`w-full ${config.bgColor} ${config.color} hover:opacity-80`}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Upgrade {!canAfford && '(Insufficient Funds)'}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="w-full justify-center border-slate-600 text-slate-400">
                        Leader Only
                      </Badge>
                    )}
                  </>
                )}

                {isMaxLevel && (
                  <Badge className="w-full justify-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
                    ✨ MAX LEVEL
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}