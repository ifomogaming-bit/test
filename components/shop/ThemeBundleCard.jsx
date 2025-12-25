import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, CheckCircle, Coins, Gem, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeBundleCard({ bundle, owned, playerCoins, playerGems, onPurchase }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!bundle.limitedTime) return;

    const updateTimer = () => {
      const remaining = bundle.endTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining / 60000) % 60);
      const secs = Math.floor((remaining / 1000) % 60);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else {
        setTimeLeft(`${mins}m ${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [bundle]);

  const canAffordCoins = playerCoins >= bundle.coinPrice;
  const canAffordGems = playerGems >= bundle.gemPrice;

  // Calculate value proposition
  const getValueText = () => {
    if (!bundle.usdPrice) return null;
    const gemValue = (bundle.gemPrice / bundle.usdPrice).toFixed(0);
    return `${gemValue} gems per $1`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl border p-6 ${
        bundle.limitedTime
          ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50'
          : 'bg-slate-800/50 border-slate-700'
      }`}
    >
      {/* Limited Time Badge */}
      {bundle.limitedTime && (
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-bold">{timeLeft}</span>
        </div>
      )}

      {/* Owned Badge */}
      {owned && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
      )}

      {/* Bundle Info */}
      <div className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles className={`w-6 h-6 ${bundle.limitedTime ? 'text-purple-400' : 'text-slate-400'}`} />
          <div>
            <h3 className="text-xl font-bold text-white">{bundle.name}</h3>
            {bundle.limitedTime && (
              <span className="text-purple-300 text-xs">Limited Time Offer!</span>
            )}
          </div>
        </div>
        <p className="text-slate-400 text-sm">{bundle.description}</p>
      </div>

      {/* Pricing */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">{bundle.coinPrice.toLocaleString()}</span>
          </div>
          <Button
            onClick={() => onPurchase(bundle, 'coins')}
            disabled={!canAffordCoins || owned}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
          >
            {owned ? 'Owned' : 'Buy'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-purple-400" />
            <span className="text-white font-medium">{bundle.gemPrice.toLocaleString()}</span>
          </div>
          <Button
            onClick={() => onPurchase(bundle, 'gems')}
            disabled={!canAffordGems || owned}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {owned ? 'Owned' : 'Buy'}
          </Button>
        </div>

        {bundle.usdPrice && (
          <div className="pt-3 border-t-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 -mx-6 px-6 pb-0 mt-3 rounded-b-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <span className="text-white font-black text-2xl">${bundle.usdPrice}</span>
                  <span className="text-green-400 text-sm font-bold">USD</span>
                </div>
                <p className="text-green-300 text-xs font-bold">
                  💎 Best Value: {getValueText()}
                </p>
              </div>
              <Button
                onClick={() => onPurchase(bundle, 'usd')}
                disabled={owned}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-black text-base px-6 py-6 shadow-lg shadow-green-500/30"
              >
                {owned ? '✓ Owned' : `Buy Now $${bundle.usdPrice}`}
              </Button>
            </div>
            {bundle.limitedTime && (
              <p className="text-yellow-300 text-xs font-bold text-center pb-2 animate-pulse">
                ⚡ Limited Time - Save {((1 - (bundle.usdPrice / (bundle.gemPrice / 100))) * 100).toFixed(0)}%!
              </p>
            )}
          </div>
        )}
      </div>

      {!canAffordCoins && !canAffordGems && !owned && (
        <div className="text-center py-2 bg-red-500/10 rounded-lg border border-red-500/30">
          <p className="text-red-400 text-xs">Insufficient funds</p>
        </div>
      )}
    </motion.div>
  );
}