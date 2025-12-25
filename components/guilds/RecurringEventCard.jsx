import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Users, Zap, Calendar } from 'lucide-react';

export default function RecurringEventCard({ event, onJoin, myGuild, isLeader }) {
  const isParticipating = event.participating_guilds?.includes(myGuild?.id);
  
  const getRecurrenceIcon = () => {
    switch (event.recurrence) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      default: return '⏰';
    }
  };

  const getNextOccurrence = () => {
    if (!event.next_occurrence) return 'TBD';
    const date = new Date(event.next_occurrence);
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `in ${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    return 'Soon';
  };

  const rewardTiers = event.reward_tiers || {
    gold: { coins: 5000, gems: 100 },
    silver: { coins: 3000, gems: 50 },
    bronze: { coins: 1500, gems: 25 }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getRecurrenceIcon()}</span>
              <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                {event.recurrence}
              </Badge>
              {isParticipating && (
                <Badge className="bg-green-500/20 text-green-400">Joined</Badge>
              )}
            </div>
            <CardTitle className="text-white">{event.name}</CardTitle>
            <p className="text-slate-400 text-sm mt-1">{event.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <p className="text-slate-400 text-xs">Next Event</p>
            </div>
            <p className="text-white font-bold">{getNextOccurrence()}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Guilds</p>
            </div>
            <p className="text-white font-bold">{event.participating_guilds?.length || 0}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <p className="text-white font-bold text-sm">Rewards</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-yellow-400 font-bold">🥇 Gold</p>
              <p className="text-slate-300">{rewardTiers.gold?.coins || 5000} coins</p>
            </div>
            <div>
              <p className="text-slate-300 font-bold">🥈 Silver</p>
              <p className="text-slate-300">{rewardTiers.silver?.coins || 3000} coins</p>
            </div>
            <div>
              <p className="text-orange-400 font-bold">🥉 Bronze</p>
              <p className="text-slate-300">{rewardTiers.bronze?.coins || 1500} coins</p>
            </div>
          </div>
        </div>

        {!isParticipating && isLeader && event.is_active && (
          <Button 
            onClick={() => onJoin(event.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Join Event
          </Button>
        )}
      </CardContent>
    </Card>
  );
}