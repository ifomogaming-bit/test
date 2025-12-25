import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Shield,
  Crown,
  Users,
  Plus,
  UserPlus,
  TrendingUp,
  Trophy,
  Settings,
  LogOut,
  DollarSign,
  Swords,
  MessageSquare,
  Send,
  UserCog,
  Gamepad2,
  Sparkles,
  Gem,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChallengeCard from '@/components/guilds/ChallengeCard';
import MiniGameCard from '@/components/guilds/MiniGameCard';
import GuildAIAdvisor from '@/components/guilds/GuildAIAdvisor';
import GuildWarMatchmaking from '@/components/guilds/GuildWarMatchmaking';
import RecurringEventCard from '@/components/guilds/RecurringEventCard';
import GuildEmblem from '@/components/guilds/GuildEmblem';
import GuildCustomization from '@/components/guilds/GuildCustomization';
import EventLeaderboard from '@/components/guilds/EventLeaderboard';
import RewardClaimPanel from '@/components/guilds/RewardClaimPanel';
import GuildBank from '@/components/guilds/GuildBank';
import GuildUpgrades from '@/components/guilds/GuildUpgrades';
import GuildLeaderboard from '@/components/guilds/GuildLeaderboard';
import GuildTournamentManager from '@/components/guilds/GuildTournamentManager';
import TutorialOverlay from '@/components/tutorials/TutorialOverlay';
import { TUTORIALS } from '@/components/tutorials/TutorialContent';
import { useTutorialTrigger } from '@/components/tutorials/TutorialManager';
import WarInitiationModal from '@/components/guilds/WarInitiationModal';
import WarCountdownTimer from '@/components/guilds/WarCountdownTimer';
import OpposingGuildMembers from '@/components/guilds/OpposingGuildMembers';
import WarChallengeMiniGames from '@/components/guilds/WarChallengeMiniGames';
import WarSpoilsPanel from '@/components/guilds/WarSpoilsPanel';
import GuildDiplomacy from '@/components/guilds/GuildDiplomacy';
import { getMaxVaultCapacity, canDepositToVault, getRemainingVaultCapacity } from '@/components/guilds/VaultCapacityHelper';
import WarEventNotification from '@/components/guilds/WarEventNotification';
import { generateWarEvent, shouldTriggerEvent } from '@/components/guilds/WarEventGenerator';
import GuildAnalytics from '@/components/guilds/GuildAnalytics';
import GuildTreasuryBreakdown from '@/components/guilds/GuildTreasuryBreakdown';
import PracticeMiniGames from '@/components/guilds/PracticeMiniGames';
import ChallengeNotifications from '@/components/guilds/ChallengeNotifications';
import WarAutoEndManager from '@/components/guilds/WarAutoEndManager';
import WarChallengeNotifications from '@/components/guilds/WarChallengeNotifications';

