import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function getRemainingTime(expiresAt) {
  if (!expiresAt) return 0;
  const remaining = new Date(expiresAt) - Date.now();
  return Math.max(remaining, 0);
}

function formatRemainingTime(remainingMs) {
  const seconds = Math.floor((remainingMs / 1000) % 60);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function WagerCountdownTimer({ expiresAt, createdAt }) {
  const [remainingMs, setRemainingMs] = useState(getRemainingTime(expiresAt));
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = getRemainingTime(expiresAt);
      setRemainingMs(remaining);
      setIsUrgent(remaining < 5 * 60 * 1000 && remaining > 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remainingMs <= 0) {
    return (
      <div className="flex items-center gap-1 text-red-400 font-bold text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>Expired</span>
      </div>
    );
  }

  const totalDuration = new Date(expiresAt) - new Date(createdAt);
  const progress = ((totalDuration - remainingMs) / totalDuration) * 100;

  return (
    <div className="space-y-1">
      <motion.div
        animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: isUrgent ? Infinity : 0 }}
        className={`flex items-center gap-1 font-mono font-bold text-xs ${
          isUrgent ? 'text-red-400' : 'text-cyan-400'
        }`}
      >
        <Clock className="w-3 h-3" />
        <span>{formatRemainingTime(remainingMs)}</span>
      </motion.div>
      <div className="w-full bg-slate-700 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all ${
            isUrgent ? 'bg-red-500' : 'bg-cyan-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}