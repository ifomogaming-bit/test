import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function calculateRiskMetrics(portfolioMetrics, totalValue) {
  // Diversification Score (0-100)
  const uniqueAssets = portfolioMetrics.length;
  const maxDiversification = 20;
  const diversificationScore = Math.min((uniqueAssets / maxDiversification) * 100, 100);
  
  // Concentration Risk
  const largestHolding = portfolioMetrics.reduce((max, h) => 
    Math.max(max, h.currentValue / totalValue), 0
  );
  const concentrationRisk = largestHolding * 100;
  
  // Volatility Score (based on asset types)
  const cryptoWeight = portfolioMetrics
    .filter(h => h.isCrypto)
    .reduce((sum, h) => sum + h.currentValue, 0) / totalValue;
  const volatilityScore = cryptoWeight * 100;
  
  // Overall Risk Rating
  const riskFactors = [
    concentrationRisk > 50 ? 30 : concentrationRisk > 30 ? 20 : 10,
    volatilityScore > 40 ? 30 : volatilityScore > 20 ? 20 : 10,
    diversificationScore < 30 ? 30 : diversificationScore < 50 ? 20 : 10
  ];
  const overallRisk = riskFactors.reduce((a, b) => a + b, 0);
  
  return {
    diversificationScore,
    concentrationRisk,
    volatilityScore,
    overallRisk,
    riskLevel: overallRisk > 60 ? 'High' : overallRisk > 40 ? 'Medium' : 'Low'
  };
}

export default function RiskAnalyzer({ portfolioMetrics, totalValue }) {
  const metrics = calculateRiskMetrics(portfolioMetrics, totalValue);
  
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Overall Risk Level</span>
            <span className={`font-bold text-lg ${
              metrics.riskLevel === 'High' ? 'text-red-400' :
              metrics.riskLevel === 'Medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {metrics.riskLevel}
            </span>
          </div>
          <Progress 
            value={metrics.overallRisk} 
            className="h-3"
            indicatorClassName={
              metrics.riskLevel === 'High' ? 'bg-red-500' :
              metrics.riskLevel === 'Medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }
          />
        </div>

        {/* Diversification Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Diversification</span>
            <span className="text-white font-bold">{metrics.diversificationScore.toFixed(0)}/100</span>
          </div>
          <Progress 
            value={metrics.diversificationScore} 
            className="h-2"
            indicatorClassName="bg-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            {metrics.diversificationScore < 30 ? 'Low - Consider adding more assets' :
             metrics.diversificationScore < 60 ? 'Moderate - Good start' :
             'High - Well diversified'}
          </p>
        </div>

        {/* Concentration Risk */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Concentration Risk</span>
            <span className="text-white font-bold">{metrics.concentrationRisk.toFixed(1)}%</span>
          </div>
          <Progress 
            value={metrics.concentrationRisk} 
            className="h-2"
            indicatorClassName={metrics.concentrationRisk > 50 ? 'bg-red-500' : 'bg-orange-500'}
          />
          <p className="text-xs text-slate-500 mt-1">
            {metrics.concentrationRisk > 50 ? 'High - Largest holding dominates' :
             metrics.concentrationRisk > 30 ? 'Moderate - Watch largest positions' :
             'Low - Well balanced'}
          </p>
        </div>

        {/* Volatility */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Volatility Exposure</span>
            <span className="text-white font-bold">{metrics.volatilityScore.toFixed(1)}%</span>
          </div>
          <Progress 
            value={metrics.volatilityScore} 
            className="h-2"
            indicatorClassName="bg-purple-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            {metrics.volatilityScore > 40 ? 'High crypto exposure' :
             metrics.volatilityScore > 20 ? 'Moderate volatility' :
             'Low volatility portfolio'}
          </p>
        </div>

        {/* Risk Recommendations */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium text-sm mb-1">Recommendations</p>
              <ul className="text-blue-300/80 text-xs space-y-1">
                {metrics.concentrationRisk > 50 && <li>• Reduce largest position to below 30%</li>}
                {metrics.diversificationScore < 30 && <li>• Add 5-10 more holdings for better diversification</li>}
                {metrics.volatilityScore > 40 && <li>• Consider balancing with stable assets</li>}
                {metrics.overallRisk < 40 && <li>• Your portfolio has balanced risk exposure</li>}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}