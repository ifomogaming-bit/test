/**
 * System Health Check - Hidden Monitoring
 * Validates all game systems are functioning correctly
 */

import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function SystemHealthCheck({ player }) {
  const [healthStatus, setHealthStatus] = useState({
    playerData: 'checking',
    database: 'checking',
    adMob: 'checking',
    dailyBonus: 'checking',
    lastCheck: null
  });

  useEffect(() => {
    if (!player) return;

    const runHealthCheck = async () => {
      const status = {
        playerData: 'healthy',
        database: 'healthy',
        adMob: 'healthy',
        dailyBonus: 'healthy',
        lastCheck: new Date().toISOString()
      };

      try {
        // 1. Check player data integrity
        if (!player.id || player.soft_currency === undefined) {
          status.playerData = 'error';
          console.error('[Health] Player data incomplete');
        }

        // 2. Check database connectivity
        try {
          await base44.entities.Player.filter({ id: player.id });
        } catch (error) {
          status.database = 'error';
          console.error('[Health] Database connection failed:', error);
        }

        // 3. Check AdMob integration
        const adMobAppId = 'ca-app-pub-7593264480405815~6978769407';
        const adMobUnitId = 'ca-app-pub-7593264480405815/5003342753';
        if (!window.admob && typeof document !== 'undefined') {
          console.log('[Health] AdMob SDK initializing...');
          status.adMob = 'initializing';
        }
        // Verify ad button IDs exist
        const spinBtn = document.getElementById('btn_extra_spin');
        const raidBtn = document.getElementById('btn_extra_raid');
        if (!spinBtn && !raidBtn) {
          console.warn('[Health] AdMob reward buttons not found (may be hidden)');
        }

        // 4. Check daily bonus timing
        if (player.last_daily_reset) {
          const lastReset = new Date(player.last_daily_reset);
          const now = new Date();
          const hoursSince = (now - lastReset) / (1000 * 60 * 60);
          
          if (hoursSince < 0) {
            status.dailyBonus = 'error';
            console.error('[Health] Daily bonus timestamp in future!');
          }
        }

        // 5. Check spin availability tracking
        if (player.last_scratch_card) {
          const lastSpin = new Date(player.last_scratch_card);
          const now = new Date();
          const hoursSince = (now - lastSpin) / (1000 * 60 * 60);
          
          if (hoursSince < 0) {
            console.error('[Health] Spin timestamp in future!');
          }
        }

        setHealthStatus(status);

        // Log health report in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[Health Check] System Status:', status);
          console.log('[AdMob] App ID:', adMobAppId);
          console.log('[AdMob] Reward Unit:', adMobUnitId);
        }

      } catch (error) {
        console.error('[Health] System check failed:', error);
      }
    };

    // Run health check every 2 minutes
    const interval = setInterval(runHealthCheck, 120000);
    runHealthCheck(); // Run immediately

    return () => clearInterval(interval);
  }, [player]);

  // Only show in development console
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && healthStatus.lastCheck) {
      const hasErrors = Object.values(healthStatus).some(v => v === 'error');
      if (hasErrors) {
        console.error('🔴 [System Health] ERRORS DETECTED:', healthStatus);
      } else {
        console.log('✅ [System Health] All systems operational');
      }
    }
  }, [healthStatus]);

  return null; // Hidden component
}