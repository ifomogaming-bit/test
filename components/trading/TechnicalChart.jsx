import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function TechnicalChart({ priceHistory, ticker, currentPrice }) {
  const [indicator, setIndicator] = useState('price');
  const [timeframe, setTimeframe] = useState('1h');

  // Calculate SMA (Simple Moving Average)
  const calculateSMA = (data, period) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, sma: null };
      const sum = data.slice(index - period + 1, index + 1).reduce((acc, d) => acc + d.price, 0);
      return { ...item, sma: sum / period };
    });
  };

  // Calculate RSI (Relative Strength Index)
  const calculateRSI = (data, period = 14) => {
    let gains = 0, losses = 0;
    
    return data.map((item, index) => {
      if (index === 0) return { ...item, rsi: 50 };
      
      const change = item.price - data[index - 1].price;
      if (change > 0) gains += change;
      else losses += Math.abs(change);
      
      if (index < period) return { ...item, rsi: 50 };
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      return { ...item, rsi };
    });
  };

  // Calculate MACD
  const calculateMACD = (data) => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    
    return data.map((item, index) => ({
      ...item,
      macd: ema12[index] - ema26[index],
      signal: index < 9 ? 0 : calculateEMA(data.slice(0, index + 1).map((d, i) => ema12[i] - ema26[i]), 9)[index]
    }));
  };

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    let ema = data[0].price;
    
    return data.map(item => {
      ema = item.price * k + ema * (1 - k);
      return ema;
    });
  };

  let chartData = priceHistory.map((item, index) => ({
    ...item,
    time: index,
    price: item.price
  }));

  if (indicator === 'sma') {
    chartData = calculateSMA(chartData, 10);
  } else if (indicator === 'rsi') {
    chartData = calculateRSI(chartData);
  } else if (indicator === 'volume') {
    chartData = chartData.map(item => ({
      ...item,
      volume: Math.random() * 1000000
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={indicator === 'price' ? 'default' : 'outline'}
            onClick={() => setIndicator('price')}
          >
            Price
          </Button>
          <Button
            size="sm"
            variant={indicator === 'sma' ? 'default' : 'outline'}
            onClick={() => setIndicator('sma')}
          >
            SMA
          </Button>
          <Button
            size="sm"
            variant={indicator === 'rsi' ? 'default' : 'outline'}
            onClick={() => setIndicator('rsi')}
          >
            RSI
          </Button>
          <Button
            size="sm"
            variant={indicator === 'volume' ? 'default' : 'outline'}
            onClick={() => setIndicator('volume')}
          >
            Volume
          </Button>
        </div>

        <div className="flex gap-2">
          {['1h', '4h', '1d', '1w'].map(tf => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? 'default' : 'outline'}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={300}>
          {indicator === 'volume' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="volume" fill="#3b82f6" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
              />
              {indicator === 'sma' && (
                <Line 
                  type="monotone" 
                  dataKey="sma" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {indicator === 'rsi' && (
                <Line 
                  type="monotone" 
                  dataKey="rsi" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Current</p>
          <p className="text-white font-bold">${currentPrice.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">High</p>
          <p className="text-green-400 font-bold">
            ${Math.max(...chartData.map(d => d.price)).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Low</p>
          <p className="text-red-400 font-bold">
            ${Math.min(...chartData.map(d => d.price)).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Change</p>
          <p className={`font-bold ${chartData[chartData.length - 1]?.price > chartData[0]?.price ? 'text-green-400' : 'text-red-400'}`}>
            {(((chartData[chartData.length - 1]?.price - chartData[0]?.price) / chartData[0]?.price) * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}