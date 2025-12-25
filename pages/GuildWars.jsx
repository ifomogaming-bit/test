import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Swords,
  Trophy,
  Shield,
  Zap,
  Crown,
  Target,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flame,
  Sparkles
} from 'lucide-react';
import BattlegroundMap, { BATTLEGROUND_MAPS } from '@/components/guilds/BattlegroundMap';
import BattleSoundEffects from '@/components/audio/BattleSoundEffects';
import WarChallengePanel from '@/components/guilds/WarChallengePanel';
import OpposingGuildMembers from '@/components/guilds/OpposingGuildMembers';
import WarChallengeMiniGames from '@/components/guilds/WarChallengeMiniGames';
import GuildEmblem from '@/components/guilds/GuildEmblem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const WAR_REQUIREMENTS = {
  MIN_GUILD_LEVEL: 2,
  MIN_MEMBERS: 3,
  ENTRY_FEE: 5000,
  COOLDOWN_HOURS: 24
};

export default function GuildWars() {
  const [user, setUser] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [showInitiateDialog, setShowInitiateDialog] = useState(false);
  const [selectedWar, setSelectedWar] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
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

  const { data: myGuildMembership } = useQuery({
    queryKey: ['myGuildMembership', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const memberships = await base44.entities.GuildMember.filter({ player_id: player.id });
      return memberships[0] || null;
    },
    enabled: !!player?.id
  });

  const { data: myGuild } = useQuery({
    queryKey: ['myGuild', myGuildMembership?.guild_id],
    queryFn: async () => {
      if (!myGuildMembership?.guild_id) return null;
      const guilds = await base44.entities.Guild.filter({ id: myGuildMembership.guild_id });
      return guilds[0] || null;
    },
    enabled: !!myGuildMembership?.guild_id
  });

  const { data: guilds = [] } = useQuery({
    queryKey: ['guilds'],
    queryFn: async () => {
      return base44.entities.Guild.list('-trophies', 100);
    }
  });

  const { data: activeWars = [] } = useQuery({
    queryKey: ['activeWars'],
    queryFn: async () => {
      return base44.entities.GuildWar.filter({ status: 'active' }, '-created_date');
    }
  });

  const { data: allWars = [] } = useQuery({
    queryKey: ['allWars'],
    queryFn: async () => {
      return base44.entities.GuildWar.list('-created_date', 100);
    }
  });

  const { data: guildMembers = [] } = useQuery({
    queryKey: ['guildMembers', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildMember.filter({ guild_id: myGuild.id });
    },
    enabled: !!myGuild?.id
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      return base44.entities.Player.list('-level', 200);
    }
  });

  const { data: warContributions = [] } = useQuery({
    queryKey: ['warContributions', selectedWar?.id],
    queryFn: async () => {
      if (!selectedWar?.id) return [];
      return base44.entities.GuildWarContribution.filter({ war_id: selectedWar.id }, '-points_earned');
    },
    enabled: !!selectedWar?.id
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['myChallenges', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.WarChallenge.filter({ challenger_id: player.id, status: 'pending' }, '-created_date');
    },
    enabled: !!player?.id,
    refetchInterval: 5000
  });

  const canInitiateWar = () => {
    if (!myGuild || !myGuildMembership) return { can: false, reason: 'Not in a guild' };
    
    const hasPermission = myGuildMembership.role === 'leader' || 
                         myGuildMembership.role === 'war_general' ||
                         myGuildMembership.permissions?.initiate_wars;
    if (!hasPermission) return { can: false, reason: 'No permission to initiate wars' };
    
    if ((myGuild.level || 1) < WAR_REQUIREMENTS.MIN_GUILD_LEVEL) {
      return { can: false, reason: `Guild must be level ${WAR_REQUIREMENTS.MIN_GUILD_LEVEL}+` };
    }
    
    if ((myGuild.member_count || 0) < WAR_REQUIREMENTS.MIN_MEMBERS) {
      return { can: false, reason: `Need at least ${WAR_REQUIREMENTS.MIN_MEMBERS} members` };
    }
    
    if ((myGuild.treasury_balance || 0) < WAR_REQUIREMENTS.ENTRY_FEE) {
      return { can: false, reason: `Need ${WAR_REQUIREMENTS.ENTRY_FEE} coins in treasury` };
    }
    
    // Check cooldown
    if (myGuild.raid_cooldown_until) {
      const cooldownEnd = new Date(myGuild.raid_cooldown_until);
      if (cooldownEnd > new Date()) {
        return { can: false, reason: 'Guild is on cooldown' };
      }
    }
    
    return { can: true, reason: '' };
  };

  const initiateWarMutation = useMutation({
    mutationFn: async (opponentGuildId) => {
      const requirement = canInitiateWar();
      if (!requirement.can) throw new Error(requirement.reason);

      // Deduct entry fee
      await base44.entities.Guild.update(myGuild.id, {
        treasury_balance: (myGuild.treasury_balance || 0) - WAR_REQUIREMENTS.ENTRY_FEE
      });

      const startsAt = new Date();
      const endsAt = new Date(startsAt);
      endsAt.setDate(endsAt.getDate() + 5); // 5 days duration

      const war = await base44.entities.GuildWar.create({
        challenger_guild_id: myGuild.id,
        opponent_guild_id: opponentGuildId,
        status: 'active',
        challenger_score: 0,
        opponent_score: 0,
        prize_pool: WAR_REQUIREMENTS.ENTRY_FEE * 2,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString()
      });

      // Set cooldown
      const cooldownEnd = new Date();
      cooldownEnd.setHours(cooldownEnd.getHours() + WAR_REQUIREMENTS.COOLDOWN_HOURS);
      await base44.entities.Guild.update(myGuild.id, {
        raid_cooldown_until: cooldownEnd.toISOString()
      });

      // Audit logs
      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'war_initiated',
        target_id: opponentGuildId,
        details: { entry_fee: WAR_REQUIREMENTS.ENTRY_FEE }
      });

      return war;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeWars']);
      queryClient.invalidateQueries(['myGuild']);
      setShowInitiateDialog(false);
      setSelectedOpponent(null);
    }
  });

  const contributeToWarMutation = useMutation({
    mutationFn: async ({ warId, contributionPoints, type = 'donation', opponentId = null, opponentName = null }) => {
      const war = activeWars.find(w => w.id === warId);
      if (!war) throw new Error('War not found');

      const isChallenger = war.challenger_guild_id === myGuild.id;
      const scoreField = isChallenger ? 'challenger_score' : 'opponent_score';

      await base44.entities.GuildWar.update(warId, {
        [scoreField]: (war[scoreField] || 0) + contributionPoints
      });

      await base44.entities.GuildMember.update(myGuildMembership.id, {
        contribution_points: (myGuildMembership.contribution_points || 0) + contributionPoints
      });

      // Record contribution
      await base44.entities.GuildWarContribution.create({
        war_id: warId,
        player_id: player.id,
        player_name: player.username,
        guild_id: myGuild.id,
        points_earned: contributionPoints,
        contribution_type: type,
        opponent_player_id: opponentId,
        opponent_player_name: opponentName
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeWars']);
      queryClient.invalidateQueries(['myGuildMembership']);
      queryClient.invalidateQueries(['warContributions']);
    }
  });

  const resolveWarMutation = useMutation({
    mutationFn: async (warId) => {
      const war = activeWars.find(w => w.id === warId);
      if (!war) throw new Error('War not found');

      const challengerGuild = guilds.find(g => g.id === war.challenger_guild_id);
      const opponentGuild = guilds.find(g => g.id === war.opponent_guild_id);

      const challengerWins = war.challenger_score > war.opponent_score;
      const winnerGuildId = challengerWins ? war.challenger_guild_id : war.opponent_guild_id;
      const loserGuildId = challengerWins ? war.opponent_guild_id : war.challenger_guild_id;

      await base44.entities.GuildWar.update(warId, {
        status: 'completed',
        winner_guild_id: winnerGuildId
      });

      // Award prize to winner
      const winnerGuild = challengerWins ? challengerGuild : opponentGuild;
      if (winnerGuild) {
        await base44.entities.Guild.update(winnerGuildId, {
          treasury_balance: (winnerGuild.treasury_balance || 0) + war.prize_pool,
          trophies: (winnerGuild.trophies || 0) + 100,
          guild_xp: (winnerGuild.guild_xp || 0) + 500
        });
      }

      // Update loser
      const loserGuild = challengerWins ? opponentGuild : challengerGuild;
      if (loserGuild) {
        await base44.entities.Guild.update(loserGuildId, {
          trophies: Math.max(0, (loserGuild.trophies || 0) - 30)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeWars']);
      queryClient.invalidateQueries(['allWars']);
      queryClient.invalidateQueries(['guilds']);
    }
  });

  const myActiveWars = activeWars.filter(w => 
    w.challenger_guild_id === myGuild?.id || w.opponent_guild_id === myGuild?.id
  );

  const warHistory = allWars.filter(w => 
    (w.challenger_guild_id === myGuild?.id || w.opponent_guild_id === myGuild?.id) && 
    w.status === 'completed'
  );

  const eligibleOpponents = guilds.filter(g => 
    g.id !== myGuild?.id && 
    (g.level || 1) >= WAR_REQUIREMENTS.MIN_GUILD_LEVEL &&
    (g.member_count || 0) >= WAR_REQUIREMENTS.MIN_MEMBERS
  );

  const requirement = canInitiateWar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-orange-950 relative overflow-x-hidden">
      {/* Ultra vibrant background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-yellow-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Animated battle particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link to={createPageUrl('Guilds')}>
              <Button variant="outline" className="border-red-500/50 text-white hover:bg-red-500/20 hover:border-red-400 shadow-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 flex items-center gap-3 animate-pulse">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Swords className="w-10 h-10 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                </motion.div>
                Guild Wars
              </h1>
              <p className="text-orange-300 font-medium">⚔️ Compete in epic guild battles for glory and treasure</p>
            </div>
          </div>

          {myGuild && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowInitiateDialog(true)}
                disabled={!requirement.can}
                className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 shadow-xl shadow-red-500/50 border-2 border-red-400/50 font-black text-lg px-6 py-6"
              >
                <Flame className="w-5 h-5 mr-2 animate-pulse" />
                Declare War
              </Button>
            </motion.div>
          )}
        </div>

        {!myGuild ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-white text-xl font-bold mb-2">Join a Guild First</h3>
              <p className="text-slate-400 mb-4">You need to be in a guild to participate in wars</p>
              <Link to={createPageUrl('Guilds')}>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  Browse Guilds
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="bg-gradient-to-r from-slate-800/80 via-purple-900/50 to-slate-800/80 border-2 border-purple-500/40 shadow-lg shadow-purple-500/20 p-1.5">
              <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Flame className="w-4 h-4 mr-2" />
                Active Wars ({myActiveWars.length})
              </TabsTrigger>
              <TabsTrigger value="rankings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Trophy className="w-4 h-4 mr-2" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Clock className="w-4 h-4 mr-2" />
                War History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {myActiveWars.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Swords className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-white text-xl font-bold mb-2">No Active Wars</h3>
                    <p className="text-slate-400">Start a war to compete with other guilds</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myActiveWars.slice(0, 1).map(war => {
                    const isChallenger = war.challenger_guild_id === myGuild.id;
                    const opponentId = isChallenger ? war.opponent_guild_id : war.challenger_guild_id;
                    const opponent = guilds.find(g => g.id === opponentId);
                    const myScore = isChallenger ? war.challenger_score : war.opponent_score;
                    const opponentScore = isChallenger ? war.opponent_score : war.challenger_score;
                    const endsAt = new Date(war.ends_at);
                    const timeLeft = Math.max(0, endsAt - new Date());
                    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                    // Assign random battleground for each war
                    const mapKeys = Object.keys(BATTLEGROUND_MAPS);
                    const warMapType = mapKeys[Math.floor((war.id?.charCodeAt(0) || 0) % mapKeys.length)];
                    
                    return (
                      <motion.div
                        key={war.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="mb-6"
                      >
                        <Card className="bg-gradient-to-br from-red-900/50 via-orange-900/40 to-purple-900/50 border-2 border-red-400 shadow-2xl shadow-red-500/60 backdrop-blur-sm overflow-hidden relative">
                          {/* Animated border glow */}
                          <motion.div
                            className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-lg opacity-30 blur-sm"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          />
                          {/* Epic Battleground map */}
                          <div className="p-4 pb-0">
                            <BattlegroundMap mapType={warMapType} showOverlay={true} inBattle={true} />
                          </div>
                          
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <GuildEmblem guild={myGuild} size="lg" showGlow={true} animated={true} showTag={false} />
                                <div>
                                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-xl font-black">
                                    {myGuild.name}
                                    {myGuild.guild_tag && (
                                      <span className="ml-2" style={{ color: myGuild.banner_color_primary }}>
                                        [{myGuild.guild_tag}]
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-cyan-300 text-sm font-bold">⚡ Your Guild</p>
                                  {myGuild.guild_title && (
                                    <p className="text-yellow-400 text-xs font-bold">"{myGuild.guild_title}"</p>
                                  )}
                                </div>
                              </div>

                              <div className="text-center">
                                <motion.div
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                  <Swords className="w-10 h-10 mx-auto mb-2 text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,1)]" />
                                </motion.div>
                                <Badge className="bg-gradient-to-r from-red-500/40 to-orange-500/40 text-yellow-300 border-2 border-red-400 font-black shadow-lg shadow-red-500/50">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {daysLeft}d {hoursLeft}h left
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 text-xl font-black">
                                    {opponent?.name}
                                    {opponent?.guild_tag && (
                                      <span className="ml-2" style={{ color: opponent.banner_color_primary }}>
                                        [{opponent.guild_tag}]
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-red-300 text-sm font-bold">☠️ Enemy Guild</p>
                                  {opponent?.guild_title && (
                                    <p className="text-yellow-400 text-xs font-bold">"{opponent.guild_title}"</p>
                                  )}
                                </div>
                                <GuildEmblem guild={opponent} size="lg" showGlow={true} animated={true} showTag={false} />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <motion.div 
                                className="text-center p-4 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-xl border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30"
                                whileHover={{ scale: 1.05 }}
                              >
                                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-300">{myScore}</p>
                                <p className="text-cyan-300 text-sm font-bold mt-1">Your Score</p>
                              </motion.div>
                              <div className="text-center p-4 bg-gradient-to-br from-yellow-600/40 to-orange-600/40 rounded-xl border-2 border-yellow-400/60 shadow-xl shadow-yellow-500/50">
                                <motion.div
                                  animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                </motion.div>
                                <p className="text-yellow-300 font-black text-xl">${war.prize_pool?.toLocaleString()}</p>
                                <p className="text-yellow-400 text-sm font-bold">Prize Pool</p>
                              </div>
                              <motion.div 
                                className="text-center p-4 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-xl border-2 border-red-400/50 shadow-lg shadow-red-500/30"
                                whileHover={{ scale: 1.05 }}
                              >
                                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-300 to-orange-300">{opponentScore}</p>
                                <p className="text-red-300 text-sm font-bold mt-1">Enemy Score</p>
                              </motion.div>
                            </div>

                            <Progress 
                              value={myScore > 0 ? (myScore / (myScore + opponentScore)) * 100 : 50} 
                              className="h-3 mb-4"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <OpposingGuildMembers
                                war={war}
                                myGuild={myGuild}
                                opponentGuild={opponent}
                                player={player}
                              />
                              <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border-2 border-cyan-500/50">
                                <CardHeader>
                                  <CardTitle className="text-white flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-cyan-400" />
                                    Quick Actions
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <Button
                                    onClick={() => contributeToWarMutation.mutate({ 
                                      warId: war.id, 
                                      contributionPoints: 10,
                                      type: 'donation'
                                    })}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                                  >
                                    <Zap className="w-5 h-5 mr-2" />
                                    Donate Resources (+10 pts)
                                  </Button>
                                  <Button
                                    onClick={() => setSelectedWar(war)}
                                    variant="outline"
                                    className="w-full border-purple-500/50 text-purple-300"
                                  >
                                    <Target className="w-4 h-4 mr-2" />
                                    View Leaderboard
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rankings">
              <Card className="bg-gradient-to-br from-yellow-900/40 via-orange-900/30 to-red-900/40 border-2 border-yellow-500/60 shadow-2xl shadow-yellow-500/40">
                <CardHeader>
                  <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 flex items-center gap-2 text-2xl font-black">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
                    </motion.div>
                    🏆 Guild War Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guilds
                      .sort((a, b) => (b.trophies || 0) - (a.trophies || 0))
                      .slice(0, 20)
                      .map((guild, idx) => (
                        <motion.div 
                          key={guild.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className={`p-5 rounded-xl border-2 ${
                          idx === 0 ? 'bg-gradient-to-r from-yellow-500/40 via-orange-500/40 to-yellow-500/40 border-yellow-400 shadow-2xl shadow-yellow-500/60' :
                          idx === 1 ? 'bg-gradient-to-r from-slate-400/30 via-slate-300/30 to-slate-400/30 border-slate-300 shadow-xl shadow-slate-400/40' :
                          idx === 2 ? 'bg-gradient-to-r from-amber-600/30 via-orange-600/30 to-amber-600/30 border-amber-500 shadow-xl shadow-amber-500/40' :
                          'bg-gradient-to-r from-slate-700/40 to-slate-600/40 border-slate-600/50 shadow-lg'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={`text-4xl font-black ${idx < 3 ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : ''}`}>
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                              </span>
                              <div>
                                <h4 className={`font-black text-lg ${
                                  idx === 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300' :
                                  idx === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400' :
                                  idx === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400' :
                                  'text-white'
                                }`}>{guild.name}</h4>
                                <p className={`text-sm font-bold ${idx < 3 ? 'text-yellow-200' : 'text-slate-400'}`}>
                                  Level {guild.level || 1} • {guild.member_count} members
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end mb-1">
                                <Trophy className={`w-6 h-6 ${idx === 0 ? 'text-yellow-300' : 'text-yellow-400'} ${idx === 0 ? 'animate-pulse' : ''}`} />
                                <p className={`text-2xl font-black ${
                                  idx === 0 ? 'text-yellow-300' :
                                  idx === 1 ? 'text-slate-300' :
                                  idx === 2 ? 'text-amber-400' :
                                  'text-yellow-400'
                                }`}>{guild.trophies || 0}</p>
                              </div>
                              <p className={`text-xs font-bold ${idx < 3 ? 'text-yellow-200' : 'text-slate-400'}`}>War Trophies</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {warHistory.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400">No war history yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  warHistory.map(war => {
                    const challenger = guilds.find(g => g.id === war.challenger_guild_id);
                    const opponent = guilds.find(g => g.id === war.opponent_guild_id);
                    const didWeWin = war.winner_guild_id === myGuild.id;

                    return (
                      <Card key={war.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {didWeWin ? (
                                <CheckCircle className="w-8 h-8 text-green-400" />
                              ) : (
                                <XCircle className="w-8 h-8 text-red-400" />
                              )}
                              <div>
                                <h4 className="text-white font-bold">
                                  {challenger?.name} vs {opponent?.name}
                                </h4>
                                <p className="text-slate-400 text-sm">
                                  {new Date(war.created_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={didWeWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {didWeWin ? 'Victory' : 'Defeat'}
                              </Badge>
                              <p className="text-slate-400 text-sm mt-1">
                                {war.challenger_score} - {war.opponent_score}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      </div>

      {/* Initiate War Dialog */}
      <Dialog open={showInitiateDialog} onOpenChange={setShowInitiateDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
              Initiate Guild War
            </DialogTitle>
          </DialogHeader>

          {!requirement.can && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 font-medium">{requirement.reason}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Entry Fee</p>
                <p className="text-white text-xl font-bold">${WAR_REQUIREMENTS.ENTRY_FEE.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-slate-400 text-sm">War Duration</p>
                <p className="text-white text-xl font-bold">5 days</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Min Guild Level</p>
                <p className="text-white text-xl font-bold">Level {WAR_REQUIREMENTS.MIN_GUILD_LEVEL}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Cooldown</p>
                <p className="text-white text-xl font-bold">{WAR_REQUIREMENTS.COOLDOWN_HOURS}h</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Select Opponent</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {eligibleOpponents.map(guild => (
                <button
                  key={guild.id}
                  onClick={() => setSelectedOpponent(guild)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedOpponent?.id === guild.id
                      ? 'bg-red-600 border-2 border-red-400'
                      : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-white font-bold">{guild.name}</h5>
                      <p className="text-slate-400 text-sm">
                        Level {guild.level || 1} • {guild.member_count} members • {guild.trophies || 0} trophies
                      </p>
                    </div>
                    {selectedOpponent?.id === guild.id && (
                      <CheckCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowInitiateDialog(false)}
              className="flex-1 border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => selectedOpponent && initiateWarMutation.mutate(selectedOpponent.id)}
              disabled={!selectedOpponent || !requirement.can}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Swords className="w-4 h-4 mr-2" />
              Declare War
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* War Details Dialog */}
      <Dialog open={!!selectedWar} onOpenChange={() => setSelectedWar(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">War Details</DialogTitle>
          </DialogHeader>
          {selectedWar && (
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  War Contributions - Full Transparency
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {warContributions.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No contributions yet</p>
                  ) : (
                    warContributions.map((contribution, idx) => (
                      <div key={contribution.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-slate-400">#{idx + 1}</span>
                          <div>
                            <p className="text-white font-medium">{contribution.player_name}</p>
                            <p className="text-slate-400 text-xs">
                              {contribution.contribution_type === 'pvp_victory' && '⚔️ PvP Challenge'}
                              {contribution.contribution_type === 'trading_challenge' && '📈 Trading Duel'}
                              {contribution.contribution_type === 'bubble_challenge' && '🎯 Bubble Challenge'}
                              {contribution.contribution_type === 'donation' && '💰 Resource Donation'}
                              {contribution.opponent_player_name && ` vs ${contribution.opponent_player_name}`}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 font-bold">
                          +{contribution.points_earned} pts
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-500/30">
                  <p className="text-cyan-300 text-sm mb-1">Your Guild Total</p>
                  <p className="text-white text-2xl font-black">
                    {warContributions.filter(c => c.guild_id === myGuild?.id).reduce((sum, c) => sum + c.points_earned, 0)} pts
                  </p>
                </div>
                <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30">
                  <p className="text-red-300 text-sm mb-1">Enemy Guild Total</p>
                  <p className="text-white text-2xl font-black">
                    {warContributions.filter(c => c.guild_id !== myGuild?.id).reduce((sum, c) => sum + c.points_earned, 0)} pts
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setSelectedWar(null)}
                variant="outline"
                className="w-full border-slate-600"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Active Mini-Game Challenge */}
      {activeChallenge && (
        <WarChallengeMiniGames
          challenge={activeChallenge}
          player={player}
          war={myActiveWars[0]}
          myGuild={myGuild}
          onComplete={() => setActiveChallenge(null)}
        />
      )}

      {/* Challenge Notification */}
      {myChallenges.length > 0 && !activeChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 md:bottom-8 right-4 z-40"
        >
          <Card className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 border-2 border-purple-400 shadow-2xl shadow-purple-500/60 max-w-sm">
            <CardContent className="p-4">
              <h3 className="text-white font-black mb-2 flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-400" />
                Incoming Challenge!
              </h3>
              <p className="text-purple-200 text-sm mb-3">
                {myChallenges[0]?.opponent_name} challenged you to {myChallenges[0]?.challenge_type?.replace('_', ' ')}!
              </p>
              <Button
                onClick={() => setActiveChallenge(myChallenges[0])}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Accept Challenge
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}