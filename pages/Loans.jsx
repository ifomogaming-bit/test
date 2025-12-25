import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Coins, Clock, Users, DollarSign, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CreditScoreDisplay, { getInterestRate } from '@/components/credit/CreditScoreDisplay';
import NotificationSystem from '@/components/notifications/NotificationSystem';

export default function Loans() {
  const [user, setUser] = useState(null);
  const [newLoan, setNewLoan] = useState({
    principal_amount: 5000,
    duration_days: 7
  });
  const [selectedBorrower, setSelectedBorrower] = useState('');
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

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => base44.entities.Player.list('-created_date', 50)
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list('-created_date', 100)
  });

  const createLoanMutation = useMutation({
    mutationFn: async () => {
      // Validate player can afford loan
      if ((player.soft_currency || 0) < newLoan.principal_amount) {
        throw new Error('Insufficient funds');
      }

      const borrower = allPlayers.find(p => p.id === selectedBorrower);
      const interestRate = getInterestRate(borrower?.credit_score || 600);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + newLoan.duration_days);
      const totalOwed = newLoan.principal_amount * (1 + interestRate);

      await base44.entities.Loan.create({
        lender_id: player.id,
        borrower_id: selectedBorrower,
        principal_amount: newLoan.principal_amount,
        interest_rate: interestRate,
        total_owed: totalOwed,
        due_date: dueDate.toISOString(),
        status: 'pending'
      });

      NotificationSystem.notify('Loan Offered', `Loan of $${newLoan.principal_amount.toLocaleString()} offered at ${(interestRate * 100).toFixed(1)}% interest`, 'success');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loans']);
      setSelectedBorrower('');
    }
  });

  const acceptLoanMutation = useMutation({
    mutationFn: async (loan) => {
      await base44.entities.Loan.update(loan.id, {
        status: 'active',
        accepted_at: new Date().toISOString()
      });

      await base44.entities.Player.update(loan.borrower_id, {
        soft_currency: (player.soft_currency || 0) + loan.principal_amount,
        credit_score: Math.min(900, (player.credit_score || 600) + 5)
      });

      const lender = allPlayers.find(p => p.id === loan.lender_id);
      await base44.entities.Player.update(loan.lender_id, {
        soft_currency: (lender?.soft_currency || 0) - loan.principal_amount,
        credit_score: Math.min(900, (lender?.credit_score || 600) + 5)
      });

      NotificationSystem.loanReceived(player.username, loan.principal_amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loans']);
      queryClient.invalidateQueries(['player']);
    }
  });

  const repayLoanMutation = useMutation({
    mutationFn: async ({ loan, amount }) => {
      // Validate player can afford repayment
      if ((player.soft_currency || 0) < amount) {
        throw new Error('Insufficient funds');
      }

      const newAmountRepaid = (loan.amount_repaid || 0) + amount;
      const isFullyRepaid = newAmountRepaid >= loan.total_owed;

      await base44.entities.Loan.update(loan.id, {
        amount_repaid: newAmountRepaid,
        status: isFullyRepaid ? 'repaid' : 'active'
      });

      const newBalance = Math.max(0, (player.soft_currency || 0) - amount);
      const creditBoost = isFullyRepaid ? 15 : 5;
      await base44.entities.Player.update(loan.borrower_id, {
        soft_currency: newBalance,
        credit_score: Math.min(900, (player.credit_score || 600) + creditBoost)
      });

      const lender = allPlayers.find(p => p.id === loan.lender_id);
      await base44.entities.Player.update(loan.lender_id, {
        soft_currency: (lender?.soft_currency || 0) + amount,
        credit_score: Math.min(900, (lender?.credit_score || 600) + (isFullyRepaid ? 10 : 3))
      });

      if (isFullyRepaid) {
        NotificationSystem.loanRepaid(lender?.username, amount);
        NotificationSystem.creditUpdate(creditBoost, (player.credit_score || 600) + creditBoost);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loans']);
      queryClient.invalidateQueries(['player']);
    }
  });

  const myLoansAsLender = loans.filter(l => l.lender_id === player?.id);
  const myLoansAsBorrower = loans.filter(l => l.borrower_id === player?.id);
  const pendingLoansForMe = loans.filter(l => l.borrower_id === player?.id && l.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-1">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-400" />
                Player Loans
              </h1>
              <p className="text-slate-400">Lend and borrow with other players</p>
            </div>
            <Link to={createPageUrl('Wagers')}>
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-bold">
                <Target className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Wagers</span>
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">{player?.soft_currency?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Offer Loan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CreditScoreDisplay score={player?.credit_score || 600} showDetails={true} />
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Borrower</label>
                <select
                  value={selectedBorrower}
                  onChange={(e) => setSelectedBorrower(e.target.value)}
                  className="w-full p-2 rounded bg-slate-700 border-slate-600 text-white"
                >
                  <option value="">Select player...</option>
                  {allPlayers.filter(p => p.id !== player?.id).map(p => (
                    <option key={p.id} value={p.id}>{p.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Loan Amount</label>
                <Input
                  type="number"
                  value={newLoan.principal_amount}
                  onChange={(e) => setNewLoan({...newLoan, principal_amount: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Interest Rate</label>
                <div className="bg-slate-700 border border-slate-600 rounded p-2 text-center">
                  <span className="text-white font-bold text-lg">
                    {selectedBorrower ? 
                      `${(getInterestRate(allPlayers.find(p => p.id === selectedBorrower)?.credit_score || 600) * 100).toFixed(1)}%` 
                      : '—'}
                  </span>
                  <p className="text-slate-400 text-xs mt-1">Based on borrower's credit</p>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Duration (days)</label>
                <Input
                  type="number"
                  value={newLoan.duration_days}
                  onChange={(e) => setNewLoan({...newLoan, duration_days: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {selectedBorrower && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p className="text-blue-300 text-sm">
                    Total repayment: <span className="font-bold">
                      {Math.round(newLoan.principal_amount * (1 + getInterestRate(allPlayers.find(p => p.id === selectedBorrower)?.credit_score || 600))).toLocaleString()}
                    </span> coins
                  </p>
                </div>
              )}

              <Button
                onClick={() => createLoanMutation.mutate()}
                disabled={!selectedBorrower || (player?.soft_currency || 0) < newLoan.principal_amount}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Offer Loan
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {pendingLoansForMe.length > 0 && (
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Loan Offers for You</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingLoansForMe.map(loan => {
                      const lender = allPlayers.find(p => p.id === loan.lender_id);
                      return (
                        <div key={loan.id} className="p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-white font-bold">From: {lender?.username}</p>
                              <p className="text-green-400 text-lg font-bold">{loan.principal_amount.toLocaleString()} coins</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-400 text-sm">Interest: {(loan.interest_rate * 100).toFixed(1)}%</p>
                              <p className="text-white font-bold">Repay: {loan.total_owed.toLocaleString()}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => acceptLoanMutation.mutate(loan)}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            Accept Loan
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Borrowed Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myLoansAsBorrower.filter(l => l.status === 'active').map(loan => {
                    const lender = allPlayers.find(p => p.id === loan.lender_id);
                    const remaining = loan.total_owed - (loan.amount_repaid || 0);
                    return (
                      <div key={loan.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white font-bold">From: {lender?.username}</p>
                            <p className="text-red-400 font-bold">Owe: {remaining.toLocaleString()} coins</p>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            Due: {new Date(loan.due_date).toLocaleDateString()}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => repayLoanMutation.mutate({ loan, amount: Math.min(remaining, player?.soft_currency || 0) })}
                          disabled={(player?.soft_currency || 0) < 100}
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          Repay {Math.min(remaining, player?.soft_currency || 0).toLocaleString()}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Lent Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myLoansAsLender.map(loan => {
                    const borrower = allPlayers.find(p => p.id === loan.borrower_id);
                    return (
                      <div key={loan.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold">To: {borrower?.username}</p>
                            <p className="text-slate-400 text-sm">{loan.principal_amount.toLocaleString()} @ {(loan.interest_rate * 100).toFixed(1)}%</p>
                          </div>
                          <Badge className={
                            loan.status === 'repaid' ? 'bg-green-500/20 text-green-400' :
                            loan.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }>
                            {loan.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}