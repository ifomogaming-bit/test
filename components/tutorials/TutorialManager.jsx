import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TutorialOverlay from './TutorialOverlay';
import { TUTORIALS, getNextTutorial } from './TutorialContent';
import { Button } from '@/components/ui/button';
import { GraduationCap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TutorialManager({ player, triggerTutorial = null }) {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const queryClient = useQueryClient();

  const { data: completedTutorials = [] } = useQuery({
    queryKey: ['tutorials', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const tutorials = await base44.entities.Tutorial.filter({ player_id: player.id, completed: true });
      return tutorials.map(t => t.tutorial_id);
    },
    enabled: !!player?.id
  });

  const { data: inProgressTutorial } = useQuery({
    queryKey: ['inProgressTutorial', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const tutorials = await base44.entities.Tutorial.filter({ player_id: player.id, completed: false });
      return tutorials[0] || null;
    },
    enabled: !!player?.id
  });

  const updateTutorialMutation = useMutation({
    mutationFn: async ({ tutorialId, step, completed }) => {
      if (!player?.id) return;

      const existing = await base44.entities.Tutorial.filter({ 
        player_id: player.id, 
        tutorial_id: tutorialId 
      });

      if (existing.length > 0) {
        const tutorial = existing[0];
        const newSteps = [...new Set([...(tutorial.completed_steps || []), step])];
        
        await base44.entities.Tutorial.update(tutorial.id, {
          completed_steps: newSteps,
          completed: completed || false
        });
      } else {
        await base44.entities.Tutorial.create({
          player_id: player.id,
          tutorial_id: tutorialId,
          completed_steps: [step],
          completed: completed || false
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tutorials']);
      queryClient.invalidateQueries(['inProgressTutorial']);
    }
  });

  // Check for new player or suggested tutorial
  useEffect(() => {
    if (!player?.id || !completedTutorials) return;

    // If there's a specific tutorial trigger, use it
    if (triggerTutorial && !completedTutorials.includes(triggerTutorial)) {
      setActiveTutorial(triggerTutorial);
      setCurrentStep(0);
      return;
    }

    // Auto-start welcome tutorial for brand new players - but only once every 6 hours
    if (player.level === 1 && player.total_bubbles_popped === 0 && completedTutorials.length === 0) {
      const lastPromptTime = localStorage.getItem('lastTutorialPrompt');
      const now = Date.now();
      const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      
      if (!lastPromptTime || (now - parseInt(lastPromptTime)) > sixHours) {
        setTimeout(() => {
          setShowPrompt(true);
          localStorage.setItem('lastTutorialPrompt', now.toString());
        }, 2000);
      }
    }
  }, [player, completedTutorials, triggerTutorial]);

  const handleStartTutorial = (tutorialId) => {
    setActiveTutorial(tutorialId);
    setCurrentStep(0);
    setShowPrompt(false);
  };

  const handleNext = () => {
    const tutorial = TUTORIALS[activeTutorial];
    if (!tutorial) return;

    updateTutorialMutation.mutate({
      tutorialId: activeTutorial,
      step: currentStep,
      completed: false
    });

    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    updateTutorialMutation.mutate({
      tutorialId: activeTutorial,
      step: currentStep,
      completed: true
    });

    // Award completion bonus
    const rewards = {
      welcome: { coins: 500, xp: 100 },
      skill_tree: { coins: 300, xp: 150 },
      loot_boxes: { gems: 5, xp: 100 },
      guilds: { coins: 500, xp: 200 },
      pvp: { coins: 400, xp: 150, gems: 3 }
    };

    const reward = rewards[activeTutorial];
    if (reward && player) {
      base44.entities.Player.update(player.id, {
        soft_currency: (player.soft_currency || 0) + (reward.coins || 0),
        premium_currency: (player.premium_currency || 0) + (reward.gems || 0),
        xp: (player.xp || 0) + (reward.xp || 0)
      });

      base44.entities.Transaction.create({
        player_id: player.id,
        type: 'achievement',
        description: `Tutorial Completed: ${TUTORIALS[activeTutorial].title}`,
        soft_currency_change: reward.coins || 0,
        premium_currency_change: reward.gems || 0
      });

      queryClient.invalidateQueries(['player']);
    }

    queryClient.invalidateQueries(['tutorials']);
    queryClient.invalidateQueries(['inProgressTutorial']);
    setActiveTutorial(null);
    setCurrentStep(0);
    setShowPrompt(false);
  };

  const handleSkip = () => {
    if (activeTutorial) {
      updateTutorialMutation.mutate({
        tutorialId: activeTutorial,
        step: currentStep,
        completed: true
      });
    }
    queryClient.invalidateQueries(['tutorials']);
    queryClient.invalidateQueries(['inProgressTutorial']);
    setActiveTutorial(null);
    setCurrentStep(0);
    setShowPrompt(false);
  };

  const tutorial = activeTutorial ? TUTORIALS[activeTutorial] : null;
  const nextTutorialId = getNextTutorial(completedTutorials);

  return (
    <>
      {/* Tutorial prompt for new players */}
      <AnimatePresence>
        {showPrompt && nextTutorialId && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-8 right-4 z-50 max-w-sm"
          >
            <div className="bg-gradient-to-br from-purple-900 via-pink-900/50 to-purple-900 rounded-2xl border-2 border-purple-500 shadow-2xl shadow-purple-500/60 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black">New Here?</h3>
                    <p className="text-purple-300 text-sm">Let's show you around!</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPrompt(false)}
                  variant="ghost"
                  size="icon"
                  className="text-slate-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-slate-300 text-sm mb-4">
                Take a quick tour to learn the basics and earn bonus rewards!
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPrompt(false)}
                  variant="outline"
                  className="flex-1 border-slate-600"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => handleStartTutorial(nextTutorialId)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold"
                >
                  Start Tour
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active tutorial overlay */}
      {tutorial && (
        <TutorialOverlay
          tutorial={tutorial}
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          onComplete={handleComplete}
          targetElement={true}
        />
      )}
    </>
  );
}

// Helper hook to trigger tutorials from any page
export function useTutorialTrigger(tutorialId, player) {
  const [shouldTrigger, setShouldTrigger] = useState(false);

  const { data: completed = false } = useQuery({
    queryKey: ['tutorialCompleted', player?.id, tutorialId],
    queryFn: async () => {
      if (!player?.id) return false;
      const tutorials = await base44.entities.Tutorial.filter({ 
        player_id: player.id, 
        tutorial_id: tutorialId,
        completed: true 
      });
      return tutorials.length > 0;
    },
    enabled: !!player?.id
  });

  return {
    shouldShowTutorial: !completed,
    triggerTutorial: () => setShouldTrigger(true),
    resetTrigger: () => setShouldTrigger(false),
    isTriggered: shouldTrigger
  };
}