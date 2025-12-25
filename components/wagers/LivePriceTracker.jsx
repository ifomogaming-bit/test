import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// Simulates live price updates with realistic market movement
export default function LivePriceTracker({ ticker, startingPrice, targetPrice, predictionType }) {
  const [currentPrice, setCurrentPrice] = useState(startingPrice);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    // Simulate price updates every 3-5 seconds
    const interval = setInterval(() => {
      const volatility = 0.02; // 2% max change per update
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = currentPrice * (1 + randomChange);
      
      setPriceChange(newPrice - currentPrice);
      setCurrentPrice(parseFloat(newPrice.toFixed(2)));
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const percentChange = ((currentPrice - startingPrice) / startingPrice) * 100;
  const isWinning = 
    (predictionType === 'above' && currentPrice > targetPrice) ||
    (predictionType === 'below' && currentPrice < targetPrice) ||
    (predictionType === 'exactly' && Math.abs(currentPrice - targetPrice) < 0.5);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs">Live Price</span>
        <motion.div
          animate={{ scale: priceChange !== 0 ? [1, 1.1, 1] : 1 }}
          className={`flex items-center gap-1 font-mono font-bold ${
            priceChange > 0 ? 'text-green-400' : priceChange < 0 ? 'text-red-400' : 'text-white'
          }`}
        >
          {priceChange > 0 && <TrendingUp className="w-3 h-3" />}
          {priceChange < 0 && <TrendingDown className="w-3 h-3" />}
          {priceChange === 0 && <Activity className="w-3 h-3" />}
          <span className="text-sm">${currentPrice.toFixed(2)}</span>
        </motion.div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">vs Target ${targetPrice}</span>
        <span className={percentChange >= 0 ? 'text-green-400' : 'text-red-400'}>
          {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
        </span>
      </div>

      {isWinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/10 border border-green-500/30 rounded p-1 text-center"
        >
          <p className="text-green-400 text-xs font-bold">✓ Winning</p>
        </motion.div>
      )}
    </div>
  );
}