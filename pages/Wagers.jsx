import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Coins, Clock, Users, CreditCard } from 'lucide-react';
import WagerCountdownTimer from '@/components/wagers/WagerCountdownTimer';
import LivePriceTracker from '@/components/wagers/LivePriceTracker';
import MarketVolatilityWidget from '@/components/economy/MarketVolatilityWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const POPULAR_TICKERS = ['AAPL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY', 'QQQ'];

export default function Wagers() {
  const [user, setUser] = useState(null);
  const [newWager, setNewWager] = useState({
    ticker: 'AAPL',
    prediction_type: 'above',
    target_price: '',
    wager_amount: 1000,
    duration_minutes: 60
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

  const { data: wagers = [] } = useQuery({
    queryKey: ['wagers'],
    queryFn: () => base44.entities.Wager.list('-created_date', 50),
    refetchInterval: 5000 // Update every 5 seconds
  });

  const { data: volatility } = useQuery({
    queryKey: ['marketVolatility'],
    queryFn: async () => {
      const vols = await base44.entities.MarketVolatility.list('-last_updated', 1);
      if (vols.length === 0) {
        return await base44.entities.MarketVolatility.create({
          current_index: 50,
          trend: 'stable',
          wager_difficulty_multiplier: 1.0,
          wager_reward_multiplier: 1.0,
          last_updated: new Date().toISOString()
        });
      }
      return vols[0];
    },
    refetchInterval: 30000
  });

  const createWagerMutation = useMutation({
    mutationFn: async (wagerData) => {
      // Validate player can afford wager
      if ((player.soft_currency || 0) < wagerData.wager_amount) {
        throw new Error('Insufficient funds');
      }

      if (!wagerData.target_price || wagerData.target_price <= 0) {
        throw new Error('Please enter a valid target price');
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + wagerData.duration_minutes);
      
      // Simulate current price (in real app would fetch from API)
      const currentPrice = Math.random() * 500 + 100;
      
      await base44.entities.Wager.create({
        ...wagerData,
        creator_id: player.id,
        starting_price: parseFloat(currentPrice.toFixed(2)),
        target_price: parseFloat(wagerData.target_price),
        expires_at: expiresAt.toISOString(),
        status: 'open',
        payout_processed: false
      });

      const newBalance = (player.soft_currency || 0) - wagerData.wager_amount;
      await base44.entities.Player.update(player.id, {
        soft_currency: Math.max(0, newBalance)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wagers']);
      queryClient.invalidateQueries(['player']);
      setNewWager({ ticker: 'AAPL', prediction_type: 'above', target_price: '', wager_amount: 1000, duration_minutes: 60 });
    }
  });

  const acceptWagerMutation = useMutation({
    mutationFn: async (wager) => {
      // Validate player can afford wager
      if ((player.soft_currency || 0) < wager.wager_amount) {
        throw new Error('Insufficient funds');
      }

      await base44.entities.Wager.update(wager.id, {
        opponent_id: player.id,
        status: 'accepted'
      });

      const newBalance = (player.soft_currency || 0) - wager.wager_amount;
      await base44.entities.Player.update(player.id, {
        soft_currency: Math.max(0, newBalance)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wagers']);
      queryClient.invalidateQueries(['player']);
    }
  });

  const resolveWagerMutation = useMutation({
    mutationFn: async (wager) => {
      if (wager.payout_processed) return;

      // Simulate final price (in real app would fetch from API)
      const finalPrice = parseFloat((wager.starting_price + (Math.random() - 0.5) * 50).toFixed(2));
      
      let winnerId = null;
      
      // Determine winner based on prediction
      if (wager.prediction_type === 'above' && finalPrice > wager.target_price) {
        winnerId = wager.creator_id;
      } else if (wager.prediction_type === 'below' && finalPrice < wager.target_price) {
        winnerId = wager.creator_id;
      } else if (wager.prediction_type === 'exactly' && Math.abs(finalPrice - wager.target_price) < 0.01) {
        winnerId = wager.creator_id;
      } else {
        winnerId = wager.opponent_id;
      }

      const loserId = winnerId === wager.creator_id ? wager.opponent_id : wager.creator_id;
      // Apply volatility multiplier to rewards
      const rewardMultiplier = volatility?.wager_reward_multiplier || 1.0;
      const basePot = wager.wager_amount * 2;
      const totalPot = Math.round(basePot * rewardMultiplier);

      // Update wager status
      await base44.entities.Wager.update(wager.id, {
        status: 'completed',
        winner_id: winnerId,
        final_price: finalPrice,
        payout_processed: true
      });

      // Get winner and loser
      const [winner] = await base44.entities.Player.filter({ id: winnerId });
      
      // Pay out winner
      await base44.entities.Player.update(winnerId, {
        soft_currency: (winner.soft_currency || 0) + totalPot
      });

      // Record transaction
      await base44.entities.Transaction.create({
        player_id: winnerId,
        type: 'wager_win',
        description: `Won wager on ${wager.ticker}: ${wager.prediction_type} ${wager.target_price}`,
        soft_currency_change: totalPot
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wagers']);
      queryClient.invalidateQueries(['player']);
    }
  });

  const openWagers = wagers.filter(w => w.status === 'open' && w.creator_id !== player?.id);
  const myWagers = wagers.filter(w => w.creator_id === player?.id || w.opponent_id === player?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                Wagers & Loans
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">Price predictions & P2P lending</p>
            </div>
            <Link to={createPageUrl('Loans')}>
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 font-bold">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Loans</span>
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* Market Volatility Widget */}
        <div className="mb-6">
          <MarketVolatilityWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Create Wager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Asset</label>
                <Select value={newWager.ticker} onValueChange={(v) => setNewWager({...newWager, ticker: v})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_TICKERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Prediction Type</label>
                <Select value={newWager.prediction_type} onValueChange={(v) => setNewWager({...newWager, prediction_type: v})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">📈 Will Close Above</SelectItem>
                    <SelectItem value="below">📉 Will Close Below</SelectItem>
                    <SelectItem value="exactly">🎯 Exact Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Target Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newWager.target_price}
                  onChange={(e) => setNewWager({...newWager, target_price: e.target.value})}
                  placeholder="e.g., 278.50"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Wager Amount</label>
                <Input
                  type="number"
                  value={newWager.wager_amount}
                  onChange={(e) => setNewWager({...newWager, wager_amount: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Duration</label>
                <Select value={newWager.duration_minutes.toString()} onValueChange={(v) => setNewWager({...newWager, duration_minutes: parseInt(v)})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="60">1 Hour</SelectItem>
                    <SelectItem value="180">3 Hours</SelectItem>
                    <SelectItem value="360">6 Hours</SelectItem>
                    <SelectItem value="1440">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => createWagerMutation.mutate(newWager)}
                disabled={(player?.soft_currency || 0) < newWager.wager_amount || !newWager.target_price}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Create Wager
                {volatility && volatility.wager_reward_multiplier !== 1.0 && (
                  <Badge className="ml-2 bg-yellow-500/30 text-yellow-300">
                    ×{volatility.wager_reward_multiplier.toFixed(2)} rewards
                  </Badge>
                )}
              </Button>
              {newWager.target_price && (
                <p className="text-xs text-slate-400 text-center">
                  Predicting {newWager.ticker} will close{' '}
                  {newWager.prediction_type === 'above' ? 'above' : newWager.prediction_type === 'below' ? 'below' : 'exactly at'}{' '}
                  ${newWager.target_price}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Open Wagers ({openWagers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {openWagers.map(wager => (
                    <div key={wager.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-orange-500/50 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl flex-shrink-0">
                            {wager.prediction_type === 'above' ? '📈' : wager.prediction_type === 'below' ? '📉' : '🎯'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-lg">{wager.ticker}</p>
                            <p className="text-slate-300 text-sm break-words">
                              Will close{' '}
                              <span className="font-bold text-orange-400">
                                {wager.prediction_type === 'above' ? 'ABOVE' : wager.prediction_type === 'below' ? 'BELOW' : 'EXACTLY'}
                              </span>
                              {' '}${wager.target_price}
                            </p>
                            <LivePriceTracker 
                              ticker={wager.ticker}
                              startingPrice={wager.starting_price}
                              targetPrice={wager.target_price}
                              predictionType={wager.prediction_type}
                            />
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-yellow-400 font-bold text-lg">{wager.wager_amount.toLocaleString()} coins</p>
                          <p className="text-green-400 text-sm">
                            Win: {Math.round(wager.wager_amount * 2 * (volatility?.wager_reward_multiplier || 1.0)).toLocaleString()}
                            {volatility && volatility.wager_reward_multiplier !== 1.0 && (
                              <span className="text-yellow-400 ml-1">×{volatility.wager_reward_multiplier.toFixed(2)}</span>
                            )}
                          </p>
                          <WagerCountdownTimer 
                            expiresAt={wager.expires_at}
                            createdAt={wager.created_date}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => acceptWagerMutation.mutate(wager)}
                        disabled={(player?.soft_currency || 0) < wager.wager_amount}
                        size="sm"
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        Accept Challenge - Bet {wager.wager_amount.toLocaleString()} coins
                      </Button>
                    </div>
                  ))}
                  {openWagers.length === 0 && (
                    <p className="text-slate-400 text-center py-8">No open wagers available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Wagers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myWagers.map(wager => {
                    const isExpired = new Date(wager.expires_at) < new Date();
                    const canResolve = wager.status === 'accepted' && isExpired && !wager.payout_processed;
                    const isCreator = wager.creator_id === player?.id;
                    
                    return (
                      <div key={wager.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-lg">{wager.ticker}</p>
                            <p className="text-slate-400 text-sm break-words">
                              {wager.prediction_type === 'above' ? 'Above' : wager.prediction_type === 'below' ? 'Below' : 'Exactly'} ${wager.target_price}
                            </p>
                            {wager.status === 'accepted' && !isExpired && (
                              <div className="mt-2">
                                <LivePriceTracker 
                                  ticker={wager.ticker}
                                  startingPrice={wager.starting_price}
                                  targetPrice={wager.target_price}
                                  predictionType={wager.prediction_type}
                                />
                              </div>
                            )}
                            {wager.status === 'open' && (
                              <p className="text-slate-500 text-xs mt-1">Start: ${wager.starting_price}</p>
                            )}
                            {wager.final_price && (
                              <p className="text-cyan-400 text-xs mt-1">Final: ${wager.final_price}</p>
                            )}
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto">
                            <Badge className={
                              wager.status === 'open' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 
                              wager.status === 'accepted' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                              wager.winner_id === player?.id ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                              'bg-red-500/20 text-red-400 border-red-500/50'
                            } border>
                              {wager.status === 'completed' ? (wager.winner_id === player?.id ? '🏆 Won' : '❌ Lost') : wager.status}
                            </Badge>
                            <p className="text-yellow-400 font-bold mt-1 text-sm sm:text-base">{wager.wager_amount * 2} coins pot</p>
                            {!isExpired && wager.status !== 'completed' && (
                              <div className="mt-2">
                                <WagerCountdownTimer 
                                  expiresAt={wager.expires_at}
                                  createdAt={wager.created_date}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {canResolve && (
                          <Button
                            onClick={() => resolveWagerMutation.mutate(wager)}
                            size="sm"
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 mt-3"
                          >
                            Resolve Wager
                          </Button>
                        )}
                        {wager.status === 'completed' && wager.winner_id === player?.id && (
                          <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/30 text-center">
                            <p className="text-green-400 text-sm font-bold">
                              +{Math.round(wager.wager_amount * 2 * (volatility?.wager_reward_multiplier || 1.0)).toLocaleString()} coins
                              {volatility && volatility.wager_reward_multiplier !== 1.0 && (
                                <span className="text-yellow-400 ml-1">(×{volatility.wager_reward_multiplier.toFixed(2)} volatility bonus)</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}