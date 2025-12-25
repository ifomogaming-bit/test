import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export default function PortfolioCard({ holding, currentPrice, priceHistory = [] }) {
  const { ticker, shares, avg_acquisition_price } = holding;
  const currentValue = shares * (currentPrice || avg_acquisition_price);
  const gainLoss = currentPrice ? (currentPrice - avg_acquisition_price) * shares : 0;
  const gainLossPercent = avg_acquisition_price ? ((currentPrice - avg_acquisition_price) / avg_acquisition_price) * 100 : 0;
  const isPositive = gainLoss >= 0;

  // Generate mock price history if not provided
  const chartData = priceHistory.length > 0 ? priceHistory : 
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      price: (currentPrice || avg_acquisition_price) * (0.9 + Math.random() * 0.2)
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-white">{ticker}</h3>
          <p className="text-slate-400 text-sm">{shares.toFixed(4)} shares</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {gainLossPercent.toFixed(2)}%
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-16 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#22c55e' : '#ef4444'} 
              strokeWidth={2}
              dot={false}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#1e293b', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-slate-400 text-xs">Current Value</p>
          <p className="text-xl font-bold text-white">${currentValue.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs">P/L</p>
          <p className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{gainLoss.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}