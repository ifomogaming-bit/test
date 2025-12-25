// Economy balancing and tracking system
export const ECONOMY_CONFIG = {
  // Target player progression curve
  TARGET_COINS_BY_LEVEL: {
    1: 500,
    5: 2500,
    10: 8000,
    15: 20000,
    20: 50000,
    25: 120000,
    30: 300000
  },
  
  TARGET_GEMS_BY_LEVEL: {
    1: 0,
    5: 50,
    10: 150,
    15: 300,
    20: 600,
    25: 1200,
    30: 2500
  },

  // Balanced faucets (earning rates per day)
  DAILY_EARNING_RATES: {
    bubbles: { coins: 600, gems: 12 }, // 20 bubbles per day
    dailySpin: { coins: 250, gems: 8 },
    dailyLogin: { coins: 200, gems: 5 },
    quests: { coins: 400, gems: 10 },
    trading: { coins: 500, gems: 0 }, // Profit from trading
    pvp: { coins: 250, gems: 8 }
  },

  // Balanced sinks (spending)
  ITEM_BASE_PRICES: {
    // Power-ups (gems)
    double_xp_1h: 40,
    double_xp_24h: 250,
    triple_rewards_1h: 60,
    lucky_streak_30m: 80,
    instant_cooldown: 120,
    pvp_shield_1h: 60,
    stock_boost_1h: 100,
    
    // Raid items
    raid_shield_6h: 180,
    attack_power_2h: 130,
    defense_fort_2h: 130,
    loot_2x: 220,
    instant_raid_cd: 100,
    scout_24h: 80
  },

  // Loot box pricing
  LOOT_BOX_PRICES: {
    common: 8,
    rare: 18,
    legendary: 30,
    mythical: 60
  },

  // Economy health thresholds
  INFLATION_THRESHOLD: 1.3, // If average wealth > target * 1.3
  DEFLATION_THRESHOLD: 0.7  // If average wealth < target * 0.7
};

export function calculateTargetWealth(level) {
  const levels = Object.keys(ECONOMY_CONFIG.TARGET_COINS_BY_LEVEL).map(Number).sort((a, b) => a - b);
  
  let lowerLevel = levels[0];
  let upperLevel = levels[levels.length - 1];
  
  for (let i = 0; i < levels.length - 1; i++) {
    if (level >= levels[i] && level <= levels[i + 1]) {
      lowerLevel = levels[i];
      upperLevel = levels[i + 1];
      break;
    }
  }
  
  const lowerCoins = ECONOMY_CONFIG.TARGET_COINS_BY_LEVEL[lowerLevel];
  const upperCoins = ECONOMY_CONFIG.TARGET_COINS_BY_LEVEL[upperLevel];
  const lowerGems = ECONOMY_CONFIG.TARGET_GEMS_BY_LEVEL[lowerLevel];
  const upperGems = ECONOMY_CONFIG.TARGET_GEMS_BY_LEVEL[upperLevel];
  
  const ratio = (level - lowerLevel) / (upperLevel - lowerLevel);
  
  return {
    coins: Math.floor(lowerCoins + (upperCoins - lowerCoins) * ratio),
    gems: Math.floor(lowerGems + (upperGems - lowerGems) * ratio)
  };
}

export function calculateDynamicPricing(basePrice, economyHealth) {
  // Adjust prices based on economy health
  // If inflation (too much currency), increase prices
  // If deflation (too little currency), decrease prices
  
  if (economyHealth > ECONOMY_CONFIG.INFLATION_THRESHOLD) {
    return Math.floor(basePrice * 1.2); // 20% increase
  } else if (economyHealth < ECONOMY_CONFIG.DEFLATION_THRESHOLD) {
    return Math.floor(basePrice * 0.8); // 20% decrease
  }
  
  return basePrice;
}

export function getBalancedBubbleReward(rarity, streak, playerLevel) {
  const baseRewards = {
    common: { coins: 20, xp: 15, shares: 0.08 },
    rare: { coins: 50, xp: 35, shares: 0.18 },
    epic: { coins: 120, xp: 80, shares: 0.35 },
    legendary: { coins: 300, xp: 200, shares: 0.75 }
  };
  
  const reward = { ...baseRewards[rarity] };
  
  // Streak bonus (up to 2.5x at 15 streak)
  const streakMultiplier = Math.min(1 + (streak * 0.1), 2.5);
  
  // Level scaling (diminishing returns)
  const levelMultiplier = 1 + (Math.log(playerLevel + 1) * 0.2);
  
  reward.coins = Math.floor(reward.coins * streakMultiplier * levelMultiplier);
  reward.xp = Math.floor(reward.xp * streakMultiplier);
  reward.shares = Number((reward.shares * streakMultiplier).toFixed(4));
  
  return reward;
}

export function getBalancedQuestReward(difficulty, playerLevel) {
  const baseRewards = {
    easy: { coins: 100, gems: 3, xp: 60 },
    medium: { coins: 200, gems: 7, xp: 120 },
    hard: { coins: 400, gems: 15, xp: 250 }
  };
  
  const reward = { ...baseRewards[difficulty] };
  const levelMultiplier = 1 + (playerLevel * 0.06);
  
  reward.coins = Math.floor(reward.coins * levelMultiplier);
  reward.xp = Math.floor(reward.xp * levelMultiplier);
  
  return reward;
}

