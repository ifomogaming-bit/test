import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AvatarDisplay from './AvatarDisplay';

const AVATAR_TYPES = [
  { id: 'human_male', name: 'Human Male', icon: '👨', description: 'Classic trader avatar' },
  { id: 'human_female', name: 'Human Female', icon: '👩', description: 'Female trader avatar' },
  { id: 'robot', name: 'Robot', icon: '🤖', description: 'Futuristic AI trader' },
  { id: 'alien', name: 'Alien', icon: '👽', description: 'Intergalactic investor' },
  { id: 'bear', name: 'Bear', icon: '🐻', description: 'Bearish market master' },
  { id: 'bull', name: 'Bull', icon: '🐂', description: 'Bullish market champion' }
];

const SKIN_COLORS = {
  human_male: [
    { color: '#F5D0C5', name: 'Fair' },
    { color: '#E8C4B8', name: 'Light' },
    { color: '#D4A574', name: 'Medium' },
    { color: '#C4956A', name: 'Tan' },
    { color: '#8D5524', name: 'Dark' },
    { color: '#4A2C17', name: 'Deep' }
  ],
  human_female: [
    { color: '#F5D0C5', name: 'Fair' },
    { color: '#E8C4B8', name: 'Light' },
    { color: '#D4A574', name: 'Medium' },
    { color: '#C4956A', name: 'Tan' },
    { color: '#8D5524', name: 'Dark' },
    { color: '#4A2C17', name: 'Deep' }
  ],
  robot: [
    { color: '#C0C0C0', name: 'Silver' },
    { color: '#FFD700', name: 'Gold' },
    { color: '#E5E7EB', name: 'Platinum' },
    { color: '#708090', name: 'Steel' },
    { color: '#4B5563', name: 'Titanium' },
    { color: '#1F2937', name: 'Carbon' }
  ],
  alien: [
    { color: '#7CFC00', name: 'Lime' },
    { color: '#4169E1', name: 'Royal Blue' },
    { color: '#FF1493', name: 'Deep Pink' },
    { color: '#9370DB', name: 'Purple' },
    { color: '#00CED1', name: 'Turquoise' },
    { color: '#FF6347', name: 'Tomato' }
  ],
  bear: [
    { color: '#8B4513', name: 'Brown' },
    { color: '#654321', name: 'Dark Brown' },
    { color: '#D2691E', name: 'Chocolate' },
    { color: '#000000', name: 'Black' },
    { color: '#F5DEB3', name: 'Wheat' },
    { color: '#FFFFFF', name: 'Polar' }
  ],
  bull: [
    { color: '#8B0000', name: 'Dark Red' },
    { color: '#FF0000', name: 'Red' },
    { color: '#000000', name: 'Black' },
    { color: '#8B4513', name: 'Brown' },
    { color: '#D2691E', name: 'Orange Brown' },
    { color: '#FFFFFF', name: 'White' }
  ]
};

const HAIR_STYLES = {
  human_male: [
    { id: 'short', name: 'Short' },
    { id: 'long', name: 'Long' },
    { id: 'curly', name: 'Curly' },
    { id: 'spiky', name: 'Spiky' },
    { id: 'bald', name: 'Bald' },
    { id: 'wavy', name: 'Wavy' },
    { id: 'mohawk', name: 'Mohawk' },
    { id: 'undercut', name: 'Undercut' },
    { id: 'buzzcut', name: 'Buzzcut' },
    { id: 'slick', name: 'Slick Back' },
    { id: 'dreadlocks', name: 'Dreadlocks' },
    { id: 'afro', name: 'Afro' }
  ],
  human_female: [
    { id: 'long', name: 'Long' },
    { id: 'bob', name: 'Bob' },
    { id: 'ponytail', name: 'Ponytail' },
    { id: 'curly', name: 'Curly' },
    { id: 'braids', name: 'Braids' },
    { id: 'wavy', name: 'Wavy' },
    { id: 'pixie', name: 'Pixie Cut' },
    { id: 'bun', name: 'Bun' },
    { id: 'dreadlocks', name: 'Dreadlocks' },
    { id: 'afro', name: 'Afro' },
    { id: 'side_part', name: 'Side Part' },
    { id: 'twin_tails', name: 'Twin Tails' }
  ],
  robot: [
    { id: 'antenna', name: 'Antenna' },
    { id: 'panel', name: 'Panel' },
    { id: 'dome', name: 'Dome' },
    { id: 'spikes', name: 'Spikes' }
  ],
  alien: [
    { id: 'antenna', name: 'Antenna' },
    { id: 'tentacles', name: 'Tentacles' },
    { id: 'crystals', name: 'Crystals' }
  ],
  bear: [
    { id: 'none', name: 'None' },
    { id: 'fluffy', name: 'Fluffy' }
  ],
  bull: [
    { id: 'none', name: 'None' },
    { id: 'horns', name: 'Horns' }
  ]
};

