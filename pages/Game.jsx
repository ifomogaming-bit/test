import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, 
  Map, 
  Lock, 
  Star, 
  Coins,
  Zap,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import SkillTreePanel from '@/components/progression/SkillTreePanel';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GameMap from '@/components/game/GameMap';
import CooldownTimer from '@/components/ui/CooldownTimer';
import GlobalChat from '@/components/chat/GlobalChat';
import antiCheatSystem from '@/components/security/AntiCheatSystem';

const MAPS = [
  { 
    id: 1, 
    name: 'Wall Street', 
    difficulty: 'Easy', 
    unlockLevel: 1,
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    icon: '🏛️',
    theme: 'Classic trading floor with skyscrapers',
    bgImage: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800',
    particles: ['📊', '📈', '💼', '🏢'],
    animation: 'float'
  },
  { 
    id: 2, 
    name: 'Bull Market', 
    difficulty: 'Easy', 
    unlockLevel: 3,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    icon: '🐂',
    theme: 'Rising markets and growth',
    bgImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    particles: ['📈', '💚', '🚀', '⬆️'],
    animation: 'rise'
  },
  { 
    id: 3, 
    name: 'Bear Cave', 
    difficulty: 'Medium', 
    unlockLevel: 5,
    gradient: 'from-red-500 via-orange-500 to-amber-500',
    icon: '🐻',
    theme: 'Downturn challenges',
    bgImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    particles: ['📉', '🔴', '⬇️', '💔'],
    animation: 'fall'
  },
  { 
    id: 4, 
    name: 'Tech Hub', 
    difficulty: 'Medium', 
    unlockLevel: 8,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    icon: '💻',
    theme: 'Silicon Valley innovation',
    bgImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    particles: ['💻', '⚡', '🔮', '🌐'],
    animation: 'pulse'
  },
  { 
    id: 5, 
    name: 'Crypto Den', 
    difficulty: 'Medium', 
    unlockLevel: 12,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    icon: '₿',
    theme: 'Digital currencies realm',
    bgImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    particles: ['₿', '⟠', '💜', '🔗'],
    animation: 'glow'
  },
  { 
    id: 6, 
    name: 'Gold Reserve', 
    difficulty: 'Hard', 
    unlockLevel: 16,
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    icon: '🪙',
    theme: 'Precious metals vault',
    bgImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800',
    particles: ['🪙', '✨', '💰', '🏆'],
    animation: 'shimmer'
  },
  { 
    id: 7, 
    name: 'Diamond Floor', 
    difficulty: 'Hard', 
    unlockLevel: 20,
    gradient: 'from-cyan-400 via-blue-400 to-purple-400',
    icon: '💎',
    theme: 'Elite luxury trading',
    bgImage: 'https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=800',
    particles: ['💎', '✨', '👑', '🌟'],
    animation: 'sparkle'
  },
  { 
    id: 8, 
    name: 'Whale Waters', 
    difficulty: 'Hard', 
    unlockLevel: 25,
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    icon: '🐋',
    theme: 'Big money players',
    bgImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    particles: ['🐋', '🌊', '💙', '🔷'],
    animation: 'wave'
  },
  { 
    id: 9, 
    name: 'Moon Base', 
    difficulty: 'Expert', 
    unlockLevel: 30,
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    icon: '🚀',
    theme: 'Sky-high valuations',
    bgImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    particles: ['🚀', '🌙', '⭐', '🌌'],
    animation: 'launch'
  },
  { 
    id: 10, 
    name: 'Elite Club', 
    difficulty: 'Expert', 
    unlockLevel: 40,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    icon: '👑',
    theme: 'Ultimate trading mastery',
    bgImage: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800',
    particles: ['👑', '🏆', '⚡', '🔥'],
    animation: 'royal'
  }
];

// Real market prices from 12/16/2025
const REAL_STOCK_PRICES = {
  AAPL: 224.67,
  GOOGL: 205.34,
  MSFT: 518.90,
  AMZN: 258.78,
  TSLA: 548.90,
  META: 742.56,
  NVDA: 189.45,
  AMD: 158.90,
  NFLX: 1098.45,
  DIS: 115.67,
  JPM: 289.45,
  V: 385.90,
  MA: 618.45,
  WMT: 112.45,
  KO: 75.67
};

