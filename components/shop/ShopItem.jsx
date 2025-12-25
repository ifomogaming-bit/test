import React from 'react';
import { motion } from 'framer-motion';
import { Star, Coins, Gem, Clock, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const rarityColors = {
  common: 'from-slate-600 to-slate-700 border-slate-500',
  rare: 'from-blue-600 to-blue-700 border-blue-500',
  epic: 'from-purple-600 to-purple-700 border-purple-500',
  legendary: 'from-amber-500 to-orange-600 border-yellow-500'
};

const rarityBadges = {
  common: 'bg-slate-500/20 text-slate-300',
  rare: 'bg-blue-500/20 text-blue-300',
  epic: 'bg-purple-500/20 text-purple-300',
  legendary: 'bg-yellow-500/20 text-yellow-300'
};

export default function ShopItem({ 
  item, 
  onPurchase, 
  isOwned = false,
  canAfford = true,
  isLimited = false
}) {
  const { id, name, description, price_soft, price_premium, rarity, category, image_url, ends_at } = item;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-gradient-to-br ${rarityColors[rarity]} rounded-xl overflow-hidden border-2 transition-all`}
    >
      {/* Limited Badge */}
      {isLimited && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-red-500/90 rounded-full">
          <Clock className="w-3 h-3 text-white" />
          <span className="text-xs text-white font-bold">Limited</span>
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full ${rarityBadges[rarity]}`}>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-xs capitalize font-medium">{rarity}</span>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square p-4 flex items-center justify-center bg-black/20">
        {image_url ? (
          <img src={image_url} alt={name} className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
            <span className="text-4xl">👔</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-black/30">
        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">{category}</p>
        <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
        {description && (
          <p className="text-sm text-white/60 mb-3 line-clamp-2">{description}</p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {price_soft > 0 && (
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{price_soft}</span>
              </div>
            )}
            {price_premium > 0 && (
              <div className="flex items-center gap-1">
                <Gem className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-bold">{price_premium}</span>
              </div>
            )}
          </div>

          {isOwned ? (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 rounded-lg">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Owned</span>
            </div>
          ) : (
            <Button
              onClick={() => onPurchase(item)}
              disabled={!canAfford}
              size="sm"
              className={`${canAfford ? 'bg-white text-slate-900 hover:bg-white/90' : 'bg-slate-600 text-slate-400'}`}
            >
              {canAfford ? 'Buy' : <Lock className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}