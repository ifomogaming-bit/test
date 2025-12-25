import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, AlertCircle } from 'lucide-react';

export default function MarketEventsBanner({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {events.map((event, index) => {
        const isPositive = event.change_percent > 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 ${
              isPositive 
                ? 'bg-green-500/10 border-green-500/50' 
                : 'bg-red-500/10 border-red-500/50'
            } flex items-center gap-3`}
          >
            <Zap className={`w-6 h-6 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">{event.sector}</span>
                <span className={`flex items-center gap-1 font-bold ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  <Icon className="w-4 h-4" />
                  {isPositive ? '+' : ''}{event.change_percent}%
                </span>
              </div>
              <p className="text-slate-300 text-sm">{event.message}</p>
            </div>
            <div className="text-slate-400 text-xs">
              Expires: {new Date(event.expires_at).toLocaleTimeString()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}