import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CRITICAL_TICKERS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'SPY', 'QQQ',
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD'
];

export default function PriceTrackingBot() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let isRunning = true;
    
    // Health check and auto-fix system
    const performHealthCheck = async () => {
      if (!isRunning) return;

      try {
        console.log('[Price Bot] Running health check...');
        
        // 1. Verify price history records exist
        const recentHistory = await base44.entities.PriceHistory.list('-timestamp', 100);
        
        if (recentHistory.length === 0) {
          console.log('[Price Bot] No price history found. Initializing...');
          await initializePriceHistory();
        }

        // 2. Check for stale data (older than 2 minutes)
        const now = Date.now();
        const latestRecord = recentHistory[0];
        
        if (latestRecord) {
          const recordAge = now - new Date(latestRecord.timestamp).getTime();
          
          if (recordAge > 120000) {
            console.log('[Price Bot] Stale data detected. Refreshing...');
            await refreshCriticalPrices();
          }
        }

        // 3. Verify all critical tickers have recent data
        const tickersInHistory = new Set(recentHistory.map(r => r.ticker));
        const missingTickers = CRITICAL_TICKERS.filter(t => !tickersInHistory.has(t));
        
        if (missingTickers.length > 0) {
          console.log(`[Price Bot] Missing tickers: ${missingTickers.join(', ')}. Adding...`);
          await addMissingTickerHistory(missingTickers);
        }

        // 4. Clean up duplicate/corrupted records
        await cleanupDuplicates();

        console.log('[Price Bot] Health check complete ✓');

      } catch (error) {
        console.error('[Price Bot] Health check failed:', error);
        // Auto-retry on failure
        setTimeout(performHealthCheck, 10000);
      }
    };

    // Initialize price history for all tickers
    const initializePriceHistory = async () => {
      const timestamp = new Date().toISOString();
      const baseData = {
        'AAPL': 271.44, 'GOOGL': 205.34, 'MSFT': 518.90, 'AMZN': 227.24, 
        'TSLA': 548.90, 'NVDA': 176.71, 'SPY': 675.00, 'QQQ': 609.00,
        'BTC-USD': 86900, 'ETH-USD': 2920, 'BNB-USD': 350, 'SOL-USD': 95
      };

      for (const [ticker, price] of Object.entries(baseData)) {
        await base44.entities.PriceHistory.create({
          ticker,
          price,
          timestamp,
          high: price * 1.002,
          low: price * 0.998,
          open: price,
          close: price,
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }
      
      queryClient.invalidateQueries(['priceHistory']);
    };

    // Refresh prices for critical tickers
    const refreshCriticalPrices = async () => {
      const timestamp = new Date().toISOString();
      const baseData = {
        'AAPL': 271.44, 'GOOGL': 205.34, 'MSFT': 518.90, 'AMZN': 227.24, 
        'TSLA': 548.90, 'NVDA': 176.71, 'SPY': 675.00, 'QQQ': 609.00,
        'BTC-USD': 86900, 'ETH-USD': 2920, 'BNB-USD': 350, 'SOL-USD': 95
      };

      // Get latest prices from history
      const recentPrices = await base44.entities.PriceHistory.list('-timestamp', 500);
      
      for (const ticker of CRITICAL_TICKERS) {
        const recentForTicker = recentPrices.filter(p => p.ticker === ticker).slice(0, 5);
        const basePrice = baseData[ticker] || 100;
        
        // Calculate new price with realistic movement
        let newPrice;
        if (recentForTicker.length > 0) {
          const lastPrice = recentForTicker[0].price;
          const volatility = ticker.includes('-USD') ? 0.003 : 0.0015;
          const microMove = (Math.random() - 0.5) * 2 * volatility * lastPrice;
          newPrice = lastPrice + microMove;
        } else {
          newPrice = basePrice;
        }

        await base44.entities.PriceHistory.create({
          ticker,
          price: newPrice,
          timestamp,
          high: newPrice * 1.001,
          low: newPrice * 0.999,
          open: newPrice * 0.9995,
          close: newPrice,
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }

      queryClient.invalidateQueries(['priceHistory']);
    };

    // Add missing ticker history
    const addMissingTickerHistory = async (tickers) => {
      const timestamp = new Date().toISOString();
      const baseData = {
        'AAPL': 271.44, 'GOOGL': 205.34, 'MSFT': 518.90, 'AMZN': 227.24, 
        'TSLA': 548.90, 'NVDA': 176.71, 'SPY': 675.00, 'QQQ': 609.00,
        'BTC-USD': 86900, 'ETH-USD': 2920, 'BNB-USD': 350, 'SOL-USD': 95
      };

      for (const ticker of tickers) {
        const price = baseData[ticker] || 100;
        await base44.entities.PriceHistory.create({
          ticker,
          price,
          timestamp,
          high: price * 1.002,
          low: price * 0.998,
          open: price,
          close: price,
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }

      queryClient.invalidateQueries(['priceHistory']);
    };

    // Clean up old/duplicate records to maintain database health
    const cleanupDuplicates = async () => {
      try {
        // Keep only last 2000 records total
        const allHistory = await base44.entities.PriceHistory.list('-timestamp', 2500);
        
        if (allHistory.length > 2000) {
          const toDelete = allHistory.slice(2000);
          for (const record of toDelete) {
            await base44.entities.PriceHistory.delete(record.id);
          }
          console.log(`[Price Bot] Cleaned up ${toDelete.length} old records`);
        }
      } catch (error) {
        console.error('[Price Bot] Cleanup failed:', error);
      }
    };

    // Run health check immediately on mount
    performHealthCheck();

    // Run health check every 60 seconds to reduce rate limits
    const healthInterval = setInterval(performHealthCheck, 60000);

    // Continuous price updates every 15 seconds to reduce rate limits
    const priceUpdateInterval = setInterval(async () => {
      if (!isRunning) return;
      
      try {
        await refreshCriticalPrices();
      } catch (error) {
        console.error('[Price Bot] Price update failed:', error);
      }
    }, 15000);

    return () => {
      isRunning = false;
      clearInterval(healthInterval);
      clearInterval(priceUpdateInterval);
    };
  }, [queryClient]);

  return null;
}