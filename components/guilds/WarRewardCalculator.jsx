// War reward calculation logic
export function calculateWarRewards(war, contributions = [], winner = null) {
  if (!war || !winner) return null;

  const warDuration = new Date(war.expires_at) - new Date(war.created_date);
  const durationDays = Math.ceil(warDuration / (1000 * 60 * 60 * 24));
  
  // Calculate intensity based on total challenges/contributions
  const totalChallenges = contributions.length;
  const intensityMultiplier = Math.min(1 + (totalChallenges / 50), 3); // Max 3x for high intensity
  
  // Calculate score difference percentage
  const totalScore = (war.challenger_score || 0) + (war.opponent_score || 0);
  const scoreDiff = Math.abs((war.challenger_score || 0) - (war.opponent_score || 0));
  const dominanceRatio = totalScore > 0 ? scoreDiff / totalScore : 0;
  
  // Base rewards
  const baseRewards = {
    winner: {
      currency: 15000,
      premium: 150,
      tier: 'gold'
    },
    loser: {
      currency: 5000,
      premium: 50,
      tier: 'silver'
    }
  };

  // Apply multipliers
  const durationMultiplier = Math.max(0.5, Math.min(durationDays / 7, 1.5));
  const dominanceMultiplier = 1 + (dominanceRatio * 0.5); // Up to 1.5x for dominant victory
  
  const totalMultiplier = intensityMultiplier * durationMultiplier * dominanceMultiplier;

  // Calculate final rewards
  const winnerRewards = {
    currency: Math.floor(baseRewards.winner.currency * totalMultiplier),
    premium: Math.floor(baseRewards.winner.premium * totalMultiplier),
    tier: getTierFromMultiplier(totalMultiplier),
    cosmetics: generateCosmeticRewards(totalMultiplier, true),
    powerUps: generatePowerUpRewards(totalMultiplier, true)
  };

  const loserRewards = {
    currency: Math.floor(baseRewards.loser.currency * durationMultiplier),
    premium: Math.floor(baseRewards.loser.premium * durationMultiplier),
    tier: 'bronze',
    cosmetics: generateCosmeticRewards(durationMultiplier * 0.5, false),
    powerUps: generatePowerUpRewards(durationMultiplier * 0.5, false)
  };

  return {
    winner: winnerRewards,
    loser: loserRewards,
    statistics: {
      durationDays,
      totalChallenges,
      intensityMultiplier: intensityMultiplier.toFixed(2),
      dominanceRatio: (dominanceRatio * 100).toFixed(1) + '%',
      totalMultiplier: totalMultiplier.toFixed(2)
    }
  };
}

function getTierFromMultiplier(multiplier) {
  if (multiplier >= 3.5) return 'diamond';
  if (multiplier >= 2.5) return 'platinum';
  if (multiplier >= 1.8) return 'gold';
  if (multiplier >= 1.2) return 'silver';
  return 'bronze';
}

function generateCosmeticRewards(multiplier, isWinner) {
  const rewards = [];
  
  if (multiplier >= 2.5 && isWinner) {
    rewards.push({ 
      id: 'war_victor_banner', 
      name: 'War Victor Banner',
      type: 'background',
      rarity: 'legendary'
    });
  }
  
  if (multiplier >= 2.0 && isWinner) {
    rewards.push({ 
      id: 'battle_scarred_armor', 
      name: 'Battle-Scarred Armor',
      type: 'outfit',
      rarity: 'epic'
    });
  }
  
  if (multiplier >= 1.5) {
    rewards.push({ 
      id: 'war_participant_badge', 
      name: 'War Participant Badge',
      type: 'accessory',
      rarity: isWinner ? 'rare' : 'common'
    });
  }
  
  return rewards;
}

function generatePowerUpRewards(multiplier, isWinner) {
  const rewards = [];
  
  if (multiplier >= 2.0 && isWinner) {
    rewards.push({ 
      id: 'guild_xp_boost_legendary', 
      name: 'Legendary Guild XP Boost',
      duration: 24,
      effect: 2.0
    });
  }
  
  if (multiplier >= 1.5) {
    rewards.push({ 
      id: 'trading_boost', 
      name: isWinner ? 'Elite Trading Boost' : 'Trading Boost',
      duration: isWinner ? 12 : 6,
      effect: isWinner ? 1.5 : 1.25
    });
  }
  
  return rewards;
}

// Calculate individual player rewards based on contribution
export function calculatePlayerRewardShare(totalReward, playerContribution, totalContributions) {
  if (totalContributions === 0) return 0;
  
  const baseShare = 0.3; // 30% distributed equally
  const contributionShare = 0.7; // 70% based on contribution
  
  const equalPortion = totalReward * baseShare;
  const contributionPortion = totalReward * contributionShare * (playerContribution / totalContributions);
  
  return Math.floor(equalPortion + contributionPortion);
}