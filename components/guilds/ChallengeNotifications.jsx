import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, CheckCircle, XCircle, Clock, TrendingUp, Target, Trophy } from 'lucide-react';

const GAME_ICONS = {
  trend_tapper: { icon: TrendingUp, name: '📈 Trend Tapper', color: 'text-green-400' },
  market_race: { icon: Target, name: '🏁 Market Race', color: 'text-blue-400' },
  portfolio_flip: { icon: Trophy, name: '💼 Portfolio Flip', color: 'text-purple-400' }
};

export default function ChallengeNotifications({ player, onAccept }) {
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(true);

  const { data: incomingChallenges = [] } = useQuery({
    queryKey: ['incomingChallenges', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const challenges = await base44.entities.WarChallenge.filter({ 
        opponent_id: player.id, 
        status: 'pending' 
      }, '-created_date', 50);
      return challenges;
    },
    enabled: !!player?.id,
    refetchInterval: 3000 // Poll every 3 seconds for new challenges
  });

  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      await base44.entities.WarChallenge.update(challengeId, {
        status: 'active',
        accepted_at: new Date().toISOString()
      });
    },
    onSuccess: (_, challengeId) => {
      queryClient.invalidateQueries(['incomingChallenges']);
      queryClient.invalidateQueries(['warChallenges']);
      const challenge = incomingChallenges.find(c => c.id === challengeId);
      if (challenge && onAccept) {
        onAccept(challenge);
      }
    }
  });

  const declineChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      await base44.entities.WarChallenge.update(challengeId, {
        status: 'declined',
        declined_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['incomingChallenges']);
    }
  });

  if (incomingChallenges.length === 0) return null;

  return (
    <AnimatePresence>
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 space-y-3 max-w-md"
        >
          {incomingChallenges.map((challenge) => {
            const gameInfo = GAME_ICONS[challenge.challenge_type] || GAME_ICONS.trend_tapper;
            const GameIcon = gameInfo.icon;

            return (
              <motion.div
                key={challenge.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Card className="bg-gradient-to-br from-orange-900/95 via-red-900/95 to-orange-900/95 backdrop-blur-xl border-2 border-orange-500/80 shadow-2xl shadow-orange-500/50">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                      >
                        <Swords className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-white font-black text-lg">Challenge Received!</h3>
                        <p className="text-orange-300 text-sm font-bold">
                          {challenge.challenger_name} challenges you
                        </p>
                      </div>
                      <Badge className="bg-orange-500/30 text-orange-300 border border-orange-500/50">
                        <Clock className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <GameIcon className={`w-5 h-5 ${gameInfo.color}`} />
                        <span className={`font-bold ${gameInfo.color}`}>{gameInfo.name}</span>
                      </div>
                      <p className="text-slate-300 text-xs">Battle for guild war points!</p>
                    </div>

                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button
                          onClick={() => acceptChallengeMutation.mutate(challenge.id)}
                          disabled={acceptChallengeMutation.isPending}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl font-black"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => declineChallengeMutation.mutate(challenge.id)}
                          disabled={declineChallengeMutation.isPending}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}