import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Activity, Coins, BarChart3, TrendingUp, TrendingDown,
  PieChart, Bitcoin
} from 'lucide-react';
import { 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap 
} from 'recharts';
import { calculatePerformance } from '@/components/portfolio/PriceService';

export default function PortfolioTab({ portfolio, player, realTimePrices = {}, transactions = [] }) {
  const portfolioMetrics = portfolio.map(holding => {
    const currentPrice = realTimePrices[holding.ticker] || holding.avg_acquisition_price;
    const perf = calculatePerformance(holding, currentPrice);
    return {
      ...holding,
      currentPrice,
      ...perf,
      isCrypto: holding.ticker.includes('-USD')
    };
  });

  const totalValue = portfolioMetrics.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = portfolioMetrics.reduce((sum, h) => sum + h.costBasis, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const stocksValue = portfolioMetrics.filter(h => !h.isCrypto).reduce((sum, h) => sum + h.currentValue, 0);
  const cryptoValue = portfolioMetrics.filter(h => h.isCrypto).reduce((sum, h) => sum + h.currentValue, 0);

  const assetBreakdown = [
    { name: 'Stocks', value: stocksValue, color: '#3b82f6' },
    { name: 'Crypto', value: cryptoValue, color: '#a855f7' }
  ].filter(item => item.value > 0);

  const topHoldings = portfolioMetrics
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 6)
    .map((h, i) => ({
      name: h.ticker,
      value: h.currentValue,
      color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][i]
    }));

  const portfolioHistory = Array.from({ length: 30 }, (_, i) => {
    const daysAgo = 29 - i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const variance = (Math.random() - 0.5) * 0.1;
    const value = totalValue * (0.85 + variance + (i / 30) * 0.15);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value)
    };
  });

  const sectorBreakdown = portfolioMetrics.reduce((acc, holding) => {
    let sector = 'Other';
    const ticker = holding.ticker.toUpperCase();
    
    if (['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'AMD', 'INTC', 'META'].includes(ticker)) sector = 'Technology';
    else if (['JPM', 'BAC', 'GS', 'V', 'MA'].includes(ticker)) sector = 'Finance';
    else if (['TSLA', 'F', 'GM'].includes(ticker)) sector = 'Automotive';
    else if (['AMZN', 'WMT', 'TGT'].includes(ticker)) sector = 'Retail';
    else if (holding.isCrypto) sector = 'Crypto';
    
    acc[sector] = (acc[sector] || 0) + holding.currentValue;
    return acc;
  }, {});

  const sectorData = Object.entries(sectorBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const sectorColors = {
    'Technology': '#3b82f6',
    'Finance': '#10b981',
    'Automotive': '#f59e0b',
    'Retail': '#ec4899',
    'Crypto': '#a855f7',
    'Other': '#6b7280'
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400 text-sm">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400 text-sm">Total Gain/Loss</span>
          </div>
          <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400 text-sm">Cash Balance</span>
          </div>
          <p className="text-3xl font-bold text-white">{player?.soft_currency?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <span className="text-slate-400 text-sm">Holdings</span>
          </div>
          <p className="text-3xl font-bold text-white">{portfolio.length}</p>
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-4">
        {portfolioMetrics.length > 0 ? (
          portfolioMetrics.map((holding, index) => (
            <motion.div
              key={holding.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {holding.isCrypto ? (
                    <Bitcoin className="w-10 h-10 text-purple-400" />
                  ) : (
                    <TrendingUp className="w-10 h-10 text-blue-400" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{holding.ticker}</h3>
                    <p className="text-slate-400 text-sm">
                      {holding.shares.toFixed(4)} shares
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    ${holding.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center gap-1 justify-end ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.gain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-medium">
                      {holding.gain >= 0 ? '+' : ''}${Math.abs(holding.gain).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      ({holding.gain >= 0 ? '+' : ''}{holding.gainPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Current Price</p>
                  <p className="text-white font-bold">${holding.currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Avg Buy Price</p>
                  <p className="text-white font-bold">${holding.avg_acquisition_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Invested</p>
                  <p className="text-white font-bold">${holding.costBasis.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Unrealized P/L</p>
                  <p className={`font-bold ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.gain >= 0 ? '+' : ''}${Math.abs(holding.gain).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700">
            <PieChart className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">No holdings yet. Start trading to build your portfolio!</p>
          </div>
        )}
      </div>

      {/* Charts */}
      {portfolioMetrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Portfolio Value (30 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={portfolioHistory}>
                <defs>
                  <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#valueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Asset Allocation</h3>
            {assetBreakdown.length > 0 ? (
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="50%" height={200}>
                  <RePieChart>
                    <Pie
                      data={assetBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assetBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {assetBreakdown.map((asset, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: asset.color }} />
                      <div>
                        <p className="text-white font-medium">{asset.name}</p>
                        <p className="text-slate-400 text-sm">
                          ${asset.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          <span className="ml-2 text-xs">
                            ({((asset.value / totalValue) * 100).toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
          {transactions.length > 0 ? (
            transactions.slice(0, 20).map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{tx.description}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(tx.created_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {tx.soft_currency_change !== 0 && (
                      <p className={`font-bold ${tx.soft_currency_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.soft_currency_change > 0 ? '+' : ''}{tx.soft_currency_change.toLocaleString()} coins
                      </p>
                    )}
                    {tx.shares_change !== 0 && tx.stock_ticker && (
                      <p className="text-blue-400 text-sm">
                        {tx.shares_change > 0 ? '+' : ''}{tx.shares_change.toFixed(4)} {tx.stock_ticker}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <Activity className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}