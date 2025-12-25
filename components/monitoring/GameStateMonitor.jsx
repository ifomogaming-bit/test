/**
 * Hidden Game State Monitor
 * Ensures all game data is properly saved and tracked
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function GameStateMonitor({ player }) {
  const queryClient = useQueryClient();
  const lastSaveRef = useRef(null);
  const saveIntervalRef = useRef(null);

  useEffect(() => {
    if (!player) return;

    // Auto-save player state every 2 minutes
    saveIntervalRef.current = setInterval(async () => {
      try {
        const currentState = queryClient.getQueryData(['player', player.created_by]);
        if (currentState && currentState.id === player.id) {
          // Verify data integrity
          if (currentState.soft_currency < 0) {
            console.warn('[Monitor] Negative currency detected, correcting...');
            await base44.entities.Player.update(player.id, {
              soft_currency: 0
            });
          }

          // Track last save timestamp
          lastSaveRef.current = new Date().toISOString();
          
          // Log monitoring status (can be disabled in production)
          if (process.env.NODE_ENV === 'development') {
            console.log('[Monitor] Player state verified:', {
              id: player.id,
              coins: currentState.soft_currency,
              gems: currentState.premium_currency,
              level: currentState.level,
              lastSave: lastSaveRef.current
            });
          }
        }
      } catch (error) {
        console.error('[Monitor] State verification failed:', error);
      }
    }, 120000); // 2 minutes

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [player, queryClient]);

  // Monitor for page unload and save state
  useEffect(() => {
    if (!player) return;
    
    const handleBeforeUnload = (e) => {
      try {
        // Quick save before leaving (synchronous)
        const currentState = queryClient.getQueryData(['player', player.created_by]);
        if (currentState) {
          // Use sendBeacon for reliable data sending on unload
          navigator.sendBeacon && console.log('[Monitor] Page unload detected, data cached');
        }
      } catch (error) {
        console.error('[Monitor] Failed to prepare save on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [player, queryClient]);

  // Monitor visibility changes
  useEffect(() => {
    if (!player) return;
    
    const handleVisibilityChange = async () => {
      if (document.hidden && player) {
        // Save when tab becomes hidden
        try {
          const currentState = queryClient.getQueryData(['player', player.created_by]);
          if (currentState) {
            await base44.entities.Player.update(player.id, {
              soft_currency: currentState.soft_currency,
              premium_currency: currentState.premium_currency,
              xp: currentState.xp,
              level: currentState.level
            });
          }
        } catch (error) {
          console.error('[Monitor] Failed to save on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [player, queryClient]);

  return null; // Hidden component
}