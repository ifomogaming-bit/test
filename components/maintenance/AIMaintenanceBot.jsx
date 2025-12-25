import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// AI Maintenance Bot - Runs silently in background
export function useAIMaintenanceBot() {
  useEffect(() => {
    // Only run in production, not during development
    if (import.meta.env.DEV) return;

    const runMaintenanceTasks = async () => {
      try {
        console.log('🤖 AI Maintenance: Starting security and integrity checks...');

        // 1. Clean up expired challenges
        const expiredChallenges = await base44.entities.PvPChallenge.filter({
          status: 'pending'
        });
        
        const now = new Date();
        for (const challenge of expiredChallenges) {
          if (challenge.expires_at && new Date(challenge.expires_at) < now) {
            await base44.entities.PvPChallenge.update(challenge.id, {
              status: 'expired'
            });
          }
        }

        // 2. Generate market events if none active
        const { getActiveMarketEvents } = await import('@/components/market/MarketEventsService');
        const activeEvents = await getActiveMarketEvents();
        
        if (activeEvents.length === 0) {
          const { triggerRandomMarketEvents } = await import('@/components/market/MarketEventGenerator');
          await triggerRandomMarketEvents();
        }

        // 3. Cleanup old transactions (keep last 1000 per player)
        const allPlayers = await base44.entities.Player.list();
        for (const player of allPlayers.slice(0, 10)) { // Process 10 at a time
          const transactions = await base44.entities.Transaction.filter({ 
            player_id: player.id 
          });
          
          if (transactions.length > 1000) {
            const sorted = transactions.sort((a, b) => 
              new Date(b.created_date) - new Date(a.created_date)
            );
            const toDelete = sorted.slice(1000);
            
            for (const tx of toDelete.slice(0, 50)) { // Delete 50 at a time
              await base44.entities.Transaction.delete(tx.id);
            }
          }
        }

        // 4. SECURITY CHECK: Validate player data integrity
        const playersToCheck = await base44.entities.Player.list('-created_date', 20);
        for (const player of playersToCheck) {
          let needsUpdate = false;
          const updates = {};

          // Ensure no negative currencies
          if (player.soft_currency < 0) {
            updates.soft_currency = 0;
            needsUpdate = true;
          }
          if (player.premium_currency < 0) {
            updates.premium_currency = 0;
            needsUpdate = true;
          }

          // Reset cooldown if stuck
          if (player.cooldown_until && new Date(player.cooldown_until) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            updates.cooldown_until = null;
            updates.bubbles_popped_today = 0;
            needsUpdate = true;
          }

          // Ensure streak is reasonable
          if (player.streak > 100) {
            updates.streak = 100;
            needsUpdate = true;
          }

          if (needsUpdate) {
            await base44.entities.Player.update(player.id, updates);
            console.log(`🔒 Security fix applied to player ${player.id}`);
          }
        }

        // 5. GAME INTEGRITY: Resolve stuck guild wars
        const activeWars = await base44.entities.GuildWar.filter({ status: 'active' });
        for (const war of activeWars) {
          if (war.ends_at && new Date(war.ends_at) < now) {
            const winner = war.challenger_score > war.opponent_score 
              ? war.challenger_guild_id 
              : war.opponent_guild_id;
            
            await base44.entities.GuildWar.update(war.id, {
              status: 'completed',
              winner_guild_id: winner
            });
            console.log(`⚔️ Auto-resolved stuck guild war: ${war.id}`);
          }
        }

        // 6. GAME INTEGRITY: Expire old wagers
        const pendingWagers = await base44.entities.Wager.filter({ status: 'open' });
        for (const wager of pendingWagers) {
          if (wager.expires_at && new Date(wager.expires_at) < now) {
            await base44.entities.Wager.update(wager.id, {
              status: 'cancelled'
            });
          }
        }

        // 7. GAME INTEGRITY: Complete expired work shifts
        const activeShifts = await base44.entities.WorkShift.filter({ status: 'in_progress' });
        for (const shift of activeShifts) {
          if (shift.completes_at && new Date(shift.completes_at) < now) {
            await base44.entities.WorkShift.update(shift.id, {
              status: 'completed'
            });
          }
        }

        // 8. GAME INTEGRITY: Update daily quest expiration
        const expiredQuests = await base44.entities.DailyQuest.list();
        for (const quest of expiredQuests) {
          if (quest.expires_at && new Date(quest.expires_at) < now && !quest.claimed) {
            // Mark old quests as expired
            await base44.entities.DailyQuest.delete(quest.id);
          }
        }

        // 9. DATA CONSISTENCY: Fix orphaned portfolio entries
        const portfolios = await base44.entities.Portfolio.list('-created_date', 50);
        for (const portfolio of portfolios) {
          if (portfolio.shares <= 0) {
            await base44.entities.Portfolio.delete(portfolio.id);
          }
        }

        // 10. ANTI-CHEAT: Check for suspicious activity patterns
        const recentTransactions = await base44.entities.Transaction.list('-created_date', 100);
        const playerActivityMap = {};
        
        for (const tx of recentTransactions) {
          if (!playerActivityMap[tx.player_id]) {
            playerActivityMap[tx.player_id] = [];
          }
          playerActivityMap[tx.player_id].push(tx);
        }

        // Flag suspicious patterns (e.g., too many transactions in short time)
        for (const [playerId, transactions] of Object.entries(playerActivityMap)) {
          if (transactions.length > 50) {
            const timeSpan = new Date(transactions[0].created_date) - new Date(transactions[transactions.length - 1].created_date);
            if (timeSpan < 60000) { // Less than 1 minute
              console.warn(`⚠️ Suspicious activity detected for player: ${playerId}`);
            }
          }
        }

        console.log('✅ AI Maintenance: All checks completed successfully');
      } catch (error) {
        console.warn('🤖 AI Maintenance: Non-critical error', error);
      }
    };

    // Run immediately on mount
    runMaintenanceTasks();

    // Run every 30 minutes
    const interval = setInterval(runMaintenanceTasks, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

// Silent background component
export default function AIMaintenanceBot() {
  useAIMaintenanceBot();
  return null;
}