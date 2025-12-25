import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Trophy, Zap, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function WarChallengeGame({ challenge, player, war, myGuild, onComplete }) {
  const [gameState, setGameState] = useState({ round: 0, playerScore: 0, opponentScore: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const completeMutation = useMutation({
    mutationFn: async ({ playerScore, opponentScore }) => {
      const winnerId = playerScore > opponentScore ? player.id : challenge.opponent_id;
      
      await base44.entities.WarChallenge.update(challenge.id, {
        status: 'completed',
        challenger_score: playerScore,
        opponent_score: opponentScore,
        winner_id: winnerId
      });

      if (winnerId === player.id) {
        const isChallenger = war.challenger_guild_id === myGuild.id;
        const scoreField = isChallenger ? 'challenger_score' : 'opponent_score';

        await base44.entities.GuildWar.update(war.id, {
          [scoreField]: (war[scoreField] || 0) + 25
        });

        await base44.entities.GuildWarContribution.create({
          war_id: war.id,
          player_id: player.id,
          player_name: player.username,
          guild_id: myGuild.id,
          points_earned: 25,
          contribution_type: 'pvp_victory',
          opponent_player_id: challenge.opponent_id,
          opponent_player_name: challenge.opponent_name,
          details: { challenge_type: challenge.challenge_type, won: true }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warChallenges']);
      queryClient.invalidateQueries(['activeWars']);
      if (onComplete) onComplete();
    }
  });

  const playRound = (playerChoice) => {
    const rounds = challenge.challenge_type === 'trend_tapper' ? 10 : 20;
    if (gameState.round >= rounds) return;

    const correct = Math.random() > 0.5;
    const opponentChoice = Math.random() > 0.5;
    
    const playerCorrect = (playerChoice && correct) || (!playerChoice && !correct);
    const opponentCorrect = (opponentChoice && correct) || (!opponentChoice && !correct);

    setGameState(prev => ({
      round: prev.round + 1,
      playerScore: prev.playerScore + (playerCorrect ? 1 : 0),
      opponentScore: prev.opponentScore + (opponentCorrect ? 1 : 0)
    }));

    if (gameState.round + 1 >= rounds) {
      setTimeout(() => {
        completeMutation.mutate({
          playerScore: gameState.playerScore + (playerCorrect ? 1 : 0),
          opponentScore: gameState.opponentScore + (opponentCorrect ? 1 : 0)
        });
      }, 1000);
    }
  };

  const renderGame = () => {
    if (challenge.challenge_type === 'trend_tapper') {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-white text-2xl font-bold mb-2">📈 Trend Tapper</h3>
            <p className="text-slate-300">Predict if the market will go UP or DOWN!</p>
            <Badge className="mt-2 bg-purple-500/20 text-purple-300">
              Round {gameState.round + 1}/10
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => playRound(true)}
              className="h-32 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <TrendingUp className="w-12 h-12" />
            </Button>
            <Button
              onClick={() => playRound(false)}
              className="h-32 bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <TrendingDown className="w-12 h-12" />
            </Button>
          </div>
        </div>
      );
    }

    if (challenge.challenge_type === 'market_race') {
      const stocks = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN'];
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-white text-2xl font-bold mb-2">🏁 Market Race</h3>
            <p className="text-slate-300">Pick the best performing stock!</p>
            <Badge className="mt-2 bg-blue-500/20 text-blue-300">
              Round {gameState.round + 1}/20
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {stocks.map(stock => (
              <Button
                key={stock}
                onClick={() => playRound(Math.random() > 0.5)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {stock}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <h3 className="text-white text-2xl font-bold mb-4">💼 Portfolio Flip</h3>
        <p className="text-slate-300 mb-4">Build your portfolio by selecting assets!</p>
        <Button onClick={() => completeMutation.mutate({ playerScore: Math.floor(Math.random() * 100), opponentScore: Math.floor(Math.random() * 100) })}>
          Complete Game
        </Button>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/40 border-2 border-purple-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            {player.username} vs {challenge.opponent_name}
          </CardTitle>
          <Badge className="bg-orange-500/20 text-orange-300">
            <Timer className="w-3 h-3 mr-1" />
            {timeLeft}s
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-cyan-600/20 rounded-lg">
            <p className="text-cyan-300 text-sm">You</p>
            <p className="text-white text-3xl font-black">{gameState.playerScore}</p>
          </div>
          <div className="text-center p-4 bg-red-600/20 rounded-lg">
            <p className="text-red-300 text-sm">Opponent</p>
            <p className="text-white text-3xl font-black">{gameState.opponentScore}</p>
          </div>
        </div>

        <Progress value={(gameState.round / 10) * 100} className="mb-6" />

        {renderGame()}
      </CardContent>
    </Card>
  );
}