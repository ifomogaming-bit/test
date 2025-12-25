import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ArrowUpCircle,
  ArrowDownCircle,
  History
} from 'lucide-react';
import NotificationSystem from '@/components/notifications/NotificationSystem';

export default function GuildBankPanel({ guild, player, isLeader, isOfficer, guildMembers, allPlayers }) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedMemberForLoan, setSelectedMemberForLoan] = useState('');
  const queryClient = useQueryClient();

  const { data: bankBalance = 0 } = useQuery({
    queryKey: ['guildBank', guild?.id],
    queryFn: async () => {
      if (!guild?.id) return 0;
      return guild.treasury_balance || 0;
    },
    enabled: !!guild?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['guildBankTransactions', guild?.id],
    queryFn: async () => {
      if (!guild?.id) return [];
      return base44.entities.GuildBankTransaction.filter(
        { guild_id: guild.id },
        '-created_date',
        50
      );
    },
    enabled: !!guild?.id
  });

  const { data: guildLoans = [] } = useQuery({
    queryKey: ['guildLoans', guild?.id],
    queryFn: async () => {
      if (!guild?.id) return [];
      return base44.entities.GuildLoan.filter({ guild_id: guild.id }, '-created_date');
    },
    enabled: !!guild?.id
  });

  const depositMutation = useMutation({
    mutationFn: async (amount) => {
      const newBalance = bankBalance + amount;

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - amount
      });

      await base44.entities.Guild.update(guild.id, {
        treasury_balance: newBalance
      });

      await base44.entities.GuildBankTransaction.create({
        guild_id: guild.id,
        player_id: player.id,
        transaction_type: 'deposit',
        amount,
        balance_after: newBalance,
        notes: `Deposit by ${player.username}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildBank']);
      queryClient.invalidateQueries(['guildBankTransactions']);
      queryClient.invalidateQueries(['player']);
      setDepositAmount('');
      NotificationSystem.notify('Deposit Successful', `Deposited ${depositAmount} coins to guild bank`, 'success');
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount) => {
      const newBalance = bankBalance - amount;

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + amount
      });

      await base44.entities.Guild.update(guild.id, {
        treasury_balance: newBalance
      });

      await base44.entities.GuildBankTransaction.create({
        guild_id: guild.id,
        player_id: player.id,
        transaction_type: 'withdrawal',
        amount,
        balance_after: newBalance,
        notes: `Withdrawal by ${player.username}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildBank']);
      queryClient.invalidateQueries(['guildBankTransactions']);
      queryClient.invalidateQueries(['player']);
      setWithdrawAmount('');
      NotificationSystem.notify('Withdrawal Successful', `Withdrew ${withdrawAmount} coins from guild bank`, 'success');
    }
  });

  const createLoanMutation = useMutation({
    mutationFn: async ({ borrowerId, amount }) => {
      const borrower = allPlayers.find(p => p.id === borrowerId);
      const interestRate = 0.05;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await base44.entities.GuildLoan.create({
        guild_id: guild.id,
        borrower_id: borrowerId,
        principal_amount: amount,
        interest_rate: interestRate,
        total_owed: amount * (1 + interestRate),
        status: 'active',
        approved_by: player.id,
        due_date: dueDate.toISOString()
      });

      await base44.entities.Player.update(borrowerId, {
        soft_currency: (borrower?.soft_currency || 0) + amount
      });

      const newBalance = bankBalance - amount;
      await base44.entities.Guild.update(guild.id, {
        treasury_balance: newBalance
      });

      await base44.entities.GuildBankTransaction.create({
        guild_id: guild.id,
        player_id: player.id,
        transaction_type: 'loan_given',
        amount,
        balance_after: newBalance,
        notes: `Loan to ${borrower?.username}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildBank']);
      queryClient.invalidateQueries(['guildLoans']);
      queryClient.invalidateQueries(['guildBankTransactions']);
      setLoanAmount('');
      setSelectedMemberForLoan('');
      NotificationSystem.notify('Loan Approved', `Guild loan of ${loanAmount} coins approved`, 'success');
    }
  });

  const repayLoanMutation = useMutation({
    mutationFn: async ({ loan, amount }) => {
      const newAmountRepaid = (loan.amount_repaid || 0) + amount;
      const isFullyRepaid = newAmountRepaid >= loan.total_owed;

      await base44.entities.GuildLoan.update(loan.id, {
        amount_repaid: newAmountRepaid,
        status: isFullyRepaid ? 'repaid' : 'active'
      });

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - amount
      });

      const newBalance = bankBalance + amount;
      await base44.entities.Guild.update(guild.id, {
        treasury_balance: newBalance
      });

      await base44.entities.GuildBankTransaction.create({
        guild_id: guild.id,
        player_id: player.id,
        transaction_type: 'loan_repaid',
        amount,
        balance_after: newBalance,
        notes: `Loan repayment from ${player.username}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildBank']);
      queryClient.invalidateQueries(['guildLoans']);
      queryClient.invalidateQueries(['guildBankTransactions']);
      queryClient.invalidateQueries(['player']);
    }
  });

  const myLoans = guildLoans.filter(l => l.borrower_id === player?.id && l.status === 'active');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            Guild Bank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-green-400 text-sm mb-2">Total Balance</p>
            <p className="text-white text-4xl font-bold">{bankBalance?.toLocaleString() || 0}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-slate-400 text-xs">Total Deposits</p>
              <p className="text-white font-bold">
                {transactions.filter(t => t.transaction_type === 'deposit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <Users className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-slate-400 text-xs">Active Loans</p>
              <p className="text-white font-bold">
                {guildLoans.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Deposit & Withdraw</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-white text-sm mb-2 block flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4 text-green-400" />
                  Deposit Coins
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Amount..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button
                    onClick={() => depositMutation.mutate(parseInt(depositAmount))}
                    disabled={!depositAmount || parseInt(depositAmount) <= 0 || (player?.soft_currency || 0) < parseInt(depositAmount)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Deposit
                  </Button>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Your balance: {player?.soft_currency?.toLocaleString() || 0}
                </p>
              </div>

              {(isLeader || isOfficer) && (
                <div>
                  <label className="text-white text-sm mb-2 block flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4 text-red-400" />
                    Withdraw Coins (Officers Only)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Amount..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      onClick={() => withdrawMutation.mutate(parseInt(withdrawAmount))}
                      disabled={!withdrawAmount || parseInt(withdrawAmount) <= 0 || bankBalance < parseInt(withdrawAmount)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Withdraw
                    </Button>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    Bank balance: {bankBalance?.toLocaleString() || 0}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <div className="space-y-4">
            {myLoans.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Active Loans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myLoans.map(loan => {
                    const remaining = loan.total_owed - (loan.amount_repaid || 0);
                    return (
                      <div key={loan.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-bold">Borrowed: {loan.principal_amount.toLocaleString()}</p>
                            <p className="text-red-400 text-sm">Owe: {remaining.toLocaleString()}</p>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            Due: {new Date(loan.due_date).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => repayLoanMutation.mutate({ loan, amount: Math.min(remaining, player?.soft_currency || 0) })}
                          disabled={(player?.soft_currency || 0) < 100}
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Repay {Math.min(remaining, player?.soft_currency || 0).toLocaleString()}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {(isLeader || isOfficer) && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Create Member Loan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Member</label>
                    <select
                      value={selectedMemberForLoan}
                      onChange={(e) => setSelectedMemberForLoan(e.target.value)}
                      className="w-full p-2 rounded bg-slate-700 border-slate-600 text-white"
                    >
                      <option value="">Select member...</option>
                      {guildMembers.map(member => {
                        const playerData = allPlayers.find(p => p.id === member.player_id);
                        return (
                          <option key={member.id} value={member.player_id}>
                            {playerData?.username || 'Unknown'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-sm mb-2 block">Loan Amount</label>
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="Amount..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-slate-400 text-xs mt-1">5% interest • 14 day term</p>
                  </div>
                  <Button
                    onClick={() => createLoanMutation.mutate({ 
                      borrowerId: selectedMemberForLoan, 
                      amount: parseInt(loanAmount) 
                    })}
                    disabled={!selectedMemberForLoan || !loanAmount || parseInt(loanAmount) > bankBalance}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Approve Loan
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Guild Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guildLoans.map(loan => {
                    const borrower = allPlayers.find(p => p.id === loan.borrower_id);
                    return (
                      <div key={loan.id} className="p-3 bg-slate-700/30 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{borrower?.username}</p>
                          <p className="text-slate-400 text-sm">
                            {loan.principal_amount.toLocaleString()} @ {(loan.interest_rate * 100).toFixed(0)}%
                          </p>
                        </div>
                        <Badge className={
                          loan.status === 'repaid' ? 'bg-green-500/20 text-green-400' :
                          loan.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {loan.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.map(tx => {
                  const txPlayer = allPlayers.find(p => p.id === tx.player_id);
                  const isDeposit = tx.transaction_type === 'deposit' || tx.transaction_type === 'loan_repaid';
                  
                  return (
                    <div key={tx.id} className="p-3 bg-slate-700/30 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDeposit ? 
                          <TrendingUp className="w-4 h-4 text-green-400" /> :
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        }
                        <div>
                          <p className="text-white text-sm">{tx.notes}</p>
                          <p className="text-slate-400 text-xs">{new Date(tx.created_date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
                          {isDeposit ? '+' : '-'}{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-slate-400 text-xs">Bal: {tx.balance_after?.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}