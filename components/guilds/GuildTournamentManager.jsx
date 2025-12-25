import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Trophy, 
  Clock, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  Calendar,
  Target,
  Zap,
  Crown,
  Medal,
  Sparkles,
  BarChart3,
  Plus,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TournamentCreationModal from '@/components/tournaments/TournamentCreationModal';
import TournamentGameArena from '@/components/tournaments/TournamentGameArena';
import TournamentBattleArena from '@/components/tournaments/TournamentBattleArena';

const TOURNAMENT_TYPES = {
  highest_gain_percent: {
    name: 'Percentage Master',
    description: 'Highest % portfolio gain wins',
    icon: TrendingUp,
    color: 'from-green-600 to-emerald-600'
  },
  most_trades: {
    name: 'Volume King',
    description: 'Most profitable trades executed',
    icon: Zap,
    color: 'from-blue-600 to-cyan-600'
  },
  highest_profit_total: {
    name: 'Profit Champion',
    description: 'Highest total profit in coins',
    icon: DollarSign,
    color: 'from-yellow-600 to-amber-600'
  },
  best_risk_adjusted: {
    name: 'Risk Manager',
    description: 'Best Sharpe ratio (return/risk)',
    icon: Target,
    color: 'from-purple-600 to-pink-600'
  },
  portfolio_diversity: {
    name: 'Diversification Master',
    description: 'Most diverse portfolio wins',
    icon: BarChart3,
    color: 'from-indigo-600 to-blue-600'
  },
  options_master: {
    name: 'Options Wizard',
    description: 'Best options trading performance',
    icon: Award,
    color: 'from-orange-600 to-red-600'
  },
  day_trading_sprint: {
    name: 'Day Trading Sprint',
    description: '24hr speed trading challenge',
    icon: Clock,
    color: 'from-red-600 to-rose-600'
  }
};

