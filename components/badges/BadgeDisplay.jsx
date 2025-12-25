import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { getRarityColor, getRarityBorder } from './BadgeSystem';

export default function BadgeDisplay({ badges, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.id}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br ${getRarityColor(badge.rarity)} 
            border-2 ${getRarityBorder(badge.rarity)} flex items-center justify-center cursor-pointer
            hover:scale-110 transition-transform shadow-lg`}
          title={`${badge.badge_name} - ${badge.description}`}
        >
          <span>{badge.badge_icon}</span>
        </motion.div>
      ))}
    </div>
  );
}