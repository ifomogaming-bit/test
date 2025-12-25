import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function GuildAIAdvisorButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
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

  const { data: myGuildMembership } = useQuery({
    queryKey: ['myGuildMembership', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const memberships = await base44.entities.GuildMember.filter({ player_id: player.id });
      return memberships[0] || null;
    },
    enabled: !!player?.id
  });

  const { data: myGuild } = useQuery({
    queryKey: ['myGuild', myGuildMembership?.guild_id],
    queryFn: async () => {
      if (!myGuildMembership?.guild_id) return null;
      const guild = await base44.entities.Guild.filter({ id: myGuildMembership.guild_id });
      return guild[0] || null;
    },
    enabled: !!myGuildMembership?.guild_id
  });

  const { data: guildTreasury } = useQuery({
    queryKey: ['guildTreasury', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return null;
      const treasuries = await base44.entities.GuildTreasury.filter({ guild_id: myGuild.id });
      return treasuries[0] || null;
    },
    enabled: !!myGuild?.id
  });

  const analyzeGuild = async () => {
    if (!guildTreasury) return;
    
    setLoading(true);
    try {
      const prompt = `Analyze this guild's financial situation:
      
Treasury Balance: $${guildTreasury?.total_balance?.toLocaleString() || 0}
Invested: $${guildTreasury?.invested_amount?.toLocaleString() || 0}
Total Returns: $${guildTreasury?.total_returns?.toLocaleString() || 0}
Guild Level: ${myGuild?.level || 1}

Provide concise advice with:
1. Health status (1 sentence)
2. Two investment tips
3. One risk warning

Keep it brief and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            health_assessment: { type: 'string' },
            strategies: { type: 'array', items: { type: 'string' } },
            risk_flags: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      setAnalysis({
        health_assessment: 'Analysis temporarily unavailable.',
        strategies: ['Diversify holdings', 'Build emergency reserves'],
        risk_flags: ['Monitor member activity']
      });
    }
    setLoading(false);
  };

  // Only show if player has guild
  if (!myGuild) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-32 right-4 z-30"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Brain className="w-6 h-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advisor Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] max-h-[calc(100vh-8rem)] overflow-hidden"
          >
            <Card className="bg-slate-900 border-purple-500/50 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain className="w-8 h-8 text-white" />
                    <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Guild AI Advisor</h3>
                    <p className="text-purple-100 text-xs">Strategic insights</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 bg-slate-800/50 max-h-[50vh] overflow-y-auto">
                {!analysis ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 mx-auto mb-3 text-purple-400" />
                    <p className="text-slate-300 mb-4 text-sm">Get AI-powered analysis of your guild's strategy</p>
                    <Button
                      onClick={analyzeGuild}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Analyzing...' : 'Analyze Guild'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-800/70 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-white font-bold text-sm mb-1">Health Status</h4>
                          <p className="text-slate-300 text-xs leading-relaxed">{analysis.health_assessment}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/70 rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                        <h4 className="text-white font-bold text-sm">Strategies</h4>
                      </div>
                      <ul className="space-y-1.5 ml-6">
                        {analysis.strategies?.map((strategy, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                            <span className="text-yellow-400 font-bold shrink-0">{i + 1}.</span>
                            <span className="leading-relaxed">{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {analysis.risk_flags && analysis.risk_flags.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <h4 className="text-white font-bold text-sm">Risks</h4>
                        </div>
                        <ul className="space-y-1.5 ml-6">
                          {analysis.risk_flags.map((flag, i) => (
                            <li key={i} className="flex items-start gap-2 text-red-300 text-xs">
                              <span className="shrink-0">•</span>
                              <span className="leading-relaxed">{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={analyzeGuild}
                      disabled={loading}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Re-analyze
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}