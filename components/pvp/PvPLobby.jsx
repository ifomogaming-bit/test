import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Users, Clock, Zap, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvatarDisplay from '../avatar/AvatarDisplay';

export default function PvPLobby({ 
  player, 
  onCreateChallenge, 
  onJoinChallenge,
  pendingChallenges = [],
  recentMatches = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('casual');

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Swords className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">PvP Arena</h2>
            <p className="text-slate-400 text-sm">Challenge players worldwide</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold">{player?.pvp_rating || 1000}</span>
          <span className="text-slate-400 text-sm">Rating</span>
        </div>
      </div>

      <Tabs defaultValue="quickplay" className="space-y-4">
        <TabsList className="bg-slate-700/50 w-full">
          <TabsTrigger value="quickplay" className="flex-1">Quick Play</TabsTrigger>
          <TabsTrigger value="ranked" className="flex-1">Ranked</TabsTrigger>
          <TabsTrigger value="challenges" className="flex-1">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="quickplay" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCreateChallenge('casual')}
              className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-left"
            >
              <Users className="w-10 h-10 text-white mb-3" />
              <h3 className="text-xl font-bold text-white mb-1">Find Match</h3>
              <p className="text-blue-200 text-sm">Quick matchmaking with random opponent</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCreateChallenge('private')}
              className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl text-left"
            >
              <UserPlus className="w-10 h-10 text-white mb-3" />
              <h3 className="text-xl font-bold text-white mb-1">Challenge Friend</h3>
              <p className="text-purple-200 text-sm">Invite a friend to battle</p>
            </motion.button>
          </div>
        </TabsContent>

        <TabsContent value="ranked" className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <Trophy className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-1">Ranked Match</h3>
                <p className="text-amber-100 text-sm mb-4">Compete for rating points and exclusive rewards</p>
                <Button 
                  onClick={() => onCreateChallenge('ranked')}
                  className="bg-white text-amber-700 hover:bg-white/90"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Ranked Match
                </Button>
              </div>
              <div className="text-right">
                <p className="text-amber-100 text-sm">Current Season</p>
                <p className="text-2xl font-bold text-white">Season 1</p>
                <p className="text-amber-200 text-xs mt-1">Ends in 14 days</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-green-400">{player?.pvp_wins || 0}</p>
              <p className="text-slate-400 text-sm">Wins</p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-red-400">{player?.pvp_losses || 0}</p>
              <p className="text-slate-400 text-sm">Losses</p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-white">
                {player?.pvp_wins && player?.pvp_losses 
                  ? ((player.pvp_wins / (player.pvp_wins + player.pvp_losses)) * 100).toFixed(1) 
                  : 0}%
              </p>
              <p className="text-slate-400 text-sm">Win Rate</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          {pendingChallenges.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                Pending Challenges
              </h4>
              {pendingChallenges.map(challenge => (
                <div key={challenge.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AvatarDisplay avatar={{}} size="sm" />
                    <div>
                      <p className="text-white font-medium">{challenge.challenger_name}</p>
                      <p className="text-slate-400 text-xs">{challenge.is_ranked ? 'Ranked' : 'Casual'}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onJoinChallenge(challenge.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Swords className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending challenges</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}