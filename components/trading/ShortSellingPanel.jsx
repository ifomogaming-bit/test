import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Shield,
  X,
  Percent,
  Clock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ShortSellingPanel({ 
  player, 
  marginAccount, 
  currentPrices,
  onClose 
}) {
  const [selectedTicker, setSelectedTicker] = useState('');
  const [shares, setShares] = useState('');
  const queryClient = useQueryClient();

  const shortSellMutation = useMutation({
    mutationFn: async ({ ticker, shares, price }) => {
      const borrowCost = shares * price;
      const collateralRequired = borrowCost * 1.5; // 150% collateral
      
      // Check margin requirements
      if ((player?.soft_currency || 0) < collateralRequired) {
        throw new Error('Insufficient collateral for short sale');
      }

      // Check margin limit
      if ((marginAccount?.borrowed_amount || 0) + borrowCost > (marginAccount?.margin_limit || 0)) {
        throw new Error('Exceeds margin limit');
      }

      // Lock collateral
      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - collateralRequired
      });

      // Update margin account
      const shortPositions = marginAccount?.short_positions || [];
      shortPositions.push({
        ticker,
        shares,
        entry_price: price,
        collateral: collateralRequired,
        opened_at: new Date().toISOString()
      });

      await base44.entities.MarginAccount.update(marginAccount.id, {
        borrowed_amount: (marginAccount.borrowed_amount || 0) + borrowCost,
        short_positions: shortPositions,
        collateral_value: (marginAccount.collateral_value || 0) + collateralRequired
      });

      // Record transaction
      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Shorted ${shares} ${ticker} @ $${price.toFixed(2)}`,
        soft_currency_change: -collateralRequired,
        stock_ticker: ticker,
        shares_change: -shares
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['marginAccount']);
      setSelectedTicker('');
      setShares('');
    }
  });

  const coverShortMutation = useMutation({
    mutationFn: async ({ position, currentPrice }) => {
      const buyCost = position.shares * currentPrice;
      const profit = (position.entry_price - currentPrice) * position.shares;
      
      // Return collateral + profit (or - loss)
      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + position.collateral + profit
      });

      // Update margin account
      const updatedPositions = (marginAccount?.short_positions || []).filter(p => 
        p.ticker !== position.ticker || p.opened_at !== position.opened_at
      );

      await base44.entities.MarginAccount.update(marginAccount.id, {
        borrowed_amount: Math.max(0, (marginAccount.borrowed_amount || 0) - (position.shares * position.entry_price)),
        short_positions: updatedPositions,
        collateral_value: Math.max(0, (marginAccount.collateral_value || 0) - position.collateral)
      });

      // Record transaction
      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Covered short ${position.shares} ${position.ticker} @ $${currentPrice.toFixed(2)} | P&L: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`,
        soft_currency_change: position.collateral + profit,
        stock_ticker: position.ticker,
        shares_change: position.shares
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['marginAccount']);
    }
  });

  const shortPositions = marginAccount?.short_positions || [];
  const maintenanceMargin = marginAccount?.maintenance_margin || 0.25;
  const equityRatio = marginAccount?.borrowed_amount > 0
    ? (marginAccount.collateral_value - marginAccount.borrowed_amount) / marginAccount.borrowed_amount
    : 1;
  const isMarginCall = equityRatio < maintenanceMargin;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-400" />
            Short Selling & Margin
          </DialogTitle>
        </DialogHeader>

        {/* Margin Account Status */}
        <Card className={`border-2 ${isMarginCall ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Margin Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-slate-400 text-xs">Margin Limit</p>
                <p className="text-white font-bold">{marginAccount?.margin_limit?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-slate-400 text-xs">Borrowed</p>
                <p className="text-orange-400 font-bold">{marginAccount?.borrowed_amount?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-slate-400 text-xs">Collateral</p>
                <p className="text-blue-400 font-bold">{marginAccount?.collateral_value?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-slate-400 text-xs">Equity Ratio</p>
                <p className={`font-bold ${isMarginCall ? 'text-red-400' : 'text-green-400'}`}>
                  {(equityRatio * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {isMarginCall && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold">⚠️ MARGIN CALL</p>
                  <p className="text-red-300 text-sm">Your equity ratio is below {(maintenanceMargin * 100)}%. Add collateral or close positions.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open New Short */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Open Short Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
              <p className="text-yellow-300 text-sm">
                ⚠️ Short selling requires 150% collateral and carries unlimited risk. 
                Interest charges: {((marginAccount?.interest_rate || 0.08) * 100).toFixed(1)}% annually.
              </p>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Ticker</label>
              <Input
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Shares to Short</label>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="Quantity..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            {selectedTicker && currentPrices[selectedTicker] && shares && (
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Current Price</span>
                  <span className="text-white font-bold">${currentPrices[selectedTicker].toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Borrow Value</span>
                  <span className="text-orange-400 font-bold">${(shares * currentPrices[selectedTicker]).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Collateral Required (150%)</span>
                  <span className="text-red-400 font-bold">${(shares * currentPrices[selectedTicker] * 1.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Your Balance</span>
                  <span className="text-white font-bold">${player?.soft_currency?.toLocaleString() || 0}</span>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                const price = currentPrices[selectedTicker];
                if (price && shares) {
                  shortSellMutation.mutate({ ticker: selectedTicker, shares: parseFloat(shares), price });
                }
              }}
              disabled={!selectedTicker || !shares || !currentPrices[selectedTicker]}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Open Short Position
            </Button>
          </CardContent>
        </Card>

        {/* Active Short Positions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Active Short Positions ({shortPositions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shortPositions.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No active short positions</p>
              ) : (
                shortPositions.map((position, idx) => {
                  const currentPrice = currentPrices[position.ticker] || position.entry_price;
                  const unrealizedPnL = (position.entry_price - currentPrice) * position.shares;
                  const pnlPercent = ((unrealizedPnL / (position.shares * position.entry_price)) * 100);

                  return (
                    <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-bold text-lg">{position.ticker}</h4>
                          <p className="text-slate-400 text-sm">{position.shares} shares shorted @ ${position.entry_price.toFixed(2)}</p>
                          <p className="text-slate-500 text-xs mt-1">
                            Opened: {new Date(position.opened_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <motion.p 
                            key={unrealizedPnL}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className={`text-xl font-bold ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
                          </motion.p>
                          <p className={`text-sm ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-400 text-xs">Entry</p>
                          <p className="text-white font-bold">${position.entry_price.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <p className="text-slate-400 text-xs">Current</p>
                          <p className="text-white font-bold">${currentPrice.toFixed(2)}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => coverShortMutation.mutate({ position, currentPrice })}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Cover Position
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}