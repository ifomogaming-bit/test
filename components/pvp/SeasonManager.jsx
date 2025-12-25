import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Auto-manage PvP seasons (30-day cycles up to season 10000)
export default function SeasonManager() {
  const queryClient = useQueryClient();

  const { data: activeSeason } = useQuery({
    queryKey: ['activePvPSeason'],
    queryFn: async () => {
      const seasons = await base44.entities.PvPSeason.filter({ status: 'active' });
      return seasons[0] || null;
    },
    refetchInterval: 300000 // Check every 5 minutes to reduce rate limits
  });

  const createSeasonMutation = useMutation({
    mutationFn: async () => {
      const allSeasons = await base44.entities.PvPSeason.list('-season_number', 1);
      const lastSeasonNumber = allSeasons[0]?.season_number || 0;
      const newSeasonNumber = lastSeasonNumber + 1;

      if (newSeasonNumber > 10000) {
        console.log('Max seasons (10000) reached');
        return null;
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30); // 30-day season

      return base44.entities.PvPSeason.create({
        season_number: newSeasonNumber,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_players: 0,
        reward_pool: {
          coins: 50000 + (newSeasonNumber * 1000),
          gems: 500 + (newSeasonNumber * 10),
          exclusive_badge: `Season ${newSeasonNumber} Champion`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activePvPSeason']);
    }
  });

  const endSeasonMutation = useMutation({
    mutationFn: async (seasonId) => {
      // Get all participants
      const participants = await base44.entities.PvPSeasonParticipation.filter({ season_id: seasonId });
      
      // Sort by rating
      const sorted = participants.sort((a, b) => b.current_rating - a.current_rating);

      // Update ranks and reward tiers
      for (let i = 0; i < sorted.length; i++) {
        const participant = sorted[i];
        const rank = i + 1;
        const percentile = (rank / sorted.length) * 100;

        let rewardTier;
        if (percentile <= 1) rewardTier = 'diamond';
        else if (percentile <= 5) rewardTier = 'platinum';
        else if (percentile <= 15) rewardTier = 'gold';
        else if (percentile <= 35) rewardTier = 'silver';
        else rewardTier = 'bronze';

        await base44.entities.PvPSeasonParticipation.update(participant.id, {
          current_rank: rank,
          reward_tier: rewardTier
        });
      }

      // Mark season as completed
      await base44.entities.PvPSeason.update(seasonId, {
        status: 'completed',
        total_players: sorted.length,
        top_player_id: sorted[0]?.player_id,
        top_rating: sorted[0]?.current_rating
      });

      return sorted[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activePvPSeason']);
      createSeasonMutation.mutate(); // Start next season
    }
  });

  // Check if season should end
  useEffect(() => {
    if (!activeSeason) {
      // No active season, create first one
      createSeasonMutation.mutate();
      return;
    }

    const now = new Date();
    const endDate = new Date(activeSeason.end_date);

    if (now >= endDate) {
      // Season ended, finalize it
      endSeasonMutation.mutate(activeSeason.id);
    }
  }, [activeSeason]);

  return null; // Background manager, no UI - manages up to 10,000 seasons with 30-day cycles
}