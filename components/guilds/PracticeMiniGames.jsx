import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Zap, Trophy, Gamepad2, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import WarChallengeMiniGames from './WarChallengeMiniGames';

const PRACTICE_GAMES = [
  {
    id: 'trend_tapper',
    name: '📈 Trend Tapper',
    description: 'Predict if the market goes UP or DOWN. Quick reflexes and market intuition required!',
    icon: TrendingUp,
    gradient: 'from-green-600 via-emerald-600 to-green-600',
    difficulty: 'Easy',
    rounds: 10,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/50'
  },
  {
    id: 'market_race',
    name: '🏁 Market Race',
    description: 'Pick the best performing stocks! Test your stock selection skills against the clock.',
    icon: Target,
    gradient: 'from-blue-600 via-cyan-600 to-blue-600',
    difficulty: 'Medium',
    rounds: 20,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50'
  },
  {
    id: 'portfolio_flip',
    name: '💼 Portfolio Flip',
    description: 'Build the strongest portfolio! Balance risk and reward to maximize returns.',
    icon: Trophy,
    gradient: 'from-purple-600 via-pink-600 to-purple-600',
    difficulty: 'Hard',
    rounds: 5,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50'
  }
];

export default function PracticeMiniGames({ player }) {
  const [activeGame, setActiveGame] = useState(null);
  const [mockChallenge, setMockChallenge] = useState(null);

  const startPractice = (gameType) => {
    // Create a mock challenge for practice
    const mockChallengeData = {
      id: `practice_${Date.now()}`,
      challenge_type: gameType,
      challenger_id: player?.id,
      opponent_id: 'npc_practice',
      opponent_name: 'Training Bot',
      status: 'active'
    };
    
    const mockWar = {
      id: 'practice_war',
      challenger_guild_id: 'practice',
      opponent_guild_id: 'practice',
      challenger_score: 0,
      opponent_score: 0
    };

    const mockGuild = {
      id: 'practice_guild',
      name: 'Practice Mode'
    };

    setMockChallenge(mockChallengeData);
    setActiveGame({ challenge: mockChallengeData, war: mockWar, guild: mockGuild });
  };

  const handleComplete = () => {
    setActiveGame(null);
    setMockChallenge(null);
  };

  if (activeGame) {
    return (
      <WarChallengeMiniGames
        challenge={activeGame.challenge}
        player={player}
        war={activeGame.war}
        myGuild={activeGame.guild}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
          Practice Arena
        </h2>
        <p className="text-slate-300 font-bold mb-1">🎮 Master the mini-games before guild wars!</p>
        <p className="text-slate-400 text-sm">Train against bots to perfect your skills</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border-2 border-green-500/40 text-center"
        >
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 text-xs font-bold mb-1">QUICK</p>
          <p className="text-white text-2xl font-black">10</p>
          <p className="text-slate-400 text-xs">Rounds</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border-2 border-blue-500/40 text-center"
        >
          <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-blue-400 text-xs font-bold mb-1">MEDIUM</p>
          <p className="text-white text-2xl font-black">20</p>
          <p className="text-slate-400 text-xs">Rounds</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-4 border-2 border-purple-500/40 text-center"
        >
          <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-400 text-xs font-bold mb-1">INTENSE</p>
          <p className="text-white text-2xl font-black">5</p>
          <p className="text-slate-400 text-xs">Rounds</p>
        </motion.div>
      </div>

      {/* Game Cards */}
      <div className="grid gap-4">
        {PRACTICE_GAMES.map((game, idx) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className={`bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 ${game.border} shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative`}>
                {/* Animated background effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-5`} />
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-10`}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className={`text-2xl font-black ${game.color}`}>
                          {game.name}
                        </CardTitle>
                        <p className="text-slate-400 text-sm mt-1">{game.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${game.bg} ${game.color} border ${game.border} font-black text-sm mb-2`}>
                        {game.difficulty}
                      </Badge>
                      <p className="text-slate-400 text-xs">
                        <Zap className="w-3 h-3 inline mr-1" />
                        {game.rounds} rounds
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={() => startPractice(game.id)}
                        className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90 shadow-xl font-black text-lg py-6 border-2 border-white/20`}
                      >
                        <Swords className="w-5 h-5 mr-2" />
                        Start Practice
                      </Button>
                    </motion.div>
                  </div>
                  
                  {/* Game Tips */}
                  <div className={`mt-4 p-3 ${game.bg} rounded-lg border ${game.border}`}>
                    <p className={`${game.color} text-xs font-bold mb-1`}>💡 Pro Tip:</p>
                    <p className="text-slate-300 text-xs">
                      {game.id === 'trend_tapper' && 'Focus on market patterns and make quick decisions!'}
                      {game.id === 'market_race' && 'Study stock performance and choose wisely under pressure!'}
                      {game.id === 'portfolio_flip' && 'Balance your portfolio for maximum growth potential!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border-2 border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-white font-black text-lg">Why Practice?</h3>
        </div>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            Master game mechanics before real guild wars
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-pink-400 rounded-full" />
            Improve reaction time and decision making
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            Learn strategies to maximize your war contributions
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-pink-400 rounded-full" />
            Practice is free and unlimited - no guild required!
          </li>
        </ul>
      </div>
    </div>
  );
}