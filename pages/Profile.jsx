import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  User,
  Trophy,
  Target,
  Zap,
  Swords,
  Star,
  Award,
  Edit2,
  Check,
  X,
  Palette,
  Shirt,
  Crown,
  Glasses,
  Settings,
  LogOut,
  CheckCircle,
  Users,
  UserPlus,
  Briefcase,
  Coins,
  Sparkles,
  Flame,
  Rocket,
  Medal,
  Shield,
  TrendingUp,
  DollarSign,
  Gem,
  Bolt,
  CircleDot,
  Crosshair,
  Radar,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Layers,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import AvatarDisplay from '@/components/avatar/AvatarDisplay';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';
import BadgeDisplay from '@/components/badges/BadgeDisplay';
import PowerUpInventoryPanel from '@/components/profile/PowerUpInventoryPanel';
import { BADGE_DEFINITIONS } from '@/components/badges/BadgeSystem';
import AutoSaveManager from '@/components/progress/AutoSaveManager';
import PrestigeSystem from '@/components/progression/PrestigeSystem';

const AVATAR_TYPES = [
  { id: 'human_male', name: 'Human Male', icon: '👨' },
  { id: 'human_female', name: 'Human Female', icon: '👩' },
  { id: 'robot', name: 'Robot', icon: '🤖' },
  { id: 'alien', name: 'Alien', icon: '👽' }
];

const SKIN_COLORS = {
  human_male: ['#F5D0C5', '#E8C4B8', '#D4A574', '#C4956A', '#8D5524', '#4A2C17'],
  human_female: ['#F5D0C5', '#E8C4B8', '#D4A574', '#C4956A', '#8D5524', '#4A2C17'],
  robot: ['#C0C0C0', '#FFD700', '#E5E7EB', '#708090', '#4B5563', '#1F2937'],
  alien: ['#7CFC00', '#4169E1', '#FF1493', '#9370DB', '#00CED1', '#FF6347']
};

const HAIR_COLORS = ['#3D2314', '#1A1A1A', '#D4A574', '#8B4513', '#FFD700', '#FF4500'];
const EYE_COLORS = ['#4A90D9', '#2E8B57', '#8B4513', '#4B0082', '#2F4F4F', '#000000'];

const HAIR_STYLES = {
  human_male: ['short', 'long', 'curly', 'spiky', 'bald'],
  human_female: ['long', 'bob', 'ponytail', 'curly', 'braids'],
  robot: ['antenna', 'panel', 'none'],
  alien: ['none', 'antenna']
};

