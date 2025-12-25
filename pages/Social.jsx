import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Users,
  TrendingUp,
  UserPlus,
  UserCheck,
  Copy,
  Eye,
  ThumbsUp,
  Share2,
  Crown,
  Trophy,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchRealTimePrice } from '@/components/portfolio/PriceService';

export default function Social() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    showPortfolio: false,
    showTrades: false,
    allowCopyTrade: false
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: player } = useQuery({
    queryKey: ['player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      return players[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Portfolio.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      const players = await base44.entities.Player.list('-soft_currency', 100);
      return players;
    }
  });

  const { data: myFollowing = [] } = useQuery({
    queryKey: ['following', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.FollowRelationship.filter({ follower_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: myFollowers = [] } = useQuery({
    queryKey: ['followers', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.FollowRelationship.filter({ following_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: sharedStrategies = [] } = useQuery({
    queryKey: ['sharedStrategies'],
    queryFn: async () => {
      return base44.entities.SharedStrategy.filter({ visibility: 'public' }, '-likes', 50);
    }
  });

  const { data: allPortfolios = [] } = useQuery({
    queryKey: ['allPortfolios'],
    queryFn: async () => {
      return base44.entities.Portfolio.list('-created_date', 500);
    }
  });

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      return base44.entities.Transaction.filter({ type: 'trade' }, '-created_date', 500);
    }
  });

  // Calculate trader stats
  const getTraderStats = (traderId) => {
    const traderPortfolio = allPortfolios.filter(p => p.player_id === traderId);
    const traderTrades = allTransactions.filter(t => t.player_id === traderId);
    
    const totalInvested = traderPortfolio.reduce((sum, p) => sum + (p.total_invested || 0), 0);
    const currentValue = traderPortfolio.reduce((sum, p) => sum + (p.shares * (p.avg_acquisition_price || 0)), 0);
    const profit = currentValue - totalInvested;
    const roi = totalInvested > 0 ? ((profit / totalInvested) * 100).toFixed(2) : '0.00';
    
    return {
      portfolioValue: currentValue,
      profit,
      roi,
      totalTrades: traderTrades.length,
      holdings: traderPortfolio.length
    };
  };

  const followMutation = useMutation({
    mutationFn: async ({ targetPlayerId, autoCopy }) => {
      await base44.entities.FollowRelationship.create({
        follower_id: player.id,
        following_id: targetPlayerId,
        auto_copy_trades: autoCopy || false,
        copy_percentage: 100
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (relationshipId) => {
      await base44.entities.FollowRelationship.delete(relationshipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
    }
  });

  const toggleAutoCopyMutation = useMutation({
    mutationFn: async ({ relationshipId, autoCopy }) => {
      await base44.entities.FollowRelationship.update(relationshipId, {
        auto_copy_trades: autoCopy
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
    }
  });

  const isFollowing = (targetPlayerId) => {
    return myFollowing.some(f => f.following_id === targetPlayerId);
  };

  const getFollowRelationship = (targetPlayerId) => {
    return myFollowing.find(f => f.following_id === targetPlayerId);
  };

  const calculatePortfolioValue = async (playerPortfolio) => {
    let totalValue = 0;
    for (const holding of playerPortfolio) {
      const price = await fetchRealTimePrice(holding.ticker);
      totalValue += holding.shares * price;
    }
    return totalValue;
  };

  const topTraders = allPlayers
    .filter(p => p.id !== player?.id)
    .filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(trader => ({
      ...trader,
      stats: getTraderStats(trader.id)
    }))
    .sort((a, b) => parseFloat(b.stats.roi) - parseFloat(a.stats.roi))
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                Social Trading
              </h1>
              <p className="text-slate-400">Follow traders, copy trades, share strategies</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="traders" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto">
            <TabsTrigger value="traders" className="text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Top Traders</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs sm:text-sm">
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Following</span> ({myFollowing.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Followers</span> ({myFollowers.length})
            </TabsTrigger>
            <TabsTrigger value="strategies" className="text-xs sm:text-sm">
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Strategies</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traders">
            <div className="mb-6">
              <Input
                placeholder="Search traders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="grid gap-4">
              {topTraders.map((trader, index) => {
                const following = getFollowRelationship(trader.id);
                const isFollowed = !!following;

                return (
                  <motion.div
                    key={trader.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${
                              index === 0 ? 'from-yellow-500 to-orange-500' :
                              index === 1 ? 'from-slate-400 to-slate-500' :
                              index === 2 ? 'from-amber-600 to-amber-700' :
                              'from-purple-500 to-pink-500'
                            } flex items-center justify-center text-white font-bold shadow-lg`}>
                              {index < 3 ? (
                                index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                              ) : (
                                <span className="text-sm sm:text-base">{index + 1}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-bold text-base sm:text-lg">{trader.username}</h3>
                                {index < 3 && <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />}
                              </div>
                              <p className="text-slate-400 text-xs sm:text-sm">Level {trader.level}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="text-left sm:text-right flex-1 sm:flex-none">
                              <p className="text-slate-400 text-xs">Portfolio Value</p>
                              <p className="text-white font-bold text-sm sm:text-base">${trader.stats.portfolioValue.toLocaleString()}</p>
                            </div>
                            <div className="text-left sm:text-right flex-1 sm:flex-none">
                              <p className="text-slate-400 text-xs">ROI</p>
                              <p className={`font-bold text-sm sm:text-base ${parseFloat(trader.stats.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trader.stats.roi}%
                              </p>
                            </div>
                            <div className="text-left sm:text-right flex-1 sm:flex-none">
                              <p className="text-slate-400 text-xs">Trades</p>
                              <p className="text-white font-bold text-sm sm:text-base">{trader.stats.totalTrades}</p>
                            </div>
                            
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              {isFollowed ? (
                                <>
                                  <Button
                                    onClick={() => unfollowMutation.mutate(following.id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 w-full sm:w-auto"
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Following
                                  </Button>
                                  <div className="flex items-center gap-2 justify-center">
                                    <Switch
                                      checked={following.auto_copy_trades}
                                      onCheckedChange={(checked) => 
                                        toggleAutoCopyMutation.mutate({ 
                                          relationshipId: following.id, 
                                          autoCopy: checked 
                                        })
                                      }
                                    />
                                    <span className="text-xs text-slate-400">Auto-copy</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => followMutation.mutate({ targetPlayerId: trader.id })}
                                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                                    size="sm"
                                  >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Follow
                                  </Button>
                                  <Button
                                    onClick={() => setSelectedTrader(trader)}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 w-full sm:w-auto"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="following">
            <div className="grid gap-4">
              {myFollowing.map((relationship) => {
                const trader = allPlayers.find(p => p.id === relationship.following_id);
                if (!trader) return null;

                return (
                  <Card key={relationship.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {trader.username[0]}
                          </div>
                          <div>
                            <h3 className="text-white font-bold">{trader.username}</h3>
                            <p className="text-slate-400 text-sm">Level {trader.level}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {relationship.auto_copy_trades && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              <Copy className="w-3 h-3 mr-1" />
                              Auto-copying
                            </Badge>
                          )}
                          <Button
                            onClick={() => unfollowMutation.mutate(relationship.id)}
                            variant="outline"
                            size="sm"
                            className="border-slate-600"
                          >
                            Unfollow
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="followers">
            <div className="grid gap-4">
              {myFollowers.map((relationship) => {
                const follower = allPlayers.find(p => p.id === relationship.follower_id);
                if (!follower) return null;

                return (
                  <Card key={relationship.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                          {follower.username[0]}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{follower.username}</h3>
                          <p className="text-slate-400 text-sm">Level {follower.level}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <div className="grid gap-4">
              {sharedStrategies.map((strategy) => {
                const strategyOwner = allPlayers.find(p => p.id === strategy.player_id);

                return (
                  <Card key={strategy.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{strategy.strategy_name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-slate-400" />
                          <span className="text-white">{strategy.likes || 0}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">{strategy.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          By {strategyOwner?.username || 'Unknown'}
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {strategy.followers_count || 0} followers
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    Top Traders by ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allPlayers
                      .map(p => ({ ...p, stats: getTraderStats(p.id) }))
                      .sort((a, b) => parseFloat(b.stats.roi) - parseFloat(a.stats.roi))
                      .slice(0, 10)
                      .map((trader, idx) => (
                        <div key={trader.id} className={`p-4 rounded-lg ${
                          idx === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50' :
                          idx === 1 ? 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/50' :
                          idx === 2 ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/50' :
                          'bg-slate-700/30'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                              </span>
                              <div>
                                <h4 className="text-white font-bold">{trader.username}</h4>
                                <p className="text-slate-400 text-sm">Level {trader.level}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-bold ${parseFloat(trader.stats.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trader.stats.roi}%
                              </p>
                              <p className="text-slate-400 text-xs">{trader.stats.totalTrades} trades</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Most Profitable</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {allPlayers
                        .map(p => ({ ...p, stats: getTraderStats(p.id) }))
                        .sort((a, b) => b.stats.profit - a.stats.profit)
                        .slice(0, 5)
                        .map((trader, idx) => (
                          <div key={trader.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                            <span className="text-white text-sm">{idx + 1}. {trader.username}</span>
                            <span className="text-green-400 font-bold text-sm">+${trader.stats.profit.toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Most Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {allPlayers
                        .map(p => ({ ...p, stats: getTraderStats(p.id) }))
                        .sort((a, b) => b.stats.totalTrades - a.stats.totalTrades)
                        .slice(0, 5)
                        .map((trader, idx) => (
                          <div key={trader.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                            <span className="text-white text-sm">{idx + 1}. {trader.username}</span>
                            <span className="text-purple-400 font-bold text-sm">{trader.stats.totalTrades} trades</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Show Portfolio</h4>
                    <p className="text-slate-400 text-sm">Allow others to view your portfolio holdings</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPortfolio}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showPortfolio: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Show Trades</h4>
                    <p className="text-slate-400 text-sm">Make your trades visible to followers</p>
                  </div>
                  <Switch
                    checked={privacySettings.showTrades}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, showTrades: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Allow Copy Trading</h4>
                    <p className="text-slate-400 text-sm">Let others automatically copy your trades</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowCopyTrade}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, allowCopyTrade: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Trader Detail Modal */}
      <Dialog open={!!selectedTrader} onOpenChange={() => setSelectedTrader(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Trader Profile</DialogTitle>
          </DialogHeader>
          {selectedTrader && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedTrader.username[0]}
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">{selectedTrader.username}</h3>
                  <p className="text-slate-400">Level {selectedTrader.level} Trader</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Portfolio Value</p>
                  <p className="text-white font-bold">${selectedTrader.stats.portfolioValue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Total Profit</p>
                  <p className={`font-bold ${selectedTrader.stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${selectedTrader.stats.profit.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">ROI</p>
                  <p className={`font-bold ${parseFloat(selectedTrader.stats.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedTrader.stats.roi}%
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Total Trades</p>
                  <p className="text-white font-bold">{selectedTrader.stats.totalTrades}</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold mb-3">Portfolio Holdings ({selectedTrader.stats.holdings})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allPortfolios
                    .filter(p => p.player_id === selectedTrader.id)
                    .map((holding, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div>
                          <p className="text-white font-bold">{holding.ticker}</p>
                          <p className="text-slate-400 text-sm">{holding.shares.toFixed(4)} shares</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${(holding.shares * (holding.avg_acquisition_price || 0)).toLocaleString()}</p>
                          <p className="text-slate-400 text-xs">Avg: ${holding.avg_acquisition_price?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-3">
                {!isFollowing(selectedTrader.id) ? (
                  <Button
                    onClick={() => {
                      followMutation.mutate({ targetPlayerId: selectedTrader.id });
                      setSelectedTrader(null);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow Trader
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const rel = getFollowRelationship(selectedTrader.id);
                      if (rel) unfollowMutation.mutate(rel.id);
                      setSelectedTrader(null);
                    }}
                    variant="outline"
                    className="flex-1 border-slate-600"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Unfollow
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}