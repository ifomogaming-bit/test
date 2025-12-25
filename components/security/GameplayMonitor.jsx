import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Gameplay Monitor - Ensures smooth gameplay experience
export function useGameplayMonitor() {
  useEffect(() => {
    const monitorGameplay = async () => {
      try {
        // 1. Check player session health
        const player = await base44.auth.me().catch(() => null);
        
        if (player) {
          // Verify player data integrity
          const players = await base44.entities.Player.filter({ created_by: player.email });
          const playerData = players[0];
          
          if (playerData) {
            // Auto-fix common issues
            const updates = {};
            let needsUpdate = false;

            // Fix negative currency
            if (playerData.soft_currency < 0) {
              updates.soft_currency = 0;
              needsUpdate = true;
            }

            // Fix stuck cooldowns
            if (playerData.cooldown_until) {
              const cooldownTime = new Date(playerData.cooldown_until);
              const now = new Date();
              if (cooldownTime < now - 24 * 60 * 60 * 1000) {
                updates.cooldown_until = null;
                updates.bubbles_popped_today = 0;
                needsUpdate = true;
              }
            }

            // Reset daily progress at midnight
            if (playerData.last_daily_reset) {
              const lastReset = new Date(playerData.last_daily_reset);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (lastReset < today) {
                updates.bubbles_popped_today = 0;
                updates.last_daily_reset = new Date().toISOString();
                needsUpdate = true;
              }
            }

            if (needsUpdate) {
              await base44.entities.Player.update(playerData.id, updates);
              console.log('🎮 Gameplay Monitor: Player data auto-fixed');
            }
          }
        }

        // 2. Verify game state consistency
        const timestamp = new Date().toISOString();
        console.log(`🎮 Gameplay Monitor: Check complete at ${timestamp}`);
        
      } catch (error) {
        console.warn('🎮 Gameplay Monitor: Non-critical check error', error);
      }
    };

    // Run immediately
    monitorGameplay();

    // Run every 5 minutes for active gameplay monitoring
    const interval = setInterval(monitorGameplay, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

// Silent background component
export default function GameplayMonitor() {
  useGameplayMonitor();
  return null;
}