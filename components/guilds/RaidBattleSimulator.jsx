// Guild Raid Battle Simulator
// Simulates 3-round market-themed battles between guilds

const LOOT_CAP = 0.20; // Max 20% of defender vault
const ROUNDS = 3;
const COOLDOWN_HOURS = 24; // 1 raid per guild per day
const SHIELD_HOURS = 12;

export function computeGuildPower(guild, guildMembers, isAttacker) {
  let basePower = (guildMembers?.length || 0) * 100;
  basePower += (guild.treasury_balance || 0) / 1000;
  // Gems no longer contribute to power
  
  // Add power from stocks (simplified)
  if (guild.investment_portfolio) {
    const portfolio = typeof guild.investment_portfolio === 'string' 
      ? JSON.parse(guild.investment_portfolio) 
      : guild.investment_portfolio;
    
    Object.entries(portfolio).forEach(([ticker, data]) => {
      basePower += (data.shares || 0) * (data.price || 0) / 100;
    });
  }
  
  // Items/boosts could be added here
  return basePower;
}

export function simulateBattle(attackerGuild, defenderGuild, attackerMembers, defenderMembers) {
  const attackPower = computeGuildPower(attackerGuild, attackerMembers, true);
  const defensePower = computeGuildPower(defenderGuild, defenderMembers, false);
  
  let attackerScore = 0;
  let defenderScore = 0;
  const battleLogs = [];
  
  for (let round = 1; round <= ROUNDS; round++) {
    // Add randomness: 60-140% of base power
    const attackRoll = attackPower * (0.6 + Math.random() * 0.8);
    const defenseRoll = defensePower * (0.6 + Math.random() * 0.8);
    
    const roundWinner = attackRoll > defenseRoll ? 'attacker' : 'defender';
    if (roundWinner === 'attacker') attackerScore++;
    else defenderScore++;
    
    battleLogs.push({
      round,
      action: roundWinner === 'attacker' ? 'Hostile Takeover' : 'Market Defense',
      outcome: roundWinner === 'attacker' ? 'success' : 'blocked',
      attackRoll: Math.round(attackRoll),
      defenseRoll: Math.round(defenseRoll)
    });
  }
  
  const winner = attackerScore > defenderScore ? 'attacker' :
                 defenderScore > attackerScore ? 'defender' : 'draw';
  
  return {
    winner,
    attackerScore,
    defenderScore,
    battleLogs
  };
}

export function generateLoot(defenderGuild, winner) {
  if (winner !== 'attacker') {
    return { coinsLooted: 0, gemsLooted: 0, stocksLooted: [] };
  }
  
  const maxCoins = Math.floor((defenderGuild.treasury_balance || 0) * LOOT_CAP);
  
  const coinsLooted = Math.floor(maxCoins * (0.5 + Math.random() * 0.5));
  const gemsLooted = 0; // Gems cannot be raided
  
  // Loot random stocks
  const stocksLooted = [];
  if (defenderGuild.investment_portfolio) {
    const portfolio = typeof defenderGuild.investment_portfolio === 'string'
      ? JSON.parse(defenderGuild.investment_portfolio)
      : defenderGuild.investment_portfolio;
    
    const tickers = Object.keys(portfolio);
    const numStocksToSteal = Math.min(3, tickers.length);
    
    for (let i = 0; i < numStocksToSteal; i++) {
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      const stock = portfolio[ticker];
      const sharesToSteal = Math.max(1, Math.floor(stock.shares * 0.1 * (1 + Math.random())));
      
      stocksLooted.push({
        ticker,
        shares: sharesToSteal,
        price: stock.price
      });
    }
  }
  
  return { coinsLooted, gemsLooted, stocksLooted };
}

export function calculateRewards(winner) {
  const xpGain = winner === 'draw' ? 20 : 50;
  const trophyGain = winner === 'draw' ? 0 : 10;
  const trophyLoss = winner === 'draw' ? 0 : -5;
  
  return {
    attackerXP: winner === 'attacker' ? xpGain : (winner === 'draw' ? xpGain : 0),
    defenderXP: winner === 'defender' ? xpGain : (winner === 'draw' ? xpGain : 0),
    attackerTrophies: winner === 'attacker' ? trophyGain : trophyLoss,
    defenderTrophies: winner === 'defender' ? trophyGain : trophyLoss
  };
}

export function getCooldownEnd() {
  return new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
}

export function getShieldEnd() {
  return new Date(Date.now() + SHIELD_HOURS * 60 * 60 * 1000).toISOString();
}