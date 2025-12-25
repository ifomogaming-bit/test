import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, ArrowRight, Clock, DollarSign } from 'lucide-react';
import NotificationSystem from '@/components/notifications/NotificationSystem';

export default function GuildBank({ guild, player, myGuildMembership, guildLoans = [], allPlayers = [] }) {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState(7);
  const queryClient = useQueryClient();

  const isLeader = myGuildMembership?.role === 'leader';
  const isOfficer = myGuildMembership?.role === 'officer';
  const canApproveLoan = isLeader || isOfficer;

  const requestLoanMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(loanAmount);
      const interestRate = 0.05;
      const totalOwed = amount * (1 + interestRate);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loanDuration);

      await base44.entities.GuildLoan.create({
        guild_id: guild.id,
        borrower_id: player.id,
        amount,
        interest_rate: interestRate,
        total_owed: totalOwed,
        status: 'active',
        approved_by: guild.leader_id,
        due_date: dueDate.toISOString()
      });

      await base44.entities.Guild.update(guild.id, {
        vault_balance: (guild.vault_balance || 0) - amount
      });

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + amount
      });

      NotificationSystem.notify('Guild Loan Approved', `You received ${amount.toLocaleString()} coins from guild bank`, 'success');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildLoans']);
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['player']);
      setLoanAmount('');
    }
  });

  const repayLoanMutation = useMutation({
    mutationFn: async (loan) => {
      const remaining = loan.total_owed - (loan.amount_repaid || 0);
      const paymentAmount = Math.min(remaining, player.soft_currency || 0);

      const newAmountRepaid = (loan.amount_repaid || 0) + paymentAmount;
      const isFullyRepaid = newAmountRepaid >= loan.total_owed;

      await base44.entities.GuildLoan.update(loan.id, {
        amount_repaid: newAmountRepaid,
        status: isFullyRepaid ? 'repaid' : 'active'
      });

      await base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) - paymentAmount
      });

      await base44.entities.Guild.update(guild.id, {
        vault_balance: (guild.vault_balance || 0) + paymentAmount
      });

      if (isFullyRepaid) {
        await base44.entities.GuildMember.update(myGuildMembership.id, {
          contribution_points: (myGuildMembership.contribution_points || 0) + 50
        });
        NotificationSystem.notify('Loan Repaid!', 'You earned 50 contribution points', 'success');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['guildLoans']);
      queryClient.invalidateQueries(['guilds']);
      queryClient.invalidateQueries(['player']);
      queryClient.invalidateQueries(['guildMembers']);
    }
  });

  const myLoans = guildLoans.filter(l => l.borrower_id === player?.id && l.status === 'active');
  const allActiveLoans = guildLoans.filter(l => l.status === 'active');

  const maxLoanAmount = Math.floor((guild.vault_balance || 0) * 0.3); // Max 30% of vault

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Guild Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Vault Balance</p>
              <p className="text-white text-2xl font-bold">{(guild?.vault_balance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Active Loans</p>
              <p className="text-white text-2xl font-bold">{allActiveLoans.length}</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              Request Guild Loan
            </h4>
            <p className="text-slate-400 text-sm mb-3">
              Borrow from the guild bank at 5% interest. Max loan: {maxLoanAmount.toLocaleString()} coins
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Loan Amount</label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Amount..."
                  max={maxLoanAmount}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Duration (days)</label>
                <Input
                  type="number"
                  value={loanDuration}
                  onChange={(e) => setLoanDuration(parseInt(e.target.value) || 7)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              {loanAmount && parseFloat(loanAmount) > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p className="text-blue-300 text-sm">
                    Total repayment: <span className="font-bold">
                      {Math.round(parseFloat(loanAmount) * 1.05).toLocaleString()}
                    </span> coins (5% interest)
                  </p>
                </div>
              )}
              <Button
                onClick={() => requestLoanMutation.mutate()}
                disabled={!loanAmount || parseFloat(loanAmount) <= 0 || parseFloat(loanAmount) > maxLoanAmount}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              >
                Request Loan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {myLoans.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myLoans.map((loan) => {
                const remaining = loan.total_owed - (loan.amount_repaid || 0);
                const progress = ((loan.amount_repaid || 0) / loan.total_owed) * 100;

                return (
                  <div key={loan.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-bold text-lg">{loan.amount.toLocaleString()} coins</p>
                        <p className="text-slate-400 text-sm">
                          Remaining: {remaining.toLocaleString()} • Due {new Date(loan.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Repaid</span>
                        <span className="text-white">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => repayLoanMutation.mutate(loan)}
                      disabled={(player.soft_currency || 0) < 100}
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      Repay {Math.min(remaining, player.soft_currency || 0).toLocaleString()}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {canApproveLoan && allActiveLoans.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">All Guild Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allActiveLoans.map((loan) => {
                const borrower = allPlayers.find(p => p.id === loan.borrower_id);
                const remaining = loan.total_owed - (loan.amount_repaid || 0);

                return (
                  <div key={loan.id} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{borrower?.username || 'Unknown'}</p>
                        <p className="text-slate-400 text-sm">
                          {loan.amount.toLocaleString()} • {remaining.toLocaleString()} remaining
                        </p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        Due {new Date(loan.due_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}