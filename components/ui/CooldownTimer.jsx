import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CooldownTimer({ cooldownUntil, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!cooldownUntil) return null;
      
      const endTime = new Date(cooldownUntil).getTime();
      const now = Date.now();
      const diff = endTime - now;
      
      if (diff <= 0) {
        setIsComplete(true);
        return null;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds, total: diff };
    };

    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl"
      >
        <Sparkles className="w-12 h-12 text-white mb-3 animate-pulse" />
        <h3 className="text-2xl font-bold text-white mb-2">Bubbles Ready!</h3>
        <p className="text-green-100 mb-4">New stock bubbles are waiting for you</p>
        <Button onClick={onComplete} className="bg-white text-green-700 hover:bg-white/90">
          Start Collecting
        </Button>
      </motion.div>
    );
  }

  if (!timeLeft) return null;

  const progress = cooldownUntil 
    ? 1 - (timeLeft.total / (4 * 60 * 60 * 1000)) // 4 hours cooldown
    : 0;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border border-slate-600"
    >
      <Clock className="w-12 h-12 text-blue-400 mb-3" />
      <h3 className="text-xl font-bold text-white mb-2">Cooldown Active</h3>
      <p className="text-slate-400 text-sm mb-4">New bubbles appearing in</p>
      
      {/* Timer Display */}
      <div className="flex items-center gap-4 mb-6">
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <span className="text-3xl font-bold text-slate-400">:</span>
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <span className="text-3xl font-bold text-slate-400">:</span>
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Notification Button */}
      <Button variant="outline" className="mt-4 border-slate-500 text-slate-300 hover:bg-slate-700">
        <Bell className="w-4 h-4 mr-2" />
        Notify Me
      </Button>
    </motion.div>
  );
}

function TimeUnit({ value, label }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-600">
        <span className="text-3xl font-bold text-white">{String(value).padStart(2, '0')}</span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}