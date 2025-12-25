import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StockBubble from './StockBubble';
import QuestionModal from './QuestionModal';
import RewardModal from './RewardModal';
import { generateQuestion, generateReward, getRandomPosition } from './gameUtils';

const MAP_THEMES = {
  1: { 
    name: 'Wall Street', 
    bg: 'from-slate-950 via-blue-950 to-slate-950', 
    pattern: 'opacity-10',
    glow: 'from-blue-500/20',
    particleColor: 'text-blue-400',
    decorations: [
      { emoji: '🏛️', x: '10%', y: '15%', size: 'text-7xl', opacity: 'opacity-30', float: true },
      { emoji: '📈', x: '80%', y: '25%', size: 'text-6xl', opacity: 'opacity-25', float: true },
      { emoji: '💼', x: '15%', y: '70%', size: 'text-5xl', opacity: 'opacity-20', pulse: true },
      { emoji: '🏢', x: '75%', y: '75%', size: 'text-7xl', opacity: 'opacity-30', float: true }
    ]
  },
  2: { 
    name: 'Bull Market', 
    bg: 'from-green-950 via-emerald-950 to-green-950', 
    pattern: 'opacity-15',
    glow: 'from-green-500/30',
    particleColor: 'text-green-400',
    decorations: [
      { emoji: '🐂', x: '12%', y: '20%', size: 'text-8xl', opacity: 'opacity-40', rise: true },
      { emoji: '📊', x: '78%', y: '30%', size: 'text-6xl', opacity: 'opacity-30', pulse: true },
      { emoji: '💹', x: '20%', y: '65%', size: 'text-7xl', opacity: 'opacity-25', rise: true },
      { emoji: '🚀', x: '70%', y: '70%', size: 'text-6xl', opacity: 'opacity-30', rise: true }
    ]
  },
  3: { 
    name: 'Bear Cave', 
    bg: 'from-red-950 via-orange-950 to-red-950', 
    pattern: 'opacity-15',
    glow: 'from-red-500/30',
    particleColor: 'text-red-400',
    decorations: [
      { emoji: '🐻', x: '15%', y: '18%', size: 'text-8xl', opacity: 'opacity-40', shake: true },
      { emoji: '📉', x: '75%', y: '28%', size: 'text-7xl', opacity: 'opacity-30', fall: true },
      { emoji: '⚠️', x: '18%', y: '68%', size: 'text-6xl', opacity: 'opacity-25', pulse: true },
      { emoji: '🔻', x: '72%', y: '75%', size: 'text-5xl', opacity: 'opacity-30', fall: true }
    ]
  },
  4: { 
    name: 'Tech Hub', 
    bg: 'from-cyan-950 via-blue-950 to-indigo-950', 
    pattern: 'opacity-15',
    glow: 'from-cyan-500/30',
    particleColor: 'text-cyan-400',
    decorations: [
      { emoji: '💻', x: '10%', y: '15%', size: 'text-7xl', opacity: 'opacity-35', pulse: true },
      { emoji: '🖥️', x: '80%', y: '22%', size: 'text-6xl', opacity: 'opacity-30', pulse: true },
      { emoji: '⚡', x: '15%', y: '72%', size: 'text-7xl', opacity: 'opacity-25', glow: true },
      { emoji: '🔧', x: '78%', y: '68%', size: 'text-5xl', opacity: 'opacity-20', spin: true },
      { emoji: '🌐', x: '45%', y: '85%', size: 'text-6xl', opacity: 'opacity-15', spin: true }
    ]
  },
  5: { 
    name: 'Crypto Den', 
    bg: 'from-purple-950 via-violet-950 to-fuchsia-950', 
    pattern: 'opacity-15',
    glow: 'from-purple-500/30',
    particleColor: 'text-purple-400',
    decorations: [
      { emoji: '₿', x: '12%', y: '18%', size: 'text-8xl', opacity: 'opacity-40', glow: true },
      { emoji: 'Ξ', x: '75%', y: '25%', size: 'text-7xl', opacity: 'opacity-35', glow: true },
      { emoji: '🪙', x: '20%', y: '70%', size: 'text-6xl', opacity: 'opacity-30', spin: true },
      { emoji: '💎', x: 'emit-70%', y: '72%', size: 'text-7xl', opacity: 'opacity-35', sparkle: true }
    ]
  },
  6: { 
    name: 'Gold Reserve', 
    bg: 'from-yellow-950 via-amber-950 to-yellow-950', 
    pattern: 'opacity-15',
    glow: 'from-yellow-500/30',
    particleColor: 'text-yellow-400',
    decorations: [
      { emoji: '🪙', x: '15%', y: '20%', size: 'text-8xl', opacity: 'opacity-40', shimmer: true },
      { emoji: '🏆', x: '78%', y: '25%', size: 'text-7xl', opacity: 'opacity-35', float: true },
      { emoji: '👑', x: '18%', y: '68%', size: 'text-6xl', opacity: 'opacity-30', shimmer: true },
      { emoji: '💰', x: '75%', y: '70%', size: 'text-7xl', opacity: 'opacity-35', shimmer: true }
    ]
  },
  7: { 
    name: 'Diamond Floor', 
    bg: 'from-cyan-950 via-blue-950 to-purple-950', 
    pattern: 'opacity-15',
    glow: 'from-cyan-500/30',
    particleColor: 'text-cyan-300',
    decorations: [
      { emoji: '💎', x: '10%', y: '15%', size: 'text-9xl', opacity: 'opacity-50', sparkle: true },
      { emoji: '✨', x: '80%', y: '20%', size: 'text-7xl', opacity: 'opacity-35', sparkle: true },
      { emoji: '🌟', x: '15%', y: '75%', size: 'text-6xl', opacity: 'opacity-30', glow: true },
      { emoji: '💠', x: '78%', y: '70%', size: 'text-8xl', opacity: 'opacity-40', sparkle: true }
    ]
  },
  8: { 
    name: 'Whale Waters', 
    bg: 'from-blue-950 via-cyan-950 to-blue-950', 
    pattern: 'opacity-15',
    glow: 'from-blue-500/30',
    particleColor: 'text-blue-300',
    decorations: [
      { emoji: '🐋', x: '12%', y: '18%', size: 'text-9xl', opacity: 'opacity-50', wave: true },
      { emoji: '🌊', x: '75%', y: '22%', size: 'text-7xl', opacity: 'opacity-35', wave: true },
      { emoji: '💵', x: '20%', y: '70%', size: 'text-8xl', opacity: 'opacity-40', float: true },
      { emoji: '🐳', x: '72%', y: '75%', size: 'text-7xl', opacity: 'opacity-35', wave: true }
    ]
  },
  9: { 
    name: 'Moon Base', 
    bg: 'from-indigo-950 via-purple-950 to-pink-950', 
    pattern: 'opacity-15',
    glow: 'from-purple-500/30',
    particleColor: 'text-purple-300',
    decorations: [
      { emoji: '🚀', x: '15%', y: '15%', size: 'text-9xl', opacity: 'opacity-50', launch: true },
      { emoji: '🌙', x: '78%', y: '20%', size: 'text-8xl', opacity: 'opacity-40', glow: true },
      { emoji: '🌠', x: '18%', y: '72%', size: 'text-7xl', opacity: 'opacity-35', sparkle: true },
      { emoji: '⭐', x: '75%', y: '75%', size: 'text-6xl', opacity: 'opacity-30', sparkle: true },
      { emoji: '🛸', x: '50%', y: '85%', size: 'text-7xl', opacity: 'opacity-25', float: true }
    ]
  },
  10: { 
    name: 'Elite Club', 
    bg: 'from-black via-yellow-950 to-black', 
    pattern: 'opacity-10',
    glow: 'from-yellow-500/40',
    particleColor: 'text-yellow-300',
    decorations: [
      { emoji: '👑', x: '12%', y: '18%', size: 'text-9xl', opacity: 'opacity-50', royal: true },
      { emoji: '🏰', x: '78%', y: '22%', size: 'text-8xl', opacity: 'opacity-45', float: true },
      { emoji: '💎', x: '15%', y: '70%', size: 'text-8xl', opacity: 'opacity-40', shimmer: true },
      { emoji: '🎩', x: '75%', y: '75%', size: 'text-7xl', opacity: 'opacity-35', float: true },
      { emoji: '🥂', x: '45%', y: '12%', size: 'text-6xl', opacity: 'opacity-30', float: true }
    ]
  }
};

