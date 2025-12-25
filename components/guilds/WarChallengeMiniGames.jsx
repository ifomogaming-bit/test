import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Trophy, Timer, Zap, Target, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const STOCKS = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'META', 'NFLX'];

export default function WarChallengeMiniGames({ challenge, player, war, myGuild, onComplete }) {
  const [gameState, setGameState] = useState({ 
    round: 0, 
    playerScore: 0, 
    opponentScore: 0,
    currentTrend: null,
    selectedStock: null,
    lastResult: null
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (timeLeft <= 0 || gameState.round >= getTotalRounds()) {
      finishGame();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState.round]);

  const getTotalRounds = () => {
    if (challenge.challenge_type === 'trend_tapper') return 10;
    if (challenge.challenge_type === 'market_race') return 20;
    return 5;
  };

  const completeMutation = useMutation({
    mutationFn: async ({ playerScore, opponentScore }) => {
      // Skip database updates for practice mode
      if (challenge.id.startsWith('practice_')) {
        return;
      }

      const winnerId = playerScore > opponentScore ? player.id : challenge.opponent_id;
      
      await base44.entities.WarChallenge.update(challenge.id, {
        status: 'completed',
        challenger_score: playerScore,
        opponent_score: opponentScore,
        winner_id: winnerId
      });

      if (winnerId === player.id && !challenge.id.startsWith('practice_')) {
        const isChallenger = war.challenger_guild_id === myGuild.id;
        const scoreField = isChallenger ? 'challenger_score' : 'opponent_score';

        // Check for Challenge Frenzy event
        const warEvents = await base44.entities.GuildWarEvent.filter({ war_id: war.id, status: 'active' });
        const challengeFrenzy = warEvents.find(e => e.event_type === 'challenge_frenzy');
        
        let basePoints = 25;
        let bonusPoints = 0;
        
        if (challengeFrenzy) {
          bonusPoints = Math.floor(basePoints * (challengeFrenzy.bonus_multiplier - 1));
          
          // Update event progress
          const currentProgress = challengeFrenzy.current_progress || {};
          currentProgress[myGuild.id] = (currentProgress[myGuild.id] || 0) + 1;
          
          await base44.entities.GuildWarEvent.update(challengeFrenzy.id, {
            current_progress: currentProgress
          });
        }

        const totalPoints = basePoints + bonusPoints;

        await base44.entities.GuildWar.update(war.id, {
          [scoreField]: (war[scoreField] || 0) + totalPoints
        });

        await base44.entities.GuildWarContribution.create({
          war_id: war.id,
          player_id: player.id,
          player_name: player.username,
          guild_id: myGuild.id,
          points_earned: totalPoints,
          contribution_type: 'pvp_victory',
          opponent_player_id: challenge.opponent_id,
          opponent_player_name: challenge.opponent_name,
          details: { 
            challenge_type: challenge.challenge_type, 
            won: true,
            base_points: basePoints,
            bonus_points: bonusPoints,
            event: challengeFrenzy ? 'challenge_frenzy' : null
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warChallenges']);
      queryClient.invalidateQueries(['activeWars']);
      queryClient.invalidateQueries(['warContributions']);
      if (onComplete) onComplete();
    }
  });

  const finishGame = () => {
    if (gameState.round >= getTotalRounds()) {
      completeMutation.mutate({
        playerScore: gameState.playerScore,
        opponentScore: gameState.opponentScore
      });
    }
  };

  const playTrendTapperRound = (playerChoice) => {
    const correctTrend = Math.random() > 0.5; // true = up, false = down
    const opponentChoice = Math.random() > 0.5;
    
    const playerCorrect = playerChoice === correctTrend;
    const opponentCorrect = opponentChoice === correctTrend;

    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      playerScore: prev.playerScore + (playerCorrect ? 1 : 0),
      opponentScore: prev.opponentScore + (opponentCorrect ? 1 : 0),
      currentTrend: correctTrend ? 'up' : 'down',
      lastResult: playerCorrect ? 'correct' : 'wrong'
    }));
    
    // Clear result after animation
    setTimeout(() => {
      setGameState(prev => ({ ...prev, currentTrend: null, lastResult: null }));
    }, 1500);
  };

  const playMarketRaceRound = (stockIndex) => {
    // Random stock performance
    const stockPerformance = STOCKS.map(() => Math.random());
    const playerPick = stockPerformance[stockIndex];
    const opponentPick = stockPerformance[Math.floor(Math.random() * STOCKS.length)];

    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      playerScore: prev.playerScore + (playerPick > 0.5 ? 1 : 0),
      opponentScore: prev.opponentScore + (opponentPick > 0.5 ? 1 : 0)
    }));
  };

  const playPortfolioFlipRound = () => {
    const playerGain = Math.random() * 20;
    const opponentGain = Math.random() * 20;

    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      playerScore: prev.playerScore + playerGain,
      opponentScore: prev.opponentScore + opponentGain
    }));
  };

  const renderGame = () => {
    if (challenge.challenge_type === 'trend_tapper') {
      return (
        <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <motion.h3 
            className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-red-400 mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📈 TREND TAPPER
          </motion.h3>
          <p className="text-slate-300 font-bold text-sm sm:text-base">Will the market go UP or DOWN?</p>
          <Badge className="mt-2 bg-purple-500/30 text-purple-300 font-black text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
            Round {gameState.round + 1}/{getTotalRounds()}
          </Badge>
        </div>
          
          {gameState.currentTrend && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`text-center p-6 rounded-2xl border-4 shadow-2xl ${
                gameState.lastResult === 'correct' 
                  ? 'bg-gradient-to-br from-green-600/40 to-emerald-600/40 border-green-400' 
                  : 'bg-gradient-to-br from-red-600/40 to-orange-600/40 border-red-400'
              }`}
            >
              <motion.p 
                className={`text-4xl font-black mb-2 ${gameState.currentTrend === 'up' ? 'text-green-400' : 'text-red-400'}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                {gameState.currentTrend === 'up' ? '📈 MARKET UP!' : '📉 MARKET DOWN!'}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl font-black ${gameState.lastResult === 'correct' ? 'text-green-300' : 'text-red-300'}`}
              >
                {gameState.lastResult === 'correct' ? '✅ CORRECT!' : '❌ WRONG!'}
              </motion.p>
            </motion.div>
          )}
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }} 
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Button
                onClick={() => playTrendTapperRound(true)}
                disabled={gameState.currentTrend !== null}
                className="w-full h-28 sm:h-32 md:h-40 bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 shadow-2xl shadow-green-500/50 border-2 sm:border-4 border-green-400/50 flex flex-col gap-2 sm:gap-3 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
                </motion.div>
                <span className="text-lg sm:text-xl md:text-2xl font-black">UP ⬆️</span>
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }} 
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Button
                onClick={() => playTrendTapperRound(false)}
                disabled={gameState.currentTrend !== null}
                className="w-full h-28 sm:h-32 md:h-40 bg-gradient-to-br from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 shadow-2xl shadow-red-500/50 border-2 sm:border-4 border-red-400/50 flex flex-col gap-2 sm:gap-3 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 0.5 }}
                />
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendingDown className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
                </motion.div>
                <span className="text-lg sm:text-xl md:text-2xl font-black">DOWN ⬇️</span>
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }

    if (challenge.challenge_type === 'market_race') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <motion.h3 
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🏁 MARKET RACE
            </motion.h3>
            <p className="text-slate-300 font-bold">Pick the best performing stock!</p>
            <Badge className="mt-2 bg-blue-500/30 text-blue-300 font-black text-lg px-4 py-2">
              Round {gameState.round + 1}/{getTotalRounds()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STOCKS.slice(0, 8).map((stock, idx) => (
              <motion.div 
                key={stock}
                whileHover={{ scale: 1.15, y: -8, rotate: 3 }}
                whileTap={{ scale: 0.85 }}
                initial={{ opacity: 0, y: 20, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Button
                  onClick={() => playMarketRaceRound(idx)}
                  className="w-full h-24 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-2xl shadow-blue-500/50 font-black text-xl border-3 border-blue-300/50 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: idx * 0.1 }}
                  />
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  >
                    {stock}
                  </motion.span>
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.15 }}
                  />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (challenge.challenge_type === 'portfolio_flip') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <motion.h3 
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💼 PORTFOLIO FLIP
            </motion.h3>
            <p className="text-slate-300 font-bold">Build the strongest portfolio!</p>
            <Badge className="mt-2 bg-purple-500/30 text-purple-300 font-black text-lg px-4 py-2">
              Round {gameState.round + 1}/{getTotalRounds()}
            </Badge>
          </div>

          <motion.div 
            whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }} 
            whileTap={{ scale: 0.92 }}
          >
            <Button
              onClick={playPortfolioFlipRound}
              className="w-full h-32 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-2xl shadow-purple-500/60 border-4 border-purple-400/50 text-2xl font-black relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💼
              </motion.div>
              <span className="ml-2">Build Portfolio</span>
              <motion.div
                className="absolute top-2 right-2"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </Button>
          </motion.div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <Card className="w-full max-w-3xl bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 border-4 border-purple-500/60 shadow-2xl shadow-purple-500/50 my-2 sm:my-4">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-black break-words">
                {player.username} vs {challenge.opponent_name}
              </CardTitle>
              <p className="text-purple-300 text-xs sm:text-sm mt-1">Guild War Challenge</p>
            </div>
            <Badge className="bg-orange-500/30 text-orange-300 font-black text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
              <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {timeLeft}s
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <motion.div 
              className="text-center p-3 sm:p-6 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-xl border-2 border-cyan-400/50 shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              animate={gameState.lastResult === 'correct' ? { 
                boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 20px 10px rgba(34, 197, 94, 0)']
              } : {}}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-cyan-300 text-xs sm:text-sm font-bold relative z-10">YOU</p>
              <motion.p 
                className="text-white text-3xl sm:text-4xl md:text-5xl font-black relative z-10"
                key={gameState.playerScore}
                initial={{ scale: 1.5, color: '#22c55e' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(gameState.playerScore)}
              </motion.p>
              <motion.div
                className="absolute top-1 right-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
              </motion.div>
            </motion.div>
            <motion.div 
              className="text-center p-3 sm:p-6 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-xl border-2 border-red-400/50 shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <p className="text-red-300 text-xs sm:text-sm font-bold relative z-10">OPPONENT</p>
              <motion.p 
                className="text-white text-3xl sm:text-4xl md:text-5xl font-black relative z-10"
                key={gameState.opponentScore}
                initial={{ scale: 1.5, color: '#ef4444' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(gameState.opponentScore)}
              </motion.p>
              <motion.div
                className="absolute top-1 right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Target className="w-4 h-4 text-orange-400" />
              </motion.div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-purple-400 font-bold">{Math.round((gameState.round / getTotalRounds()) * 100)}%</span>
            </div>
            <Progress 
              value={(gameState.round / getTotalRounds()) * 100} 
              className="h-3 bg-slate-800"
            />
          </div>

          {renderGame()}

          <Button
            onClick={onComplete}
            variant="outline"
            className="w-full border-slate-600 text-slate-400 py-4 sm:py-6 text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Back to War
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}