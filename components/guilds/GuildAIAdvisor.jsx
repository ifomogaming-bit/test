import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GuildAIAdvisor({ guildTreasury, investmentProposals, guildId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeGuild = async () => {
    setLoading(true);
    
    try {
      const prompt = `Analyze this guild's treasury and investment activity:
      
Treasury Balance: $${guildTreasury?.total_balance?.toLocaleString() || 0}
Invested Amount: $${guildTreasury?.invested_amount?.toLocaleString() || 0}
Total Returns: $${guildTreasury?.total_returns?.toLocaleString() || 0}
Active Proposals: ${investmentProposals.filter(p => p.status === 'pending').length}

Provide a brief analysis with:
1. Treasury health assessment (1-2 sentences)
2. Two specific investment strategy suggestions
3. Any risk flags to watch for

Keep the response concise and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            health_assessment: { type: 'string' },
            strategies: {
              type: 'array',
              items: { type: 'string' }
            },
            risk_flags: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAnalysis({
        health_assessment: 'Treasury analysis temporarily unavailable.',
        strategies: ['Diversify holdings across sectors', 'Consider establishing emergency reserves'],
        risk_flags: ['Monitor proposal voting patterns']
      });
    }
    
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 w-full max-w-full overflow-visible">
      <CardHeader className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Guild AI Advisor</CardTitle>
              <p className="text-slate-400 text-sm">Powered by advanced market analysis</p>
            </div>
          </div>
          <Button
            onClick={analyzeGuild}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="w-full overflow-visible">
        {!analysis ? (
          <div className="text-center py-8 w-full">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-400" />
            <p className="text-slate-300 mb-4">Get AI-powered insights into your guild's treasury and investment strategy</p>
            <Button
              onClick={analyzeGuild}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Treasury Health</h4>
                  <p className="text-slate-300 text-sm mt-1">{analysis.health_assessment}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                <h4 className="text-white font-bold text-sm">Investment Strategies</h4>
              </div>
              <ul className="space-y-2">
                {analysis.strategies?.map((strategy, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-yellow-400 font-bold">{i + 1}.</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {analysis.risk_flags && analysis.risk_flags.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <h4 className="text-white font-bold text-sm">Risk Flags</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.risk_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-300 text-sm">
                      <span className="text-red-400">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}