const HAIR_COLORS = [
  { color: '#3D2314', name: 'Black' },
  { color: '#1A1A1A', name: 'Jet Black' },
  { color: '#D4A574', name: 'Blonde' },
  { color: '#8B4513', name: 'Brown' },
  { color: '#FFD700', name: 'Golden' },
  { color: '#FF4500', name: 'Red' },
  { color: '#FF1493', name: 'Hot Pink' },
  { color: '#9400D3', name: 'Purple' },
  { color: '#00CED1', name: 'Cyan' },
  { color: '#32CD32', name: 'Lime' },
  { color: '#FF8C00', name: 'Orange' },
  { color: '#FFFFFF', name: 'White' },
  { color: '#808080', name: 'Gray' }
];

const EYE_COLORS = [
  { color: '#4A90D9', name: 'Blue' },
  { color: '#2E8B57', name: 'Green' },
  { color: '#8B4513', name: 'Brown' },
  { color: '#4B0082', name: 'Violet' },
  { color: '#2F4F4F', name: 'Dark' },
  { color: '#000000', name: 'Black' },
  { color: '#00CED1', name: 'Cyan' },
  { color: '#FF1493', name: 'Pink' },
  { color: '#FFD700', name: 'Gold' },
  { color: '#7FFF00', name: 'Lime' }
];