const ACHIEVEMENTS = [
  { id: 'first_bubble', name: 'First Pop', description: 'Pop your first bubble', icon: CircleDot },
  { id: 'streak_5', name: 'On Fire', description: 'Get a 5x streak', icon: Flame },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get a 10x streak', icon: Zap },
  { id: 'streak_25', name: 'Legendary Streak', description: 'Get a 25x streak', icon: Bolt },
  { id: 'streak_50', name: 'Godlike', description: 'Get a 50x streak', icon: Sparkles },
  { id: 'bubbles_100', name: 'Bubble Hunter', description: 'Pop 100 bubbles', icon: Target },
  { id: 'bubbles_1000', name: 'Bubble Master', description: 'Pop 1000 bubbles', icon: Crosshair },
  { id: 'bubbles_5000', name: 'Bubble Legend', description: 'Pop 5000 bubbles', icon: Radar },
  { id: 'bubbles_10000', name: 'Bubble Overlord', description: 'Pop 10,000 bubbles', icon: Activity },
  { id: 'bubbles_50000', name: 'Bubble Deity', description: 'Pop 50,000 bubbles', icon: Rocket },
  { id: 'pvp_first_win', name: 'First Victory', description: 'Win your first PvP match', icon: Swords },
  { id: 'pvp_10_wins', name: 'Battle Champion', description: 'Win 10 PvP matches', icon: Medal },
  { id: 'pvp_50_wins', name: 'Arena Gladiator', description: 'Win 50 PvP matches', icon: Shield },
  { id: 'pvp_100_wins', name: 'Combat Warlord', description: 'Win 100 PvP matches', icon: Crown },
  { id: 'pvp_500_wins', name: 'PvP Legend', description: 'Win 500 PvP matches', icon: Award },
  { id: 'portfolio_1000', name: 'Novice Investor', description: 'Reach $1,000 portfolio value', icon: Coins },
  { id: 'portfolio_10000', name: 'Business Tycoon', description: 'Reach $10,000 portfolio value', icon: DollarSign },
  { id: 'portfolio_100000', name: 'Wealth Builder', description: 'Reach $100,000 portfolio value', icon: TrendingUp },
  { id: 'portfolio_1000000', name: 'Stock Millionaire', description: 'Reach $1,000,000 portfolio value', icon: Gem },
  { id: 'portfolio_10000000', name: 'Financial Titan', description: 'Reach $10,000,000 portfolio value', icon: BarChart3 },
  { id: 'level_10', name: 'Rising Star', description: 'Reach level 10', icon: Star },
  { id: 'level_25', name: 'Seasoned Trader', description: 'Reach level 25', icon: LineChart },
  { id: 'level_50', name: 'Market Elite', description: 'Reach level 50', icon: Layers },
  { id: 'level_100', name: 'Trading Grandmaster', description: 'Reach level 100', icon: Trophy },
  { id: 'work_50_shifts', name: 'Dedicated Worker', description: 'Complete 50 work shifts', icon: Briefcase },
  { id: 'work_250_shifts', name: 'Shift Veteran', description: 'Complete 250 work shifts', icon: CheckCircle },
  { id: 'work_1000_shifts', name: 'Industry Professional', description: 'Complete 1000 work shifts', icon: PieChart },
  { id: 'all_maps', name: 'Map Conqueror', description: 'Unlock all 10 maps', icon: MapPin }
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [showPrestige, setShowPrestige] = useState(false);
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
    enabled: !!user?.email
  });

  const { data: avatar } = useQuery({
    queryKey: ['avatar', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const avatars = await base44.entities.Avatar.filter({ player_id: player.id });
      return avatars[0] || {};
    },
    enabled: !!player?.id
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Inventory.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ['badges', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Badge.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Portfolio.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Transaction.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: guildMemberships = [] } = useQuery({
    queryKey: ['guildMemberships', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.GuildMember.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: raids = [] } = useQuery({
    queryKey: ['raids'],
    queryFn: () => base44.entities.GuildRaid.list('-created_date', 100)
  });

  const { data: prestigeBadges = [] } = useQuery({
    queryKey: ['prestigeBadges', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.PrestigeBadge.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: dailyStats } = useQuery({
    queryKey: ['dailyWorkStats', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const today = new Date().toISOString().split('T')[0];
      const stats = await base44.entities.DailyWorkStats.filter({ 
        player_id: player.id,
        date: today
      });
      return stats[0] || null;
    },
    enabled: !!player?.id
  });

  const { data: allTimeWorkStats = [] } = useQuery({
    queryKey: ['allTimeWorkStats', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.DailyWorkStats.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Friend.filter({ player_id: player.id, status: 'accepted' });
    },
    enabled: !!player?.id
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friendRequests', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Friend.filter({ friend_id: player.id, status: 'pending' });
    },
    enabled: !!player?.id
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list('-level', 100)
  });

  // Check and award badges
  const checkBadgesMutation = useMutation({
    mutationFn: async () => {
      const earnedIds = earnedBadges.map(b => b.badge_id);
      
      for (const [id, def] of Object.entries(BADGE_DEFINITIONS)) {
        if (!earnedIds.includes(id)) {
          const earned = def.check(player, portfolio, transactions, guildMemberships, raids, {});
          if (earned) {
            await base44.entities.Badge.create({
              player_id: player.id,
              badge_id: id,
              badge_name: def.name,
              badge_icon: def.icon,
              rarity: def.rarity,
              earned_at: new Date().toISOString()
            });
          }
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['badges'])
  });

  useEffect(() => {
    if (player?.id && earnedBadges) {
      checkBadgesMutation.mutate();
    }
  }, [player?.id, transactions.length, portfolio.length]);

  const updatePlayerMutation = useMutation({
    mutationFn: (data) => base44.entities.Player.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries(['player'])
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (data) => {
      if (!avatar?.id) {
        return base44.entities.Avatar.create({
          player_id: player.id,
          ...data
        });
      }
      return base44.entities.Avatar.update(avatar.id, data);
    },
    onSuccess: () => queryClient.invalidateQueries(['avatar'])
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendPlayer) => {
      await base44.entities.Friend.create({
        player_id: player.id,
        friend_id: friendPlayer.id,
        friend_name: friendPlayer.username,
        status: 'pending',
        added_at: new Date().toISOString()
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['friends'])
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      await base44.entities.Friend.update(requestId, { status: 'accepted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['friendRequests']);
    }
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId) => {
      await base44.entities.Friend.delete(friendId);
    },
    onSuccess: () => queryClient.invalidateQueries(['friends'])
  });

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      updatePlayerMutation.mutate({ username: newUsername.trim() });
      setIsEditingName(false);
    }
  };

  const handleAvatarChange = (updates) => {
    updateAvatarMutation.mutate(updates);
  };

  const totalShiftsWorked = allTimeWorkStats.reduce((sum, stat) => sum + (stat.shifts_completed || 0), 0);
  const totalEarningsFromWork = allTimeWorkStats.reduce((sum, stat) => sum + (stat.total_earned || 0), 0);
  const workCoinsEarned = transactions.filter(t => t.type === 'work_payment').reduce((sum, t) => sum + (t.soft_currency_change || 0), 0);

  const stats = [
    { label: 'Level', value: player?.level || 1, icon: Star, color: 'text-yellow-400' },
    { label: 'Bubbles Popped', value: player?.total_bubbles_popped || 0, icon: Target, color: 'text-blue-400' },
    { label: 'Longest Streak', value: `${player?.longest_streak || 0}x`, icon: Zap, color: 'text-orange-400' },
    { label: 'PvP Rating', value: player?.pvp_rating || 1000, icon: Swords, color: 'text-red-400' },
    { label: 'PvP Wins', value: player?.pvp_wins || 0, icon: Medal, color: 'text-green-400' },
    { label: 'Correct Answers', value: player?.total_correct_answers || 0, icon: CheckCircle, color: 'text-purple-400' },
    { label: 'Shifts Worked', value: totalShiftsWorked, icon: Briefcase, color: 'text-cyan-400' },
    { label: 'Work Earnings', value: workCoinsEarned.toLocaleString(), icon: Coins, color: 'text-green-400' },
    { label: 'Friends', value: friends.length, icon: Users, color: 'text-pink-400' }
  ];

  const unlockedAchievements = player?.achievements || [];

  return (
    <>
      <AutoSaveManager player={player} avatar={avatar} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 md:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto relative z-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Profile</h1>
              <p className="text-slate-400 text-xs md:text-sm">Manage your account and avatar</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-red-600 text-red-400 hover:bg-red-600/10 w-full sm:w-auto"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <AvatarDisplay avatar={avatar} size="xl" />
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      className="bg-slate-700 border-slate-600 text-white w-48"
                    />
                    <Button size="icon" onClick={handleSaveUsername} className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                      <X className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{player?.username || 'Trader'}</h2>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => {
                        setNewUsername(player?.username || '');
                        setIsEditingName(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">Level {player?.level || 1}</span>
                </div>
                {(player?.prestige_tier || 0) > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-300 text-xs font-bold">Prestige {player.prestige_tier}</span>
                  </div>
                )}
                {player?.is_vip && (
                  <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full text-xs">VIP</span>
                )}
                {player?.level >= 50 && (
                  <Button
                    onClick={() => setShowPrestige(true)}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 animate-pulse"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Prestige!
                  </Button>
                )}
              </div>
              
              {/* XP Bar */}
              <div className="mt-4 max-w-xs mx-auto md:mx-0">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>XP: {player?.xp || 0}</span>
                  <span>Next Level</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    style={{ width: `${((player?.xp || 0) % 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="space-y-4 md:space-y-6">
          <TabsList className="w-full bg-slate-800/50 border border-slate-700 p-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-1">
            <TabsTrigger value="stats" className="text-xs md:text-sm">Statistics</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="powerups" className="text-xs md:text-sm">Power-Ups</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs md:text-sm">Badges</TabsTrigger>
            <TabsTrigger value="friends" className="text-xs md:text-sm">Friends</TabsTrigger>
            <TabsTrigger value="avatar" className="text-xs md:text-sm">Avatar</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs md:text-sm">Achievements</TabsTrigger>
          </TabsList>

          {/* Power-Ups Tab */}
          <TabsContent value="powerups">
            <PowerUpInventoryPanel player={player} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-4">
              <iframe 
                src={createPageUrl('Analytics')} 
                className="w-full h-[600px] rounded-xl border-2 border-slate-700 bg-slate-900"
                title="Analytics Dashboard"
              />
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="space-y-4 md:space-y-6 relative z-10">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800/50 rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-700"
                  >
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                      <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                      <span className="text-slate-400 text-xs md:text-sm">{stat.label}</span>
                    </div>
                    <p className={`text-lg md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Work Center Stats */}
              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Center Career
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Total Shifts</p>
                      <p className="text-2xl font-bold text-cyan-400">{totalShiftsWorked}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-400">{workCoinsEarned.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Today's Shifts</p>
                      <p className="text-2xl font-bold text-yellow-400">{dailyStats?.shifts_completed || 0}/10</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Stats */}
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Trading Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Total Trades</p>
                      <p className="text-2xl font-bold text-green-400">{transactions.filter(t => t.type === 'purchase' || t.type === 'trade').length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Portfolio Assets</p>
                      <p className="text-2xl font-bold text-blue-400">{portfolio.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Net Worth</p>
                      <p className="text-2xl font-bold text-yellow-400">{(player?.soft_currency || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <div className="space-y-6 relative z-10">
              {/* Achievement Badges */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50 relative z-10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Achievement Badges ({earnedBadges.length}/{Object.keys(BADGE_DEFINITIONS).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {earnedBadges.length > 0 ? (
                    <div className="mb-6">
                      <h3 className="text-white font-bold mb-3">Earned Badges</h3>
                      <BadgeDisplay badges={earnedBadges} size="lg" />
                    </div>
                  ) : null}
                  
                  <div className="space-y-3">
                    <h3 className="text-white font-bold">All Available Badges</h3>
                    {Object.values(BADGE_DEFINITIONS).map((badge, i) => {
                      const earned = earnedBadges.some(b => b.badge_id === badge.id);
                      return (
                        <div 
                          key={badge.id}
                          className={`p-3 rounded-lg border ${
                            earned 
                              ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                              : 'bg-slate-800/30 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{badge.icon}</span>
                            <div className="flex-1">
                              <p className={`font-bold ${earned ? 'text-white' : 'text-slate-400'}`}>
                                {badge.name}
                              </p>
                              <p className="text-slate-400 text-sm">{badge.description}</p>
                              <Badge className={`mt-1 ${
                                badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                                badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                                badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {badge.rarity}
                              </Badge>
                            </div>
                            {earned && <CheckCircle className="w-5 h-5 text-green-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Prestige Badges */}
              <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Prestige Badges ({prestigeBadges.length}/8)
                    </CardTitle>
                    <Link to={createPageUrl('PrestigeBadges')}>
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {prestigeBadges.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {prestigeBadges.map(badge => (
                        <div key={badge.id} className="bg-slate-800/50 rounded-lg p-3 border border-yellow-500/30 text-center">
                          <div className="text-3xl mb-1">
                            {badge.badge_type === 'trading_master' && '📊'}
                            {badge.badge_type === 'bubble_legend' && '🎈'}
                            {badge.badge_type === 'guild_commander' && '⚔️'}
                            {badge.badge_type === 'wealth_baron' && '💰'}
                            {badge.badge_type === 'pvp_warrior' && '🗡️'}
                            {badge.badge_type === 'streak_champion' && '🔥'}
                            {badge.badge_type === 'diamond_collector' && '💎'}
                            {badge.badge_type === 'market_oracle' && '🔮'}
                          </div>
                          <p className="text-white text-xs font-bold capitalize">{badge.badge_type.replace('_', ' ')}</p>
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                            {[...Array(badge.badge_level || 1)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">No prestige badges yet. Keep playing to earn them!</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <div className="space-y-6 relative z-10">
              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Friend Requests ({friendRequests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {friendRequests.map(request => {
                        const requester = allPlayers.find(p => p.id === request.player_id);
                        return (
                          <div key={request.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-bold">{request.player_name}</p>
                                <p className="text-slate-400 text-xs">Level {requester?.level || 1}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => acceptFriendRequestMutation.mutate(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => removeFriendMutation.mutate(request.id)}
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Friends List */}
              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Friends ({friends.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {friends.length > 0 ? (
                    <div className="space-y-3">
                      {friends.map(friend => {
                        const friendPlayer = allPlayers.find(p => p.id === friend.friend_id);
                        return (
                          <div key={friend.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-bold">{friend.friend_name}</p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-slate-400">Level {friendPlayer?.level || 1}</span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-cyan-400">{friendPlayer?.pvp_rating || 1000} Rating</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeFriendMutation.mutate(friend.id)}
                              className="border-slate-600 text-slate-400 hover:bg-red-500/10 hover:border-red-500"
                            >
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-2">No friends yet</p>
                      <p className="text-slate-500 text-sm">Add friends to compete and trade together!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Friends */}
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add Friends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allPlayers
                      .filter(p => p.id !== player?.id)
                      .filter(p => !friends.some(f => f.friend_id === p.id))
                      .filter(p => !friendRequests.some(r => r.player_id === p.id))
                      .slice(0, 20)
                      .map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-bold">{p.username}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400">Level {p.level || 1}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-green-400">{p.pvp_rating || 1000} Rating</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => sendFriendRequestMutation.mutate(p)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Avatar Tab */}
          <TabsContent value="avatar">
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50 relative z-10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Customize Your Avatar
                </CardTitle>
                <p className="text-slate-400 text-sm">Express yourself with unique customization options</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <AvatarCustomizer 
                  avatar={avatar} 
                  onUpdate={handleAvatarChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {ACHIEVEMENTS.map((achievement, index) => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                const Icon = achievement.icon;
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 md:p-4 rounded-lg md:rounded-xl border ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                        : 'bg-slate-800/50 border-slate-700 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isUnlocked ? 'bg-yellow-500/30' : 'bg-slate-700'
                      }`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isUnlocked ? 'text-yellow-400' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm md:text-base ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                          {achievement.name}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-400 truncate">{achievement.description}</p>
                      </div>
                      {isUnlocked && (
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
      {showPrestige && player && (
        <PrestigeSystem 
          player={player}
          onClose={() => setShowPrestige(false)}
        />
      )}
    </>
  );
}