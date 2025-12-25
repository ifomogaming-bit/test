import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Shield, 
  Swords, 
  Star, 
  Award, 
  TrendingUp,
  Trophy,
  Zap,
  Users
} from 'lucide-react';
import AvatarDisplay from '../avatar/AvatarDisplay';

const ROLE_COLORS = {
  leader: 'from-yellow-500 to-orange-500',
  co_leader: 'from-purple-500 to-pink-500',
  war_general: 'from-red-500 to-orange-500',
  lieutenant: 'from-blue-500 to-cyan-500',
  officer: 'from-green-500 to-emerald-500',
  veteran: 'from-slate-500 to-slate-600',
  member: 'from-slate-600 to-slate-700',
  recruit: 'from-slate-700 to-slate-800'
};

const ROLE_ICONS = {
  leader: Crown,
  co_leader: Star,
  war_general: Swords,
  lieutenant: Shield,
  officer: Award,
  veteran: Trophy,
  member: Users,
  recruit: Zap
};

export default function GuildMembersModal({ guild, open, onClose }) {
  const { data: members = [] } = useQuery({
    queryKey: ['guildMembers', guild?.id],
    queryFn: async () => {
      if (!guild?.id) return [];
      return base44.entities.GuildMember.filter({ guild_id: guild.id }, '-contribution_points');
    },
    enabled: !!guild?.id && open
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => base44.entities.Player.list('-level', 200)
  });

  const { data: avatars = [] } = useQuery({
    queryKey: ['allAvatars'],
    queryFn: async () => base44.entities.Avatar.list('', 200),
    enabled: open
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-4 border-purple-500/60 shadow-2xl shadow-purple-500/50 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            {guild?.name} Members
          </DialogTitle>
          <p className="text-purple-200 text-sm">
            {members.length} members • Level {guild?.level || 1} Guild
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {members.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No members found</p>
              </CardContent>
            </Card>
          ) : (
            members.map((member, idx) => {
              const memberPlayer = allPlayers.find(p => p.id === member.player_id);
              const avatar = avatars.find(a => a.player_id === member.player_id);
              const RoleIcon = ROLE_ICONS[member.role] || Users;
              const roleColor = ROLE_COLORS[member.role] || 'from-slate-600 to-slate-700';

              if (!memberPlayer) return null;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <Card className={`bg-gradient-to-r ${roleColor} bg-opacity-20 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all shadow-lg overflow-hidden relative`}>
                    <motion.div
                      className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 hover:opacity-100 blur-sm transition-opacity"
                    />
                    <CardContent className="p-4 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <AvatarDisplay avatar={avatar} size="md" />
                            <div className="absolute -bottom-1 -right-1">
                              <RoleIcon className="w-5 h-5 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-black text-lg">
                                {memberPlayer.username}
                              </h4>
                              {member.role === 'leader' && (
                                <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`bg-gradient-to-r ${roleColor} text-white border-0 font-bold text-xs`}>
                                {member.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-purple-300 border-purple-400/50 text-xs">
                                Lvl {memberPlayer.level}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-2 justify-end">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-white font-bold text-sm">
                              {memberPlayer.pvp_rating || 1000}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-bold text-sm">
                              {member.contribution_points || 0} pts
                            </span>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <Swords className="w-4 h-4 text-red-400" />
                            <span className="text-slate-300 text-sm">
                              {memberPlayer.pvp_wins || 0}W / {memberPlayer.pvp_losses || 0}L
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}