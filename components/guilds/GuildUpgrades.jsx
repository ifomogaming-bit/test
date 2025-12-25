import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Zap, 
  TrendingUp, 
  Shield, 
  Swords,
  Clock,
  Percent
} from 'lucide-react';
import NotificationSystem from '@/components/notifications/NotificationSystem';

const UPGRADE_CONFIG = {
  vault_capacity: {
    name: 'Guild Vault Capacity',
    icon: DollarSign,
    description: 'Increase max vault balance',
    bonusPerLevel: '+50,000 capacity',
    baseCost: 5000,
    maxLevel: 10,
    color: 'from-yellow-500 to-amber-600'
  },
  member_capacity: {
    name: 'Member Slots',
    icon: Users,
    description: 'Increase max guild members',
    bonusPerLevel: '+5 members',
    baseCost: 10000,
    color: 'from-blue-500 to-cyan-600'
  },
  xp_boost: {
    name: 'XP Boost',
    icon: Zap,
    description: 'All members gain bonus XP',
    bonusPerLevel: '+5% XP',
    baseCost: 8000,
    color: 'from-purple-500 to-pink-600'
  },
  coin_boost: {
    name: 'Coin Boost',
    icon: TrendingUp,
    description: 'All members earn more coins',
    bonusPerLevel: '+3% coins',
    baseCost: 12000,
    color: 'from-green-500 to-emerald-600'
  },
  trading_fee_reduction: {
    name: 'Trading Fees',
    icon: Percent,
    description: 'Reduce trading costs for members',
    bonusPerLevel: '-2% fees',
    baseCost: 15000,
    color: 'from-indigo-500 to-blue-600'
  },
  cooldown_reduction: {
    name: 'Cooldown Reducer',
    icon: Clock,
    description: 'Faster cooldown recovery',
    bonusPerLevel: '-10% cooldown',
    baseCost: 10000,
    color: 'from-orange-500 to-red-600'
  },
  raid_defense: {
    name: 'Raid Defense',
    icon: Shield,
    description: 'Protect treasury from raids',
    bonusPerLevel: '+15% defense',
    baseCost: 20000,
    color: 'from-slate-500 to-zinc-600'
  },
  raid_power: {
    name: 'Raid Power',
    icon: Swords,
    description: 'Stronger offensive raids',
    bonusPerLevel: '+10% attack',
    baseCost: 18000,
    color: 'from-red-500 to-orange-600'
  }
};

export default function GuildUpgrades({ guild, upgrades = [], isLeader, player, myGuildMembership }) {
  const queryClient = useQueryClient();

  const upgradeGuildMutation = useMutation({
    mutationFn: async ({ upgradeType, playerId }) => {
      const upgrade = upgrades.find(u => u.upgrade_type === upgradeType);
      const currentLevel = upgrade?.current_level || 0;
      const config = UPGRADE_CONFIG[upgradeType];
      const cost = Math.floor(config.baseCost * Math.pow(1.5, currentLevel));

      if ((player.soft_currency || 0) < cost) {
        throw new Error('Insufficient funds');
      }

      // Deduct from player's personal currency
      await base44.entities.Player.update(playerId, {
        soft_currency: (player.soft_currency || 0) - cost
      });

      if (upgrade) {
        await base44.entities.GuildUpgrade.update(upgrade.id, {
          current_level: currentLevel + 1
        });
      } else {
        await base44.entities.GuildUpgrade.create({
          guild_id: guild.id,
          upgrade_type: upgradeType,
          current_level: 1,
          max_level: config.maxLevel || 5
        });
      }

      // Track contribution
      await base44.entities.GuildContribution.create({
        guild_id: guild.id,
        player_id: playerId,
        amount: cost,
        contribution_type: 'upgrade'
      });

      // Award contribution points
      if (myGuildMembership) {
        await base44.entities.GuildMember.update(myGuildMembership.id, {
          contribution_points: (myGuildMembership.contribution_points || 0) + Math.floor(cost / 10)
        });
      }

      // Log in audit
      await base44.entities.GuildAuditLog.create({
        guild_id: guild.id,
        actor_id: playerId,
        actor_name: player.username,
        action_type: 'upgrade_purchased',
        target_name: config.name,
        amount: cost,
        details: { upgrade_type: upgradeType, new_level: currentLevel + 1 }
      });

      NotificationSystem.notify(
        'Guild Upgraded!',
        `${config.name} upgraded to level ${currentLevel + 1}`,
        'success'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildUpgrades']);
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['guildMembers']);
      queryClient.invalidateQueries(['guildAuditLogs']);
    }
  });

  const getUpgradeData = (upgradeType) => {
    const upgrade = upgrades.find(u => u.upgrade_type === upgradeType);
    const currentLevel = upgrade?.current_level || 0;
    const config = UPGRADE_CONFIG[upgradeType];
    const cost = Math.floor(config.baseCost * Math.pow(1.5, currentLevel));
    const canAfford = (player?.soft_currency || 0) >= cost;
    const maxLevel = upgrade?.max_level || config.maxLevel || 5;

    return { currentLevel, cost, canAfford, maxLevel, config };
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Guild Upgrades</CardTitle>
        <p className="text-slate-400 text-sm">Use your personal coins to upgrade the guild - earn contribution points!</p>
        <div className="mt-3 bg-blue-600/20 border border-blue-500/50 rounded-lg p-3">
          <p className="text-blue-300 text-sm font-bold">
            💰 Your Balance: {(player?.soft_currency || 0).toLocaleString()} coins
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(UPGRADE_CONFIG).map((upgradeType) => {
            const { currentLevel, cost, canAfford, maxLevel, config } = getUpgradeData(upgradeType);
            const Icon = config.icon;
            const isMaxed = currentLevel >= maxLevel;

            return (
              <div 
                key={upgradeType}
                className={`p-4 rounded-lg border-2 ${
                  isMaxed 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50' 
                    : 'bg-slate-700/30 border-slate-600/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{config.name}</h4>
                      <p className="text-slate-400 text-xs">{config.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Level</span>
                    <Badge className={isMaxed ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}>
                      {currentLevel} / {maxLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Bonus</span>
                    <span className="text-white font-bold">{config.bonusPerLevel}</span>
                  </div>
                  {!isMaxed && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Upgrade Cost</span>
                      <span className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                        💰 {cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {isMaxed ? (
                  <Badge className="w-full justify-center bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ Maxed Out
                  </Badge>
                ) : player ? (
                  <Button
                    onClick={() => upgradeGuildMutation.mutate({ upgradeType, playerId: player.id })}
                    disabled={!canAfford}
                    size="sm"
                    className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90`}
                  >
                    Upgrade {!canAfford && '(Insufficient Funds)'}
                  </Button>
                ) : (
                  <Badge className="w-full justify-center bg-slate-700 text-slate-400">
                    Loading...
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}