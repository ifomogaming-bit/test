
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import AIMaintenanceBot from '@/components/maintenance/AIMaintenanceBot';
import GameplayMonitor from '@/components/security/GameplayMonitor';
import AISupportBot from '@/components/support/AISupportBot';
import GuildAIAdvisorButton from '@/components/guilds/GuildAIAdvisorButton';
import SoundManager from '@/components/audio/SoundManager';
import TipDeveloperButton from '@/components/support/TipDeveloperButton';
import PriceTrackingBot from '@/components/maintenance/PriceTrackingBot';
import AutoSaveManager from '@/components/progress/AutoSaveManager';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import DataValidator from '@/components/integrity/DataValidator';
import PlayerStateMonitor from '@/components/integrity/PlayerStateMonitor';
import GuildWarMonitor from '@/components/integrity/GuildWarMonitor';
import ErrorBoundary from '@/components/integrity/ErrorBoundary';
import VolatilityManager from '@/components/economy/VolatilityManager';
import NPCManager from '@/components/npc/NPCManager';
import SeasonManager from '@/components/pvp/SeasonManager';
import TournamentAutoStart from '@/components/tournaments/TournamentAutoStart';
import { 
  Home, 
  Play, 
  TrendingUp, 
  Trophy, 
  ShoppingBag, 
  User,
  Swords
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Play', icon: Play, page: 'Game' },
  { name: 'Trading', icon: TrendingUp, page: 'Trading' },
  { name: 'Options', icon: TrendingUp, page: 'Options' },
  { name: 'PvP', icon: Swords, page: 'PvP' },
  { name: 'Shop', icon: ShoppingBag, page: 'Shop' },
  { name: 'Profile', icon: User, page: 'Profile' }
];

export default function Layout({ children, currentPageName }) {
  // Hide bottom nav on certain pages for cleaner UX
  const hideNav = ['Game'].includes(currentPageName);
  const [player, setPlayer] = React.useState(null);
  const [avatar, setAvatar] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const loadPlayerData = async () => {
      const user = await base44.auth.me();
      if (user?.email && mounted) {
        const players = await base44.entities.Player.filter({ created_by: user.email });
        if (players[0] && mounted) {
          setPlayer(players[0]);
          const avatars = await base44.entities.Avatar.filter({ player_id: players[0].id });
          if (mounted) setAvatar(avatars[0]);
        }
      }
    };
    loadPlayerData();
    return () => { mounted = false; };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900">
        {/* Delayed initialization to prevent rate limits */}
        <NPCManager />
        <SeasonManager />
        <TournamentAutoStart />
        <AutoSaveManager player={player} avatar={avatar} />
        <DataValidator player={player} />
        <PlayerStateMonitor player={player} />
        <GuildWarMonitor />
        <VolatilityManager />
        <AIMaintenanceBot />
        <GameplayMonitor />
        <AISupportBot />
        <GuildAIAdvisorButton />
        <SoundManager />
        <TipDeveloperButton />
        <PriceTrackingBot />
        <NotificationCenter player={player} />
      <style>{`
        :root {
          --background: 15 23 42;
          --foreground: 248 250 252;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: rgb(var(--background));
          color: rgb(var(--foreground));
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgb(30 41 59);
        }
        ::-webkit-scrollbar-thumb {
          background: rgb(71 85 105);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139);
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.5); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
      
      {/* Main Content */}
      <main className={hideNav ? '' : 'pb-20 md:pb-0'}>
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 md:hidden">
          <div className="flex items-center justify-around py-2">
            {NAV_ITEMS.slice(0, 5).map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    isActive 
                      ? 'text-green-400 bg-green-500/10' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
      </div>
    </ErrorBoundary>
  );
}
