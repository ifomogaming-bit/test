import React, { useState, useEffect } from 'react';
import { Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ShieldCountdown({ shieldUntil }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(shieldUntil);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [shieldUntil]);

  if (!shieldUntil || new Date(shieldUntil) <= new Date()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-2 border-blue-400/50 rounded-xl p-4 shadow-lg shadow-blue-500/30"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
        </motion.div>
        <div className="flex-1">
          <p className="text-blue-300 font-bold text-sm">🛡️ Defense Shield Active</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <p className="text-white font-black text-lg">{timeLeft}</p>
          </div>
          <p className="text-blue-200 text-xs mt-1">Protected from enemy raids</p>
        </div>
      </div>
    </motion.div>
  );
}