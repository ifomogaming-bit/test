import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  DollarSign,
  PieChart,
  Activity,
  BarChart3,
  Coins,
  Bitcoin,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap } from 'recharts';
import { fetchMultiplePrices, calculatePerformance } from '@/components/portfolio/PriceService';
import RiskAnalyzer from '@/components/portfolio/RiskAnalyzer';
import BacktestSimulator from '@/components/portfolio/BacktestSimulator';

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [comparisonTarget, setComparisonTarget] = useState('none');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: player } = useQuery({
    queryKey: ['player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      return players[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Portfolio.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const txs = await base44.entities.Transaction.filter({ player_id: player.id });
      return txs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!player?.id
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      return base44.entities.Player.list('-soft_currency', 50);
    }
  });

  // Fetch real-time prices with Alpha Vantage
  useEffect(() => {
    const fetchPrices = async () => {
      if (portfolio.length === 0) return;
      
      setLoading(true);
      const tickers = portfolio.map(p => p.ticker);
      const prices = await fetchMultiplePrices(tickers);
      setRealTimePrices(prices);
      setLoading(false);
    };

    fetchPrices();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchPrices, 120000);
    return () => clearInterval(interval);
  }, [portfolio]);

  const handleRefresh = async () => {
    setLoading(true);
    const tickers = portfolio.map(p => p.ticker);
    const prices = await fetchMultiplePrices(tickers);
    setRealTimePrices(prices);
    setLoading(false);
  };

  // Calculate portfolio metrics
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

  // Asset type breakdown
  const stocksValue = portfolioMetrics.filter(h => !h.isCrypto).reduce((sum, h) => sum + h.currentValue, 0);
  const cryptoValue = portfolioMetrics.filter(h => h.isCrypto).reduce((sum, h) => sum + h.currentValue, 0);

  const assetBreakdown = [
    { name: 'Stocks', value: stocksValue, color: '#3b82f6' },
    { name: 'Crypto', value: cryptoValue, color: '#a855f7' }
  ].filter(item => item.value > 0);

  // Top holdings for pie chart
  const topHoldings = portfolioMetrics
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 6)
    .map((h, i) => ({
      name: h.ticker,
      value: h.currentValue,
      color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][i]
    }));

  // Simulated portfolio value over time (last 30 days)
  const portfolioHistory = Array.from({ length: 30 }, (_, i) => {
    const daysAgo = 29 - i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Simulate historical value with some variance
    const variance = (Math.random() - 0.5) * 0.1;
    const value = totalValue * (0.85 + variance + (i / 30) * 0.15);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value)
    };
  });

  // Performance breakdown by holding
  const performanceData = portfolioMetrics.map(h => ({
    ticker: h.ticker,
    gain: h.gain,
    gainPercent: h.gainPercent
  })).sort((a, b) => b.gain - a.gain);

  // Trade impact analysis
  const tradeImpacts = transactions
    .filter(tx => tx.stock_ticker && tx.shares_change !== 0)
    .slice(0, 20)
    .reverse()
    .map((tx, index) => {
      const beforeValue = index === 0 ? totalCost : totalValue * (0.85 + Math.random() * 0.15);
      const change = tx.soft_currency_change || 0;
      const afterValue = beforeValue - change;
      
      return {
        date: new Date(tx.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ticker: tx.stock_ticker,
        beforeValue: Math.round(beforeValue),
        afterValue: Math.round(afterValue),
        impact: Math.round(afterValue - beforeValue),
        type: tx.shares_change > 0 ? 'buy' : 'sell'
      };
    });

  // Market comparison data (simulated S&P 500 index)
  const marketComparison = portfolioHistory.map((point, i) => {
    const marketValue = 1000 * (0.95 + (i / 30) * 0.08 + (Math.random() - 0.5) * 0.03);
    const myReturn = ((point.value - portfolioHistory[0].value) / portfolioHistory[0].value) * 100;
    const marketReturn = ((marketValue - 950) / 950) * 100;
    
    return {
      date: point.date,
      myPortfolio: parseFloat(myReturn.toFixed(2)),
      market: parseFloat(marketReturn.toFixed(2))
    };
  });

  // Top traders comparison
  const topTraders = allPlayers
    .filter(p => p.id !== player?.id)
    .slice(0, 5)
    .map((p, i) => ({
      name: p.username,
      value: p.soft_currency || 0,
      rank: i + 1
    }));

  const topTraderComparison = [
    { name: 'You', value: totalValue + (player?.soft_currency || 0), color: '#3b82f6' },
    ...topTraders.map(t => ({ ...t, color: '#94a3b8' }))
  ].sort((a, b) => b.value - a.value);

  // Sector allocation (simulated based on tickers)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-x-hidden p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="border-blue-500/50 text-white hover:bg-blue-500/20 hover:border-blue-400 shadow-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <PieChart className="w-8 h-8 text-blue-400" />
                Portfolio
              </h1>
              <p className="text-slate-400">Track your investments and performance</p>
            </div>
          </div>

          <Button 
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="border-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Prices
          </Button>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Total Value</span>
            </div>
            <p className="text-3xl font-bold text-white">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400 text-sm">Cash Balance</span>
            </div>
            <p className="text-3xl font-bold text-white">{player?.soft_currency?.toLocaleString() || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span className="text-slate-400 text-sm">Holdings</span>
            </div>
            <p className="text-3xl font-bold text-white">{portfolio.length}</p>
          </motion.div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Value Over Time */}
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

              {/* Asset Allocation */}
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
                ) : (
                  <p className="text-slate-400 text-center py-8">No holdings yet</p>
                )}
              </div>
            </div>

            {/* Top Holdings */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Top Holdings by Value</h3>
              {topHoldings.length > 0 ? (
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="60%" height={200}>
                    <RePieChart>
                      <Pie
                        data={topHoldings}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {topHoldings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {topHoldings.map((holding, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: holding.color }} />
                        <div>
                          <p className="text-white font-medium">{holding.name}</p>
                          <p className="text-slate-400 text-sm">
                            ${holding.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>

          {/* Holdings Tab */}
          <TabsContent value="holdings">
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
                            {holding.shares.toFixed(4)} shares {holding.isCrypto && '• Crypto'}
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
                <div className="text-center py-16">
                  <PieChart className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">No holdings yet. Start trading to build your portfolio!</p>
                  <Link to={createPageUrl('Trading')}>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Go to Trading Floor
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Risk Assessment & Backtesting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskAnalyzer portfolioMetrics={portfolioMetrics} totalValue={totalValue} />
              <BacktestSimulator portfolioMetrics={portfolioMetrics} totalValue={totalValue} />
            </div>
            {/* Performance by Holding */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6">Performance by Holding</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="ticker" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    formatter={(value, name) => {
                      if (name === 'gain') return [`$${value.toFixed(2)}`, 'Gain/Loss'];
                      return [`${value.toFixed(2)}%`, 'Gain %'];
                    }}
                  />
                  <Bar dataKey="gain" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sector Allocation - Enhanced with Treemap */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6">Sector Allocation & Heatmap</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${((entry.value / totalValue) * 100).toFixed(1)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={sectorColors[entry.name] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {sectorData.map((sector, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: sectorColors[sector.name] }} />
                          <span className="text-white text-sm">{sector.name}</span>
                        </div>
                        <span className="text-slate-400 text-sm">
                          ${sector.value.toLocaleString()} ({((sector.value / totalValue) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <ResponsiveContainer width="100%" height={400}>
                    <Treemap
                      data={portfolioMetrics.map(h => ({
                        name: h.ticker,
                        size: h.currentValue,
                        fill: h.gain >= 0 ? '#10b981' : '#ef4444'
                      }))}
                      dataKey="size"
                      stroke="#1e293b"
                      fill="#3b82f6"
                    >
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Performance by Sector */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6">Performance by Sector</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="value">
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sectorColors[entry.name] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Trade Impact Analysis */}
            {tradeImpacts.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">Trade Impact on Portfolio Value</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={tradeImpacts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      formatter={(value, name) => {
                        if (name === 'impact') return [`$${value.toLocaleString()}`, 'Impact'];
                        return [`$${value.toLocaleString()}`, name];
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="beforeValue" stroke="#94a3b8" name="Before Trade" strokeWidth={2} />
                    <Line type="monotone" dataKey="afterValue" stroke="#3b82f6" name="After Trade" strokeWidth={2} />
                    <Bar dataKey="impact" fill="#a855f7" name="Impact" />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tradeImpacts.slice(-4).reverse().map((trade, i) => (
                    <div key={i} className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 text-xs">{trade.date}</p>
                      <p className="text-white font-bold">{trade.ticker}</p>
                      <p className={`text-sm font-medium ${trade.impact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.impact >= 0 ? '+' : ''}${Math.abs(trade.impact).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Performance Comparison</h3>
              <Select value={comparisonTarget} onValueChange={setComparisonTarget}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Comparison</SelectItem>
                  <SelectItem value="market">Market Index</SelectItem>
                  <SelectItem value="traders">Top Traders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {comparisonTarget === 'market' && (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">vs. Market Index (S&P 500)</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={marketComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      formatter={(value) => `${value.toFixed(2)}%`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="myPortfolio" stroke="#3b82f6" strokeWidth={3} name="Your Portfolio" />
                    <Line type="monotone" dataKey="market" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="S&P 500" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Your 30-Day Return</p>
                    <p className={`text-2xl font-bold ${marketComparison[marketComparison.length - 1].myPortfolio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketComparison[marketComparison.length - 1].myPortfolio >= 0 ? '+' : ''}
                      {marketComparison[marketComparison.length - 1].myPortfolio.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Market Return</p>
                    <p className={`text-2xl font-bold ${marketComparison[marketComparison.length - 1].market >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketComparison[marketComparison.length - 1].market >= 0 ? '+' : ''}
                      {marketComparison[marketComparison.length - 1].market.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {comparisonTarget === 'traders' && (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">vs. Top Traders</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topTraderComparison} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="value" name="Total Value">
                      {topTraderComparison.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6">
                  <div className="grid gap-3">
                    {topTraderComparison.map((trader, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${trader.name === 'You' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-slate-700/30'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-500' : 'bg-slate-600'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-bold">{trader.name}</p>
                            {trader.name === 'You' && <p className="text-blue-400 text-xs">Your Portfolio</p>}
                          </div>
                        </div>
                        <p className="text-white font-bold text-lg">${trader.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {comparisonTarget === 'none' && (
              <div className="text-center py-16">
                <Zap className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">Select a comparison target above to analyze your performance</p>
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-slate-700">
                {transactions.length > 0 ? (
                  transactions.map((tx, index) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}