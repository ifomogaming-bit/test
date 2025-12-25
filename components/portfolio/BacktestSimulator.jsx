import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Play, RotateCcw, TrendingUp } from 'lucide-react';

const STRATEGIES = [
  { id: 'buy_hold', name: 'Buy & Hold', description: 'Hold all positions' },
  { id: 'rebalance_monthly', name: 'Monthly Rebalance', description: 'Rebalance to target allocation monthly' },
  { id: 'momentum', name: 'Momentum', description: 'Buy winners, sell losers' },
  { id: 'mean_reversion', name: 'Mean Reversion', description: 'Buy dips, sell rallies' }
];

export default function BacktestSimulator({ portfolioMetrics, totalValue }) {
  const [selectedStrategy, setSelectedStrategy] = useState('buy_hold');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runBacktest = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Simulate backtesting over 90 days
      const data = [];
      let portfolioValue = totalValue * 0.85; // Start from 85% of current value
      const currentValue = totalValue;
      
      for (let day = 0; day <= 90; day++) {
        const date = new Date();
        date.setDate(date.getDate() - (90 - day));
        
        // Different strategy performance
        let dailyReturn = 0;
        if (selectedStrategy === 'buy_hold') {
          dailyReturn = (Math.random() - 0.48) * 0.015; // Slight upward bias
        } else if (selectedStrategy === 'rebalance_monthly') {
          dailyReturn = (Math.random() - 0.47) * 0.012; // More stable
        } else if (selectedStrategy === 'momentum') {
          dailyReturn = (Math.random() - 0.45) * 0.025; // Higher variance, upward bias
        } else if (selectedStrategy === 'mean_reversion') {
          dailyReturn = (Math.random() - 0.49) * 0.018; // Moderate
        }
        
        portfolioValue *= (1 + dailyReturn);
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.round(portfolioValue),
          actual: day === 90 ? currentValue : null
        });
      }
      
      const finalValue = data[data.length - 1].value;
      const totalReturn = ((finalValue - data[0].value) / data[0].value) * 100;
      const maxValue = Math.max(...data.map(d => d.value));
      const minValue = Math.min(...data.map(d => d.value));
      const volatility = ((maxValue - minValue) / data[0].value) * 100;
      
      setResults({
        data,
        metrics: {
          initialValue: data[0].value,
          finalValue,
          totalReturn: totalReturn.toFixed(2),
          maxDrawdown: ((data[0].value - minValue) / data[0].value * 100).toFixed(2),
          volatility: volatility.toFixed(2),
          sharpeRatio: (totalReturn / volatility).toFixed(2)
        }
      });
      
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Strategy Backtesting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STRATEGIES.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={runBacktest} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run Test
          </Button>
        </div>

        <p className="text-slate-400 text-sm">
          {STRATEGIES.find(s => s.id === selectedStrategy)?.description}
        </p>

        {results && (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={results.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="Simulated Value"
                  dot={false}
                />
                {results.data.some(d => d.actual) && (
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    name="Current Value"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Total Return</p>
                <p className={`text-xl font-bold ${parseFloat(results.metrics.totalReturn) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(results.metrics.totalReturn) >= 0 ? '+' : ''}{results.metrics.totalReturn}%
                </p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Max Drawdown</p>
                <p className="text-xl font-bold text-red-400">
                  -{results.metrics.maxDrawdown}%
                </p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Sharpe Ratio</p>
                <p className="text-xl font-bold text-blue-400">
                  {results.metrics.sharpeRatio}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}