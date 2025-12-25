import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function GuildWarMonitor() {
  const { data: warIssues = [] } = useQuery({
    queryKey: ['guildWarValidation'],
    queryFn: async () => {
      const wars = await base44.entities.GuildWar.filter({ status: 'active' });
      const issues = [];
      
      wars.forEach(war => {
        // Check for valid scores
        if (typeof war.challenger_score !== 'number' || war.challenger_score < 0) {
          issues.push({
            war_id: war.id,
            issue: 'Invalid challenger score',
            severity: 'high',
            data: { score: war.challenger_score }
          });
        }
        
        if (typeof war.opponent_score !== 'number' || war.opponent_score < 0) {
          issues.push({
            war_id: war.id,
            issue: 'Invalid opponent score',
            severity: 'high',
            data: { score: war.opponent_score }
          });
        }
        
        // Check expiration date
        if (war.expires_at) {
          const expiresAt = new Date(war.expires_at);
          const now = new Date();
          const remainingMs = expiresAt - now;
          
          if (isNaN(expiresAt.getTime())) {
            issues.push({
              war_id: war.id,
              issue: 'Invalid expires_at date',
              severity: 'critical'
            });
          } else if (remainingMs < 0) {
            issues.push({
              war_id: war.id,
              issue: 'War expired but still active',
              severity: 'high',
              data: { expires_at: war.expires_at }
            });
          }
        }
        
        // Check prize pool
        if (typeof war.prize_pool !== 'number' || war.prize_pool < 0) {
          issues.push({
            war_id: war.id,
            issue: 'Invalid prize pool',
            severity: 'medium',
            data: { prize_pool: war.prize_pool }
          });
        }
      });
      
      return issues;
    },
    refetchInterval: 10000 // Check every 10 seconds
  });

  useEffect(() => {
    if (warIssues.length > 0) {
      warIssues.forEach(async (issue) => {
        await base44.entities.SystemLog.create({
          log_type: 'validation',
          severity: issue.severity,
          component: 'GuildWarMonitor',
          message: issue.issue,
          data: issue.data || { war_id: issue.war_id }
        });
      });
    }
  }, [warIssues.length]);

  return null;
}