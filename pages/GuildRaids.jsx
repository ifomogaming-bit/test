import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Swords, Shield, Trophy, Zap, Target, 
  TrendingUp, Coins, Clock, AlertTriangle, Flame, Skull
} from 'lucide-react';
import BattlegroundMap from '@/components/guilds/BattlegroundMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  simulateBattle, 
  generateLoot, 
  calculateRewards,
  getCooldownEnd,
  getShieldEnd
} from '@/components/guilds/RaidBattleSimulator';
import adMobService from '@/components/ads/AdMobService';
import RewardConfirmation from '@/components/ads/RewardConfirmation';
import RaidMiniGame from '@/components/guilds/RaidMiniGame';
import ShieldCountdown from '@/components/guilds/ShieldCountdown';

export default function GuildRaids() {
  const [user, setUser] = useState(null);
  const [selectedDefender, setSelectedDefender] = useState(null);
  const [battleView, setBattleView] = useState(null);
  const [showRewardConfirmation, setShowRewardConfirmation] = useState(false);
  const [rewardType, setRewardType] = useState('');
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [pendingRaid, setPendingRaid] = useState(null);
  const [raidResult, setRaidResult] = useState(null);
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

  const { data: myMembership } = useQuery({
    queryKey: ['myMembership', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const memberships = await base44.entities.GuildMember.filter({ player_id: player.id });
      return memberships[0] || null;
    },
    enabled: !!player?.id
  });

  const { data: myGuild } = useQuery({
    queryKey: ['myGuild', myMembership?.guild_id],
    queryFn: async () => {
      if (!myMembership?.guild_id) return null;
      const guilds = await base44.entities.Guild.filter({ id: myMembership.guild_id });
      return guilds[0] || null;
    },
    enabled: !!myMembership?.guild_id
  });

  const { data: allGuilds = [] } = useQuery({
    queryKey: ['allGuilds'],
    queryFn: () => base44.entities.Guild.list('-trophies', 50)
  });

  const { data: raids = [] } = useQuery({
    queryKey: ['raids'],
    queryFn: () => base44.entities.GuildRaid.list('-created_date', 100)
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ['allMembers'],
    queryFn: () => base44.entities.GuildMember.list('-created_date', 500)
  });

  // No daily raid tracking needed anymore - using 6-hour cooldown only

  const handleMiniGameComplete = async (won) => {
    setShowMiniGame(false);
    if (!pendingRaid) return;
    
    // Always proceed with raid, track regardless of win/loss
    initiateRaidMutation.mutate({ defenderGuild: pendingRaid, wonMiniGame: won });
    setPendingRaid(null);
  };

  const initiateRaidMutation = useMutation({
    mutationFn: async ({ defenderGuild, wonMiniGame }) => {
      // Check 6-hour cooldown
      if (myGuild.raid_cooldown_until && new Date(myGuild.raid_cooldown_until) > new Date()) {
        throw new Error('Your guild is still on cooldown!');
      }

      // Check defender shield
      if (defenderGuild.shield_until && new Date(defenderGuild.shield_until) > new Date()) {
        throw new Error('Defender guild is shielded!');
      }

      const attackerMembers = allMembers.filter(m => m.guild_id === myGuild.id);
      const defenderMembers = allMembers.filter(m => m.guild_id === defenderGuild.id);

      // Simulate battle - if mini-game lost, force defender victory
      let battleResult;
      if (wonMiniGame) {
        battleResult = simulateBattle(myGuild, defenderGuild, attackerMembers, defenderMembers);
      } else {
        battleResult = { 
          winner: 'defender', 
          attackerScore: 0, 
          defenderScore: 100, 
          battleLogs: [
            { round: 1, action: 'Mini-game challenge failed', outcome: 'failed' },
            { round: 2, action: 'Raid attempt unsuccessful', outcome: 'failed' }
          ] 
        };
      }
      
      const loot = generateLoot(defenderGuild, battleResult.winner);
      const rewards = calculateRewards(battleResult.winner);

      // Create raid record
      const raid = await base44.entities.GuildRaid.create({
        attacker_guild_id: myGuild.id,
        defender_guild_id: defenderGuild.id,
        initiator_id: player.id,
        status: 'resolved',
        battle_logs: battleResult.battleLogs,
        winner: battleResult.winner,
        attacker_score: battleResult.attackerScore,
        defender_score: battleResult.defenderScore,
        coins_looted: loot.coinsLooted,
        stocks_looted: loot.stocksLooted
      });

      // Apply loot and updates with 6-hour cooldown
      const cooldownEnd = new Date();
      cooldownEnd.setHours(cooldownEnd.getHours() + 6);
      
      if (battleResult.winner === 'attacker') {
        // Transfer loot
        await base44.entities.Guild.update(myGuild.id, {
          treasury_balance: (myGuild.treasury_balance || 0) + loot.coinsLooted,
          trophies: (myGuild.trophies || 0) + rewards.attackerTrophies,
          guild_xp: (myGuild.guild_xp || 0) + rewards.attackerXP,
          raid_cooldown_until: cooldownEnd.toISOString()
        });

        // Apply 4-hour shield to losing defender
        const shieldEnd = new Date();
        shieldEnd.setHours(shieldEnd.getHours() + 4);

        await base44.entities.Guild.update(defenderGuild.id, {
          treasury_balance: Math.max(0, (defenderGuild.treasury_balance || 0) - loot.coinsLooted),
          trophies: Math.max(0, (defenderGuild.trophies || 0) + rewards.defenderTrophies),
          guild_xp: (defenderGuild.guild_xp || 0) + rewards.defenderXP,
          shield_until: shieldEnd.toISOString()
        });
      } else if (battleResult.winner === 'defender') {
        await base44.entities.Guild.update(myGuild.id, {
          trophies: Math.max(0, (myGuild.trophies || 0) + rewards.attackerTrophies),
          raid_cooldown_until: cooldownEnd.toISOString()
        });

        await base44.entities.Guild.update(defenderGuild.id, {
          trophies: (defenderGuild.trophies || 0) + rewards.defenderTrophies,
          guild_xp: (defenderGuild.guild_xp || 0) + rewards.defenderXP
        });
      } else {
        // Draw
        await base44.entities.Guild.update(myGuild.id, {
          guild_xp: (myGuild.guild_xp || 0) + rewards.attackerXP,
          raid_cooldown_until: cooldownEnd.toISOString()
        });

        await base44.entities.Guild.update(defenderGuild.id, {
          guild_xp: (defenderGuild.guild_xp || 0) + rewards.defenderXP
        });
      }

      return { raid, battleResult, loot };
    },
    onSuccess: ({ raid, battleResult, loot }) => {
      queryClient.invalidateQueries(['raids']);
      queryClient.invalidateQueries(['myGuild']);
      queryClient.invalidateQueries(['allGuilds']);
      setRaidResult({ raid, battleResult, loot });
      setSelectedDefender(null);
    }
  });

  const raidableGuilds = allGuilds.filter(g => {
    if (!myGuild || g.id === myGuild.id) return false;
    if (g.shield_until && new Date(g.shield_until) > new Date()) return false;
    return true;
  });

  const watchAdForRaidMutation = useMutation({
    mutationFn: async () => {
      // Clear the 6-hour cooldown when ad is watched
      await base44.entities.Guild.update(myGuild.id, {
        raid_cooldown_until: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myGuild']);
      setRewardType('extra_raid');
      setShowRewardConfirmation(true);
    }
  });

  const myRaids = raids.filter(r => 
    r.attacker_guild_id === myGuild?.id || r.defender_guild_id === myGuild?.id
  );

  const isOnCooldown = myGuild?.raid_cooldown_until && new Date(myGuild.raid_cooldown_until) > new Date();
  const hasShield = myGuild?.shield_until && new Date(myGuild.shield_until) > new Date();
  
  // Calculate time remaining for cooldown
  const getCooldownTimeRemaining = () => {
    if (!isOnCooldown) return null;
    const now = new Date();
    const end = new Date(myGuild.raid_cooldown_until);
    const diff = end - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  
  const [cooldownDisplay, setCooldownDisplay] = React.useState(getCooldownTimeRemaining());
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCooldownDisplay(getCooldownTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [myGuild?.raid_cooldown_until]);

  if (!myGuild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Swords className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-white mb-2">No Guild</h1>
          <p className="text-slate-400 mb-6">You must be in a guild to raid.</p>
          <Link to={createPageUrl('Guilds')}>
            <Button>Join a Guild</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 p-4 md:p-8 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link to={createPageUrl('Guilds')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                Guild Raids
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">Battle other guilds for loot and glory</p>
            </div>
            <Link to={createPageUrl('GuildRaidBoss')}>
              <Button className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 font-bold">
                <Skull className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Raid Bosses</span>
                <span className="sm:hidden">Bosses</span>
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isOnCooldown ? (
              <Badge className="bg-red-500/20 text-red-400 font-bold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Cooldown: {cooldownDisplay}
              </Badge>
            ) : (
              <Badge className="bg-green-500/20 text-green-400 font-bold">
                ✓ Raid Available!
              </Badge>
            )}
            <Button
              onClick={async () => {
                const success = adMobService.showRewardedAd('extra_raid', async () => {
                  await watchAdForRaidMutation.mutateAsync();
                });
                if (!success) {
                  alert('Ad is loading, please try again in a moment.');
                }
              }}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold"
            >
              🎬 Watch Ad (+1 Raid)
            </Button>
          </div>
        </div>

        {raidResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <Card className={`w-full max-w-2xl border-4 shadow-2xl ${
              raidResult.battleResult.winner === 'attacker' 
                ? 'bg-gradient-to-br from-green-900/80 to-emerald-900/80 border-green-500/60' 
                : 'bg-gradient-to-br from-red-900/80 to-orange-900/80 border-red-500/60'
            }`}>
              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  {raidResult.battleResult.winner === 'attacker' ? (
                    <>
                      <Trophy className="w-24 h-24 mx-auto mb-4 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
                      <CardTitle className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300 mb-2">
                        VICTORY!
                      </CardTitle>
                      <p className="text-green-300 text-xl font-bold">🎉 Raid Successful!</p>
                    </>
                  ) : (
                    <>
                      <Skull className="w-24 h-24 mx-auto mb-4 text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.8)]" />
                      <CardTitle className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-orange-300 mb-2">
                        DEFEATED
                      </CardTitle>
                      <p className="text-red-300 text-xl font-bold">Try Again!</p>
                    </>
                  )}
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <BattlegroundMap mapType="fortress" showOverlay={false} />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-blue-600/20 rounded-lg p-4 border-2 border-blue-400/40"
                  >
                    <p className="text-blue-300 text-sm font-bold mb-1">Your Guild</p>
                    <p className="text-white text-4xl font-black">{raidResult.battleResult.attackerScore}</p>
                  </motion.div>
                  <div className="flex items-center justify-center">
                    <Swords className="w-12 h-12 text-red-400" />
                  </div>
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-red-600/20 rounded-lg p-4 border-2 border-red-400/40"
                  >
                    <p className="text-red-300 text-sm font-bold mb-1">Defender</p>
                    <p className="text-white text-4xl font-black">{raidResult.battleResult.defenderScore}</p>
                  </motion.div>
                </div>

                {raidResult.battleResult.winner === 'attacker' && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl p-6 space-y-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                      className="text-center"
                    >
                      <h3 className="text-green-300 font-black text-3xl mb-2 flex items-center justify-center gap-2">
                        <Coins className="w-8 h-8" />
                        Loot Acquired!
                      </h3>
                    </motion.div>
                    <div className="bg-green-900/30 rounded-lg p-4 space-y-3">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-between bg-green-800/30 p-3 rounded-lg"
                      >
                        <span className="text-yellow-300 font-bold text-lg">💰 Coins Looted:</span>
                        <span className="text-white text-2xl font-black">+{raidResult.loot.coinsLooted.toLocaleString()}</span>
                      </motion.div>
                      {raidResult.loot.stocksLooted.length > 0 && (
                        <div className="space-y-2">
                          {raidResult.loot.stocksLooted.map((s, i) => (
                            <motion.div
                              key={i}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.6 + (i * 0.1) }}
                              className="flex items-center justify-between bg-green-800/20 p-2 rounded"
                            >
                              <span className="text-green-300">📈 {s.ticker}</span>
                              <span className="text-white font-bold">+{s.shares} shares</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {raidResult.battleResult.winner === 'defender' && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 rounded-xl p-6 text-center space-y-4"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                      className="text-6xl mb-3"
                    >
                      ⚔️
                    </motion.div>
                    <p className="text-red-300 text-xl font-bold mb-3">The defenders held strong!</p>
                    <p className="text-orange-300 text-base">Train harder and try again.</p>
                    <div className="bg-red-900/30 rounded-lg p-3 mt-4">
                      <p className="text-red-200 text-sm">Your guild is now on 6-hour raid cooldown</p>
                      <p className="text-yellow-400 text-xs mt-2">💡 Watch an ad to raid again immediately!</p>
                    </div>
                  </motion.div>
                )}

                <Button 
                  onClick={() => setRaidResult(null)} 
                  className={`w-full text-lg font-bold py-6 ${
                    raidResult.battleResult.winner === 'attacker'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  }`}
                >
                  {raidResult.battleResult.winner === 'attacker' ? 'Continue' : 'Close'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Available Targets ({raidableGuilds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {raidableGuilds.map(guild => {
                  const guildHasShield = guild.shield_until && new Date(guild.shield_until) > new Date();
                  
                  return (
                    <div key={guild.id} className={`p-3 sm:p-4 rounded-lg border ${
                      guildHasShield 
                        ? 'bg-blue-900/20 border-blue-500/40' 
                        : 'bg-slate-700/30 border-slate-600'
                    }`}>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-white font-bold text-base sm:text-lg">{guild.name}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm mt-1">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {guild.trophies || 0}
                              </span>
                              <span className="text-yellow-400 flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                {(guild.treasury_balance || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedDefender(guild)}
                            disabled={isOnCooldown || guildHasShield}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Swords className="w-4 h-4 mr-2" />
                            {guildHasShield ? 'Shielded' : isOnCooldown ? 'On Cooldown' : 'Raid'}
                          </Button>
                        </div>
                        {guildHasShield && (
                          <ShieldCountdown shieldUntil={guild.shield_until} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Guild</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white font-bold">{myGuild.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{myGuild.trophies || 0} Trophies</span>
                  </div>
                  
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-purple-300 text-sm font-bold">Raid Status</p>
                      {isOnCooldown ? (
                        <Badge className="bg-red-600 text-white font-black">
                          <Clock className="w-3 h-3 mr-1" />
                          {cooldownDisplay}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600 text-white font-black">
                          ✓ Ready
                        </Badge>
                      )}
                    </div>
                    
                    {isOnCooldown ? (
                      <div className="space-y-2">
                        <p className="text-purple-200 text-xs">
                          ⏰ Your next raid is on cooldown (6 hours after last raid)
                        </p>
                        <Button
                          onClick={async () => {
                            const success = adMobService.showRewardedAd('extra_raid', async () => {
                              await watchAdForRaidMutation.mutateAsync();
                            });
                            if (!success) {
                              alert('Ad is loading, please try again in a moment.');
                            }
                          }}
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold"
                        >
                          🎬 Watch Ad to Raid Now!
                        </Button>
                      </div>
                    ) : (
                      <p className="text-green-400 text-xs font-bold">
                        ✓ You can raid now! Or watch an ad anytime.
                      </p>
                    )}
                  </div>

                  {hasShield && (
                    <ShieldCountdown shieldUntil={myGuild.shield_until} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Recent Raids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {myRaids.slice(0, 5).map(raid => {
                    const isAttacker = raid.attacker_guild_id === myGuild.id;
                    const won = (isAttacker && raid.winner === 'attacker') || (!isAttacker && raid.winner === 'defender');
                    return (
                      <div key={raid.id} className="p-2 bg-slate-700/30 rounded text-xs">
                        <p className={won ? 'text-green-400' : 'text-red-400'}>
                          {isAttacker ? '⚔️ Attacked' : '🛡️ Defended'} - {won ? 'Won' : 'Lost'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedDefender && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Confirm Raid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Launch raid against <span className="text-white font-bold">{selectedDefender.name}</span>?
                </p>
                <div className="bg-slate-700/30 rounded p-3 space-y-1 text-sm">
                  <p className="text-slate-400">Target has:</p>
                  <p className="text-yellow-400">💰 {(selectedDefender.treasury_balance || 0).toLocaleString()} coins</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                  <p className="text-purple-300 text-sm font-bold">🎮 You'll play a mini-game to determine success!</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                  <p className="text-yellow-300 text-xs font-bold">⚠️ Losing guilds get 4-hour defense shield</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setSelectedDefender(null)} variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      setPendingRaid(selectedDefender);
                      setSelectedDefender(null);
                      setShowMiniGame(true);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Begin Raid
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showMiniGame && (
          <RaidMiniGame onComplete={handleMiniGameComplete} />
        )}

        {/* Ad Reward Confirmation */}
        <RewardConfirmation 
          show={showRewardConfirmation}
          rewardType={rewardType}
          onClose={() => setShowRewardConfirmation(false)}
          onNavigateHome={true}
        />
      </div>
      </div>
    </div>
  );
}