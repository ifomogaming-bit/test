import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy, Target, Zap, Flame, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function WarChallengePanel({ war, myGuild, player, opponentGuild }) {
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const queryClient = useQueryClient();

  const { data: opponentMembers = [] } = useQuery({
    queryKey: ['opponentMembers', opponentGuild?.id],
    queryFn: async () => {
      if (!opponentGuild?.id) return [];
      return base44.entities.GuildMember.filter({ guild_id: opponentGuild.id });
    },
    enabled: !!opponentGuild?.id
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      return base44.entities.Player.list('-level', 200);
    }
  });

  const challengePlayerMutation = useMutation({
    mutationFn: async (opponentPlayerId) => {
      const opponentPlayer = allPlayers.find(p => p.id === opponentPlayerId);
      if (!opponentPlayer) throw new Error('Opponent not found');

      // Create a PvP challenge specifically for this war
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await base44.entities.PvPChallenge.create({
        challenger_id: player.id,
        challenger_name: player.username,
        opponent_id: opponentPlayerId,
        opponent_name: opponentPlayer.username,
        status: 'pending',
        is_ranked: false,
        expires_at: expiresAt.toISOString()
      });

      // Award points immediately for initiating challenge
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
        opponent_player_id: opponentPlayerId,
        opponent_player_name: opponentPlayer.username,
        details: { action: 'challenge_initiated' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeWars']);
      queryClient.invalidateQueries(['warContributions']);
      setShowChallengeDialog(false);
      setSelectedOpponent(null);
    }
  });

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 border-2 border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Challenge Enemy Players
          </CardTitle>
          <p className="text-purple-200 text-sm">Defeat rival guild members to earn war points!</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-white font-bold mb-2">💎 Point System</h4>
              <div className="space-y-1 text-sm">
                <p className="text-purple-200">• Challenge player: <span className="text-yellow-400 font-bold">+5 pts</span></p>
                <p className="text-purple-200">• Win PvP battle: <span className="text-yellow-400 font-bold">+25 pts</span></p>
                <p className="text-purple-200">• Win trading duel: <span className="text-yellow-400 font-bold">+20 pts</span></p>
                <p className="text-purple-200">• Complete challenge: <span className="text-yellow-400 font-bold">+15 pts</span></p>
              </div>
            </div>

            <Button
              onClick={() => setShowChallengeDialog(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              <Swords className="w-5 h-5 mr-2" />
              Challenge Enemy Player
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              Select {opponentGuild?.name} Member to Challenge
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {opponentMembers.map(member => {
              const memberPlayer = allPlayers.find(p => p.id === member.player_id);
              if (!memberPlayer) return null;

              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedOpponent(memberPlayer)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedOpponent?.id === memberPlayer.id
                      ? 'bg-purple-600 border-2 border-purple-400'
                      : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-white font-bold">{memberPlayer.username}</h5>
                      <p className="text-slate-400 text-sm">
                        Level {memberPlayer.level} • Rating: {memberPlayer.pvp_rating || 1000}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-500/20 text-red-400">
                        {memberPlayer.pvp_wins || 0}W - {memberPlayer.pvp_losses || 0}L
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowChallengeDialog(false)}
              className="flex-1 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedOpponent && challengePlayerMutation.mutate(selectedOpponent.id)}
              disabled={!selectedOpponent || challengePlayerMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Swords className="w-4 h-4 mr-2" />
              {challengePlayerMutation.isPending ? 'Challenging...' : 'Send Challenge (+5 pts)'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}