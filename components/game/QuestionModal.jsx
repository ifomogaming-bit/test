import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuestionModal({ 
  question, 
  onAnswer, 
  onClose,
  streak = 0
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Anti-cheat: Detect tab switching / window blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showResult) {
        setTabSwitchCount(prev => prev + 1);
        // Auto-fail on 2+ tab switches
        if (tabSwitchCount >= 1) {
          handleAnswer(null); // Wrong answer
        }
      }
    };

    const handleBlur = () => {
      if (!showResult) {
        setTabSwitchCount(prev => prev + 1);
        if (tabSwitchCount >= 1) {
          handleAnswer(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [showResult, tabSwitchCount]);

  const handleAnswer = (answerIndex) => {
    const correct = answerIndex === question.correctIndex;
    setIsCorrect(correct);
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(correct, answerIndex);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg my-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-3 sm:p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-green-500/20 rounded-full">
                <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                <span className="text-green-400 font-bold text-sm sm:text-base">{question.ticker}</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
                  <Zap className="w-3 h-3 text-orange-400" />
                  <span className="text-orange-400 text-xs font-bold">{streak}x</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Timer & Anti-Cheat Warning */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-400' : 'text-slate-400'}`} />
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-mono ${timeLeft <= 10 ? 'text-red-400' : 'text-slate-400'}`}>
                {timeLeft}s
              </span>
            </div>
            {tabSwitchCount > 0 && !showResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-xs font-bold">
                  ⚠️ Tab switch detected! Stay focused or auto-fail.
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="p-4 sm:p-6">
          <p className="text-base sm:text-lg text-white font-medium mb-4 sm:mb-6 leading-relaxed">
            {question.text}
          </p>

          {/* Answers */}
          <div className="space-y-2 sm:space-y-3">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctIndex;
              
              let buttonClass = 'border-slate-600 hover:border-slate-500 hover:bg-slate-800';
              if (showResult) {
                if (isCorrectAnswer) {
                  buttonClass = 'border-green-500 bg-green-500/20';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass = 'border-red-500 bg-red-500/20';
                }
              } else if (isSelected) {
                buttonClass = 'border-blue-500 bg-blue-500/20';
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => !showResult && handleAnswer(index)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 transition-all ${buttonClass}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-white flex-1 text-sm sm:text-base">{answer}</span>
                    {showResult && isCorrectAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {showResult && isSelected && !isCorrectAnswer && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Result Overlay */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent"
            >
              <div className={`flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8" />
                    <span>Correct! 🎉</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 sm:w-8 h-6 sm:h-8" />
                    <span>Wrong Answer</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}