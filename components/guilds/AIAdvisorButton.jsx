import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function AIAdvisorButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
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

  const { data: guildMembership } = useQuery({
    queryKey: ['myGuildMembership', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const memberships = await base44.entities.GuildMember.filter({ player_id: player.id });
      return memberships[0] || null;
    },
    enabled: !!player?.id
  });

  const { data: guild } = useQuery({
    queryKey: ['myGuild', guildMembership?.guild_id],
    queryFn: async () => {
      if (!guildMembership?.guild_id) return null;
      const guilds = await base44.entities.Guild.filter({ id: guildMembership.guild_id });
      return guilds[0] || null;
    },
    enabled: !!guildMembership?.guild_id
  });

  const analyzeGuild = async () => {
    if (!guild) return;
    
    setLoading(true);
    try {
      const prompt = `Analyze this guild's performance:

Guild: ${guild.name}
Level: ${guild.level}
Members: ${guild.member_count}
Treasury: $${guild.treasury_balance?.toLocaleString() || 0}
Trophies: ${guild.trophies || 0}

Provide:
1. Quick health assessment (1 sentence)
2. Two actionable strategies
3. One risk to watch

Keep brief and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            health: { type: 'string' },
            strategies: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      setAnalysis({
        health: 'Analysis temporarily unavailable.',
        strategies: ['Focus on member recruitment', 'Build treasury reserves'],
        risks: ['Monitor competitive guilds']
      });
    }
    setLoading(false);
  };

  if (!guild) return null;

  return (
    <>
      {/* Floating AI Advisor Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-[250px] right-4 sm:bottom-[280px] sm:right-6 z-30"
          >
            <Button
              onClick={() => {
                setIsOpen(true);
                if (!analysis) analyzeGuild();
              }}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Advisor Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed bottom-[250px] right-4 sm:bottom-[280px] sm:right-6 z-30 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px]"
          >
            <Card className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl border-purple-500/50 shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain className="w-7 h-7 text-white" />
                    <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Guild AI Advisor</h3>
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
              <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-purple-400 animate-pulse" />
                    <p className="text-white text-sm">Analyzing guild data...</p>
                  </div>
                ) : analysis ? (
                  <>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-bold text-xs mb-1">Health Status</h4>
                          <p className="text-slate-300 text-xs">{analysis.health}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-bold text-xs mb-2">Strategies</h4>
                          <ul className="space-y-1">
                            {analysis.strategies?.map((s, i) => (
                              <li key={i} className="text-slate-300 text-xs flex items-start gap-1">
                                <span className="text-yellow-400">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {analysis.risks && analysis.risks.length > 0 && (
                      <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-white font-bold text-xs mb-1">Risks</h4>
                            <ul className="space-y-1">
                              {analysis.risks.map((r, i) => (
                                <li key={i} className="text-red-300 text-xs flex items-start gap-1">
                                  <span className="text-red-400">•</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={analyzeGuild}
                      disabled={loading}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Refresh Analysis
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                    <p className="text-white text-sm mb-4">Get AI insights for your guild</p>
                    <Button
                      onClick={analyzeGuild}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Guild
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