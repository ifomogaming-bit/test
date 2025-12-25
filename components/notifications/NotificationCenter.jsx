import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Swords, Shield, Trophy, Gift, Users, Flame, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NOTIFICATION_ICONS = {
  war_challenge: Swords,
  raid_incoming: AlertCircle,
  raid_success: Trophy,
  raid_defense: Shield,
  reward_available: Gift,
  guild_invite: Users,
  challenge_received: Flame,
  war_started: Swords,
  war_ended: CheckCircle
};

const NOTIFICATION_COLORS = {
  war_challenge: 'from-red-600 to-orange-600',
  raid_incoming: 'from-yellow-600 to-orange-600',
  raid_success: 'from-green-600 to-emerald-600',
  raid_defense: 'from-blue-600 to-cyan-600',
  reward_available: 'from-purple-600 to-pink-600',
  guild_invite: 'from-indigo-600 to-purple-600',
  challenge_received: 'from-orange-600 to-red-600',
  war_started: 'from-red-600 to-pink-600',
  war_ended: 'from-cyan-600 to-blue-600'
};

export default function NotificationCenter({ player }) {
  const [showPanel, setShowPanel] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.Notification.filter({ player_id: player.id }, '-created_date', 50);
    },
    enabled: !!player?.id,
    refetchInterval: 30000 // Check every 30 seconds to reduce rate limits
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.update(notificationId, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const handleNotificationClick = (notification) => {
    markAsReadMutation.mutate(notification.id);
    if (notification.action_url) {
      navigate(createPageUrl(notification.action_url));
      setShowPanel(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const recentUnread = notifications.filter(n => !n.is_read).slice(0, 3);

  return (
    <>
      {/* Floating notification button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-4 right-4 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setShowPanel(!showPanel)}
            className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl shadow-purple-500/50 rounded-full w-14 h-14 p-0"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Pop-up notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {recentUnread.map((notification, index) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
            const colorClass = NOTIFICATION_COLORS[notification.type] || 'from-blue-600 to-cyan-600';
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 400, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 400, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-r ${colorClass} border-2 border-white/30 shadow-2xl backdrop-blur-md cursor-pointer overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-black text-sm mb-1">{notification.title}</h4>
                        <p className="text-white/90 text-xs line-clamp-2">{notification.message}</p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotificationMutation.mutate(notification.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 h-6 w-6 p-0 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {notification.action_url && (
                      <Button
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white font-bold border-2 border-white/30"
                        size="sm"
                      >
                        Take Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Notification panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowPanel(false)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-l-2 border-purple-500/50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">Notifications</h2>
                    <p className="text-slate-400 text-sm">{unreadCount} unread</p>
                  </div>
                  <Button
                    onClick={() => setShowPanel(false)}
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                      const colorClass = NOTIFICATION_COLORS[notification.type] || 'from-blue-600 to-cyan-600';
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card
                            className={`${notification.is_read ? 'bg-slate-800/50 border-slate-700' : `bg-gradient-to-r ${colorClass} border-white/20`} cursor-pointer transition-all`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Icon className="w-5 h-5 text-white shrink-0 mt-1" />
                                <div className="flex-1 min-w-0">
                                  <h4 className={`${notification.is_read ? 'text-slate-300' : 'text-white'} font-bold text-sm mb-1`}>
                                    {notification.title}
                                  </h4>
                                  <p className={`${notification.is_read ? 'text-slate-400' : 'text-white/80'} text-xs mb-2`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-slate-500 text-xs">
                                    {new Date(notification.created_date).toLocaleString()}
                                  </p>
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotificationMutation.mutate(notification.id);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20 h-6 w-6 p-0 shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}