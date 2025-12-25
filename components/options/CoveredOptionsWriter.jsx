import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { calculateGreeks } from './OptionGreeks';

export default function CoveredOptionsWriter({ portfolio, currentPrices, onWrite, onClose }) {
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [strikePrice, setStrikePrice] = useState('');
  const [contracts, setContracts] = useState(1);
  const [expiry, setExpiry] = useState(7);
  const [optionType, setOptionType] = useState('call'); // call or put

  const holding = portfolio.find(p => p.ticker === selectedHolding);
  const currentPrice = currentPrices[selectedHolding] || 100;
  const maxContracts = holding ? Math.floor(holding.shares / 100) : 0;

  const handleWrite = () => {
    if (!holding || !strikePrice || contracts > maxContracts) return;

    const T = expiry / 365;
    const greeks = calculateGreeks(currentPrice, parseFloat(strikePrice), T, 0.05, 0.3, optionType === 'call');

    onWrite({
      ticker: selectedHolding,
      contractType: optionType,
      strikePrice: parseFloat(strikePrice),
      premium: greeks.price,
      contracts: parseInt(contracts),
      expiry,
      greeks,
      currentPrice
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Write Covered Options
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
              <p className="text-blue-300 text-sm">
                Write covered options using your portfolio shares. Earn premium upfront, but your shares may be assigned if exercised.
              </p>
            </div>
          </div>

          {/* Option Type */}
          <div>
            <label className="text-slate-400 text-sm mb-2 block">Option Type</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setOptionType('call')}
                variant={optionType === 'call' ? 'default' : 'outline'}
                className={optionType === 'call' ? 'bg-green-600' : 'border-slate-600'}
              >
                Covered Call
              </Button>
              <Button
                onClick={() => setOptionType('put')}
                variant={optionType === 'put' ? 'default' : 'outline'}
                className={optionType === 'put' ? 'bg-red-600' : 'border-slate-600'}
              >
                Cash-Secured Put
              </Button>
            </div>
          </div>

          {/* Stock Selection */}
          <div>
            <label className="text-slate-400 text-sm mb-2 block">Select Holding</label>
            <div className="grid grid-cols-2 gap-2">
              {portfolio.filter(p => p.shares >= 100).map(p => (
                <button
                  key={p.ticker}
                  onClick={() => {
                    setSelectedHolding(p.ticker);
                    setStrikePrice(currentPrices[p.ticker]?.toFixed(2) || '');
                  }}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedHolding === p.ticker
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <p className="text-white font-bold">{p.ticker}</p>
                  <p className="text-slate-400 text-sm">{p.shares.toFixed(2)} shares</p>
                  <p className="text-green-400 text-xs">{Math.floor(p.shares / 100)} contracts available</p>
                </button>
              ))}
            </div>
          </div>

          {selectedHolding && (
            <>
              {/* Strike & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Strike Price</label>
                  <Input
                    type="number"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                    placeholder="Strike"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <p className="text-slate-500 text-xs mt-1">Current: ${currentPrice.toFixed(2)}</p>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Expiry (days)</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(parseInt(e.target.value))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              {/* Contracts */}
              <div>
                <label className="text-slate-400 text-sm mb-2 block">
                  Number of Contracts (Max: {maxContracts})
                </label>
                <Input
                  type="number"
                  value={contracts}
                  onChange={(e) => setContracts(Math.min(parseInt(e.target.value) || 1, maxContracts))}
                  min={1}
                  max={maxContracts}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-slate-500 text-xs mt-1">
                  {contracts * 100} shares will be locked as collateral
                </p>
              </div>

              {/* Premium Preview */}
              {strikePrice && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Premium Preview</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Premium per contract:</span>
                    <span className="text-green-400 font-bold text-xl">
                      ${calculateGreeks(currentPrice, parseFloat(strikePrice), expiry / 365, 0.05, 0.3, optionType === 'call').price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white">Total Premium:</span>
                    <span className="text-green-400 font-bold text-2xl">
                      ${(calculateGreeks(currentPrice, parseFloat(strikePrice), expiry / 365, 0.05, 0.3, optionType === 'call').price * contracts).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleWrite}
                disabled={!strikePrice || contracts > maxContracts || contracts < 1}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6"
              >
                Write {contracts} {optionType === 'call' ? 'Covered Call' : 'Cash-Secured Put'} Contract{contracts > 1 ? 's' : ''}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}