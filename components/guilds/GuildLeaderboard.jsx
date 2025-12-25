import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Trophy, TrendingUp, Zap, Users, Crown } from 'lucide-react';

export default function GuildLeaderboard({ guilds = [], guildMembers = [], allPlayers = [] }) {
  const [view, setView] = useState('value');

  // Guild leaderboards
  const guildsByValue = [...guilds].sort((a, b) => 
    (b.total_portfolio_value || 0) - (a.total_portfolio_value || 0)
  );

  const guildsByMembers = [...guilds].sort((a, b) => 
    (b.member_count || 0) - (a.member_count || 0)
  );

  const guildsByTrophies = [...guilds].sort((a, b) => 
    (b.trophies || 0) - (a.trophies || 0)
  );

  const guildsByLevel = [...guilds].sort((a, b) => 
    (b.level || 1) - (a.level || 1)
  );

  // Top contributors per guild
  const topContributors = guildMembers
    .sort((a, b) => (b.contribution_points || 0) - (a.contribution_points || 0))
    .slice(0, 10);

  const renderGuildRank = (guild, index) => {
    return (
      <div 
        key={guild.id}
        className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
      >
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
          ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
            index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
            'bg-slate-700'}
        `}>
          {index + 1}
        </div>
        <Shield className="w-6 h-6 text-cyan-400" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-bold">{guild.name}</h4>
            {guild.level > 1 && (
              <Badge className="bg-purple-500/20 text-purple-400">
                Lv {guild.level}
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm">{guild.member_count} members</p>
        </div>
        {view === 'value' && (
          <div className="text-right">
            <p className="text-white font-bold">{guild.total_portfolio_value?.toLocaleString()}</p>
            <p className="text-slate-400 text-xs">Total Value</p>
          </div>
        )}
        {view === 'members' && (
          <div className="text-right">
            <p className="text-white font-bold">{guild.member_count}</p>
            <p className="text-slate-400 text-xs">Members</p>
          </div>
        )}
        {view === 'trophies' && (
          <div className="text-right">
            <p className="text-white font-bold">{guild.trophies || 0}</p>
            <p className="text-slate-400 text-xs">Trophies</p>
          </div>
        )}
        {view === 'level' && (
          <div className="text-right">
            <p className="text-white font-bold">{guild.level || 1}</p>
            <p className="text-slate-400 text-xs">Guild Level</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Guild Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={setView} className="space-y-4">
          <TabsList className="bg-slate-700/50 border border-slate-600 grid grid-cols-5">
            <TabsTrigger value="value" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Value
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Members
            </TabsTrigger>
            <TabsTrigger value="trophies" className="text-xs">
              <Trophy className="w-3 h-3 mr-1" />
              Trophies
            </TabsTrigger>
            <TabsTrigger value="level" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Level
            </TabsTrigger>
            <TabsTrigger value="contributors" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Top MVPs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="value" className="space-y-3">
            {guildsByValue.map((guild, idx) => renderGuildRank(guild, idx))}
          </TabsContent>

          <TabsContent value="members" className="space-y-3">
            {guildsByMembers.map((guild, idx) => renderGuildRank(guild, idx))}
          </TabsContent>

          <TabsContent value="trophies" className="space-y-3">
            {guildsByTrophies.map((guild, idx) => renderGuildRank(guild, idx))}
          </TabsContent>

          <TabsContent value="level" className="space-y-3">
            {guildsByLevel.map((guild, idx) => renderGuildRank(guild, idx))}
          </TabsContent>

          <TabsContent value="contributors" className="space-y-3">
            <p className="text-slate-400 text-sm mb-4">Top contributors across all guilds</p>
            {topContributors.map((member, idx) => {
              const playerData = allPlayers.find(p => p.id === member.player_id);
              const guild = guilds.find(g => g.id === member.guild_id);

              return (
                <div 
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                    ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-slate-700'}
                  `}>
                    {idx + 1}
                  </div>
                  {member.role === 'leader' && <Crown className="w-5 h-5 text-yellow-400" />}
                  <div className="flex-1">
                    <p className="text-white font-bold">{playerData?.username || 'Unknown'}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className="bg-cyan-500/20 text-cyan-400">
                        {guild?.name || 'Unknown Guild'}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">{member.contribution_points || 0}</p>
                    <p className="text-slate-400 text-xs">Contribution Pts</p>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}