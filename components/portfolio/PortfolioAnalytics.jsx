import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Target, TrendingUp, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function calculateRiskMetrics(portfolioMetrics, totalValue) {
  // Calculate portfolio volatility (standard deviation of returns)
  const returns = portfolioMetrics.map(h => h.gainPercent);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length || 0;
  const volatility = Math.sqrt(variance);

  // Calculate concentration risk (Herfindahl Index)
  const weights = portfolioMetrics.map(h => h.currentValue / totalValue);
  const herfindahlIndex = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
  const concentrationScore = Math.round((1 - herfindahlIndex) * 100);

  // Calculate sector diversification
  const sectors = {};
  portfolioMetrics.forEach(h => {
    const ticker = h.ticker.toUpperCase();
    let sector = 'Other';
    
    if (['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'AMD', 'INTC', 'META'].includes(ticker)) sector = 'Technology';
    else if (['JPM', 'BAC', 'GS', 'V', 'MA'].includes(ticker)) sector = 'Finance';
    else if (['TSLA', 'F', 'GM'].includes(ticker)) sector = 'Automotive';
    else if (['AMZN', 'WMT', 'TGT'].includes(ticker)) sector = 'Retail';
    else if (h.isCrypto) sector = 'Crypto';
    
    sectors[sector] = (sectors[sector] || 0) + h.currentValue;
  });

  const sectorCount = Object.keys(sectors).length;
  const sectorWeights = Object.values(sectors).map(v => v / totalValue);
  const sectorDiversity = sectorWeights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
  const diversificationScore = Math.round((1 - sectorDiversity) * 100);

  // Calculate Sharpe Ratio (simplified - assuming risk-free rate of 0.02)
  const riskFreeRate = 2;
  const excessReturn = avgReturn - riskFreeRate;
  const sharpeRatio = volatility > 0 ? (excessReturn / volatility) : 0;

  // Overall risk score (0-100, lower is better)
  const riskScore = Math.min(100, Math.round(volatility * 5 + (100 - concentrationScore) * 0.3 + (100 - diversificationScore) * 0.3));

  return {
    volatility: volatility.toFixed(2),
    concentrationScore,
    diversificationScore,
    sectorCount,
    sharpeRatio: sharpeRatio.toFixed(2),
    riskScore,
    riskLevel: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High'
  };
}

export default function PortfolioAnalytics({ portfolioMetrics, totalValue }) {
  const risk = calculateRiskMetrics(portfolioMetrics, totalValue);

  const getRiskColor = (score) => {
    if (score < 30) return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' };
    if (score < 60) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' };
    return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
  };

  const riskColors = getRiskColor(risk.riskScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Risk Score */}
      <Card className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 ${riskColors.border}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className={`w-5 h-5 ${riskColors.text}`} />
            Portfolio Risk Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className={`text-5xl font-bold ${riskColors.text} mb-2`}>
              {risk.riskScore}
            </div>
            <p className="text-slate-400 text-sm">{risk.riskLevel} Risk</p>
          </div>
          <Progress value={risk.riskScore} className="h-2" />
          <p className="text-slate-400 text-xs mt-3">
            {risk.riskLevel === 'Low' ? '✅ Well-balanced portfolio' :
             risk.riskLevel === 'Medium' ? '⚠️ Moderate risk exposure' :
             '🔴 High volatility detected'}
          </p>
        </CardContent>
      </Card>

      {/* Diversification Score */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Diversification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Asset Distribution</span>
                <span className="text-white font-bold">{risk.concentrationScore}/100</span>
              </div>
              <Progress value={risk.concentrationScore} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Sector Coverage</span>
                <span className="text-white font-bold">{risk.diversificationScore}/100</span>
              </div>
              <Progress value={risk.diversificationScore} className="h-2" />
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
              <p className="text-purple-300 text-sm">
                {risk.sectorCount} sectors • {risk.diversificationScore >= 70 ? 'Excellent' : risk.diversificationScore >= 50 ? 'Good' : 'Needs improvement'} diversification
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Volatility</span>
              <span className="text-white font-bold">{risk.volatility}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sharpe Ratio</span>
              <span className={`font-bold ${parseFloat(risk.sharpeRatio) > 1 ? 'text-green-400' : parseFloat(risk.sharpeRatio) > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {risk.sharpeRatio}
              </span>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
              <p className="text-blue-300 text-sm">
                {parseFloat(risk.sharpeRatio) > 1 ? '✨ Excellent risk-adjusted returns' :
                 parseFloat(risk.sharpeRatio) > 0 ? '📈 Positive risk-adjusted returns' :
                 '📉 Below risk-free rate'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/50 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {risk.concentrationScore < 50 && (
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-yellow-400 font-bold mb-2">⚠️ High Concentration</p>
                <p className="text-slate-300 text-sm">Consider spreading investments across more assets to reduce risk</p>
              </div>
            )}
            {risk.sectorCount < 3 && (
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                <p className="text-orange-400 font-bold mb-2">📊 Limited Sectors</p>
                <p className="text-slate-300 text-sm">Diversify into {3 - risk.sectorCount} more sector{3 - risk.sectorCount > 1 ? 's' : ''} for better balance</p>
              </div>
            )}
            {parseFloat(risk.volatility) > 20 && (
              <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                <p className="text-red-400 font-bold mb-2">📉 High Volatility</p>
                <p className="text-slate-300 text-sm">Add stable, low-volatility assets to reduce portfolio swings</p>
              </div>
            )}
            {risk.concentrationScore >= 70 && risk.sectorCount >= 4 && (
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                <p className="text-green-400 font-bold mb-2">✅ Well Diversified</p>
                <p className="text-slate-300 text-sm">Your portfolio shows excellent diversification across sectors</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}