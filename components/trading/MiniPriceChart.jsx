import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function MiniPriceChart({ priceHistory, currentPrice, color = '#22c55e' }) {
  // Ensure price history is properly formatted
  const validHistory = Array.isArray(priceHistory) ? priceHistory.filter(p => p && typeof p.price === 'number' && !isNaN(p.price)) : [];
  
  if (!validHistory || validHistory.length === 0) {
    // Generate simulated history if no data
    if (currentPrice && !isNaN(currentPrice)) {
      const simData = [];
      let price = currentPrice * 0.95;
      for (let i = 0; i < 20; i++) {
        const change = (Math.random() - 0.5) * 0.02 * price;
        price = Math.max(price + change, currentPrice * 0.9);
        simData.push({
          price: price,
          timestamp: Date.now() - (20 - i) * 60000
        });
      }
      simData[simData.length - 1].price = currentPrice;
      
      return (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={simData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <YAxis domain={['auto', 'auto']} hide />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    return (
      <div className="h-10 w-full flex items-center justify-center">
        <div className="text-xs text-slate-500">Loading...</div>
      </div>
    );
  }

  const data = validHistory.slice(-20).map((point, idx) => ({
    price: typeof point === 'object' ? point.price : point,
    timestamp: typeof point === 'object' ? point.timestamp : Date.now() - (20 - idx) * 60000
  }));

  // Ensure current price is reflected
  if (currentPrice && data.length > 0) {
    data[data.length - 1].price = currentPrice;
  }

  // Calculate domain for Y-axis with better scaling
  const prices = data.map(d => d.price).filter(p => p && !isNaN(p));
  if (prices.length === 0) return null;
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  const padding = range > 0 ? range * 0.15 : maxPrice * 0.1;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <YAxis 
          domain={[minPrice - padding, maxPrice + padding]} 
          hide 
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}