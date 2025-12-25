import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuildTreasuryBreakdown({ guildId }) {
  const { data: transactions = [] } = useQuery({
    queryKey: ['treasuryTransactions', guildId],
    queryFn: async () => {
      if (!guildId) return [];
      return base44.entities.GuildTreasuryTransaction.filter({ guild_id: guildId }, '-created_date', 100);
    },
    enabled: !!guildId
  });

  const last30Days = transactions.filter(t => {
    const date = new Date(t.created_date);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  const income = last30Days.filter(t => t.transaction_type === 'income');
  const expenses = last30Days.filter(t => t.transaction_type === 'expense');

  const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
  const netFlow = totalIncome - totalExpenses;

  const incomeByCategory = income.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const categoryIcons = {
    member_donation: '💰',
    war_victory: '⚔️',
    tournament_prize: '🏆',
    investment_return: '📈',
    raid_spoils: '💎',
    alliance_trade: '🤝',
    guild_upgrade: '⬆️',
    war_entry_fee: '⚔️',
    tournament_entry: '🎯',
    member_loan: '💸'
  };

  const categoryNames = {
    member_donation: 'Member Donations',
    war_victory: 'War Victories',
    tournament_prize: 'Tournament Prizes',
    investment_return: 'Investment Returns',
    raid_spoils: 'Raid Spoils',
    alliance_trade: 'Alliance Trades',
    guild_upgrade: 'Guild Upgrades',
    war_entry_fee: 'War Costs',
    tournament_entry: 'Tournament Fees',
    member_loan: 'Member Loans'
  };

  return (
    <Card className="bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-slate-900/40 border-2 border-green-500/60 shadow-xl">
      <CardHeader>
        <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 flex items-center gap-3 text-xl font-black">
          <PieChart className="w-7 h-7 text-green-400" />
          Treasury Analysis (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-green-600/20 rounded-xl p-4 border-2 border-green-500/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-green-300 text-sm font-bold">Total Income</p>
            </div>
            <p className="text-white text-2xl font-black">
              +{totalIncome.toLocaleString()}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-red-600/20 rounded-xl p-4 border-2 border-red-500/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm font-bold">Total Expenses</p>
            </div>
            <p className="text-white text-2xl font-black">
              -{totalExpenses.toLocaleString()}
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`${netFlow >= 0 ? 'bg-cyan-600/20 border-cyan-500/40' : 'bg-orange-600/20 border-orange-500/40'} rounded-xl p-4 border-2`}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`w-5 h-5 ${netFlow >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
              <p className={`${netFlow >= 0 ? 'text-cyan-300' : 'text-orange-300'} text-sm font-bold`}>Net Flow</p>
            </div>
            <p className={`${netFlow >= 0 ? 'text-green-400' : 'text-red-400'} text-2xl font-black`}>
              {netFlow >= 0 ? '+' : ''}{netFlow.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Detailed Breakdown */}
        <Tabs defaultValue="income" className="space-y-4">
          <TabsList className="bg-slate-800/50 w-full">
            <TabsTrigger value="income" className="flex-1">💰 Income Sources</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1">💸 Expenses</TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">📜 Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-2">
            {Object.keys(incomeByCategory).length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-sm">No income recorded yet</p>
            ) : (
              Object.entries(incomeByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryIcons[category] || '💰'}</span>
                      <span className="text-slate-300 text-sm">{categoryNames[category] || category}</span>
                    </div>
                    <span className="text-green-400 font-bold">+{amount.toLocaleString()}</span>
                  </div>
                ))
            )}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-2">
            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-sm">No expenses recorded yet</p>
            ) : (
              Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryIcons[category] || '💸'}</span>
                      <span className="text-slate-300 text-sm">{categoryNames[category] || category}</span>
                    </div>
                    <span className="text-red-400 font-bold">-{amount.toLocaleString()}</span>
                  </div>
                ))
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-2 max-h-96 overflow-y-auto">
            {last30Days.slice(0, 20).map((tx) => (
              <div key={tx.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryIcons[tx.category] || '💰'}</span>
                      <p className="text-white text-sm font-bold break-words">{categoryNames[tx.category] || tx.category}</p>
                    </div>
                    {tx.description && (
                      <p className="text-slate-400 text-xs break-words">{tx.description}</p>
                    )}
                    {tx.player_name && (
                      <p className="text-slate-500 text-xs mt-1">By {tx.player_name}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${tx.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.transaction_type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(tx.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {last30Days.length === 0 && (
              <p className="text-slate-400 text-center py-6 text-sm">No recent transactions</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}