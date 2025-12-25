import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useTutorialTrigger } from '@/components/tutorials/TutorialManager';
import TutorialOverlay from '@/components/tutorials/TutorialOverlay';
import { TUTORIALS } from '@/components/tutorials/TutorialContent';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Star, 
  Shield,
  Coins,
  Gem,
  Lock,
  CheckCircle,
  Sparkles,
  Eye,
  Award,
  Swords,
  X,
  Users,
  Crown
} from 'lucide-react';

const SKILLS = [
  // Wealth Branch
  {
    id: 'bubble_master',
    name: 'Bubble Master',
    description: 'Increase shares earned from bubbles',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 2000,
    bonus: (level) => `+${level * 10}% shares`,
    branch: 'wealth'
  },
  {
    id: 'lucky_trader',
    name: 'Lucky Trader',
    description: 'Increased chance of rare bubbles',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 3000,
    bonus: (level) => `+${level * 5}% rare chance`,
    branch: 'wealth'
  },
  {
    id: 'xp_boost',
    name: 'Fast Learner',
    description: 'Earn more XP from all activities',
    icon: Star,
    color: 'from-yellow-500 to-orange-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 4000,
    bonus: (level) => `+${level * 15}% XP`,
    branch: 'power'
  },
  {
    id: 'coin_magnet',
    name: 'Coin Magnet',
    description: 'Earn more coins from gameplay',
    icon: Coins,
    color: 'from-green-500 to-emerald-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 2500,
    bonus: (level) => `+${level * 20}% coins`,
    branch: 'wealth'
  },
  {
    id: 'streak_saver',
    name: 'Streak Saver',
    description: 'Protection from streak loss',
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 5000,
    bonus: (level) => level >= 5 ? 'Never lose streak' : `${level * 20}% protection`,
    branch: 'utility'
  },
  {
    id: 'cooldown_master',
    name: 'Cooldown Master',
    description: 'Reduce cooldown duration',
    icon: Zap,
    color: 'from-indigo-500 to-purple-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 6000,
    bonus: (level) => `-${level * 12}% cooldown`,
    branch: 'utility'
  },
  {
    id: 'market_analyst',
    name: 'Market Analyst',
    description: 'Get better trading prices',
    icon: TrendingUp,
    color: 'from-blue-600 to-indigo-600',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 8000,
    bonus: (level) => `${level * 2}% better prices`,
    branch: 'trading'
  },
  {
    id: 'critical_strike',
    name: 'Critical Strike',
    description: 'Chance for 2x rewards',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 7000,
    bonus: (level) => `${level * 5}% crit chance`,
    branch: 'power'
  },
  {
    id: 'market_insight',
    name: 'Market Insight',
    description: 'Reduce trading fees',
    icon: Eye,
    color: 'from-cyan-500 to-blue-500',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 9000,
    bonus: (level) => `-${level * 5}% fees`
  },
  {
    id: 'portfolio_master',
    name: 'Portfolio Master',
    description: 'Increase portfolio value',
    icon: Award,
    color: 'from-purple-500 to-indigo-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 12000,
    bonus: (level) => `+${level * 2}% value`
  },
  {
    id: 'raid_commander',
    name: 'Raid Commander',
    description: 'Boost raid attack damage',
    icon: Swords,
    color: 'from-red-500 to-orange-500',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 10000,
    bonus: (level) => `+${level * 10}% damage`
  },
  {
    id: 'guild_guardian',
    name: 'Guild Guardian',
    description: 'Boost guild defense',
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 10000,
    bonus: (level) => `+${level * 10}% defense`
  },
  {
    id: 'resource_hoarder',
    name: 'Resource Hoarder',
    description: 'Extra coins from all sources',
    icon: Coins,
    color: 'from-yellow-500 to-amber-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 4000,
    bonus: (level) => `+${level * 5}% coins`
  },
  {
    id: 'pvp_warrior',
    name: 'PvP Warrior',
    description: 'Increase PvP rating gains',
    icon: Swords,
    color: 'from-red-600 to-pink-600',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 11000,
    bonus: (level) => `+${level * 3}% rating`
  },
  {
    id: 'quest_hunter',
    name: 'Quest Hunter',
    description: 'Unlock extra daily quests',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    maxLevel: 10,
    costType: 'coins',
    baseCost: 15000,
    bonus: (level) => `+${level} quests`
  },
  {
    id: 'master_trader',
    name: 'Master Trader',
    description: 'Reduced trading fees and better spreads',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 14000,
    bonus: (level) => `-${level * 3}% spreads`
  },
  {
    id: 'bubble_vision',
    name: 'Bubble Vision',
    description: 'See bubble rarity before clicking',
    icon: Eye,
    color: 'from-cyan-500 to-blue-500',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 16000,
    bonus: (level) => level >= 15 ? 'Full vision' : `${level * 6.67}% reveal`
  },
  {
    id: 'wealth_multiplier',
    name: 'Wealth Multiplier',
    description: 'Earn interest on held coins',
    icon: Gem,
    color: 'from-yellow-600 to-amber-600',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 20000,
    bonus: (level) => `${level * 0.5}% daily interest`
  },
  {
    id: 'achievement_hunter',
    name: 'Achievement Hunter',
    description: 'Unlock hidden achievements and badges',
    icon: Award,
    color: 'from-purple-600 to-indigo-600',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 6000,
    bonus: (level) => `+${level * 2} secret badges`
  },
  {
    id: 'guild_treasurer',
    name: 'Guild Treasurer',
    description: 'Boost guild treasury contributions',
    icon: TrendingUp,
    color: 'from-green-600 to-emerald-600',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 13000,
    bonus: (level) => `+${level * 5}% contribution`
  },
  {
    id: 'legendary_hunter',
    name: 'Legendary Hunter',
    description: 'Dramatically increase legendary bubble spawn',
    icon: Star,
    color: 'from-orange-500 to-red-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 18000,
    bonus: (level) => `+${level * 8}% legendary`
  },
  {
    id: 'portfolio_protector',
    name: 'Portfolio Protector',
    description: 'Reduce market crash losses',
    icon: Shield,
    color: 'from-blue-700 to-indigo-700',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 21000,
    bonus: (level) => `-${level * 5}% losses`
  },
  {
    id: 'instant_analysis',
    name: 'Instant Analysis',
    description: 'Auto-answer easy questions',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 25000,
    bonus: (level) => level >= 15 ? 'Auto-solve easy' : `${level * 6.67}% chance`
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    description: 'Reduce all cooldowns globally',
    icon: CheckCircle,
    color: 'from-purple-600 to-pink-600',
    maxLevel: 15,
    costType: 'coins',
    baseCost: 30000,
    bonus: (level) => `-${level * 8}% all cooldowns`
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Earn bonuses from social interactions',
    icon: Users,
    color: 'from-pink-500 to-rose-500',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 4500,
    bonus: (level) => `+${level * 10}% social XP`
  },
  {
    id: 'market_prophet',
    name: 'Market Prophet',
    description: 'Predict price movements with hints',
    icon: Sparkles,
    color: 'from-indigo-600 to-purple-600',
    maxLevel: 20,
    costType: 'coins',
    baseCost: 28000,
    bonus: (level) => `${level * 7}% accuracy boost`
  }
];

