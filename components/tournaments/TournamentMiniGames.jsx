import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Clock, 
  Trophy,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Flame,
  Star
} from 'lucide-react';

// Stock Price Prediction Race
export function StockPredictionRace({ onComplete, duration = 30 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [currentStock, setCurrentStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(100);
  const [priceHistory, setPriceHistory] = useState([100]);
  const [prediction, setPrediction] = useState(null);

  const stocks = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA'];

  useEffect(() => {
    generateNewStock();
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

  const generateNewStock = () => {
    setCurrentStock(stocks[Math.floor(Math.random() * stocks.length)]);
    const newPrice = 50 + Math.random() * 150;
    setStockPrice(newPrice);
    setPriceHistory([newPrice]);
    setPrediction(null);

    // Simulate price movement
    let moveCount = 0;
    const priceInterval = setInterval(() => {
      moveCount++;
      setStockPrice(prev => {
        const change = (Math.random() - 0.48) * 5;
        const newVal = Math.max(10, prev + change);
        setPriceHistory(hist => [...hist.slice(-9), newVal]);
        return newVal;
      });

      if (moveCount >= 3) {
        clearInterval(priceInterval);
      }
    }, 1000);
  };

  const makePrediction = (direction) => {
    if (prediction) return;
    setPrediction(direction);

    setTimeout(() => {
      const finalChange = stockPrice - priceHistory[0];
      const correct = (direction === 'up' && finalChange > 0) || (direction === 'down' && finalChange < 0);
      
      if (correct) {
        setScore(prev => prev + 100);
      }

      setTimeout(() => generateNewStock(), 1000);
    }, 2000);
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-950 via-purple-950 to-indigo-950 p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          📈 Stock Prediction Race
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

      <Card className="bg-slate-800/50 border-cyan-500/50 mb-6">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p className="text-white text-4xl font-black mb-2">{currentStock}</p>
            <motion.p
              key={stockPrice}
              initial={{ scale: 1.5, color: '#fff' }}
              animate={{ scale: 1 }}
              className="text-5xl font-black text-cyan-400"
            >
              ${stockPrice.toFixed(2)}
            </motion.p>
          </div>

          <div className="h-32 flex items-end justify-between gap-1 mb-6">
            {priceHistory.map((price, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${(price / 200) * 100}%` }}
                className={`flex-1 rounded-t ${
                  idx === priceHistory.length - 1 ? 'bg-cyan-500' :
                  price > priceHistory[Math.max(0, idx - 1)] ? 'bg-green-500/50' : 'bg-red-500/50'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => makePrediction('up')}
              disabled={!!prediction}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-16 text-xl font-black"
            >
              <ArrowUp className="w-6 h-6 mr-2" />
              UP
            </Button>
            <Button
              onClick={() => makePrediction('down')}
              disabled={!!prediction}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 h-16 text-xl font-black"
            >
              <ArrowDown className="w-6 h-6 mr-2" />
              DOWN
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Lightning Trading Challenge
export function LightningTrading({ onComplete, duration = 45 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const [combo, setCombo] = useState(0);

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

    const targetSpawner = setInterval(() => {
      const newTarget = {
        id: Date.now(),
        x: Math.random() * 80,
        y: Math.random() * 70,
        value: Math.floor(Math.random() * 3) + 1,
        type: Math.random() > 0.8 ? 'bonus' : 'normal'
      };
      setTargets(prev => [...prev, newTarget]);

      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== newTarget.id));
      }, 2000);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(targetSpawner);
    };
  }, []);

  const hitTarget = (target) => {
    setTargets(prev => prev.filter(t => t.id !== target.id));
    const points = target.type === 'bonus' ? target.value * 50 : target.value * 10;
    setScore(prev => prev + points * (1 + combo * 0.1));
    setCombo(prev => prev + 1);

    setTimeout(() => setCombo(0), 2000);
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-950 via-pink-950 to-rose-950 p-6 rounded-2xl relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            ⚡ Lightning Trading
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-pink-400 text-sm">Time</p>
              <p className="text-white text-2xl font-black">{timeLeft}s</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 text-sm">Score</p>
              <p className="text-white text-2xl font-black">{score}</p>
            </div>
            {combo > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center bg-orange-500/20 px-4 py-2 rounded-lg border-2 border-orange-400"
              >
                <p className="text-orange-400 text-sm">Combo</p>
                <p className="text-white text-2xl font-black">x{combo}</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="relative h-96 bg-slate-900/50 rounded-xl border-2 border-purple-500/50">
          <AnimatePresence>
            {targets.map(target => (
              <motion.button
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => hitTarget(target)}
                className={`absolute w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl ${
                  target.type === 'bonus'
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-4 border-yellow-300 shadow-2xl shadow-yellow-500/50'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-2 border-purple-300'
                }`}
                style={{ left: `${target.x}%`, top: `${target.y}%` }}
              >
                {target.type === 'bonus' ? <Star className="w-8 h-8" /> : <DollarSign className="w-6 h-6" />}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Portfolio Builder Sprint
export function PortfolioBuilder({ onComplete, duration = 60 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [targetValue, setTargetValue] = useState(1000);

  const stockPool = [
    { ticker: 'AAPL', price: 180, sector: 'tech' },
    { ticker: 'TSLA', price: 250, sector: 'auto' },
    { ticker: 'GOOGL', price: 140, sector: 'tech' },
    { ticker: 'JPM', price: 150, sector: 'finance' },
    { ticker: 'NVDA', price: 500, sector: 'tech' },
    { ticker: 'DIS', price: 90, sector: 'entertainment' }
  ];

  useEffect(() => {
    shuffleStocks();
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

  const shuffleStocks = () => {
    const shuffled = [...stockPool].sort(() => Math.random() - 0.5).slice(0, 4);
    setAvailableStocks(shuffled);
    setTargetValue(500 + Math.floor(Math.random() * 1000));
  };

  const addToPortfolio = (stock) => {
    setPortfolio(prev => [...prev, stock]);
    const newTotal = [...portfolio, stock].reduce((sum, s) => sum + s.price, 0);
    
    if (Math.abs(newTotal - targetValue) < 50) {
      setScore(prev => prev + 200);
      setPortfolio([]);
      shuffleStocks();
    }
  };

  const clearPortfolio = () => setPortfolio([]);

  const currentValue = portfolio.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="h-full bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          💼 Portfolio Builder Sprint
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

      <Card className="bg-slate-800/50 border-emerald-500/50 mb-4">
        <CardContent className="p-6">
          <p className="text-emerald-400 text-sm mb-2">Target Portfolio Value</p>
          <p className="text-white text-4xl font-black mb-4">${targetValue}</p>
          <p className="text-slate-400 text-sm">Build a portfolio within $50 of this value!</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-cyan-500/50 mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-cyan-400 text-sm">Your Portfolio Value</p>
            <Button onClick={clearPortfolio} variant="outline" size="sm" className="border-red-500 text-red-400">
              Clear
            </Button>
          </div>
          <p className="text-white text-3xl font-black mb-2">${currentValue}</p>
          <Progress 
            value={Math.min(100, (currentValue / targetValue) * 100)} 
            className="h-3 mb-2"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {portfolio.map((stock, idx) => (
              <div key={idx} className="px-3 py-1 bg-emerald-600/30 border border-emerald-500 rounded-lg">
                <p className="text-emerald-300 font-bold">{stock.ticker}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {availableStocks.map((stock, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToPortfolio(stock)}
            className="bg-gradient-to-br from-cyan-600/40 to-blue-600/40 border-2 border-cyan-400/50 rounded-xl p-4 text-left"
          >
            <p className="text-white text-xl font-black mb-1">{stock.ticker}</p>
            <p className="text-cyan-300 text-2xl font-black">${stock.price}</p>
            <p className="text-slate-400 text-xs mt-1">{stock.sector}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}