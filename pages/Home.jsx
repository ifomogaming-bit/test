import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Play, 
  TrendingUp, 
  Trophy, 
  ShoppingBag, 
  User, 
  Swords,
  Skull,
  Coins,
  Gem,
  Star,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Gift,
  Award,
  BarChart3,
  DollarSign
} from 'lucide-react';
import SpinWheel from '@/components/spin/SpinWheel';
import SkillTreePanel from '@/components/progression/SkillTreePanel';
import DailyLoginModal from '@/components/progression/DailyLoginModal';
import DailyQuestPanel from '@/components/progression/DailyQuestPanel';
import ScratchCardGame from '@/components/minigames/ScratchCardGame';
import { Button } from '@/components/ui/button';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
import { generateDailyQuests } from '@/components/progression/QuestService';
import TutorialManager from '@/components/tutorials/TutorialManager';
import adMobService from '@/components/ads/AdMobService';
import RewardConfirmation from '@/components/ads/RewardConfirmation';
import GameStateMonitor from '@/components/monitoring/GameStateMonitor';
import DataIntegrityBot from '@/components/monitoring/DataIntegrityBot';
import SystemHealthCheck from '@/components/monitoring/SystemHealthCheck';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: player } = useQuery({
    queryKey: ['player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      if (players.length === 0) {
        // Create new player with welcome bonus
        const newPlayer = await base44.entities.Player.create({
          username: user.full_name || 'Trader',
          level: 1,
          xp: 0,
          soft_currency: 25000,
          premium_currency: 100,
          unlocked_maps: [1],
          current_map: 1,
          bubbles_popped_today: 0,
          streak: 0,
          total_correct_answers: 0,
          total_bubbles_popped: 0,
          achievements: [],
          pvp_rating: 1000,
          pvp_wins: 0,
          pvp_losses: 0
        });
        
        // Create default avatar
        await base44.entities.Avatar.create({
          player_id: newPlayer.id,
          skin_color: '#F5D0C5',
          hair_style: 'short',
          hair_color: '#3D2314',
          eye_color: '#4A90D9',
          outfit_id: 'basic_suit'
        });
        
        return newPlayer;
      }
      return players[0];
    },
    enabled: !!user?.email,
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: avatar } = useQuery({
    queryKey: ['avatar', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const avatars = await base44.entities.Avatar.filter({ player_id: player.id });
      return avatars[0] || {};
    },
    enabled: !!player?.id,
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false
  });

  const [showSpin, setShowSpin] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [showRewardConfirmation, setShowRewardConfirmation] = useState(false);
  const [rewardType, setRewardType] = useState('');
  
  // Calculate spin availability (use separate field from daily login)
  const now = new Date();
  const todayDate = new Date().toDateString();
  const lastSpin = player?.last_scratch_card ? new Date(player.last_scratch_card) : null;
  const canSpin = !lastSpin || (now - lastSpin) >= 24 * 60 * 60 * 1000;
  
  // Separate tracking for scratch card
  const lastScratchDate = player?.last_scratch_card ? new Date(player.last_scratch_card).toDateString() : '';
  const canScratch = !player?.last_scratch_card || lastScratchDate !== todayDate;

  const queryClient = useQueryClient();

  // Check for daily login bonus - only once per 24 hours (STRICT)
  const [dailyBonusShown, setDailyBonusShown] = useState(false);
  
  useEffect(() => {
    if (player && !showDailyLogin && !dailyBonusShown) {
      const now = new Date();
      const lastLogin = player.last_daily_reset ? new Date(player.last_daily_reset) : null;
      
      // Check if 24 hours have passed since last login
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (!lastLogin || (now.getTime() - lastLogin.getTime()) >= twentyFourHours) {
        setShowDailyLogin(true);
        setDailyBonusShown(true); // Prevent re-showing during this session
      }
    }
  }, [player, dailyBonusShown]);

  // Countdown timer for next reset
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Daily quests
  const { data: dailyQuests = [] } = useQuery({
    queryKey: ['dailyQuests', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return generateDailyQuests(player.id, player.level);
    },
    enabled: !!player?.id,
    staleTime: 600000,
    refetchInterval: false,
    refetchOnWindowFocus: false
  });

  const handleDailyLoginClaim = async (reward) => {
    const now = new Date();
    const lastLogin = player.last_daily_reset ? new Date(player.last_daily_reset) : null;
    
    // Calculate if streak should continue or reset
    const timeSinceLastLogin = lastLogin ? now.getTime() - lastLogin.getTime() : 0;
    const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hour grace period
    
    let newStreak;
    if (!lastLogin || timeSinceLastLogin > fortyEightHours) {
      // Reset streak if more than 48 hours passed
      newStreak = 1;
    } else {
      // Continue streak
      newStreak = (player.login_streak || 0) + 1;
    }
    
    const updates = {
      last_daily_reset: now.toISOString(), // Set to current time for 24-hour enforcement
      login_streak: newStreak,
      soft_currency: (player.soft_currency || 0) + reward.coins,
      premium_currency: (player.premium_currency || 0) + reward.gems,
      xp: (player.xp || 0) + reward.xp
    };

    await base44.entities.Player.update(player.id, updates);
    await queryClient.invalidateQueries(['player']);

    await base44.entities.Transaction.create({
      player_id: player.id,
      type: 'daily_bonus',
      description: `Day ${newStreak} Login Bonus`,
      soft_currency_change: reward.coins,
      premium_currency_change: reward.gems
    });
    
    setShowDailyLogin(false); // Close modal after claiming
  };

  const handleSpin = async (reward) => {
    const updates = { last_scratch_card: new Date().toISOString() }; // Use separate field for spin tracking
    
    if (reward.type === 'coins') {
      updates.soft_currency = (player.soft_currency || 0) + reward.amount;
    } else if (reward.type === 'premium') {
      updates.premium_currency = (player.premium_currency || 0) + reward.amount;
    } else if (reward.type === 'xp') {
      updates.xp = (player.xp || 0) + reward.amount;
    }
    
    await base44.entities.Player.update(player.id, updates);
    queryClient.invalidateQueries(['player']);
    
    await base44.entities.Transaction.create({
      player_id: player.id,
      type: 'daily_bonus',
      description: `Daily Spin: ${reward.label}`,
      soft_currency_change: reward.type === 'coins' ? reward.amount : 0,
      premium_currency_change: reward.type === 'premium' ? reward.amount : 0
    });
    
    setTimeout(() => setShowSpin(false), 1500);
  };

  const handleScratchComplete = async (reward) => {
    const updates = { last_scratch_card: new Date().toISOString() };
    
    if (reward.type === 'coins') {
      updates.soft_currency = (player.soft_currency || 0) + reward.amount;
    } else if (reward.type === 'gems') {
      updates.premium_currency = (player.premium_currency || 0) + reward.amount;
    }
    
    await base44.entities.Player.update(player.id, updates);
    queryClient.invalidateQueries(['player']);
    
    await base44.entities.Transaction.create({
      player_id: player.id,
      type: 'daily_bonus',
      description: `Scratch Card: Won ${reward.amount} ${reward.type}`,
      soft_currency_change: reward.type === 'coins' ? reward.amount : 0,
      premium_currency_change: reward.type === 'gems' ? reward.amount : 0
    });
  };

  const menuItems = [
    { 
      title: 'Play Game', 
      description: 'Pop stock bubbles & earn rewards',
      icon: Play, 
      href: createPageUrl('Game'),
      gradient: 'from-green-500 to-emerald-600',
      featured: true
    },
    { 
      title: 'Work Center', 
      description: 'Complete shifts to earn coins',
      icon: Trophy, 
      href: createPageUrl('Work'),
      gradient: 'from-blue-500 to-indigo-600',
      featured: true
    },
    { 
      title: 'Trading Floor & Portfolio', 
      description: 'Trade stocks & manage holdings',
      icon: TrendingUp, 
      href: createPageUrl('Trading'),
      gradient: 'from-blue-500 to-cyan-600',
      featured: true
    },
    { 
      title: 'Options Trading', 
      description: 'Advanced long/short positions',
      icon: BarChart3, 
      href: createPageUrl('Options'),
      gradient: 'from-purple-500 to-pink-600',
      featured: true
    },
    { 
      title: 'Social Trading', 
      description: 'Follow & copy top traders',
      icon: User, 
      href: createPageUrl('Social'),
      gradient: 'from-purple-500 to-pink-600',
      featured: true
    },
    { 
      title: 'Guilds', 
      description: 'Join or create a guild',
      icon: User, 
      href: createPageUrl('Guilds'),
      gradient: 'from-cyan-500 to-teal-600'
    },
    { 
      title: 'Guild Raids / Raid Bosses', 
      description: 'Attack vaults & fight epic bosses',
      icon: Swords, 
      href: createPageUrl('GuildRaids'),
      gradient: 'from-red-500 to-orange-600',
      featured: true
    },
    { 
      title: 'Guild Wars', 
      description: 'Competitive guild battles',
      icon: Swords, 
      href: createPageUrl('GuildWars'),
      gradient: 'from-red-600 to-rose-600',
      featured: true
    },
    { 
      title: 'Leaderboards', 
      description: 'Global rankings',
      icon: Trophy, 
      href: createPageUrl('Leaderboards'),
      gradient: 'from-yellow-500 to-amber-600',
      featured: true
    },
    { 
      title: 'Wagers & Loans', 
      description: 'Predictions & P2P lending',
      icon: Target, 
      href: createPageUrl('Wagers'),
      gradient: 'from-orange-500 to-red-600',
      featured: true
    },
    { 
      title: 'PvP Arena', 
      description: 'Challenge other players',
      icon: Swords, 
      href: createPageUrl('PvP'),
      gradient: 'from-rose-500 to-red-600',
      featured: true
    },
    { 
      title: 'Premium Shop', 
      description: '✨ Themes, loot boxes & power-ups',
      icon: ShoppingBag, 
      href: createPageUrl('Shop'),
      gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
      featured: true,
      glow: true
    },
    { 
      title: 'Prestige Badges', 
      description: 'Level up your emblems',
      icon: Award, 
      href: createPageUrl('PrestigeBadges'),
      gradient: 'from-yellow-500 to-orange-600',
      featured: true
    },
    { 
      title: 'Profile', 
      description: 'Manage your account',
      icon: User, 
      href: createPageUrl('Profile'),
      gradient: 'from-slate-600 to-zinc-700',
      featured: true
    },
    { 
      title: 'Community', 
      description: 'Forum & discussions',
      icon: User, 
      href: createPageUrl('Community'),
      gradient: 'from-blue-500 to-indigo-600',
      featured: true
    }
  ];

  const dailyChallenges = [
    { title: 'Pop 10 Bubbles', progress: player?.bubbles_popped_today || 0, target: 10, reward: 100 },
    { title: 'Get 5 Correct Answers', progress: Math.min(player?.total_correct_answers || 0, 5), target: 5, reward: 50 },
    { title: 'Win 1 PvP Match', progress: player?.pvp_wins || 0, target: 1, reward: 150 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 mb-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AvatarDisplay avatar={avatar} size="lg" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome, {player?.username || 'Trader'}!
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium text-sm">Level {player?.level || 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-medium text-sm">{player?.streak || 0} Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Currency Display */}
          <div className="flex flex-wrap items-center gap-2 currency-display">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold text-sm">{player?.soft_currency?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-white font-bold text-sm">{player?.premium_currency || 0}</span>
            </div>
            <Button
              onClick={() => setShowSpin(true)}
              disabled={!canSpin}
              size="sm"
              className={`${canSpin ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 animate-pulse' : 'bg-slate-700'} relative`}
              data-tutorial="daily-spin"
            >
              <Gift className="w-4 h-4 mr-1" />
              {canSpin ? 'Daily Spin' : timeUntilReset}
            </Button>
            {!canSpin && (
                                <Button
                                  id="btn_extra_spin"
                                  onClick={() => {
                                    adMobService.showRewardedAd('extra_spin', async () => {
                                      // Grant extra spin (use separate field to avoid daily bonus conflict)
                                      await base44.entities.Player.update(player.id, {
                                        last_scratch_card: null // Reset spin availability only
                                      });
                                      await queryClient.invalidateQueries(['player']);
                                      setRewardType('extra_spin');
                                      setShowRewardConfirmation(true);
                                      // Auto-open spin wheel when confirmation closes
                                      setTimeout(() => {
                                        setShowRewardConfirmation(false);
                                        setShowSpin(true);
                                      }, 3500);
                                    });
                                  }}
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                  🎬 Ad Spin
                                </Button>
                              )}
            <Button
              onClick={() => setShowSkillTree(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Award className="w-4 h-4 mr-1" />
              Skills
            </Button>
            <Button
              onClick={() => setShowScratchCard(true)}
              disabled={!canScratch}
              size="sm"
              className={`${canScratch ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 animate-pulse' : 'bg-slate-700'} relative`}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {canScratch ? 'Scratch' : timeUntilReset}
            </Button>
          </div>
        </motion.div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={item.href}>
                <div className={`
                  relative p-6 rounded-2xl border transition-all duration-300
                  ${item.featured 
                    ? 'bg-gradient-to-br ' + item.gradient + ' border-transparent' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }
                  ${item.glow ? 'shadow-2xl shadow-purple-500/40' : ''}
                  hover:scale-[1.02] hover:shadow-xl group
                `}>
                  {item.glow && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-2xl rounded-2xl"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  )}
                  {item.featured && (
                    <div className="absolute top-3 right-3">
                      <Sparkles className="w-5 h-5 text-white/80 animate-pulse" />
                    </div>
                  )}
                  
                  <item.icon className={`w-10 h-10 mb-4 ${item.featured ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  
                  <h3 className={`text-xl font-bold mb-1 ${item.featured ? 'text-white' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${item.featured ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.description}
                  </p>

                  <ArrowRight className={`
                    absolute bottom-6 right-6 w-5 h-5 transform translate-x-0 opacity-0 
                    group-hover:translate-x-1 group-hover:opacity-100 transition-all
                    ${item.featured ? 'text-white' : 'text-slate-400'}
                  `} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Daily Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Daily Quests</h2>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Resets in {timeUntilReset}</span>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
            <DailyQuestPanel quests={dailyQuests} player={player} />
          </div>
        </motion.div>
      </div>
      
      {showSpin && (
        <SpinWheel 
          onSpin={handleSpin}
          onClose={() => setShowSpin(false)}
          canSpin={canSpin}
          player={player}
          queryClient={queryClient}
        />
      )}

      {showSkillTree && (
        <SkillTreePanel 
          player={player}
          onClose={() => setShowSkillTree(false)}
        />
      )}

      {showDailyLogin && player && (
        <DailyLoginModal
          loginStreak={(player.login_streak || 0) + 1}
          onClaim={handleDailyLoginClaim}
          onClose={() => setShowDailyLogin(false)}
        />
      )}

      {showScratchCard && player && (
        <ScratchCardGame
          player={player}
          canPlay={canScratch}
          onReward={handleScratchComplete}
          onClose={() => setShowScratchCard(false)}
        />
      )}

      {/* Tutorial System */}
      <TutorialManager player={player} />

      {/* Hidden Monitoring Systems */}
      <GameStateMonitor player={player} />
      <DataIntegrityBot player={player} />
      <SystemHealthCheck player={player} />

      {/* Ad Reward Confirmation */}
      <RewardConfirmation 
        show={showRewardConfirmation}
        rewardType={rewardType}
        onClose={() => setShowRewardConfirmation(false)}
        onNavigateHome={true}
      />
      </div>
      );
      }