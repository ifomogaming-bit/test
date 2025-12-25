import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { ECONOMY_CONFIG, calculateTargetWealth } from './EconomyManager';

export default function EconomyDashboard() {
  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list('-level', 1000)
  });

  // Calculate economy health metrics
  const avgByLevel = {};
  const playersByLevel = {};

  allPlayers.forEach(p => {
    const level = p.level || 1;
    if (!avgByLevel[level]) {
      avgByLevel[level] = { coins: 0, gems: 0, count: 0 };
      playersByLevel[level] = [];
    }
    avgByLevel[level].coins += p.soft_currency || 0;
    avgByLevel[level].gems += p.premium_currency || 0;
    avgByLevel[level].count += 1;
    playersByLevel[level].push(p);
  });

  const healthByLevel = Object.keys(avgByLevel).map(level => {
    const avg = avgByLevel[level];
    const target = calculateTargetWealth(parseInt(level));
    const coinHealth = (avg.coins / avg.count) / target.coins;
    const gemHealth = (avg.gems / avg.count) / target.gems;

    return {
      level: parseInt(level),
      avgCoins: Math.floor(avg.coins / avg.count),
      avgGems: Math.floor(avg.gems / avg.count),
      targetCoins: target.coins,
      targetGems: target.gems,
      coinHealth,
      gemHealth,
      players: avg.count
    };
  }).sort((a, b) => b.players - a.players).slice(0, 10);

  const getHealthStatus = (health) => {
    if (health > ECONOMY_CONFIG.INFLATION_THRESHOLD) return { status: 'inflation', color: 'text-red-400', icon: TrendingUp };
    if (health < ECONOMY_CONFIG.DEFLATION_THRESHOLD) return { status: 'deflation', color: 'text-orange-400', icon: TrendingDown };
    return { status: 'healthy', color: 'text-green-400', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Economy Health Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthByLevel.map(level => {
              const coinStatus = getHealthStatus(level.coinHealth);
              const gemStatus = getHealthStatus(level.gemHealth);

              return (
                <div key={level.level} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">Level {level.level}</span>
                      <Badge variant="outline" className="border-slate-600 text-slate-400">
                        {level.players} players
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Coins</p>
                      <div className="flex items-center gap-2">
                        <coinStatus.icon className={`w-4 h-4 ${coinStatus.color}`} />
                        <span className="text-white">{level.avgCoins.toLocaleString()}</span>
                        <span className="text-slate-500">/ {level.targetCoins.toLocaleString()}</span>
                      </div>
                      <p className={`text-xs ${coinStatus.color}`}>
                        {(level.coinHealth * 100).toFixed(0)}% of target
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-slate-400 mb-1">Gems</p>
                      <div className="flex items-center gap-2">
                        <gemStatus.icon className={`w-4 h-4 ${gemStatus.color}`} />
                        <span className="text-white">{level.avgGems}</span>
                        <span className="text-slate-500">/ {level.targetGems}</span>
                      </div>
                      <p className={`text-xs ${gemStatus.color}`}>
                        {(level.gemHealth * 100).toFixed(0)}% of target
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Earning Potential</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {Object.entries(ECONOMY_CONFIG.DAILY_EARNING_RATES).map(([source, rates]) => (
              <div key={source} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                <span className="text-white capitalize">{source.replace('_', ' ')}</span>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400">{rates.coins} coins</span>
                  <span className="text-purple-400">{rates.gems} gems</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded font-bold">
              <span className="text-white">Total Daily Max</span>
              <div className="flex items-center gap-4">
                <span className="text-yellow-400">
                  {Object.values(ECONOMY_CONFIG.DAILY_EARNING_RATES).reduce((sum, r) => sum + r.coins, 0)} coins
                </span>
                <span className="text-purple-400">
                  {Object.values(ECONOMY_CONFIG.DAILY_EARNING_RATES).reduce((sum, r) => sum + r.gems, 0)} gems
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}