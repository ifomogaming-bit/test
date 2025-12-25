import React from 'react';
import { Shield, Swords, Crown, Star, Flame, Gem, Zap, Award, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const EMBLEM_ICONS = {
  shield: Shield,
  sword: Swords,
  crown: Crown,
  star: Star,
  flame: Flame,
  diamond: Gem,
  lightning: Zap,
  dragon: Award,
  eagle: Target,
  lion: Trophy
};

export default function GuildEmblem({ 
  guild, 
  size = 'md', 
  showGlow = true, 
  animated = true,
  showTag = true 
}) {
  const Icon = EMBLEM_ICONS[guild?.emblem_icon] || Shield;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const primaryColor = guild?.banner_color_primary || '#3B82F6';
  const secondaryColor = guild?.banner_color_secondary || '#1E40AF';

  const EmblemContent = () => (
    <div 
      className={`${containerSizes[size]} rounded-full flex items-center justify-center border-4 relative overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        borderColor: primaryColor,
        boxShadow: showGlow ? `0 0 20px ${primaryColor}40` : 'none'
      }}
    >
      <Icon className={`${sizeClasses[size]} text-white drop-shadow-lg`} />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {animated ? (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <EmblemContent />
        </motion.div>
      ) : (
        <EmblemContent />
      )}
      
      {showTag && guild?.guild_tag && (
        <Badge 
          className="font-black text-xs"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            color: 'white'
          }}
        >
          [{guild.guild_tag}]
        </Badge>
      )}
    </div>
  );
}