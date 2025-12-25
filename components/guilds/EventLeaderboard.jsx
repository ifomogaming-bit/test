import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EventLeaderboard({ participations = [], guilds = [], allPlayers = [] }) {
  // Individual leaderboard
  const individualLeaderboard = participations
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((p, index) => {
      const player = allPlayers.find(pl => pl.id === p.player_id);
      const guild = guilds.find(g => g.id === p.guild_id);
      return {
        ...p,
        rank: index + 1,
        playerName: player?.username || 'Unknown',
        guildName: guild?.name || 'No Guild'
      };
    });

  // Guild leaderboard - aggregate scores
  const guildScores = participations.reduce((acc, p) => {
    if (!acc[p.guild_id]) {
      acc[p.guild_id] = { totalScore: 0, participants: 0 };
    }
    acc[p.guild_id].totalScore += p.score;
    acc[p.guild_id].participants += 1;
    return acc;
  }, {});

  const guildLeaderboard = Object.entries(guildScores)
    .map(([guildId, data]) => {
      const guild = guilds.find(g => g.id === guildId);
      return {
        guildId,
        guildName: guild?.name || 'Unknown',
        totalScore: data.totalScore,
        avgScore: Math.round(data.totalScore / data.participants),
        participants: data.participants
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-slate-400 to-slate-600';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-slate-700 to-slate-800';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Event Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual">
          <TabsList className="bg-slate-700/50 border border-slate-600 w-full">
            <TabsTrigger value="individual" className="flex-1">
              Individual Performance
            </TabsTrigger>
            <TabsTrigger value="guild" className="flex-1">
              Guild Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-2 mt-4">
            {individualLeaderboard.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No participants yet</p>
            ) : (
              individualLeaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${getRankColor(entry.rank)} ${entry.rank <= 3 ? 'border border-white/20' : 'bg-slate-700/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900/50 flex items-center justify-center font-bold text-white">
                      {getRankIcon(entry.rank) || entry.rank}
                    </div>
                    <div>
                      <p className="text-white font-bold">{entry.playerName}</p>
                      <p className="text-slate-300 text-xs">{entry.guildName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{entry.score.toLocaleString()}</p>
                    <p className="text-slate-300 text-xs">points</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="guild" className="space-y-2 mt-4">
            {guildLeaderboard.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No guilds participating</p>
            ) : (
              guildLeaderboard.map((entry, index) => (
                <div
                  key={entry.guildId}
                  className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${getRankColor(index + 1)} ${index < 3 ? 'border border-white/20' : 'bg-slate-700/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900/50 flex items-center justify-center font-bold text-white">
                      {getRankIcon(index + 1) || index + 1}
                    </div>
                    <div>
                      <p className="text-white font-bold">{entry.guildName}</p>
                      <p className="text-slate-300 text-xs">{entry.participants} members participated</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{entry.totalScore.toLocaleString()}</p>
                    <p className="text-slate-300 text-xs">{entry.avgScore.toLocaleString()} avg</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}