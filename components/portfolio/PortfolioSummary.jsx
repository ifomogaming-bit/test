import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Trophy, PiggyBank } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function PortfolioSummary({ portfolio, stockPrices, player }) {
  const totalValue = portfolio.reduce((sum, h) => {
    const price = stockPrices[h.ticker] || h.avg_acquisition_price || 0;
    return sum + (h.shares * price);
  }, 0);

  const totalInvested = portfolio.reduce((sum, h) => sum + (h.total_invested || 0), 0);
  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const pieData = portfolio.map(h => ({
    name: h.ticker,
    value: h.shares * (stockPrices[h.ticker] || h.avg_acquisition_price || 0)
  })).filter(d => d.value > 0);

  const stats = [
    { label: 'Total Value', value: `$${totalValue.toFixed(2)}`, icon: Wallet, color: 'text-blue-400' },
    { label: 'Total Gain', value: `${totalGain >= 0 ? '+' : ''}$${totalGain.toFixed(2)}`, icon: TrendingUp, color: totalGain >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Holdings', value: portfolio.length, icon: Trophy, color: 'text-purple-400' },
    { label: 'Stock Coins', value: player?.soft_currency || 0, icon: PiggyBank, color: 'text-yellow-400' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-6">Portfolio Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900/50 rounded-xl p-4 border border-slate-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-slate-400 text-sm">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="flex items-center gap-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-2">
            {pieData.slice(0, 6).map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-white text-sm font-medium">{item.name}</span>
                <span className="text-slate-400 text-xs">${item.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}