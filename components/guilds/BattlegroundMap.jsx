import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Zap, Flame } from 'lucide-react';

const BATTLEGROUND_MAPS = {
  fortress: {
    name: '⚔️ The Fortress Battleground',
    theme: 'from-slate-800 via-red-950 to-slate-900',
    structures: [
      { type: 'fortress_left', x: '5%', y: '15%', color: 'from-cyan-500 to-blue-700' },
      { type: 'fortress_right', x: '85%', y: '15%', color: 'from-red-500 to-orange-700' },
      { type: 'wall_left', x: '18%', y: '35%', w: '20%', h: '40%', color: 'slate-800' },
      { type: 'wall_right', x: '62%', y: '35%', w: '20%', h: '40%', color: 'slate-800' },
      { type: 'center_field', x: '40%', y: '45%', w: '20%', h: '25%', color: 'from-yellow-900/30 to-red-900/30' },
      { type: 'battle_flag_left', x: '12%', y: '10%', color: 'cyan' },
      { type: 'battle_flag_right', x: '88%', y: '10%', color: 'red' },
      { type: 'siege_tower', x: '30%', y: '60%', color: 'from-amber-800 to-orange-900' },
      { type: 'siege_tower', x: '70%', y: '60%', color: 'from-amber-800 to-orange-900' },
      { type: 'catapult', x: '25%', y: '75%', color: 'slate-700' },
      { type: 'catapult', x: '75%', y: '75%', color: 'slate-700' }
    ]
  },
  
  volcano: {
    name: 'Volcanic Arena',
    theme: 'from-red-900 via-orange-900 to-yellow-900',
    structures: [
      { type: 'volcano', x: '50%', y: '30%', color: 'from-red-600 to-orange-600' },
      { type: 'lava', x: '20%', y: '70%', w: '60%', h: '10%', color: 'from-orange-500 to-red-600' },
      { type: 'rock', x: '15%', y: '40%', color: 'slate-800' },
      { type: 'rock', x: '85%', y: '40%', color: 'slate-800' }
    ]
  },
  
  ice: {
    name: 'Frozen Tundra',
    theme: 'from-cyan-900 via-blue-900 to-indigo-900',
    structures: [
      { type: 'crystal', x: '30%', y: '25%', color: 'from-cyan-400 to-blue-500' },
      { type: 'crystal', x: '70%', y: '25%', color: 'from-cyan-400 to-blue-500' },
      { type: 'ice', x: '50%', y: '60%', w: '40%', h: '20%', color: 'from-blue-400/30 to-cyan-400/30' }
    ]
  },
  
  forest: {
    name: 'Ancient Forest',
    theme: 'from-green-900 via-emerald-900 to-teal-900',
    structures: [
      { type: 'tree', x: '20%', y: '30%', color: 'from-green-600 to-emerald-700' },
      { type: 'tree', x: '40%', y: '50%', color: 'from-green-700 to-emerald-800' },
      { type: 'tree', x: '60%', y: '35%', color: 'from-green-600 to-emerald-700' },
      { type: 'tree', x: '80%', y: '55%', color: 'from-green-700 to-emerald-800' }
    ]
  },
  
  desert: {
    name: 'Desert Ruins',
    theme: 'from-yellow-800 via-amber-900 to-orange-900',
    structures: [
      { type: 'pyramid', x: '25%', y: '35%', color: 'from-amber-600 to-yellow-700' },
      { type: 'pyramid', x: '75%', y: '35%', color: 'from-amber-600 to-yellow-700' },
      { type: 'dune', x: '50%', y: '65%', w: '50%', h: '15%', color: 'from-amber-700/50 to-yellow-800/50' }
    ]
  },
  
  space: {
    name: 'Cosmic Battlefield',
    theme: 'from-purple-950 via-indigo-950 to-violet-950',
    structures: [
      { type: 'planet', x: '80%', y: '20%', color: 'from-purple-500 to-pink-600' },
      { type: 'asteroid', x: '20%', y: '40%', color: 'slate-700' },
      { type: 'asteroid', x: '70%', y: '60%', color: 'slate-600' },
      { type: 'star', x: '40%', y: '25%', color: 'from-yellow-300 to-orange-400' }
    ]
  }
};

