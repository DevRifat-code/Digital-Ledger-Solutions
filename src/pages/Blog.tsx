import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Rss, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    } catch (err) {
      handleFirestoreError(err, 'list', 'blog');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          >
            <Rss size={14} />
            Insights & Updates
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tight"
          >
            Our <span className="text-indigo-600">Blog</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mt-6"
          >
            Deep dives into technology, business strategies, and industry trends from our expert team.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading Editorial Content</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {posts.map((post, idx) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="break-inside-avoid bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 mb-8"
              >
                <div className="overflow-hidden relative">
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-slate-100 flex items-center justify-center text-slate-300">
                      <FileText size={40} />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest text-indigo-600 rounded-full ring-1 ring-white/20">
                    {post.category || 'Opinion'}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {post.createdAt?.toDate().toLocaleDateString() || 'Recent'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User size={14} />
                      {post.author}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {post.excerpt || (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content)}
                  </p>
                  <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 group-hover:gap-4 transition-all">
                    Read Full Story
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-display font-black text-slate-900 uppercase">No Articles Found</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">Check back later for fresh insights and industry news.</p>
          </div>
        )}
      </div>
    </div>
  );
}
