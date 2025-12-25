import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Background component that updates market volatility based on market activity
export default function VolatilityManager() {
  const queryClient = useQueryClient();

  const { data: volatility } = useQuery({
    queryKey: ['marketVolatility'],
    queryFn: async () => {
      const vols = await base44.entities.MarketVolatility.list('-last_updated', 1);
      if (vols.length === 0) {
        return await base44.entities.MarketVolatility.create({
          current_index: 50,
          trend: 'stable',
          wager_difficulty_multiplier: 1.0,
          wager_reward_multiplier: 1.0,
          last_updated: new Date().toISOString()
        });
      }
      return vols[0];
    }
  });

  const updateVolatilityMutation = useMutation({
    mutationFn: async () => {
      if (!volatility) return;

      // Fetch recent market activity
      const recentWagers = await base44.entities.Wager.filter({ status: 'accepted' }, '-created_date', 20);
      const recentEvents = await base44.entities.MarketEvent.filter({ is_active: true }, '-created_date', 10);
      
      // Calculate new volatility based on activity
      let newIndex = volatility.current_index;
      
      // More wagers = higher volatility
      if (recentWagers.length > 10) {
        newIndex = Math.min(100, newIndex + 2);
      } else if (recentWagers.length < 3) {
        newIndex = Math.max(10, newIndex - 1);
      }
      
      // Market events increase volatility
      if (recentEvents.length > 5) {
        newIndex = Math.min(100, newIndex + 5);
      }
      
      // Determine trend
      let trend = 'stable';
      if (newIndex > volatility.current_index + 3) trend = 'increasing';
      if (newIndex < volatility.current_index - 3) trend = 'decreasing';
      
      // Calculate multipliers based on volatility
      // High volatility = higher difficulty and rewards
      const difficultyMultiplier = 1 + ((newIndex - 50) / 100) * 0.5; // 0.75x to 1.25x
      const rewardMultiplier = 1 + ((newIndex - 50) / 100) * 1.0; // 0.5x to 1.5x
      
      await base44.entities.MarketVolatility.update(volatility.id, {
        current_index: Math.round(newIndex),
        trend,
        wager_difficulty_multiplier: Math.max(0.75, Math.min(1.5, difficultyMultiplier)),
        wager_reward_multiplier: Math.max(0.5, Math.min(2.0, rewardMultiplier)),
        last_updated: new Date().toISOString()
      });
      
      queryClient.invalidateQueries(['marketVolatility']);
    }
  });

  useEffect(() => {
    if (!volatility) return;
    
    // Update volatility every 5 minutes to reduce rate limits
    const interval = setInterval(() => {
      updateVolatilityMutation.mutate();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [volatility?.id]);

  return null; // Background component
}