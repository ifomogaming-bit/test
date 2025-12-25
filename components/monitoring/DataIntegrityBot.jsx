/**
 * Data Integrity Bot
 * Validates and fixes data inconsistencies automatically
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DataIntegrityBot({ player }) {
  const queryClient = useQueryClient();

  // Periodic integrity checks
  useEffect(() => {
    if (!player) return;

    const integrityCheck = async () => {
      try {
        // Check portfolio consistency
        const portfolio = await base44.entities.Portfolio.filter({ player_id: player.id });
        let totalPortfolioValue = 0;
        
        for (const holding of portfolio) {
          if (holding.shares < 0) {
            console.warn('[Integrity] Negative shares detected, fixing...');
            await base44.entities.Portfolio.update(holding.id, { shares: 0 });
          }
          totalPortfolioValue += holding.shares * (holding.avg_acquisition_price || 0);
        }

        // Verify transaction history
        const transactions = await base44.entities.Transaction.filter({ 
          player_id: player.id 
        }, '-created_date', 100);

        let calculatedBalance = 0;
        for (const tx of transactions.reverse()) {
          calculatedBalance += (tx.soft_currency_change || 0);
        }

        // Check for major discrepancies
        const discrepancy = Math.abs(calculatedBalance - (player.soft_currency || 0));
        if (discrepancy > 1000) {
          console.warn('[Integrity] Balance discrepancy detected:', discrepancy);
          // Log for admin review but don't auto-correct large discrepancies
        }

        // Verify quest progress
        const quests = await base44.entities.DailyQuest.filter({ player_id: player.id });
        for (const quest of quests) {
          if (quest.current_progress > quest.target_value && !quest.completed) {
            await base44.entities.DailyQuest.update(quest.id, {
              completed: true
            });
          }
        }

        // Verify streak logic
        if (player.last_daily_reset) {
          const lastReset = new Date(player.last_daily_reset);
          const now = new Date();
          const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
          
          if (hoursSinceReset > 48 && player.login_streak > 0) {
            // Streak should be reset
            console.log('[Integrity] Resetting expired streak');
            await base44.entities.Player.update(player.id, {
              login_streak: 0
            });
            queryClient.invalidateQueries(['player']);
          }
        }

      } catch (error) {
        console.error('[Integrity] Check failed:', error);
      }
    };

    // Run integrity check every 5 minutes
    const interval = setInterval(integrityCheck, 300000);
    integrityCheck(); // Run immediately

    return () => clearInterval(interval);
  }, [player, queryClient]);

  return null; // Hidden component
}