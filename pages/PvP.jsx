import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Swords, 
  Trophy,
  Users,
  Clock,
  Zap,
  Crown,
  Medal,
  Target,
  CheckCircle,
  XCircle,
  Loader2,
  Coins,
  Gem,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PvPLobby from '@/components/pvp/PvPLobby';
import QuestionModal from '@/components/game/QuestionModal';
import { generateQuestion } from '@/components/game/gameUtils';
import TutorialOverlay from '@/components/tutorials/TutorialOverlay';
import { TUTORIALS } from '@/components/tutorials/TutorialContent';
import { useTutorialTrigger } from '@/components/tutorials/TutorialManager';

export default function PvP() {
  const [user, setUser] = useState(null);
  const [inMatch, setInMatch] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [matchResult, setMatchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
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

  const { data: pendingChallenges = [] } = useQuery({
    queryKey: ['pendingChallenges', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      return base44.entities.PvPChallenge.filter({ 
        opponent_id: player.id, 
        status: 'pending' 
      });
    },
    enabled: !!player?.id,
    refetchInterval: 5000
  });

  const { data: recentMatches = [] } = useQuery({
    queryKey: ['recentMatches', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const challenges = await base44.entities.PvPChallenge.filter({ 
        status: 'completed' 
      }, '-created_date', 10);
      return challenges.filter(c => c.challenger_id === player.id || c.opponent_id === player.id);
    },
    enabled: !!player?.id
  });

  const { shouldShowTutorial } = useTutorialTrigger('pvp', player);

  useEffect(() => {
    if (shouldShowTutorial && !showTutorial && !inMatch && player) {
      setTimeout(() => setShowTutorial(true), 800);
    }
  }, [shouldShowTutorial, inMatch, player]);

  const updatePlayerMutation = useMutation({
    mutationFn: (data) => base44.entities.Player.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries(['player'])
  });

  const startMatch = async (mode) => {
    setIsSearching(true);
    
    // Simulate finding an opponent (in real implementation, this would be matchmaking)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSearching(false);
    setInMatch(true);
    setMatchData({
      mode,
      opponent: {
        username: 'StockMaster99',
        level: Math.floor(Math.random() * 20) + 5,
        rating: 1000 + Math.floor(Math.random() * 500)
      }
    });
    setPlayerScore(0);
    setOpponentScore(0);
    setQuestionsAnswered(0);
    setUsedQuestions(new Set());
    
    // Start first question with tracking
    const firstQuestion = generateQuestion('AAPL', 5);
    setUsedQuestions(new Set([firstQuestion.text]));
    setCurrentQuestion(firstQuestion);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setPlayerScore(prev => prev + 1);
    }
    
    // Simulate opponent answer (random for demo)
    const opponentCorrect = Math.random() > 0.4;
    if (opponentCorrect) {
      setOpponentScore(prev => prev + 1);
    }
    
    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    setCurrentQuestion(null);
    
    // Check if match is over (10 questions)
    if (newQuestionsAnswered >= 10) {
      endMatch();
    } else {
      // Next question after delay - ensure no repeats
      setTimeout(() => {
        const tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'BTC-USD', 'ETH-USD'];
        let newQuestion;
        let attempts = 0;
        
        // Generate unique question (max 20 attempts)
        do {
          newQuestion = generateQuestion(
            tickers[Math.floor(Math.random() * tickers.length)],
            Math.floor(Math.random() * 10) + 1 // Random difficulty 1-10
          );
          attempts++;
        } while (usedQuestions.has(newQuestion.text) && attempts < 20);
        
        setUsedQuestions(prev => new Set([...prev, newQuestion.text]));
        setCurrentQuestion(newQuestion);
      }, 1500);
    }
  };

  const endMatch = async () => {
    const isWinner = playerScore > opponentScore;
    const isDraw = playerScore === opponentScore;
    
    setMatchResult({
      winner: isWinner,
      draw: isDraw,
      playerScore,
      opponentScore
    });
    
    // Update player stats
    const ratingChange = isWinner ? 25 : isDraw ? 0 : -15;
    const coinsReward = isWinner ? 200 : isDraw ? 50 : 25;
    const xpReward = isWinner ? 150 : isDraw ? 50 : 25;
    const gemsReward = isWinner ? 3 : 0;

    await updatePlayerMutation.mutateAsync({
      pvp_rating: Math.max(0, (player.pvp_rating || 1000) + ratingChange),
      pvp_wins: (player.pvp_wins || 0) + (isWinner ? 1 : 0),
      pvp_losses: (player.pvp_losses || 0) + (isWinner || isDraw ? 0 : 1),
      soft_currency: (player.soft_currency || 0) + coinsReward,
      xp: (player.xp || 0) + xpReward,
      premium_currency: (player.premium_currency || 0) + gemsReward
    });
    
    // Record transaction
    await base44.entities.Transaction.create({
      player_id: player.id,
      type: 'pvp_reward',
      description: `PvP ${isWinner ? 'Victory' : isDraw ? 'Draw' : 'Match'}`,
      soft_currency_change: coinsReward
    });
  };

  const exitMatch = () => {
    setInMatch(false);
    setMatchData(null);
    setMatchResult(null);
    setCurrentQuestion(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setQuestionsAnswered(0);
    setUsedQuestions(new Set());
  };

  // Anti-cheat: Prevent leaving page during match
  useEffect(() => {
    if (inMatch && !matchResult) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Leaving will forfeit your match!';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [inMatch, matchResult]);

  if (isSearching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-t-red-500 border-r-transparent border-b-red-500/50 border-l-transparent"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Finding Opponent...</h2>
          <p className="text-slate-400">This may take a few moments</p>
          <Button onClick={() => setIsSearching(false)} variant="outline" className="mt-6 border-slate-600 text-slate-300">
            Cancel
          </Button>
        </motion.div>
      </div>
    );
  }

  if (inMatch && !matchResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Match Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">{player?.username?.[0] || 'P'}</span>
                </div>
                <p className="text-white font-bold">{player?.username}</p>
                <p className="text-slate-400 text-xs">Level {player?.level || 1}</p>
              </div>
              <div className="text-4xl font-bold text-green-400">{playerScore}</div>
            </div>
            
            <div className="text-center">
              <Swords className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-slate-400">Question {questionsAnswered + 1}/10</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-red-400">{opponentScore}</div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">{matchData?.opponent?.username?.[0] || 'O'}</span>
                </div>
                <p className="text-white font-bold">{matchData?.opponent?.username}</p>
                <p className="text-slate-400 text-xs">Level {matchData?.opponent?.level}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={(questionsAnswered / 10) * 100} className="h-2 mb-8" />
          
          {/* Question Area */}
          {currentQuestion ? (
            <QuestionModal
              question={currentQuestion}
              onAnswer={handleAnswer}
              onClose={() => {}}
            />
          ) : (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-slate-400 animate-spin" />
              <p className="text-slate-400">Loading next question...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (matchResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center"
        >
          {matchResult.winner ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Crown className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
              </motion.div>
              <h2 className="text-3xl font-bold text-green-400 mb-2">Victory!</h2>
              <p className="text-slate-400 mb-6">You dominated the competition!</p>
            </>
          ) : matchResult.draw ? (
            <>
              <Medal className="w-20 h-20 mx-auto mb-4 text-slate-400" />
              <h2 className="text-3xl font-bold text-slate-300 mb-2">Draw!</h2>
              <p className="text-slate-400 mb-6">Evenly matched opponents</p>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 mx-auto mb-4 text-red-400" />
              <h2 className="text-3xl font-bold text-red-400 mb-2">Defeat</h2>
              <p className="text-slate-400 mb-6">Better luck next time!</p>
            </>
          )}
          
          {/* Score */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{matchResult.playerScore}</p>
              <p className="text-slate-400 text-sm">Your Score</p>
            </div>
            <span className="text-2xl text-slate-500">-</span>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{matchResult.opponentScore}</p>
              <p className="text-slate-400 text-sm">Opponent</p>
            </div>
          </div>
          
          {/* Rewards */}
          <div className="p-4 bg-slate-900/50 rounded-xl mb-6">
            <p className="text-slate-400 text-sm mb-2">Rewards</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Trophy className={`w-5 h-5 ${matchResult.winner ? 'text-green-400' : matchResult.draw ? 'text-slate-400' : 'text-red-400'}`} />
                <span className={matchResult.winner ? 'text-green-400' : matchResult.draw ? 'text-slate-400' : 'text-red-400'}>
                  {matchResult.winner ? '+25' : matchResult.draw ? '±0' : '-15'} Rating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400">
                  +{matchResult.winner ? 200 : matchResult.draw ? 50 : 25}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400">
                  +{matchResult.winner ? 150 : matchResult.draw ? 50 : 25} XP
                </span>
              </div>
              {matchResult.winner && (
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400">+3</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={exitMatch} variant="outline" className="flex-1 border-slate-600 text-slate-300">
              Back to Lobby
            </Button>
            <Button onClick={() => {
              exitMatch();
              startMatch(matchData?.mode || 'casual');
            }} className="flex-1 bg-red-600 hover:bg-red-700">
              Play Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full p-4 md:p-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="border-red-500/50 text-white hover:bg-red-500/20 hover:border-red-400 shadow-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Swords className="w-8 h-8 text-red-400" />
                PvP Arena
              </h1>
              <p className="text-slate-400">Challenge players worldwide</p>
            </div>
          </div>
        </div>

        <PvPLobby
          player={player}
          onCreateChallenge={startMatch}
          onJoinChallenge={(id) => {}}
          pendingChallenges={pendingChallenges}
          recentMatches={recentMatches}
        />

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Recent Matches</h3>
            <div className="space-y-3">
              {recentMatches.slice(0, 5).map(match => {
                const isWinner = match.winner_id === player?.id;
                const isDraw = !match.winner_id;
                const isChallenger = match.challenger_id === player?.id;
                const opponentName = isChallenger ? match.opponent_name : match.challenger_name;
                const myScore = isChallenger ? match.challenger_score : match.opponent_score;
                const theirScore = isChallenger ? match.opponent_score : match.challenger_score;
                
                return (
                  <div key={match.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {isWinner ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : isDraw ? (
                        <Medal className="w-8 h-8 text-slate-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">vs {opponentName || 'Unknown'}</p>
                        <p className="text-slate-400 text-xs">
                          {new Date(match.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isWinner ? 'text-green-400' : isDraw ? 'text-slate-400' : 'text-red-400'}`}>
                        {myScore} - {theirScore}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {isWinner ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* PvP Tutorial */}
        {showTutorial && TUTORIALS.pvp && (
          <TutorialOverlay
            tutorial={TUTORIALS.pvp}
            currentStep={tutorialStep}
            onNext={() => setTutorialStep(prev => prev + 1)}
            onPrevious={() => setTutorialStep(prev => prev - 1)}
            onSkip={() => setShowTutorial(false)}
            onComplete={() => {
              setShowTutorial(false);
              if (player) {
                base44.entities.Tutorial.create({
                  player_id: player.id,
                  tutorial_id: 'pvp',
                  completed_steps: [0, 1, 2, 3, 4],
                  completed: true
                });
                base44.entities.Player.update(player.id, {
                  soft_currency: (player.soft_currency || 0) + 400,
                  premium_currency: (player.premium_currency || 0) + 3,
                  xp: (player.xp || 0) + 150
                });
                queryClient.invalidateQueries(['player']);
              }
            }}
            targetElement={true}
          />
        )}
      </div>
    </div>
  );
}