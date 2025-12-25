import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';

const MINI_GAMES = [
  { id: 'trend_prediction', name: '📈 Trend Predictor', rounds: 5 },
  { id: 'stock_race', name: '🏁 Stock Race', rounds: 5 },
  { id: 'quick_trade', name: '⚡ Quick Trader', rounds: 5 }
];

export default function RaidMiniGame({ onComplete }) {
  const [game, setGame] = useState(null);
  const [round, setRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // Select random mini-game
    const randomGame = MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)];
    setGame(randomGame);
  }, []);

  useEffect(() => {
    if (!game || round >= game.rounds) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleRoundComplete(false);
          return 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [round, game]);

  const handleRoundComplete = (playerWon) => {
    const opponentWon = Math.random() > 0.5; // Opponent has 50% chance
    
    setPlayerScore(prev => prev + (playerWon ? 1 : 0));
    setOpponentScore(prev => prev + (opponentWon ? 1 : 0));
    
    if (round + 1 >= game.rounds) {
      const finalPlayerScore = playerScore + (playerWon ? 1 : 0);
      const finalOpponentScore = opponentScore + (opponentWon ? 1 : 0);
      onComplete(finalPlayerScore > finalOpponentScore);
    } else {
      setRound(prev => prev + 1);
      setTimeLeft(30);
    }
  };

  if (!game) return null;

  const renderGame = () => {
    if (game.id === 'trend_prediction') {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white text-center">
            Will this stock trend UP or DOWN?
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleRoundComplete(true)}
                className="w-full h-32 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <TrendingUp className="w-12 h-12" />
                <span className="ml-2 text-2xl font-black">UP</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleRoundComplete(false)}
                className="w-full h-32 bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <TrendingDown className="w-12 h-12" />
                <span className="ml-2 text-2xl font-black">DOWN</span>
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }

    if (game.id === 'stock_race') {
      const stocks = ['AAPL', 'GOOGL', 'TSLA', 'MSFT'];
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white text-center">
            Pick the winning stock!
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {stocks.map((stock) => (
              <motion.div key={stock} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleRoundComplete(true)}
                  className="w-full h-24 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-2xl font-black"
                >
                  {stock}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (game.id === 'quick_trade') {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white text-center">
            BUY or SELL? Quick!
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleRoundComplete(true)}
                className="w-full h-32 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <span className="text-3xl font-black">BUY</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleRoundComplete(false)}
                className="w-full h-32 bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <span className="text-3xl font-black">SELL</span>
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 border-4 border-purple-500/60">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-cyan-400 text-sm font-bold">YOU</p>
              <p className="text-white text-4xl font-black">{playerScore}</p>
            </div>
            <div className="text-center">
              <p className="text-purple-400 text-sm font-bold">ROUND</p>
              <p className="text-white text-4xl font-black">{round + 1}/{game.rounds}</p>
            </div>
            <div className="text-center">
              <p className="text-red-400 text-sm font-bold">ENEMY</p>
              <p className="text-white text-4xl font-black">{opponentScore}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-yellow-400 text-2xl font-black">⏱️ {timeLeft}s</p>
          </div>

          {renderGame()}
        </CardContent>
      </Card>
    </div>
  );
}