import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Target, Zap, Flame, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function RaidBossAttackModal({ boss, player, onComplete }) {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [attacking, setAttacking] = useState(false);
  const [result, setResult] = useState(null);

  const strategies = [
    { 
      id: 'aggressive', 
      name: 'Aggressive Strike', 
      icon: Swords,
      damage: { min: 800, max: 1500 },
      critChance: 0.25,
      description: 'High damage, 25% crit chance'
    },
    { 
      id: 'precise', 
      name: 'Precise Shot', 
      icon: Target,
      damage: { min: 1000, max: 1200 },
      critChance: 0.4,
      description: 'Consistent damage, 40% crit chance'
    },
    { 
      id: 'power', 
      name: 'Power Slam', 
      icon: Flame,
      damage: { min: 500, max: 2500 },
      critChance: 0.15,
      description: 'Huge variance, 15% crit chance'
    },
    { 
      id: 'tactical', 
      name: 'Tactical Exploit', 
      icon: Sparkles,
      damage: { min: 1100, max: 1400 },
      critChance: 0.5,
      description: 'Exploits weakness, 50% crit chance'
    }
  ];

  const executeAttack = () => {
    setAttacking(true);
    
    setTimeout(() => {
      const strategy = strategies.find(s => s.id === selectedStrategy);
      const baseDamage = Math.floor(
        Math.random() * (strategy.damage.max - strategy.damage.min) + strategy.damage.min
      );
      
      const isCrit = Math.random() < strategy.critChance;
      const finalDamage = isCrit ? baseDamage * 2 : baseDamage;

      setResult({
        damage: finalDamage,
        isCrit,
        strategy: strategy.name
      });

      setTimeout(() => {
        onComplete({
          damage: finalDamage,
          isCrit,
          strategy: selectedStrategy
        });
      }, 2000);
    }, 1500);
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          {result.isCrit && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Sparkles className="w-32 h-32 mx-auto text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,1)]" />
              <p className="text-yellow-300 text-4xl font-black mt-4">CRITICAL HIT!</p>
            </motion.div>
          )}
          
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <p className="text-orange-400 text-7xl font-black mb-4">
              {result.damage.toLocaleString()}
            </p>
            <p className="text-white text-3xl font-bold">DAMAGE!</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (attacking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Swords className="w-32 h-32 text-red-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-red-500/50">
        <div className="p-6 space-y-6">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Swords className="w-20 h-20 mx-auto mb-4 text-red-400" />
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-2">Choose Your Attack</h2>
            <p className="text-slate-400">Select a strategy to strike {boss.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy) => {
              const Icon = strategy.icon;
              const isSelected = selectedStrategy === strategy.id;
              
              return (
                <motion.div
                  key={strategy.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-red-600/40 to-orange-600/40 border-red-400 shadow-lg shadow-red-500/40'
                      : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-red-500/30' : 'bg-slate-600/30'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{strategy.name}</p>
                      <p className="text-slate-400 text-xs">{strategy.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Damage Range:</span>
                      <span className="text-orange-400 font-bold">
                        {strategy.damage.min}-{strategy.damage.max}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Crit Chance:</span>
                      <span className="text-yellow-400 font-bold">
                        {(strategy.critChance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onComplete(null)}
              variant="outline"
              className="flex-1 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={executeAttack}
              disabled={!selectedStrategy}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-lg font-black"
            >
              <Swords className="w-5 h-5 mr-2" />
              ATTACK!
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}