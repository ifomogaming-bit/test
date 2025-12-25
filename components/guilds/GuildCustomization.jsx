import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Swords, Crown, Star, Flame, Gem, Zap, Award, Target, Trophy, Palette, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

const EMBLEM_OPTIONS = [
  { id: 'shield', icon: Shield, name: 'Shield', unlockLevel: 1 },
  { id: 'sword', icon: Swords, name: 'Sword', unlockLevel: 1 },
  { id: 'crown', icon: Crown, name: 'Crown', unlockLevel: 3 },
  { id: 'star', icon: Star, name: 'Star', unlockLevel: 2 },
  { id: 'flame', icon: Flame, name: 'Flame', unlockLevel: 4 },
  { id: 'diamond', icon: Gem, name: 'Diamond', unlockLevel: 5 },
  { id: 'lightning', icon: Zap, name: 'Lightning', unlockLevel: 3 },
  { id: 'dragon', icon: Award, name: 'Dragon', unlockLevel: 6 },
  { id: 'eagle', icon: Target, name: 'Eagle', unlockLevel: 4 },
  { id: 'lion', icon: Trophy, name: 'Lion', unlockLevel: 5 }
];

const COLOR_PRESETS = [
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF' },
  { name: 'Royal Purple', primary: '#A855F7', secondary: '#7C3AED' },
  { name: 'Blood Red', primary: '#EF4444', secondary: '#DC2626' },
  { name: 'Emerald Green', primary: '#10B981', secondary: '#059669' },
  { name: 'Golden Sun', primary: '#F59E0B', secondary: '#D97706' },
  { name: 'Cyber Pink', primary: '#EC4899', secondary: '#DB2777' },
  { name: 'Arctic Cyan', primary: '#06B6D4', secondary: '#0891B2' },
  { name: 'Dark Shadow', primary: '#374151', secondary: '#1F2937' },
  { name: 'Toxic Green', primary: '#84CC16', secondary: '#65A30D' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#EA580C' }
];

const UNLOCKABLE_TITLES = [
  { title: 'The Conquerors', level: 3, trophies: 100 },
  { title: 'Elite Traders', level: 5, trophies: 250 },
  { title: 'Market Dominators', level: 7, trophies: 500 },
  { title: 'Wall Street Legends', level: 10, trophies: 1000 },
  { title: 'Financial Empire', level: 15, trophies: 2000 }
];

export default function GuildCustomization({ guild, isLeader }) {
  const [customization, setCustomization] = useState({
    emblem_icon: guild?.emblem_icon || 'shield',
    banner_color_primary: guild?.banner_color_primary || '#3B82F6',
    banner_color_secondary: guild?.banner_color_secondary || '#1E40AF',
    guild_title: guild?.guild_title || '',
    guild_tag: guild?.guild_tag || ''
  });

  const queryClient = useQueryClient();

  const updateCustomizationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Guild.update(guild.id, customization);
      
      await base44.entities.GuildAuditLog.create({
        guild_id: guild.id,
        actor_id: guild.leader_id,
        actor_name: 'Guild Leader',
        action_type: 'guild_settings_changed',
        details: { customization }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['myGuild']);
    }
  });

  const guildLevel = guild?.level || 1;
  const guildTrophies = guild?.trophies || 0;

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-900/40 border-2 border-purple-500/60 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 flex items-center gap-2 text-2xl font-black">
          <Palette className="w-7 h-7 text-purple-400" />
          Guild Customization
        </CardTitle>
        <p className="text-purple-200 text-sm">🎨 Design your guild's identity!</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emblem Selection */}
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Guild Emblem
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {EMBLEM_OPTIONS.map(emblem => {
              const Icon = emblem.icon;
              const isUnlocked = guildLevel >= emblem.unlockLevel;
              const isSelected = customization.emblem_icon === emblem.id;

              return (
                <motion.button
                  key={emblem.id}
                  whileHover={isUnlocked ? { scale: 1.1 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  onClick={() => isUnlocked && setCustomization(prev => ({ ...prev, emblem_icon: emblem.id }))}
                  disabled={!isUnlocked || !isLeader}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-purple-400 bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50' 
                      : isUnlocked 
                        ? 'border-slate-600 bg-slate-800 hover:border-purple-500/50' 
                        : 'border-slate-700 bg-slate-900 opacity-40'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <p className="text-xs text-slate-400 mt-2">{emblem.name}</p>
                  {!isUnlocked && (
                    <Badge className="mt-1 bg-red-500/20 text-red-400 text-xs">Lvl {emblem.unlockLevel}</Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Color Presets */}
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            Banner Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {COLOR_PRESETS.map(preset => {
              const isSelected = customization.banner_color_primary === preset.primary;
              
              return (
                <motion.button
                  key={preset.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isLeader && setCustomization(prev => ({
                    ...prev,
                    banner_color_primary: preset.primary,
                    banner_color_secondary: preset.secondary
                  }))}
                  disabled={!isLeader}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-white shadow-lg' 
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`
                  }}
                >
                  <p className="text-white text-xs font-bold">{preset.name}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Guild Tag */}
        <div>
          <h3 className="text-white font-bold mb-2">Guild Tag</h3>
          <Input
            value={customization.guild_tag}
            onChange={(e) => setCustomization(prev => ({ ...prev, guild_tag: e.target.value.toUpperCase().slice(0, 5) }))}
            placeholder="[TAG]"
            maxLength={5}
            disabled={!isLeader}
            className="bg-slate-800 border-slate-700 text-white text-center font-black text-lg"
          />
          <p className="text-slate-400 text-xs mt-1">Max 5 characters • Shown with guild name</p>
        </div>

        {/* Unlockable Titles */}
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Unlockable Titles
          </h3>
          <div className="space-y-2">
            {UNLOCKABLE_TITLES.map(titleData => {
              const isUnlocked = guildLevel >= titleData.level && guildTrophies >= titleData.trophies;
              const isSelected = customization.guild_title === titleData.title;

              return (
                <motion.button
                  key={titleData.title}
                  whileHover={isUnlocked ? { scale: 1.02, x: 5 } : {}}
                  onClick={() => isUnlocked && isLeader && setCustomization(prev => ({ ...prev, guild_title: titleData.title }))}
                  disabled={!isUnlocked || !isLeader}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-yellow-400 bg-gradient-to-r from-yellow-600/40 to-orange-600/40 shadow-lg shadow-yellow-500/30' 
                      : isUnlocked 
                        ? 'border-slate-600 bg-slate-800 hover:border-yellow-500/50' 
                        : 'border-slate-700 bg-slate-900 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-black ${isSelected ? 'text-yellow-300' : 'text-white'}`}>
                        {titleData.title}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        Level {titleData.level} • {titleData.trophies} trophies
                      </p>
                    </div>
                    {isUnlocked ? (
                      isSelected ? (
                        <Badge className="bg-yellow-500/20 text-yellow-400">Equipped</Badge>
                      ) : (
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      )
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400">Locked</Badge>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-800/50 rounded-xl p-6 border-2 border-slate-700">
          <h3 className="text-white font-bold mb-4 text-center">Preview</h3>
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center border-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${customization.banner_color_primary}, ${customization.banner_color_secondary})`,
                borderColor: customization.banner_color_primary,
                boxShadow: `0 0 30px ${customization.banner_color_primary}60`
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {(() => {
                const Icon = EMBLEM_ICONS[customization.emblem_icon] || Shield;
                return <Icon className="w-16 h-16 text-white drop-shadow-2xl" />;
              })()}
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
            
            <div className="text-center">
              <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                {guild?.name}
                {customization.guild_tag && (
                  <Badge 
                    className="text-sm font-black"
                    style={{
                      background: `linear-gradient(135deg, ${customization.banner_color_primary}, ${customization.banner_color_secondary})`,
                      color: 'white'
                    }}
                  >
                    [{customization.guild_tag}]
                  </Badge>
                )}
              </h2>
              {customization.guild_title && (
                <p className="text-yellow-400 font-bold text-sm mt-1">"{customization.guild_title}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isLeader && (
          <Button
            onClick={() => updateCustomizationMutation.mutate()}
            disabled={updateCustomizationMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/40 font-black text-lg py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {updateCustomizationMutation.isPending ? 'Saving...' : 'Save Customization'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}