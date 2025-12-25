import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trophy, Gem, Users, Clock, Gift, Sparkles } from 'lucide-react';

export default function TournamentCreationModal({ isOpen, onClose, onConfirm, player }) {
  const [tournamentData, setTournamentData] = useState({
    name: '',
    description: '',
    duration_days: 1,
    max_participants: 8,
    is_public: true,
    game_types: ['stock_prediction', 'lightning_trading']
  });

  const CREATION_COST = 50;
  const canAfford = (player?.premium_currency || 0) >= CREATION_COST;

  const gameTypeOptions = [
    { id: 'stock_prediction', name: '📈 Stock Prediction Race', description: 'Predict stock movements' },
    { id: 'lightning_trading', name: '⚡ Lightning Trading', description: 'Fast-paced target clicking' },
    { id: 'portfolio_builder', name: '💼 Portfolio Builder', description: 'Build optimal portfolios' },
    { id: 'trend_tapper', name: '📊 Trend Tapper', description: 'Identify market trends' },
    { id: 'market_race', name: '🏁 Market Race', description: 'Race to target prices' }
  ];

  const toggleGameType = (gameId) => {
    setTournamentData(prev => ({
      ...prev,
      game_types: prev.game_types.includes(gameId)
        ? prev.game_types.filter(g => g !== gameId)
        : [...prev.game_types, gameId]
    }));
  };

  const handleCreate = () => {
    if (!tournamentData.name || tournamentData.game_types.length === 0) {
      alert('Please enter a tournament name and select at least one game type!');
      return;
    }

    if (!canAfford) {
      alert(`You need ${CREATION_COST} gems to create a tournament!`);
      return;
    }

    onConfirm(tournamentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-2 border-purple-500/50 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-3xl font-black flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Trophy className="w-8 h-8 text-yellow-400" />
            </motion.div>
            Create Tournament
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cost Banner */}
          <motion.div
            className={`p-4 rounded-xl border-2 ${
              canAfford 
                ? 'bg-purple-600/20 border-purple-400/50' 
                : 'bg-red-600/20 border-red-400/50'
            }`}
            animate={{ 
              boxShadow: canAfford 
                ? ['0 0 20px rgba(168,85,247,0.3)', '0 0 40px rgba(168,85,247,0.6)', '0 0 20px rgba(168,85,247,0.3)']
                : ['0 0 20px rgba(239,68,68,0.3)', '0 0 40px rgba(239,68,68,0.6)', '0 0 20px rgba(239,68,68,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold text-lg ${canAfford ? 'text-purple-300' : 'text-red-300'}`}>
                  Tournament Creation Cost
                </p>
                <p className="text-slate-400 text-sm">One-time fee to host your tournament</p>
              </div>
              <div className="flex items-center gap-2">
                <Gem className={`w-6 h-6 ${canAfford ? 'text-purple-400' : 'text-red-400'}`} />
                <span className={`text-3xl font-black ${canAfford ? 'text-white' : 'text-red-400'}`}>
                  {CREATION_COST}
                </span>
              </div>
            </div>
            <p className={`text-xs mt-2 ${canAfford ? 'text-purple-300' : 'text-red-300'}`}>
              Your balance: {player?.premium_currency || 0} gems
              {!canAfford && ' (Insufficient gems!)'}
            </p>
          </motion.div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Tournament Name *</Label>
              <Input
                value={tournamentData.name}
                onChange={(e) => setTournamentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Epic Trading Championship..."
                className="bg-slate-800 border-purple-500/50 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">Description</Label>
              <Textarea
                value={tournamentData.description}
                onChange={(e) => setTournamentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your tournament..."
                className="bg-slate-800 border-purple-500/50 text-white h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (Days)
                </Label>
                <Select
                  value={tournamentData.duration_days.toString()}
                  onValueChange={(value) => setTournamentData(prev => ({ ...prev, duration_days: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-slate-800 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="2">2 Days</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Max Participants
                </Label>
                <Select
                  value={tournamentData.max_participants.toString()}
                  onValueChange={(value) => setTournamentData(prev => ({ ...prev, max_participants: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-slate-800 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Players</SelectItem>
                    <SelectItem value="8">8 Players</SelectItem>
                    <SelectItem value="16">16 Players</SelectItem>
                    <SelectItem value="32">32 Players</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
              <div>
                <p className="text-white font-bold">Public Tournament</p>
                <p className="text-slate-400 text-sm">Anyone can join, or keep private for invited players only</p>
              </div>
              <Switch
                checked={tournamentData.is_public}
                onCheckedChange={(checked) => setTournamentData(prev => ({ ...prev, is_public: checked }))}
              />
            </div>
          </div>

          {/* Game Types */}
          <div>
            <Label className="text-white mb-3 block text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Select Game Types *
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {gameTypeOptions.map((game) => (
                <motion.button
                  key={game.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleGameType(game.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    tournamentData.game_types.includes(game.id)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400'
                      : 'bg-slate-800/50 border-2 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">{game.name}</p>
                      <p className="text-slate-400 text-sm">{game.description}</p>
                    </div>
                    {tournamentData.game_types.includes(game.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <span className="text-white font-bold">✓</span>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Info about auto-balanced rewards */}
          <div className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl border-2 border-green-500/50">
            <div className="flex items-start gap-3">
              <Gift className="w-6 h-6 text-green-400 shrink-0 mt-1" />
              <div>
                <p className="text-green-300 font-bold mb-2">🎁 Auto-Balanced Rewards</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Rewards are automatically distributed to all participants at the end of the tournament! 
                  Top performers get larger shares, but everyone receives something based on their rank.
                </p>
                <div className="mt-3 space-y-1 text-xs text-green-200">
                  <p>🥇 1st Place: 100% share</p>
                  <p>🥈 2nd Place: 60% share</p>
                  <p>🥉 3rd Place: 40% share</p>
                  <p>🏅 4th-5th: 20% share</p>
                  <p>✨ Participation: 10% share</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canAfford || !tournamentData.name || tournamentData.game_types.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-black text-lg"
            >
              <Gem className="w-5 h-5 mr-2" />
              Create Tournament ({CREATION_COST} Gems)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}