import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Coins } from 'lucide-react';

export default function TradeConfirmationModal({ 
  trade, 
  onConfirm, 
  onCancel,
  playerBalance 
}) {
  if (!trade) return null;

  const { action, ticker, name, quantity, price, bidPrice, askPrice, isCrypto } = trade;
  const isBuy = action === 'buy';
  const executionPrice = isBuy ? askPrice : bidPrice;
  const totalCost = quantity * executionPrice;
  const spread = askPrice - bidPrice;
  const spreadPercent = ((spread / bidPrice) * 100).toFixed(3);

  const canAfford = isBuy ? playerBalance >= totalCost : true;

  return (
    <Dialog open={!!trade} onOpenChange={onCancel}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            {isBuy ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
            Confirm {isBuy ? 'Purchase' : 'Sale'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Asset Info */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-bold text-lg">{ticker}</h3>
                <p className="text-slate-400 text-sm">{name}</p>
                {isCrypto && (
                  <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded mt-1">
                    Crypto
                  </span>
                )}
              </div>
            </div>

            {/* Bid/Ask Spread */}
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-700">
              <div>
                <p className="text-slate-400 text-xs mb-1">Bid Price</p>
                <p className="text-green-400 font-bold">${bidPrice.toFixed(bidPrice < 1 ? 6 : 2)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Ask Price</p>
                <p className="text-red-400 font-bold">${askPrice.toFixed(askPrice < 1 ? 6 : 2)}</p>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-slate-400">
              Spread: ${spread.toFixed(spread < 0.01 ? 6 : 4)} ({spreadPercent}%)
            </div>
          </div>

          {/* Trade Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Action</span>
              <span className={`font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                {isBuy ? 'BUY' : 'SELL'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Quantity</span>
              <span className="text-white font-bold">{quantity.toFixed(quantity < 1 ? 6 : 2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Execution Price</span>
              <span className="text-white font-bold">${executionPrice.toFixed(executionPrice < 1 ? 6 : 2)}</span>
            </div>

            <div className="h-px bg-slate-700" />

            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Total {isBuy ? 'Cost' : 'Revenue'}</span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">
                  {isBuy ? '-' : '+'}{totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {isBuy && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Your Balance</span>
                <span className="text-white">{playerBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          {/* Warning if can't afford */}
          {!canAfford && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium text-sm">Insufficient Funds</p>
                <p className="text-red-300/80 text-xs mt-1">
                  You need {(totalCost - playerBalance).toLocaleString()} more coins for this purchase.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(trade)}
              disabled={!canAfford}
              className={`flex-1 ${
                isBuy 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Confirm {isBuy ? 'Purchase' : 'Sale'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}