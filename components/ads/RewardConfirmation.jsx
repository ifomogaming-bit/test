import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, Trophy, Star, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RewardConfirmation({ show, rewardType, onClose, onNavigateHome }) {
  useEffect(() => {
    if (show) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [show]);

  const rewardMessages = {
    extra_spin: {
      icon: Gift,
      title: 'Extra Spin Unlocked!',
      message: 'You earned 1 bonus spin',
      color: 'from-yellow-500 to-orange-500'
    },
    extra_raid: {
      icon: Trophy,
      title: 'Extra Raid Unlocked!',
      message: 'You earned 1 bonus raid attempt',
      color: 'from-red-500 to-pink-500'
    },
    skip_cooldown: {
      icon: Sparkles,
      title: 'Cooldown Skipped!',
      message: 'Action unlocked instantly',
      color: 'from-purple-500 to-blue-500'
    }
  };

  const reward = rewardMessages[rewardType] || rewardMessages.extra_spin;
  const Icon = reward.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
              }
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`relative bg-gradient-to-br ${reward.color} p-8 rounded-3xl shadow-2xl max-w-md w-full`}
          >
            {/* Animated stars */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -top-6 -right-6"
            >
              <Star className="w-16 h-16 text-yellow-300 fill-yellow-300" />
            </motion.div>

            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 1.3, 1]
              }}
              transition={{
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -bottom-4 -left-4"
            >
              <Sparkles className="w-12 h-12 text-yellow-200" />
            </motion.div>

            <div className="text-center relative z-10">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-6 flex justify-center"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                  <Icon className="w-20 h-20 text-white drop-shadow-2xl" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black text-white mb-3 drop-shadow-lg"
              >
                {reward.title}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/90 font-bold"
              >
                {reward.message}
              </motion.p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mt-6 flex justify-center gap-2"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 360]
                    }}
                    transition={{
                      delay: i * 0.1,
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <Button 
                  onClick={() => {
                    onClose();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}