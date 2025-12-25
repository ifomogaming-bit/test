import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TIMEFRAMES = [
  { label: '1M', value: 1, resolution: 1 },
  { label: '5M', value: 5, resolution: 5 },
  { label: '15M', value: 15, resolution: 15 },
  { label: '1H', value: 60, resolution: 60 },
  { label: '4H', value: 240, resolution: 240 },
  { label: '1D', value: 1440, resolution: 1440 }
];

export default function CandlestickChart({ ticker, currentPrice, basePrice, isCrypto }) {
  const [timeframe, setTimeframe] = useState(15); // Default 15M
  const [candles, setCandles] = useState([]);
  const [dayHigh, setDayHigh] = useState(currentPrice);
  const [dayLow, setDayLow] = useState(currentPrice);
  const [dayOpen, setDayOpen] = useState(basePrice);

  useEffect(() => {
    generateCandles();
  }, [timeframe, ticker, currentPrice]);

  const generateCandles = () => {
    const candleCount = 50;
    const newCandles = [];
    const volatility = isCrypto ? 0.015 : 0.008;
    
    let high = currentPrice;
    let low = currentPrice;
    let open = basePrice * (0.98 + Math.random() * 0.04); // Day open with slight variance
    
    for (let i = 0; i < candleCount; i++) {
      const progress = i / candleCount;
      const trendToTarget = (currentPrice - open) / candleCount;
      
      const openPrice = i === 0 ? open : newCandles[i - 1].close;
      const closePrice = openPrice + trendToTarget + (Math.random() - 0.5) * 2 * volatility * openPrice;
      
      const candleVolatility = volatility * openPrice;
      const highPrice = Math.max(openPrice, closePrice) + Math.random() * candleVolatility;
      const lowPrice = Math.min(openPrice, closePrice) - Math.random() * candleVolatility;
      
      high = Math.max(high, highPrice);
      low = Math.min(low, lowPrice);
      
      newCandles.push({
        time: Date.now() - (candleCount - i) * timeframe * 60000,
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        close: closePrice,
        isGreen: closePrice >= openPrice
      });
    }
    
    // Last candle should match current price
    newCandles[newCandles.length - 1].close = currentPrice;
    newCandles[newCandles.length - 1].high = Math.max(newCandles[newCandles.length - 1].high, currentPrice);
    newCandles[newCandles.length - 1].low = Math.min(newCandles[newCandles.length - 1].low, currentPrice);
    
    setCandles(newCandles);
    setDayHigh(high);
    setDayLow(low);
    setDayOpen(open);
  };

  const maxPrice = Math.max(...candles.map(c => c.high));
  const minPrice = Math.min(...candles.map(c => c.low));
  const priceRange = maxPrice - minPrice;

  const getCandleY = (price) => {
    return ((maxPrice - price) / priceRange) * 100;
  };

  const dayChange = currentPrice - dayOpen;
  const dayChangePercent = (dayChange / dayOpen) * 100;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{ticker} Chart</CardTitle>
          <div className="flex gap-1">
            {TIMEFRAMES.map(tf => (
              <Button
                key={tf.value}
                size="sm"
                variant={timeframe === tf.value ? 'default' : 'outline'}
                onClick={() => setTimeframe(tf.value)}
                className={timeframe === tf.value ? 'bg-blue-600' : 'border-slate-600 text-slate-400'}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Current Price & Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-slate-400 text-xs">Current Price</p>
            <p className="text-white text-xl font-bold">${currentPrice.toFixed(currentPrice < 1 ? 6 : 2)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Day Change</p>
            <div className={`flex items-center gap-1 text-lg font-bold ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dayChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {dayChange >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Day High</p>
            <p className="text-green-400 text-lg font-bold">${dayHigh.toFixed(currentPrice < 1 ? 6 : 2)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Day Low</p>
            <p className="text-red-400 text-lg font-bold">${dayLow.toFixed(currentPrice < 1 ? 6 : 2)}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative h-96 bg-slate-900/50 rounded-lg p-4">
          {/* Price Labels */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-400">
            <span>${maxPrice.toFixed(2)}</span>
            <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
            <span>${minPrice.toFixed(2)}</span>
          </div>
          
          {/* Candlesticks */}
          <div className="ml-16 h-full flex items-end gap-0.5">
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
                      height: `${Math.max(bodyHeight, 0.5)}%`
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Current Price Line */}
          <div
            className="absolute right-0 border-t-2 border-dashed border-blue-400 ml-16"
            style={{
              top: `${getCandleY(currentPrice)}%`,
              left: '4rem',
              right: 0
            }}
          >
            <span className="absolute right-2 -top-3 text-xs text-blue-400 bg-slate-900 px-2 py-0.5 rounded">
              ${currentPrice.toFixed(currentPrice < 1 ? 6 : 2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}