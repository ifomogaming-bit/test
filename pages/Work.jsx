import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Briefcase, 
  Clock, 
  Coins,
  TrendingUp,
  BarChart3,
  Search,
  DollarSign,
  Bitcoin,
  PieChart,
  Building,
  Check,
  Loader2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ALL_JOBS = [
  { type: 'data_entry', name: 'Data Entry Clerk', icon: Briefcase, color: 'from-slate-500 to-gray-600', duration: 30, reward: 150, description: 'Simple data entry tasks', level: 1 },
  { type: 'stock_analyst', name: 'Stock Analyst', icon: TrendingUp, color: 'from-blue-500 to-cyan-600', duration: 60, reward: 350, description: 'Analyze market trends', level: 3 },
  { type: 'market_researcher', name: 'Market Researcher', icon: Search, color: 'from-purple-500 to-pink-600', duration: 90, reward: 600, description: 'Research market opportunities', level: 5 },
  { type: 'financial_advisor', name: 'Financial Advisor', icon: DollarSign, color: 'from-green-500 to-emerald-600', duration: 120, reward: 900, description: 'Provide financial guidance', level: 8 },
  { type: 'trading_assistant', name: 'Trading Assistant', icon: BarChart3, color: 'from-indigo-500 to-blue-600', duration: 150, reward: 1300, description: 'Assist with trading operations', level: 12 },
  { type: 'crypto_miner', name: 'Crypto Miner', icon: Bitcoin, color: 'from-orange-500 to-yellow-600', duration: 180, reward: 1800, description: 'Mine digital currencies', level: 15 },
  { type: 'portfolio_manager', name: 'Portfolio Manager', icon: PieChart, color: 'from-pink-500 to-rose-600', duration: 240, reward: 2800, description: 'Manage investment portfolios', level: 20 },
  { type: 'investment_banker', name: 'Investment Banker', icon: Building, color: 'from-purple-600 to-indigo-700', duration: 300, reward: 4200, description: 'High-stakes financial deals', level: 25 },
  { type: 'chart_analyst', name: 'Chart Analyst', icon: BarChart3, color: 'from-cyan-500 to-blue-500', duration: 75, reward: 480, description: 'Analyze price charts', level: 6 },
  { type: 'compliance_officer', name: 'Compliance Officer', icon: Building, color: 'from-red-500 to-pink-500', duration: 100, reward: 720, description: 'Ensure regulatory compliance', level: 10 },
  { type: 'risk_manager', name: 'Risk Manager', icon: TrendingUp, color: 'from-yellow-500 to-orange-500', duration: 135, reward: 1100, description: 'Manage portfolio risks', level: 14 },
  { type: 'derivatives_trader', name: 'Derivatives Trader', icon: DollarSign, color: 'from-green-600 to-teal-600', duration: 200, reward: 2200, description: 'Trade options and futures', level: 18 },
  { type: 'hedge_fund_analyst', name: 'Hedge Fund Analyst', icon: TrendingUp, color: 'from-indigo-600 to-purple-600', duration: 270, reward: 3500, description: 'Analyze hedge fund strategies', level: 23 },
  { type: 'quantitative_analyst', name: 'Quantitative Analyst', icon: BarChart3, color: 'from-purple-600 to-pink-600', duration: 320, reward: 5000, description: 'Build trading algorithms', level: 28 }
];

const MAX_SHIFTS_PER_DAY = 10;

