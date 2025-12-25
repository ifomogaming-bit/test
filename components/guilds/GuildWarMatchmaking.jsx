import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Shield, Target, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function GuildWarMatchmaking({ myGuild, guilds, guildWars = [], onMatchFound, canInitiate = true }) {
  const [searching, setSearching] = useState(false);
  const [matchedGuild, setMatchedGuild] = useState(null);
  const queryClient = useQueryClient();

  const calculateGuildPower = (guild) => {
    const memberWeight = guild.member_count * 1000;
    const valueWeight = guild.total_portfolio_value * 0.5;
    return Math.round(memberWeight + valueWeight);
  };

  const getDiplomaticModifier = (targetGuildId) => {
    // Check alliances and rivalries for matchmaking influence
    const alliances = [];
    const rivalries = [];
    // These would come from context but we'll calculate basic modifier
    return { allianceBonus: 0, rivalryPenalty: 0 };
  };

  const findMatch = () => {
    setSearching(true);
    
    const myPower = calculateGuildPower(myGuild);
    const powerRange = myPower * 0.3; // ±30% power range
    
    // Filter out guilds that are already in an active war
    const guildsInWar = new Set();
    guildWars.forEach(war => {
      if (war.status === 'active' || war.status === 'pending') {
        guildsInWar.add(war.challenger_guild_id);
        guildsInWar.add(war.opponent_guild_id);
      }
    });
    
    const eligibleGuilds = guilds
      .filter(g => g.id !== myGuild.id && !guildsInWar.has(g.id))
      .map(g => ({
        ...g,
        power: calculateGuildPower(g),
        powerDiff: Math.abs(calculateGuildPower(g) - myPower)
      }))
      .filter(g => g.powerDiff <= powerRange)
      .sort((a, b) => a.powerDiff - b.powerDiff);

    setTimeout(() => {
      if (eligibleGuilds.length > 0) {
        setMatchedGuild(eligibleGuilds[0]);
      } else {
        alert('No eligible opponents found. All guilds are either too strong/weak or already in wars.');
      }
      setSearching(false);
    }, 2000);
  };

  const createWarMutation = useMutation({
    mutationFn: async () => {
      // Double-check no active wars before creating
      const myActiveWars = guildWars.filter(w => 
        (w.challenger_guild_id === myGuild.id || w.opponent_guild_id === myGuild.id) &&
        (w.status === 'active' || w.status === 'pending')
      );
      
      if (myActiveWars.length > 0) {
        throw new Error('Your guild already has an active war!');
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 5);

      await base44.entities.GuildWar.create({
        challenger_guild_id: myGuild.id,
        opponent_guild_id: matchedGuild.id,
        status: 'active',
        challenger_score: 0,
        opponent_score: 0,
        prize_pool: 15000,
        expires_at: expiresAt.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildWars']);
      setMatchedGuild(null);
      if (onMatchFound) onMatchFound();
    },
    onError: (error) => {
      alert(error.message);
      setMatchedGuild(null);
    }
  });

  const myPower = calculateGuildPower(myGuild);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-red-400" />
          Automated Matchmaking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Your Guild Power</span>
              <Badge className="bg-cyan-500/20 text-cyan-400">
                <Zap className="w-3 h-3 mr-1" />
                {myPower.toLocaleString()}
              </Badge>
            </div>
            <p className="text-slate-400 text-xs">Based on members and portfolio value</p>
          </div>
        </div>

        {!matchedGuild ? (
          <Button
            onClick={findMatch}
            disabled={searching || !canInitiate}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50"
          >
            <Swords className={`w-4 h-4 mr-2 ${searching ? 'animate-pulse' : ''}`} />
            {!canInitiate ? 'Leader/Co-Leader/War General Only' : searching ? 'Finding Opponent...' : 'Find Matched Opponent'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 text-green-400" />
                <div className="flex-1">
                  <h4 className="text-white font-bold">{matchedGuild.name}</h4>
                  <p className="text-slate-400 text-sm">{matchedGuild.member_count} members</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  <Zap className="w-3 h-3 mr-1" />
                  {matchedGuild.power.toLocaleString()}
                </Badge>
              </div>
              <div className="text-center mb-3">
                <p className="text-green-400 font-bold">Power Difference: {matchedGuild.powerDiff.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">Fair match found!</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => createWarMutation.mutate()}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  Challenge
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMatchedGuild(null)}
                  className="border-slate-600"
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}