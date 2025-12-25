import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Trophy, Zap, Target } from 'lucide-react';
import { WAR_EVENT_TYPES } from './WarEventGenerator';

export default function WarEventNotification({ event, myGuild }) {
  if (!event || event.status !== 'active') return null;

  const config = WAR_EVENT_TYPES[event.event_type];
  const timeLeft = Math.max(0, new Date(event.expires_at).getTime() - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const myProgress = event.current_progress?.[myGuild?.id] || 0;
  const progressPercent = Math.min(100, (myProgress / event.target_goal) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card className={`bg-gradient-to-br ${config?.color || 'from-purple-600 to-pink-600'} border-2 border-white/30 shadow-2xl mb-4`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  {config?.icon || '🎯'}
                </motion.div>
                <div>
                  <h3 className="text-white text-xl font-black flex items-center gap-2">
                    {event.event_name}
                    <Badge className="bg-white/20 text-white border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      {event.bonus_multiplier}x Points
                    </Badge>
                  </h3>
                  <p className="text-white/90 text-sm font-bold">{event.description}</p>
                </div>
              </div>
              <Badge className="bg-black/30 text-white border-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {hoursLeft}h {minutesLeft}m
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-bold flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Your Progress
                </span>
                <span className="text-white font-black">
                  {myProgress.toLocaleString()} / {event.target_goal.toLocaleString()}
                </span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-black/30" />
              
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="text-white/80">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  Rewards: {event.rewards.coins?.toLocaleString()} coins, {event.rewards.premium} gems
                </div>
                {progressPercent >= 100 && (
                  <Badge className="bg-green-500/30 text-green-200 border-green-400">
                    ✓ Completed!
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}