function getDailyJobs(playerLevel) {
  const today = new Date().toDateString();
  let seed = today.split(' ').reduce((acc, val) => acc + val.charCodeAt(0), 0);
  const rng = (s) => {
    let x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  
  const availableJobs = ALL_JOBS.filter(job => playerLevel >= job.level);
  const shuffled = [...availableJobs].sort(() => {
    seed++;
    return rng(seed) - 0.5;
  });
  return shuffled.slice(0, 6);
}

export default function Work() {
  const [user, setUser] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [leftPage, setLeftPage] = useState(false);
  const [dailyJobs, setDailyJobs] = useState([]);
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
      return players[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: activeShifts = [] } = useQuery({
    queryKey: ['workShifts', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const shifts = await base44.entities.WorkShift.filter({ 
        player_id: player.id,
        status: 'in_progress'
      });
      return shifts;
    },
    enabled: !!player?.id,
    refetchInterval: 1000
  });

  const { data: dailyStats } = useQuery({
    queryKey: ['dailyWorkStats', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const today = new Date().toISOString().split('T')[0];
      const stats = await base44.entities.DailyWorkStats.filter({ 
        player_id: player.id,
        date: today
      });
      return stats[0] || null;
    },
    enabled: !!player?.id
  });

  const shiftsCompleted = dailyStats?.shifts_completed || 0;
  const shiftsRemaining = MAX_SHIFTS_PER_DAY - shiftsCompleted;
  const canWork = shiftsRemaining > 0;

  useEffect(() => {
    if (player?.level) {
      setDailyJobs(getDailyJobs(player.level));
    }
  }, [player?.level]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeShifts.length > 0) {
        setLeftPage(true);
      }
    };

    const handleBeforeUnload = () => {
      if (activeShifts.length > 0) {
        setLeftPage(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeShifts]);

  const startShiftMutation = useMutation({
    mutationFn: async (job) => {
      if (activeShifts.length > 0) {
        throw new Error('You can only work one shift at a time');
      }
      if (!canWork) {
        throw new Error('Daily shift limit reached');
      }

      const now = new Date();
      const completesAt = new Date(now.getTime() + job.duration * 1000);
      
      await base44.entities.WorkShift.create({
        player_id: player.id,
        job_type: job.type,
        shift_duration_seconds: job.duration,
        reward_amount: job.reward,
        status: 'in_progress',
        started_at: now.toISOString(),
        completes_at: completesAt.toISOString()
      });

      setLeftPage(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workShifts']);
    }
  });

  const claimShiftMutation = useMutation({
    mutationFn: async (shift) => {
      if (leftPage) {
        throw new Error('You left the page during your shift');
      }

      await base44.entities.WorkShift.update(shift.id, {
        status: 'claimed'
      });

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + shift.reward_amount
      });

      await base44.entities.Transaction.create({
        player_id: player.id,
        type: 'work_payment',
        description: `Completed ${shift.job_type} shift`,
        soft_currency_change: shift.reward_amount
      });

      const today = new Date().toISOString().split('T')[0];
      if (dailyStats) {
        await base44.entities.DailyWorkStats.update(dailyStats.id, {
          shifts_completed: (dailyStats.shifts_completed || 0) + 1,
          total_earned: (dailyStats.total_earned || 0) + shift.reward_amount
        });
      } else {
        await base44.entities.DailyWorkStats.create({
          player_id: player.id,
          date: today,
          shifts_completed: 1,
          total_earned: shift.reward_amount
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workShifts']);
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['dailyWorkStats']);
    }
  });

  // Update time remaining for active shifts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = {};
      
      activeShifts.forEach(shift => {
        const completesAt = new Date(shift.completes_at).getTime();
        const diff = Math.max(0, completesAt - now);
        remaining[shift.id] = diff;
      });
      
      setTimeRemaining(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [activeShifts]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canClaimShift = (shift) => {
    return timeRemaining[shift.id] === 0 && !leftPage;
  };

  const hasActiveShift = activeShifts.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" className="text-white" disabled={hasActiveShift}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-blue-400" />
                  Work Center
                </h1>
                <p className="text-slate-400">Complete shifts to earn coins</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
            </div>
          </div>

          {/* Daily Limit Banner */}
          <div className={`p-4 rounded-xl border ${canWork ? 'bg-blue-500/10 border-blue-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${canWork ? 'text-blue-400' : 'text-red-400'}`} />
                <div>
                  <p className="text-white font-bold">
                    {canWork ? `${shiftsRemaining} Shifts Remaining Today` : 'Daily Limit Reached'}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {canWork 
                      ? `You can work ${shiftsRemaining} more ${shiftsRemaining === 1 ? 'shift' : 'shifts'} today` 
                      : 'Come back tomorrow for more shifts'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-2xl">{shiftsCompleted}/{MAX_SHIFTS_PER_DAY}</p>
                <p className="text-slate-400 text-xs">Completed</p>
              </div>
            </div>
          </div>

          {hasActiveShift && (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <p className="text-white font-bold">
                  {leftPage 
                    ? '⚠️ You left the page! Shift cancelled - no payment will be issued.'
                    : 'Stay on this page to complete your shift and receive payment!'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Active Shift */}
        {activeShifts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Current Shift
            </h2>
            {activeShifts.map(shift => {
              const job = dailyJobs.find(j => j.type === shift.job_type) || ALL_JOBS.find(j => j.type === shift.job_type);
              const Icon = job?.icon || Briefcase;
              const progress = ((shift.shift_duration_seconds * 1000 - timeRemaining[shift.id]) / (shift.shift_duration_seconds * 1000)) * 100;
              const isComplete = canClaimShift(shift);

              return (
                <Card key={shift.id} className={`${leftPage ? 'bg-red-900/30 border-red-500' : 'bg-slate-800'} border-slate-700`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-gradient-to-br ${job?.color} rounded-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl">{job?.name}</h3>
                          <p className="text-slate-400">{shift.shift_duration_seconds}s shift</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-2xl">+{shift.reward_amount}</p>
                        <p className="text-slate-400 text-sm">coins</p>
                      </div>
                    </div>

                    {leftPage ? (
                      <div className="text-center py-4">
                        <p className="text-red-400 font-bold mb-2">⚠️ Shift Cancelled</p>
                        <p className="text-slate-400 text-sm mb-4">You left the page during your shift</p>
                        <Button
                          onClick={() => {
                            base44.entities.WorkShift.update(shift.id, { status: 'claimed' });
                            queryClient.invalidateQueries(['workShifts']);
                          }}
                          variant="outline"
                          className="border-red-500 text-red-400"
                        >
                          Acknowledge
                        </Button>
                      </div>
                    ) : isComplete ? (
                      <Button
                        onClick={() => claimShiftMutation.mutate(shift)}
                        disabled={claimShiftMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
                      >
                        {claimShiftMutation.isPending ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5 mr-2" />
                        )}
                        Claim Reward
                      </Button>
                    ) : (
                      <div>
                        <Progress value={progress} className="mb-3 h-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Time Remaining:</span>
                          <span className="text-white font-bold text-xl">{formatTime(timeRemaining[shift.id] || 0)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* Available Jobs */}
        {!hasActiveShift && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Today's Jobs
            </h2>
            <p className="text-slate-400 text-sm mb-4">Jobs rotate daily - new opportunities tomorrow!</p>
            
            {canWork ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyJobs.map((job, index) => {
                  const Icon = job.icon;
                  const isLocked = (player?.level || 0) < job.level;
                  
                  return (
                    <motion.div
                      key={job.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`bg-slate-800 border-slate-700 ${isLocked ? 'opacity-50' : ''}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={`p-3 bg-gradient-to-br ${job.color} rounded-lg`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            {isLocked && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                Level {job.level}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-white mt-3">{job.name}</CardTitle>
                          <p className="text-slate-400 text-sm">{job.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Duration:
                              </span>
                              <span className="text-white font-medium">{job.duration}s</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                Reward:
                              </span>
                              <span className="text-green-400 font-bold">+{job.reward}</span>
                            </div>
                            <Button
                              onClick={() => startShiftMutation.mutate(job)}
                              disabled={isLocked || hasActiveShift || startShiftMutation.isPending || !canWork}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {isLocked ? 'Locked' : 'Start Shift'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-white font-bold text-xl mb-2">Daily Limit Reached</p>
                <p className="text-slate-400">You've completed {MAX_SHIFTS_PER_DAY} shifts today</p>
                <p className="text-slate-500 text-sm mt-2">Come back tomorrow for more work opportunities!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}