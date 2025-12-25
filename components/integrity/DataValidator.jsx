import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DataValidator({ player }) {
  const { data: validationIssues = [] } = useQuery({
    queryKey: ['dataValidation', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      
      const issues = [];
      
      // Validate player data
      if (typeof player.soft_currency !== 'number' || player.soft_currency < 0) {
        issues.push({
          type: 'player_currency',
          severity: 'high',
          message: 'Invalid soft currency value',
          data: { player_id: player.id, value: player.soft_currency }
        });
      }
      
      if (typeof player.premium_currency !== 'number' || player.premium_currency < 0) {
        issues.push({
          type: 'player_currency',
          severity: 'high',
          message: 'Invalid premium currency value',
          data: { player_id: player.id, value: player.premium_currency }
        });
      }
      
      if (typeof player.level !== 'number' || player.level < 1) {
        issues.push({
          type: 'player_level',
          severity: 'critical',
          message: 'Invalid player level',
          data: { player_id: player.id, level: player.level }
        });
      }
      
      // Validate portfolio
      try {
        const portfolio = await base44.entities.Portfolio.filter({ player_id: player.id });
        portfolio.forEach(holding => {
          if (typeof holding.shares !== 'number' || holding.shares < 0) {
            issues.push({
              type: 'portfolio_shares',
              severity: 'high',
              message: 'Invalid portfolio shares',
              data: { player_id: player.id, holding_id: holding.id, shares: holding.shares }
            });
          }
        });
      } catch (error) {
        issues.push({
          type: 'portfolio_validation',
          severity: 'medium',
          message: 'Failed to validate portfolio',
          data: { player_id: player.id, error: error.message }
        });
      }
      
      return issues;
    },
    enabled: !!player?.id,
    refetchInterval: 180000 // Check every 3 minutes to reduce rate limits
  });

  useEffect(() => {
    if (validationIssues.length > 0) {
      validationIssues.forEach(async (issue) => {
        await base44.entities.SystemLog.create({
          log_type: 'validation',
          severity: issue.severity,
          component: 'DataValidator',
          message: issue.message,
          data: issue.data
        });
      });
    }
  }, [validationIssues.length]);

  return null; // Silent background component
}