const STOCK_TICKERS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'NFLX', 'DIS', 
  'JPM', 'V', 'MA', 'WMT', 'KO', 'PEP', 'INTC', 'CSCO', 'BA', 'NKE',
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'ADA-USD', 'XRP-USD', 'DOT-USD', 
  'DOGE-USD', 'AVAX-USD', 'MATIC-USD', 'LINK-USD', 'UNI-USD', 'ATOM-USD', 'LTC-USD'
];

export default function GameMap({ 
  mapId = 1, 
  player,
  onBubblePop,
  stockPrices = {}
}) {
  const [bubbles, setBubbles] = useState([]);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [streak, setStreak] = useState(player?.streak || 0);

  const theme = MAP_THEMES[mapId] || MAP_THEMES[1];

  // Generate initial bubbles
  useEffect(() => {
    const generateBubbles = () => {
      const numBubbles = Math.min(5 + mapId, 10);
      const newBubbles = [];
      
      for (let i = 0; i < numBubbles; i++) {
        const ticker = STOCK_TICKERS[Math.floor(Math.random() * STOCK_TICKERS.length)];
        const rarityRoll = Math.random();
        let rarity = 'common';
        if (rarityRoll > 0.97) rarity = 'legendary';
        else if (rarityRoll > 0.90) rarity = 'epic';
        else if (rarityRoll > 0.70) rarity = 'rare';
        
        const isLucky = Math.random() > 0.97;
        
        newBubbles.push({
          id: `bubble-${Date.now()}-${i}`,
          ticker,
          price: stockPrices[ticker] || Math.random() * 200 + 50,
          priceChange: (Math.random() - 0.5) * 10,
          rarity,
          isLucky,
          position: getRandomPosition(i, numBubbles)
        });
      }
      
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, [mapId, stockPrices]);

  const handleBubbleClick = (bubble) => {
    setSelectedBubble(bubble);
    setCurrentQuestion(generateQuestion(bubble.ticker, mapId));
    setShowQuestion(true);
  };

  const handleAnswer = (isCorrect, answerIndex) => {
    setShowQuestion(false);
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      const reward = generateReward(selectedBubble, newStreak);
      setCurrentReward(reward);
      setShowReward(true);
      
      // Remove bubble
      setBubbles(prev => prev.filter(b => b.id !== selectedBubble.id));
    } else {
      setStreak(0);
      setSelectedBubble(null);
    }
  };

  const handleClaimReward = async () => {
    if (currentReward && selectedBubble) {
      onBubblePop({
        ...currentReward,
        ticker: selectedBubble.ticker,
        rarity: selectedBubble.rarity,
        streak
      });

      // Update quest progress
      const { updateQuestProgress } = await import('@/components/progression/QuestService');
      await updateQuestProgress(player.id, 'answer_questions', 1);
      await updateQuestProgress(player.id, 'pop_bubbles', 1);
      
      if (selectedBubble.rarity === 'rare' || selectedBubble.rarity === 'epic' || selectedBubble.rarity === 'legendary') {
        await updateQuestProgress(player.id, 'pop_bubbles', 1);
      }
    }
    setShowReward(false);
    setCurrentReward(null);
    setSelectedBubble(null);
  };

  return (
    <div className={`relative w-full h-full min-h-[600px] bg-gradient-to-br ${theme.bg} rounded-2xl overflow-hidden shadow-2xl`}>
      {/* Animated Background Glow */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${theme.glow} to-transparent blur-3xl`}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-1 h-1 ${theme.particleColor} rounded-full blur-sm`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Grid Pattern with Animation */}
      <motion.div 
        className={`absolute inset-0 ${theme.pattern}`} 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '50px 50px']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Thematic Decorations with Animations */}
      {theme.decorations?.map((deco, i) => (
        <motion.div
          key={i}
          className={`absolute ${deco.size} ${deco.opacity} pointer-events-none select-none filter drop-shadow-2xl`}
          style={{
            left: deco.x,
            top: deco.y,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            y: deco.float ? [-10, 10, -10] : deco.rise ? [-20, -40, -20] : deco.fall ? [10, 30, 10] : deco.wave ? [-15, 15, -15] : 0,
            x: deco.wave ? [-10, 10, -10] : deco.shake ? [-5, 5, -5] : 0,
            rotate: deco.spin ? [0, 360] : deco.royal ? [0, 10, 0, -10, 0] : 0,
            scale: deco.pulse ? [1, 1.15, 1] : deco.sparkle ? [0.9, 1.2, 0.9] : deco.shimmer ? [1, 1.1, 1] : deco.launch ? [0.9, 1.1, 0.9] : 1,
            opacity: deco.glow ? [parseFloat(deco.opacity.replace('opacity-', '')) / 100, parseFloat(deco.opacity.replace('opacity-', '')) / 100 * 1.5, parseFloat(deco.opacity.replace('opacity-', '')) / 100] : undefined
          }}
          transition={{
            duration: deco.launch ? 2 : deco.spin ? 4 : 3.5,
            repeat: Infinity,
            ease: deco.launch ? "easeOut" : "easeInOut",
            delay: i * 0.3
          }}
        >
          {deco.emoji}
        </motion.div>
      ))}
      
      {/* Map Title with Glow */}
      <div className="absolute top-4 left-4 z-10">
        <motion.h2 
          className="text-3xl font-black text-white drop-shadow-2xl"
          animate={{
            textShadow: [
              `0 0 10px ${theme.particleColor}`,
              `0 0 30px ${theme.particleColor}`,
              `0 0 10px ${theme.particleColor}`
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          {theme.name}
        </motion.h2>
        <p className="text-white/80 text-sm font-bold">Map {mapId} of 10</p>
      </div>

      {/* Streak Counter with Glow */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            boxShadow: [
              '0 0 20px rgba(251, 146, 60, 0.4)',
              '0 0 40px rgba(251, 146, 60, 0.6)',
              '0 0 20px rgba(251, 146, 60, 0.4)'
            ]
          }}
          transition={{
            boxShadow: {
              duration: 1.5,
              repeat: Infinity
            }
          }}
          className="absolute top-4 right-4 z-10 px-5 py-3 bg-gradient-to-r from-orange-500/30 to-red-500/30 border-2 border-orange-400/60 rounded-full backdrop-blur-sm"
        >
          <span className="text-orange-300 font-black text-lg drop-shadow-lg">🔥 {streak} Streak</span>
        </motion.div>
      )}

      {/* Bubbles */}
      <AnimatePresence>
        {bubbles.map(bubble => (
          <StockBubble
            key={bubble.id}
            bubble={bubble}
            onClick={() => handleBubbleClick(bubble)}
            isLucky={bubble.isLucky}
          />
        ))}
      </AnimatePresence>

      {/* Empty State with Celebration */}
      {bubbles.length === 0 && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="text-center p-10 bg-gradient-to-br from-black/50 to-black/30 rounded-3xl backdrop-blur-lg border-2 border-white/20 shadow-2xl"
            animate={{
              boxShadow: [
                '0 0 30px rgba(34, 197, 94, 0.3)',
                '0 0 60px rgba(34, 197, 94, 0.5)',
                '0 0 30px rgba(34, 197, 94, 0.3)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-3">
              All Bubbles Collected!
            </p>
            <p className="text-white/80 font-medium">New bubbles will appear after the cooldown</p>
          </motion.div>
        </motion.div>
      )}

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestion && currentQuestion && (
          <QuestionModal
            question={currentQuestion}
            onAnswer={handleAnswer}
            onClose={() => setShowQuestion(false)}
            streak={streak}
          />
        )}
      </AnimatePresence>

      {/* Reward Modal */}
      <AnimatePresence>
        {showReward && currentReward && (
          <RewardModal
            reward={currentReward}
            onClaim={handleClaimReward}
            onClose={() => {
              setShowReward(false);
              setSelectedBubble(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}