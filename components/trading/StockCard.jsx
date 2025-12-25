import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateBidAskPrices } from '@/components/portfolio/PriceService';
import MiniCandleChart from './MiniCandleChart';

export default function StockCard({ 
  stock, 
  holding,
  onBuy, 
  onSell,
  canAfford 
}) {
  const [quantity, setQuantity] = useState(1);
  const { ticker, name, price, priceChange, priceHistory, isCrypto } = stock;
  
  // Ensure price is always a valid number
  const safePrice = Number(price) || 0;
  const safePriceChange = Number(priceChange) || 0;
  const isPositive = safePriceChange >= 0;
  const holdingShares = holding?.shares || 0;
  
  // Calculate bid/ask prices
  const { bidPrice, askPrice } = calculateBidAskPrices(safePrice, isCrypto);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-5 border border-slate-700/50 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/20 backdrop-blur-sm relative overflow-hidden"
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${isPositive ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'}`} />
      <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
              {ticker.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{ticker}</h3>
              {isCrypto && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 text-xs rounded-full border border-purple-400/30 font-medium">
                  ₿ Crypto
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-400 text-sm truncate">{name}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black tracking-tight mb-1 bg-gradient-to-r ${isPositive ? 'from-green-400 to-emerald-400' : 'from-red-400 to-rose-400'} bg-clip-text text-transparent`}>
            ${safePrice.toFixed(safePrice < 1 ? 6 : 2)}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${isPositive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{safePriceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Bid/Ask Spread */}
      <div className="flex items-center justify-between mb-3 px-2 py-1.5 bg-slate-900/50 rounded-lg text-xs">
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Bid:</span>
          <span className="text-green-400 font-medium">${bidPrice.toFixed(bidPrice < 1 ? 6 : 2)}</span>
        </div>
        <ArrowUpDown className="w-3 h-3 text-slate-600" />
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Ask:</span>
          <span className="text-red-400 font-medium">${askPrice.toFixed(askPrice < 1 ? 6 : 2)}</span>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="mb-3">
        <MiniCandleChart
          ticker={ticker}
          currentPrice={safePrice}
          basePrice={stock.basePrice}
          isCrypto={isCrypto}
        />
      </div>

      {/* Holdings */}
      {holdingShares > 0 && (
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="mb-3 p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/40 shadow-lg shadow-blue-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium">Your Position</p>
                <p className="text-blue-100 font-bold text-sm">{holdingShares.toFixed(4)} shares</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Value</p>
              <p className="text-cyan-300 font-bold text-sm">${(holdingShares * safePrice).toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trading Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-1">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setQuantity(Math.max(0.01, quantity - (isCrypto ? 0.01 : 1)))}
            className="h-8 w-8 border-slate-600"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
            className="h-8 text-center bg-slate-700 border-slate-600 text-white"
            step={isCrypto ? "0.01" : "1"}
            min={isCrypto ? "0.01" : "1"}
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setQuantity(quantity + (isCrypto ? 0.01 : 1))}
            className="h-8 w-8 border-slate-600"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        <Button
          onClick={() => onBuy(ticker, name, quantity, safePrice, bidPrice, askPrice, isCrypto)}
          disabled={!canAfford(quantity * askPrice)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          Buy ${(quantity * askPrice).toFixed(2)}
        </Button>
        
        {holdingShares > 0 && (
          <Button
            onClick={() => onSell(ticker, name, Math.min(quantity, holdingShares), safePrice, bidPrice, askPrice, isCrypto)}
            disabled={holdingShares < quantity}
            size="sm"
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600/10"
          >
            Sell
          </Button>
        )}
      </div>
      </div>
    </motion.div>
  );
}