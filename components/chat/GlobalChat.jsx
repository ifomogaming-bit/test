import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Hash, TrendingUp, Swords, X, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import AvatarDisplay from '../avatar/AvatarDisplay';

const CHANNELS = [
  { id: 'global', name: 'Global', icon: Hash },
  { id: 'trade', name: 'Trading', icon: TrendingUp },
  { id: 'pvp', name: 'PvP', icon: Swords }
];

export default function GlobalChat({ 
  messages = [], 
  onSendMessage, 
  currentChannel = 'global',
  onChangeChannel,
  isMinimized = false,
  onToggleMinimize
}) {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message, currentChannel);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {Math.min(messages.length, 99)}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-40 w-80 md:w-96 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-white">Chat</span>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Users className="w-3 h-3" />
            <span>128 online</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5 text-slate-400" />
        </Button>
      </div>

      {/* Channel Tabs */}
      <div className="flex gap-1 p-2 border-b border-slate-700">
        {CHANNELS.map(channel => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.id}
              onClick={() => onChangeChannel?.(channel.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                currentChannel === channel.id 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {channel.name}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <ScrollArea className="h-64 p-3" ref={scrollRef}>
        <div className="space-y-3">
          <AnimatePresence>
            {messages
              .filter(m => m.channel === currentChannel || currentChannel === 'global')
              .slice(-50)
              .map((msg, index) => (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2"
                >
                  <AvatarDisplay avatar={{}} size="sm" className="w-8 h-8 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-white text-sm">{msg.player_name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm break-words">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
          
          {messages.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
          />
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}