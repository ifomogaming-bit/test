import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function PlayerStateMonitor({ player }) {
  const autoFixMutation = useMutation({
    mutationFn: async ({ playerId, fixes }) => {
      await base44.entities.Player.update(playerId, fixes);
      
      await base44.entities.SystemLog.create({
        log_type: 'auto_fix',
        severity: 'medium',
        component: 'PlayerStateMonitor',
        message: 'Auto-fixed player state issues',
        data: { player_id: playerId, fixes },
        resolved: true
      });
    }
  });

  const { data: stateChecks } = useQuery({
    queryKey: ['playerStateCheck', player?.id],
    queryFn: async () => {
      if (!player?.id) return { issues: [], fixes: {} };
      
      const issues = [];
      const fixes = {};
      
      // Check XP consistency
      const requiredXP = player.level * 1000;
      if (player.xp >= requiredXP * 1.5) {
        issues.push('XP exceeds level threshold');
        // Auto-level up could be implemented here
      }
      
      // Check credit score bounds
      if (player.credit_score < 300 || player.credit_score > 900) {
        issues.push('Credit score out of bounds');
        fixes.credit_score = Math.max(300, Math.min(900, player.credit_score || 600));
      }
      
      // Check arrays
      if (!Array.isArray(player.unlocked_maps)) {
        issues.push('Invalid unlocked_maps array');
        fixes.unlocked_maps = [1];
      }
      
      if (!Array.isArray(player.achievements)) {
        issues.push('Invalid achievements array');
        fixes.achievements = [];
      }
      
      // Check negative values
      if (player.soft_currency < 0) {
        issues.push('Negative soft currency');
        fixes.soft_currency = 0;
      }
      
      if (player.premium_currency < 0) {
        issues.push('Negative premium currency');
        fixes.premium_currency = 0;
      }
      
      return { issues, fixes };
    },
    enabled: !!player?.id,
    refetchInterval: 120000 // Check every 2 minutes to reduce rate limits
  });

  useEffect(() => {
    if (stateChecks?.issues.length > 0) {
      base44.entities.SystemLog.create({
        log_type: 'state_check',
        severity: 'high',
        component: 'PlayerStateMonitor',
        message: `Found ${stateChecks.issues.length} player state issues`,
        data: { player_id: player.id, issues: stateChecks.issues }
      });
      
      // Auto-fix if possible
      if (Object.keys(stateChecks.fixes).length > 0) {
        autoFixMutation.mutate({ playerId: player.id, fixes: stateChecks.fixes });
      }
    }
  }, [stateChecks?.issues.length]);

  return null;
}