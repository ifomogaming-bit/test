import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Duration of guild war: 5 days in milliseconds
const GUILD_WAR_DURATION = 5 * 24 * 60 * 60 * 1000;

// Get remaining time for a guild war (in milliseconds)
function getRemainingTime(war) {
  if (!war || !war.expires_at) return GUILD_WAR_DURATION;
  const remaining = new Date(war.expires_at) - Date.now();
  return Math.max(remaining, 0);
}

// End the guild war and distribute rewards
async function endGuildWar(war, queryClient) {
  if (!war || war.status === 'completed') return;

  // Fetch war contributions
  const contributions = await base44.entities.GuildWarContribution.filter({ war_id: war.id });
  
  // Sort players by score (total points earned)
  const playerScores = {};
  contributions.forEach(c => {
    if (!playerScores[c.player_id]) {
      playerScores[c.player_id] = {
        id: c.player_id,
        name: c.player_name,
        guild_id: c.guild_id,
        score: 0
      };
    }
    playerScores[c.player_id].score += c.points_earned || 0;
  });

  const sortedPlayers = Object.values(playerScores).sort((a, b) => b.score - a.score);

  // Determine winner guild
  const winnerId = war.challenger_score > war.opponent_score 
    ? war.challenger_guild_id 
    : war.opponent_score > war.challenger_score 
    ? war.opponent_guild_id 
    : null;

  // Update war status
  await base44.entities.GuildWar.update(war.id, {
    status: 'completed',
    winner_guild_id: winnerId,
    ended_at: new Date().toISOString()
  });

  // Reward distribution based on player performance
  if (winnerId) {
    const winners = sortedPlayers.filter(p => p.guild_id === winnerId);
    const basePrizePool = war.prize_pool || 15000;
    const totalScore = winners.reduce((sum, p) => sum + p.score, 0);

    // Top 50% of winning guild get rewards
    const topCount = Math.ceil(winners.length / 2);
    const topWinners = winners.slice(0, topCount);

    for (const player of topWinners) {
      // Performance-based reward calculation
      const playerShare = totalScore > 0 
        ? (player.score / totalScore) * basePrizePool 
        : basePrizePool / topWinners.length;

      const rewardPerWinner = Math.floor(playerShare);
      
      await base44.entities.EventReward.create({
        event_id: war.id,
        event_type: 'guild_war',
        recipient_id: player.id,
        recipient_name: player.name,
        reward_coins: rewardPerWinner,
        reward_gems: Math.floor(rewardPerWinner / 100),
        reward_xp: player.score * 10,
        claimed: false
      });
    }

    // Update guilds
    const winningGuild = await base44.entities.Guild.filter({ id: winnerId });
    if (winningGuild[0]) {
      await base44.entities.Guild.update(winnerId, {
        trophies: (winningGuild[0].trophies || 0) + 500,
        guild_xp: (winningGuild[0].guild_xp || 0) + 1000
      });
    }

    const loserId = winnerId === war.challenger_guild_id ? war.opponent_guild_id : war.challenger_guild_id;
    const losingGuild = await base44.entities.Guild.filter({ id: loserId });
    if (losingGuild[0]) {
      await base44.entities.Guild.update(loserId, {
        trophies: Math.max(0, (losingGuild[0].trophies || 0) - 200)
      });
    }
  }

  // Invalidate queries
  queryClient.invalidateQueries(['guildWars']);
  queryClient.invalidateQueries(['guilds']);
  queryClient.invalidateQueries(['myGuild']);
  queryClient.invalidateQueries(['rewards']);
}

export default function WarAutoEndManager({ activeWars = [] }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Update guild wars every second
    const updateGuildWars = () => {
      activeWars.forEach(war => {
        if (war.status === 'completed') return;

        const remaining = getRemainingTime(war);

        // End war when timer hits 0
        if (remaining <= 0) {
          endGuildWar(war, queryClient);
        }
      });
    };

    // Check every second
    const interval = setInterval(updateGuildWars, 1000);
    return () => clearInterval(interval);
  }, [activeWars.length]);

  return null;
}