export default function BattlegroundMap({ mapType = 'fortress', showOverlay = true, inBattle = false }) {
  const map = BATTLEGROUND_MAPS[mapType] || BATTLEGROUND_MAPS.fortress;
  const [lightning, setLightning] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [projectiles, setProjectiles] = useState([]);

  // Create lightning effects during battle
  useEffect(() => {
    if (!inBattle) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLightning(prev => [...prev, { id: Date.now(), x: Math.random() * 100, y: Math.random() * 60 }]);
        setTimeout(() => setLightning(prev => prev.slice(1)), 500);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [inBattle]);

  // Create explosion effects
  useEffect(() => {
    if (!inBattle) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setExplosions(prev => [...prev, { id: Date.now(), x: Math.random() * 100, y: Math.random() * 80 }]);
        setTimeout(() => setExplosions(prev => prev.slice(1)), 800);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [inBattle]);

  // Create flying projectiles (fireballs/catapult shots)
  useEffect(() => {
    const interval = setInterval(() => {
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? 10 : 90;
      const endX = fromLeft ? 90 : 10;
      const startY = 20 + Math.random() * 20;
      const endY = 40 + Math.random() * 30;
      const type = Math.random() > 0.5 ? 'fireball' : 'rock';
      
      const projectile = {
        id: Date.now() + Math.random(),
        startX,
        endX,
        startY,
        endY,
        type,
        fromLeft
      };
      
      setProjectiles(prev => [...prev, projectile]);
      setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== projectile.id)), 2000);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border-4 border-red-600/60 shadow-2xl shadow-red-500/40">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${map.theme}`}>
        {/* War smoke/fog effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        {/* Enhanced animated background particles - Embers & Sparks */}
        <div className="absolute inset-0">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${i % 3 === 0 ? 'bg-orange-500/60' : i % 3 === 1 ? 'bg-red-500/50' : 'bg-yellow-400/40'}`}
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`
              }}
              initial={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`,
                scale: Math.random() * 2
              }}
              animate={{
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                x: [`${Math.random() * 100}%`, `${(Math.random() * 100)}%`],
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 2.5, 0.5]
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Battle smoke clouds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`smoke-${i}`}
            className="absolute w-40 h-40 rounded-full bg-gradient-radial from-slate-600/30 via-slate-800/20 to-transparent blur-2xl"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 10}%`
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 2
            }}
          />
        ))}

        {/* Energy waves during battle */}
        {inBattle && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}
      </div>

      {/* War atmosphere - cracks and damage */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="cracks" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M20,10 L25,30 L30,15 M60,40 L65,70 L70,50 M40,60 L45,85 L48,65" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cracks)" />
        </svg>
      </div>

      {/* Map structures */}
      <div className="absolute inset-0">
        {map.structures.map((structure, idx) => (
          <motion.div
            key={idx}
            className="absolute"
            style={{
              left: structure.x,
              top: structure.y,
              width: structure.w || 'auto',
              height: structure.h || 'auto'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1, type: 'spring' }}
          >
            {structure.type === 'fortress_left' && (
              <motion.div 
                className="relative"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Main fortress tower */}
                <div className={`w-28 h-40 bg-gradient-to-b ${structure.color} rounded-t-3xl shadow-2xl border-4 border-cyan-400/80 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Window lights */}
                  <motion.div 
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-cyan-300 rounded-full"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute top-14 left-1/4 w-3 h-3 bg-cyan-400/80 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div 
                    className="absolute top-14 right-1/4 w-3 h-3 bg-cyan-400/80 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                  />
                  
                  {/* Battlements */}
                  <div className="absolute top-0 w-full flex justify-around px-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-4 h-5 bg-slate-700 border border-cyan-400/40" />
                    ))}
                  </div>
                  
                  <div className="w-full h-6 bg-slate-900/70 absolute bottom-12" />
                  <div className="absolute bottom-0 w-full h-12 bg-gradient-to-b from-transparent to-cyan-500/40" />
                  <Shield className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </div>
                
                {/* Tower spire */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-16 bg-gradient-to-b from-cyan-600 to-cyan-500 border-2 border-cyan-300 shadow-lg shadow-cyan-500/60" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-yellow-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}

            {structure.type === 'fortress_right' && (
              <motion.div 
                className="relative"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              >
                {/* Main fortress tower */}
                <div className={`w-28 h-40 bg-gradient-to-b ${structure.color} rounded-t-3xl shadow-2xl border-4 border-red-400/80 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Window lights */}
                  <motion.div 
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-300 rounded-full"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute top-14 left-1/4 w-3 h-3 bg-red-400/80 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.div 
                    className="absolute top-14 right-1/4 w-3 h-3 bg-red-400/80 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  />
                  
                  {/* Battlements */}
                  <div className="absolute top-0 w-full flex justify-around px-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-4 h-5 bg-slate-700 border border-red-400/40" />
                    ))}
                  </div>
                  
                  <div className="w-full h-6 bg-slate-900/70 absolute bottom-12" />
                  <div className="absolute bottom-0 w-full h-12 bg-gradient-to-b from-transparent to-red-500/40" />
                  <Shield className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 text-red-200 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
                </div>
                
                {/* Tower spire */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-16 bg-gradient-to-b from-red-600 to-red-500 border-2 border-red-300 shadow-lg shadow-red-500/60" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-orange-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}

            {structure.type === 'wall_left' && (
              <div className={`bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600 rounded-lg relative shadow-xl`} 
                   style={{ width: structure.w, height: structure.h }}>
                <div className="absolute inset-0 opacity-50" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)',
                  backgroundSize: '20px 100%'
                }} />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="absolute w-2 h-2 bg-cyan-500/40 rounded-full" 
                       style={{ top: `${20 + i * 15}%`, left: '50%' }} />
                ))}
              </div>
            )}

            {structure.type === 'wall_right' && (
              <div className={`bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600 rounded-lg relative shadow-xl`} 
                   style={{ width: structure.w, height: structure.h }}>
                <div className="absolute inset-0 opacity-50" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)',
                  backgroundSize: '20px 100%'
                }} />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="absolute w-2 h-2 bg-red-500/40 rounded-full" 
                       style={{ top: `${20 + i * 15}%`, left: '50%' }} />
                ))}
              </div>
            )}

            {structure.type === 'center_field' && (
              <div className={`bg-gradient-to-br ${structure.color} rounded-2xl border-2 border-yellow-600/40 relative overflow-hidden`}
                   style={{ width: structure.w, height: structure.h }}>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-red-500/20"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <Swords className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-yellow-500/40" />
              </div>
            )}

            {structure.type === 'battle_flag_left' && (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-1 h-16 bg-slate-700" />
                <div className={`w-8 h-6 bg-${structure.color}-500 -mt-12 ml-1 border-2 border-${structure.color}-400 shadow-lg`} />
              </motion.div>
            )}

            {structure.type === 'battle_flag_right' && (
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-1 h-16 bg-slate-700" />
                <div className={`w-8 h-6 bg-${structure.color}-500 -mt-12 ml-1 border-2 border-${structure.color}-400 shadow-lg`} />
              </motion.div>
            )}

            {structure.type === 'siege_tower' && (
              <motion.div 
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
              >
                <div className={`w-12 h-20 bg-gradient-to-b ${structure.color} border-2 border-amber-700 rounded-t-lg shadow-xl relative`}>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-slate-900/70 rounded" />
                  <div className="absolute bottom-2 left-0 right-0 h-1 bg-amber-600" />
                </div>
              </motion.div>
            )}

            {structure.type === 'catapult' && (
              <motion.div
                animate={{ rotate: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: idx * 0.3 }}
              >
                <div className={`w-10 h-8 bg-${structure.color} border-2 border-slate-600 rounded relative`}>
                  <div className="absolute -top-3 right-1 w-1 h-6 bg-amber-800 origin-bottom rotate-45" />
                  <div className="absolute -top-4 right-0 w-3 h-3 bg-slate-600 rounded-full" />
                </div>
              </motion.div>
            )}
            
            {structure.type === 'tower' && (
              <div className={`w-8 h-16 rounded-t-lg bg-gradient-to-b ${structure.color} shadow-lg border border-white/20`}>
                <div className="w-full h-3 bg-slate-900/50 mt-8" />
              </div>
            )}
            
            {structure.type === 'wall' && (
              <div className={`bg-${structure.color} border-2 border-slate-600 rounded`} 
                   style={{ width: structure.w, height: structure.h }} />
            )}
            
            {structure.type === 'gate' && (
              <div className={`w-12 h-16 rounded-t-2xl bg-gradient-to-b ${structure.color} border-2 border-amber-400/50 shadow-xl`}>
                <div className="w-full h-2 bg-slate-900/70 mt-6" />
              </div>
            )}
            
            {structure.type === 'volcano' && (
              <div className="relative">
                <div className={`w-20 h-16 bg-gradient-to-b ${structure.color} rounded-b-full`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500/50 rounded-full blur-xl animate-pulse" />
                </div>
              </div>
            )}
            
            {structure.type === 'lava' && (
              <div className={`bg-gradient-to-r ${structure.color} animate-pulse rounded-lg opacity-80`}
                   style={{ width: structure.w, height: structure.h }} />
            )}
            
            {structure.type === 'rock' && (
              <div className={`w-10 h-8 bg-${structure.color} rounded-lg transform rotate-12`} />
            )}
            
            {structure.type === 'crystal' && (
              <div className={`w-8 h-12 bg-gradient-to-b ${structure.color} clip-polygon shadow-lg`}
                   style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            )}
            
            {structure.type === 'ice' && (
              <div className={`bg-gradient-to-br ${structure.color} backdrop-blur-sm border border-cyan-300/30 rounded-2xl`}
                   style={{ width: structure.w, height: structure.h }} />
            )}
            
            {structure.type === 'tree' && (
              <div className="relative">
                <div className="w-2 h-8 bg-amber-900 mx-auto" />
                <div className={`w-10 h-10 bg-gradient-to-b ${structure.color} rounded-full -mt-6`} />
              </div>
            )}
            
            {structure.type === 'pyramid' && (
              <div className={`w-16 h-16 bg-gradient-to-b ${structure.color}`}
                   style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
            )}
            
            {structure.type === 'dune' && (
              <div className={`bg-gradient-to-r ${structure.color} rounded-full`}
                   style={{ width: structure.w, height: structure.h }} />
            )}
            
            {structure.type === 'planet' && (
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${structure.color} shadow-2xl border border-white/20`}>
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl" />
              </div>
            )}
            
            {structure.type === 'asteroid' && (
              <div className={`w-6 h-6 rounded-lg bg-${structure.color} transform rotate-45`} />
            )}
            
            {structure.type === 'star' && (
              <div className={`w-4 h-4 bg-gradient-to-br ${structure.color} rounded-full`}>
                <div className="absolute inset-0 bg-yellow-300/50 rounded-full blur-lg animate-pulse" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightning effects */}
      <AnimatePresence>
        {lightning.map(bolt => (
          <motion.div
            key={bolt.id}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 1, 0], scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute w-1 h-32 bg-gradient-to-b from-yellow-200 via-yellow-400 to-transparent"
            style={{ left: `${bolt.x}%`, top: `${bolt.y}%`, filter: 'drop-shadow(0 0 10px #fbbf24)' }}
          >
            <div className="absolute inset-0 bg-white/80 blur-sm" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Explosion effects */}
      <AnimatePresence>
        {explosions.map(exp => (
          <motion.div
            key={exp.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 2, 3],
              opacity: [1, 0.6, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute w-16 h-16 rounded-full"
            style={{ left: `${exp.x}%`, top: `${exp.y}%` }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-orange-500 via-red-500 to-transparent rounded-full" />
            <div className="absolute inset-0 bg-gradient-radial from-yellow-300 via-transparent to-transparent rounded-full blur-xl" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Flying Projectiles - Fireballs and Catapult Rocks */}
      <AnimatePresence>
        {projectiles.map(proj => (
          <motion.div
            key={proj.id}
            initial={{ 
              left: `${proj.startX}%`, 
              top: `${proj.startY}%`,
              scale: 0,
              opacity: 0
            }}
            animate={{ 
              left: `${proj.endX}%`, 
              top: `${proj.endY}%`,
              scale: [0, 1, 1, 0.5],
              opacity: [0, 1, 1, 0],
              rotate: proj.fromLeft ? [0, 360] : [0, -360]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 2,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="absolute z-20"
          >
            {proj.type === 'fireball' ? (
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 shadow-2xl"
                  style={{ 
                    boxShadow: '0 0 30px rgba(249,115,22,0.9), 0 0 60px rgba(239,68,68,0.6)' 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-transparent rounded-full blur-sm" />
                </motion.div>
                {/* Fire trail */}
                <motion.div
                  className="absolute -z-10 w-12 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-transparent blur-md"
                  style={{ left: proj.fromLeft ? '-12px' : 'auto', right: proj.fromLeft ? 'auto' : '-12px', top: '10px' }}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border-2 border-slate-500 shadow-xl" />
                {/* Smoke trail */}
                <motion.div
                  className="absolute -z-10 w-8 h-1 bg-gradient-to-r from-slate-500 via-slate-600 to-transparent blur-sm opacity-60"
                  style={{ left: proj.fromLeft ? '-8px' : 'auto', right: proj.fromLeft ? 'auto' : '-8px', top: '8px' }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Glowing orbs floating around */}
      {inBattle && [...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"
          style={{ 
            left: `${20 + i * 15}%`,
            top: '50%',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)'
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Battle intensity overlay */}
      {inBattle && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-transparent to-yellow-600/30 pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Map name overlay */}
      {showOverlay && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <motion.div 
            className="px-4 py-2 bg-black/80 backdrop-blur-md rounded-lg border-2 border-orange-500/50 shadow-xl shadow-orange-500/30"
            animate={{ 
              boxShadow: ['0 0 20px rgba(249,115,22,0.3)', '0 0 40px rgba(249,115,22,0.6)', '0 0 20px rgba(249,115,22,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300 font-black text-sm sm:text-base flex items-center gap-2">
              {inBattle && <Swords className="w-5 h-5 text-red-400 animate-pulse" />}
              {map.name}
            </p>
          </motion.div>
          {inBattle && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0
              }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <motion.div
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 backdrop-blur-sm rounded-lg border-2 border-yellow-400/70 shadow-2xl shadow-red-500/60"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(239,68,68,0.6)',
                    '0 0 40px rgba(249,115,22,0.9)',
                    '0 0 20px rgba(239,68,68,0.6)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <p className="text-white font-black text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 animate-pulse" />
                  ⚔️ BATTLE RAGING ⚔️
                  <Flame className="w-4 h-4 animate-pulse" />
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

export { BATTLEGROUND_MAPS };