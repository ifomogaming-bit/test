import { motion } from 'framer-motion';
import { ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function NewsCard({ article, index }) {
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="block p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800/70 transition-all group"
    >
      <div className="flex gap-4">
        {article.image && (
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-700">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>
            <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <p className="text-slate-400 text-xs line-clamp-2 mb-3">
            {article.summary}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {article.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeSince(article.publishedAt)}
            </span>
            {article.ticker && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                {article.ticker}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.a>
  );
}