import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Flame, Zap, Shield, Clock, Trophy, Swords, Target, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const BOSS_PHASES = {
  1: { name: 'Enraged', color: 'from-red-500 to-orange-500', icon: Flame },
  2: { name: 'Berserk', color: 'from-purple-500 to-pink-500', icon: Zap },
  3: { name: 'Last Stand', color: 'from-yellow-500 to-red-600', icon: Skull }
};

export default function RaidBossCard({ boss, myGuild, player, onAttack, contributions = [] }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [canAttack, setCanAttack] = useState(true);
  const [attackCooldown, setAttackCooldown] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(boss.ends_at);
      const remaining = end - now;

      if (remaining <= 0) {
        setTimeLeft('ENDED');
        return;
      }

      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [boss.ends_at]);

  useEffect(() => {
    if (attackCooldown > 0) {
      const timer = setTimeout(() => setAttackCooldown(attackCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanAttack(true);
    }
  }, [attackCooldown]);

  const healthPercent = (boss.current_health / boss.max_health) * 100;
  const phaseInfo = BOSS_PHASES[boss.phase] || BOSS_PHASES[1];
  const PhaseIcon = phaseInfo.icon;
  
  const myContribution = contributions.find(c => c.player_id === player?.id);
  const guildContributions = contributions.filter(c => c.guild_id === myGuild?.id);
  const totalGuildDamage = guildContributions.reduce((sum, c) => sum + c.damage_dealt, 0);

  const isActive = boss.status === 'active';
  const isDefeated = boss.status === 'defeated';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card className={`relative overflow-hidden border-4 ${
        isDefeated 
          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50'
          : isActive
          ? 'bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/60'
          : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600'
      }`}>
        {/* Animated background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [-50, 50, -50] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], x: [50, -50, 50] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <motion.div
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CardTitle className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 flex items-center gap-3 mb-2">
                  <Skull className="w-10 h-10 text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.8)]" />
                  {boss.name}
                </CardTitle>
              </motion.div>
              <p className="text-slate-300 text-sm md:text-base">{boss.description}</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Badge className={`bg-gradient-to-r ${phaseInfo.color} text-white font-black text-sm px-4 py-1`}>
                <PhaseIcon className="w-4 h-4 mr-1" />
                Phase {boss.phase}: {phaseInfo.name}
              </Badge>
              <Badge className="bg-purple-500/30 text-purple-300 font-bold">
                <Target className="w-3 h-3 mr-1" />
                Tier {boss.difficulty}
              </Badge>
            </div>
          </div>

          {/* Boss Health Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-300 font-bold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Boss Health
              </span>
              <span className="text-white font-black">
                {boss.current_health.toLocaleString()} / {boss.max_health.toLocaleString()}
              </span>
            </div>
            <div className="relative h-8 bg-slate-900/50 rounded-full overflow-hidden border-2 border-red-500/50">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600"
                initial={{ width: '100%' }}
                animate={{ width: `${healthPercent}%` }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
              <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {healthPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-orange-500/30">
            <span className="text-orange-300 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Remaining:
            </span>
            <motion.span
              className="text-white font-black text-lg"
              animate={isActive && healthPercent < 25 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {timeLeft}
            </motion.span>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          {/* Boss Mechanics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-xs font-bold mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Special Ability
              </p>
              <p className="text-white text-sm">{boss.special_ability}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-300 text-xs font-bold mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Weakness
              </p>
              <p className="text-white text-sm">{boss.weakness}</p>
            </div>
          </div>

          {/* My Stats */}
          {myContribution && (
            <div className="bg-blue-500/10 border-2 border-blue-500/40 rounded-lg p-4">
              <h4 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Your Contribution
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-orange-400 text-2xl font-black">{myContribution.damage_dealt.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs">Damage</p>
                </div>
                <div>
                  <p className="text-yellow-400 text-2xl font-black">{myContribution.attacks_made}</p>
                  <p className="text-slate-400 text-xs">Attacks</p>
                </div>
                <div>
                  <p className="text-red-400 text-2xl font-black">{myContribution.critical_hits}</p>
                  <p className="text-slate-400 text-xs">Crits</p>
                </div>
                <div>
                  <p className="text-green-400 text-2xl font-black">{myContribution.resources_contributed.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs">Resources</p>
                </div>
              </div>
            </div>
          )}

          {/* Guild Stats */}
          {myGuild && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-300 font-bold mb-2">Guild Total Damage: <span className="text-white">{totalGuildDamage.toLocaleString()}</span></p>
              <p className="text-slate-400 text-xs">{guildContributions.length} members contributing</p>
            </div>
          )}

          {/* Attack Button */}
          {isActive && (
            <Button
              onClick={() => {
                onAttack(boss);
                setCanAttack(false);
                setAttackCooldown(30);
              }}
              disabled={!canAttack || attackCooldown > 0}
              className={`w-full py-6 text-lg font-black ${
                canAttack 
                  ? 'bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700'
                  : 'bg-slate-700'
              }`}
            >
              {canAttack ? (
                <>
                  <Swords className="w-5 h-5 mr-2" />
                  ATTACK BOSS
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Cooldown: {attackCooldown}s
                </>
              )}
            </Button>
          )}

          {isDefeated && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-lg p-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-3 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]" />
                <p className="text-green-300 text-2xl font-black mb-2">BOSS DEFEATED!</p>
                <p className="text-emerald-300 text-sm">Rewards are being distributed...</p>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}