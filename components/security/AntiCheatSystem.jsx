import { base44 } from '@/api/base44Client';

// Anti-cheat monitoring and prevention system
class AntiCheatSystem {
  constructor() {
    this.actionHistory = [];
    this.suspiciousActivity = [];
    this.rateLimit = new Map();
  }

  // Track player actions for anomaly detection
  trackAction(playerId, actionType, metadata = {}) {
    const action = {
      playerId,
      actionType,
      timestamp: Date.now(),
      metadata
    };

    this.actionHistory.push(action);
    
    // Keep only last 1000 actions
    if (this.actionHistory.length > 1000) {
      this.actionHistory.shift();
    }

    // Check for suspicious patterns
    this.detectAnomalies(playerId, actionType);
  }

  // Rate limiting to prevent spam/automation
  checkRateLimit(playerId, action, maxActions = 10, windowMs = 60000) {
    const key = `${playerId}-${action}`;
    const now = Date.now();
    
    if (!this.rateLimit.has(key)) {
      this.rateLimit.set(key, []);
    }

    const timestamps = this.rateLimit.get(key).filter(t => now - t < windowMs);
    timestamps.push(now);
    this.rateLimit.set(key, timestamps);

    if (timestamps.length > maxActions) {
      this.flagSuspiciousActivity(playerId, `Rate limit exceeded: ${action}`, {
        count: timestamps.length,
        window: windowMs
      });
      return false;
    }

    return true;
  }

  // Detect anomalous patterns
  detectAnomalies(playerId, actionType) {
    const recentActions = this.actionHistory
      .filter(a => a.playerId === playerId && Date.now() - a.timestamp < 60000);

    // Detect rapid repeated actions (bot-like behavior)
    const actionCounts = {};
    recentActions.forEach(a => {
      actionCounts[a.actionType] = (actionCounts[a.actionType] || 0) + 1;
    });

    if (actionCounts[actionType] > 20) {
      this.flagSuspiciousActivity(playerId, 'Rapid repeated actions detected', {
        actionType,
        count: actionCounts[actionType]
      });
    }

    // Detect impossible time intervals (automation)
    const sameTypeActions = recentActions
      .filter(a => a.actionType === actionType)
      .map(a => a.timestamp)
      .sort();

    if (sameTypeActions.length >= 3) {
      const intervals = [];
      for (let i = 1; i < sameTypeActions.length; i++) {
        intervals.push(sameTypeActions[i] - sameTypeActions[i - 1]);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // If actions are too consistent (< 50ms variance), likely a bot
      const variance = intervals.reduce((sum, interval) => 
        sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      if (variance < 50 && avgInterval < 500) {
        this.flagSuspiciousActivity(playerId, 'Bot-like timing patterns', {
          avgInterval,
          variance
        });
      }
    }
  }

  // Validate bubble pop rewards
  validateBubblePop(player, reward) {
    const lastBubbleTime = player.last_bubble_time ? new Date(player.last_bubble_time).getTime() : 0;
    const now = Date.now();

    // Minimum time between bubbles (prevent spam clicking)
    if (now - lastBubbleTime < 1000) {
      this.flagSuspiciousActivity(player.id, 'Bubble pop too fast', {
        timeDiff: now - lastBubbleTime
      });
      return false;
    }

    // Check cooldown enforcement
    if (player.cooldown_until) {
      const cooldownEnd = new Date(player.cooldown_until).getTime();
      if (now < cooldownEnd) {
        this.flagSuspiciousActivity(player.id, 'Playing during cooldown', {
          cooldownEnd,
          currentTime: now
        });
        return false;
      }
    }

    // Validate reward values are within acceptable ranges
    if (reward.shares > 100 || reward.coins > 10000) {
      this.flagSuspiciousActivity(player.id, 'Reward values out of range', reward);
      return false;
    }

    return true;
  }

  // Validate trading transactions
  validateTrade(player, ticker, quantity, price, action) {
    // Check rate limiting
    if (!this.checkRateLimit(player.id, 'trade', 20, 60000)) {
      return false;
    }

    // Validate trade parameters
    if (quantity <= 0 || price <= 0) {
      this.flagSuspiciousActivity(player.id, 'Invalid trade parameters', {
        ticker, quantity, price, action
      });
      return false;
    }

    // Check for unrealistic quantities
    if (quantity > 10000) {
      this.flagSuspiciousActivity(player.id, 'Unrealistic trade quantity', {
        ticker, quantity
      });
      return false;
    }

    // Validate player has sufficient funds for buy orders
    if (action === 'buy') {
      const cost = quantity * price;
      if (cost > (player.soft_currency || 0) * 1.01) { // Allow 1% margin
        this.flagSuspiciousActivity(player.id, 'Insufficient funds', {
          cost,
          balance: player.soft_currency
        });
        return false;
      }
    }

    return true;
  }

  // Flag suspicious activity for review
  flagSuspiciousActivity(playerId, reason, details) {
    const flag = {
      playerId,
      reason,
      details,
      timestamp: Date.now()
    };

    this.suspiciousActivity.push(flag);
    console.warn('[ANTI-CHEAT] Suspicious activity detected:', flag);

    // Store in database for admin review
    this.logToDatabase(flag);
  }

  // AI-based anomaly detection using LLM
  async analyzePlayerBehavior(playerId, recentActions) {
    try {
      const prompt = `Analyze this player's trading game behavior for cheating or exploitation:

Player ID: ${playerId}
Recent Actions (last 100): ${JSON.stringify(recentActions.slice(-100))}

Look for:
1. Bot-like patterns (perfect timing, repetitive actions)
2. Exploitation attempts (unusual reward values, bypassing cooldowns)
3. Price manipulation attempts
4. Suspicious trading patterns

Respond with JSON:
{
  "isSuspicious": boolean,
  "confidence": 0-100,
  "findings": ["list of specific issues"],
  "recommendation": "action to take"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            isSuspicious: { type: 'boolean' },
            confidence: { type: 'number' },
            findings: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string' }
          }
        }
      });

      return response;
    } catch (error) {
      console.error('[ANTI-CHEAT] AI analysis failed:', error);
      return null;
    }
  }

  // Log suspicious activity to database
  async logToDatabase(flag) {
    try {
      await base44.entities.Transaction.create({
        player_id: flag.playerId,
        type: 'security_flag',
        description: `[ANTI-CHEAT] ${flag.reason}`,
        soft_currency_change: 0
      });
    } catch (error) {
      console.error('[ANTI-CHEAT] Failed to log to database:', error);
    }
  }

  // Get suspicious activity report
  getSuspiciousActivityReport(playerId = null) {
    if (playerId) {
      return this.suspiciousActivity.filter(a => a.playerId === playerId);
    }
    return this.suspiciousActivity;
  }

  // Clear old history
  cleanup() {
    const oneHourAgo = Date.now() - 3600000;
    this.actionHistory = this.actionHistory.filter(a => a.timestamp > oneHourAgo);
    this.suspiciousActivity = this.suspiciousActivity.filter(a => a.timestamp > oneHourAgo);
  }
}

// Singleton instance
export const antiCheatSystem = new AntiCheatSystem();

// Cleanup old data every hour
setInterval(() => antiCheatSystem.cleanup(), 3600000);

export default antiCheatSystem;