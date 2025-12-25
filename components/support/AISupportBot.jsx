import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function AISupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your Stock Market Trading Game assistant. I can help with gameplay questions, technical issues, account problems, or any concerns you have. What can I help you with today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser?.email) {
          const players = await base44.entities.Player.filter({ created_by: currentUser.email });
          if (players[0]) setPlayer(players[0]);
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build context about the player and game
      const gameContext = `
You are a helpful AI support assistant for a Stock Market Trading Game. Here's what you need to know:

GAME OVERVIEW:
- Players pop stock/crypto bubbles to earn coins and XP
- Players can trade stocks, crypto, and ETFs with real-time prices
- Advanced trading features: limit orders, stop-loss, trailing stops
- Guild system with raids, wars, tournaments, and events
- PvP battles, wagers, and leaderboards
- Portfolio management and analytics
- Premium shop with loot boxes and power-ups
- Skill trees, daily quests, and achievements

PLAYER INFO (if available):
${player ? `
- Username: ${player.username}
- Level: ${player.level}
- Coins: ${player.soft_currency}
- Gems: ${player.premium_currency}
- Total Bubbles Popped: ${player.total_bubbles_popped}
- Streak: ${player.streak}
` : 'User not logged in'}

COMMON ISSUES & SOLUTIONS:
1. COOLDOWN ISSUES: Explain that cooldowns prevent spam and can be removed with gems or wait time
2. LOST PROGRESS: Check if they're logged in to the same account
3. CURRENCY PROBLEMS: Explain coin vs gem system, how to earn both
4. TRADING ISSUES: Guide through market page, explain order types
5. GUILD PROBLEMS: Explain how to join/create guilds, raid mechanics
6. TECHNICAL BUGS: Acknowledge, suggest refresh/logout, offer to escalate
7. PAYMENT ISSUES: Explain backend functions needed for real payments
8. ACCOUNT ISSUES: Guide through profile settings, avatar customization

TONE: Friendly, helpful, empathetic. Use emojis occasionally. Provide step-by-step solutions.
If you can't resolve an issue, acknowledge it and suggest contacting developers.

Previous conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

User's current question: ${userMessage}

Provide a helpful, detailed response that resolves their issue:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: gameContext,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ I apologize, but I encountered an error processing your request. Please try again or refresh the page. If the issue persists, please contact the developers.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-32 right-4 sm:bottom-32 sm:right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
            >
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-44 right-4 sm:bottom-44 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px]"
          >
            <Card className="bg-slate-900 border-slate-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="w-8 h-8 text-white" />
                    <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">AI Support Assistant</h3>
                    <p className="text-purple-100 text-xs">Always here to help</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-[300px] sm:h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-slate-700 p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-slate-900 border-t border-slate-700">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your question..."
                    className="bg-slate-800 border-slate-700 text-white"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}