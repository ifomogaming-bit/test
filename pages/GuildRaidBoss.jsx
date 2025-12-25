import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Skull, Trophy, Swords, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RaidBossCard from '@/components/guilds/RaidBossCard';
import RaidLeaderboard from '@/components/guilds/RaidLeaderboard';
import RaidRewardScreen from '@/components/guilds/RaidRewardScreen';
import RaidBossAttackModal from '@/components/guilds/RaidBossAttackModal';

export default function GuildRaidBoss() {
  const [user, setUser] = useState(null);
  const [showAttackModal, setShowAttackModal] = useState(null);
  const [showRewards, setShowRewards] = useState(null);
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

  const { data: raidBosses = [] } = useQuery({
    queryKey: ['raidBosses'],
    queryFn: async () => {
      return base44.entities.RaidBoss.list('-created_date', 20);
    },
    refetchInterval: 3000
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ['raidContributions'],
    queryFn: async () => {
      return base44.entities.RaidContribution.list('-damage_dealt', 500);
    },
    refetchInterval: 2000
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      return base44.entities.Player.list('-level', 200);
    }
  });

  // Auto-check for boss phase changes
  useEffect(() => {
    raidBosses.forEach(async (boss) => {
      if (boss.status !== 'active') return;

      const healthPercent = (boss.current_health / boss.max_health) * 100;
      
      let newPhase = boss.phase;
      if (healthPercent <= 30 && boss.phase < 3) newPhase = 3;
      else if (healthPercent <= 60 && boss.phase < 2) newPhase = 2;

      if (newPhase !== boss.phase) {
        await base44.entities.RaidBoss.update(boss.id, { phase: newPhase });
        queryClient.invalidateQueries(['raidBosses']);
      }

      // Check if defeated
      if (boss.current_health <= 0 && boss.status === 'active') {
        await base44.entities.RaidBoss.update(boss.id, { 
          status: 'defeated',
          current_health: 0
        });
        queryClient.invalidateQueries(['raidBosses']);
        
        // Show rewards for participating guilds
        const bossContribs = contributions.filter(c => c.raid_boss_id === boss.id);
        const myContrib = bossContribs.find(c => c.player_id === player?.id);
        if (myContrib) {
          setShowRewards({ boss, myContribution: myContrib });
        }
      }

      // Check if time expired
      if (new Date(boss.ends_at) < new Date() && boss.status === 'active') {
        await base44.entities.RaidBoss.update(boss.id, { status: 'escaped' });
        queryClient.invalidateQueries(['raidBosses']);
      }
    });
  }, [raidBosses, player?.id]);

  const attackBossMutation = useMutation({
    mutationFn: async ({ boss, attackResult }) => {
      if (!player?.id || !myGuild?.id) return;

      const damage = attackResult.damage;
      const isCrit = attackResult.isCrit;

      // Update boss health
      const newHealth = Math.max(0, boss.current_health - damage);
      await base44.entities.RaidBoss.update(boss.id, {
        current_health: newHealth,
        total_damage_dealt: (boss.total_damage_dealt || 0) + damage
      });

      // Update or create contribution
      const existingContrib = contributions.find(
        c => c.raid_boss_id === boss.id && c.player_id === player.id
      );

      if (existingContrib) {
        await base44.entities.RaidContribution.update(existingContrib.id, {
          damage_dealt: existingContrib.damage_dealt + damage,
          attacks_made: existingContrib.attacks_made + 1,
          critical_hits: existingContrib.critical_hits + (isCrit ? 1 : 0)
        });
      } else {
        await base44.entities.RaidContribution.create({
          raid_boss_id: boss.id,
          guild_id: myGuild.id,
          player_id: player.id,
          player_name: player.username,
          damage_dealt: damage,
          attacks_made: 1,
          critical_hits: isCrit ? 1 : 0,
          resources_contributed: 0
        });
      }

      // Add to participating guilds if not already
      if (!boss.participating_guilds?.includes(myGuild.id)) {
        await base44.entities.RaidBoss.update(boss.id, {
          participating_guilds: [...(boss.participating_guilds || []), myGuild.id]
        });
      }

      // Award XP to player
      await base44.entities.Player.update(player.id, {
        xp: (player.xp || 0) + (isCrit ? 100 : 50)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['raidBosses']);
      queryClient.invalidateQueries(['raidContributions']);
      queryClient.invalidateQueries(['player']);
      setShowAttackModal(null);
    }
  });

  const contributeResourcesMutation = useMutation({
    mutationFn: async ({ bossId, amount }) => {
      if (!player?.id || !myGuild?.id) return;
      if ((player.soft_currency || 0) < amount) throw new Error('Insufficient coins');

      // Deduct player coins
      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - amount
      });

      // Convert coins to damage (1 coin = 2 damage)
      const damageBonus = amount * 2;

      const boss = raidBosses.find(b => b.id === bossId);
      if (boss) {
        await base44.entities.RaidBoss.update(bossId, {
          current_health: Math.max(0, boss.current_health - damageBonus),
          total_damage_dealt: (boss.total_damage_dealt || 0) + damageBonus
        });
      }

      // Update contribution
      const existingContrib = contributions.find(
        c => c.raid_boss_id === bossId && c.player_id === player.id
      );

      if (existingContrib) {
        await base44.entities.RaidContribution.update(existingContrib.id, {
          resources_contributed: existingContrib.resources_contributed + amount,
          damage_dealt: existingContrib.damage_dealt + damageBonus
        });
      } else {
        await base44.entities.RaidContribution.create({
          raid_boss_id: bossId,
          guild_id: myGuild.id,
          player_id: player.id,
          player_name: player.username,
          damage_dealt: damageBonus,
          resources_contributed: amount,
          attacks_made: 0,
          critical_hits: 0
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['raidBosses']);
      queryClient.invalidateQueries(['raidContributions']);
      queryClient.invalidateQueries(['player']);
    }
  });

  const claimRewardsMutation = useMutation({
    mutationFn: async ({ bossId, contribution }) => {
      if (!player?.id || contribution.reward_claimed) return;

      const boss = raidBosses.find(b => b.id === bossId);
      if (!boss || boss.status !== 'defeated') return;

      // Calculate individual rewards based on contribution
      const personalBonus = Math.floor(contribution.damage_dealt / 100);
      const guildRewardShare = Math.floor((boss.rewards.coins || 0) / contributions.filter(c => c.raid_boss_id === bossId && c.guild_id === myGuild.id).length);

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + personalBonus + guildRewardShare,
        premium_currency: (player.premium_currency || 0) + Math.floor((boss.rewards.gems || 0) / 10),
        xp: (player.xp || 0) + (boss.rewards.guild_xp || 0)
      });

      // Mark as claimed
      await base44.entities.RaidContribution.update(contribution.id, {
        reward_claimed: true
      });

      // Add exclusive theme to inventory if applicable
      if (boss.rewards.exclusive_theme) {
        await base44.entities.Inventory.create({
          player_id: player.id,
          item_type: 'theme',
          item_id: boss.rewards.exclusive_theme,
          item_name: boss.rewards.exclusive_theme
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['raidContributions']);
      setShowRewards(null);
    }
  });

  const activeBosses = raidBosses.filter(b => b.status === 'active');
  const upcomingBosses = raidBosses.filter(b => b.status === 'upcoming');
  const defeatedBosses = raidBosses.filter(b => b.status === 'defeated');

  if (!myGuild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <Skull className="w-20 h-20 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-white mb-2">No Guild</h2>
          <p className="text-slate-400 mb-6">Join a guild to participate in raid boss events!</p>
          <Link to={createPageUrl('Guilds')}>
            <Button>Join a Guild</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-purple-950/20 p-4 md:p-8 pb-24 md:pb-8 relative overflow-hidden">
      {/* Epic background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Guilds')}>
              <Button variant="outline" className="border-red-500/50 text-white hover:bg-red-500/20">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Skull className="w-10 h-10 text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.9)]" />
                </motion.div>
                Raid Bosses
              </h1>
              <p className="text-orange-300 font-bold">⚔️ Unite your guild to defeat legendary enemies!</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-red-600">
              <Swords className="w-4 h-4 mr-2" />
              Active ({activeBosses.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Upcoming ({upcomingBosses.length})
            </TabsTrigger>
            <TabsTrigger value="defeated" className="data-[state=active]:bg-green-600">
              <Trophy className="w-4 h-4 mr-2" />
              Defeated ({defeatedBosses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeBosses.length === 0 ? (
              <div className="text-center py-20">
                <AlertCircle className="w-20 h-20 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 text-xl">No active raid bosses</p>
                <p className="text-slate-500 text-sm mt-2">Check back soon for new challenges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {activeBosses.map(boss => (
                    <RaidBossCard
                      key={boss.id}
                      boss={boss}
                      myGuild={myGuild}
                      player={player}
                      contributions={contributions.filter(c => c.raid_boss_id === boss.id)}
                      onAttack={(boss) => setShowAttackModal(boss)}
                    />
                  ))}
                </div>
                <div>
                  {activeBosses.length > 0 && (
                    <RaidLeaderboard
                      contributions={contributions.filter(c => c.raid_boss_id === activeBosses[0].id)}
                      myGuild={myGuild}
                      allPlayers={allPlayers}
                    />
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBosses.map(boss => (
                <motion.div
                  key={boss.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 border-2 border-purple-500/40 rounded-xl p-6"
                >
                  <Skull className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-white text-xl font-bold text-center mb-2">{boss.name}</h3>
                  <p className="text-slate-400 text-sm text-center mb-4">{boss.description}</p>
                  <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                    <p className="text-purple-300 text-xs font-bold">Starts:</p>
                    <p className="text-white font-bold">{new Date(boss.starts_at).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="defeated">
            <div className="space-y-4">
              {defeatedBosses.map(boss => {
                const myContrib = contributions.find(c => c.raid_boss_id === boss.id && c.player_id === player?.id);
                
                return (
                  <motion.div
                    key={boss.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/40 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white text-2xl font-black flex items-center gap-2">
                          <Trophy className="w-6 h-6 text-yellow-400" />
                          {boss.name}
                        </h3>
                        <p className="text-green-300 text-sm">Defeated on {new Date(boss.updated_date).toLocaleDateString()}</p>
                      </div>
                      {myContrib && !myContrib.reward_claimed && (
                        <Button
                          onClick={() => claimRewardsMutation.mutate({ bossId: boss.id, contribution: myContrib })}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 font-bold"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Claim Rewards
                        </Button>
                      )}
                    </div>
                    {myContrib && (
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-2">Your Contribution:</p>
                        <p className="text-orange-400 text-xl font-bold">
                          {myContrib.damage_dealt.toLocaleString()} damage dealt
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Attack Modal */}
      {showAttackModal && (
        <RaidBossAttackModal
          boss={showAttackModal}
          player={player}
          onComplete={(attackResult) => {
            if (attackResult) {
              attackBossMutation.mutate({ boss: showAttackModal, attackResult });
            } else {
              setShowAttackModal(null);
            }
          }}
        />
      )}

      {/* Reward Screen */}
      {showRewards && (
        <RaidRewardScreen
          boss={showRewards.boss}
          myContribution={showRewards.myContribution}
          myGuild={myGuild}
          rewards={showRewards.boss.rewards}
          onClose={() => {
            claimRewardsMutation.mutate({ 
              bossId: showRewards.boss.id, 
              contribution: showRewards.myContribution 
            });
          }}
        />
      )}
    </div>
  );
}