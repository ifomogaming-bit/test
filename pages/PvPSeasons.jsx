import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Trophy, Clock, Medal, Star, Crown, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PvPSeasons() {
  const [user, setUser] = useState(null);
  const [timeUntilNextSeason, setTimeUntilNextSeason] = useState('');

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

  const { data: activeSeason } = useQuery({
    queryKey: ['activePvPSeason'],
    queryFn: async () => {
      const seasons = await base44.entities.PvPSeason.filter({ status: 'active' });
      return seasons[0] || null;
    }
  });

  const { data: completedSeasons = [] } = useQuery({
    queryKey: ['completedSeasons'],
    queryFn: async () => {
      return base44.entities.PvPSeason.filter({ status: 'completed' }, '-season_number', 10);
    }
  });

  const { data: currentParticipation } = useQuery({
    queryKey: ['seasonParticipation', player?.id, activeSeason?.id],
    queryFn: async () => {
      if (!player?.id || !activeSeason?.id) return null;
      const participations = await base44.entities.PvPSeasonParticipation.filter({
        season_id: activeSeason.id,
        player_id: player.id
      });
      return participations[0] || null;
    },
    enabled: !!player?.id && !!activeSeason?.id
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['seasonLeaderboard', activeSeason?.id],
    queryFn: async () => {
      if (!activeSeason?.id) return [];
      return base44.entities.PvPSeasonParticipation.filter(
        { season_id: activeSeason.id },
        '-current_rating',
        100
      );
    },
    enabled: !!activeSeason?.id
  });

  // Countdown to season end
  useEffect(() => {
    if (!activeSeason?.end_date) return;

    const updateCountdown = () => {
      const now = new Date();
      const endDate = new Date(activeSeason.end_date);
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeUntilNextSeason('Season Ending...');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilNextSeason(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeSeason?.end_date]);

  const TIER_COLORS = {
    diamond: 'from-cyan-400 to-blue-600',
    platinum: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    silver: 'from-gray-400 to-gray-600',
    bronze: 'from-orange-600 to-orange-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('PvP')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400" />
                PvP Seasons
              </h1>
              <p className="text-slate-400">Compete for glory in 30-day competitive seasons</p>
            </div>
          </div>
        </div>

        {/* Active Season Card */}
        {activeSeason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-slate-900/40 border-2 border-purple-500/60 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-black text-white mb-2">
                      Season {activeSeason.season_number}
                    </CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                      ACTIVE
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm mb-1">Time Remaining</p>
                    <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                      <Clock className="w-6 h-6" />
                      {timeUntilNextSeason}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Total Players</p>
                    <p className="text-white text-3xl font-bold">{leaderboard.length}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Your Rank</p>
                    <p className="text-cyan-400 text-3xl font-bold">
                      {currentParticipation?.current_rank || 'Unranked'}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Your Rating</p>
                    <p className="text-yellow-400 text-3xl font-bold">
                      {currentParticipation?.current_rating || player?.pvp_rating || 1000}
                    </p>
                  </div>
                </div>

                {/* Reward Pool */}
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-4 border border-yellow-500/30">
                  <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Season Reward Pool
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-green-400 text-2xl font-black">
                        {activeSeason.reward_pool?.coins?.toLocaleString()}
                      </p>
                      <p className="text-slate-400 text-xs">Coins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-400 text-2xl font-black">
                        {activeSeason.reward_pool?.gems}
                      </p>
                      <p className="text-slate-400 text-xs">Gems</p>
                    </div>
                    <div className="text-center">
                      <Crown className="w-8 h-8 text-yellow-400 mx-auto" />
                      <p className="text-slate-400 text-xs">Champion Badge</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Medal className="w-6 h-6 text-yellow-400" />
              Season Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.slice(0, 25).map((participant, index) => {
                const isCurrentPlayer = participant.player_id === player?.id;
                const rank = index + 1;
                
                return (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrentPlayer
                        ? 'bg-purple-600/20 border-purple-500'
                        : rank <= 3
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-slate-700/30 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                        rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
                      </div>
                      <div>
                        <p className={`font-bold ${isCurrentPlayer ? 'text-purple-300' : 'text-white'}`}>
                          Player #{participant.player_id.slice(0, 8)}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Rating: {participant.current_rating}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-green-400">{participant.wins}W</span>
                          <span className="text-red-400">{participant.losses}L</span>
                        </div>
                      </div>
                    </div>
                    {participant.reward_tier && (
                      <Badge className={`bg-gradient-to-r ${TIER_COLORS[participant.reward_tier]} text-white`}>
                        {participant.reward_tier}
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Season History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-purple-400" />
              Past Seasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSeasons.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No completed seasons yet</p>
              ) : (
                completedSeasons.map((season, index) => (
                  <motion.div
                    key={season.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold">Season {season.season_number}</h3>
                        <p className="text-slate-400 text-sm">
                          {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-slate-500/20 text-slate-400">COMPLETED</Badge>
                        <p className="text-slate-400 text-sm mt-1">{season.total_players} players</p>
                      </div>
                    </div>
                    {season.top_player_id && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-yellow-400 text-sm flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Champion: Player #{season.top_player_id.slice(0, 8)} ({season.top_rating} rating)
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            How Seasons Work
          </h3>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>• Each season lasts 30 days</li>
            <li>• Compete in PvP battles to climb the rankings</li>
            <li>• Top players earn exclusive rewards and badges</li>
            <li>• Rewards scale with season number - later seasons have bigger prizes</li>
            <li>• The game supports up to 10,000 seasons</li>
            <li>• After a season ends, there's a brief cooldown before the next season begins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}