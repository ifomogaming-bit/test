import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trophy } from 'lucide-react';

export function getCurrentSeason() {
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), now.getMonth(), 1);
  seasonStart.setDate(seasonStart.getDate() + Math.floor((now.getDate() - 1) / 30) * 30);
  
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setDate(seasonEnd.getDate() + 30);
  
  const seasonId = `season-${seasonStart.getTime()}`;
  
  return {
    seasonId,
    seasonName: `Season ${seasonStart.toLocaleDateString('en', { month: 'short', year: 'numeric' })}`,
    seasonStart: seasonStart.toISOString(),
    seasonEnd: seasonEnd.toISOString()
  };
}

export default function SeasonalTimer() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const season = getCurrentSeason();
      const now = new Date();
      const end = new Date(season.seasonEnd);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Season Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const season = getCurrentSeason();

  return (
    <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-500/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-white font-bold">{season.seasonName}</p>
              <p className="text-slate-400 text-xs">30-Day Competition</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="font-bold">{timeLeft}</span>
            </div>
            <p className="text-slate-400 text-xs">Season Ends</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}