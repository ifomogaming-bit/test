import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  HelpCircle,
  Loader2,
  Bot,
  User,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const QUICK_HELP_TOPICS = [
  { question: "How do I earn more coins?", icon: "💰" },
  { question: "How do I join or create a guild?", icon: "🛡️" },
  { question: "My purchase didn't go through", icon: "💳" },
  { question: "How do I level up faster?", icon: "⬆️" },
  { question: "Trading system not working", icon: "📈" },
  { question: "Lost items or progress", icon: "❌" },
  { question: "Account or login issues", icon: "🔐" },
  { question: "Report a bug", icon: "🐛" }
];

export default function CustomerSupport() {
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadPlayer = async () => {
      if (!user?.email) return;
      const players = await base44.entities.Player.filter({ created_by: user.email });
      if (players.length > 0) setPlayer(players[0]);
    };
    loadPlayer();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Welcome message
    if (player) {
      setMessages([{
        role: 'assistant',
        content: `Hello ${player.username}! 👋 I'm your AI Support Assistant. I'm here to help you with any issues or questions about the game. How can I assist you today?`
      }]);
    }
  }, [player]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call AI to generate response
      const systemPrompt = `You are a helpful customer support AI for a stock trading game. 

Player Info:
- Username: ${player?.username}
- Level: ${player?.level}
- Coins: ${player?.soft_currency}
- Gems: ${player?.premium_currency}

Common Issues and Solutions:

EARNING COINS:
- Pop bubbles in the game (20 per day max)
- Complete daily quests
- Work shifts in the Work Center
- Trade stocks profitably
- Win PvP matches
- Daily login bonuses and spin wheel

GUILDS:
- Creating a guild costs 100 gems (can purchase in Shop)
- Join existing guilds from Browse Guilds tab
- Contribute to guild treasury for points
- Participate in guild wars and raids

PURCHASES:
- Gems can be purchased with USD in Shop
- Coins can be bought with gems
- All purchases are processed securely
- Contact support if purchase fails

TRADING:
- Buy/sell stocks and crypto in Trading page
- Manage portfolio and watchlists
- Use advanced orders for better trades
- Check market events for opportunities

PROGRESSION:
- Answer questions correctly to earn XP
- Maintain streaks for bonuses
- Complete achievements
- Upgrade skills in skill tree

BUGS/ISSUES:
- Try refreshing the page
- Clear browser cache
- Check internet connection
- Report persistent bugs with details

Be friendly, concise, and provide actionable solutions. If the issue requires human support, suggest they contact the development team.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nUser Question: ${userMessage}\n\nProvide a helpful, concise response (2-3 paragraphs max):`,
        add_context_from_internet: false
      });

      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response || 'I apologize, but I encountered an error. Please try rephrasing your question or contact support directly.'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize for the technical difficulty. Please try again or contact our support team directly for immediate assistance.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickHelp = (question) => {
    setInputMessage(question);
    handleSendMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Bot className="w-8 h-8 text-blue-400" />
                Customer Support
              </h1>
              <p className="text-slate-400">24/7 AI-powered assistance</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Online
          </Badge>
        </div>

        {/* Quick Help Topics */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-white font-bold mb-3">Quick Help Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {QUICK_HELP_TOPICS.map((topic, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleQuickHelp(topic.question)}
                  className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500 transition-all text-left"
                >
                  <span className="text-2xl mb-1 block">{topic.icon}</span>
                  <p className="text-white text-xs">{topic.question}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Area */}
        <Card className="bg-slate-800/50 border-slate-700 mb-4">
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700/50 text-slate-100'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type your question or issue..."
            className="bg-slate-800 border-slate-700 text-white"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-slate-400 text-sm">
            <HelpCircle className="w-4 h-4 inline mr-1" />
            For urgent issues or if the AI can't help, please contact{' '}
            <a href="mailto:support@stockgame.com" className="text-blue-400 hover:underline">
              support@stockgame.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}