export default function Game() {
  const [user, setUser] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [showMapSelect, setShowMapSelect] = useState(true);
  const [chatChannel, setChatChannel] = useState('global');
  const [showSkillTree, setShowSkillTree] = useState(false);
  const queryClient = useQueryClient();

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
      return players[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chatMessages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 50),
    refetchInterval: 30000,
    staleTime: 20000
  });

  const updatePlayerMutation = useMutation({
    mutationFn: (data) => base44.entities.Player.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries(['player'])
  });

  const addPortfolioMutation = useMutation({
    mutationFn: async ({ ticker, shares, price }) => {
      const existingPortfolio = await base44.entities.Portfolio.filter({ 
        player_id: player.id, 
        ticker 
      });
      
      if (existingPortfolio.length > 0) {
        const existing = existingPortfolio[0];
        const newShares = existing.shares + shares;
        const newTotalInvested = (existing.total_invested || 0) + (shares * price);
        const newAvgPrice = newTotalInvested / newShares;
        
        return base44.entities.Portfolio.update(existing.id, {
          shares: newShares,
          avg_acquisition_price: newAvgPrice,
          total_invested: newTotalInvested
        });
      } else {
        return base44.entities.Portfolio.create({
          player_id: player.id,
          ticker,
          shares,
          avg_acquisition_price: price,
          total_invested: shares * price
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['portfolio'])
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => queryClient.invalidateQueries(['chatMessages'])
  });

  const handleBubblePop = async (reward) => {
    if (!player) return;

    // Anti-cheat validation
    if (!antiCheatSystem.validateBubblePop(player, reward)) {
      console.error('[ANTI-CHEAT] Invalid bubble pop attempt blocked');
      return;
    }

    // Track action for anomaly detection
    antiCheatSystem.trackAction(player.id, 'bubble_pop', {
      ticker: reward.ticker,
      rarity: reward.rarity,
      shares: reward.shares,
      coins: reward.coins
    });

    // Add shares to portfolio
    await addPortfolioMutation.mutateAsync({
      ticker: reward.ticker,
      shares: reward.shares,
      price: REAL_STOCK_PRICES[reward.ticker] || 100
    });

    // Update player stats
    const newBubblesPopped = (player.bubbles_popped_today || 0) + 1;
    const newTotalBubbles = (player.total_bubbles_popped || 0) + 1;
    const newCorrectAnswers = (player.total_correct_answers || 0) + 1;
    const newStreak = reward.streak;
    const newLongestStreak = Math.max(player.longest_streak || 0, newStreak);
    
    // Calculate XP gain (increased base XP)
    const baseXp = reward.rarity === 'legendary' ? 150 : reward.rarity === 'epic' ? 75 : reward.rarity === 'rare' ? 40 : 20;
    const xpGain = Math.floor(baseXp * (1 + newStreak * 0.15));
    
    // Bonus XP for milestones
    let bonusXp = 0;
    if (newTotalBubbles % 50 === 0) bonusXp = 200;
    else if (newTotalBubbles % 25 === 0) bonusXp = 100;
    
    // Bonus gems for streaks
    let bonusGems = 0;
    if (newStreak >= 10) bonusGems = 5;
    else if (newStreak >= 5) bonusGems = 2;
    
    const newXp = (player.xp || 0) + xpGain + bonusXp;
    
    // Calculate level
    let level = player.level || 1;
    let xpForNextLevel = Math.floor(100 * Math.pow(1.5, level - 1));
    let remainingXp = newXp;
    while (remainingXp >= xpForNextLevel) {
      remainingXp -= xpForNextLevel;
      level++;
      xpForNextLevel = Math.floor(100 * Math.pow(1.5, level - 1));
    }

    // Trigger cooldown after 10 bubbles
    const updates = {
      bubbles_popped_today: newBubblesPopped,
      total_bubbles_popped: newTotalBubbles,
      total_correct_answers: newCorrectAnswers,
      streak: newStreak,
      longest_streak: newLongestStreak,
      xp: newXp,
      level,
      soft_currency: (player.soft_currency || 0) + (reward.coins || 0),
      premium_currency: (player.premium_currency || 0) + bonusGems,
      last_bubble_time: new Date().toISOString()
    };

    if (newBubblesPopped >= 10) {
      const cooldownUntil = new Date();
      cooldownUntil.setHours(cooldownUntil.getHours() + 4);
      updates.cooldown_until = cooldownUntil.toISOString();
      updates.bubbles_popped_today = 0;
    }

    await updatePlayerMutation.mutateAsync(updates);

    // Record transaction
    let description = `Popped ${reward.ticker} bubble (${reward.rarity}) - Received ${reward.shares} shares`;
    if (bonusXp > 0) description += ` +${bonusXp} bonus XP!`;
    if (bonusGems > 0) description += ` +${bonusGems} gems!`;
    
    await base44.entities.Transaction.create({
      player_id: player.id,
      type: 'bubble_reward',
      description,
      soft_currency_change: reward.coins || 0,
      premium_currency_change: bonusGems,
      stock_ticker: reward.ticker,
      shares_change: reward.shares
    });

    // Play celebration sound for rewards
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const notes = reward.rarity === 'legendary' ? [523.25, 659.25, 783.99, 1046.50] : 
                   reward.rarity === 'epic' ? [440, 554.37, 659.25, 783.99] :
                   [440, 554.37, 659.25];
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });

    // Play level up sound if applicable
    if (level > player.level) {
      setTimeout(() => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const time = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          const start = time + i * 0.12;
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
          osc.start(start);
          osc.stop(start + 0.3);
        });
      }, 500);
    }
  };



  const handleSendMessage = async (message, channel) => {
    if (!player) return;
    
    await sendMessageMutation.mutateAsync({
      player_id: player.id,
      player_name: player.username,
      message,
      channel
    });
  };

  const isOnCooldown = player?.cooldown_until && new Date(player.cooldown_until) > new Date();
  const unlockedMaps = player?.unlocked_maps || [1];

  if (showMapSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowSkillTree(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Skills
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-white font-bold">{player?.streak || 0}x</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Select Map</h1>
          <p className="text-slate-400 mb-8">Choose a map to start collecting stock bubbles</p>

          {/* Cooldown Check */}
          {isOnCooldown ? (
            <div className="max-w-md mx-auto">
              <CooldownTimer 
                cooldownUntil={player.cooldown_until} 
                onComplete={() => queryClient.invalidateQueries(['player'])}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MAPS.map((map, index) => {
                const isUnlocked = unlockedMaps.includes(map.id) || (player?.level || 1) >= map.unlockLevel;
                
                return (
                  <motion.div
                    key={map.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedMap(map.id);
                          setShowMapSelect(false);
                        }
                      }}
                      disabled={!isUnlocked}
                      className={`
                        group relative w-full overflow-hidden rounded-2xl border-2 text-left transition-all duration-300
                        ${isUnlocked 
                          ? 'border-slate-700 hover:border-slate-500 hover:scale-[1.03] hover:shadow-2xl' 
                          : 'border-slate-800 opacity-50 cursor-not-allowed'
                        }
                      `}
                    >
                      {/* Background Image with particles */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ 
                            backgroundImage: `url(${map.bgImage})`,
                            filter: isUnlocked ? 'brightness(0.4)' : 'brightness(0.2) grayscale(1)'
                          }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${map.gradient} opacity-40`} />
                        
                        {/* Animated particles */}
                        {isUnlocked && map.particles?.map((particle, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-2xl opacity-30"
                            style={{
                              left: `${20 + i * 20}%`,
                              top: `${30 + (i % 2) * 30}%`
                            }}
                            animate={{
                              y: map.animation === 'rise' ? [-10, -30, -10] :
                                 map.animation === 'fall' ? [10, 30, 10] :
                                 map.animation === 'wave' ? [-15, 15, -15] :
                                 [-20, 20, -20],
                              x: map.animation === 'wave' ? [-10, 10, -10] : 0,
                              rotate: map.animation === 'royal' ? [0, 360] : 0,
                              scale: map.animation === 'pulse' ? [1, 1.2, 1] :
                                     map.animation === 'sparkle' ? [0.8, 1.2, 0.8] : 1,
                              opacity: map.animation === 'glow' ? [0.3, 0.6, 0.3] : 0.3
                            }}
                            transition={{
                              duration: map.animation === 'launch' ? 2 : 3,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          >
                            {particle}
                          </motion.div>
                        ))}
                      </div>

                      {/* Content */}
                      <div className="relative p-6 min-h-[200px] flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-5xl mb-2 transform group-hover:scale-110 transition-transform">
                              {map.icon}
                            </div>
                            <div className={`
                              px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm
                              ${map.difficulty === 'Easy' ? 'bg-green-500/30 text-green-300 border border-green-400/50' :
                                map.difficulty === 'Medium' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50' :
                                map.difficulty === 'Hard' ? 'bg-orange-500/30 text-orange-300 border border-orange-400/50' :
                                'bg-red-500/30 text-red-300 border border-red-400/50'}
                            `}>
                              {map.difficulty}
                            </div>
                          </div>

                          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                            {map.name}
                          </h3>
                          <p className="text-slate-200 text-sm mb-3 drop-shadow">
                            {map.theme}
                          </p>
                        </div>

                        <div>
                          {!isUnlocked && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg backdrop-blur-sm border border-slate-600/50">
                              <Lock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300 text-sm font-medium">
                                Unlock at Level {map.unlockLevel}
                              </span>
                            </div>
                          )}

                          {isUnlocked && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-1">
                                  {[...Array(Math.min(map.id, 5))].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                                  ))}
                                </div>
                              </div>
                              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                <span className="text-white text-sm font-bold">{5 + map.id} bubbles</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <GlobalChat 
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          currentChannel={chatChannel}
          onChangeChannel={setChatChannel}
        />
        
        {showSkillTree && (
          <SkillTreePanel 
            player={player}
            onClose={() => setShowSkillTree(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Game Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setShowMapSelect(true)}
            className="text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Maps
          </Button>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-slate-800 rounded-lg">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
              <span className="text-white text-xs md:text-sm font-medium">
                {player?.bubbles_popped_today || 0}/10
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-orange-500/20 rounded-lg">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
              <span className="text-orange-400 text-xs md:text-sm font-bold">{player?.streak || 0}x</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-slate-800 rounded-lg">
              <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
              <span className="text-white text-xs md:text-sm font-medium whitespace-nowrap">{player?.soft_currency?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="pt-20 p-4">
        <div className="max-w-6xl mx-auto">
          <GameMap
            mapId={selectedMap}
            player={player}
            stockPrices={REAL_STOCK_PRICES}
            onBubblePop={handleBubblePop}
          />
        </div>
      </div>

      <GlobalChat 
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentChannel={chatChannel}
        onChangeChannel={setChatChannel}
      />
      
      {showSkillTree && (
        <SkillTreePanel 
          player={player}
          onClose={() => setShowSkillTree(false)}
        />
      )}
    </div>
  );
}