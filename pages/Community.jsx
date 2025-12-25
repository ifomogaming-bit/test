import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  MessageSquare,
  Plus,
  ThumbsUp,
  MessageCircle,
  Pin,
  TrendingUp,
  Users,
  HelpCircle,
  Lightbulb,
  Flame,
  Award,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  { id: 'general', name: 'General', icon: MessageSquare },
  { id: 'strategies', name: 'Trading Strategies', icon: Lightbulb },
  { id: 'market_analysis', name: 'Market Analysis', icon: TrendingUp },
  { id: 'help', name: 'Help & Support', icon: HelpCircle },
  { id: 'guild_recruitment', name: 'Guild Recruitment', icon: Users }
];

export default function Community() {
  const [user, setUser] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [newComment, setNewComment] = useState('');
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

  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: async () => {
      return base44.entities.ForumPost.list('-created_date', 100);
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['forumComments', selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost?.id) return [];
      return base44.entities.ForumComment.filter({ post_id: selectedPost.id }, '-created_date');
    },
    enabled: !!selectedPost?.id
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      await base44.entities.ForumPost.create({
        ...postData,
        player_id: player.id,
        player_name: player.username,
        likes: 0,
        reply_count: 0,
        is_pinned: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPosts']);
      setShowNewPost(false);
      setNewPost({ title: '', content: '', category: 'general' });
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.ForumComment.create({
        post_id: postId,
        player_id: player.id,
        player_name: player.username,
        content,
        likes: 0
      });

      // Update reply count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await base44.entities.ForumPost.update(postId, {
          reply_count: (post.reply_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumComments']);
      queryClient.invalidateQueries(['forumPosts']);
      setNewComment('');
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId) => {
      const post = posts.find(p => p.id === postId);
      if (post) {
        await base44.entities.ForumPost.update(postId, {
          likes: (post.likes || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPosts']);
    }
  });

  const handleCreatePost = () => {
    if (newPost.title && newPost.content) {
      createPostMutation.mutate(newPost);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : MessageSquare;
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      general: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      strategies: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      market_analysis: 'bg-green-500/20 text-green-400 border-green-500/50',
      help: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      guild_recruitment: 'bg-pink-500/20 text-pink-400 border-pink-500/50'
    };
    return colors[categoryId] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="relative">
                  <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                Community Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Join {posts.length} traders • Share insights • Connect</p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowNewPost(true)}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/60 transition-all w-full sm:w-auto font-bold text-base border-2 border-blue-400/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              ✨ New Post
            </Button>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <p className="text-xs sm:text-sm text-slate-400">Posts</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{posts.length}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <p className="text-xs sm:text-sm text-slate-400">Active</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{new Set(posts.map(p => p.player_id)).size}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
              <p className="text-xs sm:text-sm text-slate-400">Likes</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</p>
          </motion.div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2">
            <TabsTrigger value="all" className="whitespace-nowrap">All Posts</TabsTrigger>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="whitespace-nowrap text-xs md:text-sm">
                  <Icon className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{cat.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {['all', ...CATEGORIES.map(c => c.id)].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue}>
              <div className="space-y-3">
                {posts
                  .filter(post => tabValue === 'all' || post.category === tabValue)
                  .length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-white font-bold text-xl mb-2">No Posts Yet</h3>
                      <p className="text-slate-400 mb-4">Be the first to start a conversation!</p>
                      <Button
                        onClick={() => setShowNewPost(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Post
                      </Button>
                    </div>
                  ) : posts
                  .filter(post => tabValue === 'all' || post.category === tabValue)
                  .map((post, index) => {
                    const CategoryIcon = getCategoryIcon(post.category);
                    
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <Card 
                          className="group bg-gradient-to-br from-slate-800/90 via-purple-900/20 to-slate-800/90 border-2 border-slate-700/80 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer overflow-hidden relative backdrop-blur-sm"
                          onClick={() => setSelectedPost(post)}
                        >
                          {/* Animated gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
                          
                          {/* Animated border glow */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
                          </div>
                          
                          <CardContent className="p-4 md:p-6 relative">
                            {/* User Avatar */}
                            <div className="flex items-start gap-3 sm:gap-4 mb-3">
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg shadow-purple-500/50 border-2 border-white/20"
                              >
                                {post.player_name[0]?.toUpperCase()}
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="text-white font-bold text-sm sm:text-base">{post.player_name}</h4>
                                  {post.is_pinned && (
                                    <motion.div
                                      initial={{ rotate: 0 }}
                                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                      <Pin className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </motion.div>
                                  )}
                                  <Badge className={`${getCategoryColor(post.category)} border text-xs`}>
                                    <CategoryIcon className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">{CATEGORIES.find(c => c.id === post.category)?.name}</span>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(post.created_date).toLocaleDateString()} • {new Date(post.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-0 sm:ml-16">
                            <h3 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-pink-400 mb-2 line-clamp-2 transition-all duration-300">{post.title}</h3>
                            <p className="text-slate-300 text-sm md:text-base line-clamp-3 mb-4 leading-relaxed group-hover:text-slate-200 transition-colors">{post.content}</p>
                              
                              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      likePostMutation.mutate(post.id);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-red-400 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 transition-all group/like border border-transparent hover:border-red-500/30 font-bold"
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.2, rotate: 10 }}
                                      transition={{ type: "spring", stiffness: 400 }}
                                    >
                                      <ThumbsUp className="w-4 h-4 mr-1" />
                                    </motion.div>
                                    <span className="font-bold">{post.likes || 0}</span>
                                    <span className="hidden sm:inline ml-1 text-xs font-semibold">Likes</span>
                                  </Button>
                                </motion.div>
                                
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 transition-all group/comment border border-transparent hover:border-blue-500/30 font-bold"
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.2, rotate: -10 }}
                                      transition={{ type: "spring", stiffness: 400 }}
                                    >
                                      <MessageCircle className="w-4 h-4 mr-1" />
                                    </motion.div>
                                    <span className="font-bold">{post.reply_count || 0}</span>
                                    <span className="hidden sm:inline ml-1 text-xs font-semibold">Replies</span>
                                  </Button>
                                </motion.div>

                                {(post.likes || 0) > 10 && (
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Badge className="bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 border-2 border-orange-500/50 shadow-lg shadow-orange-500/30 font-black">
                                      <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                      >
                                        <Flame className="w-3 h-3 mr-1" />
                                      </motion.div>
                                      🔥 Hot
                                    </Badge>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Category</label>
              <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Title</label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Content</label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts..."
                className="bg-slate-800 border-slate-700 text-white min-h-[200px]"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowNewPost(false)} className="border-slate-600 hover:bg-slate-700">
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleCreatePost} className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl font-bold border-2 border-blue-400/30">
                  ✨ Post
                </Button>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Details Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          {selectedPost && (
            <>
              <DialogHeader className="border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`${getCategoryColor(selectedPost.category)} border`}>
                    {CATEGORIES.find(c => c.id === selectedPost.category)?.name}
                  </Badge>
                  <span className="text-slate-400 text-sm">By {selectedPost.player_name}</span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-500 text-xs">{new Date(selectedPost.created_date).toLocaleDateString()}</span>
                </div>
                <DialogTitle className="text-white text-xl md:text-2xl">{selectedPost.title}</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto space-y-6 py-4">
                <div className="bg-slate-800/30 rounded-xl p-4 md:p-6 border border-slate-700/50">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                </div>

                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        likePostMutation.mutate(selectedPost.id);
                      }}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-red-500/50 border-2 border-red-400/30 font-bold"
                    >
                      <ThumbsUp className="w-5 h-5 mr-2" />
                      ❤️ Like ({selectedPost.likes || 0})
                    </Button>
                  </motion.div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    Comments ({comments.length})
                  </h3>

                  {comments.length === 0 ? (
                    <div className="text-center py-8 bg-slate-800/20 rounded-lg border border-slate-700/50">
                      <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400">No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {comments.map((comment, idx) => (
                        <motion.div
                         key={comment.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         whileHover={{ scale: 1.02, x: 5 }}
                         className="bg-gradient-to-br from-slate-800/80 via-purple-900/10 to-slate-800/80 rounded-xl p-4 border-2 border-slate-700/60 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <span className="text-white font-medium">{comment.player_name}</span>
                            <span className="text-slate-400 text-xs whitespace-nowrap">
                              {new Date(comment.created_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-slate-900/95 backdrop-blur-sm p-4 -mx-4 -mb-4 border-t border-slate-700">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="bg-slate-800 border-slate-700 text-white min-h-[80px] sm:min-h-0"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0">
                      <Button
                        onClick={() => createCommentMutation.mutate({ postId: selectedPost.id, content: newComment })}
                        disabled={!newComment || createCommentMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 shadow-xl font-bold border-2 border-blue-400/30"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        {createCommentMutation.isPending ? '✍️ Posting...' : '💬 Comment'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}