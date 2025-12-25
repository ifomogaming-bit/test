import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Area, AreaChart, ComposedChart } from 'recharts';
import { X, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DetailedStockChart({ 
  ticker, 
  currentPrice, 
  priceHistory, 
  playerPositions = [],
  onClose 
}) {
  const [chartType, setChartType] = useState('area');
  const [timeRange, setTimeRange] = useState('1D');

  // Validate and filter price history
  const validHistory = Array.isArray(priceHistory) ? priceHistory.filter(p => 
    p && typeof p.price === 'number' && !isNaN(p.price) && p.timestamp
  ) : [];

  if (!validHistory || validHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-4xl w-full"
        >
          <div className="text-center">
            <p className="text-white">No price history available for {ticker}</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const ranges = {
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000,
      '3M': 90 * 24 * 60 * 60 * 1000,
      '6M': 180 * 24 * 60 * 60 * 1000,
      '1Y': 365 * 24 * 60 * 60 * 1000,
      'ALL': Infinity
    };
    
    const cutoff = now.getTime() - ranges[timeRange];
    return validHistory.filter(point => {
      const timestamp = new Date(point.timestamp).getTime();
      return !isNaN(timestamp) && timestamp >= cutoff;
    });
  };

  const filteredHistory = getFilteredData();
  
  // Ensure we have valid data before proceeding
  if (filteredHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-4xl w-full"
        >
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-white mb-2">Loading chart data for {ticker}...</p>
            <p className="text-slate-400 text-sm">Price tracking bot is initializing historical data</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const data = filteredHistory.map(point => {
    const timestamp = new Date(point.timestamp);
    return {
      timestamp: timestamp.toLocaleTimeString(),
      fullDate: timestamp.toLocaleString(),
      price: Number(point.price) || 0,
      high: Number(point.high) || Number(point.price) || 0,
      low: Number(point.low) || Number(point.price) || 0,
      open: Number(point.open) || Number(point.price) || 0,
      close: Number(point.close) || Number(point.price) || 0,
      volume: Number(point.volume) || 0
    };
  }).filter(d => d.price > 0);

  // Calculate technical indicators
  const calculateSMA = (data, period) => {
    return data.map((item, idx) => {
      if (idx < period - 1) return null;
      const sum = data.slice(idx - period + 1, idx + 1).reduce((acc, val) => acc + val.price, 0);
      return sum / period;
    });
  };

  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, Math.min(50, data.length));

  const dataWithIndicators = data.map((item, idx) => ({
    ...item,
    sma20: sma20[idx],
    sma50: sma50[idx]
  }));

  const firstPrice = filteredHistory[0]?.price || currentPrice;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const minPrice = filteredHistory.length > 0 ? Math.min(...filteredHistory.map(p => p.low || p.price)) : currentPrice;
  const maxPrice = filteredHistory.length > 0 ? Math.max(...filteredHistory.map(p => p.high || p.price)) : currentPrice;
  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  const avgVolume = data.length > 0 ? totalVolume / data.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-xl border border-slate-700 p-4 sm:p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
              {ticker}
              <Badge className={isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {isPositive ? '+' : ''}{priceChangePercent}%
              </Badge>
            </h2>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 mt-2">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Current</p>
                <p className="text-white text-base sm:text-xl font-bold">${currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Change</p>
                <p className={`text-sm sm:text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}${priceChange.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">High</p>
                <p className="text-white text-sm sm:text-base font-bold">${maxPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs sm:text-sm">Low</p>
                <p className="text-white text-sm sm:text-base font-bold">${minPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-white self-start sm:self-auto hover:bg-slate-800"
          >
            <X className="w-5 h-5 mr-2" />
            Close Chart
          </Button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={chartType === 'line' ? 'default' : 'outline'}
                onClick={() => setChartType('line')}
                className={chartType !== 'line' ? 'border-slate-600' : ''}
              >
                <Activity className="w-3 h-3 mr-1" />
                Line
              </Button>
              <Button 
                size="sm" 
                variant={chartType === 'area' ? 'default' : 'outline'}
                onClick={() => setChartType('area')}
                className={chartType !== 'area' ? 'border-slate-600' : ''}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Area
              </Button>
              <Button 
                size="sm" 
                variant={chartType === 'candlestick' ? 'default' : 'outline'}
                onClick={() => setChartType('candlestick')}
                className={chartType !== 'candlestick' ? 'border-slate-600' : ''}
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                OHLC
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={timeRange === range ? 'default' : 'outline'}
                  onClick={() => setTimeRange(range)}
                  className={timeRange !== range ? 'border-slate-600 text-xs' : 'text-xs'}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={dataWithIndicators}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#64748b"
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#64748b"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'price') return [`$${value?.toFixed(2)}`, 'Price'];
                    if (name === 'sma20') return [`$${value?.toFixed(2)}`, 'SMA 20'];
                    if (name === 'sma50') return [`$${value?.toFixed(2)}`, 'SMA 50'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => dataWithIndicators.find(d => d.timestamp === label)?.fullDate || label}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={3}
                  dot={false}
                  name="price"
                  animationDuration={300}
                />
                <Line 
                  type="monotone" 
                  dataKey="sma20" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="sma20"
                  animationDuration={300}
                />
                <Line 
                  type="monotone" 
                  dataKey="sma50" 
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="sma50"
                  animationDuration={300}
                />
                {playerPositions.map((position, idx) => (
                  <ReferenceLine
                    key={idx}
                    y={position.avg_acquisition_price}
                    stroke="#8b5cf6"
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Entry: $${position.avg_acquisition_price.toFixed(2)}`, 
                      fill: '#8b5cf6',
                      fontSize: 10 
                    }}
                  />
                ))}
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#64748b"
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#64748b"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => data.find(d => d.timestamp === label)?.fullDate || label}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  animationDuration={300}
                />
                {playerPositions.map((position, idx) => (
                  <ReferenceLine
                    key={idx}
                    y={position.avg_acquisition_price}
                    stroke="#8b5cf6"
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Entry: $${position.avg_acquisition_price.toFixed(2)}`, 
                      fill: '#8b5cf6',
                      fontSize: 10 
                    }}
                  />
                ))}
              </AreaChart>
            ) : (
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#64748b"
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  yAxisId="price"
                  stroke="#64748b"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'high' || name === 'low' || name === 'open' || name === 'close') {
                      return [`$${value.toFixed(2)}`, name.toUpperCase()];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => data.find(d => d.timestamp === label)?.fullDate || label}
                />
                <Bar 
                  yAxisId="price"
                  dataKey="high" 
                  fill={isPositive ? '#22c55e' : '#ef4444'}
                  opacity={0.3}
                  name="high"
                />
                <Bar 
                  yAxisId="price"
                  dataKey="low" 
                  fill={isPositive ? '#22c55e' : '#ef4444'}
                  opacity={0.3}
                  name="low"
                />
                <Line 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="close" 
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                  name="close"
                />
                {playerPositions.map((position, idx) => (
                  <ReferenceLine
                    key={idx}
                    yAxisId="price"
                    y={position.avg_acquisition_price}
                    stroke="#8b5cf6"
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Entry: $${position.avg_acquisition_price.toFixed(2)}`, 
                      fill: '#8b5cf6',
                      fontSize: 10 
                    }}
                  />
                ))}
              </ComposedChart>
            )}
          </ResponsiveContainer>

          {/* Volume Chart */}
          <ResponsiveContainer width="100%" height={100} className="mt-4">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#64748b"
                style={{ fontSize: '10px' }}
                hide
              />
              <YAxis 
                stroke="#64748b"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                style={{ fontSize: '10px' }}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value) => [value.toLocaleString(), 'Volume']}
              />
              <Bar 
                dataKey="volume" 
                fill={isPositive ? '#22c55e' : '#ef4444'}
                opacity={0.5}
                animationDuration={300}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">Avg Volume</p>
              <p className="text-white text-sm font-bold">{avgVolume.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">Data Points</p>
              <p className="text-white text-sm font-bold">{data.length}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">SMA 20</p>
              <p className="text-white text-sm font-bold">${sma20[sma20.length - 1]?.toFixed(2) || 'N/A'}</p>
            </div>
            <div className="bg-slate-700/30 rounded p-2">
              <p className="text-slate-400 text-xs">SMA 50</p>
              <p className="text-white text-sm font-bold">${sma50[sma50.length - 1]?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </div>

        {playerPositions.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">Your Positions</h3>
            <div className="space-y-2">
              {playerPositions.map((position, idx) => {
              const positionValue = position.shares * currentPrice;
              const positionGain = positionValue - position.total_invested;
              const positionGainPercent = ((positionGain / position.total_invested) * 100).toFixed(2);
              const isProfitable = positionGain >= 0;

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm sm:text-base">{position.shares} shares @ ${position.avg_acquisition_price.toFixed(2)}</p>
                    <p className="text-slate-400 text-xs sm:text-sm">Invested: ${position.total_invested.toFixed(2)}</p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-white font-bold text-sm sm:text-base">${positionValue.toFixed(2)}</p>
                    <p className={`text-xs sm:text-sm font-medium ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfitable ? '+' : ''}${positionGain.toFixed(2)} ({isProfitable ? '+' : ''}{positionGainPercent}%)
                    </p>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}