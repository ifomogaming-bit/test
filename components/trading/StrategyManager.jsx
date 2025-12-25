import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, Trash2, Play, BarChart3 } from 'lucide-react';

export default function StrategyManager({ playerId, onBacktest, onClose }) {
  const [showCreate, setShowCreate] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIndicators, setSelectedIndicators] = useState(['sma20', 'sma50']);
  const [stopLoss, setStopLoss] = useState(5);
  const [takeProfit, setTakeProfit] = useState(10);
  const queryClient = useQueryClient();

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      return base44.entities.TradingStrategy.filter({ player_id: playerId });
    },
    enabled: !!playerId
  });

  const createStrategyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.TradingStrategy.create({
        player_id: playerId,
        name: strategyName,
        description,
        indicators: selectedIndicators.map(ind => ({ type: ind })),
        entry_rules: { type: 'sma_cross', fast: 20, slow: 50 },
        exit_rules: { type: 'sma_cross', fast: 20, slow: 50 },
        risk_management: {
          stop_loss_percent: parseFloat(stopLoss),
          take_profit_percent: parseFloat(takeProfit)
        },
        backtested: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategies']);
      setShowCreate(false);
      setStrategyName('');
      setDescription('');
    }
  });

  const deleteStrategyMutation = useMutation({
    mutationFn: (id) => base44.entities.TradingStrategy.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['strategies'])
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-white">Strategy Manager</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showCreate ? (
            <>
              <Button
                onClick={() => setShowCreate(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Create New Strategy
              </Button>

              <div className="space-y-3">
                {strategies.map(strategy => (
                  <div key={strategy.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-bold">{strategy.name}</h3>
                        <p className="text-slate-400 text-sm">{strategy.description}</p>
                      </div>
                      {strategy.backtested && (
                        <div className="text-right">
                          <p className="text-green-400 text-sm font-bold">
                            {strategy.backtest_results?.win_rate}% Win Rate
                          </p>
                          <p className="text-slate-400 text-xs">
                            {strategy.backtest_results?.total_trades} trades
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => onBacktest(strategy)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Backtest
                      </Button>
                      <Button
                        onClick={() => deleteStrategyMutation.mutate(strategy.id)}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {strategies.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No strategies yet</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Strategy Name</label>
                <Input
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  placeholder="e.g., SMA Crossover"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Stop Loss (%)</label>
                  <Input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Take Profit (%)</label>
                  <Input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => createStrategyMutation.mutate()}
                  disabled={!strategyName}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Save Strategy
                </Button>
                <Button
                  onClick={() => setShowCreate(false)}
                  variant="outline"
                  className="border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}