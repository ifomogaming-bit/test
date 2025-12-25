import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketVolatilityWidget() {
  const { data: volatility } = useQuery({
    queryKey: ['marketVolatility'],
    queryFn: async () => {
      const vols = await base44.entities.MarketVolatility.list('-last_updated', 1);
      if (vols.length === 0) {
        return await base44.entities.MarketVolatility.create({
          current_index: 50,
          trend: 'stable',
          sector_volatility: {},
          wager_difficulty_multiplier: 1.0,
          wager_reward_multiplier: 1.0,
          last_updated: new Date().toISOString()
        });
      }
      return vols[0];
    },
    refetchInterval: 30000 // Update every 30s
  });

  if (!volatility) return null;

  const getVolatilityLevel = (index) => {
    if (index < 30) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
    if (index < 50) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
    if (index < 70) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' };
    return { level: 'Extreme', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
  };

  const vol = getVolatilityLevel(volatility.current_index);

  return (
    <Card className={`${vol.bg} border-2 ${vol.border} shadow-lg`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Activity className={`w-4 h-4 ${vol.color}`} />
          Market Volatility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <motion.p 
              className={`${vol.color} text-3xl font-black`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {volatility.current_index}
            </motion.p>
            <p className="text-slate-400 text-xs">{vol.level} Volatility</p>
          </div>
          <div className="flex items-center gap-1">
            {volatility.trend === 'increasing' && <TrendingUp className={`w-5 h-5 ${vol.color}`} />}
            {volatility.trend === 'decreasing' && <TrendingDown className={`w-5 h-5 ${vol.color}`} />}
            {volatility.trend === 'stable' && <Minus className={`w-5 h-5 ${vol.color}`} />}
          </div>
        </div>

        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full bg-gradient-to-r ${
              volatility.current_index < 30 ? 'from-green-500 to-green-600' :
              volatility.current_index < 50 ? 'from-yellow-500 to-yellow-600' :
              volatility.current_index < 70 ? 'from-orange-500 to-orange-600' :
              'from-red-500 to-red-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${volatility.current_index}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-slate-400">Wager Difficulty</p>
            <p className="text-white font-bold">×{volatility.wager_difficulty_multiplier.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-slate-400">Wager Rewards</p>
            <p className="text-green-400 font-bold">×{volatility.wager_reward_multiplier.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}