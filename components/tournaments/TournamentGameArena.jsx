import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Target, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { StockPredictionRace, LightningTrading, PortfolioBuilder } from './TournamentMiniGames';

const GAME_CONFIGS = {
  stock_prediction: {
    component: StockPredictionRace,
    name: '📈 Stock Prediction Race',
    duration: 30,
    maxScore: 1000
  },
  lightning_trading: {
    component: LightningTrading,
    name: '⚡ Lightning Trading',
    duration: 45,
    maxScore: 2000
  },
  portfolio_builder: {
    component: PortfolioBuilder,
    name: '💼 Portfolio Builder',
    duration: 60,
    maxScore: 1500
  },
  trend_tapper: {
    component: TrendTapper,
    name: '📊 Trend Tapper',
    duration: 40,
    maxScore: 1200
  },
  market_race: {
    component: MarketRace,
    name: '🏁 Market Race',
    duration: 50,
    maxScore: 1800
  }
};

// Trend Tapper Game
function TrendTapper({ onComplete, duration = 40 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [currentTrend, setCurrentTrend] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const trends = [
    { direction: 'up', pattern: [1, 2, 3, 4, 5], icon: TrendingUp, color: 'green' },
    { direction: 'down', pattern: [5, 4, 3, 2, 1], icon: TrendingDown, color: 'red' },
    { direction: 'up', pattern: [1, 3, 2, 4, 5], icon: TrendingUp, color: 'green' },
    { direction: 'down', pattern: [5, 3, 4, 2, 1], icon: TrendingDown, color: 'red' }
  ];

  useEffect(() => {
    generateTrend();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generateTrend = () => {
    setCurrentTrend(trends[Math.floor(Math.random() * trends.length)]);
    setShowFeedback(false);
  };

  const guessDirection = (guess) => {
    const correct = guess === currentTrend.direction;
    setShowFeedback(correct);
    
    if (correct) {
      setScore(prev => prev + 150);
    }

    setTimeout(() => generateTrend(), 1000);
  };

  return (
    <div className="h-full bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
          📊 Trend Tapper
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-violet-400 text-sm">Time</p>
            <p className="text-white text-2xl font-black">{timeLeft}s</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 text-sm">Score</p>
            <p className="text-white text-2xl font-black">{score}</p>
          </div>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-violet-500/50 mb-6">
        <CardContent className="p-8">
          {currentTrend && (
            <>
              <div className="h-48 flex items-end justify-between gap-2 mb-8">
                {currentTrend.pattern.map((val, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / 5) * 100}%` }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex-1 rounded-t-lg ${
                      currentTrend.direction === 'up' ? 'bg-gradient-to-t from-green-600 to-emerald-500' : 'bg-gradient-to-t from-red-600 to-orange-500'
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-center mb-4"
                  >
                    <p className="text-green-400 text-3xl font-black">+150 Points! ✓</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => guessDirection('up')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-20 text-xl font-black"
                >
                  <TrendingUp className="w-8 h-8 mr-2" />
                  UPTREND
                </Button>
                <Button
                  onClick={() => guessDirection('down')}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 h-20 text-xl font-black"
                >
                  <TrendingDown className="w-8 h-8 mr-2" />
                  DOWNTREND
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Market Race Game
function MarketRace({ onComplete, duration = 50 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const obstacleSpawner = setInterval(() => {
      setObstacles(prev => [...prev, { id: Date.now(), y: 0, lane: Math.floor(Math.random() * 3) }]);
    }, 1500);

    const coinSpawner = setInterval(() => {
      setCoins(prev => [...prev, { id: Date.now() + 0.5, y: 0, lane: Math.floor(Math.random() * 3) }]);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(obstacleSpawner);
      clearInterval(coinSpawner);
    };
  }, []);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setObstacles(prev => prev
        .map(obs => ({ ...obs, y: obs.y + 5 }))
        .filter(obs => obs.y < 100)
      );
      setCoins(prev => prev
        .map(coin => ({ ...coin, y: coin.y + 5 }))
        .filter(coin => coin.y < 100)
      );

      // Check collisions
      obstacles.forEach(obs => {
        if (obs.y > 70 && obs.y < 85 && obs.lane === position) {
          setScore(prev => Math.max(0, prev - 50));
        }
      });

      coins.forEach(coin => {
        if (coin.y > 70 && coin.y < 85 && coin.lane === position) {
          setScore(prev => prev + 100);
          setCoins(prev => prev.filter(c => c.id !== coin.id));
        }
      });
    }, 100);

    return () => clearInterval(moveInterval);
  }, [position, obstacles, coins]);

  return (
    <div className="h-full bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950 p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          🏁 Market Race
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-cyan-400 text-sm">Time</p>
            <p className="text-white text-2xl font-black">{timeLeft}s</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 text-sm">Score</p>
            <p className="text-white text-2xl font-black">{score}</p>
          </div>
        </div>
      </div>

      <div className="relative h-96 bg-slate-900/50 rounded-xl border-2 border-cyan-500/50 overflow-hidden">
        {/* Race lanes */}
        <div className="absolute inset-0 grid grid-cols-3">
          {[0, 1, 2].map(lane => (
            <div key={lane} className={`border-r border-slate-700/50 ${lane === position ? 'bg-cyan-500/10' : ''}`} />
          ))}
        </div>

        {/* Player car */}
        <motion.div
          className="absolute bottom-16 w-16 h-16"
          animate={{ left: `${position * 33.33 + 16.67}%` }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg border-2 border-cyan-300 shadow-2xl shadow-cyan-500/50 flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            className="absolute w-12 h-12 transition-all"
            style={{ 
              left: `${obs.lane * 33.33 + 16.67}%`, 
              top: `${obs.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-red-600 to-orange-600 rounded border-2 border-red-400" />
          </div>
        ))}

        {/* Coins */}
        {coins.map(coin => (
          <motion.div
            key={coin.id}
            className="absolute w-10 h-10"
            style={{ 
              left: `${coin.lane * 33.33 + 16.67}%`, 
              top: `${coin.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-yellow-300 shadow-lg shadow-yellow-500/50" />
          </motion.div>
        ))}

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <Button
            onClick={() => setPosition(Math.max(0, position - 1))}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ← Left
          </Button>
          <Button
            onClick={() => setPosition(Math.min(2, position + 1))}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Right →
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TournamentGameArena({ tournament, player, onComplete, onBack }) {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameScores, setGameScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);

  const gameTypes = tournament?.game_types || ['stock_prediction', 'lightning_trading'];
  const currentGameType = gameTypes[currentGameIndex];
  const gameConfig = GAME_CONFIGS[currentGameType];

  const handleGameComplete = (score) => {
    const newScores = { ...gameScores, [currentGameType]: score };
    setGameScores(newScores);
    
    const newTotal = Object.values(newScores).reduce((sum, s) => sum + s, 0);
    setTotalScore(newTotal);

    if (currentGameIndex < gameTypes.length - 1) {
      setTimeout(() => {
        setCurrentGameIndex(prev => prev + 1);
      }, 2000);
    } else {
      setTimeout(() => {
        onComplete(newTotal);
      }, 2000);
    }
  };

  const GameComponent = gameConfig?.component;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-purple-500/50 text-white hover:bg-purple-500/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit Tournament
          </Button>

          <div className="text-center">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {tournament?.name}
            </h2>
            <p className="text-slate-400">
              Game {currentGameIndex + 1} of {gameTypes.length}
            </p>
          </div>

          <div className="text-right">
            <p className="text-slate-400 text-sm">Total Score</p>
            <p className="text-yellow-400 text-3xl font-black">{totalScore}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress 
            value={((currentGameIndex + 1) / gameTypes.length) * 100}
            className="h-3"
          />
          <div className="flex justify-between mt-2">
            {gameTypes.map((gameType, idx) => (
              <div key={idx} className={`text-xs ${idx <= currentGameIndex ? 'text-purple-400' : 'text-slate-600'}`}>
                {GAME_CONFIGS[gameType]?.name || gameType}
              </div>
            ))}
          </div>
        </div>

        {/* Game Arena */}
        <div className="flex-1">
          {GameComponent && (
            <GameComponent 
              key={currentGameType}
              onComplete={handleGameComplete}
              duration={gameConfig.duration}
            />
          )}
        </div>
      </div>
    </div>
  );
}