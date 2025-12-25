import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from 'lucide-react';

export function getCreditTier(score) {
  if (score >= 800) return { tier: 'A+', label: 'Elite', color: 'from-green-500 to-emerald-600', icon: Shield };
  if (score >= 700) return { tier: 'A', label: 'Trustworthy', color: 'from-blue-500 to-cyan-600', icon: Shield };
  if (score >= 600) return { tier: 'B', label: 'Moderate', color: 'from-yellow-500 to-orange-500', icon: TrendingUp };
  if (score >= 500) return { tier: 'C', label: 'Risky', color: 'from-orange-500 to-red-500', icon: AlertTriangle };
  return { tier: 'D', label: 'Unreliable', color: 'from-red-600 to-red-800', icon: AlertTriangle };
}

export function getInterestRate(creditScore) {
  // Better credit = lower interest rates
  if (creditScore >= 800) return 0.05; // 5%
  if (creditScore >= 700) return 0.08; // 8%
  if (creditScore >= 600) return 0.10; // 10%
  if (creditScore >= 500) return 0.15; // 15%
  return 0.20; // 20%
}

export default function CreditScoreDisplay({ score, showDetails = true }) {
  const creditInfo = getCreditTier(score);
  const Icon = creditInfo.icon;
  const percentage = ((score - 300) / 600) * 100;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-slate-400" />
          <span className="text-slate-400 text-sm font-medium">Credit Rating</span>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${creditInfo.color} text-white text-xs font-bold`}>
          {creditInfo.tier}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-white">{Math.round(score)}</span>
          <span className="text-slate-400 text-sm">/ 900</span>
        </div>
        <p className="text-slate-400 text-sm">{creditInfo.label}</p>
      </div>

      {showDetails && (
        <>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full bg-gradient-to-r ${creditInfo.color}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-700/30 rounded px-2 py-1.5">
              <p className="text-slate-400 mb-0.5">Interest Rate</p>
              <p className="text-white font-bold">{(getInterestRate(score) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-700/30 rounded px-2 py-1.5">
              <p className="text-slate-400 mb-0.5">Max Loan</p>
              <p className="text-white font-bold">${Math.round(score * 10).toLocaleString()}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}