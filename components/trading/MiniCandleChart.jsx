import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LineChart as LineIcon, BarChart3 } from 'lucide-react';

export default function MiniCandleChart({ ticker, currentPrice, basePrice, isCrypto }) {
  const [chartType, setChartType] = useState('candle');
  const [candles, setCandles] = useState([]);

  useEffect(() => {
    generateCandles();
  }, [ticker, currentPrice]);

  const generateCandles = () => {
    const candleCount = 24;
    const newCandles = [];
    const volatility = isCrypto ? 0.008 : 0.004;
    
    let price = basePrice * (0.98 + Math.random() * 0.04);
    
    for (let i = 0; i < candleCount; i++) {
      const progress = i / candleCount;
      const trendToTarget = (currentPrice - price) / (candleCount - i);
      
      const openPrice = price;
      const closePrice = openPrice + trendToTarget + (Math.random() - 0.5) * 2 * volatility * openPrice;
      
      const candleVolatility = volatility * openPrice;
      const highPrice = Math.max(openPrice, closePrice) + Math.random() * candleVolatility;
      const lowPrice = Math.min(openPrice, closePrice) - Math.random() * candleVolatility;
      
      newCandles.push({
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        close: closePrice,
        isGreen: closePrice >= openPrice
      });
      
      price = closePrice;
    }
    
    // Last candle matches current price
    newCandles[newCandles.length - 1].close = currentPrice;
    newCandles[newCandles.length - 1].high = Math.max(newCandles[newCandles.length - 1].high, currentPrice);
    newCandles[newCandles.length - 1].low = Math.min(newCandles[newCandles.length - 1].low, currentPrice);
    
    setCandles(newCandles);
  };

  const maxPrice = Math.max(...candles.map(c => c.high));
  const minPrice = Math.min(...candles.map(c => c.low));
  const priceRange = maxPrice - minPrice;

  const getCandleY = (price) => {
    return ((maxPrice - price) / priceRange) * 100;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-xs font-medium">Price Chart</p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={chartType === 'line' ? 'default' : 'ghost'}
            onClick={() => setChartType('line')}
            className="h-6 px-2"
          >
            <LineIcon className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={chartType === 'candle' ? 'default' : 'ghost'}
            onClick={() => setChartType('candle')}
            className="h-6 px-2"
          >
            <BarChart3 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="relative h-24 bg-slate-900/50 rounded-lg p-2 overflow-hidden">
        {chartType === 'line' ? (
          // Line Chart
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`gradient-${ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={candles[candles.length - 1]?.isGreen ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={candles[candles.length - 1]?.isGreen ? '#22c55e' : '#ef4444'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              fill={`url(#gradient-${ticker})`}
              stroke={candles[candles.length - 1]?.isGreen ? '#22c55e' : '#ef4444'}
              strokeWidth="1.5"
              points={`0,100 ${candles.map((c, i) => {
                const x = (i / (candles.length - 1)) * 100;
                const y = getCandleY(c.close);
                return `${x},${y}`;
              }).join(' ')} 100,100`}
            />
          </svg>
        ) : (
          // Candlestick Chart
          <div className="h-full flex items-end gap-0.5">
            {candles.map((candle, idx) => {
              const bodyTop = getCandleY(Math.max(candle.open, candle.close));
              const bodyBottom = getCandleY(Math.min(candle.open, candle.close));
              const bodyHeight = bodyBottom - bodyTop;
              const wickTop = getCandleY(candle.high);
              const wickBottom = getCandleY(candle.low);
              
              return (
                <div key={idx} className="flex-1 relative" style={{ minWidth: '2px' }}>
                  {/* Wick */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-px ${candle.isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{
                      top: `${wickTop}%`,
                      height: `${wickBottom - wickTop}%`
                    }}
                  />
                  {/* Body */}
                  <div
                    className={`absolute left-0 right-0 ${candle.isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{
                      top: `${bodyTop}%`,
                      height: `${Math.max(bodyHeight, 1)}%`
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
        
        {/* Current Price Indicator */}
        <div
          className="absolute right-2 text-[10px] text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-blue-400"
          style={{ top: `${getCandleY(currentPrice)}%`, transform: 'translateY(-50%)' }}
        >
          ${currentPrice.toFixed(currentPrice < 1 ? 6 : 2)}
        </div>
      </div>
    </div>
  );
}