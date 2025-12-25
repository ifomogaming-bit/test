import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, TrendingUp } from 'lucide-react';

export default function ChallengeCard({ challenge, myGuild, isLeader, onJoin, guilds }) {
  const isParticipating = challenge.participating_guilds?.includes(myGuild?.id);
  const progress = challenge.guild_progress?.[myGuild?.id] || 0;
  const progressPercentage = (progress / challenge.target_value) * 100;

  const getChallengeIcon = (type) => {
    switch (type) {
      case 'portfolio_value': return TrendingUp;
      case 'profit_percentage': return TrendingUp;
      case 'trade_count': return Target;
      default: return Trophy;
    }
  };

  const Icon = getChallengeIcon(challenge.challenge_type);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-purple-400" />
            <div>
              <CardTitle className="text-white">{challenge.name}</CardTitle>
              <p className="text-slate-400 text-sm mt-1">
                Target: {challenge.target_value.toLocaleString()}
              </p>
            </div>
          </div>
          <Badge className={challenge.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Prize Pool</p>
            <p className="text-white font-bold">{challenge.prize_pool?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Participants</p>
            <p className="text-white font-bold">{challenge.participating_guilds?.length || 0}</p>
          </div>
        </div>

        {isParticipating && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Your Progress</span>
              <span className="text-white font-bold">{progress.toLocaleString()} / {challenge.target_value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
            </div>
          </div>
        )}

        {!isParticipating && challenge.status === 'active' && isLeader && (
          <Button onClick={() => onJoin(challenge.id)} className="w-full bg-purple-600 hover:bg-purple-700">
            <Trophy className="w-4 h-4 mr-2" />
            Join Challenge
          </Button>
        )}

        <div className="flex items-center gap-2 text-slate-400 text-sm mt-4">
          <Clock className="w-4 h-4" />
          <span>Ends {new Date(challenge.ends_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}