export default function Guilds() {
  const [user, setUser] = useState(null);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [newGuild, setNewGuild] = useState({
    name: '',
    description: '',
    is_public: true
  });
  const [contributionAmount, setContributionAmount] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedMemberForRole, setSelectedMemberForRole] = useState(null);
  const [chatChannel, setChatChannel] = useState('general');
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [newProposal, setNewProposal] = useState({ ticker: '', amount: '', description: '' });
  const [showCustomEventDialog, setShowCustomEventDialog] = useState(false);
  const [newCustomEvent, setNewCustomEvent] = useState({ 
    name: '', 
    description: '', 
    ruleset: { scoring_method: 'portfolio_growth', duration_days: 7 }
  });
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'normal'
  });
  const [showAuditLogDialog, setShowAuditLogDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedMemberForPermissions, setSelectedMemberForPermissions] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showRivalryDialog, setShowRivalryDialog] = useState(false);
  const [vaultDepositAmount, setVaultDepositAmount] = useState('');
  const [showWarInitiation, setShowWarInitiation] = useState(false);
  const [selectedOpponentForWar, setSelectedOpponentForWar] = useState(null);
  const [showGuildMembers, setShowGuildMembers] = useState(false);
  const [selectedGuildForMembers, setSelectedGuildForMembers] = useState(null);
  const [activeWarChallenge, setActiveWarChallenge] = useState(null);
  const [acceptedChallenge, setAcceptedChallenge] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: player } = useQuery({
    queryKey: ['player', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      if (players.length === 0) {
        const newPlayer = await base44.entities.Player.create({
          username: user.full_name || 'Trader',
          level: 1,
          xp: 0,
          soft_currency: 25000,
          premium_currency: 100,
          unlocked_maps: [1],
          current_map: 1,
          bubbles_popped_today: 0,
          streak: 0,
          total_correct_answers: 0,
          total_bubbles_popped: 0,
          achievements: [],
          pvp_rating: 1000,
          pvp_wins: 0,
          pvp_losses: 0
        });
        return newPlayer;
      }
      return players[0];
    },
    enabled: !!user?.email
  });

  const { data: guilds = [] } = useQuery({
    queryKey: ['guilds'],
    queryFn: async () => {
      return base44.entities.Guild.list('-total_portfolio_value', 100);
    }
  });

  const { data: myGuildMembership } = useQuery({
    queryKey: ['myGuildMembership', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const memberships = await base44.entities.GuildMember.filter({ player_id: player.id });
      return memberships[0] || null;
    },
    enabled: !!player?.id
  });

  const { data: myGuild } = useQuery({
    queryKey: ['myGuild', myGuildMembership?.guild_id],
    queryFn: async () => {
      if (!myGuildMembership?.guild_id) return null;
      const guild = await base44.entities.Guild.filter({ id: myGuildMembership.guild_id });
      return guild[0] || null;
    },
    enabled: !!myGuildMembership?.guild_id
  });

  const { shouldShowTutorial } = useTutorialTrigger('guilds', player);

  useEffect(() => {
    if (shouldShowTutorial && !showTutorial && !myGuild && player) {
      setTimeout(() => setShowTutorial(true), 1000);
    }
  }, [shouldShowTutorial, myGuild, player]);

  const { data: guildMembers = [] } = useQuery({
    queryKey: ['guildMembers', selectedGuild?.id || myGuild?.id],
    queryFn: async () => {
      const guildId = selectedGuild?.id || myGuild?.id;
      if (!guildId) return [];
      return base44.entities.GuildMember.filter({ guild_id: guildId }, '-contribution_points');
    },
    enabled: !!(selectedGuild?.id || myGuild?.id)
  });

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: async () => {
      return base44.entities.Player.list('-soft_currency', 200);
    }
  });

  const { data: guildTreasury } = useQuery({
    queryKey: ['guildTreasury', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return null;
      const treasuries = await base44.entities.GuildTreasury.filter({ guild_id: myGuild.id });
      if (treasuries.length === 0) {
        return await base44.entities.GuildTreasury.create({
          guild_id: myGuild.id,
          total_balance: 0,
          invested_amount: 0,
          total_returns: 0
        });
      }
      return treasuries[0];
    },
    enabled: !!myGuild?.id
  });

  const { data: guildMessages = [] } = useQuery({
    queryKey: ['guildMessages', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildMessage.filter({ guild_id: myGuild.id }, '-created_date', 50);
    },
    enabled: !!myGuild?.id
  });

  const { data: guildWars = [] } = useQuery({
    queryKey: ['guildWars'],
    queryFn: async () => {
      return base44.entities.GuildWar.filter({ status: 'active' }, '-created_date', 20);
    },
    refetchInterval: 15000 // Refresh every 15 seconds to reduce rate limits
  });

  const { data: warEvents = [] } = useQuery({
    queryKey: ['warEvents'],
    queryFn: async () => {
      return base44.entities.GuildWarEvent.list('-created_date', 50);
    }
  });

  // Auto-generate war events
  React.useEffect(() => {
    const checkAndGenerateEvents = async () => {
      for (const war of guildWars) {
        const warEventsForWar = warEvents.filter(e => e.war_id === war.id);
        if (shouldTriggerEvent(war, warEventsForWar)) {
          const newEvent = generateWarEvent(war.id);
          await base44.entities.GuildWarEvent.create(newEvent);
          queryClient.invalidateQueries(['warEvents']);
        }
      }
    };

    if (guildWars.length > 0) {
      checkAndGenerateEvents();
    }
  }, [guildWars.length]);

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      return base44.entities.GuildTournament.list('-created_date', 20);
    }
  });

  const { data: investmentProposals = [] } = useQuery({
    queryKey: ['investmentProposals', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildInvestmentProposal.filter({ guild_id: myGuild.id }, '-created_date');
    },
    enabled: !!myGuild?.id
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ['myVotes', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.GuildInvestmentVote.filter({ player_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: guildChallenges = [] } = useQuery({
    queryKey: ['guildChallenges'],
    queryFn: async () => {
      return base44.entities.GuildChallenge.filter({ status: 'active' }, '-created_date', 20);
    }
  });

  const { data: guildMiniGames = [] } = useQuery({
    queryKey: ['guildMiniGames'],
    queryFn: async () => {
      return base44.entities.GuildMiniGame.list('-created_date', 20);
    }
  });

  const { data: customEvents = [] } = useQuery({
    queryKey: ['customEvents'],
    queryFn: async () => {
      return base44.entities.GuildCustomEvent.list('-created_date', 20);
    }
  });

  const { data: recurringEvents = [] } = useQuery({
    queryKey: ['recurringEvents'],
    queryFn: async () => {
      return base44.entities.RecurringGuildEvent.filter({ is_active: true }, '-created_date', 20);
    }
  });

  const { data: eventParticipations = [] } = useQuery({
    queryKey: ['eventParticipations'],
    queryFn: async () => {
      return base44.entities.EventParticipation.list('-created_date', 100);
    }
  });

  const { data: eventRewards = [] } = useQuery({
    queryKey: ['rewards', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.EventReward.filter({ recipient_id: player.id });
    },
    enabled: !!player?.id
  });

  const { data: guildUpgrades = [] } = useQuery({
    queryKey: ['guildUpgrades', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildUpgrade.filter({ guild_id: myGuild.id });
    },
    enabled: !!myGuild?.id
  });

  const { data: guildLoans = [] } = useQuery({
    queryKey: ['guildLoans', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildLoan.filter({ guild_id: myGuild.id }, '-created_date');
    },
    enabled: !!myGuild?.id
  });

  const { data: guildAnnouncements = [] } = useQuery({
    queryKey: ['guildAnnouncements', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildAnnouncement.filter({ guild_id: myGuild.id }, '-created_date', 50);
    },
    enabled: !!myGuild?.id
  });

  const { data: guildAuditLogs = [] } = useQuery({
    queryKey: ['guildAuditLogs', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      return base44.entities.GuildAuditLog.filter({ guild_id: myGuild.id }, '-created_date', 100);
    },
    enabled: !!myGuild?.id
  });

  const { data: rivalries = [] } = useQuery({
    queryKey: ['rivalries', myGuild?.id],
    queryFn: async () => {
      if (!myGuild?.id) return [];
      const asGuild = await base44.entities.GuildRivalry.filter({ guild_id: myGuild.id, is_active: true });
      const asRival = await base44.entities.GuildRivalry.filter({ rival_guild_id: myGuild.id, is_active: true });
      return [...asGuild, ...asRival];
    },
    enabled: !!myGuild?.id,
    refetchInterval: 3000
  });

  const handleAcceptChallenge = (challenge) => {
    setAcceptedChallenge(challenge);
  };

  const createGuildMutation = useMutation({
    mutationFn: async (guildData) => {
      const GUILD_CREATION_COST = 100;
      
      if (!player || (player.premium_currency || 0) < GUILD_CREATION_COST) {
        throw new Error('Insufficient gems');
      }
      
      // Deduct gems
      await base44.entities.Player.update(player.id, {
        premium_currency: (player.premium_currency || 0) - GUILD_CREATION_COST
      });

      const guild = await base44.entities.Guild.create({
        ...guildData,
        leader_id: player.id,
        member_count: 1,
        total_portfolio_value: player.soft_currency || 0,
        treasury_balance: 0,
        premium_balance: 0,
        trophies: 0,
        guild_xp: 0,
        level: 1
      });

      await base44.entities.GuildMember.create({
        guild_id: guild.id,
        player_id: player.id,
        role: 'leader',
        contribution_points: 0,
        permissions: {
          invite_members: true,
          kick_members: true,
          manage_roles: true,
          initiate_wars: true,
          manage_treasury: true,
          create_announcements: true,
          manage_upgrades: true
        }
      });

      // Create guild treasury
      await base44.entities.GuildTreasury.create({
        guild_id: guild.id,
        total_balance: 0,
        invested_amount: 0,
        total_returns: 0
      });

      // Create audit log
      await base44.entities.GuildAuditLog.create({
        guild_id: guild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'guild_settings_changed',
        details: { action: 'guild_created' }
      });

      return guild;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['myGuildMembership']);
      queryClient.invalidateQueries(['player']);
      setShowCreateGuild(false);
      setNewGuild({ name: '', description: '', is_public: true });
    }
  });

  const joinGuildMutation = useMutation({
    mutationFn: async (guildId) => {
      const guild = guilds.find(g => g.id === guildId);
      if (!guild) throw new Error('Guild not found');
      
      const currentMembers = await base44.entities.GuildMember.filter({ guild_id: guildId });
      if (currentMembers.length >= (guild.max_members || 30)) {
        throw new Error('Guild is full');
      }

      await base44.entities.GuildMember.create({
        guild_id: guildId,
        player_id: player.id,
        role: 'recruit',
        contribution_points: 0,
        permissions: {
          invite_members: false,
          kick_members: false,
          manage_roles: false,
          initiate_wars: false,
          manage_treasury: false,
          create_announcements: false,
          manage_upgrades: false
        }
      });

      await base44.entities.Guild.update(guildId, {
        member_count: (guild.member_count || 0) + 1,
        total_portfolio_value: (guild.total_portfolio_value || 0) + (player.soft_currency || 0)
      });

      await base44.entities.GuildAuditLog.create({
        guild_id: guildId,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'member_joined'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['myGuildMembership']);
    }
  });

  const leaveGuildMutation = useMutation({
    mutationFn: async () => {
      if (!myGuildMembership || !myGuild) return;

      if (myGuildMembership.role === 'leader') {
        throw new Error('Leaders must transfer leadership before leaving');
      }

      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'member_left'
      });

      await base44.entities.GuildMember.delete(myGuildMembership.id);

      const newMemberCount = Math.max(0, (myGuild.member_count || 0) - 1);
      
      if (newMemberCount === 0) {
        await base44.entities.Guild.delete(myGuild.id);
      } else {
        await base44.entities.Guild.update(myGuild.id, {
          member_count: newMemberCount,
          total_portfolio_value: Math.max(0, (myGuild.total_portfolio_value || 0) - (player.soft_currency || 0))
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['myGuildMembership']);
    }
  });

  const handleCreateGuild = () => {
    if (!newGuild.name) return;
    
    const GUILD_CREATION_COST = 100;
    if ((player?.premium_currency || 0) < GUILD_CREATION_COST) {
      alert(`You need ${GUILD_CREATION_COST} gems to create a guild. Visit the Shop to purchase gems!`);
      return;
    }
    
    createGuildMutation.mutate(newGuild);
  };

  const getMemberPlayerData = (memberId) => {
    return allPlayers.find(p => p.id === memberId);
  };

  const depositToTreasuryMutation = useMutation({
    mutationFn: async (amount) => {
      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - amount
      });

      const newBalance = (guildTreasury.total_balance || 0) + amount;

      await base44.entities.GuildTreasury.update(guildTreasury.id, {
        total_balance: newBalance
      });

      await base44.entities.GuildContribution.create({
        guild_id: myGuild.id,
        player_id: player.id,
        amount,
        contribution_type: 'deposit'
      });

      // Record treasury transaction
      await base44.entities.GuildTreasuryTransaction.create({
        guild_id: myGuild.id,
        transaction_type: 'income',
        category: 'member_donation',
        amount: amount,
        description: `Donation from ${player.username}`,
        player_id: player.id,
        player_name: player.username,
        balance_after: newBalance
      });

      await base44.entities.GuildMember.update(myGuildMembership.id, {
        contribution_points: (myGuildMembership.contribution_points || 0) + Math.floor(amount / 10)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['guildTreasury']);
      queryClient.invalidateQueries(['guildMembers']);
      setContributionAmount('');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const finalMessage = `[${chatChannel}] ${message}`;
      await base44.entities.GuildMessage.create({
        guild_id: myGuild.id,
        player_id: player.id,
        player_name: player.username,
        message: finalMessage,
        is_announcement: myGuildMembership?.role === 'leader' && message.startsWith('/announce')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildMessages']);
      setNewMessage('');
    }
  });

  const createProposalMutation = useMutation({
    mutationFn: async (proposalData) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      await base44.entities.GuildInvestmentProposal.create({
        guild_id: myGuild.id,
        proposed_by: player.id,
        ...proposalData,
        amount: parseFloat(proposalData.amount),
        status: 'pending',
        votes_for: 0,
        votes_against: 0,
        expires_at: expiresAt.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['investmentProposals']);
      setShowProposalDialog(false);
      setNewProposal({ ticker: '', amount: '', description: '' });
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, vote }) => {
      await base44.entities.GuildInvestmentVote.create({
        proposal_id: proposalId,
        player_id: player.id,
        vote
      });

      const proposal = investmentProposals.find(p => p.id === proposalId);
      if (proposal) {
        await base44.entities.GuildInvestmentProposal.update(proposalId, {
          votes_for: (proposal.votes_for || 0) + (vote === 'for' ? 1 : 0),
          votes_against: (proposal.votes_against || 0) + (vote === 'against' ? 1 : 0)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['investmentProposals']);
      queryClient.invalidateQueries(['myVotes']);
    }
  });

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId) => {
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) return;

      await base44.entities.GuildTournament.update(tournamentId, {
        participating_guilds: [...(tournament.participating_guilds || []), myGuild.id]
      });

      await base44.entities.GuildTreasury.update(guildTreasury.id, {
        total_balance: (guildTreasury.total_balance || 0) - tournament.entry_fee_per_guild
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournaments']);
      queryClient.invalidateQueries(['guildTreasury']);
    }
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = guildChallenges.find(c => c.id === challengeId);
      if (!challenge) return;

      await base44.entities.GuildChallenge.update(challengeId, {
        participating_guilds: [...(challenge.participating_guilds || []), myGuild.id],
        guild_progress: { ...(challenge.guild_progress || {}), [myGuild.id]: 0 }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildChallenges']);
    }
  });

  const joinMiniGameMutation = useMutation({
    mutationFn: async (gameId) => {
      const game = guildMiniGames.find(g => g.id === gameId);
      if (!game) return;

      await base44.entities.GuildMiniGame.update(gameId, {
        participating_guilds: [...(game.participating_guilds || []), myGuild.id],
        guild_scores: { ...(game.guild_scores || {}), [myGuild.id]: 0 }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildMiniGames']);
    }
  });

  const createCustomEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + 1);
      const endsAt = new Date(startsAt);
      endsAt.setDate(endsAt.getDate() + (eventData.ruleset.duration_days || 7));

      await base44.entities.GuildCustomEvent.create({
        created_by_guild: myGuild.id,
        created_by_player: player.id,
        ...eventData,
        status: 'pending',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        prize_pool: 0,
        invited_guilds: [],
        participating_guilds: [myGuild.id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customEvents']);
      setShowCustomEventDialog(false);
      setNewCustomEvent({ 
        name: '', 
        description: '', 
        ruleset: { scoring_method: 'portfolio_growth', duration_days: 7 }
      });
    }
  });

  const joinRecurringEventMutation = useMutation({
    mutationFn: async (eventId) => {
      const event = recurringEvents.find(e => e.id === eventId);
      if (!event) return;

      await base44.entities.RecurringGuildEvent.update(eventId, {
        participating_guilds: [...(event.participating_guilds || []), myGuild.id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recurringEvents']);
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }) => {
      const member = guildMembers.find(m => m.id === memberId);
      const memberData = getMemberPlayerData(member?.player_id);
      
      await base44.entities.GuildMember.update(memberId, { role: newRole });

      // Create audit log
      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'role_changed',
        target_id: member?.player_id,
        target_name: memberData?.username || 'Unknown',
        details: { new_role: newRole, old_role: member?.role }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildMembers']);
      queryClient.invalidateQueries(['guildAuditLogs']);
      setSelectedMemberForRole(null);
    }
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ memberId, permissions }) => {
      const member = guildMembers.find(m => m.id === memberId);
      const memberData = getMemberPlayerData(member?.player_id);
      
      await base44.entities.GuildMember.update(memberId, { permissions });

      // Create audit log
      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'permission_changed',
        target_id: member?.player_id,
        target_name: memberData?.username || 'Unknown',
        details: { permissions }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildMembers']);
      queryClient.invalidateQueries(['guildAuditLogs']);
      setShowPermissionsDialog(false);
      setSelectedMemberForPermissions(null);
    }
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcementData) => {
      await base44.entities.GuildAnnouncement.create({
        guild_id: myGuild.id,
        author_id: player.id,
        author_name: player.username,
        ...announcementData
      });

      // Create audit log
      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'announcement_created',
        details: { title: announcementData.title }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildAnnouncements']);
      queryClient.invalidateQueries(['guildAuditLogs']);
      setShowAnnouncementDialog(false);
      setNewAnnouncement({ title: '', message: '', priority: 'normal' });
    }
  });

  const declareRivalryMutation = useMutation({
    mutationFn: async (rivalGuildId) => {
      if (!myGuild?.id || !player?.id) return;

      // Check if already rivals
      const existing = (rivalries || []).find(r => 
        (r.guild_id === myGuild.id && r.rival_guild_id === rivalGuildId) ||
        (r.rival_guild_id === myGuild.id && r.guild_id === rivalGuildId)
      );
      if (existing) throw new Error('Already rivals with this guild');

      // Check 7-day cooldown and limit
      const now = new Date();
      const resetDate = myGuild.rivalry_cooldown_reset ? new Date(myGuild.rivalry_cooldown_reset) : null;

      let declarationsUsed = myGuild.rivalry_declarations_used || 0;

      // Reset counter if 7 days have passed
      if (!resetDate || now > resetDate) {
        declarationsUsed = 0;
        const newResetDate = new Date();
        newResetDate.setDate(newResetDate.getDate() + 7);

        await base44.entities.Guild.update(myGuild.id, {
          rivalry_declarations_used: 0,
          rivalry_cooldown_reset: newResetDate.toISOString()
        });
      }

      if (declarationsUsed >= 10) {
        const daysLeft = Math.ceil((resetDate - now) / (1000 * 60 * 60 * 24));
        throw new Error(`Rivalry limit reached! You can declare ${10 - declarationsUsed} more rivalries. Resets in ${daysLeft} days.`);
      }

      await base44.entities.GuildRivalry.create({
        guild_id: myGuild.id,
        rival_guild_id: rivalGuildId,
        intensity_level: 1,
        total_wars: 0,
        guild_wins: 0,
        rival_wins: 0,
        bonus_xp_multiplier: 1.25,
        bonus_reward_multiplier: 1.5,
        declared_at: new Date().toISOString()
      });

      // Increment counter
      await base44.entities.Guild.update(myGuild.id, {
        rivalry_declarations_used: declarationsUsed + 1
      });

      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'rivalry_declared',
        target_id: rivalGuildId,
        target_name: guilds.find(g => g.id === rivalGuildId)?.name,
        details: { action: 'rivalry_declared' }
      });

      return rivalGuildId;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries(['rivalries']),
        queryClient.invalidateQueries(['guildAuditLogs']),
        queryClient.invalidateQueries(['myGuild'])
      ]);
      await queryClient.refetchQueries(['rivalries']);
      setShowRivalryDialog(false);
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const depositToVaultMutation = useMutation({
    mutationFn: async (amount) => {
      if (!player?.id || !myGuild?.id || !myGuildMembership?.id) return;

      // Check if player has enough resources
      if ((player.soft_currency || 0) < amount) {
        throw new Error(`Insufficient funds! You have ${(player.soft_currency || 0).toLocaleString()} coins.`);
      }

      // Add XP for vault contribution
      await base44.entities.Player.update(player.id, {
        xp: (player.xp || 0) + Math.floor(amount / 100)
      });

      const currentVault = myGuild.vault_balance || 0;

      // Check vault capacity
      if (!canDepositToVault(currentVault, amount, guildUpgrades)) {
        const maxCapacity = getMaxVaultCapacity(guildUpgrades);
        throw new Error(`Vault capacity exceeded! Max: ${maxCapacity.toLocaleString()} coins. Upgrade vault capacity to deposit more.`);
      }

      // Check daily donation limit
      const today = new Date().toISOString().split('T')[0];
      const myTodayAuditLogs = guildAuditLogs.filter(log => 
        log.actor_id === player.id && 
        log.action_type === 'vault_deposit' &&
        log.created_date.startsWith(today)
      );

      if (myTodayAuditLogs.length >= 1) {
        throw new Error('Daily donation limit reached! You can donate once per day.');
      }

      // Check for active Resource Rush event or active war
      const myActiveWars = guildWars.filter(w => 
        w.challenger_guild_id === myGuild.id || w.opponent_guild_id === myGuild.id
      );
      const activeResourceRush = warEvents.find(e => 
        myActiveWars.some(w => w.id === e.war_id) && 
        e.event_type === 'resource_rush' && 
        e.status === 'active'
      );

      let warPoints = 3; // Fixed 3 points per donation
      if (activeResourceRush) {
        warPoints = Math.floor(3 * activeResourceRush.bonus_multiplier);

        // Update event progress
        const currentProgress = activeResourceRush.current_progress || {};
        currentProgress[myGuild.id] = (currentProgress[myGuild.id] || 0) + 1;

        await base44.entities.GuildWarEvent.update(activeResourceRush.id, {
          current_progress: currentProgress
        });
      }

      // Add war points if in active war
      const war = myActiveWars[0];
      if (war) {
        const isChallenger = war.challenger_guild_id === myGuild.id;
        const scoreField = isChallenger ? 'challenger_score' : 'opponent_score';

        await base44.entities.GuildWar.update(war.id, {
          [scoreField]: (war[scoreField] || 0) + warPoints
        });

        await base44.entities.GuildWarContribution.create({
          war_id: war.id,
          player_id: player.id,
          player_name: player.username,
          guild_id: myGuild.id,
          points_earned: warPoints,
          contribution_type: 'donation',
          details: { event: activeResourceRush ? 'resource_rush' : 'standard_donation', amount }
        });
      }

      // Deduct player resources
      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - amount
      });

      await base44.entities.Guild.update(myGuild.id, {
        vault_balance: currentVault + amount
      });

      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'vault_deposit',
        amount: amount,
        details: { action: 'vault_deposit', amount, war_points: warPoints }
      });

      await base44.entities.GuildMember.update(myGuildMembership.id, {
        contribution_points: (myGuildMembership.contribution_points || 0) + Math.floor(amount / 10)
      });

      // Record treasury transaction
      const newVaultBalance = currentVault + amount;
      await base44.entities.GuildTreasuryTransaction.create({
        guild_id: myGuild.id,
        transaction_type: 'income',
        category: 'member_donation',
        amount: amount,
        description: `Vault deposit from ${player.username}`,
        player_id: player.id,
        player_name: player.username,
        balance_after: newVaultBalance
      });
      },
      onError: (error) => {
      alert(error.message);
      },
      onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['myGuild']);
      queryClient.invalidateQueries(['myGuildMembership']);
      queryClient.invalidateQueries(['guildMembers']);
      queryClient.invalidateQueries(['guildAuditLogs']);
      queryClient.invalidateQueries(['guildTreasury']);
      queryClient.invalidateQueries(['treasuryTransactions']);
      setVaultDepositAmount('');
      }
      });

  const repayLoanMutation = useMutation({
    mutationFn: async (loanId) => {
      if (!player?.id || !myGuild?.id) return;
      
      const loan = (guildLoans || []).find(l => l.id === loanId);
      if (!loan) return;

      const totalOwed = loan.amount + (loan.interest_accrued || 0);
      
      if ((player.soft_currency || 0) < totalOwed) {
        throw new Error('Insufficient funds to repay loan');
      }

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - totalOwed
      });

      await base44.entities.Guild.update(myGuild.id, {
        vault_balance: (myGuild.vault_balance || 0) + totalOwed
      });

      await base44.entities.GuildLoan.update(loanId, {
        status: 'repaid',
        repaid_at: new Date().toISOString()
      });

      await base44.entities.Player.update(player.id, {
        credit_score: Math.min(900, (player.credit_score || 600) + 15)
      });

      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'loan_repaid',
        amount: totalOwed,
        details: { loan_id: loanId, total_repaid: totalOwed }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['myGuild']);
      queryClient.invalidateQueries(['guildLoans']);
      queryClient.invalidateQueries(['guildAuditLogs']);
    }
  });

  const kickMemberMutation = useMutation({
    mutationFn: async (memberId) => {
      const member = guildMembers.find(m => m.id === memberId);
      if (!member) return;

      const memberData = getMemberPlayerData(member.player_id);

      await base44.entities.GuildMember.delete(memberId);

      // Create audit log
      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'member_kicked',
        target_id: member.player_id,
        target_name: memberData?.username || 'Unknown'
      });

      if (myGuild) {
        const newMemberCount = Math.max(0, (myGuild.member_count || 0) - 1);
        
        // If guild becomes empty, delete it
        if (newMemberCount === 0) {
          await base44.entities.Guild.delete(myGuild.id);
        } else {
          await base44.entities.Guild.update(myGuild.id, {
            member_count: newMemberCount,
            total_portfolio_value: Math.max(0, (myGuild.total_portfolio_value || 0) - (memberData?.soft_currency || 0))
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['guildMembers']);
      queryClient.invalidateQueries(['guildAuditLogs']);
      setSelectedMemberForRole(null);
    }
  });

  const challengeGuildMutation = useMutation({
    mutationFn: async (opponentGuildId) => {
      // Check if guild already has an active war
      const myActiveWars = guildWars.filter(w => 
        (w.challenger_guild_id === myGuild.id || w.opponent_guild_id === myGuild.id) &&
        w.status === 'active'
      );

      if (myActiveWars.length > 0) {
        throw new Error('Your guild already has an active war. Complete it before starting another!');
      }

      // Check if opponent guild has an active war
      const opponentActiveWars = guildWars.filter(w => 
        (w.challenger_guild_id === opponentGuildId || w.opponent_guild_id === opponentGuildId) &&
        w.status === 'active'
      );

      if (opponentActiveWars.length > 0) {
        throw new Error('Opponent guild is already in a war!');
      }

      // Check for pending challenges
      const existingChallenges = await base44.entities.WarChallengeNotification.filter({
        challenger_guild_id: myGuild.id,
        opponent_guild_id: opponentGuildId,
        status: 'pending'
      });

      if (existingChallenges.length > 0) {
        throw new Error('You already have a pending challenge with this guild!');
      }

      // Create challenge notification for opponent guild
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // Challenge expires in 3 days

      const opponentGuild = guilds.find(g => g.id === opponentGuildId);

      await base44.entities.WarChallengeNotification.create({
        challenger_guild_id: myGuild.id,
        challenger_guild_name: myGuild.name,
        opponent_guild_id: opponentGuildId,
        opponent_guild_name: opponentGuild?.name || 'Unknown',
        status: 'pending',
        expires_at: expiresAt.toISOString()
      });

      // Notify opponent guild leader
      const opponentMembers = await base44.entities.GuildMember.filter({ guild_id: opponentGuildId, role: 'leader' });
      if (opponentMembers.length > 0) {
        await base44.entities.Notification.create({
          player_id: opponentMembers[0].player_id,
          type: 'war_challenge',
          title: '⚔️ War Challenge Received!',
          message: `${myGuild.name} has challenged your guild to war! Accept or decline within 3 days.`,
          action_url: 'Guilds',
          metadata: { guild_id: myGuild.id },
          priority: 'urgent'
        });
      }

      await base44.entities.GuildAuditLog.create({
        guild_id: myGuild.id,
        actor_id: player.id,
        actor_name: player.username,
        action_type: 'war_initiated',
        target_id: opponentGuildId,
        target_name: opponentGuild?.name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildWars']);
      queryClient.invalidateQueries(['guildAuditLogs']);
      queryClient.invalidateQueries(['warChallengeNotifications']);
      setShowWarInitiation(false);
      setSelectedOpponentForWar(null);
      alert('War challenge sent! Waiting for opponent to accept.');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleDeposit = () => {
    const amount = parseInt(contributionAmount);
    if (amount > 0 && (player?.soft_currency || 0) >= amount) {
      depositToTreasuryMutation.mutate(amount);
    }
  };

  const ROLE_HIERARCHY = {
    leader: 8,
    co_leader: 7,
    war_general: 6,
    lieutenant: 5,
    officer: 4,
    veteran: 3,
    member: 2,
    recruit: 1
  };

  const ROLE_DISPLAY = {
    leader: { name: 'Leader', color: 'text-yellow-400', icon: '👑' },
    co_leader: { name: 'Co-Leader', color: 'text-orange-400', icon: '⭐' },
    war_general: { name: 'War General', color: 'text-red-400', icon: '⚔️' },
    lieutenant: { name: 'Lieutenant', color: 'text-purple-400', icon: '🎖️' },
    officer: { name: 'Officer', color: 'text-blue-400', icon: '🛡️' },
    veteran: { name: 'Veteran', color: 'text-green-400', icon: '🏅' },
    member: { name: 'Member', color: 'text-slate-400', icon: '👤' },
    recruit: { name: 'Recruit', color: 'text-gray-400', icon: '🆕' }
  };

  const DEFAULT_PERMISSIONS = {
    leader: { invite_members: true, kick_members: true, manage_roles: true, initiate_wars: true, manage_treasury: true, create_announcements: true, manage_upgrades: true },
    co_leader: { invite_members: true, kick_members: true, manage_roles: true, initiate_wars: true, manage_treasury: true, create_announcements: true, manage_upgrades: true },
    war_general: { invite_members: true, kick_members: false, manage_roles: false, initiate_wars: true, manage_treasury: false, create_announcements: true, manage_upgrades: false },
    lieutenant: { invite_members: true, kick_members: false, manage_roles: false, initiate_wars: true, manage_treasury: false, create_announcements: false, manage_upgrades: false },
    officer: { invite_members: true, kick_members: false, manage_roles: false, initiate_wars: false, manage_treasury: false, create_announcements: false, manage_upgrades: false },
    veteran: { invite_members: false, kick_members: false, manage_roles: false, initiate_wars: false, manage_treasury: false, create_announcements: false, manage_upgrades: false },
    member: { invite_members: false, kick_members: false, manage_roles: false, initiate_wars: false, manage_treasury: false, create_announcements: false, manage_upgrades: false },
    recruit: { invite_members: false, kick_members: false, manage_roles: false, initiate_wars: false, manage_treasury: false, create_announcements: false, manage_upgrades: false }
  };

  const getEffectivePermissions = (member) => {
    if (!member) return {};
    const rolePerms = DEFAULT_PERMISSIONS[member.role] || {};
    const customPerms = member.permissions || {};
    return { ...rolePerms, ...customPerms };
  };

  const myPermissions = getEffectivePermissions(myGuildMembership);
  const isLeader = myGuildMembership?.role === 'leader';
  const isOfficer = myGuildMembership?.role === 'officer';
  const canPropose = isLeader || isOfficer || myPermissions.manage_treasury;
  const canInitiateWar = myGuildMembership?.role === 'leader' || 
                         myGuildMembership?.role === 'co_leader' || 
                         myGuildMembership?.role === 'war_general';

  const hasVoted = (proposalId) => {
    return myVotes.some(v => v.proposal_id === proposalId);
  };

  const filteredMessages = guildMessages.filter(msg => 
    chatChannel === 'all' || msg.message.includes(`[${chatChannel}]`)
  );

  return (
    <>
      {/* Auto-end expired wars and distribute rewards */}
      <WarAutoEndManager activeWars={guildWars} />

      {/* War Challenge Notifications for Guild Leaders */}
      {myGuild && isLeader && (
        <WarChallengeNotifications 
          myGuild={myGuild}
          isLeader={isLeader}
        />
      )}

      {/* Challenge Notifications */}
      {player && myGuild && (
        <ChallengeNotifications 
          player={player} 
          onAccept={handleAcceptChallenge}
        />
      )}

      {/* Active Challenge Game */}
      {acceptedChallenge && player && myGuild && (
        <WarChallengeMiniGames
          challenge={acceptedChallenge}
          player={player}
          war={guildWars.find(w => w.id === acceptedChallenge.war_id)}
          myGuild={myGuild}
          onComplete={() => {
            setAcceptedChallenge(null);
            queryClient.invalidateQueries(['warChallenges']);
            queryClient.invalidateQueries(['guildWars']);
          }}
        />
      )}

    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-x-hidden">
      {/* Vibrant background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/25 to-pink-500/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/25 to-cyan-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative z-10 p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="border-purple-500/50 text-white hover:bg-purple-500/20 hover:border-purple-400 shadow-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                <motion.div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
                  </motion.div>
                  Guilds
                </motion.div>
              </h1>
              <p className="text-cyan-300 font-bold text-sm sm:text-base">🤝 Join forces, trade together, dominate the markets</p>
            </div>
          </div>

          {!myGuild && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowCreateGuild(true)}
                className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 w-full sm:w-auto shadow-xl shadow-cyan-500/40 border-2 border-cyan-400/50 font-bold text-lg px-6 py-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                ✨ Create Guild
              </Button>
            </motion.div>
          )}
        </div>

        <Tabs defaultValue={myGuild ? "my-guild" : "browse"} className="space-y-6">
          <TabsList className="bg-gradient-to-r from-slate-800/80 via-purple-900/60 to-slate-800/80 border-2 border-purple-500/40 shadow-xl shadow-purple-500/20 flex-wrap h-auto p-1.5">
            {myGuild && (
              <>
                <TabsTrigger value="my-guild" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">My Guild</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Bank</span>
                </TabsTrigger>
                <TabsTrigger value="upgrades" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Upgrades</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="wars" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Swords className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Wars</span>
                </TabsTrigger>
                <TabsTrigger value="tournaments" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Tournaments</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="announcements" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Announcements</span>
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Audit</span>
                </TabsTrigger>
                <TabsTrigger value="rivalries" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Swords className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Rivalries</span>
                </TabsTrigger>
                <TabsTrigger value="customize" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Customize</span>
                </TabsTrigger>
                <TabsTrigger value="diplomacy" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Diplomacy</span>
                </TabsTrigger>
                </>
                )}
                <TabsTrigger value="browse" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Browse</span>
                </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          {myGuild && (
            <TabsContent value="my-guild">
              <Card className="bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-purple-900/40 border-2 border-cyan-500/60 shadow-2xl shadow-cyan-500/30 mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 flex items-center gap-3 text-2xl font-black">
                      <GuildEmblem guild={myGuild} size="lg" showGlow={true} animated={true} showTag={false} />
                      <div>
                        {myGuild.name}
                        {myGuild.guild_tag && (
                          <span className="ml-2 text-lg font-black" style={{ color: myGuild.banner_color_primary }}>
                            [{myGuild.guild_tag}]
                          </span>
                        )}
                        {myGuild.guild_title && (
                          <p className="text-yellow-400 text-sm font-bold mt-1">"{myGuild.guild_title}"</p>
                        )}
                      </div>
                    </CardTitle>
                    <Button
                      onClick={() => leaveGuildMutation.mutate()}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Guild
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">{myGuild.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-xl p-3 sm:p-4 border-2 border-blue-400/40 shadow-lg shadow-blue-500/20"
                    >
                      <p className="text-blue-300 text-xs sm:text-sm font-bold">Members</p>
                      <p className="text-white text-xl sm:text-3xl font-black">{myGuild.member_count}</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 rounded-xl p-3 sm:p-4 border-2 border-green-400/40 shadow-lg shadow-green-500/20"
                    >
                      <p className="text-green-300 text-xs sm:text-sm font-bold">Total Value</p>
                      <p className="text-white text-xl sm:text-3xl font-black">{myGuild.total_portfolio_value?.toLocaleString()}</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl p-3 sm:p-4 border-2 border-purple-400/40 shadow-lg shadow-purple-500/20"
                    >
                      <p className="text-purple-300 text-xs sm:text-sm font-bold">Your Role</p>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mt-2 font-black shadow-lg">
                        {ROLE_DISPLAY[myGuildMembership?.role]?.icon} {ROLE_DISPLAY[myGuildMembership?.role]?.name}
                      </Badge>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/60 via-indigo-900/30 to-slate-800/60 border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 text-xl font-black flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-400" />
                    Guild Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guildMembers.map((member) => {
                      const playerData = getMemberPlayerData(member.player_id);
                      return (
                        <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl sm:text-2xl">{ROLE_DISPLAY[member.role]?.icon || '👤'}</span>
                            <div>
                              <p className="text-white font-medium text-sm sm:text-base">{playerData?.username || 'Unknown'}</p>
                              <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2">
                                Level {playerData?.level || 1} • 
                                <span className={ROLE_DISPLAY[member.role]?.color || 'text-slate-400'}>
                                  {ROLE_DISPLAY[member.role]?.name || member.role}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between">
                            <div className="text-left sm:text-right">
                              <p className="text-white font-medium text-sm sm:text-base">{playerData?.soft_currency?.toLocaleString()}</p>
                              <p className="text-slate-400 text-xs sm:text-sm">{member.contribution_points} pts</p>
                            </div>
                            {(myPermissions.manage_roles || isLeader) && member.role !== 'leader' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedMemberForRole(member)}
                                className="border-slate-600"
                              >
                                <UserCog className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {myGuild && (
            <TabsContent value="analytics">
              <GuildAnalytics 
                myGuild={myGuild}
                guildMembers={guildMembers}
                allPlayers={allPlayers}
              />
            </TabsContent>
          )}

          {myGuild && (
            <TabsContent value="bank">
              <div className="space-y-6">
                {/* Treasury Breakdown */}
                <GuildTreasuryBreakdown guildId={myGuild.id} />
                {/* Vault Deposit Card */}
                <Card className="bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-slate-900/40 border-2 border-green-500/60 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 flex items-center gap-3 text-xl font-black">
                      <DollarSign className="w-7 h-7 text-green-400" />
                      Guild Vault
                    </CardTitle>
                    <p className="text-green-200 text-sm">💰 Shared funds for guild upgrades and loans</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Current Vault Balance</p>
                          <p className="text-white text-3xl font-black">
                            {myGuild?.vault_balance !== undefined ? myGuild.vault_balance.toLocaleString() : '0'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Max Capacity</p>
                          <p className="text-yellow-400 text-xl font-bold">
                            {getMaxVaultCapacity(guildUpgrades).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, ((myGuild?.vault_balance || 0) / getMaxVaultCapacity(guildUpgrades)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-slate-400 text-xs mt-2 text-center">
                        {getRemainingVaultCapacity(myGuild?.vault_balance || 0, guildUpgrades).toLocaleString()} remaining capacity
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-white text-sm font-medium">Deposit to Vault</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={vaultDepositAmount}
                          onChange={(e) => setVaultDepositAmount(e.target.value)}
                          placeholder="Amount to deposit..."
                          max={getRemainingVaultCapacity(myGuild?.vault_balance || 0, guildUpgrades)}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Button
                          onClick={() => {
                            const amount = parseInt(vaultDepositAmount);
                            if (amount > 0 && amount <= (player?.soft_currency || 0)) {
                              depositToVaultMutation.mutate(amount);
                            }
                          }}
                          disabled={!vaultDepositAmount || parseInt(vaultDepositAmount) <= 0 || (player?.soft_currency || 0) < parseInt(vaultDepositAmount) || depositToVaultMutation.isPending}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          {depositToVaultMutation.isPending ? 'Depositing...' : 'Deposit'}
                        </Button>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Your balance: {player?.soft_currency?.toLocaleString() || 0} • Earn +{Math.floor(parseInt(vaultDepositAmount || 0) / 10)} contribution points
                      </p>
                      {parseInt(vaultDepositAmount || 0) > getRemainingVaultCapacity(myGuild?.vault_balance || 0, guildUpgrades) && (
                        <p className="text-red-400 text-xs mt-1">
                          ⚠️ Amount exceeds vault capacity! Max deposit: {getRemainingVaultCapacity(myGuild?.vault_balance || 0, guildUpgrades).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Loans */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                      Your Active Loans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(guildLoans || []).filter(l => l.borrower_id === player?.id && l.status === 'active').length === 0 ? (
                        <p className="text-slate-400 text-center py-8 text-sm">No active loans</p>
                        ) : (
                        (guildLoans || []).filter(l => l.borrower_id === player?.id && l.status === 'active').map((loan) => {
                          const totalOwed = loan.amount + (loan.interest_accrued || 0);
                          const canRepay = (player?.soft_currency || 0) >= totalOwed;

                          return (
                            <div key={loan.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-white font-bold">Loan Amount: {loan.amount?.toLocaleString()}</p>
                                  <p className="text-slate-400 text-sm">Interest: {loan.interest_accrued?.toLocaleString() || 0}</p>
                                  <p className="text-orange-400 text-sm font-bold">Total Owed: {totalOwed.toLocaleString()}</p>
                                </div>
                                <Button
                                  onClick={() => repayLoanMutation.mutate(loan.id)}
                                  disabled={!canRepay}
                                  className={canRepay ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700'}
                                >
                                  {canRepay ? 'Repay' : 'Insufficient Funds'}
                                </Button>
                              </div>
                              <div className="text-xs text-slate-400">
                                Due: {new Date(loan.due_date).toLocaleDateString()} • Rate: {(loan.interest_rate * 100).toFixed(1)}%
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                {player && myGuild && (
                  <GuildBank 
                    guild={myGuild}
                    player={player}
                    myGuildMembership={myGuildMembership}
                    guildLoans={guildLoans}
                    allPlayers={allPlayers}
                  />
                )}
              </div>
            </TabsContent>
            )}

          {myGuild && (
            <TabsContent value="upgrades">
              <GuildUpgrades
                guild={myGuild}
                upgrades={guildUpgrades}
                isLeader={isLeader}
                player={player}
                myGuildMembership={myGuildMembership}
              />
            </TabsContent>
          )}

          {myGuild && (
            <TabsContent value="treasury_old">
              {/* AI Advisor */}
              <div className="mb-6">
                <GuildAIAdvisor 
                  guildTreasury={guildTreasury}
                  investmentProposals={investmentProposals}
                  guildId={myGuild.id}
                />
              </div>

              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Guild Treasury</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Balance</p>
                      <p className="text-white text-2xl font-bold">{guildTreasury?.total_balance?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Invested</p>
                      <p className="text-white text-2xl font-bold">{guildTreasury?.invested_amount?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Returns</p>
                      <p className="text-green-400 text-2xl font-bold">+{guildTreasury?.total_returns?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Contribute to Treasury</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          placeholder="Amount..."
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Button
                          onClick={handleDeposit}
                          disabled={!contributionAmount || parseInt(contributionAmount) <= 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Deposit
                        </Button>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Your balance: {player?.soft_currency?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Guild Investment Funds</CardTitle>
                    {canPropose && (
                      <Button onClick={() => setShowProposalDialog(true)} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Propose Investment
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Create proposals for guild-wide investments. All members can vote.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investmentProposals.filter(p => p.status === 'pending').length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-400">No active investment proposals</p>
                        {canPropose && (
                          <Button onClick={() => setShowProposalDialog(true)} size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">
                            Create First Proposal
                          </Button>
                        )}
                      </div>
                    ) : null}
                    {investmentProposals.filter(p => p.status === 'pending').map((proposal) => {
                      const proposer = allPlayers.find(p => p.id === proposal.proposed_by);
                      const voted = hasVoted(proposal.id);
                      const totalVotes = (proposal.votes_for || 0) + (proposal.votes_against || 0);

                      return (
                        <div key={proposal.id} className="p-4 bg-gradient-to-br from-slate-700/30 to-slate-700/10 rounded-lg border border-slate-600/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-purple-500/20 text-purple-400">Investment Fund</Badge>
                                <Badge variant="outline" className="border-slate-600 text-slate-400">
                                  {proposal.ticker}
                                </Badge>
                              </div>
                              <h4 className="text-white font-bold text-lg">Invest ${proposal.amount?.toLocaleString()}</h4>
                              <p className="text-slate-300 text-sm mt-2">{proposal.description}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <p className="text-slate-400 text-xs">Proposed by <span className="text-white font-medium">{proposer?.username}</span></p>
                                <p className="text-slate-400 text-xs">Expires {new Date(proposal.expires_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 bg-slate-800/50 rounded-lg p-3">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-green-400 font-bold">{proposal.votes_for || 0} For</span>
                                <span className="text-red-400 font-bold">{proposal.votes_against || 0} Against</span>
                              </div>
                              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-green-600" 
                                  style={{ width: `${totalVotes > 0 ? ((proposal.votes_for || 0) / totalVotes) * 100 : 50}%` }}
                                />
                              </div>
                              <p className="text-slate-400 text-xs mt-2 text-center">
                                {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {!voted ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: 'for' })}
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              >
                                ✓ Support
                              </Button>
                              <Button
                                onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: 'against' })}
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                              >
                                ✗ Oppose
                              </Button>
                            </div>
                          ) : (
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              ✓ You have voted on this proposal
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {myGuild && (
            <TabsContent value="chat">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="text-white">Guild Chat</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'general', 'treasury', 'wars'].map((channel) => (
                        <Button
                          key={channel}
                          size="sm"
                          variant={chatChannel === channel ? 'default' : 'outline'}
                          onClick={() => setChatChannel(channel)}
                          className={chatChannel === channel ? 'bg-blue-600' : 'border-slate-600'}
                        >
                          {channel}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {filteredMessages.map((msg) => (
                      <div key={msg.id} className={`p-3 rounded-lg ${msg.is_announcement ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-slate-700/30'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{msg.player_name}</span>
                          <span className="text-slate-400 text-xs">{new Date(msg.created_date).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300">{msg.message.replace('/announce ', '')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Type message to #${chatChannel}...`}
                      className="bg-slate-800 border-slate-700 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && newMessage && sendMessageMutation.mutate(newMessage)}
                    />
                    <Button
                      onClick={() => sendMessageMutation.mutate(newMessage)}
                      disabled={!newMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {myGuild && (
            <TabsContent value="wars">
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Active Guild Wars</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {guildWars.filter(w => (w.challenger_guild_id === myGuild.id || w.opponent_guild_id === myGuild.id) && w.status === 'active').length === 0 ? (
                      <p className="text-slate-400 text-center py-8">No active wars. Challenge another guild to start!</p>
                    ) : (
                      <div className="space-y-4">
                        {guildWars.filter(w => (w.challenger_guild_id === myGuild.id || w.opponent_guild_id === myGuild.id) && w.status === 'active').slice(0, 1).map((war) => {
                          const opponentGuild = guilds.find(g => g.id === (war.challenger_guild_id === myGuild.id ? war.opponent_guild_id : war.challenger_guild_id));
                          const isChallenger = war.challenger_guild_id === myGuild.id;
                          const myScore = isChallenger ? war.challenger_score : war.opponent_score;
                          const opponentScore = isChallenger ? war.opponent_score : war.challenger_score;

                          return (
                            <div key={war.id} className="p-6 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl border-2 border-slate-600">
                              {/* Active War Events */}
                              {warEvents.filter(e => e.war_id === war.id && e.status === 'active').map(event => (
                                <WarEventNotification key={event.id} event={event} myGuild={myGuild} />
                              ))}

                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Shield className="w-6 h-6 text-cyan-400" />
                                  <div>
                                    <p className="text-white font-bold text-lg">{myGuild.name} vs {opponentGuild?.name}</p>
                                    <p className="text-slate-400 text-sm">Prize Pool: {war.prize_pool?.toLocaleString()} coins</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <WarCountdownTimer expiresAt={war.expires_at} warStatus={war.status} />
                                  <Badge className={war.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                                    {war.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="text-center bg-blue-600/20 rounded-lg p-3 flex-1">
                                  <p className="text-white text-3xl font-bold">{myScore}</p>
                                  <p className="text-slate-400 text-xs">Your Guild</p>
                                </div>
                                <div className="text-slate-400 text-xl font-bold">VS</div>
                                <div className="text-center bg-red-600/20 rounded-lg p-3 flex-1">
                                  <p className="text-white text-3xl font-bold">{opponentScore}</p>
                                  <p className="text-slate-400 text-xs">Opponent</p>
                                </div>
                              </div>

                              <OpposingGuildMembers 
                                war={war}
                                myGuild={myGuild}
                                opponentGuild={opponentGuild}
                                player={player}
                                onChallengeCreated={() => queryClient.invalidateQueries(['warChallenges'])}
                              />

                              {war.status === 'completed' && (
                                <WarSpoilsPanel 
                                  war={war}
                                  myGuild={myGuild}
                                  isLeader={isLeader}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {canInitiateWar && (
                    <>
                      <GuildWarMatchmaking
                        myGuild={myGuild}
                        guilds={guilds}
                        guildWars={guildWars}
                        onMatchFound={() => queryClient.invalidateQueries(['guildWars'])}
                        canInitiate={canInitiateWar}
                      />
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-white">Manual Challenge</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {guilds.filter(g => {
                              const isMyGuild = g.id === myGuild.id;
                              const isInWar = guildWars.some(w => 
                                (w.challenger_guild_id === g.id || w.opponent_guild_id === g.id) &&
                                (w.status === 'active' || w.status === 'pending')
                              );
                              return !isMyGuild && !isInWar;
                            }).slice(0, 3).map((guild) => (
                              <div key={guild.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Shield className="w-5 h-5 text-cyan-400" />
                                  <div>
                                    <p className="text-white font-medium">{guild.name}</p>
                                    <p className="text-slate-400 text-sm">{guild.member_count} members</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOpponentForWar(guild);
                                    setShowWarInitiation(true);
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Swords className="w-4 h-4 mr-2" />
                                  Challenge
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {myGuild && (
            <TabsContent value="events">
              {/* Rewards Panel */}
              {eventRewards.filter(r => !r.claimed).length > 0 && (
                <div className="mb-6">
                  <RewardClaimPanel
                    rewards={eventRewards}
                    player={player}
                  />
                </div>
              )}

              <Tabs defaultValue="recurring" className="space-y-6">
                <TabsList className="bg-slate-700/50 border border-slate-600">
                  <TabsTrigger value="minigames">🎮 Mini Games</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring Events</TabsTrigger>
                  <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
                  <TabsTrigger value="challenges">Challenges</TabsTrigger>
                  <TabsTrigger value="custom">Custom Events</TabsTrigger>
                </TabsList>

                <TabsContent value="minigames">
                  <PracticeMiniGames player={player} />
                </TabsContent>

                <TabsContent value="recurring">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recurringEvents.map((event) => (
                      <RecurringEventCard
                        key={event.id}
                        event={event}
                        myGuild={myGuild}
                        isLeader={isLeader}
                        onJoin={joinRecurringEventMutation.mutate}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="leaderboards">
                  <EventLeaderboard
                    participations={eventParticipations}
                    guilds={guilds}
                    allPlayers={allPlayers}
                  />
                </TabsContent>

                <TabsContent value="challenges">
                  <div className="grid gap-4">
                    {guildChallenges.map((challenge) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        myGuild={myGuild}
                        isLeader={isLeader}
                        onJoin={joinChallengeMutation.mutate}
                        guilds={guilds}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="minigames">
                  <div className="grid gap-4">
                    {guildMiniGames.map((game) => (
                      <MiniGameCard
                        key={game.id}
                        game={game}
                        myGuild={myGuild}
                        isLeader={isLeader}
                        onJoin={joinMiniGameMutation.mutate}
                        guilds={guilds}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom">
                  <div className="mb-4 flex justify-end">
                    <Button onClick={() => setShowCustomEventDialog(true)} className="bg-pink-600 hover:bg-pink-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Custom Event
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {customEvents.map((event) => {
                      const isParticipating = event.participating_guilds?.includes(myGuild.id);
                      const isCreator = event.created_by_guild === myGuild.id;

                      return (
                        <Card key={event.id} className="bg-slate-800/50 border-slate-700">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white">{event.name}</CardTitle>
                                <p className="text-slate-400 text-sm mt-1">
                                  Created by {guilds.find(g => g.id === event.created_by_guild)?.name || 'Unknown'}
                                </p>
                              </div>
                              <Badge className={
                                event.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                event.status === 'completed' ? 'bg-slate-500/20 text-slate-400' :
                                'bg-blue-500/20 text-blue-400'
                              }>
                                {event.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-300 mb-4">{event.description}</p>
                            
                            <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                              <h4 className="text-white font-bold text-sm mb-2">Custom Rules</h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-slate-300">Scoring: <span className="text-white capitalize">{event.ruleset?.scoring_method?.replace('_', ' ')}</span></p>
                                <p className="text-slate-300">Duration: <span className="text-white">{event.ruleset?.duration_days || 7} days</span></p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-slate-400">
                                {event.participating_guilds?.length || 0} guilds participating
                              </div>
                              {!isParticipating && !isCreator && event.status === 'pending' && (
                                <Badge className="bg-orange-500/20 text-orange-400">Invite Only</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {myGuild && (
            <TabsContent value="tournaments">
              <GuildTournamentManager
                myGuild={myGuild}
                guildTreasury={guildTreasury}
                isLeader={isLeader}
                player={player}
              />
            </TabsContent>
          )}

          <TabsContent value="browse">
            {myGuild && (
              <div className="mb-4">
                <Button 
                  onClick={() => document.querySelector('[value="my-guild"]')?.click()}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to My Guild
                </Button>
              </div>
            )}
            <div className="grid gap-4">
              {guilds.filter(g => g.id !== myGuild?.id).map((guild, index) => (
                <motion.div
                  key={guild.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedGuildForMembers(guild)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <GuildEmblem guild={guild} size="md" showGlow={true} animated={true} showTag={true} />
                          <div>
                            <h3 className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">{guild.name}</h3>
                            {guild.guild_title && (
                              <p className="text-yellow-400 text-xs font-bold">"{guild.guild_title}"</p>
                            )}
                          </div>
                            {!guild.is_public && (
                              <Badge className="bg-orange-500/20 text-orange-400">Private</Badge>
                            )}
                          </div>
                          <p className="text-slate-300 mb-3">{guild.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {guild.member_count}/{guild.max_members} members
                            </span>
                            <span className="flex items-center gap-1">
                              <Crown className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-300 font-bold">
                                {allPlayers.find(p => p.id === guild.leader_id)?.username || 'Unknown'}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {guild.total_portfolio_value?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {!myGuild && guild.is_public && (
                            <Button
                              onClick={() => joinGuildMutation.mutate(guild.id)}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          )}
                          {myGuild && canInitiateWar && (
                            <Button
                              onClick={() => {
                                setSelectedOpponentForWar(guild);
                                setShowWarInitiation(true);
                              }}
                              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                            >
                              <Swords className="w-4 h-4 mr-2" />
                              Challenge
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <GuildLeaderboard 
              guilds={guilds}
              guildMembers={guildMembers}
              allPlayers={allPlayers}
            />
          </TabsContent>

          {myGuild && (
            <TabsContent value="announcements">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Guild Announcements
                    </CardTitle>
                    {myPermissions.create_announcements && (
                      <Button onClick={() => setShowAnnouncementDialog(true)} className="bg-yellow-600 hover:bg-yellow-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Announcement
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guildAnnouncements.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-400">No announcements yet</p>
                      </div>
                    ) : (
                      guildAnnouncements.map((announcement) => (
                        <div key={announcement.id} className={`p-4 rounded-lg border ${
                          announcement.priority === 'urgent' ? 'bg-red-500/10 border-red-500/50' :
                          announcement.priority === 'important' ? 'bg-yellow-500/10 border-yellow-500/50' :
                          'bg-slate-700/30 border-slate-600'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-bold">{announcement.title}</h3>
                                {announcement.is_pinned && (
                                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">Pinned</Badge>
                                )}
                                {announcement.priority !== 'normal' && (
                                  <Badge className={
                                    announcement.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                  }>
                                    {announcement.priority}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-300 text-sm mb-2">{announcement.message}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>By {announcement.author_name}</span>
                                <span>•</span>
                                <span>{new Date(announcement.created_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {myGuild && (
            <>
              <TabsContent value="customize">
                  <GuildCustomization guild={myGuild} isLeader={isLeader} />
                </TabsContent>

                <TabsContent value="diplomacy">
                  <GuildDiplomacy 
                    myGuild={myGuild}
                    guilds={guilds}
                    isLeader={isLeader}
                    canInitiateWar={canInitiateWar}
                  />
                </TabsContent>

              <TabsContent value="rivalries">
              <Card className="bg-gradient-to-br from-orange-900/40 via-red-900/30 to-slate-900/40 border-2 border-orange-500/60 shadow-2xl shadow-orange-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300 flex items-center gap-3 text-2xl font-black">
                        <Swords className="w-8 h-8 text-orange-400" />
                        Guild Rivalries
                      </CardTitle>
                      <p className="text-orange-200 text-sm mt-1">⚔️ Declare rivals for bonus rewards in wars!</p>
                      {myGuild && (
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className="bg-orange-500/20 text-orange-400">
                            {(myGuild.rivalry_declarations_used || 0)}/10 Used
                          </Badge>
                          {myGuild.rivalry_cooldown_reset && (
                            <p className="text-orange-300 text-xs">
                              Resets: {new Date(myGuild.rivalry_cooldown_reset).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {isLeader && (
                      <Button 
                        onClick={() => setShowRivalryDialog(true)} 
                        disabled={(myGuild?.rivalry_declarations_used || 0) >= 10}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        Declare Rivalry
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rivalries.length === 0 ? (
                      <div className="text-center py-12">
                        <Swords className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400 mb-2">No active rivalries</p>
                        <p className="text-slate-500 text-sm">Declare a rivalry to earn bonus rewards in wars!</p>
                      </div>
                    ) : (
                      <div className={rivalries.length > 5 ? "max-h-[600px] overflow-y-auto space-y-4 pr-2" : "space-y-4"}>
                        {rivalries.map((rivalry) => {
                          const isInitiator = rivalry.guild_id === myGuild?.id;
                          const rivalId = isInitiator ? rivalry.rival_guild_id : rivalry.guild_id;
                          const rivalGuild = (guilds || []).find(g => g.id === rivalId);
                          const myWins = isInitiator ? rivalry.guild_wins : rivalry.rival_wins;
                          const theirWins = isInitiator ? rivalry.rival_wins : rivalry.guild_wins;

                          return (
                            <div key={rivalry.id} className="p-4 bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl border-2 border-orange-500/40">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Shield className="w-8 h-8 text-orange-400" />
                                  <div>
                                    <h3 className="text-white font-black text-lg">{rivalGuild?.name || 'Unknown Guild'}</h3>
                                    <p className="text-orange-300 text-sm">Intensity Level {rivalry.intensity_level}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-center">
                                    <p className="text-green-400 text-2xl font-black">{myWins}</p>
                                    <p className="text-slate-400 text-xs">Your Wins</p>
                                  </div>
                                  <span className="text-slate-500 text-xl">-</span>
                                  <div className="text-center">
                                    <p className="text-red-400 text-2xl font-black">{theirWins}</p>
                                    <p className="text-slate-400 text-xs">Their Wins</p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                  <p className="text-yellow-400 text-xs font-bold">XP Bonus</p>
                                  <p className="text-white text-xl font-black">+{((rivalry.bonus_xp_multiplier - 1) * 100).toFixed(0)}%</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                  <p className="text-green-400 text-xs font-bold">Reward Bonus</p>
                                  <p className="text-white text-xl font-black">+{((rivalry.bonus_reward_multiplier - 1) * 100).toFixed(0)}%</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                  <p className="text-purple-400 text-xs font-bold">Wars Fought</p>
                                  <p className="text-white text-xl font-black">{rivalry.total_wars}</p>
                                </div>
                              </div>

                              {canInitiateWar && rivalGuild && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOpponentForWar(rivalGuild);
                                    setShowWarInitiation(true);
                                  }}
                                  className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                >
                                  <Swords className="w-4 h-4 mr-2" />
                                  Challenge Rival (+{((rivalry.bonus_reward_multiplier - 1) * 100).toFixed(0)}% Rewards!)
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        </div>
                        )}
                        </div>
                        </CardContent>
                        </Card>
                        </TabsContent>

            <TabsContent value="audit">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Guild Audit Log
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Track all important guild activities</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {guildAuditLogs.length === 0 ? (
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-400">No activities recorded yet</p>
                      </div>
                    ) : (
                      guildAuditLogs.map((log) => {
                        const actionIcons = {
                          member_joined: '👋',
                          member_left: '👋',
                          member_kicked: '🚫',
                          role_changed: '⬆️',
                          treasury_deposit: '💰',
                          treasury_withdrawal: '💸',
                          war_initiated: '⚔️',
                          upgrade_purchased: '📈',
                          announcement_created: '📢',
                          permission_changed: '🔐',
                          guild_settings_changed: '⚙️'
                        };

                        return (
                          <div key={log.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                            <div className="flex items-start gap-3">
                              <span className="text-xl">{actionIcons[log.action_type] || '📝'}</span>
                              <div className="flex-1">
                                <p className="text-white text-sm">
                                  <span className="font-medium">{log.actor_name}</span>
                                  {' '}
                                  {log.action_type === 'member_joined' && 'joined the guild'}
                                  {log.action_type === 'member_left' && 'left the guild'}
                                  {log.action_type === 'member_kicked' && `kicked ${log.target_name}`}
                                  {log.action_type === 'role_changed' && `changed ${log.target_name}'s role to ${log.details?.new_role}`}
                                  {log.action_type === 'treasury_deposit' && `deposited ${log.amount?.toLocaleString()} coins`}
                                  {log.action_type === 'treasury_withdrawal' && `withdrew ${log.amount?.toLocaleString()} coins`}
                                  {log.action_type === 'war_initiated' && `initiated war against ${log.target_name}`}
                                  {log.action_type === 'upgrade_purchased' && `purchased ${log.target_name}`}
                                  {log.action_type === 'announcement_created' && `created announcement: ${log.details?.title}`}
                                  {log.action_type === 'permission_changed' && `updated permissions for ${log.target_name}`}
                                  {log.action_type === 'guild_settings_changed' && 'updated guild settings'}
                                  {log.action_type === 'vault_deposit' && `deposited ${log.amount?.toLocaleString()} to vault`}
                                  {log.action_type === 'loan_repaid' && `repaid loan of ${log.amount?.toLocaleString()}`}
                                  {log.action_type === 'rivalry_declared' && `declared rivalry with ${log.target_name}`}
                                  </p>
                                <p className="text-slate-400 text-xs mt-1">
                                  {new Date(log.created_date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <Dialog open={showCreateGuild} onOpenChange={setShowCreateGuild}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Guild</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">Guild Creation Cost</p>
                  <p className="text-slate-400 text-sm">One-time fee to establish your guild</p>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-xl font-bold">100</span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-slate-400 text-xs">
                  Your balance: <span className={`font-bold ${(player?.premium_currency || 0) >= 100 ? 'text-green-400' : 'text-red-400'}`}>
                    {player?.premium_currency || 0} gems
                  </span>
                </p>
              </div>
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Guild Name</label>
              <Input
                value={newGuild.name}
                onChange={(e) => setNewGuild(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter guild name..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Description</label>
              <Textarea
                value={newGuild.description}
                onChange={(e) => setNewGuild(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your guild..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateGuild(false)} className="border-slate-600">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGuild} 
                className="bg-cyan-600 hover:bg-cyan-700"
                disabled={(player?.premium_currency || 0) < 100}
              >
                <Gem className="w-4 h-4 mr-2" />
                Create Guild (100 gems)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Member Dialog */}
      <Dialog open={!!selectedMemberForRole} onOpenChange={() => setSelectedMemberForRole(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Member</DialogTitle>
          </DialogHeader>
          {selectedMemberForRole && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Managing {getMemberPlayerData(selectedMemberForRole.player_id)?.username}
              </p>
              
              <div className="space-y-2">
                <p className="text-white text-sm font-medium">Change Role</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ROLE_DISPLAY).filter(([role]) => 
                    role !== 'leader' && ROLE_HIERARCHY[role] <= ROLE_HIERARCHY[myGuildMembership?.role]
                  ).map(([role, display]) => (
                    <Button
                      key={role}
                      onClick={() => changeRoleMutation.mutate({ memberId: selectedMemberForRole.id, newRole: role })}
                      variant={selectedMemberForRole.role === role ? 'default' : 'outline'}
                      className={`justify-start ${selectedMemberForRole.role === role ? 'bg-green-600' : ''}`}
                      disabled={selectedMemberForRole.role === role}
                    >
                      <span className="mr-2">{display.icon}</span>
                      {display.name}
                    </Button>
                  ))}
                </div>
              </div>

              {(isLeader || myPermissions.manage_roles) && (
                <div className="space-y-2">
                  <p className="text-white text-sm font-medium">Custom Permissions</p>
                  <Button
                    onClick={() => {
                      setSelectedMemberForPermissions(selectedMemberForRole);
                      setShowPermissionsDialog(true);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Permissions
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700">
                {myPermissions.kick_members && (
                  <Button
                    onClick={() => kickMemberMutation.mutate(selectedMemberForRole.id)}
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Kick from Guild
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Permissions</DialogTitle>
          </DialogHeader>
          {selectedMemberForPermissions && (
            <div className="space-y-4">
              <p className="text-slate-300 text-sm">
                Customize permissions for {getMemberPlayerData(selectedMemberForPermissions.player_id)?.username}
              </p>
              
              {Object.entries(DEFAULT_PERMISSIONS.leader).map(([perm, defaultValue]) => {
                const currentPerms = getEffectivePermissions(selectedMemberForPermissions);
                const permLabels = {
                  invite_members: 'Invite Members',
                  kick_members: 'Kick Members',
                  manage_roles: 'Manage Roles',
                  initiate_wars: 'Initiate Wars',
                  manage_treasury: 'Manage Treasury',
                  create_announcements: 'Create Announcements',
                  manage_upgrades: 'Manage Upgrades'
                };
                
                return (
                  <div key={perm} className="flex items-center justify-between p-3 bg-slate-800 rounded">
                    <span className="text-white text-sm">{permLabels[perm]}</span>
                    <input
                      type="checkbox"
                      checked={currentPerms[perm] || false}
                      onChange={(e) => {
                        const newPerms = { ...selectedMemberForPermissions.permissions, [perm]: e.target.checked };
                        updatePermissionsMutation.mutate({
                          memberId: selectedMemberForPermissions.id,
                          permissions: newPerms
                        });
                      }}
                      className="w-5 h-5"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Title</label>
              <Input
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Message</label>
              <Textarea
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Announcement details..."
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Priority</label>
              <Select
                value={newAnnouncement.priority}
                onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)} className="border-slate-600">
                Cancel
              </Button>
              <Button
                onClick={() => createAnnouncementMutation.mutate(newAnnouncement)}
                disabled={!newAnnouncement.title || !newAnnouncement.message}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Create Announcement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investment Proposal Dialog */}
      <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Propose Guild Investment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Asset Ticker</label>
              <Input
                value={newProposal.ticker}
                onChange={(e) => setNewProposal(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                placeholder="e.g., AAPL, BTC-USD"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Amount to Invest</label>
              <Input
                type="number"
                value={newProposal.amount}
                onChange={(e) => setNewProposal(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount..."
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-slate-400 text-xs mt-1">
                Treasury balance: {guildTreasury?.total_balance?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Investment Rationale</label>
              <Textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Why should the guild invest in this?"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowProposalDialog(false)} className="border-slate-600">
                Cancel
              </Button>
              <Button 
                onClick={() => createProposalMutation.mutate(newProposal)}
                disabled={!newProposal.ticker || !newProposal.amount}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Submit Proposal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rivalry Dialog */}
      <Dialog open={showRivalryDialog} onOpenChange={setShowRivalryDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-400" />
              Declare Rivalry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-orange-300 text-sm font-bold mb-2">⚔️ Rivalry Benefits</p>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• +25% XP for all war participants</li>
                <li>• +50% reward bonuses</li>
                <li>• Intensity increases with each war</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Select Rival Guild</label>
              {(guilds || []).filter(g => 
                g.id !== myGuild?.id && 
                !(rivalries || []).find(r => 
                  (r.guild_id === myGuild?.id && r.rival_guild_id === g.id) ||
                  (r.rival_guild_id === myGuild?.id && r.guild_id === g.id)
                )
              ).map((guild) => (
                <div key={guild.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{guild.name}</p>
                      <p className="text-slate-400 text-xs">{guild.member_count} members • Level {guild.level || 1}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => declareRivalryMutation.mutate(guild.id)}
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    Declare
                  </Button>
                </div>
              ))}
            </div>

            {(guilds || []).filter(g => 
              g.id !== myGuild?.id && 
              !(rivalries || []).find(r => 
                (r.guild_id === myGuild?.id && r.rival_guild_id === g.id) ||
                (r.rival_guild_id === myGuild?.id && r.guild_id === g.id)
              )
            ).length === 0 && (
              <p className="text-slate-400 text-center py-4 text-sm">
                All available guilds are already rivals!
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Event Dialog */}
      <Dialog open={showCustomEventDialog} onOpenChange={setShowCustomEventDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create Custom Guild Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Event Name</label>
              <Input
                value={newCustomEvent.name}
                onChange={(e) => setNewCustomEvent(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Speed Trading Challenge"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Description & Rules</label>
              <Textarea
                value={newCustomEvent.description}
                onChange={(e) => setNewCustomEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event and rules..."
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Scoring Method</label>
                <Select 
                  value={newCustomEvent.ruleset.scoring_method}
                  onValueChange={(value) => setNewCustomEvent(prev => ({ 
                    ...prev, 
                    ruleset: { ...prev.ruleset, scoring_method: value }
                  }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio_growth">Portfolio Growth</SelectItem>
                    <SelectItem value="total_trades">Total Trades</SelectItem>
                    <SelectItem value="profit_percentage">Profit %</SelectItem>
                    <SelectItem value="combined">Combined Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Duration (days)</label>
                <Input
                  type="number"
                  value={newCustomEvent.ruleset.duration_days}
                  onChange={(e) => setNewCustomEvent(prev => ({ 
                    ...prev, 
                    ruleset: { ...prev.ruleset, duration_days: parseInt(e.target.value) || 7 }
                  }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCustomEventDialog(false)} className="border-slate-600">
                Cancel
              </Button>
              <Button 
                onClick={() => createCustomEventMutation.mutate(newCustomEvent)}
                disabled={!newCustomEvent.name || !newCustomEvent.description}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    {/* War Initiation Modal */}
    <WarInitiationModal
      isOpen={showWarInitiation}
      onClose={() => {
        setShowWarInitiation(false);
        setSelectedOpponentForWar(null);
      }}
      myGuild={myGuild}
      opponentGuild={selectedOpponentForWar}
      onConfirm={() => {
        if (selectedOpponentForWar) {
          challengeGuildMutation.mutate(selectedOpponentForWar.id);
        }
      }}
    />

    {/* Guild Tutorial */}
    {showTutorial && TUTORIALS.guilds && (
      <TutorialOverlay
        tutorial={TUTORIALS.guilds}
        currentStep={tutorialStep}
        onNext={() => setTutorialStep(prev => prev + 1)}
        onPrevious={() => setTutorialStep(prev => prev - 1)}
        onSkip={() => setShowTutorial(false)}
        onComplete={() => {
          setShowTutorial(false);
          if (player) {
            base44.entities.Tutorial.create({
              player_id: player.id,
              tutorial_id: 'guilds',
              completed_steps: [0, 1, 2, 3, 4],
              completed: true
            });
            base44.entities.Player.update(player.id, {
              soft_currency: (player.soft_currency || 0) + 500,
              xp: (player.xp || 0) + 200
            });
            queryClient.invalidateQueries(['player']);
          }
        }}
        targetElement={true}
      />
    )}
    </div>
  </div>
  </>
  );
}