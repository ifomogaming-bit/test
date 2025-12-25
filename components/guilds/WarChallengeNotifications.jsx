import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Shield, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WarChallengeNotifications({ myGuild, isLeader }) {
  const queryClient = useQueryClient();

  const { data: incomingChallenges = [] } = useQuery({
    queryKey: ['warChallengeNotifications', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.WarChallengeNotification.filter({ 
        opponent_guild_id: myGuild.id,
        status: 'pending'
      }, '-created_date');
    },
    enabled: !!myGuild?.id,
    refetchInterval: 3000
  });

  const acceptChallengeMutation = useMutation({
    mutationFn: async (notification) => {
      // Create the war
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 5);

      const war = await base44.entities.GuildWar.create({
        challenger_guild_id: notification.challenger_guild_id,
        opponent_guild_id: notification.opponent_guild_id,
        status: 'active',
        challenger_score: 0,
        opponent_score: 0,
        prize_pool: 15000,
        expires_at: expiresAt.toISOString()
      });

      // Update notification
      await base44.entities.WarChallengeNotification.update(notification.id, {
        status: 'accepted'
      });

      // Notify challenger guild members
      const challengerMembers = await base44.entities.GuildMember.filter({ guild_id: notification.challenger_guild_id });
      for (const member of challengerMembers) {
        await base44.entities.Notification.create({
          player_id: member.player_id,
          type: 'war_started',
          title: '⚔️ War Started!',
          message: `${notification.opponent_guild_name} accepted your war challenge! The battle begins now.`,
          action_url: 'Guilds',
          metadata: { war_id: war.id },
          priority: 'high'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warChallengeNotifications']);
      queryClient.invalidateQueries(['guildWars']);
    }
  });

  const declineChallengeMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.WarChallengeNotification.update(notificationId, {
        status: 'declined'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warChallengeNotifications']);
    }
  });

  if (!isLeader || incomingChallenges.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {incomingChallenges.map((challenge) => (
        <motion.div
          key={challenge.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <Card className="bg-gradient-to-br from-red-900/95 via-orange-900/95 to-red-900/95 border-4 border-red-500/80 shadow-2xl shadow-red-500/50 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Swords className="w-8 h-8 text-red-400" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-white text-xl font-black">
                      ⚔️ WAR CHALLENGE!
                    </CardTitle>
                    <p className="text-red-200 text-sm mt-1">
                      {challenge.challenger_guild_name} has challenged you to war!
                    </p>
                  </div>
                </div>
                <Badge className="bg-red-600 text-white font-black text-lg px-3 py-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  ACTION REQUIRED
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <p className="text-orange-300 text-sm font-bold">
                    Challenge expires: {new Date(challenge.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-white text-sm">
                  💰 Prize Pool: <span className="font-bold text-yellow-400">15,000 coins</span>
                </p>
                <p className="text-white text-sm">
                  ⏱️ Duration: <span className="font-bold text-cyan-400">5 days</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => acceptChallengeMutation.mutate(challenge)}
                  disabled={acceptChallengeMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-black text-lg h-14"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  ACCEPT WAR
                </Button>
                <Button
                  onClick={() => declineChallengeMutation.mutate(challenge.id)}
                  disabled={declineChallengeMutation.isPending}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500/20 font-bold h-14"
                >
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}