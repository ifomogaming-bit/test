import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Swords, Clock, Zap, Target, Sparkles, Flame } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import WarCountdownTimer from './WarCountdownTimer';
import { AlertCircle } from 'lucide-react';

export default function OpposingGuildMembers({ war, myGuild, opponentGuild, player }) {
  const [selectedOpponent, setSelectedOpponent] = React.useState(null);
  const [selectedChallengeType, setSelectedChallengeType] = React.useState(null);
  const queryClient = useQueryClient();

  const { data: opponentMembers = [] } = useQuery({
    queryKey: ['opponentMembers', opponentGuild?.id],
    queryFn: async () => {
      if (!opponentGuild?.id) return [];
      return base44.entities.GuildMember.filter({ guild_id: opponentGuild.id });
    },
    enabled: !!opponentGuild?.id,
    refetchInterval: 30000 // Reduced to prevent rate limits
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => base44.entities.Player.list('-level', 200),
  });

  const { data: playerStatuses = [] } = useQuery({
    queryKey: ['playerStatuses'],
    queryFn: async () => base44.entities.PlayerStatus.list('-last_active', 200),
    refetchInterval: 20000 // Refresh every 20s to reduce rate limits
  });

  // Update player's online status
  useEffect(() => {
    const updateStatus = async () => {
      if (!player?.id) return;
      const existing = playerStatuses.find(s => s.player_id === player.id);
      
      if (existing) {
        await base44.entities.PlayerStatus.update(existing.id, {
          is_online: true,
          last_active: new Date().toISOString()
        });
      } else {
        await base44.entities.PlayerStatus.create({
          player_id: player.id,
          is_online: true,
          last_active: new Date().toISOString()
        });
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [player?.id]);

  const { data: activeWars = [] } = useQuery({
    queryKey: ['activeWars'],
    queryFn: async () => base44.entities.GuildWar.filter({ status: 'active' }),
    enabled: !!myGuild?.id
  });

  const myActiveWar = activeWars.find(w => 
    w.challenger_guild_id === myGuild?.id || w.opponent_guild_id === myGuild?.id
  );

  const [showWarLimitDialog, setShowWarLimitDialog] = React.useState(false);
  const [showChallengeModal, setShowChallengeModal] = React.useState(false);

  const { data: warChallenges = [] } = useQuery({
    queryKey: ['warChallenges', war?.id],
    queryFn: async () => {
      if (!war?.id) return [];
      return base44.entities.WarChallenge.filter({ war_id: war.id });
    },
    enabled: !!war?.id,
    refetchInterval: 15000 // Reduced to prevent rate limits
  });

  const challengeMutation = useMutation({
    mutationFn: async ({ opponentId, challengeType }) => {
      // Check if already in an active war
      if (myActiveWar && myActiveWar.id !== war.id) {
        setShowWarLimitDialog(true);
        throw new Error('Already in active war');
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      const opponent = allPlayers.find(p => p.id === opponentId);

      await base44.entities.WarChallenge.create({
        war_id: war.id,
        challenger_id: player.id,
        challenger_name: player.username,
        opponent_id: opponentId,
        opponent_name: opponent?.username || 'Unknown',
        challenge_type: challengeType,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      });

      // Award points for initiating
      const isChallenger = war.challenger_guild_id === myGuild.id;
      const scoreField = isChallenger ? 'challenger_score' : 'opponent_score';

      await base44.entities.GuildWar.update(war.id, {
        [scoreField]: (war[scoreField] || 0) + 5
      });

      await base44.entities.GuildWarContribution.create({
        war_id: war.id,
        player_id: player.id,
        player_name: player.username,
        guild_id: myGuild.id,
        points_earned: 5,
        contribution_type: 'pvp_victory',
        opponent_player_id: opponentId,
        opponent_player_name: opponent?.username,
        details: { challenge_type: challengeType }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warChallenges']);
      queryClient.invalidateQueries(['incomingChallenges']);
      queryClient.invalidateQueries(['guildWars']);
      setSelectedOpponent(null);
      setSelectedChallengeType(null);
      setShowChallengeModal(false);
    },
    onError: (error) => {
      if (error.message !== 'Already in active war') {
        console.error('Challenge failed:', error);
      }
    }
  });

  const challengeTypes = [
    { id: 'trend_tapper', name: '📈 Trend Tapper', desc: 'Predict 10 market trends - Up or Down!' },
    { id: 'market_race', name: '🏁 Market Race', desc: 'Pick the best stocks fastest!' },
    { id: 'portfolio_flip', name: '💼 Portfolio Flip', desc: 'Build the strongest portfolio!' }
  ];

  const getPlayerStatus = (playerId) => {
    const status = playerStatuses.find(s => s.player_id === playerId);
    if (!status) return { online: false, lastSeen: 'Never' };
    
    const lastActive = new Date(status.last_active);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastActive) / 60000);
    
    const isOnline = status.is_online && diffMinutes < 5;
    const lastSeen = isOnline ? 'Online' : diffMinutes < 60 ? `${diffMinutes}m ago` : `${Math.floor(diffMinutes / 60)}h ago`;
    
    return { online: isOnline, lastSeen };
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-red-900/50 via-orange-900/40 to-red-900/50 border-2 border-red-500/70 shadow-2xl shadow-red-500/40 overflow-hidden relative">
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-lg opacity-20 blur-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-4 mb-2">
            <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-orange-300 flex items-center gap-2 text-xl font-black">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-7 h-7 text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
              </motion.div>
              {opponentGuild?.name || 'Enemy'} Forces
            </CardTitle>
            {war?.expires_at && (
              <div className="bg-slate-900/80 rounded-lg px-3 py-2 border border-red-500/30">
                <WarCountdownTimer expiresAt={war.expires_at} />
              </div>
            )}
          </div>
          <p className="text-red-200 text-sm font-bold">☠️ Challenge enemy players to earn war points!</p>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {opponentMembers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No enemy members found</p>
            ) : (
              opponentMembers.map((member, idx) => {
                const memberPlayer = allPlayers.find(p => p.id === member.player_id);
                if (!memberPlayer) return null;
                
                const status = getPlayerStatus(member.player_id);
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, x: 3 }}
                    className="p-3 bg-gradient-to-r from-slate-800/70 to-slate-700/70 rounded-lg border-2 border-red-500/30 hover:border-red-500/70 transition-all shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <motion.div
                            animate={status.online ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Shield className="w-10 h-10 text-red-400" />
                          </motion.div>
                          <motion.div 
                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${status.online ? 'bg-green-500' : 'bg-gray-500'}`}
                            animate={status.online ? { opacity: [1, 0.5, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <div>
                          <p className="text-white font-black text-base">{memberPlayer.username}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                              Level {memberPlayer.level}
                            </Badge>
                            <span className={`font-bold ${status.online ? 'text-green-400' : 'text-gray-400'}`}>
                              {status.lastSeen}
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          onClick={() => {
                            setSelectedOpponent(memberPlayer);
                            setShowChallengeModal(true);
                          }}
                          disabled={!status.online}
                          size="sm"
                          className={`${status.online 
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/40' 
                            : 'bg-gray-600'} font-bold`}
                        >
                          <Swords className="w-4 h-4 mr-1" />
                          {status.online ? 'Challenge' : 'Offline'}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showChallengeModal} onOpenChange={() => {
        setShowChallengeModal(false);
        setSelectedOpponent(null);
        setSelectedChallengeType(null);
      }}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-2 border-purple-500/50 max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 text-xl sm:text-2xl font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              Choose Your Challenge
            </DialogTitle>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 break-words">Select a mini-game to battle {selectedOpponent?.username}!</p>
          </DialogHeader>
          <div className="space-y-3">
            {challengeTypes.map((type, idx) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => setSelectedChallengeType(type.id)}
                className={`w-full p-3 sm:p-5 rounded-xl text-left transition-all shadow-lg ${
                  selectedChallengeType === type.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 shadow-purple-500/50'
                    : 'bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-slate-600 hover:border-purple-500/50'
                }`}
              >
                <h4 className="text-white font-black text-base sm:text-lg mb-1 flex items-center gap-2 flex-wrap">
                  <span className="break-words">{type.name}</span>
                  {selectedChallengeType === type.id && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm break-words">{type.desc}</p>
              </motion.button>
            ))}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 sm:p-4 mt-4">
              <p className="text-purple-200 text-xs sm:text-sm font-bold">⚡ Challenge initiated: <span className="text-yellow-400">+5 pts</span></p>
              <p className="text-purple-200 text-xs sm:text-sm font-bold">🏆 Victory bonus: <span className="text-yellow-400">+25 pts</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={() => {
                setShowChallengeModal(false);
                setSelectedOpponent(null);
                setSelectedChallengeType(null);
              }} className="flex-1 border-slate-600">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedOpponent && selectedChallengeType) {
                    challengeMutation.mutate({ 
                      opponentId: selectedOpponent.id, 
                      challengeType: selectedChallengeType 
                    });
                  }
                }}
                disabled={!selectedChallengeType || challengeMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-xl shadow-purple-500/50 font-black text-sm sm:text-base"
              >
                <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {challengeMutation.isPending ? 'Sending...' : '⚔️ Send Challenge'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Already in War Limit Dialog */}
      <Dialog open={showWarLimitDialog} onOpenChange={setShowWarLimitDialog}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-red-950 via-orange-950 to-red-950 border-4 border-red-500/60 shadow-2xl shadow-red-500/50 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10 p-6 text-center space-y-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500/30 rounded-full blur-xl"
                />
                <Swords className="w-24 h-24 text-red-400 relative z-10 drop-shadow-[0_0_30px_rgba(248,113,113,0.9)]" />
              </div>
            </motion.div>

            <div>
              <motion.h2 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-orange-300 to-red-300 mb-3"
              >
                ⚔️ BATTLE IN PROGRESS ⚔️
              </motion.h2>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center gap-2 text-orange-300"
              >
                <Zap className="w-5 h-5" />
                <span className="font-bold text-lg">Your guild is already at war!</span>
                <Zap className="w-5 h-5" />
              </motion.div>
            </div>

            {myActiveWar && (
              <div className="bg-slate-900/60 rounded-xl p-6 border-2 border-red-500/40">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    <Shield className="w-12 h-12 mx-auto mb-2 text-cyan-400" />
                    <p className="text-white font-black text-lg">{myGuild?.name}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <Target className="w-8 h-8 text-yellow-400 mb-1" />
                    <span className="text-red-400 font-black text-2xl">VS</span>
                  </div>
                  <div className="text-center">
                    <Shield className="w-12 h-12 mx-auto mb-2 text-red-400" />
                    <p className="text-white font-black text-lg">Enemy Guild</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-cyan-600/20 rounded-lg p-3">
                    <p className="text-cyan-300 text-sm">Your Score</p>
                    <p className="text-white text-3xl font-black">{myActiveWar.challenger_guild_id === myGuild?.id ? myActiveWar.challenger_score : myActiveWar.opponent_score}</p>
                  </div>
                  <div className="bg-red-600/20 rounded-lg p-3">
                    <p className="text-red-300 text-sm">Enemy Score</p>
                    <p className="text-white text-3xl font-black">{myActiveWar.challenger_guild_id === myGuild?.id ? myActiveWar.opponent_score : myActiveWar.challenger_score}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-lg p-4">
              <p className="text-orange-200 font-bold text-lg mb-2">
                🔥 Focus on your current battle!
              </p>
              <p className="text-slate-300">
                Complete this war before challenging another guild. Victory awaits!
              </p>
            </div>

            <Button
              onClick={() => setShowWarLimitDialog(false)}
              className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 text-white font-black text-lg py-6 shadow-xl shadow-red-500/50 border-2 border-red-400/50"
            >
              <Swords className="w-5 h-5 mr-2" />
              RETURN TO BATTLE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}