export default function GuildTournamentManager({ myGuild, guildTreasury, isLeader, player }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTournamentSession, setActiveTournamentSession] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const queryClient = useQueryClient();

  const { data: tournaments = [] } = useQuery({
    queryKey: ['guildTournaments'],
    queryFn: async () => {
      return base44.entities.GuildTournament.list('-starts_at', 50);
    },
    staleTime: 60000,
    refetchInterval: 120000
  });

  const { data: myGuildMembers = [] } = useQuery({
    queryKey: ['myGuildMembers', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildMember.filter({ guild_id: myGuild.id });
    },
    enabled: !!myGuild?.id
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list('-level', 100),
    staleTime: 300000,
    refetchOnWindowFocus: false
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData) => {
      const CREATION_COST = 50;
      
      if ((player?.premium_currency || 0) < CREATION_COST) {
        throw new Error('Insufficient gems');
      }

      // Deduct gems
      await base44.entities.Player.update(player.id, {
        premium_currency: (player.premium_currency || 0) - CREATION_COST
      });

      const startsAt = new Date();
      startsAt.setHours(startsAt.getHours() + 1);
      const endsAt = new Date(startsAt);
      endsAt.setDate(endsAt.getDate() + tournamentData.duration_days);

      // Calculate base rewards based on duration and participant count
      const basePrizePool = 1000 * tournamentData.duration_days * (tournamentData.max_participants / 8);
      const baseXP = 500 * tournamentData.duration_days * (tournamentData.max_participants / 8);

      const tournament = await base44.entities.GuildTournament.create({
        name: tournamentData.name,
        description: tournamentData.description,
        tournament_type: 'custom_mini_games',
        game_types: tournamentData.game_types,
        status: 'upcoming',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        entry_fee_per_guild: 0,
        max_participants: tournamentData.max_participants,
        prize_pool: Math.floor(basePrizePool),
        prize_pool_xp: Math.floor(baseXP),
        include_rare_items: true,
        include_stock_shares: true,
        is_public: tournamentData.is_public,
        created_by_player: player.id,
        created_by_guild: myGuild?.id,
        participating_guilds: [],
        player_scores: {},
        guild_scores: {}
      });

      return tournament;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildTournaments']);
      queryClient.invalidateQueries(['player']);
      setShowCreateDialog(false);
    }
  });

  const startNowMutation = useMutation({
    mutationFn: async (tournamentId) => {
      await base44.entities.GuildTournament.update(tournamentId, {
        status: 'active',
        starts_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildTournaments']);
    }
  });

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournament) => {
      // Add player to tournament
      await base44.entities.GuildTournament.update(tournament.id, {
        participating_guilds: [...(tournament.participating_guilds || []), player.id],
        player_scores: { ...(tournament.player_scores || {}), [player.id]: 0 }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildTournaments']);
    }
  });

  const completeTournamentMutation = useMutation({
    mutationFn: async ({ tournamentId, finalScore }) => {
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) return;

      // Update player score
      await base44.entities.GuildTournament.update(tournamentId, {
        player_scores: { ...(tournament.player_scores || {}), [player.id]: finalScore }
      });

      // Calculate rewards
      const playerScores = { ...(tournament.player_scores || {}), [player.id]: finalScore };
      const sortedPlayers = Object.entries(playerScores).sort(([, a], [, b]) => b - a);
      const playerRank = sortedPlayers.findIndex(([pid]) => pid === player.id) + 1;
      
      let rewardMultiplier = 0;
      if (playerRank === 1) rewardMultiplier = 1.0;
      else if (playerRank === 2) rewardMultiplier = 0.6;
      else if (playerRank === 3) rewardMultiplier = 0.4;
      else if (playerRank <= 5) rewardMultiplier = 0.2;
      else rewardMultiplier = 0.1; // Participation reward

      const coinsReward = Math.floor((tournament.prize_pool || 1000) * rewardMultiplier);
      const xpReward = Math.floor((tournament.prize_pool_xp || 500) * rewardMultiplier);

      // Award rewards
      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + coinsReward,
        xp: (player.xp || 0) + xpReward
      });

      // Rare items for top 3
      if (tournament.include_rare_items && playerRank <= 3) {
        const rareItems = ['legendary_trader_outfit', 'golden_chart_background', 'diamond_portfolio_frame'];
        await base44.entities.Inventory.create({
          player_id: player.id,
          item_id: rareItems[playerRank - 1],
          item_type: 'outfit'
        });
      }

      // Stock shares for top performer
      if (tournament.include_stock_shares && playerRank === 1) {
        const premiumStocks = ['AAPL', 'GOOGL', 'NVDA'];
        const randomStock = premiumStocks[Math.floor(Math.random() * premiumStocks.length)];
        
        const existingHolding = await base44.entities.Portfolio.filter({ 
          player_id: player.id, 
          ticker: randomStock 
        });

        if (existingHolding.length > 0) {
          await base44.entities.Portfolio.update(existingHolding[0].id, {
            shares: (existingHolding[0].shares || 0) + 10
          });
        } else {
          await base44.entities.Portfolio.create({
            player_id: player.id,
            ticker: randomStock,
            shares: 10,
            avg_acquisition_price: 0,
            total_invested: 0
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['guildTournaments']);
    }
  });

  const getTimeRemaining = (endsAt) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getTimeUntilStart = (startsAt) => {
    const now = new Date();
    const start = new Date(startsAt);
    const diff = start - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    return `Starts in ${hours}h`;
  };

  const activeTournaments = tournaments.filter(t => t.status === 'active');
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  const isParticipating = (tournament) => {
    return tournament.participating_guilds?.includes(myGuild?.id);
  };

  if (selectedOpponent && activeTournamentSession) {
    return (
      <TournamentBattleArena
        tournament={activeTournamentSession}
        player={player}
        opponent={selectedOpponent}
        onBattleComplete={() => {
          setSelectedOpponent(null);
          setActiveTournamentSession(null);
        }}
      />
    );
  }

  if (activeTournamentSession) {
    // Show opponent selection for point-based tournaments
    const otherParticipants = (activeTournamentSession.participating_guilds || [])
      .filter(id => id !== player.id)
      .map(id => allPlayers.find(p => p.id === id))
      .filter(Boolean);

    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 border-4 border-purple-500/60">
            <CardHeader>
              <CardTitle className="text-3xl font-black text-white flex items-center gap-3">
                <Swords className="w-8 h-8 text-purple-400" />
                Select Your Opponent
              </CardTitle>
              <p className="text-purple-300">Choose a player to battle in the tournament</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 mb-6">
                {otherParticipants.map(opponent => {
                  const opponentScore = activeTournamentSession.player_scores?.[opponent.id] || 0;
                  
                  return (
                    <motion.div
                      key={opponent.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => setSelectedOpponent(opponent)}
                      className="p-4 bg-slate-800/50 rounded-xl border-2 border-slate-700 hover:border-purple-500 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                            <Crown className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-black text-xl">{opponent.username}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge className="bg-blue-500/20 text-blue-400">
                                Level {opponent.level}
                              </Badge>
                              <span className="text-yellow-400 text-sm font-bold">
                                {opponentScore} pts
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-black">
                          <Swords className="w-4 h-4 mr-2" />
                          Battle!
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Button
                onClick={() => setActiveTournamentSession(null)}
                variant="outline"
                className="w-full border-slate-600"
              >
                Back to Tournaments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-xl shadow-purple-500/50 border-2 border-purple-400/50 font-black text-lg px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Tournament
          </Button>
        </motion.div>
      </div>

      <TournamentCreationModal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onConfirm={(tournamentData) => createTournamentMutation.mutate(tournamentData)}
        player={player}
      />

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="active">
            <Zap className="w-4 h-4 mr-2" />
            Active ({activeTournaments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming ({upcomingTournaments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Award className="w-4 h-4 mr-2" />
            Completed ({completedTournaments.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Tournaments */}
        <TabsContent value="active">
          <div className="grid gap-4">
            {activeTournaments.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">No active tournaments</p>
                </CardContent>
              </Card>
            ) : (
              activeTournaments.map((tournament) => {
                const typeConfig = TOURNAMENT_TYPES[tournament.tournament_type] || TOURNAMENT_TYPES.highest_gain_percent;
                const Icon = typeConfig.icon;
                const isPlayerTournament = tournament.tournament_type === 'custom_mini_games';
                const participating = isPlayerTournament 
                  ? tournament.participating_guilds?.includes(player?.id)
                  : isParticipating(tournament);
                const myScore = isPlayerTournament
                  ? tournament.player_scores?.[player?.id] || 0
                  : tournament.guild_scores?.[myGuild?.id] || 0;
                const myRank = isPlayerTournament
                  ? Object.entries(tournament.player_scores || {})
                      .sort(([, a], [, b]) => b - a)
                      .findIndex(([playerId]) => playerId === player?.id) + 1
                  : Object.entries(tournament.guild_scores || {})
                      .sort(([, a], [, b]) => b - a)
                      .findIndex(([guildId]) => guildId === myGuild?.id) + 1;

                return (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`border-2 overflow-hidden ${
                      participating 
                        ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                        : 'bg-slate-800/50 border-slate-700'
                    }`}>
                      <CardHeader className={`bg-gradient-to-r ${isPlayerTournament ? 'from-purple-600 to-pink-600' : typeConfig.color} p-6`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                              {isPlayerTournament ? (
                                <Gamepad2 className="w-8 h-8 text-white" />
                              ) : (
                                <Icon className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-2xl text-white mb-1">{tournament.name}</CardTitle>
                              <p className="text-white/80 text-sm">
                                {isPlayerTournament ? `🎮 ${tournament.game_types?.length || 0} Mini-Games` : typeConfig.description}
                              </p>
                              {tournament.description && (
                                <p className="text-white/60 text-xs mt-1">{tournament.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <Badge className="bg-white/20 text-white border-white/30">
                                  {isPlayerTournament ? '🎮 Mini-Games' : typeConfig.name}
                                </Badge>
                                {tournament.is_public === false && (
                                  <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/50">
                                    🔒 Private
                                  </Badge>
                                )}
                                {participating && (
                                  <Badge className="bg-green-500/30 text-green-200 border-green-400/50 animate-pulse">
                                    ✓ Participating
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <DollarSign className="w-5 h-5 text-yellow-400 mb-2" />
                            <p className="text-slate-400 text-xs">Prize Pool</p>
                            <p className="text-white text-xl font-bold">{tournament.prize_pool?.toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <Users className="w-5 h-5 text-blue-400 mb-2" />
                            <p className="text-slate-400 text-xs">{isPlayerTournament ? 'Players' : 'Guilds'}</p>
                            <p className="text-white text-xl font-bold">{tournament.participating_guilds?.length || 0}/{tournament.max_participants}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <Clock className="w-5 h-5 text-purple-400 mb-2" />
                            <p className="text-slate-400 text-xs">Time Left</p>
                            <p className="text-white text-lg font-bold">{getTimeRemaining(tournament.ends_at)}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <Sparkles className="w-5 h-5 text-green-400 mb-2" />
                            <p className="text-slate-400 text-xs">Rewards</p>
                            <p className="text-white text-sm font-bold">
                              {tournament.include_rare_items && '🎁'}
                              {tournament.include_stock_shares && '📈'}
                              XP+Coins
                            </p>
                          </div>
                        </div>

                        {/* Leaderboard */}
                        {participating && (
                          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-4">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-yellow-400" />
                              Your Performance
                            </h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-slate-800/50 rounded-lg p-3">
                                <p className="text-slate-400 text-xs">Current Rank</p>
                                <p className="text-white text-2xl font-bold">#{myRank || '—'}</p>
                              </div>
                              <div className="bg-slate-800/50 rounded-lg p-3">
                                <p className="text-slate-400 text-xs">Points</p>
                                <p className="text-green-400 text-2xl font-bold">{Math.round(myScore)}</p>
                              </div>
                            </div>
                            {isPlayerTournament && (
                              <Button
                                onClick={() => setActiveTournamentSession(tournament)}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-black animate-pulse"
                              >
                                <Swords className="w-5 h-5 mr-2" />
                                Battle Opponents!
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Top 3 Leaderboard */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl p-4 border border-slate-700">
                          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            {isPlayerTournament ? 'Top Players' : 'Top Guilds'}
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(isPlayerTournament ? (tournament.player_scores || {}) : (tournament.guild_scores || {}))
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 3)
                              .map(([id, score], index) => {
                                const rankIcons = ['🥇', '🥈', '🥉'];
                                const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];
                                
                                return (
                                  <div key={id} className={`flex items-center justify-between p-3 rounded-lg ${
                                    id === (isPlayerTournament ? player?.id : myGuild?.id) ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-slate-800/50'
                                  }`}>
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl">{rankIcons[index]}</span>
                                      <div>
                                        <p className={`font-bold ${rankColors[index]}`}>Rank {index + 1}</p>
                                        <p className="text-slate-400 text-xs">{isPlayerTournament ? 'Player' : 'Guild'} #{id.slice(0, 8)}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                     <p className="text-white font-bold text-lg">{Math.round(score)}</p>
                                     <p className="text-green-400 text-xs">points</p>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Play button for mini-game tournaments */}
                        {isPlayerTournament && !participating && tournament.is_public && (
                          <Button
                            onClick={() => {
                              joinTournamentMutation.mutate(tournament);
                              setTimeout(() => setActiveTournamentSession(tournament), 500);
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-black text-lg mt-4"
                          >
                            <Gamepad2 className="w-5 h-5 mr-2" />
                            Join & Play Tournament!
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Upcoming Tournaments */}
        <TabsContent value="upcoming">
          <div className="grid gap-4">
            {upcomingTournaments.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">No upcoming tournaments</p>
                </CardContent>
              </Card>
            ) : (
              upcomingTournaments.map((tournament) => {
                const typeConfig = TOURNAMENT_TYPES[tournament.tournament_type] || TOURNAMENT_TYPES.highest_gain_percent;
                const Icon = typeConfig.icon;
                const isPlayerTournament = tournament.tournament_type === 'custom_mini_games';
                const participating = isPlayerTournament
                  ? tournament.participating_guilds?.includes(player?.id)
                  : isParticipating(tournament);
                const canAfford = (guildTreasury?.total_balance || 0) >= (tournament.entry_fee_per_guild || 0);
                const isFull = (tournament.participating_guilds?.length || 0) >= tournament.max_participants;
                const canJoin = isPlayerTournament 
                  ? !participating && !isFull && tournament.is_public
                  : isLeader && !participating && canAfford && !isFull && myGuild;
                const isCreator = tournament.created_by_player === player?.id;
                const timeUntilStart = getTimeUntilStart(tournament.starts_at);

                return (
                  <Card key={tournament.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
                    <CardHeader className={`bg-gradient-to-r ${isPlayerTournament ? 'from-purple-600 to-pink-600' : typeConfig.color} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isPlayerTournament ? (
                            <Gamepad2 className="w-6 h-6 text-white" />
                          ) : (
                            <Icon className="w-6 h-6 text-white" />
                          )}
                          <div>
                            <CardTitle className="text-white text-lg">{tournament.name}</CardTitle>
                            <p className="text-white/80 text-xs">
                              {isPlayerTournament ? `🎮 ${tournament.game_types?.length || 0} Mini-Games` : typeConfig.description}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-white/20 text-white">
                          {getTimeUntilStart(tournament.starts_at)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-slate-400 text-xs">Prize</p>
                          <p className="text-yellow-400 font-bold">{tournament.prize_pool?.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-slate-400 text-xs">{isPlayerTournament ? 'Free' : 'Entry'}</p>
                          <p className="text-white font-bold">
                            {isPlayerTournament ? '✓' : tournament.entry_fee_per_guild?.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-slate-400 text-xs">{isPlayerTournament ? 'Players' : 'Guilds'}</p>
                          <p className="text-blue-400 font-bold">{tournament.participating_guilds?.length || 0}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-slate-400 text-xs">Duration</p>
                          <p className="text-purple-400 font-bold">
                            {Math.ceil((new Date(tournament.ends_at) - new Date(tournament.starts_at)) / (1000 * 60 * 60 * 24))}d
                          </p>
                        </div>
                      </div>

                      {canJoin && (
                        <Button
                          onClick={() => {
                            joinTournamentMutation.mutate(tournament);
                            if (isPlayerTournament) {
                              setTimeout(() => setActiveTournamentSession(tournament), 500);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg font-black"
                        >
                          {isPlayerTournament ? (
                            <>
                              <Gamepad2 className="w-4 h-4 mr-2" />
                              Join & Play Now!
                            </>
                          ) : (
                            <>
                              <Trophy className="w-4 h-4 mr-2" />
                              Join Tournament ({tournament.entry_fee_per_guild?.toLocaleString()} coins)
                            </>
                          )}
                        </Button>
                      )}

                      {participating && !isPlayerTournament && (
                        <Badge className="bg-green-500/20 text-green-400 w-full justify-center py-2">
                          ✓ Your guild is registered
                        </Badge>
                      )}

                      {!canJoin && !participating && isFull && (
                        <Badge className="bg-red-500/20 text-red-400 w-full justify-center py-2">
                          Tournament Full
                        </Badge>
                      )}

                      {!canJoin && !participating && !canAfford && myGuild && !isPlayerTournament && (
                        <Badge className="bg-orange-500/20 text-orange-400 w-full justify-center py-2">
                          Insufficient Treasury Funds
                        </Badge>
                      )}

                      {isCreator && timeUntilStart && (
                        <Button
                          onClick={() => startNowMutation.mutate(tournament.id)}
                          className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-black"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Tournament Now!
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Completed Tournaments */}
        <TabsContent value="completed">
          <div className="grid gap-4">
            {completedTournaments.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">No completed tournaments yet</p>
                </CardContent>
              </Card>
            ) : (
              completedTournaments.map((tournament) => {
                const typeConfig = TOURNAMENT_TYPES[tournament.tournament_type] || TOURNAMENT_TYPES.highest_gain_percent;
                const Icon = typeConfig.icon;
                const topPerformers = tournament.top_performers || [];

                return (
                  <Card key={tournament.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="bg-slate-900/50 border-b border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-slate-400" />
                          <div>
                            <CardTitle className="text-white">{tournament.name}</CardTitle>
                            <p className="text-slate-400 text-sm">{typeConfig.name}</p>
                          </div>
                        </div>
                        <Badge className="bg-slate-700 text-slate-300">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="text-center mb-4">
                          <p className="text-slate-400 text-sm mb-2">Total Prize Pool</p>
                          <p className="text-yellow-400 text-3xl font-black">{tournament.prize_pool?.toLocaleString()}</p>
                        </div>

                        {/* Winners Podium */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl p-4 border border-yellow-500/30">
                          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            Final Rankings
                          </h4>
                          <div className="space-y-2">
                            {topPerformers.slice(0, 3).map((performer, index) => {
                              const prizes = ['🥇', '🥈', '🥉'];
                              const prizeAmounts = [
                                tournament.prize_pool * 0.5,
                                tournament.prize_pool * 0.3,
                                tournament.prize_pool * 0.2
                              ];
                              
                              return (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{prizes[index]}</span>
                                    <div>
                                      <p className="text-white font-bold">Guild #{performer.guild_id?.slice(0, 8)}</p>
                                      <p className="text-slate-400 text-xs">Score: {performer.score?.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-yellow-400 font-bold">{prizeAmounts[index]?.toLocaleString()}</p>
                                    <p className="text-slate-400 text-xs">prize</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
    </div>
  );
}