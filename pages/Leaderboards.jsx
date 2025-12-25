import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp,
  Zap,
  Target,
  Swords,
  Crown,
  Medal,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeaderboardEntry from '@/components/leaderboard/LeaderboardEntry';

// Mock stock prices for portfolio value calculation
const MOCK_STOCK_PRICES = {
  AAPL: 178.50, GOOGL: 141.25, MSFT: 378.90, AMZN: 178.75, TSLA: 248.50,
  META: 505.25, NVDA: 875.50, AMD: 178.25, NFLX: 625.00, DIS: 112.50
};

export default function Leaderboards() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: currentPlayer } = useQuery({
    queryKey: ['currentPlayer', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      return players[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list('-level', 100)
  });

  const { data: allPortfolios = [] } = useQuery({
    queryKey: ['allPortfolios'],
    queryFn: () => base44.entities.Portfolio.list()
  });

  // Calculate portfolio values for each player
  const playersWithValues = allPlayers.map(player => {
    const playerPortfolios = allPortfolios.filter(p => p.player_id === player.id);
    const portfolioValue = playerPortfolios.reduce((sum, p) => {
      const price = MOCK_STOCK_PRICES[p.ticker] || p.avg_acquisition_price || 0;
      return sum + (p.shares * price);
    }, 0);
    return { ...player, portfolio_value: portfolioValue };
  });

  // Sort by different criteria
  const portfolioLeaderboard = [...playersWithValues].sort((a, b) => b.portfolio_value - a.portfolio_value);
  const bubblesLeaderboard = [...playersWithValues].sort((a, b) => (b.total_bubbles_popped || 0) - (a.total_bubbles_popped || 0));
  const streakLeaderboard = [...playersWithValues].sort((a, b) => (b.longest_streak || 0) - (a.longest_streak || 0));
  const pvpLeaderboard = [...playersWithValues].sort((a, b) => (b.pvp_rating || 1000) - (a.pvp_rating || 1000));

  const leaderboards = {
    portfolio: { data: portfolioLeaderboard, icon: TrendingUp, color: 'text-green-400' },
    bubbles: { data: bubblesLeaderboard, icon: Target, color: 'text-blue-400' },
    streak: { data: streakLeaderboard, icon: Zap, color: 'text-orange-400' },
    pvp: { data: pvpLeaderboard, icon: Swords, color: 'text-red-400' }
  };

  const currentLeaderboard = leaderboards[activeTab];

  // Find current player's rank
  const currentPlayerRank = currentLeaderboard.data.findIndex(p => p.id === currentPlayer?.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="border-yellow-500/50 text-white hover:bg-yellow-500/20 hover:border-yellow-400 shadow-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                Leaderboards
              </h1>
              <p className="text-slate-400">Global rankings of top players</p>
            </div>
          </div>
        </div>

        {/* Your Rank Card */}
        {currentPlayer && currentPlayerRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-400">#{currentPlayerRank}</span>
                </div>
                <div>
                  <p className="text-white font-bold">{currentPlayer.username}</p>
                  <p className="text-slate-400 text-sm">Your current rank</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < (currentPlayer.level || 1) / 10 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full bg-slate-800/50 border border-slate-700 p-1 h-auto flex-wrap">
            <TabsTrigger value="portfolio" className="flex-1 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="bubbles" className="flex-1 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Target className="w-4 h-4 mr-2" />
              Bubbles
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex-1 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <Zap className="w-4 h-4 mr-2" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="pvp" className="flex-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              <Swords className="w-4 h-4 mr-2" />
              PvP
            </TabsTrigger>
          </TabsList>

          {Object.entries(leaderboards).map(([key, lb]) => (
            <TabsContent key={key} value={key} className="space-y-3">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {lb.data.slice(0, 3).map((player, index) => {
                  const positions = [1, 0, 2]; // 2nd, 1st, 3rd
                  const actualIndex = positions[index];
                  const actualPlayer = lb.data[actualIndex];
                  if (!actualPlayer) return null;

                  const heights = ['h-28', 'h-36', 'h-24'];
                  const colors = [
                    'from-slate-400 to-slate-500',
                    'from-yellow-400 to-amber-500',
                    'from-amber-600 to-orange-700'
                  ];
                  const icons = [Medal, Crown, Medal];
                  const Icon = icons[actualIndex];

                  return (
                    <motion.div
                      key={actualPlayer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: actualIndex * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors[actualIndex]} flex items-center justify-center mb-2 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white font-bold text-center truncate w-full">{actualPlayer.username}</p>
                      <p className={`font-bold ${lb.color}`}>
                        {key === 'portfolio' ? `$${actualPlayer.portfolio_value?.toLocaleString() || 0}` :
                         key === 'bubbles' ? actualPlayer.total_bubbles_popped || 0 :
                         key === 'streak' ? `${actualPlayer.longest_streak || 0}x` :
                         actualPlayer.pvp_rating || 1000}
                      </p>
                      <div className={`${heights[actualIndex]} w-full bg-gradient-to-t ${colors[actualIndex]} rounded-t-xl mt-2 flex items-end justify-center pb-2`}>
                        <span className="text-white font-bold text-2xl">#{actualIndex + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Rest of the list */}
              <div className="space-y-2">
                {lb.data.slice(3, 50).map((player, index) => (
                  <LeaderboardEntry
                    key={player.id}
                    player={{
                      ...player,
                      portfolio_value: key === 'portfolio' ? player.portfolio_value :
                                       key === 'bubbles' ? player.total_bubbles_popped :
                                       key === 'streak' ? player.longest_streak :
                                       player.pvp_rating
                    }}
                    rank={index + 4}
                    isCurrentUser={player.id === currentPlayer?.id}
                  />
                ))}
              </div>

              {lb.data.length === 0 && (
                <div className="text-center py-16">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">No players on the leaderboard yet</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}