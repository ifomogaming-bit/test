import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  DollarSign,
  Activity,
  Target,
  Award,
  Zap,
  Shield,
  Crown
} from 'lucide-react';

export default function GuildAnalytics({ myGuild, guildMembers, allPlayers }) {
  const { data: contributions = [] } = useQuery({
    queryKey: ['contributions', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildContribution.filter({ guild_id: myGuild.id }, '-created_date', 200);
    },
    enabled: !!myGuild?.id
  });

  const { data: wars = [] } = useQuery({
    queryKey: ['guildWarHistory', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      const challengerWars = await base44.entities.GuildWar.filter({ challenger_guild_id: myGuild.id }, '-created_date', 50);
      const opponentWars = await base44.entities.GuildWar.filter({ opponent_guild_id: myGuild.id }, '-created_date', 50);
      return [...challengerWars, ...opponentWars];
    },
    enabled: !!myGuild?.id
  });

  const { data: warContributions = [] } = useQuery({
    queryKey: ['warContributions', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildWarContribution.filter({ guild_id: myGuild.id }, '-created_date', 500);
    },
    enabled: !!myGuild?.id
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['investmentProposalsAll', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildInvestmentProposal.filter({ guild_id: myGuild.id }, '-created_date', 100);
    },
    enabled: !!myGuild?.id
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditLogsAnalytics', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildAuditLog.filter({ guild_id: myGuild.id }, '-created_date', 500);
    },
    enabled: !!myGuild?.id
  });

  // Calculate analytics
  const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const completedWars = wars.filter(w => w.status === 'completed');
  const wins = completedWars.filter(w => {
    const isChallenger = w.challenger_guild_id === myGuild?.id;
    return isChallenger ? w.challenger_score > w.opponent_score : w.opponent_score > w.challenger_score;
  }).length;
  const losses = completedWars.length - wins;
  const winRate = completedWars.length > 0 ? (wins / completedWars.length * 100).toFixed(1) : 0;

  const avgWarScore = completedWars.length > 0
    ? completedWars.reduce((sum, w) => {
        const isChallenger = w.challenger_guild_id === myGuild?.id;
        return sum + (isChallenger ? w.challenger_score : w.opponent_score);
      }, 0) / completedWars.length
    : 0;

  // Member activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActivity = auditLogs.filter(log => new Date(log.created_date) > sevenDaysAgo);
  const activeMembers = new Set(recentActivity.map(log => log.actor_id)).size;
  const activityRate = guildMembers.length > 0 ? (activeMembers / guildMembers.length * 100).toFixed(1) : 0;

  // Top contributors
  const contributorMap = {};
  warContributions.forEach(wc => {
    if (!contributorMap[wc.player_id]) {
      contributorMap[wc.player_id] = { id: wc.player_id, name: wc.player_name, points: 0, contributions: 0 };
    }
    contributorMap[wc.player_id].points += wc.points_earned || 0;
    contributorMap[wc.player_id].contributions += 1;
  });
  const topContributors = Object.values(contributorMap).sort((a, b) => b.points - a.points).slice(0, 5);

  // Treasury growth
  const treasuryDeposits = contributions.filter(c => c.contribution_type === 'deposit');
  const treasuryGrowth = treasuryDeposits.length > 0
    ? treasuryDeposits.reduce((sum, c) => sum + (c.amount || 0), 0)
    : 0;

  // Investment success rate
  const approvedProposals = proposals.filter(p => p.status === 'approved').length;
  const rejectedProposals = proposals.filter(p => p.status === 'rejected').length;
  const totalVoted = approvedProposals + rejectedProposals;
  const investmentSuccessRate = totalVoted > 0 ? (approvedProposals / totalVoted * 100).toFixed(1) : 0;

  // Guild Health Score (0-100)
  const activityScore = Math.min(parseFloat(activityRate) * 1.5, 30); // Max 30 points
  const treasuryScore = Math.min((myGuild?.treasury_balance || 0) / 10000 * 20, 20); // Max 20 points
  const warPerformanceScore = Math.min(parseFloat(winRate) * 0.3, 30); // Max 30 points
  const memberCountScore = Math.min((guildMembers.length / (myGuild?.max_members || 30)) * 20, 20); // Max 20 points
  const healthScore = Math.round(activityScore + treasuryScore + warPerformanceScore + memberCountScore);

  const getHealthColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="space-y-6">
      {/* Guild Health Score */}
      <Card className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-purple-900/40 border-2 border-purple-500/60 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 flex items-center gap-3 text-2xl font-black">
            <Activity className="w-8 h-8 text-purple-400" />
            Guild Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8 mb-6">
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#healthGradient)"
                  strokeWidth="12"
                  strokeDasharray={`${healthScore * 4.4} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="text-purple-500" stopColor="currentColor" />
                    <stop offset="100%" className="text-pink-500" stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-black text-white">{healthScore}</p>
                <p className="text-sm text-slate-300">{getHealthLabel(healthScore)}</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Activity Rate</p>
                <p className="text-white text-xl font-bold">{activityRate}%</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${activityRate}%` }} />
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Win Rate</p>
                <p className="text-white text-xl font-bold">{winRate}%</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${winRate}%` }} />
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Capacity</p>
                <p className="text-white text-xl font-bold">
                  {guildMembers.length}/{myGuild?.max_members || 30}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${memberCountScore * 5}%` }} />
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Treasury Health</p>
                <p className="text-white text-xl font-bold">{((myGuild?.treasury_balance || 0) / 1000).toFixed(1)}K</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(treasuryScore * 5, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="performance">War Performance</TabsTrigger>
          <TabsTrigger value="members">Member Activity</TabsTrigger>
          <TabsTrigger value="treasury">Treasury & Investments</TabsTrigger>
        </TabsList>

        {/* War Performance */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  War Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-slate-700/30 rounded-lg p-4">
                    <p className="text-green-400 text-3xl font-black">{wins}</p>
                    <p className="text-slate-400 text-sm">Wins</p>
                  </div>
                  <div className="text-center bg-slate-700/30 rounded-lg p-4">
                    <p className="text-red-400 text-3xl font-black">{losses}</p>
                    <p className="text-slate-400 text-sm">Losses</p>
                  </div>
                  <div className="text-center bg-slate-700/30 rounded-lg p-4">
                    <p className="text-purple-400 text-3xl font-black">{completedWars.length}</p>
                    <p className="text-slate-400 text-sm">Total Wars</p>
                  </div>
                  <div className="text-center bg-slate-700/30 rounded-lg p-4">
                    <p className="text-blue-400 text-3xl font-black">{avgWarScore.toFixed(0)}</p>
                    <p className="text-slate-400 text-sm">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Top War Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topContributors.length === 0 ? (
                    <p className="text-slate-400 text-center py-4 text-sm">No war contributions yet</p>
                  ) : (
                    topContributors.map((contributor, idx) => (
                      <div key={contributor.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                          </span>
                          <div>
                            <p className="text-white font-medium">{contributor.name}</p>
                            <p className="text-slate-400 text-xs">{contributor.contributions} contributions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold">{contributor.points}</p>
                          <p className="text-slate-400 text-xs">points</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Member Activity */}
        <TabsContent value="members">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-300">Active Members (7 days)</p>
                      <Badge className="bg-green-500/20 text-green-400">
                        {activeMembers}/{guildMembers.length}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                        style={{ width: `${activityRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Recent Activities</p>
                    <p className="text-white text-2xl font-bold">{recentActivity.length}</p>
                    <p className="text-slate-400 text-xs mt-1">actions in last 7 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  Top Contributors (All Time)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guildMembers
                    .sort((a, b) => (b.contribution_points || 0) - (a.contribution_points || 0))
                    .slice(0, 5)
                    .map((member, idx) => {
                      const player = allPlayers.find(p => p.id === member.player_id);
                      return (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {idx === 0 ? '👑' : idx === 1 ? '⭐' : idx === 2 ? '🌟' : '💫'}
                            </span>
                            <p className="text-white font-medium">{player?.username}</p>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            {member.contribution_points || 0} pts
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Treasury & Investments */}
        <TabsContent value="treasury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Treasury Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-500/30">
                    <p className="text-green-300 text-sm mb-2">Total Contributions</p>
                    <p className="text-white text-4xl font-black">{totalContributions.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-2">from {contributions.length} deposits</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p className="text-slate-400 text-xs">Current Balance</p>
                      <p className="text-white text-xl font-bold">{(myGuild?.treasury_balance || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p className="text-slate-400 text-xs">Avg Deposit</p>
                      <p className="text-white text-xl font-bold">
                        {contributions.length > 0 ? Math.round(totalContributions / contributions.length).toLocaleString() : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Investment Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-green-400 text-3xl font-black">{approvedProposals}</p>
                      <p className="text-slate-400 text-xs">Approved</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-red-400 text-3xl font-black">{rejectedProposals}</p>
                      <p className="text-slate-400 text-xs">Rejected</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-yellow-400 text-3xl font-black">
                        {proposals.filter(p => p.status === 'pending').length}
                      </p>
                      <p className="text-slate-400 text-xs">Pending</p>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-300">Success Rate</p>
                      <Badge className={`${
                        parseFloat(investmentSuccessRate) >= 60 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {investmentSuccessRate}%
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                        style={{ width: `${investmentSuccessRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}