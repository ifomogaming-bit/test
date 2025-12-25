import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, TrendingUp, Coins, X, Zap, Award, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const rarityConfig = {
  common: { 
    bg: 'from-slate-700 to-slate-900', 
    text: 'text-slate-300',
    glow: 'shadow-slate-500/30',
    border: 'border-slate-400',
    multiplier: '1x'
  },
  rare: { 
    bg: 'from-blue-600 to-blue-900', 
    text: 'text-blue-300',
    glow: 'shadow-blue-500/60',
    border: 'border-blue-400',
    multiplier: '2x'
  },
  epic: { 
    bg: 'from-purple-600 to-purple-900', 
    text: 'text-purple-300',
    glow: 'shadow-purple-500/70',
    border: 'border-purple-400',
    multiplier: '5x'
  },
  legendary: { 
    bg: 'from-amber-500 to-orange-700', 
    text: 'text-yellow-300',
    glow: 'shadow-yellow-500/80',
    border: 'border-yellow-400',
    multiplier: '10x'
  }
};

export default function RewardModal({ 
  reward, 
  onClaim,
  onClose 
}) {
  const { ticker, shares, rarity, coins = 0, isLucky, streak = 0 } = reward;
  const config = rarityConfig[rarity] || rarityConfig.common;
  
  // Complete stock name mapping
  const stockNames = {
    // Tech Giants
    'AAPL': 'Apple Inc.', 'GOOGL': 'Alphabet Inc.', 'MSFT': 'Microsoft Corp.', 'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms', 'NVDA': 'NVIDIA Corp.', 'TSLA': 'Tesla Inc.', 'TSM': 'Taiwan Semiconductor',
    'ORCL': 'Oracle Corp.', 'IBM': 'IBM', 'INTC': 'Intel Corp.', 'AMD': 'Advanced Micro Devices',
    'MU': 'Micron Technology', 'HOOD': 'Robinhood', 'CRM': 'Salesforce', 'ADBE': 'Adobe Inc.',
    'NOW': 'ServiceNow', 'SNOW': 'Snowflake Inc.', 'PLTR': 'Palantir Technologies',
    // ETFs
    'SPY': 'S&P 500 ETF', 'QQQ': 'Nasdaq-100 ETF', 'IWM': 'Russell 2000 ETF', 'TQQQ': '3x Nasdaq Bull ETF',
    'XRT': 'Retail ETF', 'XLF': 'Financial Sector ETF', 'XLE': 'Energy Sector ETF', 'XLK': 'Tech Sector ETF',
    'VTI': 'Total Market ETF', 'VOO': 'Vanguard S&P 500',
    // Finance
    'JPM': 'JPMorgan Chase', 'BAC': 'Bank of America', 'GS': 'Goldman Sachs', 'MS': 'Morgan Stanley',
    'WFC': 'Wells Fargo', 'C': 'Citigroup', 'V': 'Visa Inc.', 'MA': 'Mastercard Inc.',
    'AXP': 'American Express', 'PYPL': 'PayPal Holdings', 'SQ': 'Block Inc.', 'COIN': 'Coinbase Global',
    // Retail
    'WMT': 'Walmart Inc.', 'TGT': 'Target Corp.', 'COST': 'Costco Wholesale', 'HD': 'Home Depot',
    'LOW': "Lowe's Companies", 'MCD': "McDonald's Corp.", 'SBUX': 'Starbucks Corp.', 'NKE': 'Nike Inc.',
    // Entertainment
    'NFLX': 'Netflix Inc.', 'DIS': 'Walt Disney Co.', 'CMCSA': 'Comcast Corp.', 'T': 'AT&T Inc.',
    'VZ': 'Verizon Communications',
    // Healthcare
    'JNJ': 'Johnson & Johnson', 'PFE': 'Pfizer Inc.', 'UNH': 'UnitedHealth Group', 'ABBV': 'AbbVie Inc.',
    'TMO': 'Thermo Fisher Scientific', 'ABT': 'Abbott Laboratories', 'MRNA': 'Moderna Inc.', 'REGN': 'Regeneron Pharmaceuticals',
    // Auto
    'F': 'Ford Motor', 'GM': 'General Motors', 'TM': 'Toyota Motor',
    // Energy
    'XOM': 'Exxon Mobil', 'CVX': 'Chevron Corp.', 'COP': 'ConocoPhillips',
    // Crypto
    'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'BNB-USD': 'Binance Coin', 'SOL-USD': 'Solana',
    'ADA-USD': 'Cardano', 'XRP-USD': 'Ripple', 'DOT-USD': 'Polkadot', 'AVAX-USD': 'Avalanche',
    'MATIC-USD': 'Polygon', 'LINK-USD': 'Chainlink', 'UNI-USD': 'Uniswap', 'ATOM-USD': 'Cosmos',
    'LTC-USD': 'Litecoin', 'DOGE-USD': 'Dogecoin', 'SHIB-USD': 'Shiba Inu', 'PEPE-USD': 'Pepe',
    'FLOKI-USD': 'Floki Inu', 'WIF-USD': 'dogwifhat', 'BONK-USD': 'Bonk', 'MEME-USD': 'Memecoin'
  };
  
  const stockName = stockNames[ticker] || ticker;

  useEffect(() => {
    // Play congratulations sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Celebration melody based on rarity
    const notes = rarity === 'legendary' ? [523.25, 659.25, 783.99, 1046.50] : 
                   rarity === 'epic' ? [440, 554.37, 659.25, 783.99] :
                   rarity === 'rare' ? [440, 554.37, 659.25] :
                   [392, 523.25, 659.25];
    
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const startTime = now + i * 0.12;
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
    
    // Trigger confetti for rare rewards
    if (rarity === 'epic' || rarity === 'legendary') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: rarity === 'legendary' ? ['#FCD34D', '#FBBF24', '#F59E0B'] : ['#A78BFA', '#8B5CF6']
      });
    } else if (isLucky) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    return () => {
      audioContext.close();
    };
  }, [rarity, isLucky]);

  const shareValue = shares * 100; // Approximate value

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className={`relative w-full max-w-md sm:max-w-lg my-auto bg-gradient-to-br ${config.bg} rounded-2xl sm:rounded-3xl border-2 sm:border-4 ${config.border} shadow-2xl ${config.glow} overflow-hidden`}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-50 animate-pulse`} />
          {(rarity === 'legendary' || rarity === 'epic') && (
            <>
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
            </>
          )}
          {rarity === 'rare' && (
            <>
              <div className="absolute top-0 right-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl animate-pulse" />
            </>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white z-10 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="relative p-4 sm:p-8 text-center">
          {/* Rarity Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/30 rounded-full border border-white/20 mb-3 sm:mb-4"
          >
            <Trophy className={`w-3 sm:w-4 h-3 sm:h-4 ${config.text}`} />
            <span className="text-white/90 text-xs sm:text-sm uppercase tracking-widest font-bold">
              {rarity} Bubble
            </span>
            {isLucky && <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 animate-pulse" />}
          </motion.div>

          {/* Reward Icon with Animation */}
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 3, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            className="relative mx-auto w-24 sm:w-32 h-24 sm:h-32 mb-4 sm:mb-6"
          >
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${config.bg} border-2 sm:border-4 ${config.border} flex items-center justify-center shadow-2xl ${config.glow}`}>
              <TrendingUp className="w-12 sm:w-16 h-12 sm:h-16 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Animated sparkles around the icon */}
            {rarity !== 'common' && (
              <>
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ rotate: { duration: 3, repeat: Infinity }, scale: { duration: 1, repeat: Infinity } }}
                  className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3"
                >
                  <Sparkles className="w-7 sm:w-10 h-7 sm:h-10 text-yellow-400 drop-shadow-glow" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                  transition={{ rotate: { duration: 4, repeat: Infinity }, scale: { duration: 1.5, repeat: Infinity } }}
                  className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3"
                >
                  <Star className="w-6 sm:w-8 h-6 sm:h-8 text-purple-400" />
                </motion.div>
              </>
            )}
            {isLucky && (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute -bottom-1 sm:-bottom-2 -left-1 sm:-left-2"
              >
                <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-300" />
              </motion.div>
            )}
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 drop-shadow-lg">
              CORRECT! 🎉
            </h2>
            
            <div className="mb-3 sm:mb-5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl p-3 sm:p-4 border border-cyan-400/30">
              <p className="text-cyan-400 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wider">You Received</p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className={`w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 ${config.text}`} />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white">{ticker}</h3>
              </div>
              <p className="text-white/90 text-sm sm:text-base md:text-lg font-semibold px-2">{stockName}</p>
            </div>

            {/* Stars Rating */}
            <div className="flex items-center justify-center gap-1 mb-3 sm:mb-5">
              {[...Array(rarity === 'common' ? 1 : rarity === 'rare' ? 2 : rarity === 'epic' ? 3 : 4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                >
                  <Star className={`w-4 sm:w-6 md:w-7 h-4 sm:h-6 md:h-7 ${config.text} fill-current drop-shadow-lg`} />
                </motion.div>
              ))}
            </div>

            {/* Reward Details Grid */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-5 px-2 sm:px-0">
              <div className="bg-black/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                <p className="text-white/60 text-xs uppercase mb-1">Stock Added to Portfolio</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <p className={`text-xl sm:text-3xl md:text-4xl font-bold ${config.text}`}>
                    {shares.toFixed(4)}
                  </p>
                  <span className="text-white/80 text-xs sm:text-sm md:text-base">shares of {ticker}</span>
                </div>
                <p className="text-green-400 font-bold text-xs sm:text-sm md:text-base mt-1">
                  ≈ ${shareValue.toFixed(2)} value
                </p>
              </div>
              
              {coins > 0 && (
                <div className="bg-black/30 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/10">
                  <p className="text-white/60 text-xs uppercase mb-0.5 sm:mb-1">Bonus Coins</p>
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-yellow-400" />
                    <span className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-400">+{coins}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Multiplier & Streak */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3 sm:mb-5 px-2">
              {streak > 0 && (
                <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/50 rounded-full">
                  <span className="text-orange-400 font-bold text-xs sm:text-sm">🔥 {streak} Streak</span>
                </div>
              )}
              <div className={`px-3 py-1.5 bg-black/40 border ${config.border} rounded-full`}>
                <span className={`${config.text} font-bold text-xs sm:text-sm md:text-base`}>{config.multiplier} Multiplier</span>
              </div>
            </div>

            {/* Fun Flavor Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/70 text-xs sm:text-sm italic mb-4 sm:mb-5 px-2"
            >
              {rarity === 'legendary' ? '🚀 Incredible! A legendary find!' :
               rarity === 'epic' ? '✨ Outstanding! An epic discovery!' :
               rarity === 'rare' ? '💎 Nice! A rare opportunity!' :
               isLucky ? '🍀 Lucky break!' :
               '📈 Keep it up!'}
            </motion.p>

            <div className="bg-black/40 rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 border border-white/10 mx-2 sm:mx-0">
              <p className="text-white/70 text-xs mb-0.5 sm:mb-1">Added to Your Portfolio:</p>
              <p className="text-white font-bold text-sm sm:text-base">
                {shares.toFixed(4)} shares of {ticker}
              </p>
            </div>

            <Button
              onClick={() => {
                if (window.playSuccess) window.playSuccess();
                onClaim();
              }}
              className={`w-full py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r ${config.bg} text-white hover:scale-105 transition-transform rounded-xl sm:rounded-2xl shadow-xl border-2 ${config.border} mx-2 sm:mx-0`}
            >
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              Claim Rewards
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}