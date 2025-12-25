import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, BarChart3, Users, TrendingUp, Activity, AlertTriangle,
  Target, Zap, Brain, Shield, Award, Clock, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import antiCheatSystem from '@/components/security/AntiCheatSystem';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: player } = useQuery({
    queryKey: ['player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      return players[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list('-created_date', 100)
  });

  const { data: myGuildMembers = [] } = useQuery({
    queryKey: ['myGuildMembers', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const memberships = await base44.entities.GuildMember.filter({ player_id: player.id });
      if (memberships.length === 0) return [];
      const guildId = memberships[0].guild_id;
      const allMembers = await base44.entities.GuildMember.filter({ guild_id: guildId });
      return allMembers;
    },
    enabled: !!player?.id
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['allSkills'],
    queryFn: () => base44.entities.SkillTree.list('-created_date', 200)
  });

  const { data: eventParticipations = [] } = useQuery({
    queryKey: ['allParticipations'],
    queryFn: () => base44.entities.EventParticipation.list('-created_date', 200)
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500)
  });

  const isAdmin = user?.role === 'admin';
  const isGuildLeader = myGuildMembers.find(m => m.player_id === player?.id)?.role === 'leader';

  const playersToAnalyze = isAdmin ? allPlayers : 
    myGuildMembers.map(m => allPlayers.find(p => p.id === m.player_id)).filter(Boolean);

  // Activity metrics
  const activityData = playersToAnalyze.map(p => ({
    name: p.username,
    bubblesPopped: p.total_bubbles_popped || 0,
    level: p.level || 1,
    streak: p.longest_streak || 0
  })).sort((a, b) => b.bubblesPopped - a.bubblesPopped).slice(0, 10);

  // Trading performance
  const tradingPerformance = playersToAnalyze.map(p => {
    const playerTxs = transactions.filter(t => t.player_id === p.id && t.type === 'purchase');
    const totalVolume = playerTxs.reduce((sum, t) => sum + Math.abs(t.soft_currency_change || 0), 0);
    return {
      name: p.username,
      volume: totalVolume,
      trades: playerTxs.length
    };
  }).sort((a, b) => b.volume - a.volume).slice(0, 10);

  // Skill progression
  const skillProgression = playersToAnalyze.map(p => {
    const playerSkills = skills.filter(s => s.player_id === p.id);
    const totalLevels = playerSkills.reduce((sum, s) => sum + (s.level || 0), 0);
    return {
      name: p.username,
      skillPoints: totalLevels,
      skillsUnlocked: playerSkills.length
    };
  }).sort((a, b) => b.skillPoints - a.skillPoints).slice(0, 10);

  // Event participation
  const eventStats = playersToAnalyze.map(p => {
    const playerEvents = eventParticipations.filter(e => e.player_id === p.id);
    return {
      name: p.username,
      events: playerEvents.length,
      avgScore: playerEvents.length > 0 
        ? playerEvents.reduce((sum, e) => sum + (e.score || 0), 0) / playerEvents.length 
        : 0
    };
  }).sort((a, b) => b.events - a.events).slice(0, 10);

  // Anti-cheat flags
  const suspiciousPlayers = transactions
    .filter(t => t.type === 'security_flag')
    .reduce((acc, t) => {
      acc[t.player_id] = (acc[t.player_id] || 0) + 1;
      return acc;
    }, {});

  const flaggedPlayers = Object.entries(suspiciousPlayers)
    .map(([playerId, count]) => {
      const p = allPlayers.find(pl => pl.id === playerId);
      return p ? { name: p.username, flags: count, playerId } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.flags - a.flags);

  // Player churn prediction
  const churnRiskData = playersToAnalyze.map(p => {
    const daysSinceActive = p.last_bubble_time 
      ? Math.floor((Date.now() - new Date(p.last_bubble_time).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const activityScore = (p.total_bubbles_popped || 0) + (p.total_correct_answers || 0);
    const risk = daysSinceActive > 7 ? 'High' : daysSinceActive > 3 ? 'Medium' : 'Low';
    
    return {
      name: p.username,
      playerId: p.id,
      daysSinceActive,
      activityScore,
      risk
    };
  }).sort((a, b) => b.daysSinceActive - a.daysSinceActive);

  const generateAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const prompt = `Analyze this trading game player data and provide comprehensive insights:

Players: ${playersToAnalyze.length}
Activity Data: ${JSON.stringify(activityData)}
Trading Performance: ${JSON.stringify(tradingPerformance)}
Skill Progression: ${JSON.stringify(skillProgression)}
Event Participation: ${JSON.stringify(eventStats)}
Churn Risk Players: ${JSON.stringify(churnRiskData.slice(0, 5))}
Flagged Players: ${JSON.stringify(flaggedPlayers)}

Provide insights in JSON format:
{
  "keyTrends": ["list of 3-5 key trends"],
  "churnPrediction": {
    "highRiskCount": number,
    "mainReasons": ["reasons"],
    "recommendations": ["strategies"]
  },
  "topPerformers": ["top 3 player names and why"],
  "areasOfConcern": ["list of concerns"],
  "engagementStrategies": {
    "forInactive": ["strategies"],
    "forActive": ["strategies"],
    "forHighPerformers": ["strategies"]
  }
}`;

      const insights = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            keyTrends: { type: 'array', items: { type: 'string' } },
            churnPrediction: {
              type: 'object',
              properties: {
                highRiskCount: { type: 'number' },
                mainReasons: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            },
            topPerformers: { type: 'array', items: { type: 'string' } },
            areasOfConcern: { type: 'array', items: { type: 'string' } },
            engagementStrategies: {
              type: 'object',
              properties: {
                forInactive: { type: 'array', items: { type: 'string' } },
                forActive: { type: 'array', items: { type: 'string' } },
                forHighPerformers: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      });

      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    }
    setLoadingInsights(false);
  };

  const generatePersonalizedStrategy = async (playerId) => {
    const p = playersToAnalyze.find(pl => pl.id === playerId);
    if (!p) return;

    const playerSkills = skills.filter(s => s.player_id === playerId);
    const playerTxs = transactions.filter(t => t.player_id === playerId);
    const playerEvents = eventParticipations.filter(e => e.player_id === playerId);

    try {
      const prompt = `Create a personalized training and engagement strategy for this player:

Username: ${p.username}
Level: ${p.level}
Total XP: ${p.xp}
Bubbles Popped: ${p.total_bubbles_popped}
Longest Streak: ${p.longest_streak}
Skills Unlocked: ${playerSkills.length}
Skill Levels: ${JSON.stringify(playerSkills)}
Trading Activity: ${playerTxs.length} transactions
Event Participation: ${playerEvents.length} events
Last Active: ${p.last_bubble_time}

Create JSON response:
{
  "playerProfile": "brief assessment",
  "strengths": ["list strengths"],
  "weaknesses": ["list weaknesses"],
  "recommendations": {
    "skillsToFocus": ["which skills to upgrade"],
    "gameModes": ["which game modes to try"],
    "goals": ["short-term achievable goals"]
  },
  "motivationalMessage": "personalized encouragement"
}`;

      const strategy = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            playerProfile: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            recommendations: {
              type: 'object',
              properties: {
                skillsToFocus: { type: 'array', items: { type: 'string' } },
                gameModes: { type: 'array', items: { type: 'string' } },
                goals: { type: 'array', items: { type: 'string' } }
              }
            },
            motivationalMessage: { type: 'string' }
          }
        }
      });

      setSelectedPlayer({ ...p, strategy });
    } catch (error) {
      console.error('Failed to generate strategy:', error);
    }
  };

  if (!isAdmin && !isGuildLeader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">Only guild leaders and admins can access analytics.</p>
          <Link to={createPageUrl('Home')}>
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                Player Analytics
              </h1>
              <p className="text-slate-400">
                {isAdmin ? 'Admin Dashboard' : 'Guild Leader Dashboard'}
              </p>
            </div>
          </div>
          <Button
            onClick={generateAIInsights}
            disabled={loadingInsights}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {loadingInsights ? 'Analyzing...' : 'AI Insights'}
          </Button>
        </div>

        {aiInsights && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-white font-bold mb-2">Key Trends</h3>
                <ul className="space-y-1">
                  {aiInsights.keyTrends?.map((trend, i) => (
                    <li key={i} className="text-slate-300 text-sm">• {trend}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Churn Prediction</h3>
                <p className="text-red-400 font-bold">High Risk: {aiInsights.churnPrediction?.highRiskCount} players</p>
                <p className="text-slate-300 text-sm mt-1">Recommendations:</p>
                <ul className="space-y-1">
                  {aiInsights.churnPrediction?.recommendations?.map((rec, i) => (
                    <li key={i} className="text-slate-300 text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Top Performers</h3>
                <ul className="space-y-1">
                  {aiInsights.topPerformers?.map((perf, i) => (
                    <li key={i} className="text-green-400 text-sm">🏆 {perf}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Activity</TabsTrigger>
            <TabsTrigger value="trading"><TrendingUp className="w-4 h-4 mr-2" />Trading</TabsTrigger>
            <TabsTrigger value="skills"><Zap className="w-4 h-4 mr-2" />Skills</TabsTrigger>
            <TabsTrigger value="events"><Target className="w-4 h-4 mr-2" />Events</TabsTrigger>
            <TabsTrigger value="churn"><Clock className="w-4 h-4 mr-2" />Churn Risk</TabsTrigger>
            <TabsTrigger value="security"><AlertTriangle className="w-4 h-4 mr-2" />Security</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Player Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="bubblesPopped" fill="#3b82f6" name="Bubbles Popped" />
                    <Bar dataKey="level" fill="#10b981" name="Level" />
                    <Bar dataKey="streak" fill="#f59e0b" name="Longest Streak" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={tradingPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="volume" fill="#8b5cf6" name="Volume" />
                    <Bar dataKey="trades" fill="#ec4899" name="Trades" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Skill Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={skillProgression}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="skillPoints" fill="#06b6d4" name="Total Skill Points" />
                    <Bar dataKey="skillsUnlocked" fill="#84cc16" name="Skills Unlocked" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Event Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={eventStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="events" fill="#f59e0b" name="Events Joined" />
                    <Bar dataKey="avgScore" fill="#10b981" name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="churn">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Churn Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churnRiskData.slice(0, 15).map((player) => (
                    <div key={player.playerId} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-bold">{player.name}</p>
                        <p className="text-slate-400 text-sm">{player.daysSinceActive} days inactive • Activity: {player.activityScore}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          player.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                          player.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {player.risk} Risk
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => generatePersonalizedStrategy(player.playerId)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          Strategy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Anti-Cheat Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flaggedPlayers.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No security flags detected</p>
                ) : (
                  <div className="space-y-2">
                    {flaggedPlayers.map((player) => (
                      <div key={player.playerId} className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div>
                          <p className="text-white font-bold">{player.name}</p>
                          <p className="text-red-400 text-sm">{player.flags} security flag{player.flags !== 1 ? 's' : ''}</p>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400">Review Required</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedPlayer?.strategy && (
          <Card className="mt-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Personalized Strategy: {selectedPlayer.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-white font-bold mb-2">Profile</h3>
                <p className="text-slate-300 text-sm">{selectedPlayer.strategy.playerProfile}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-green-400 font-bold mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {selectedPlayer.strategy.strengths?.map((s, i) => (
                      <li key={i} className="text-slate-300 text-sm">✓ {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-bold mb-2">Areas to Improve</h3>
                  <ul className="space-y-1">
                    {selectedPlayer.strategy.weaknesses?.map((w, i) => (
                      <li key={i} className="text-slate-300 text-sm">→ {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Recommendations</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-blue-400 text-sm font-bold">Skills to Focus:</p>
                    <p className="text-slate-300 text-sm">{selectedPlayer.strategy.recommendations?.skillsToFocus?.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-purple-400 text-sm font-bold">Game Modes:</p>
                    <p className="text-slate-300 text-sm">{selectedPlayer.strategy.recommendations?.gameModes?.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-green-400 text-sm font-bold">Goals:</p>
                    <ul className="space-y-1">
                      {selectedPlayer.strategy.recommendations?.goals?.map((g, i) => (
                        <li key={i} className="text-slate-300 text-sm">• {g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 italic">💬 {selectedPlayer.strategy.motivationalMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}