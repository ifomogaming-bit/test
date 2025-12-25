import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Sparkles, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.' },
  { ticker: 'BTC-USD', name: 'Bitcoin' },
  { ticker: 'ETH-USD', name: 'Ethereum' },
  { ticker: 'SPY', name: 'S&P 500 ETF' }
];

const generateReward = () => {
  const rand = Math.random();
  
  if (rand < 0.0003) { // 0.03% - Legendary (25-35 shares)
    return {
      shares: 25 + Math.random() * 10,
      rarity: 'legendary'
    };
  } else if (rand < 0.003) { // 0.27% - Epic (12-20 shares)
    return {
      shares: 12 + Math.random() * 8,
      rarity: 'epic'
    };
  } else if (rand < 0.03) { // 2.7% - Rare (4-10 shares)
    return {
      shares: 4 + Math.random() * 6,
      rarity: 'rare'
    };
  } else if (rand < 0.15) { // 12% - Uncommon (1.5-3 shares)
    return {
      shares: 1.5 + Math.random() * 1.5,
      rarity: 'uncommon'
    };
  } else { // 85% - Common (0.1-1 shares)
    return {
      shares: 0.1 + Math.random() * 0.9,
      rarity: 'common'
    };
  }
};

const RARITY_CONFIG = {
  common: { 
    color: 'from-slate-400 to-slate-600', 
    glow: 'rgba(148, 163, 184, 0.5)',
    label: 'Common',
    emoji: '📄'
  },
  uncommon: { 
    color: 'from-green-400 to-emerald-600', 
    glow: 'rgba(52, 211, 153, 0.5)',
    label: 'Uncommon',
    emoji: '✨'
  },
  rare: { 
    color: 'from-blue-400 to-cyan-600', 
    glow: 'rgba(56, 189, 248, 0.5)',
    label: 'Rare',
    emoji: '💎'
  },
  epic: { 
    color: 'from-purple-400 to-pink-600', 
    glow: 'rgba(168, 85, 247, 0.5)',
    label: 'Epic',
    emoji: '🌟'
  },
  legendary: { 
    color: 'from-yellow-400 to-orange-600', 
    glow: 'rgba(251, 191, 36, 0.8)',
    label: 'LEGENDARY',
    emoji: '👑'
  }
};

export default function ScratchCardGame({ player, onClose, onReward, canPlay = true }) {
  const [scratched, setScratched] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reward, setReward] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();

  if (!canPlay) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 rounded-2xl border-2 border-slate-700 max-w-md w-full p-6 relative"
        >
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-2">Daily Scratch Card</h2>
            <p className="text-slate-400">Come back tomorrow for your next scratch card!</p>
          </div>
        </motion.div>
      </div>
    );
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;
    
    // Draw scratch coating
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add pattern
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Add text
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
  }, []);

  const handleScratch = (e) => {
    if (!canvasRef.current || revealed) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * 2, y * 2, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Calculate scratched percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const scratchedPercent = (transparent / (pixels.length / 4)) * 100;
    setScratched(scratchedPercent);
    
    if (scratchedPercent > 60 && !revealed) {
      revealReward();
    }
  };

  const revealReward = () => {
    const rewardData = generateReward();
    const stock = STOCKS[Math.floor(Math.random() * STOCKS.length)];
    
    setReward(rewardData);
    setSelectedStock(stock);
    setRevealed(true);

    // Trigger confetti
    if (rewardData.rarity === 'legendary') {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#fb923c']
          });
        }, i * 200);
      }
    } else if (rewardData.rarity === 'epic' || rewardData.rarity === 'rare') {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  const saveScratchCardMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ScratchCard.create({
        player_id: player.id,
        guild_id: player.guild_id,
        ticker: selectedStock.ticker,
        shares_won: reward.shares,
        rarity: reward.rarity,
        scratched_at: new Date().toISOString()
      });

      const existing = await base44.entities.Portfolio.filter({
        player_id: player.id,
        ticker: selectedStock.ticker
      });

      if (existing.length > 0) {
        await base44.entities.Portfolio.update(existing[0].id, {
          shares: existing[0].shares + reward.shares
        });
      } else {
        await base44.entities.Portfolio.create({
          player_id: player.id,
          ticker: selectedStock.ticker,
          shares: reward.shares,
          avg_acquisition_price: 0,
          total_invested: 0
        });
      }

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'purchase',
        description: `Scratch Card: Won ${reward.shares.toFixed(4)} ${selectedStock.ticker}`,
        shares_change: reward.shares,
        stock_ticker: selectedStock.ticker
      });

      await base44.entities.Player.update(player.id, {
        last_scratch_card: new Date().toISOString()
      });

      // Notify parent
      if (onReward) {
        onReward({ type: 'stock', amount: reward.shares, ticker: selectedStock.ticker });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolio']);
      queryClient.invalidateQueries(['player']);
      setTimeout(() => onClose(), 3000);
    }
  });

  const rarityInfo = reward ? RARITY_CONFIG[reward.rarity] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 rounded-2xl border-2 border-slate-700 max-w-2xl w-full p-6 relative overflow-hidden"
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="scratch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Daily Scratch Card</h2>
              <p className="text-slate-400 mb-6">Scratch to reveal your stock reward!</p>

              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
                <canvas
                  ref={canvasRef}
                  className="relative rounded-xl cursor-pointer border-4 border-slate-700"
                  style={{ width: 400, height: 300 }}
                  onMouseMove={handleScratch}
                  onMouseDown={handleScratch}
                  onTouchMove={handleScratch}
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Progress</p>
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${Math.min(scratched, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mb-6"
              >
                <div className={`inline-block p-8 rounded-3xl bg-gradient-to-br ${rarityInfo.color} relative`}>
                  <div 
                    className="absolute inset-0 rounded-3xl animate-pulse"
                    style={{ boxShadow: `0 0 60px ${rarityInfo.glow}` }}
                  />
                  <div className="relative">
                    <p className="text-6xl mb-4">{rarityInfo.emoji}</p>
                    <p className="text-white text-2xl font-bold">{rarityInfo.label}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 mb-8"
              >
                <h3 className="text-4xl font-bold text-white">
                  {reward.shares.toFixed(4)} Shares
                </h3>
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Stock Awarded</p>
                  <p className="text-white text-3xl font-bold mb-1">{selectedStock.ticker}</p>
                  <p className="text-slate-300">{selectedStock.name}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Rarity</p>
                        <p className="text-white font-bold">{rarityInfo.label}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Value</p>
                        <p className="text-green-400 font-bold">
                          {reward.shares >= 1 ? 'High Value!' : 'Growing Portfolio'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={() => saveScratchCardMutation.mutate()}
                  className={`w-full py-6 text-lg font-bold bg-gradient-to-r ${rarityInfo.color} hover:opacity-90`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Claim Reward
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}