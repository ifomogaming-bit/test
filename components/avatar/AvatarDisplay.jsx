import React from 'react';
import { motion } from 'framer-motion';

const SKIN_COLORS = {
  light: '#F5D0C5',
  medium: '#D4A574',
  tan: '#C4956A',
  dark: '#8D5524',
  deep: '#4A2C17',
  alien_green: '#7CFC00',
  alien_blue: '#4169E1',
  robot_silver: '#C0C0C0',
  robot_gold: '#FFD700'
};

const HAIR_STYLES = {
  short: { path: 'M30,20 Q50,5 70,20 L70,35 Q50,25 30,35 Z' },
  long: { path: 'M25,20 Q50,0 75,20 L80,60 Q50,50 20,60 Z' },
  curly: { path: 'M28,22 Q35,10 50,8 Q65,10 72,22 Q78,30 75,40 Q70,35 65,38 Q60,35 55,38 Q50,35 45,38 Q40,35 35,38 Q30,35 25,40 Q22,30 28,22 Z' },
  spiky: { path: 'M30,30 L35,10 L45,25 L50,5 L55,25 L65,10 L70,30 Q50,25 30,30 Z' },
  bald: { path: '' },
  ponytail: { path: 'M28,20 Q50,8 72,20 L72,35 Q50,28 28,35 Z M50,35 L50,55 Q45,60 50,65 Q55,60 50,55 Z' },
  bob: { path: 'M25,20 Q50,5 75,20 L75,45 Q50,38 25,45 Z' },
  braids: { path: 'M30,20 Q35,10 40,20 L35,50 M60,20 Q65,10 70,20 L65,50' },
  antenna: { path: 'M48,5 L48,15 M52,5 L52,15 M46,3 Q48,0 50,3 Q52,0 54,3' },
  panel: { path: 'M30,18 L70,18 L70,25 L30,25 Z' }
};

const OUTFITS = {
  basic_suit: { color: '#1e293b', accent: '#334155' },
  business: { color: '#1e3a5f', accent: '#2563eb' },
  casual: { color: '#065f46', accent: '#10b981' },
  luxury: { color: '#7c2d12', accent: '#f59e0b' },
  tech: { color: '#312e81', accent: '#8b5cf6' },
  dress: { color: '#BE185D', accent: '#EC4899' },
  cyberpunk: { color: '#581C87', accent: '#A855F7' },
  armor: { color: '#78350F', accent: '#F59E0B' }
};