const OUTFITS = [
  { id: 'basic_suit', name: 'Basic Suit', icon: '👔' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'casual', name: 'Casual', icon: '👕' },
  { id: 'luxury', name: 'Luxury', icon: '🎩' },
  { id: 'tech', name: 'Tech', icon: '💻' },
  { id: 'dress', name: 'Dress', icon: '👗' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🕶️' },
  { id: 'armor', name: 'Armor', icon: '🛡️' },
  { id: 'athletic', name: 'Athletic', icon: '🏃' },
  { id: 'formal', name: 'Formal', icon: '🤵' },
  { id: 'street', name: 'Street', icon: '🧥' },
  { id: 'ninja', name: 'Ninja', icon: '🥷' },
  { id: 'samurai', name: 'Samurai', icon: '⚔️' },
  { id: 'wizard', name: 'Wizard', icon: '🧙' },
  { id: 'pirate', name: 'Pirate', icon: '🏴‍☠️' },
  { id: 'medieval', name: 'Medieval', icon: '🏰' },
  { id: 'futuristic', name: 'Futuristic', icon: '🚀' }
];

const ACCESSORIES = [
  { id: 'none', name: 'None', icon: '❌' },
  { id: 'glasses', name: 'Glasses', icon: '👓' },
  { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️' },
  { id: 'earrings', name: 'Earrings', icon: '💍' },
  { id: 'necklace', name: 'Necklace', icon: '📿' },
  { id: 'headband', name: 'Headband', icon: '🎀' },
  { id: 'bandana', name: 'Bandana', icon: '🧣' },
  { id: 'eyepatch', name: 'Eyepatch', icon: '🏴‍☠️' },
  { id: 'mask', name: 'Mask', icon: '🎭' },
  { id: 'crown', name: 'Crown', icon: '👑' },
  { id: 'halo', name: 'Halo', icon: '😇' },
  { id: 'horns', name: 'Horns', icon: '😈' }
];

export default function AvatarCustomizer({ avatar, onUpdate }) {
  const currentType = avatar?.avatar_type || 'human_male';
  const availableSkinColors = SKIN_COLORS[currentType] || SKIN_COLORS.human_male;
  const availableHairStyles = HAIR_STYLES[currentType] || HAIR_STYLES.human_male;
  const showHair = currentType === 'human_male' || currentType === 'human_female';
  const showSpecialFeatures = currentType === 'bear' || currentType === 'bull' || currentType === 'robot' || currentType === 'alien';

  // Auto-save avatar changes with debounce
  React.useEffect(() => {
    if (!avatar || !onUpdate) return;
    
    const timer = setTimeout(() => {
      // onUpdate is already handling the save via mutation
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [avatar]);

  return (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <AvatarDisplay avatar={avatar} size="xl" />
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Avatar Type Selection */}
      <div>
        <Label className="text-white mb-3 block text-lg font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          Avatar Type
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {AVATAR_TYPES.map(type => (
            <motion.button
              key={type.id}
              onClick={() => onUpdate({ avatar_type: type.id })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                avatar?.avatar_type === type.id 
                  ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-purple-500 shadow-lg shadow-purple-500/30' 
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-4xl mb-2">{type.icon}</div>
              <p className={`text-sm font-bold ${avatar?.avatar_type === type.id ? 'text-white' : 'text-slate-400'}`}>
                {type.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">{type.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Skin/Metal/Body Color */}
      <div>
        <Label className="text-white mb-3 block">
          {currentType === 'robot' ? '🤖 Metal Color' : 
           currentType === 'alien' ? '👽 Skin Tone' : '👤 Skin Color'}
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {availableSkinColors.map(({ color, name }) => (
            <motion.button
              key={color}
              onClick={() => onUpdate({ skin_color: color })}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                avatar?.skin_color === color 
                  ? 'border-white shadow-lg scale-105' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-full shadow-md"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-300">{name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Special Features - For non-humans */}
      {showSpecialFeatures && (
        <div>
          <Label className="text-white mb-3 block">
            {currentType === 'bear' ? '🐻 Bear Features' : 
             currentType === 'bull' ? '🐂 Bull Features' :
             currentType === 'robot' ? '🤖 Robot Parts' : '👽 Alien Features'}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {availableHairStyles.map(style => (
              <motion.button
                key={style.id}
                onClick={() => onUpdate({ hair_style: style.id })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  avatar?.hair_style === style.id 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                }`}
              >
                {style.name}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Hair Style - Only for humans */}
      {showHair && (
        <div>
          <Label className="text-white mb-3 block">💇 Hair Style</Label>
          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
            {availableHairStyles.map(style => (
              <motion.button
                key={style.id}
                onClick={() => onUpdate({ hair_style: style.id })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  avatar?.hair_style === style.id 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                }`}
              >
                {style.name}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Hair Color - Only for humans */}
      {showHair && (
        <div>
          <Label className="text-white mb-3 block">🎨 Hair Color</Label>
          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
            {HAIR_COLORS.map(({ color, name }) => (
              <motion.button
                key={color}
                onClick={() => onUpdate({ hair_color: color })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  avatar?.hair_color === color 
                    ? 'border-white shadow-lg scale-105' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full shadow-md"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-slate-300">{name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Eye/LED Color */}
      <div>
        <Label className="text-white mb-3 block">
          {currentType === 'robot' ? '💡 LED Color' : '👁️ Eye Color'}
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {EYE_COLORS.map(({ color, name }) => (
            <motion.button
              key={color}
              onClick={() => onUpdate({ eye_color: color })}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                avatar?.eye_color === color 
                  ? 'border-white shadow-lg scale-105' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-full shadow-md"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-300">{name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Outfit Selection */}
      <div>
        <Label className="text-white mb-3 block">👔 Outfit Style</Label>
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
          {OUTFITS.map(outfit => (
            <motion.button
              key={outfit.id}
              onClick={() => onUpdate({ outfit_id: outfit.id })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                avatar?.outfit_id === outfit.id 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-400 shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
              }`}
            >
              <span className="text-2xl">{outfit.icon}</span>
              <span className="capitalize">{outfit.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <Label className="text-white mb-3 block">✨ Accessories</Label>
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
          {ACCESSORIES.map(accessory => (
            <motion.button
              key={accessory.id}
              onClick={() => onUpdate({ accessory_id: accessory.id })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                avatar?.accessory_id === accessory.id 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
              }`}
            >
              <span className="text-2xl">{accessory.icon}</span>
              <span className="capitalize">{accessory.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}