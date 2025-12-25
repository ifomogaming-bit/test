import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Get remaining time for a guild war (in milliseconds)
function getRemainingTime(expiresAt) {
  if (!expiresAt) return 5 * 24 * 60 * 60 * 1000; // Default 5 days
  const remaining = new Date(expiresAt) - Date.now();
  return Math.max(remaining, 0);
}

// Format remaining time for display
function formatRemainingTime(remainingMs) {
  const seconds = Math.floor((remainingMs / 1000) % 60);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function WarCountdownTimer({ expiresAt, warStatus }) {
  const [remainingMs, setRemainingMs] = useState(getRemainingTime(expiresAt));
  const [isUrgent, setIsUrgent] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Update timer every second
    const updateTimer = () => {
      const remaining = getRemainingTime(expiresAt);
      setRemainingMs(remaining);
      setIsUrgent(remaining < 24 * 60 * 60 * 1000 && remaining > 0);
      forceUpdate(prev => prev + 1); // Force re-render
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (warStatus === 'completed' || remainingMs <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-400 font-bold">
        <AlertCircle className="w-4 h-4" />
        <span>War Ended</span>
      </div>
    );
  }

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: isUrgent ? Infinity : 0 }}
      className={`flex items-center gap-2 font-mono font-bold ${
        isUrgent ? 'text-red-400' : 'text-cyan-400'
      }`}
    >
      <Clock className="w-4 h-4" />
      <span>{formatRemainingTime(remainingMs)}</span>
    </motion.div>
  );
}