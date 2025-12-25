import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateSMA, calculateEMA, calculateRSI, calculateBollingerBands } from './TechnicalIndicators';

export default function EnhancedChart({ priceHistory, ticker, currentPrice }) {
  const [indicators, setIndicators] = useState({
    sma20: true,
    ema12: false,
    rsi: false,
    bb: false
  });

  const toggleIndicator = (ind) => {
    setIndicators(prev => ({ ...prev, [ind]: !prev[ind] }));
  };

  const sma20 = indicators.sma20 ? calculateSMA(priceHistory, 20) : [];
  const ema12 = indicators.ema12 ? calculateEMA(priceHistory, 12) : [];
  const rsi = indicators.rsi ? calculateRSI(priceHistory) : [];
  const bb = indicators.bb ? calculateBollingerBands(priceHistory) : null;

  const chartData = priceHistory.map((p, i) => ({
    time: i,
    price: p.price,
    sma20: sma20[i - 19]?.value,
    ema12: ema12[i - 11]?.value,
    bbUpper: bb?.upper[i - 19]?.value,
    bbLower: bb?.lower[i - 19]?.value
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={indicators.sma20 ? 'default' : 'outline'}
          onClick={() => toggleIndicator('sma20')}
          className={indicators.sma20 ? 'bg-blue-600' : 'border-slate-600'}
        >
          SMA(20)
        </Button>
        <Button
          size="sm"
          variant={indicators.ema12 ? 'default' : 'outline'}
          onClick={() => toggleIndicator('ema12')}
          className={indicators.ema12 ? 'bg-purple-600' : 'border-slate-600'}
        >
          EMA(12)
        </Button>
        <Button
          size="sm"
          variant={indicators.rsi ? 'default' : 'outline'}
          onClick={() => toggleIndicator('rsi')}
          className={indicators.rsi ? 'bg-orange-600' : 'border-slate-600'}
        >
          RSI
        </Button>
        <Button
          size="sm"
          variant={indicators.bb ? 'default' : 'outline'}
          onClick={() => toggleIndicator('bb')}
          className={indicators.bb ? 'bg-green-600' : 'border-slate-600'}
        >
          Bollinger Bands
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Price" />
          {indicators.sma20 && <Line type="monotone" dataKey="sma20" stroke="#8b5cf6" strokeWidth={1} dot={false} name="SMA(20)" />}
          {indicators.ema12 && <Line type="monotone" dataKey="ema12" stroke="#ec4899" strokeWidth={1} dot={false} name="EMA(12)" />}
          {indicators.bb && (
            <>
              <Line type="monotone" dataKey="bbUpper" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Upper" />
              <Line type="monotone" dataKey="bbLower" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Lower" />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {indicators.rsi && rsi.length > 0 && (
        <div>
          <p className="text-white text-sm mb-2">RSI: <Badge className={rsi[rsi.length - 1]?.value > 70 ? 'bg-red-500/20 text-red-400' : rsi[rsi.length - 1]?.value < 30 ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
            {rsi[rsi.length - 1]?.value?.toFixed(2)}
          </Badge></p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={rsi.map((r, i) => ({ time: i, value: r.value }))}>
              <XAxis dataKey="time" stroke="#94a3b8" hide />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}