export function getBalancedLootBoxReward(tier) {
  const stocks = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'META', 'AMZN', 'BTC-USD', 'ETH-USD', 'SPY', 'QQQ'];
  const randomStock = stocks[Math.floor(Math.random() * stocks.length)];
  
  const powerups = [
    { id: 'double_xp_1h', name: 'Double XP (1hr)', duration: 3600, rarity: 'rare' },
    { id: 'triple_rewards_1h', name: 'Triple Rewards (1hr)', duration: 3600, rarity: 'rare' },
    { id: 'lucky_streak_30m', name: 'Lucky Streak (30min)', duration: 1800, rarity: 'rare' },
    { id: 'stock_boost_1h', name: 'Stock Boost (1hr)', duration: 3600, rarity: 'epic' },
    { id: 'pvp_shield_1h', name: 'PvP Shield (1hr)', duration: 3600, rarity: 'epic' }
  ];
  const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];

  const rewards = {
    common: [
      { type: 'coins', value: 100, weight: 30, rarity: 'common' },
      { type: 'coins', value: 250, weight: 20, rarity: 'common' },
      { type: 'xp', value: 50, weight: 25, rarity: 'common' },
      { type: 'xp', value: 100, weight: 15, rarity: 'common' },
      { type: 'gems', value: 5, weight: 8, rarity: 'rare' },
      { type: 'stock', ticker: randomStock, shares: 0.5, price: 100, weight: 2, rarity: 'rare' }
    ],
    rare: [
      { type: 'coins', value: 350, weight: 25, rarity: 'common' },
      { type: 'coins', value: 600, weight: 18, rarity: 'rare' },
      { type: 'xp', value: 150, weight: 20, rarity: 'common' },
      { type: 'xp', value: 300, weight: 12, rarity: 'rare' },
      { type: 'gems', value: 15, weight: 15, rarity: 'rare' },
      { type: 'gems', value: 25, weight: 8, rarity: 'epic' },
      { type: 'stock', ticker: randomStock, shares: 1.5, price: 100, weight: 5, rarity: 'epic' },
      { type: 'level', value: 1, weight: 2, rarity: 'legendary' },
      { type: 'powerup', ...randomPowerup, weight: 3 }
    ],
    legendary: [
      { type: 'coins', value: 1000, weight: 20, rarity: 'rare' },
      { type: 'coins', value: 2500, weight: 15, rarity: 'epic' },
      { type: 'coins', value: 5000, weight: 8, rarity: 'legendary' },
      { type: 'xp', value: 500, weight: 15, rarity: 'rare' },
      { type: 'xp', value: 1000, weight: 10, rarity: 'epic' },
      { type: 'gems', value: 40, weight: 18, rarity: 'epic' },
      { type: 'gems', value: 75, weight: 10, rarity: 'legendary' },
      { type: 'stock', ticker: randomStock, shares: 3, price: 100, weight: 10, rarity: 'epic' },
      { type: 'stock', ticker: randomStock, shares: 5, price: 100, weight: 5, rarity: 'legendary' },
      { type: 'level', value: 1, weight: 8, rarity: 'legendary' },
      { type: 'powerup', ...randomPowerup, weight: 6 }
    ],
    mythical: [
      { type: 'coins', value: 5000, weight: 15, rarity: 'legendary' },
      { type: 'coins', value: 10000, weight: 12, rarity: 'legendary' },
      { type: 'coins', value: 25000, weight: 6, rarity: 'mythical' },
      { type: 'xp', value: 2000, weight: 12, rarity: 'legendary' },
      { type: 'xp', value: 5000, weight: 8, rarity: 'mythical' },
      { type: 'gems', value: 100, weight: 20, rarity: 'legendary' },
      { type: 'gems', value: 200, weight: 12, rarity: 'mythical' },
      { type: 'gems', value: 500, weight: 4, rarity: 'mythical' },
      { type: 'stock', ticker: randomStock, shares: 10, price: 100, weight: 10, rarity: 'legendary' },
      { type: 'stock', ticker: randomStock, shares: 25, price: 100, weight: 5, rarity: 'mythical' },
      { type: 'level', value: 2, weight: 8, rarity: 'mythical' },
      { type: 'level', value: 3, weight: 3, rarity: 'mythical' },
      { type: 'powerup', ...randomPowerup, weight: 10 }
    ]
  };
  
  const pool = rewards[tier];
  const totalWeight = pool.reduce((sum, r) => sum + r.weight, 0);
  const random = Math.random() * totalWeight;
  
  let cumulative = 0;
  for (const reward of pool) {
    cumulative += reward.weight;
    if (random <= cumulative) {
      return reward;
    }
  }
  
  return pool[0];
}

export function getDailySpinRewards() {
  return [
    { label: '150 Coins', type: 'coins', amount: 150 },
    { label: '8 Gems', type: 'premium', amount: 8 },
    { label: '75 Coins', type: 'coins', amount: 75 },
    { label: '250 XP', type: 'xp', amount: 250 },
    { label: '15 Gems', type: 'premium', amount: 15 },
    { label: '200 Coins', type: 'coins', amount: 200 },
    { label: '5 Gems', type: 'premium', amount: 5 },
    { label: '150 XP', type: 'xp', amount: 150 }
  ];
}

export function getDailyLoginRewards(day) {
  const rewards = [
    { coins: 150, gems: 3, xp: 75 },   // Day 1
    { coins: 200, gems: 5, xp: 100 },  // Day 2
    { coins: 300, gems: 8, xp: 150 },  // Day 3
    { coins: 450, gems: 12, xp: 200 }, // Day 4
    { coins: 600, gems: 15, xp: 300 }, // Day 5
    { coins: 800, gems: 20, xp: 400 }, // Day 6
    { coins: 1500, gems: 35, xp: 750 } // Day 7 - Big reward
  ];
  
  return rewards[Math.min(day - 1, 6)];
}