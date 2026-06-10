import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Filter, 
  ChevronRight, 
  User, 
  Heart, 
  MessageCircle,
  Hash,
  Loader2,
  Camera,
  Video,
  AlertTriangle,
  Send,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { logActivity } from '../lib/tracking';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  category: 'Crops' | 'Health' | 'Village' | 'Urgent';
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  commentsCount: number;
  createdAt: any;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Crops' as Post['category'], imageUrl: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Farmer',
        category: newPost.category,
        title: newPost.title,
        content: newPost.content,
        imageUrl: imagePreview || '',
        likes: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      });
      setShowNewPost(false);
      setNewPost({ title: '', content: '', category: 'Crops', imageUrl: '' });
      setImagePreview(null);
      logActivity('COMMUNITY_POST', { category: newPost.category, title: newPost.title });
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleLike = async (postId: string) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
      logActivity('COMMUNITY_LIKE', { postId });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-brand-green">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Status */}
      <div className="bg-brand-dark p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Farmer Network</h3>
          <div className="flex items-center gap-2 text-brand-green">
            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">1,240 Farmers Online</span>
          </div>
        </div>
        <Hash className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Urgent', 'Crops', 'Health', 'Village'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 shrink-0 ${
              filter === cat 
                ? 'bg-brand-green text-white border-brand-dark shadow-lg' 
                : 'bg-white text-slate-400 border-slate-100 shadow-sm'
            }`}
          >
            {cat === 'Urgent' && <AlertTriangle className="w-3 h-3" />}
            {cat}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div className="space-y-6 pb-20">
        {filteredPosts.map((post) => (
          <motion.div 
            layout
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] overflow-hidden ${post.category === 'Urgent' ? 'ring-4 ring-brand-red ring-opacity-20 translate-x-1' : ''}`}
          >
            {post.category === 'Urgent' && (
              <div className="bg-brand-red px-6 py-2 flex items-center gap-2 text-white overflow-hidden">
                <AlertTriangle className="w-3 h-3 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Urgent Community Alert</span>
              </div>
            )}
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-brand-dark border-4 border-white shadow-sm font-black text-lg">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-black text-brand-dark leading-none">{post.authorName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Village Social</div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  post.category === 'Crops' ? 'bg-brand-green/10 text-brand-green' :
                  post.category === 'Health' ? 'bg-brand-red/10 text-brand-red' :
                  post.category === 'Urgent' ? 'bg-brand-red text-white' :
                  'bg-brand-blue/10 text-brand-blue'
                }`}>
                  {post.category}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-brand-dark leading-tight mb-3 uppercase tracking-tight">{post.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{post.content}</p>
              </div>

              {post.imageUrl && (
                <div className="rounded-[28px] overflow-hidden border-4 border-slate-50 shadow-sm">
                  <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                </div>
              )}

              <div className="pt-4 border-t border-slate-50 flex items-center gap-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-slate-400 hover:text-brand-red transition-all active:scale-125"
                >
                  <Heart className={`w-6 h-6 ${post.likes > 0 ? 'fill-brand-red text-brand-red' : ''}`} />
                  <span className="text-sm font-black">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-brand-blue transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-black">{post.commentsCount}</span>
                </button>
                <button className="ml-auto p-2 text-slate-300 hover:text-brand-dark transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowNewPost(true)}
        className="fixed bottom-32 right-6 w-16 h-16 bg-brand-orange text-white rounded-2xl flex items-center justify-center shadow-[0_8px_0_#E08500] active:translate-y-1 active:shadow-none transition-all z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="bg-brand-bg w-full max-w-lg rounded-[48px] p-8 shadow-2xl space-y-6 overflow-hidden relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Create Post</h2>
                <button onClick={() => setShowNewPost(false)} className="p-3 bg-white rounded-2xl text-slate-400 shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 p-1.5 bg-white rounded-2xl overflow-x-auto scrollbar-none shadow-sm">
                  {['Crops', 'Health', 'Village', 'Urgent'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewPost({...newPost, category: cat as any})}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                        newPost.category === cat 
                        ? (cat === 'Urgent' ? 'bg-brand-red text-white ring-4 ring-brand-red/20' : 'bg-brand-green text-white shadow-lg') 
                        : 'bg-transparent text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border-b-4 border-slate-100">
                  <input 
                    type="text" 
                    placeholder="Enter a catchy title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full bg-brand-bg border-2 border-transparent focus:border-brand-green rounded-xl p-4 text-sm font-black focus:outline-none transition-all placeholder:text-slate-300"
                  />
                  <textarea 
                    placeholder="Share something with the community..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="w-full bg-brand-bg border-2 border-transparent focus:border-brand-green rounded-xl p-4 text-sm font-bold focus:outline-none transition-all h-32 resize-none placeholder:text-slate-300"
                  />

                  {imagePreview && (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm group">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                      <button 
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      onClick={handleImageSelect}
                      className="flex-1 py-4 bg-brand-bg text-brand-dark rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Add Photo
                    </button>
                    <button className="flex-1 py-4 bg-brand-bg text-brand-dark rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                      <Video className="w-4 h-4" />
                      Add Video
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCreatePost}
                disabled={!newPost.title || !newPost.content}
                className="w-full py-5 bg-brand-blue text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-[0_8px_0_#1E3A8A] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
                POST TO VILLAGE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

