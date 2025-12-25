import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

function runBacktest(priceHistory, strategy) {
  const { entry_rules, exit_rules, risk_management } = strategy;
  const trades = [];
  let position = null;
  let balance = 10000;
  let equity = [{ day: 0, value: balance }];

  for (let i = 50; i < priceHistory.length; i++) {
    const price = priceHistory[i].price;
    const sma20 = priceHistory.slice(i - 20, i).reduce((sum, p) => sum + p.price, 0) / 20;
    const sma50 = priceHistory.slice(i - 50, i).reduce((sum, p) => sum + p.price, 0) / 50;

    // Entry logic
    if (!position && entry_rules?.type === 'sma_cross') {
      if (sma20 > sma50 && priceHistory[i - 1] && priceHistory.slice(i - 21, i - 1).reduce((sum, p) => sum + p.price, 0) / 20 <= priceHistory.slice(i - 51, i - 1).reduce((sum, p) => sum + p.price, 0) / 50) {
        const shares = Math.floor(balance * 0.95 / price);
        position = {
          entry_price: price,
          shares,
          entry_day: i,
          stop_loss: price * (1 - (risk_management?.stop_loss_percent || 5) / 100),
          take_profit: price * (1 + (risk_management?.take_profit_percent || 10) / 100)
        };
        balance -= shares * price;
      }
    }

    // Exit logic
    if (position) {
      const shouldExit = 
        (exit_rules?.type === 'sma_cross' && sma20 < sma50) ||
        price <= position.stop_loss ||
        price >= position.take_profit;

      if (shouldExit) {
        const pnl = (price - position.entry_price) * position.shares;
        balance += position.shares * price;
        trades.push({
          entry: position.entry_price,
          exit: price,
          pnl,
          pnlPercent: (pnl / (position.entry_price * position.shares)) * 100,
          duration: i - position.entry_day
        });
        position = null;
      }
    }

    equity.push({
      day: i,
      value: position ? balance + position.shares * price : balance
    });
  }

  const wins = trades.filter(t => t.pnl > 0).length;
  const losses = trades.filter(t => t.pnl < 0).length;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const avgWin = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / (wins || 1);
  const avgLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / (losses || 1));

  return {
    trades,
    equity,
    stats: {
      total_trades: trades.length,
      winning_trades: wins,
      losing_trades: losses,
      win_rate: trades.length ? (wins / trades.length * 100).toFixed(1) : 0,
      total_pnl: totalPnL.toFixed(2),
      profit_factor: avgLoss ? (avgWin / avgLoss).toFixed(2) : 0,
      avg_win: avgWin.toFixed(2),
      avg_loss: avgLoss.toFixed(2),
      final_balance: equity[equity.length - 1].value.toFixed(2),
      return_percent: ((equity[equity.length - 1].value - 10000) / 10000 * 100).toFixed(2)
    }
  };
}

export default function BacktestEngine({ priceHistory, strategy, onClose, onSaveResults }) {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const backtestResults = runBacktest(priceHistory, strategy);
      setResults(backtestResults);
      setIsRunning(false);
    }, 500);
  };

  const handleSave = () => {
    if (results) {
      onSaveResults(results.stats);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Strategy Backtest: {strategy.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!results ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-6">Ready to test your strategy on historical data</p>
              <Button
                onClick={handleRunBacktest}
                disabled={isRunning}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isRunning ? 'Running Backtest...' : 'Run Backtest'}
              </Button>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total Trades</p>
                  <p className="text-2xl font-bold text-white">{results.stats.total_trades}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">{results.stats.win_rate}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Profit Factor</p>
                  <p className="text-2xl font-bold text-blue-400">{results.stats.profit_factor}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Return</p>
                  <p className={`text-2xl font-bold ${parseFloat(results.stats.return_percent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.stats.return_percent}%
                  </p>
                </div>
              </div>

              {/* Equity Curve */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-white font-bold mb-4">Equity Curve</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={results.equity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      formatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trade Distribution */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-white font-bold mb-4">Trade Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Wins', value: results.stats.winning_trades, fill: '#10b981' },
                    { name: 'Losses', value: results.stats.losing_trades, fill: '#ef4444' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <p className="text-slate-400 text-sm">Average Win</p>
                  </div>
                  <p className="text-xl font-bold text-green-400">${results.stats.avg_win}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <p className="text-slate-400 text-sm">Average Loss</p>
                  </div>
                  <p className="text-xl font-bold text-red-400">${results.stats.avg_loss}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Save Results
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-slate-600"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}