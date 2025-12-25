import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap,
  Crown,
  Star,
  Target
} from 'lucide-react';

export default function GuildLeaderboardPanel({ guilds, allPlayers, guildMembers, eventParticipations }) {
  const [timeframe, setTimeframe] = useState('all');

  // Calculate guild rankings by different metrics
  const getGuildsByMetric = (metricFn) => {
    return [...guilds].sort((a, b) => metricFn(b) - metricFn(a));
  };

  const byTotalValue = getGuildsByMetric(g => g.total_portfolio_value || 0);
  const byMembers = getGuildsByMetric(g => g.member_count || 0);
  const byTreasury = getGuildsByMetric(g => g.treasury_balance || 0);
  const byLevel = getGuildsByMetric(g => g.level || 1);

  // Calculate member contribution leaderboard
  const topContributors = guildMembers
    .map(member => {
      const player = allPlayers.find(p => p.id === member.player_id);
      const guild = guilds.find(g => g.id === member.guild_id);
      return {
        ...member,
        playerName: player?.username || 'Unknown',
        guildName: guild?.name || 'Unknown',
        playerLevel: player?.level || 1
      };
    })
    .sort((a, b) => (b.contribution_points || 0) - (a.contribution_points || 0))
    .slice(0, 20);

  // Event participation stats
  const eventStats = guilds.map(guild => {
    const guildParticipations = eventParticipations.filter(p => p.guild_id === guild.id);
    return {
      guild,
      totalEvents: guildParticipations.length,
      totalScore: guildParticipations.reduce((sum, p) => sum + (p.score || 0), 0)
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const getRankBadge = (index) => {
    if (index === 0) return { className: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: '🥇' };
    if (index === 1) return { className: 'bg-gradient-to-r from-slate-400 to-slate-600', icon: '🥈' };
    if (index === 2) return { className: 'bg-gradient-to-r from-orange-400 to-orange-600', icon: '🥉' };
    return { className: 'bg-slate-700', icon: `#${index + 1}` };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Guild Leaderboards
          </CardTitle>
          <p className="text-slate-300 text-sm">Rankings and achievements across all guilds</p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="value" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="value">
            <DollarSign className="w-4 h-4 mr-2" />
            By Value
          </TabsTrigger>
          <TabsTrigger value="treasury">
            <TrendingUp className="w-4 h-4 mr-2" />
            By Treasury
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            By Members
          </TabsTrigger>
          <TabsTrigger value="events">
            <Target className="w-4 h-4 mr-2" />
            Event Score
          </TabsTrigger>
          <TabsTrigger value="contributors">
            <Star className="w-4 h-4 mr-2" />
            Top Contributors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="value">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Guilds by Total Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {byTotalValue.map((guild, index) => {
                  const rank = getRankBadge(index);
                  return (
                    <div key={guild.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${rank.className}`}>
                        {rank.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{guild.name}</h3>
                          {guild.level > 1 && (
                            <Badge className="bg-purple-500/20 text-purple-400">Lv {guild.level}</Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{guild.member_count} members</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-lg">{guild.total_portfolio_value?.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">Total Value</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treasury">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Guilds by Treasury Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {byTreasury.map((guild, index) => {
                  const rank = getRankBadge(index);
                  return (
                    <div key={guild.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${rank.className}`}>
                        {rank.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{guild.name}</h3>
                        <p className="text-slate-400 text-sm">{guild.member_count} members</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold text-lg">{guild.treasury_balance?.toLocaleString() || 0}</p>
                        <p className="text-slate-400 text-xs">Treasury</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Largest Guilds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {byMembers.map((guild, index) => {
                  const rank = getRankBadge(index);
                  return (
                    <div key={guild.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${rank.className}`}>
                        {rank.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{guild.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {((guild.total_portfolio_value || 0) / (guild.member_count || 1)).toLocaleString()} avg value per member
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold text-lg">{guild.member_count}</p>
                        <p className="text-slate-400 text-xs">Members</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Event Participation Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventStats.slice(0, 20).map((stat, index) => {
                  const rank = getRankBadge(index);
                  return (
                    <div key={stat.guild.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${rank.className}`}>
                        {rank.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{stat.guild.name}</h3>
                        <p className="text-slate-400 text-sm">{stat.totalEvents} events participated</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold text-lg">{stat.totalScore.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">Total Score</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Guild Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContributors.map((contributor, index) => {
                  const rank = getRankBadge(index);
                  return (
                    <div key={contributor.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${rank.className}`}>
                        {rank.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{contributor.playerName}</h3>
                          {contributor.role === 'leader' && <Crown className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {contributor.guildName} • Level {contributor.playerLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold text-lg">{contributor.contribution_points?.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">Contribution Points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}