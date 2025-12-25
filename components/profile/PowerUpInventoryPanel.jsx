import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  Star, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Clock,
  Award,
  Users,
  Shield,
  Swords,
  Gift,
  Trophy,
  Flame,
  Play,
  Check,
  X
} from 'lucide-react';

const ICON_MAP = {
  xp_boost: Star,
  mega_xp_boost: Star,
  coin_multiplier: Coins,
  lucky_charm: Sparkles,
  cooldown_reducer: Clock,
  streak_saver: Zap,
  bubble_magnet: Sparkles,
  share_multiplier: TrendingUp,
  coin_rain: Coins,
  auto_answers: Zap,
  cooldown_crusher: Clock,
  lucky_streak: Star,
  trading_genius: TrendingUp,
  level_up_boost: Award,
  guild_xp_boost: Users,
  guild_coin_boost: Coins,
  guild_shield: Shield,
  guild_sword: Swords,
  guild_treasure_hunter: Gift,
  guild_rally: Trophy,
  guild_fortress: Shield,
  guild_war_drum: Flame
};

export default function PowerUpInventoryPanel({ player }) {
  const queryClient = useQueryClient();
  const [activatingId, setActivatingId] = React.useState(null);

  const { data: inventory = [] } = useQuery({
    queryKey: ['powerUpInventory', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const all = await base44.entities.PowerUpInventory.filter({ player_id: player.id });
      // Clean up expired active ones
      const now = new Date();
      for (const item of all) {
        if (item.is_active && item.expires_at && new Date(item.expires_at) < now) {
          await base44.entities.PowerUpInventory.update(item.id, {
            is_active: false,
            activated_at: null,
            expires_at: null
          });
        }
      }
      return all;
    },
    enabled: !!player?.id,
    refetchInterval: 5000
  });

  const activatePowerUpMutation = useMutation({
    mutationFn: async (item) => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + item.duration_hours * 60 * 60 * 1000);

      if (item.quantity > 1) {
        // Create new active instance
        await base44.entities.PowerUpInventory.create({
          player_id: player.id,
          power_up_id: item.power_up_id,
          power_up_name: item.power_up_name,
          power_up_type: item.power_up_type,
          quantity: 1,
          is_active: true,
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          duration_hours: item.duration_hours,
          effect_data: item.effect_data
        });

        // Decrease quantity of inactive
        await base44.entities.PowerUpInventory.update(item.id, {
          quantity: item.quantity - 1
        });
      } else {
        // Activate this one
        await base44.entities.PowerUpInventory.update(item.id, {
          is_active: true,
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        });
      }

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Activated ${item.power_up_name}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['powerUpInventory']);
      setActivatingId(null);
    }
  });

  const inactiveItems = inventory.filter(item => !item.is_active && item.quantity > 0);
  const activeItems = inventory.filter(item => item.is_active);

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return '';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Active Power-Ups */}
      {activeItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Active Power-Ups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeItems.map(item => {
              const Icon = ICON_MAP[item.power_up_id] || Star;
              const isGuild = item.power_up_type === 'guild';
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <Card className={`border-2 ${isGuild ? 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-pink-900/20' : 'border-green-500 bg-gradient-to-br from-green-900/20 to-emerald-900/20'}`}>
                    <CardContent className="p-4">
                      <div className="absolute top-2 right-2">
                        <div className="px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          ACTIVE
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 ${isGuild ? 'bg-purple-600/20' : 'bg-green-600/20'} rounded-lg`}>
                          <Icon className={`w-6 h-6 ${isGuild ? 'text-purple-400' : 'text-green-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm">{item.power_up_name}</h4>
                          {isGuild && <p className="text-xs text-purple-400">Guild Effect</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Time Left:</span>
                          <span className="text-green-400 font-bold">{getTimeRemaining(item.expires_at)}</span>
                        </div>
                        
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ 
                              duration: (new Date(item.expires_at) - new Date()) / 1000,
                              ease: 'linear'
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inventory */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-400" />
          Power-Up Inventory ({inactiveItems.length})
        </h3>
        
        {inactiveItems.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No power-ups in inventory</p>
              <p className="text-slate-500 text-sm mt-1">Visit the Shop to purchase power-ups!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveItems.map(item => {
              const Icon = ICON_MAP[item.power_up_id] || Star;
              const isGuild = item.power_up_type === 'guild';
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <Card className={`border ${isGuild ? 'border-purple-500/30 bg-slate-800' : 'border-slate-700 bg-slate-800'}`}>
                    <CardContent className="p-4">
                      <div className="absolute top-2 right-2">
                        <div className="px-2 py-1 bg-slate-700 rounded-full text-xs font-bold text-white">
                          x{item.quantity}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 ${isGuild ? 'bg-purple-600/20' : 'bg-blue-600/20'} rounded-lg`}>
                          <Icon className={`w-6 h-6 ${isGuild ? 'text-purple-400' : 'text-blue-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm">{item.power_up_name}</h4>
                          {isGuild && <p className="text-xs text-purple-400">Guild Effect</p>}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {item.duration_hours}h</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setActivatingId(item.id);
                          activatePowerUpMutation.mutate(item);
                        }}
                        disabled={activatePowerUpMutation.isPending && activatingId === item.id}
                        className={`w-full ${isGuild ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Activate Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}