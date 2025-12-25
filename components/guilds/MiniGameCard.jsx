import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Flag, Package, Zap, TrendingUp } from 'lucide-react';

export default function MiniGameCard({ game, myGuild, isLeader, onJoin, guilds }) {
  const isParticipating = game.participating_guilds?.includes(myGuild?.id);
  const myScore = game.guild_scores?.[myGuild?.id] || 0;

  const getGameIcon = (type) => {
    switch (type) {
      case 'capture_the_flag': return Flag;
      case 'resource_gathering': return Package;
      case 'trading_blitz': return Zap;
      case 'market_prediction': return TrendingUp;
      default: return Gamepad2;
    }
  };

  const Icon = getGameIcon(game.game_type);

  const topGuilds = Object.entries(game.guild_scores || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const getGameDescription = (type) => {
    switch (type) {
      case 'capture_the_flag':
        return 'Compete to capture market sectors and defend your positions';
      case 'resource_gathering':
        return 'Collect the most trading resources and portfolio assets';
      case 'trading_blitz':
        return 'Execute the most profitable trades in limited time';
      case 'market_prediction':
        return 'Predict price movements with the highest accuracy';
      default:
        return 'Interactive guild competition';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700 hover:border-cyan-500/50 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Icon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-white">{game.name}</CardTitle>
              <p className="text-slate-400 text-sm capitalize">{game.game_type.replace('_', ' ')}</p>
            </div>
          </div>
          <Badge className={
            game.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
            game.status === 'completed' ? 'bg-slate-500/20 text-slate-400' :
            'bg-blue-500/20 text-blue-400 border border-blue-500/50'
          }>
            {game.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-300 text-sm mb-4">{getGameDescription(game.game_type)}</p>
        {isParticipating && myScore > 0 && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 text-sm">Your Guild Score</p>
            <p className="text-white text-2xl font-bold">{myScore}</p>
          </div>
        )}

        {game.status === 'active' && topGuilds.length > 0 && (
          <div className="mb-4">
            <h4 className="text-white font-bold mb-2 text-sm">Top Guilds</h4>
            <div className="space-y-2">
              {topGuilds.map(([guildId, score], index) => {
                const guild = guilds.find(g => g.id === guildId);
                return (
                  <div key={guildId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold w-4">{index + 1}.</span>
                      <span className="text-slate-300">{guild?.name || 'Unknown'}</span>
                    </div>
                    <span className="text-cyan-400 font-bold">{score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isParticipating && (game.status === 'upcoming' || game.status === 'active') && isLeader && (
          <Button onClick={() => onJoin(game.id)} className="w-full bg-cyan-600 hover:bg-cyan-700">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Join Game
          </Button>
        )}

        <div className="text-slate-400 text-sm mt-4">
          {game.status === 'upcoming' ? 'Starts' : 'Ends'} {new Date(game.status === 'upcoming' ? game.starts_at : game.ends_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}