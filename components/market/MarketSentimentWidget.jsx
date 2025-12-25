import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  MessageSquare,
  Target,
  AlertCircle
} from 'lucide-react';

export default function MarketSentimentWidget({ ticker }) {
  const { data: sentiment } = useQuery({
    queryKey: ['sentiment', ticker],
    queryFn: async () => {
      const sentiments = await base44.entities.MarketSentiment.filter({ ticker });
      return sentiments[0] || null;
    },
    refetchInterval: 30000 // Refresh every 30s
  });

  if (!sentiment) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <p className="text-slate-400 text-sm text-center">No sentiment data available</p>
        </CardContent>
      </Card>
    );
  }

  const score = sentiment.sentiment_score || 0;
  const getSentimentLabel = () => {
    if (score >= 60) return { label: 'Very Bullish', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (score >= 20) return { label: 'Bullish', color: 'text-green-300', bgColor: 'bg-green-500/10' };
    if (score > -20) return { label: 'Neutral', color: 'text-slate-300', bgColor: 'bg-slate-500/10' };
    if (score > -60) return { label: 'Bearish', color: 'text-red-300', bgColor: 'bg-red-500/10' };
    return { label: 'Very Bearish', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const sentimentInfo = getSentimentLabel();
  const fearGreed = sentiment.fear_greed_index || 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sentiment Score */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">Overall Sentiment</span>
              <Badge className={`${sentimentInfo.bgColor} ${sentimentInfo.color} border-0`}>
                {sentimentInfo.label}
              </Badge>
            </div>
            
            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-slate-500 to-green-500"
                style={{ width: '100%' }}
              />
              <motion.div
                initial={{ left: '50%' }}
                animate={{ left: `${((score + 100) / 200) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-slate-900 shadow-lg"
              />
            </div>
            
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-red-400">Bearish</span>
              <span className="text-slate-400">{score.toFixed(0)}</span>
              <span className="text-green-400">Bullish</span>
            </div>
          </div>

          {/* Fear & Greed */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Fear & Greed Index
              </span>
              <span className={`font-bold ${fearGreed > 70 ? 'text-green-400' : fearGreed < 30 ? 'text-red-400' : 'text-yellow-400'}`}>
                {fearGreed.toFixed(0)}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${fearGreed > 70 ? 'bg-green-500' : fearGreed < 30 ? 'bg-red-500' : 'bg-yellow-500'}`}
                style={{ width: `${fearGreed}%` }}
              />
            </div>
          </div>

          {/* News & Social */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <MessageSquare className="w-4 h-4 text-blue-400 mb-1" />
              <p className="text-slate-400 text-xs">Social Volume</p>
              <p className="text-white font-bold">{sentiment.social_volume?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <Target className="w-4 h-4 text-purple-400 mb-1" />
              <p className="text-slate-400 text-xs">News Articles</p>
              <p className="text-white font-bold">{sentiment.news_count || 0}</p>
            </div>
          </div>

          {/* Trending Topics */}
          {sentiment.trending_topics && sentiment.trending_topics.length > 0 && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <p className="text-slate-400 text-xs mb-2">📊 Trending Topics</p>
              <div className="flex flex-wrap gap-2">
                {sentiment.trending_topics.slice(0, 3).map((topic, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-300">
                    {topic.slice(0, 30)}...
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Analyst Rating */}
          {sentiment.analyst_rating && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <p className="text-slate-400 text-xs mb-2">Analyst Rating</p>
              <Badge className={`${
                sentiment.analyst_rating === 'strong_buy' ? 'bg-green-500/20 text-green-400' :
                sentiment.analyst_rating === 'buy' ? 'bg-green-500/10 text-green-300' :
                sentiment.analyst_rating === 'hold' ? 'bg-yellow-500/10 text-yellow-300' :
                sentiment.analyst_rating === 'sell' ? 'bg-red-500/10 text-red-300' :
                'bg-red-500/20 text-red-400'
              }`}>
                {sentiment.analyst_rating.replace('_', ' ').toUpperCase()}
              </Badge>
              {sentiment.price_target && (
                <p className="text-white text-sm mt-2">Target: ${sentiment.price_target.toFixed(2)}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}