import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy, Target, Zap, Crown, Award, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TournamentBattleArena({ tournament, player, opponent, onBattleComplete }) {
  const [gameState, setGameState] = useState({
    round: 0,
    player1Score: 0,
    player2Score: 0,
    gameOver: false
  });
  const [showResult, setShowResult] = useState(false);
  const queryClient = useQueryClient();

  const createBattleMutation = useMutation({
    mutationFn: async ({ winnerId, player1Score, player2Score, pointsAwarded }) => {
      await base44.entities.TournamentBattle.create({
        tournament_id: tournament.id,
        player1_id: player.id,
        player1_name: player.username,
        player2_id: opponent.id,
        player2_name: opponent.username,
        player1_score,
        player2_score,
        winner_id: winnerId,
        points_awarded: pointsAwarded,
        game_type: 'quick_trade',
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      // Update tournament scores
      const currentScores = tournament.player_scores || {};
      const newScores = { ...currentScores };
      newScores[winnerId] = (newScores[winnerId] || 0) + pointsAwarded;

      await base44.entities.GuildTournament.update(tournament.id, {
        player_scores: newScores,
        battle_history: [
          ...(tournament.battle_history || []),
          {
            player1: player.username,
            player2: opponent.username,
            winner: winnerId === player.id ? player.username : opponent.username,
            points: pointsAwarded,
            timestamp: new Date().toISOString()
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildTournaments']);
      if (onBattleComplete) onBattleComplete();
    }
  });

  const playRound = (playerChoice) => {
    // Simple game: predict if "stock" goes up or down
    const result = Math.random() > 0.5;
    const opponentChoice = Math.random() > 0.5;

    const playerWins = playerChoice === result;
    const opponentWins = opponentChoice === result;

    const newState = {
      round: gameState.round + 1,
      player1Score: gameState.player1Score + (playerWins ? 1 : 0),
      player2Score: gameState.player2Score + (opponentWins ? 1 : 0),
      gameOver: gameState.round + 1 >= 10
    };

    setGameState(newState);

    if (newState.gameOver) {
      setTimeout(() => finishBattle(newState), 1000);
    }
  };

  const finishBattle = (finalState) => {
    const winnerId = finalState.player1Score > finalState.player2Score ? player.id : opponent.id;
    const pointsAwarded = Math.abs(finalState.player1Score - finalState.player2Score) * 10;

    createBattleMutation.mutate({
      winnerId,
      player1Score: finalState.player1Score,
      player2Score: finalState.player2Score,
      pointsAwarded
    });

    setShowResult(true);

    if (winnerId === player.id) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  if (showResult) {
    const won = gameState.player1Score > gameState.player2Score;
    const points = Math.abs(gameState.player1Score - gameState.player2Score) * 10;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
      >
        <Card className={`w-full max-w-2xl border-4 ${won ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500' : 'bg-gradient-to-br from-red-900/50 to-orange-900/50 border-red-500'}`}>
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="mb-6"
            >
              {won ? (
                <Trophy className="w-32 h-32 text-yellow-400 mx-auto drop-shadow-2xl" />
              ) : (
                <Target className="w-32 h-32 text-orange-400 mx-auto" />
              )}
            </motion.div>

            <h2 className={`text-5xl font-black mb-4 ${won ? 'text-green-400' : 'text-orange-400'}`}>
              {won ? '🎉 VICTORY!' : '💪 GOOD FIGHT!'}
            </h2>
            
            <p className="text-white text-2xl mb-6">
              {gameState.player1Score} - {gameState.player2Score}
            </p>

            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
              <p className="text-slate-400 mb-2">Tournament Points Earned</p>
              <p className="text-yellow-400 text-5xl font-black">+{points}</p>
            </div>

            <Button
              onClick={() => {
                setShowResult(false);
                if (onBattleComplete) onBattleComplete();
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full py-6 text-xl font-black"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <Card className="w-full max-w-4xl bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 border-4 border-purple-500/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-black text-white flex items-center gap-3">
                <Swords className="w-8 h-8 text-orange-400" />
                Tournament Battle
              </CardTitle>
              <p className="text-purple-300 mt-1">{player.username} vs {opponent.username}</p>
            </div>
            <Badge className="bg-purple-500/30 text-purple-300 font-black text-lg px-4 py-2">
              Round {gameState.round + 1}/10
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Score Display */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="text-center p-8 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-2xl border-3 border-cyan-400/50 shadow-2xl relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <p className="text-cyan-300 text-sm font-bold mb-2">YOU</p>
              <motion.p 
                className="text-white text-6xl font-black"
                key={gameState.player1Score}
                initial={{ scale: 1.5, color: '#22c55e' }}
                animate={{ scale: 1, color: '#ffffff' }}
              >
                {gameState.player1Score}
              </motion.p>
            </motion.div>

            <motion.div 
              className="text-center p-8 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-2xl border-3 border-red-400/50 shadow-2xl relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <Target className="w-10 h-10 text-orange-400 mx-auto mb-3" />
              <p className="text-red-300 text-sm font-bold mb-2">OPPONENT</p>
              <motion.p 
                className="text-white text-6xl font-black"
                key={gameState.player2Score}
                initial={{ scale: 1.5, color: '#ef4444' }}
                animate={{ scale: 1, color: '#ffffff' }}
              >
                {gameState.player2Score}
              </motion.p>
            </motion.div>
          </div>

          {/* Game Area */}
          <div className="space-y-4">
            <div className="text-center bg-slate-800/50 rounded-xl p-6 border-2 border-purple-500/30">
              <h3 className="text-2xl font-black text-white mb-3">📈 Will the market go UP or DOWN?</h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.1, rotate: 3 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={() => playRound(true)}
                    disabled={gameState.gameOver}
                    className="w-full h-40 bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 shadow-2xl shadow-green-500/60 border-4 border-green-400/50 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="w-20 h-20 text-white" />
                      </motion.div>
                      <span className="text-3xl font-black">UP ⬆️</span>
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1, rotate: -3 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={() => playRound(false)}
                    disabled={gameState.gameOver}
                    className="w-full h-40 bg-gradient-to-br from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 shadow-2xl shadow-red-500/60 border-4 border-red-400/50 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ y: [5, -5, 5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="w-20 h-20 text-white" />
                      </motion.div>
                      <span className="text-3xl font-black">DOWN ⬇️</span>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}