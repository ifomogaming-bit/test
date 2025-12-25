import { toast } from 'sonner';
import { TrendingUp, Zap, Trophy, Gift, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

export const NotificationSystem = {
  // Market Event Notifications
  marketEvent: (title, message) => {
    toast.success(title, {
      description: message,
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      duration: 5000
    });
  },

  // Credit Score Changes
  creditUpdate: (change, newScore) => {
    const isPositive = change > 0;
    toast(isPositive ? 'Credit Score Increased!' : 'Credit Score Decreased', {
      description: `${isPositive ? '+' : ''}${change} points • New score: ${newScore}`,
      icon: isPositive ? 
        <CheckCircle className="w-5 h-5 text-green-500" /> : 
        <AlertCircle className="w-5 h-5 text-red-500" />,
      duration: 4000
    });
  },

  // Loan Notifications
  loanRepaid: (lenderName, amount) => {
    toast.success('Loan Repaid!', {
      description: `Successfully repaid $${amount.toLocaleString()} to ${lenderName}`,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      duration: 4000
    });
  },

  loanReceived: (borrowerName, amount) => {
    toast.success('Loan Accepted!', {
      description: `${borrowerName} accepted your loan of $${amount.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      duration: 4000
    });
  },

  loanDefaulted: (borrowerName) => {
    toast.error('Loan Defaulted', {
      description: `${borrowerName} defaulted on their loan`,
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      duration: 5000
    });
  },

  // Guild Quest Notifications
  guildQuestStarted: (questTitle) => {
    toast.info('Guild Quest Started!', {
      description: questTitle,
      icon: <Trophy className="w-5 h-5 text-blue-500" />,
      duration: 4000
    });
  },

  guildQuestProgress: (questTitle, progress, target) => {
    const percentage = Math.round((progress / target) * 100);
    toast(`Guild Quest Progress: ${percentage}%`, {
      description: `${questTitle} - ${progress}/${target}`,
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      duration: 3000
    });
  },

  guildQuestCompleted: (questTitle, rewards) => {
    toast.success('Guild Quest Completed! 🎉', {
      description: `${questTitle} - Rewards: ${rewards}`,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      duration: 5000
    });
  },

  // Cooldown Reset
  cooldownReset: () => {
    toast.success('Cooldown Reset!', {
      description: 'You can now play again!',
      icon: <Zap className="w-5 h-5 text-green-500" />,
      duration: 3000
    });
  },

  // Daily Bonus
  dailyBonus: (reward) => {
    toast.success('Daily Bonus!', {
      description: `You received ${reward}`,
      icon: <Gift className="w-5 h-5 text-purple-500" />,
      duration: 4000
    });
  },

  // Generic notification
  notify: (title, message, type = 'info') => {
    const config = {
      success: { icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
      error: { icon: <AlertCircle className="w-5 h-5 text-red-500" /> },
      info: { icon: <Zap className="w-5 h-5 text-blue-500" /> }
    }[type] || {};

    toast[type](title, {
      description: message,
      ...config,
      duration: 4000
    });
  }
};

export default NotificationSystem;