import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function AutoSaveManager({ player, avatar }) {
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const lastSavedData = useRef({ player: null, avatar: null });
  const saveTimeoutRef = useRef(null);

  const autoSaveMutation = useMutation({
    mutationFn: async ({ playerData, avatarData }) => {
      const promises = [];
      
      // Save player data if changed
      if (playerData && player?.id) {
        promises.push(base44.entities.Player.update(player.id, playerData));
      }
      
      // Save avatar data if changed
      if (avatarData && avatar?.id) {
        promises.push(base44.entities.Avatar.update(avatar.id, avatarData));
      } else if (avatarData && player?.id && !avatar?.id) {
        promises.push(base44.entities.Avatar.create({
          player_id: player.id,
          ...avatarData
        }));
      }
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
    }
  });

  // Auto-save effect
  useEffect(() => {
    if (!player) return;

    // Clear any pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Check if data has changed
    const playerChanged = JSON.stringify(player) !== JSON.stringify(lastSavedData.current.player);
    const avatarChanged = JSON.stringify(avatar) !== JSON.stringify(lastSavedData.current.avatar);

    if (playerChanged || avatarChanged) {
      // Save after 3 seconds of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        const dataToSave = {};
        
        if (playerChanged) {
          dataToSave.playerData = {
            username: player.username,
            level: player.level,
            xp: player.xp,
            soft_currency: player.soft_currency,
            premium_currency: player.premium_currency,
            streak: player.streak,
            longest_streak: player.longest_streak,
            total_bubbles_popped: player.total_bubbles_popped,
            pvp_rating: player.pvp_rating,
            pvp_wins: player.pvp_wins,
            pvp_losses: player.pvp_losses
          };
          lastSavedData.current.player = player;
        }

        if (avatarChanged && avatar) {
          dataToSave.avatarData = {
            avatar_type: avatar.avatar_type,
            skin_color: avatar.skin_color,
            hair_style: avatar.hair_style,
            hair_color: avatar.hair_color,
            eye_color: avatar.eye_color,
            outfit_id: avatar.outfit_id
          };
          lastSavedData.current.avatar = avatar;
        }

        if (Object.keys(dataToSave).length > 0) {
          autoSaveMutation.mutate(dataToSave);
        }
      }, 3000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [player, avatar]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Immediate save before leaving
      if (player?.id) {
        const dataToSave = {};
        
        if (JSON.stringify(player) !== JSON.stringify(lastSavedData.current.player)) {
          dataToSave.playerData = {
            username: player.username,
            level: player.level,
            xp: player.xp,
            soft_currency: player.soft_currency,
            premium_currency: player.premium_currency
          };
        }
        
        if (avatar && JSON.stringify(avatar) !== JSON.stringify(lastSavedData.current.avatar)) {
          dataToSave.avatarData = avatar;
        }
        
        if (Object.keys(dataToSave).length > 0) {
          await autoSaveMutation.mutateAsync(dataToSave);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [player, avatar]);

  return (
    <AnimatePresence>
      {showSaveIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-bold">Progress Saved</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}