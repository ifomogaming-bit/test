import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RaidLeaderboard({ contributions = [], myGuild, allPlayers = [] }) {
  // Sort by damage dealt
  const sortedContributions = [...contributions].sort((a, b) => b.damage_dealt - a.damage_dealt);
  const topContributors = sortedContributions.slice(0, 10);

  // Guild leaderboard
  const guildDamage = {};
  contributions.forEach(c => {
    if (!guildDamage[c.guild_id]) {
      guildDamage[c.guild_id] = 0;
    }
    guildDamage[c.guild_id] += c.damage_dealt;
  });

  const guildLeaderboard = Object.entries(guildDamage)
    .map(([guild_id, damage]) => ({ guild_id, damage }))
    .sort((a, b) => b.damage - a.damage)
    .slice(0, 5);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Target className="w-4 h-4 text-slate-500" />;
  };

  const getRankBadge = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white';
    if (index === 1) return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
    if (index === 2) return 'bg-gradient-to-r from-amber-700 to-orange-700 text-white';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="space-y-4">
      {/* Individual Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topContributors.map((contrib, index) => (
              <motion.div
                key={contrib.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  contrib.player_id === myGuild?.leader_id
                    ? 'bg-blue-500/20 border border-blue-500/40'
                    : 'bg-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Badge className={`${getRankBadge(index)} font-black text-lg px-3 py-1`}>
                    #{index + 1}
                  </Badge>
                  {getRankIcon(index)}
                  <div className="flex-1">
                    <p className="text-white font-bold">{contrib.player_name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {contrib.attacks_made} attacks
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-red-400" />
                        {contrib.critical_hits} crits
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 text-2xl font-black">
                    {contrib.damage_dealt.toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-xs">damage</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guild Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            Top Guilds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {guildLeaderboard.map((guildData, index) => {
              const isMyGuild = guildData.guild_id === myGuild?.id;
              return (
                <motion.div
                  key={guildData.guild_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isMyGuild
                      ? 'bg-purple-500/20 border-2 border-purple-500/50'
                      : 'bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`${getRankBadge(index)} font-black text-lg px-3 py-1`}>
                      #{index + 1}
                    </Badge>
                    {getRankIcon(index)}
                    <p className="text-white font-bold">
                      {isMyGuild ? '⭐ ' : ''}Guild {guildData.guild_id.slice(0, 8)}
                    </p>
                  </div>
                  <p className="text-purple-400 text-2xl font-black">
                    {guildData.damage.toLocaleString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}