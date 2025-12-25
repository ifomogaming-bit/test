import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Handshake, 
  Swords, 
  Mail, 
  Shield, 
  Send, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Crown,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';

const ALLIANCE_TYPES = {
  trade: { name: 'Trade Alliance', icon: TrendingUp, benefits: 'Trade discounts & shared resources' },
  military: { name: 'Military Alliance', icon: Shield, benefits: 'War support & defense bonuses' },
  full: { name: 'Full Alliance', icon: Crown, benefits: 'All benefits included' }
};

const PRIORITY_COLORS = {
  low: 'bg-slate-500/20 text-slate-400',
  normal: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400'
};

export default function GuildDiplomacy({ myGuild, guilds = [], isLeader, canInitiateWar = false }) {
  const [showProposeAlliance, setShowProposeAlliance] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [allianceType, setAllianceType] = useState('full');
  const [messageData, setMessageData] = useState({ subject: '', message: '', priority: 'normal' });
  const queryClient = useQueryClient();

  const { data: alliances = [] } = useQuery({
    queryKey: ['alliances', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      const asGuild = await base44.entities.GuildAlliance.filter({ guild_id: myGuild.id });
      const asAlly = await base44.entities.GuildAlliance.filter({ ally_guild_id: myGuild.id });
      return [...asGuild, ...asAlly];
    },
    enabled: !!myGuild?.id
  });

  const { data: incomingMessages = [] } = useQuery({
    queryKey: ['diplomaticMessages', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildDiplomaticMessage.filter({ to_guild_id: myGuild.id }, '-created_date', 50);
    },
    enabled: !!myGuild?.id
  });

  const { data: outgoingMessages = [] } = useQuery({
    queryKey: ['sentMessages', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildDiplomaticMessage.filter({ from_guild_id: myGuild.id }, '-created_date', 50);
    },
    enabled: !!myGuild?.id
  });

  const proposeAllianceMutation = useMutation({
    mutationFn: async ({ targetGuildId, type }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await base44.entities.GuildAlliance.create({
        guild_id: myGuild.id,
        ally_guild_id: targetGuildId,
        proposed_by: myGuild.id,
        alliance_type: type,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      });

      await base44.entities.GuildDiplomaticMessage.create({
        from_guild_id: myGuild.id,
        to_guild_id: targetGuildId,
        from_player_id: myGuild.leader_id,
        from_player_name: myGuild.name,
        message_type: 'alliance_proposal',
        subject: `Alliance Proposal from ${myGuild.name}`,
        message: `${myGuild.name} proposes a ${ALLIANCE_TYPES[type].name}. This alliance would provide mutual benefits and strengthen both guilds.`,
        priority: 'high',
        requires_response: true,
        response_deadline: expiresAt.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alliances']);
      queryClient.invalidateQueries(['diplomaticMessages']);
      setShowProposeAlliance(false);
    }
  });

  const respondToAllianceMutation = useMutation({
    mutationFn: async ({ allianceId, accept }) => {
      await base44.entities.GuildAlliance.update(allianceId, {
        status: accept ? 'active' : 'rejected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alliances']);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.GuildDiplomaticMessage.create({
        from_guild_id: myGuild.id,
        to_guild_id: selectedGuild.id,
        from_player_id: myGuild.leader_id,
        from_player_name: myGuild.name,
        message_type: 'general',
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['diplomaticMessages']);
      queryClient.invalidateQueries(['sentMessages']);
      setShowSendMessage(false);
      setMessageData({ subject: '', message: '', priority: 'normal' });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      await base44.entities.GuildDiplomaticMessage.update(messageId, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['diplomaticMessages']);
    }
  });

  const activeAlliances = alliances.filter(a => a.status === 'active');
  const pendingAlliances = alliances.filter(a => a.status === 'pending');
  const unreadMessages = incomingMessages.filter(m => !m.is_read);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 rounded-xl p-4 border-2 border-green-500/50">
          <Handshake className="w-8 h-8 text-green-400 mb-2" />
          <p className="text-green-200 text-sm">Active Alliances</p>
          <p className="text-white text-3xl font-black">{activeAlliances.length}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-orange-600/30 to-red-600/30 rounded-xl p-4 border-2 border-orange-500/50">
          <AlertCircle className="w-8 h-8 text-orange-400 mb-2" />
          <p className="text-orange-200 text-sm">Pending Proposals</p>
          <p className="text-white text-3xl font-black">{pendingAlliances.length}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-xl p-4 border-2 border-blue-500/50">
          <Mail className="w-8 h-8 text-blue-400 mb-2" />
          <p className="text-blue-200 text-sm">Unread Messages</p>
          <p className="text-white text-3xl font-black">{unreadMessages.length}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-4 border-2 border-purple-500/50">
          <Users className="w-8 h-8 text-purple-400 mb-2" />
          <p className="text-purple-200 text-sm">Diplomatic Power</p>
          <p className="text-white text-3xl font-black">{activeAlliances.length * 10}</p>
        </motion.div>
      </div>

      <Tabs defaultValue="alliances" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="alliances">Alliances</TabsTrigger>
          <TabsTrigger value="messages">Messages ({unreadMessages.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="alliances">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Handshake className="w-6 h-6 text-green-400" />
                  Guild Alliances
                </CardTitle>
                {isLeader && (
                  <Button onClick={() => setShowProposeAlliance(true)} className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <Handshake className="w-4 h-4 mr-2" />
                    Propose Alliance
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAlliances.length > 0 && (
                  <div>
                    <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Pending Proposals
                    </h3>
                    {pendingAlliances.map((alliance) => {
                      const isProposer = alliance.proposed_by === myGuild.id;
                      const otherGuildId = isProposer ? alliance.ally_guild_id : alliance.guild_id;
                      const otherGuild = guilds.find(g => g.id === otherGuildId);
                      const AllianceIcon = ALLIANCE_TYPES[alliance.alliance_type]?.icon || Handshake;

                      return (
                        <div key={alliance.id} className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AllianceIcon className="w-8 h-8 text-orange-400" />
                              <div>
                                <h4 className="text-white font-bold">{otherGuild?.name}</h4>
                                <p className="text-slate-400 text-sm">{ALLIANCE_TYPES[alliance.alliance_type]?.name}</p>
                                <p className="text-slate-500 text-xs mt-1">
                                  {isProposer ? 'Waiting for response' : 'Awaiting your response'}
                                </p>
                              </div>
                            </div>
                            {!isProposer && isLeader && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => respondToAllianceMutation.mutate({ allianceId: alliance.id, accept: true })}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => respondToAllianceMutation.mutate({ allianceId: alliance.id, accept: false })}
                                  className="border-red-500/50 text-red-400"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeAlliances.length > 0 && (
                  <div>
                    <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Active Alliances
                    </h3>
                    {activeAlliances.map((alliance) => {
                      const otherGuildId = alliance.guild_id === myGuild.id ? alliance.ally_guild_id : alliance.guild_id;
                      const otherGuild = guilds.find(g => g.id === otherGuildId);
                      const AllianceIcon = ALLIANCE_TYPES[alliance.alliance_type]?.icon || Handshake;

                      return (
                        <div key={alliance.id} className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <AllianceIcon className="w-8 h-8 text-green-400" />
                              <div className="flex-1">
                                <h4 className="text-white font-bold">{otherGuild?.name}</h4>
                                <p className="text-slate-400 text-sm">{ALLIANCE_TYPES[alliance.alliance_type]?.name}</p>
                                <p className="text-green-400 text-xs mt-1">
                                  Trust Level: {alliance.trust_level}/5 • Wars Together: {alliance.wars_fought_together}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedGuild(otherGuild);
                                setShowSendMessage(true);
                              }}
                              className="border-blue-500/50"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeAlliances.length === 0 && pendingAlliances.length === 0 && (
                  <div className="text-center py-12">
                    <Handshake className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No alliances yet. Propose an alliance to strengthen your position!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-400" />
                Incoming Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incomingMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No messages received</p>
                  </div>
                ) : (
                  incomingMessages.map((msg) => {
                    const fromGuild = guilds.find(g => g.id === msg.from_guild_id);
                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg border-2 ${
                          msg.is_read ? 'bg-slate-700/30 border-slate-600' : 'bg-blue-500/10 border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-cyan-400" />
                            <div>
                              <h4 className="text-white font-bold">{fromGuild?.name}</h4>
                              <p className="text-slate-400 text-xs">{new Date(msg.created_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge className={PRIORITY_COLORS[msg.priority]}>
                            {msg.priority}
                          </Badge>
                        </div>
                        <h5 className="text-white font-semibold mb-1">{msg.subject}</h5>
                        <p className="text-slate-300 text-sm">{msg.message}</p>
                        {!msg.is_read && (
                          <Button
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(msg.id)}
                            className="mt-3 bg-blue-600 hover:bg-blue-700"
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-6 h-6 text-purple-400" />
                Sent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outgoingMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No messages sent</p>
                  </div>
                ) : (
                  outgoingMessages.map((msg) => {
                    const toGuild = guilds.find(g => g.id === msg.to_guild_id);
                    return (
                      <div key={msg.id} className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" />
                            <div>
                              <h4 className="text-white font-bold">To: {toGuild?.name}</h4>
                              <p className="text-slate-400 text-xs">{new Date(msg.created_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge className={PRIORITY_COLORS[msg.priority]}>
                            {msg.priority}
                          </Badge>
                        </div>
                        <h5 className="text-white font-semibold mb-1">{msg.subject}</h5>
                        <p className="text-slate-300 text-sm">{msg.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Propose Alliance Dialog */}
      <Dialog open={showProposeAlliance} onOpenChange={setShowProposeAlliance}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Propose Alliance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Select Guild</label>
              <Select onValueChange={(value) => setSelectedGuild(guilds.find(g => g.id === value))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Choose a guild..." />
                </SelectTrigger>
                <SelectContent>
                  {guilds.filter(g => 
                    g.id !== myGuild?.id && 
                    !alliances.some(a => 
                      (a.guild_id === g.id || a.ally_guild_id === g.id) && 
                      a.status !== 'rejected'
                    )
                  ).map(guild => (
                    <SelectItem key={guild.id} value={guild.id}>{guild.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Alliance Type</label>
              <Select value={allianceType} onValueChange={setAllianceType}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALLIANCE_TYPES).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name} - {data.benefits}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => proposeAllianceMutation.mutate({ targetGuildId: selectedGuild?.id, type: allianceType })}
              disabled={!selectedGuild}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              Send Proposal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showSendMessage} onOpenChange={setShowSendMessage}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Send Diplomatic Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">To: {selectedGuild?.name}</label>
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Subject</label>
              <Input
                value={messageData.subject}
                onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Message subject..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Message</label>
              <Textarea
                value={messageData.message}
                onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Your message..."
                className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Priority</label>
              <Select value={messageData.priority} onValueChange={(value) => setMessageData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => sendMessageMutation.mutate(messageData)}
              disabled={!messageData.subject || !messageData.message}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}