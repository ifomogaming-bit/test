import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateGreeks } from './OptionGreeks';

export default function OptionChain({ ticker, currentPrice, onTrade, playerBalance }) {
  const [expiry, setExpiry] = useState('1d');
  const [livePrice, setLivePrice] = useState(currentPrice);

  // Update live price when prop changes
  useEffect(() => {
    setLivePrice(currentPrice);
  }, [currentPrice]);

  // Continuously update display with micro-movements
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(prev => {
        const isCrypto = ticker.includes('-USD');
        const microChange = (Math.random() - 0.5) * 0.002 * prev * (isCrypto ? 2 : 1);
        return prev + microChange;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [ticker]);

  const expiryDays = {
    '1d': 1,
    '3d': 3,
    '7d': 7,
    '14d': 14,
    '30d': 30
  };

  const daysToExpiry = expiryDays[expiry];
  const T = daysToExpiry / 365;
  const r = 0.05; // 5% risk-free rate
  const isCrypto = ticker.includes('-USD');
  const sigma = isCrypto ? 0.45 : 0.35; // Higher volatility for realistic premiums

  // Generate strike prices around LIVE price - MORE strikes for better chain
  const strikes = [];
  const strikeInterval = livePrice > 1000 ? 50 : livePrice > 100 ? 5 : livePrice > 10 ? 0.5 : livePrice > 1 ? 0.1 : 0.01;
  for (let i = -5; i <= 5; i++) {
    strikes.push(parseFloat((livePrice + i * strikeInterval).toFixed(livePrice < 1 ? 6 : 2)));
  }

  const getMoneyness = (strike, isCall) => {
    const diff = livePrice - strike;
    if (Math.abs(diff) < strikeInterval * 0.5) return 'ATM';
    if (isCall) return diff > 0 ? 'ITM' : 'OTM';
    return diff < 0 ? 'ITM' : 'OTM';
  };

  return (
    <div className="space-y-4">
      {/* Expiry Selector */}
      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
        <label className="text-slate-400 text-xs mb-2 block flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Expiration Date
        </label>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(expiryDays).map(exp => (
            <Button
              key={exp}
              onClick={() => setExpiry(exp)}
              variant={expiry === exp ? 'default' : 'outline'}
              size="sm"
              className={expiry === exp ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' : 'border-slate-600 text-slate-300 hover:border-blue-500/50'}
            >
              {exp}
            </Button>
          ))}
        </div>
      </div>

      {/* Options Chain */}
      <div className="overflow-x-auto bg-slate-900/50 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-800/50">
            <tr className="border-b-2 border-slate-600">
              <th className="text-left p-3 text-green-400 font-bold text-xs tracking-wider" colSpan="5">CALLS</th>
              <th className="text-center p-3 text-white font-bold text-sm bg-blue-600/20">STRIKE</th>
              <th className="text-right p-3 text-red-400 font-bold text-xs tracking-wider" colSpan="5">PUTS</th>
            </tr>
            <tr className="border-b border-slate-700 text-xs text-slate-400 bg-slate-800/30">
              <th className="p-2 font-medium">Premium</th>
              <th className="p-2 font-medium">Delta</th>
              <th className="p-2 font-medium">Gamma</th>
              <th className="p-2 font-medium">Theta</th>
              <th className="p-2"></th>
              <th className="text-center p-2 font-bold text-white">Price</th>
              <th className="p-2"></th>
              <th className="p-2 font-medium">Premium</th>
              <th className="p-2 font-medium">Delta</th>
              <th className="p-2 font-medium">Gamma</th>
              <th className="p-2 font-medium">Theta</th>
            </tr>
          </thead>
          <tbody>
            {strikes.map(strike => {
              const callGreeks = calculateGreeks(livePrice, strike, T, r, sigma, true);
              const putGreeks = calculateGreeks(livePrice, strike, T, r, sigma, false);
              const callMoneyness = getMoneyness(strike, true);
              const putMoneyness = getMoneyness(strike, false);

              const rowBgClass = callMoneyness === 'ATM' 
                ? 'bg-yellow-500/5 border-l-2 border-yellow-500/50' 
                : callMoneyness === 'ITM' 
                ? 'bg-green-500/5 hover:bg-green-500/10' 
                : 'hover:bg-slate-800/70';

              return (
                <tr key={strike} className={`border-b border-slate-800/50 ${rowBgClass} transition-colors`}>
                  {/* CALL */}
                  <td className="p-3">
                    <motion.span 
                      key={callGreeks.price}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-green-400 font-bold text-base"
                    >
                      ${callGreeks.price.toFixed(2)}
                    </motion.span>
                  </td>
                  <td className="p-3">
                    <span className={`font-semibold ${callGreeks.delta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {callGreeks.delta.toFixed(3)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-blue-300 font-medium">{callGreeks.gamma.toFixed(4)}</span>
                  </td>
                  <td className="p-3 text-red-400 font-medium">{callGreeks.theta.toFixed(3)}</td>
                  <td className="p-3">
                    <Button
                      onClick={() => {
                        if (window.confirm(`Confirm CALL purchase?\n\nStrike: $${strike}\nPremium: $${callGreeks.price.toFixed(2)}\nExpires: ${daysToExpiry}d`)) {
                          onTrade(ticker, 'call', strike, callGreeks.price, daysToExpiry, callGreeks);
                        }
                      }}
                      disabled={playerBalance < callGreeks.price}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs px-3 py-1.5 shadow-md font-bold"
                    >
                      BUY
                    </Button>
                  </td>

                  {/* STRIKE */}
                  <td className="text-center p-3 bg-slate-800/50">
                    <div className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-black text-sm transition-all shadow-md ${
                      callMoneyness === 'ATM' ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white border-2 border-yellow-400/50 shadow-yellow-500/30' :
                      callMoneyness === 'ITM' ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-300 border border-green-500/50' :
                      'bg-slate-700/50 text-slate-300 border border-slate-600'
                    }`}>
                      ${strike.toFixed(strike < 1 ? 6 : 2)}
                    </div>
                  </td>

                  {/* PUT */}
                  <td className="p-3">
                    <Button
                      onClick={() => {
                        if (window.confirm(`Confirm PUT purchase?\n\nStrike: $${strike}\nPremium: $${putGreeks.price.toFixed(2)}\nExpires: ${daysToExpiry}d`)) {
                          onTrade(ticker, 'put', strike, putGreeks.price, daysToExpiry, putGreeks);
                        }
                      }}
                      disabled={playerBalance < putGreeks.price}
                      size="sm"
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-xs px-3 py-1.5 shadow-md font-bold"
                    >
                      BUY
                    </Button>
                  </td>
                  <td className="p-3">
                    <motion.span
                      key={putGreeks.price}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-red-400 font-bold text-base"
                    >
                      ${putGreeks.price.toFixed(2)}
                    </motion.span>
                  </td>
                  <td className="p-3">
                    <span className={`font-semibold ${putGreeks.delta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {putGreeks.delta.toFixed(3)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-blue-300 font-medium">{putGreeks.gamma.toFixed(4)}</span>
                  </td>
                  <td className="p-3 text-red-400 font-medium">{putGreeks.theta.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Greeks Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700">
        <div className="p-3 bg-slate-900/70 rounded-lg border border-green-500/20">
          <p className="text-green-400 font-bold mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Delta (Δ)
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">Price sensitivity to $1 move</p>
        </div>
        <div className="p-3 bg-slate-900/70 rounded-lg border border-blue-500/20">
          <p className="text-blue-400 font-bold mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Gamma (Γ)
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">Delta acceleration rate</p>
        </div>
        <div className="p-3 bg-slate-900/70 rounded-lg border border-red-500/20">
          <p className="text-red-400 font-bold mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Theta (Θ)
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">Daily time decay</p>
        </div>
        <div className="p-3 bg-slate-900/70 rounded-lg border border-purple-500/20">
          <p className="text-purple-400 font-bold mb-1">Vega (ν)</p>
          <p className="text-slate-300 text-xs leading-relaxed">Volatility impact</p>
        </div>
      </div>
    </div>
  );
}