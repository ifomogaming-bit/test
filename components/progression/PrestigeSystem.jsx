import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Zap, Star, Award, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PRESTIGE_TIERS = [
  { tier: 1, name: 'Bronze Prestige', color: 'from-orange-600 to-orange-800', icon: '🥉', levelRequired: 50, rewards: { gems: 500, coins: 50000, badge: 'prestige_bronze' } },
  { tier: 2, name: 'Silver Prestige', color: 'from-gray-400 to-gray-600', icon: '🥈', levelRequired: 50, rewards: { gems: 750, coins: 75000, badge: 'prestige_silver' } },
  { tier: 3, name: 'Gold Prestige', color: 'from-yellow-400 to-yellow-600', icon: '🥇', levelRequired: 50, rewards: { gems: 1000, coins: 100000, badge: 'prestige_gold' } },
  { tier: 4, name: 'Platinum Prestige', color: 'from-cyan-400 to-cyan-600', icon: '💎', levelRequired: 50, rewards: { gems: 1500, coins: 150000, badge: 'prestige_platinum' } },
  { tier: 5, name: 'Diamond Prestige', color: 'from-blue-400 to-purple-600', icon: '💠', levelRequired: 50, rewards: { gems: 2000, coins: 200000, badge: 'prestige_diamond' } },
  { tier: 6, name: 'Master Prestige', color: 'from-purple-500 to-pink-600', icon: '👑', levelRequired: 50, rewards: { gems: 3000, coins: 300000, badge: 'prestige_master' } },
  { tier: 7, name: 'Legend Prestige', color: 'from-red-500 to-orange-600', icon: '🔥', levelRequired: 50, rewards: { gems: 5000, coins: 500000, badge: 'prestige_legend' } }
];

export default function PrestigeSystem({ player, onClose }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const currentPrestige = player?.prestige_tier || 0;
  const nextPrestige = PRESTIGE_TIERS[currentPrestige];
  const canPrestige = player?.level >= (nextPrestige?.levelRequired || 50);

  const prestigeMutation = useMutation({
    mutationFn: async () => {
      if (!nextPrestige || !canPrestige) return;

      const newPrestigeTier = currentPrestige + 1;

      // Grant prestige rewards
      await base44.entities.Player.update(player.id, {
        prestige_tier: newPrestigeTier,
        level: 1,
        xp: 0,
        soft_currency: (player.soft_currency || 0) + nextPrestige.rewards.coins,
        premium_currency: (player.premium_currency || 0) + nextPrestige.rewards.gems,
        achievements: [...(player.achievements || []), nextPrestige.rewards.badge]
      });

      // Grant prestige badge
      await base44.entities.PrestigeBadge.create({
        player_id: player.id,
        badge_id: nextPrestige.rewards.badge,
        badge_name: nextPrestige.name,
        tier: newPrestigeTier,
        earned_at: new Date().toISOString()
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'achievement',
        description: `Prestige ${newPrestigeTier}: ${nextPrestige.name}`,
        soft_currency_change: nextPrestige.rewards.coins,
        premium_currency_change: nextPrestige.rewards.gems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      setShowConfirm(false);
    }
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            Prestige System
          </DialogTitle>
          <p className="text-slate-300 text-sm">Reset your level for exclusive rewards and permanent bonuses</p>
        </DialogHeader>

        {/* Current Status */}
        <div className="bg-slate-800/50 rounded-xl p-6 border-2 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Current Prestige</p>
              <h3 className="text-2xl font-black text-white">
                {currentPrestige === 0 ? 'No Prestige' : PRESTIGE_TIERS[currentPrestige - 1]?.name}
              </h3>
            </div>
            {currentPrestige > 0 && (
              <div className="text-6xl">{PRESTIGE_TIERS[currentPrestige - 1]?.icon}</div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Current Level</p>
              <p className="text-white text-2xl font-bold">{player?.level || 1}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Prestige Tier</p>
              <p className="text-purple-400 text-2xl font-bold">{currentPrestige}</p>
            </div>
          </div>
        </div>

        {/* Next Prestige */}
        {nextPrestige ? (
          <div className={`bg-gradient-to-br ${nextPrestige.color} rounded-xl p-6 border-2 border-white/20`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Next Prestige Available</p>
                <h3 className="text-3xl font-black text-white flex items-center gap-2">
                  <span className="text-4xl">{nextPrestige.icon}</span>
                  {nextPrestige.name}
                </h3>
              </div>
              <Badge className={canPrestige ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                {canPrestige ? 'READY' : `Level ${nextPrestige.levelRequired} Required`}
              </Badge>
            </div>

            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-white font-bold mb-3">Prestige Rewards:</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-yellow-400 text-2xl font-black">{nextPrestige.rewards.gems}</p>
                  <p className="text-white/80 text-xs">Gems</p>
                </div>
                <div className="text-center">
                  <p className="text-green-400 text-2xl font-black">{nextPrestige.rewards.coins.toLocaleString()}</p>
                  <p className="text-white/80 text-xs">Coins</p>
                </div>
                <div className="text-center">
                  <Award className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="text-white/80 text-xs">Exclusive Badge</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-yellow-200 font-bold text-sm">What You'll Keep:</p>
                  <ul className="text-yellow-100 text-xs space-y-1 mt-1">
                    <li>• All coins and gems</li>
                    <li>• All purchased items and cosmetics</li>
                    <li>• Portfolio and stocks</li>
                    <li>• Skill tree unlocks</li>
                    <li>• Achievements and badges</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-200 font-bold text-sm">What You'll Reset:</p>
                  <ul className="text-red-100 text-xs space-y-1 mt-1">
                    <li>• Level resets to 1</li>
                    <li>• XP resets to 0</li>
                    <li>• Daily streaks reset</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!canPrestige}
              className="w-full bg-white text-black hover:bg-gray-200 font-black text-lg py-6"
            >
              <Crown className="w-5 h-5 mr-2" />
              {canPrestige ? 'Prestige Now' : `Reach Level ${nextPrestige.levelRequired}`}
            </Button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-8 text-center border-2 border-white/30">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-3xl font-black text-white mb-2">Maximum Prestige Achieved!</h3>
            <p className="text-white/90">You've reached the pinnacle of prestige. You are a legend!</p>
          </div>
        )}

        {/* Prestige History */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Prestige Progression
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PRESTIGE_TIERS.map((tier, index) => (
              <div
                key={tier.tier}
                className={`p-3 rounded-lg text-center ${
                  index < currentPrestige
                    ? `bg-gradient-to-br ${tier.color}`
                    : 'bg-slate-700/50'
                }`}
              >
                <div className="text-3xl mb-1">{tier.icon}</div>
                <p className={`text-xs font-bold ${index < currentPrestige ? 'text-white' : 'text-slate-400'}`}>
                  {tier.name.replace(' Prestige', '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-slate-900 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Confirm Prestige
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">
              Are you sure you want to prestige? This will reset your level to 1 and XP to 0.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => prestigeMutation.mutate()}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Confirm Prestige
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}