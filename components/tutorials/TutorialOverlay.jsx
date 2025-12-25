import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';

export default function TutorialOverlay({ 
  tutorial, 
  currentStep, 
  onNext, 
  onPrevious, 
  onSkip, 
  onComplete,
  targetElement 
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const step = tutorial.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorial.steps.length - 1;

  useEffect(() => {
    if (step?.target && targetElement) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2
        });
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, step, targetElement]);

  return (
    <AnimatePresence>
      {step && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onSkip}
          />

          {/* Highlight target element */}
          {step.target && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[101] pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              }}
            >
              <div className="absolute inset-0 border-4 border-cyan-400 rounded-xl animate-pulse" />
            </motion.div>
          )}

          {/* Tutorial card - perfectly centered for all screen sizes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-[102] inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 rounded-2xl border-2 border-purple-500/60 shadow-2xl shadow-purple-500/40 overflow-hidden">
              {/* Header gradient */}
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
              
              <div className="p-6">
                {/* Icon and title */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xl">{tutorial.title}</h3>
                      <p className="text-purple-300 text-sm font-medium">Step {currentStep + 1} of {tutorial.steps.length}</p>
                    </div>
                  </div>
                  <Button
                    onClick={onSkip}
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Step title */}
                <h4 className="text-cyan-300 font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {step.title}
                </h4>

                {/* Step description */}
                <p className="text-slate-300 mb-4 leading-relaxed">{step.description}</p>

                {/* Action hint */}
                {step.action && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
                    <p className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      {step.action}
                    </p>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs">Progress</span>
                    <span className="text-purple-400 text-xs font-bold">{Math.round(((currentStep + 1) / tutorial.steps.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / tutorial.steps.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {!isFirstStep && (
                      <Button
                        onClick={onPrevious}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={onSkip}
                      variant="ghost"
                      className="text-slate-400"
                    >
                      Skip Tutorial
                    </Button>
                  </div>
                  
                  <Button
                    onClick={isLastStep ? onComplete : onNext}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg font-bold"
                  >
                    {isLastStep ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
              </div>
              </div>
              </motion.div>
              </>
              )}
              </AnimatePresence>
              );
              }