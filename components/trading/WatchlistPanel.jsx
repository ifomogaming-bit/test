import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trash2, Plus, Bell } from 'lucide-react';

export default function WatchlistPanel({ player, prices }) {
  const [newTicker, setNewTicker] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const queryClient = useQueryClient();

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Watchlist.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Watchlist.create({
        player_id: player.id,
        ticker: newTicker.toUpperCase(),
        alert_price: alertPrice ? parseFloat(alertPrice) : null,
        notes: ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['watchlist']);
      setNewTicker('');
      setAlertPrice('');
    }
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Watchlist.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['watchlist']);
    }
  });

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Watchlist ({watchlist.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ticker (e.g., AAPL)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <Input
            type="number"
            placeholder="Alert at..."
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white w-32"
          />
          <Button
            onClick={() => addToWatchlistMutation.mutate()}
            disabled={!newTicker}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {watchlist.map(item => {
            const currentPrice = prices[item.ticker] || 0;
            const hasAlert = item.alert_price && Math.abs(currentPrice - item.alert_price) / item.alert_price < 0.02;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all ${
                  hasAlert 
                    ? 'bg-yellow-500/10 border-yellow-500/50' 
                    : 'bg-slate-700/30 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{item.ticker}</p>
                    <p className="text-slate-400 text-sm">${currentPrice.toFixed(2)}</p>
                    {item.alert_price && (
                      <p className="text-xs flex items-center gap-1 text-yellow-400">
                        <Bell className="w-3 h-3" />
                        Alert: ${item.alert_price}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromWatchlistMutation.mutate(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {watchlist.length === 0 && (
            <p className="text-slate-400 text-center py-8 text-sm">
              Add stocks to your watchlist to track them
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}