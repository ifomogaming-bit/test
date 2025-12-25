import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

/**
 * General-purpose ad reward buttons for skipping cooldowns
 * Each button has a unique ID for AdMob integration
 */

export function ExtraSpinButton({ className = "" }) {
  return (
    <Button
      id="btn_extra_spin"
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${className}`}
    >
      <Play className="w-4 h-4 mr-2" />
      Watch Ad for Extra Spin
    </Button>
  );
}

export function ExtraRaidButton({ className = "" }) {
  return (
    <Button
      id="btn_extra_raid"
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${className}`}
    >
      <Play className="w-4 h-4 mr-2" />
      Watch Ad for Extra Raid
    </Button>
  );
}

export function SkipCooldownButton({ className = "", label = "Skip Cooldown" }) {
  return (
    <Button
      id="btn_skip_cooldown"
      className={`bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 ${className}`}
    >
      <Play className="w-4 h-4 mr-2" />
      Watch Ad to {label}
    </Button>
  );
}

export default {
  ExtraSpinButton,
  ExtraRaidButton,
  SkipCooldownButton
};