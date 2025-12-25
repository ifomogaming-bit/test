// Badge achievement definitions and checking logic
export const BADGE_DEFINITIONS = {
  // Common badges
  first_trade: {
    id: 'first_trade',
    name: 'First Trade',
    icon: '📊',
    rarity: 'common',
    description: 'Complete your first trade',
    check: (player, portfolio, transactions) => transactions.length > 0
  },
  bubble_popper: {
    id: 'bubble_popper',
    name: 'Bubble Popper',
    icon: '🎯',
    rarity: 'common',
    description: 'Pop 100 bubbles',
    check: (player) => (player.total_bubbles_popped || 0) >= 100
  },
  guild_member: {
    id: 'guild_member',
    name: 'Guild Member',
    icon: '🏰',
    rarity: 'common',
    description: 'Join a guild',
    check: (player, portfolio, transactions, guilds) => guilds.some(g => g.player_id === player.id)
  },

  // Rare badges
  streak_master: {
    id: 'streak_master',
    name: 'Streak Master',
    icon: '⚡',
    rarity: 'rare',
    description: 'Achieve a 10-day streak',
    check: (player) => (player.longest_streak || 0) >= 10
  },
  profit_king: {
    id: 'profit_king',
    name: 'Profit King',
    icon: '💰',
    rarity: 'rare',
    description: 'Earn 100,000 coins profit from trades',
    check: (player, portfolio, transactions) => {
      const profits = transactions.filter(t => t.soft_currency_change > 0)
        .reduce((sum, t) => sum + t.soft_currency_change, 0);
      return profits >= 100000;
    }
  },
  diversified: {
    id: 'diversified',
    name: 'Diversified',
    icon: '📈',
    rarity: 'rare',
    description: 'Own 20+ different assets',
    check: (player, portfolio) => portfolio.length >= 20
  },

  // Epic badges
  millionaire: {
    id: 'millionaire',
    name: 'Millionaire',
    icon: '💵',
    rarity: 'epic',
    description: 'Reach 1,000,000 coins',
    check: (player) => (player.soft_currency || 0) >= 1000000
  },
  raid_champion: {
    id: 'raid_champion',
    name: 'Raid Champion',
    icon: '⚔️',
    rarity: 'epic',
    description: 'Win 25 guild raids',
    check: (player, portfolio, transactions, guilds, raids) => {
      const playerGuildIds = guilds.filter(g => g.player_id === player.id).map(g => g.guild_id);
      return raids.filter(r => 
        playerGuildIds.includes(r.attacker_guild_id) && r.winner === 'attacker'
      ).length >= 25;
    }
  },
  whale: {
    id: 'whale',
    name: 'Whale',
    icon: '🐋',
    rarity: 'epic',
    description: 'Hold portfolio worth 5,000,000 coins',
    check: (player, portfolio, transactions, guilds, raids, prices) => {
      const totalValue = portfolio.reduce((sum, p) => {
        const price = prices[p.ticker] || p.avg_acquisition_price;
        return sum + (p.shares * price);
      }, 0);
      return totalValue >= 5000000;
    }
  },

  // Legendary badges
  market_legend: {
    id: 'market_legend',
    name: 'Market Legend',
    icon: '👑',
    rarity: 'legendary',
    description: 'Reach level 50',
    check: (player) => (player.level || 0) >= 50
  },
  perfect_streak: {
    id: 'perfect_streak',
    name: 'Perfect Streak',
    icon: '✨',
    rarity: 'legendary',
    description: 'Achieve 30-day streak',
    check: (player) => (player.longest_streak || 0) >= 30
  },
  guild_master: {
    id: 'guild_master',
    name: 'Guild Master',
    icon: '🏆',
    rarity: 'legendary',
    description: 'Win 100 guild raids',
    check: (player, portfolio, transactions, guilds, raids) => {
      const playerGuildIds = guilds.filter(g => g.player_id === player.id).map(g => g.guild_id);
      return raids.filter(r => 
        playerGuildIds.includes(r.attacker_guild_id) && r.winner === 'attacker'
      ).length >= 100;
    }
  },
  diamond_hands: {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    icon: '💎',
    rarity: 'legendary',
    description: 'Hold a stock for 90 days with 200%+ gain',
    check: (player, portfolio, transactions, guilds, raids, prices) => {
      return portfolio.some(p => {
        const price = prices[p.ticker] || p.avg_acquisition_price;
        const gain = ((price - p.avg_acquisition_price) / p.avg_acquisition_price) * 100;
        const firstTx = transactions.find(t => t.stock_ticker === p.ticker);
        const daysSince = firstTx ? (Date.now() - new Date(firstTx.created_date).getTime()) / (1000 * 60 * 60 * 24) : 0;
        return gain >= 200 && daysSince >= 90;
      });
    }
  }
};

export function getRarityColor(rarity) {
  const colors = {
    common: 'from-slate-500 to-gray-500',
    rare: 'from-blue-500 to-cyan-500',
    epic: 'from-purple-500 to-pink-500',
    legendary: 'from-yellow-500 to-orange-500'
  };
  return colors[rarity] || colors.common;
}

export function getRarityBorder(rarity) {
  const colors = {
    common: 'border-slate-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-yellow-500/50'
  };
  return colors[rarity] || colors.common;
}