import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, Star } from 'lucide-react';

const rarityColors = {
  common: 'from-slate-600 to-slate-800 border-slate-500',
  rare: 'from-blue-600 to-blue-800 border-blue-400',
  epic: 'from-purple-600 to-purple-800 border-purple-400',
  legendary: 'from-amber-500 to-orange-600 border-yellow-400'
};

const rarityGlow = {
  common: 'shadow-slate-500/30',
  rare: 'shadow-blue-500/50',
  epic: 'shadow-purple-500/50',
  legendary: 'shadow-yellow-500/60'
};

export default function StockBubble({ 
  bubble, 
  onClick, 
  isLucky = false 
}) {
  const { ticker, price, priceChange, rarity = 'common', position } = bubble;
  const isPositive = priceChange >= 0;
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [0, -10, 0]
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        duration: 0.5,
        y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
      onClick={() => {
        onClick();
        if (window.playPop) window.playPop();
      }}
      className="absolute cursor-pointer select-none"
      style={{ left: position.x, top: position.y }}
    >
      <div className={`
        relative w-24 h-24 md:w-28 md:h-28 rounded-full 
        bg-gradient-to-br ${rarityColors[rarity]}
        border-2 flex flex-col items-center justify-center
        shadow-lg ${rarityGlow[rarity]}
        hover:shadow-xl transition-shadow
        ${isLucky ? 'animate-pulse ring-4 ring-yellow-400/50' : ''}
      `}>
        {isLucky && (
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        )}
        
        {rarity === 'legendary' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-spin" style={{ animationDuration: '4s' }} />
        )}
        
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: isRevealed ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg md:text-xl font-bold text-white tracking-wider"
        >
          {ticker}
        </motion.span>
        
        {!isRevealed && (
          <div className="text-2xl">❓</div>
        )}
        
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs md:text-sm font-medium text-white/90">
            ${price?.toFixed(2) || '---'}
          </span>
          {priceChange !== undefined && (
            <span className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            </span>
          )}
        </div>
        
        <div className="mt-1 flex items-center gap-0.5">
          {[...Array(rarity === 'common' ? 1 : rarity === 'rare' ? 2 : rarity === 'epic' ? 3 : 4)].map((_, i) => (
            <Star key={i} className={`w-2 h-2 ${rarity === 'legendary' ? 'text-yellow-400' : rarity === 'epic' ? 'text-purple-300' : rarity === 'rare' ? 'text-blue-300' : 'text-slate-400'} fill-current`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}