export default function SkillTreePanel({ player, onClose }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const queryClient = useQueryClient();
  
  const { shouldShowTutorial, isTriggered } = useTutorialTrigger('skill_tree', player);

  useEffect(() => {
    if (shouldShowTutorial && !showTutorial) {
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, [shouldShowTutorial]);

  const { data: skills = [] } = useQuery({
    queryKey: ['skills', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.SkillTree.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const unlockSkillMutation = useMutation({
    mutationFn: async ({ skill, cost, costType }) => {
      const existing = skills.find(s => s.skill_id === skill.id);
      
      if (existing) {
        await base44.entities.SkillTree.update(existing.id, {
          level: existing.level + 1
        });
      } else {
        await base44.entities.SkillTree.create({
          player_id: player.id,
          skill_id: skill.id,
          skill_name: skill.name,
          level: 1,
          max_level: skill.maxLevel,
          unlocked_at: new Date().toISOString()
        });
      }

      await base44.entities.Player.update(player.id, {
        soft_currency: Math.max(0, (player.soft_currency || 0) - cost)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['skills']);
      queryClient.invalidateQueries(['player']);
      setSelectedSkill(null);
    }
  });

  const getSkillLevel = (skillId) => {
    const skill = skills.find(s => s.skill_id === skillId);
    return skill?.level || 0;
  };

  const getSkillCost = (skill, currentLevel) => {
    return Math.floor(skill.baseCost * Math.pow(1.4, currentLevel));
  };

  const canAfford = (cost, type) => {
    return (player?.soft_currency || 0) >= cost;
  };

  const handleUnlock = (skill) => {
    const currentLevel = getSkillLevel(skill.id);
    const cost = getSkillCost(skill, currentLevel);
    
    if (currentLevel >= skill.maxLevel) return;
    if (!canAfford(cost, skill.costType)) return;

    unlockSkillMutation.mutate({ skill, cost, costType: skill.costType });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
    >
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-yellow-500/15 to-orange-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-green-500/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl mx-auto my-4 md:my-8 bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800 rounded-2xl md:rounded-3xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/40 overflow-hidden"
      >
        {/* Enhanced decorative header gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 via-blue-500 to-cyan-500 animate-gradient" />
        <style jsx>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>
        
        <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2 flex items-center gap-2 md:gap-3">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 animate-pulse" />
              Skill Tree
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base flex items-center gap-2">
              <Award className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
              Unlock legendary powers and dominate the markets
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg md:rounded-xl border-2 border-green-500/40 shadow-lg shadow-green-500/20 flex-1 sm:flex-initial">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              <span className="text-white font-black text-sm md:text-lg">{player?.soft_currency?.toLocaleString() || 0}</span>
              <span className="text-green-400 text-xs">COINS</span>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Branch Filters */}
        <div className="bg-slate-800/30 rounded-xl p-3 mb-6 border border-slate-700">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', name: 'All Skills', icon: '🌟' },
              { id: 'wealth', name: 'Wealth', icon: '💰' },
              { id: 'power', name: 'Power', icon: '⚡' },
              { id: 'trading', name: 'Trading', icon: '📈' },
              { id: 'combat', name: 'Combat', icon: '⚔️' },
              { id: 'passive', name: 'Passive', icon: '💤' },
              { id: 'utility', name: 'Utility', icon: '✨' }
            ].map(branch => (
              <Button
                key={branch.id}
                size="sm"
                variant="outline"
                className={`capitalize ${selectedBranch === branch.id ? 'bg-purple-600 text-white border-purple-400' : 'border-slate-600 hover:border-purple-500'}`}
                onClick={() => setSelectedBranch(branch.id)}
              >
                {branch.icon} {branch.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {SKILLS.filter(s => selectedBranch === 'all' || s.branch === selectedBranch).map((skill, index) => {
            const Icon = skill.icon;
            const currentLevel = getSkillLevel(skill.id);
            const cost = getSkillCost(skill, currentLevel);
            const isMaxed = currentLevel >= skill.maxLevel;
            const affordable = canAfford(cost, skill.costType);

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.03, type: 'spring', bounce: 0.4 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`relative p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer group overflow-hidden ${
                  isMaxed
                    ? 'bg-gradient-to-br from-green-600/40 to-emerald-600/40 border-green-400 shadow-2xl shadow-green-500/50'
                    : currentLevel > 0
                    ? 'bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-slate-900/80 border-purple-500/60 hover:border-purple-400 shadow-xl hover:shadow-purple-500/40'
                    : 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-600/50 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20'
                }`}
              >
                {/* Enhanced glow effects */}
                {isMaxed && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-2xl blur-2xl animate-pulse" />
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-20 blur-sm"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </>
                )}
                {currentLevel > 0 && !isMaxed && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all" />
                )}

                {/* Level badge */}
                <div className="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col items-end gap-1">
                  {isMaxed ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50"
                    >
                      <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </motion.div>
                  ) : (
                    <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-bold border-2 ${
                      currentLevel > 0 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 text-white shadow-lg' 
                        : 'bg-slate-800 border-slate-600 text-slate-400'
                    }`}>
                      Lv {currentLevel}
                    </div>
                  )}
                </div>

                {/* Icon with enhanced animations */}
                <div className="relative mb-3 md:mb-4">
                  <motion.div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center shadow-2xl relative overflow-hidden mx-auto`}
                    whileHover={{ 
                      rotate: [0, -5, 5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    {/* Enhanced shine effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/20 to-transparent"
                      animate={{ 
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10 drop-shadow-lg" />
                    
                    {/* Animated ring for unlocked skills */}
                    {currentLevel > 0 && (
                      <motion.div
                        className={`absolute inset-0 rounded-2xl border-4 bg-gradient-to-br ${skill.color} opacity-30`}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Sparkle particles for maxed skills */}
                  {isMaxed && (
                    <>
                      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 text-yellow-400 animate-pulse" />
                      <Sparkles className="absolute -bottom-1 -left-1 w-3 h-3 md:w-4 md:h-4 text-green-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}
                </div>

                <h3 className="text-base md:text-xl font-black text-white mb-1 md:mb-2 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                  {skill.name}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed text-center">{skill.description}</p>

                {/* Enhanced progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">Level {currentLevel}/{skill.maxLevel}</span>
                    <motion.span 
                      className={`text-xs font-black px-2 py-1 rounded-full ${
                        currentLevel > 0 ? 'bg-gradient-to-r ' + skill.color + ' text-white shadow-lg' : 'text-slate-500'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {skill.bonus(currentLevel || 1)}
                    </motion.span>
                  </div>
                  <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600">
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-r ${skill.color} shadow-lg`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentLevel / skill.maxLevel) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>

                {!isMaxed && (
                  <Button
                    onClick={() => handleUnlock(skill)}
                    disabled={!affordable}
                    className={`w-full font-black text-xs md:text-sm py-2 md:py-3 shadow-xl transition-all ${
                      affordable 
                        ? `bg-gradient-to-r ${skill.color} hover:shadow-2xl hover:scale-102 border-2 border-white/20` 
                        : 'bg-slate-700 hover:bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {affordable ? (
                      <>
                        <Coins className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 animate-pulse" />
                        <span className="hidden sm:inline">{currentLevel === 0 ? '🔓 UNLOCK' : '⬆️ UPGRADE'}</span>
                        <span className="sm:hidden">{currentLevel === 0 ? '🔓' : '⬆️'}</span>
                        <span className="ml-1">({cost.toLocaleString()})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                        <span className="hidden md:inline">LOCKED - Need {cost.toLocaleString()} coins</span>
                        <span className="md:hidden">LOCKED</span>
                      </>
                    )}
                  </Button>
                )}
                
                {isMaxed && (
                  <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-lg md:rounded-xl p-2 md:p-3 border-2 border-green-400/50 shadow-lg">
                    <p className="text-green-300 font-black text-center text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2">
                      <Crown className="w-4 h-4 md:w-5 md:h-5" />
                      MASTERED
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        </div>
        </motion.div>

        {/* Tutorial overlay */}
        {showTutorial && TUTORIALS.skill_tree && (
        <TutorialOverlay
          tutorial={TUTORIALS.skill_tree}
          currentStep={tutorialStep}
          onNext={() => setTutorialStep(prev => prev + 1)}
          onPrevious={() => setTutorialStep(prev => prev - 1)}
          onSkip={() => setShowTutorial(false)}
          onComplete={() => {
            setShowTutorial(false);
            if (player) {
              base44.entities.Tutorial.create({
                player_id: player.id,
                tutorial_id: 'skill_tree',
                completed_steps: [0, 1, 2],
                completed: true
              });
            }
          }}
          targetElement={true}
        />
        )}
        </motion.div>
        );
        }