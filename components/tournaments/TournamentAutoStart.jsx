import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function TournamentAutoStart() {
  const queryClient = useQueryClient();

  const { data: upcomingTournaments = [] } = useQuery({
    queryKey: ['upcomingTournaments'],
    queryFn: async () => {
      return base44.entities.GuildTournament.filter({ status: 'upcoming' });
    },
    refetchInterval: 120000, // Check every 2 minutes
    staleTime: 60000
  });

  const startTournamentMutation = useMutation({
    mutationFn: async (tournamentId) => {
      await base44.entities.GuildTournament.update(tournamentId, {
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['upcomingTournaments']);
      queryClient.invalidateQueries(['guildTournaments']);
    }
  });

  const endTournamentMutation = useMutation({
    mutationFn: async (tournament) => {
      // Calculate final rankings
      const scores = tournament.tournament_type === 'custom_mini_games' 
        ? tournament.player_scores 
        : tournament.guild_scores;
      
      const sortedScores = Object.entries(scores || {})
        .sort(([, a], [, b]) => b - a);

      const topPerformers = sortedScores.slice(0, 3).map(([id, score], index) => ({
        rank: index + 1,
        [tournament.tournament_type === 'custom_mini_games' ? 'player_id' : 'guild_id']: id,
        score
      }));

      const winnerId = sortedScores[0]?.[0];

      await base44.entities.GuildTournament.update(tournament.id, {
        status: 'completed',
        winner_guild_id: winnerId,
        top_performers: topPerformers
      });

      // Award prizes to top performers
      for (const performer of topPerformers) {
        const playerId = performer.player_id || performer.guild_id;
        const rewardMultipliers = [1.0, 0.6, 0.4];
        const coinsReward = Math.floor(tournament.prize_pool * rewardMultipliers[performer.rank - 1]);
        const xpReward = Math.floor((tournament.prize_pool_xp || 1000) * rewardMultipliers[performer.rank - 1]);

        if (tournament.tournament_type === 'custom_mini_games') {
          // Player rewards
          const player = await base44.entities.Player.filter({ id: playerId });
          if (player[0]) {
            await base44.entities.Player.update(playerId, {
              soft_currency: (player[0].soft_currency || 0) + coinsReward,
              xp: (player[0].xp || 0) + xpReward
            });

            await base44.entities.Transaction.create({
              player_id: playerId,
              type: 'tournament_reward',
              description: `Tournament ${performer.rank === 1 ? 'Winner' : `#${performer.rank}`}: ${tournament.name}`,
              soft_currency_change: coinsReward
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildTournaments']);
    }
  });

  useEffect(() => {
    const checkTournaments = async () => {
      const now = new Date();
      
      for (const tournament of upcomingTournaments) {
        const startsAt = new Date(tournament.starts_at);
        
        // Auto-start if start time has passed
        if (now >= startsAt && tournament.status === 'upcoming') {
          startTournamentMutation.mutate(tournament.id);
        }
      }
    };

    if (upcomingTournaments.length > 0) {
      checkTournaments();
    }
  }, [upcomingTournaments]);

  // Check for tournaments that should end
  const { data: activeTournaments = [] } = useQuery({
    queryKey: ['activeTournamentsToEnd'],
    queryFn: async () => {
      return base44.entities.GuildTournament.filter({ status: 'active' });
    },
    refetchInterval: 300000, // Check every 5 minutes
    staleTime: 120000
  });

  useEffect(() => {
    const checkEnding = async () => {
      const now = new Date();
      
      for (const tournament of activeTournaments) {
        const endsAt = new Date(tournament.ends_at);
        
        if (now >= endsAt) {
          endTournamentMutation.mutate(tournament);
        }
      }
    };

    if (activeTournaments.length > 0) {
      checkEnding();
    }
  }, [activeTournaments]);

  return null; // Background component, no UI
}