export default function AvatarDisplay({ 
  avatar, 
  size = 'md',
  showBackground = true,
  className = ''
}) {
  const { 
    avatar_type = 'human_male',
    skin_color = '#F5D0C5', 
    hair_style = 'short', 
    hair_color = '#3D2314',
    eye_color = '#4A90D9',
    outfit_id = 'basic_suit',
    hat_id,
    accessory_id
  } = avatar || {};

  const outfit = OUTFITS[outfit_id] || OUTFITS.basic_suit;
  const hair = HAIR_STYLES[hair_style] || HAIR_STYLES.short;
  
  const isRobot = avatar_type === 'robot';
  const isAlien = avatar_type === 'alien';
  const isFemale = avatar_type === 'human_female';

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <motion.div 
      className={`relative ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
    >
      {showBackground && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full" />
      )}
      
      <svg viewBox="0 0 100 100" className="relative z-10">
        {isRobot ? (
          // Robot Avatar
          <>
            {/* Body */}
            <rect x="25" y="70" width="50" height="25" rx="3" fill={outfit.color} />
            <rect x="35" y="80" width="30" height="10" fill={outfit.accent} opacity="0.6" />
            
            {/* Neck */}
            <rect x="42" y="60" width="16" height="10" fill={skin_color} />
            
            {/* Head */}
            <rect x="30" y="25" width="40" height="40" rx="6" fill={skin_color} />
            <rect x="32" y="27" width="36" height="36" rx="4" fill={outfit.accent} opacity="0.3" />
            
            {/* Antenna */}
            <rect x="48" y="15" width="4" height="12" fill={outfit.accent} />
            <circle cx="50" cy="13" r="3" fill="#ef4444" className="animate-pulse" />
            
            {/* Eyes - LED screens */}
            <rect x="36" y="38" width="10" height="8" rx="2" fill="#00ff00" opacity="0.8" />
            <rect x="54" y="38" width="10" height="8" rx="2" fill="#00ff00" opacity="0.8" />
            <rect x="38" y="40" width="6" height="4" fill="#ffffff" opacity="0.5" />
            <rect x="56" y="40" width="6" height="4" fill="#ffffff" opacity="0.5" />
            
            {/* Mouth - speaker grill */}
            <g>
              <line x1="40" y1="54" x2="60" y2="54" stroke={outfit.accent} strokeWidth="1.5" />
              <line x1="40" y1="57" x2="60" y2="57" stroke={outfit.accent} strokeWidth="1.5" />
              <line x1="40" y1="60" x2="60" y2="60" stroke={outfit.accent} strokeWidth="1.5" />
            </g>
            
            {/* Panel details */}
            <circle cx="35" cy="30" r="2" fill="#3b82f6" />
            <circle cx="65" cy="30" r="2" fill="#3b82f6" />
          </>
        ) : isAlien ? (
          // Alien Avatar
          <>
            {/* Body */}
            <path d="M25,95 Q25,70 50,65 Q75,70 75,95" fill={outfit.color} />
            <path d="M35,75 L50,68 L65,75" fill={outfit.accent} opacity="0.5" />
            
            {/* Neck - thinner */}
            <ellipse cx="50" cy="62" rx="8" ry="10" fill={skin_color} />
            
            {/* Head - larger and egg-shaped */}
            <ellipse cx="50" cy="38" rx="26" ry="30" fill={skin_color} />
            
            {/* Large alien eyes */}
            <ellipse cx="38" cy="40" rx="10" ry="14" fill="#000000" />
            <ellipse cx="62" cy="40" rx="10" ry="14" fill="#000000" />
            <ellipse cx="38" cy="42" rx="4" ry="6" fill={eye_color} opacity="0.9" />
            <ellipse cx="62" cy="42" rx="4" ry="6" fill={eye_color} opacity="0.9" />
            <circle cx="37" cy="40" r="2" fill="white" opacity="0.7" />
            <circle cx="61" cy="40" r="2" fill="white" opacity="0.7" />
            
            {/* Small nose */}
            <ellipse cx="50" cy="52" rx="3" ry="2" fill={skin_color} style={{ filter: 'brightness(0.8)' }} />
            
            {/* Small mouth */}
            <path d="M45,58 Q50,60 55,58" stroke={skin_color} strokeWidth="1.5" fill="none" style={{ filter: 'brightness(0.7)' }} />
            
            {/* Antennae */}
            <line x1="35" y1="10" x2="38" y2="20" stroke={skin_color} strokeWidth="2" />
            <line x1="65" y1="10" x2="62" y2="20" stroke={skin_color} strokeWidth="2" />
            <circle cx="35" cy="8" r="3" fill="#00ff00" className="animate-pulse" />
            <circle cx="65" cy="8" r="3" fill="#00ff00" className="animate-pulse" />
          </>
        ) : (
          // Human Avatar (male/female)
          <>
            {/* Body/Outfit */}
            <path 
              d={isFemale ? "M25,95 Q25,68 50,63 Q75,68 75,95" : "M25,95 Q25,70 50,65 Q75,70 75,95"}
              fill={outfit.color}
            />
            <path 
              d="M35,75 L50,68 L65,75" 
              fill={outfit.accent}
              opacity="0.5"
            />
            
            {/* Neck */}
            <ellipse cx="50" cy="62" rx={isFemale ? "9" : "10"} ry="8" fill={skin_color} />
            
            {/* Head */}
            <ellipse cx="50" cy="42" rx={isFemale ? "20" : "22"} ry="25" fill={skin_color} />
            
            {/* Hair */}
            {hair.path && (
              <path d={hair.path} fill={hair_color} />
            )}
            
            {/* Eyes */}
            <g>
              <ellipse cx="40" cy="42" rx={isFemale ? "6" : "5"} ry={isFemale ? "7" : "6"} fill="white" />
              <ellipse cx="60" cy="42" rx={isFemale ? "6" : "5"} ry={isFemale ? "7" : "6"} fill="white" />
              <circle cx="40" cy="43" r={isFemale ? "3" : "2.5"} fill={eye_color} />
              <circle cx="60" cy="43" r={isFemale ? "3" : "2.5"} fill={eye_color} />
              <circle cx="39" cy="42" r="1" fill="white" />
              <circle cx="59" cy="42" r="1" fill="white" />
              {/* Eyelashes for female */}
              {isFemale && (
                <>
                  <path d="M34,37 L32,35 M38,36 L38,33 M42,36 L40,33" stroke={hair_color} strokeWidth="1" />
                  <path d="M66,37 L68,35 M62,36 L62,33 M58,36 L60,33" stroke={hair_color} strokeWidth="1" />
                </>
              )}
            </g>
            
            {/* Eyebrows */}
            <path d={isFemale ? "M34,35 Q40,32 46,35" : "M34,36 Q40,33 46,36"} stroke={hair_color} strokeWidth="2" fill="none" />
            <path d={isFemale ? "M54,35 Q60,32 66,35" : "M54,36 Q60,33 66,36"} stroke={hair_color} strokeWidth="2" fill="none" />
            
            {/* Nose */}
            <path d="M50,44 Q52,50 50,52 Q48,50 50,44" stroke={skin_color} strokeWidth="1" fill="none" style={{ filter: 'brightness(0.9)' }} />
            
            {/* Mouth */}
            <path d={isFemale ? "M43,56 Q50,59 57,56" : "M43,56 Q50,60 57,56"} stroke="#c4756a" strokeWidth="2" fill="none" />
            {isFemale && <path d="M43,56 Q50,58 57,56" fill="#ff6b9d" opacity="0.4" />}
            
            {/* Ears */}
            <ellipse cx="28" cy="42" rx="4" ry="6" fill={skin_color} />
            <ellipse cx="72" cy="42" rx="4" ry="6" fill={skin_color} />
          </>
        )}
        
        {/* Hat (if equipped) */}
        {hat_id === 'top_hat' && (
          <g>
            <rect x="30" y="5" width="40" height="20" rx="2" fill="#1e293b" />
            <rect x="25" y="22" width="50" height="5" rx="2" fill="#1e293b" />
          </g>
        )}
        {hat_id === 'crown' && (
          <g>
            <path d="M30,25 L35,10 L42,20 L50,5 L58,20 L65,10 L70,25 Z" fill="#f59e0b" />
            <circle cx="50" cy="18" r="3" fill="#ef4444" />
          </g>
        )}
        
        {/* Accessory (if equipped) */}
        {accessory_id === 'monocle' && (
          <g>
            <circle cx="60" cy="42" r="8" stroke="#f59e0b" strokeWidth="2" fill="none" />
            <line x1="68" y1="42" x2="78" y2="55" stroke="#f59e0b" strokeWidth="1" />
          </g>
        )}
        {accessory_id === 'glasses' && (
          <g>
            <circle cx="40" cy="42" r="7" stroke="#1e293b" strokeWidth="2" fill="none" />
            <circle cx="60" cy="42" r="7" stroke="#1e293b" strokeWidth="2" fill="none" />
            <line x1="47" y1="42" x2="53" y2="42" stroke="#1e293b" strokeWidth="2" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}