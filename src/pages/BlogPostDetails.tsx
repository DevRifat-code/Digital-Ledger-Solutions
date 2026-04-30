import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, MessageSquare, Loader2, FileText } from 'lucide-react';
import { db, handleFirestoreError } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Markdown from 'react-markdown';

export function BlogPostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'blog', id!));
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      handleFirestoreError(err, 'get', `blog/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const readingTime = post ? calculateReadingTime(post.content) : 0;

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <Loader2 size={40} className="text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Assembling Editorial...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-8">
                <FileText size={40} />
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900 uppercase tracking-tight mb-4">Article Not Found</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">The article you are looking for might have been moved or archived.</p>
            <Link to="/blog" className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100">
                <ArrowLeft size={18} />
                Back to Feed
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <Link to="/blog" className="inline-flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group mb-12">
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                <ArrowLeft size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Return to Feed</span>
        </Link>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-200">
                {post.category || 'Editorial'}
            </span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 border-y border-slate-200 py-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs">
                    {post.author.charAt(0)}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Written By</p>
                    <p className="text-sm font-bold text-slate-900">{post.author}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                    <Calendar size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Published</p>
                    <p className="text-sm font-bold text-slate-900">{post.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                    <Clock size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reading Time</p>
                    <p className="text-sm font-bold text-slate-900">{readingTime} min read</p>
                </div>
            </div>
          </div>
        </motion.header>

        {/* Improved Markdown Styling wrapper */}
        <style dangerouslySetInnerHTML={{ __html: `
          .blog-content h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 900; color: #0f172a; font-size: 2.25rem; margin-top: 3rem; margin-bottom: 1.5rem; line-height: 1.2; }
          .blog-content h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 900; color: #0f172a; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; }
          .blog-content p { margin-bottom: 1.5rem; color: #475569; }
          .blog-content blockquote { border-left: 6px solid #4f46e5; padding: 2rem; background: #f8fafc; border-radius: 2rem; font-style: italic; color: #1e293b; margin: 3rem 0; font-size: 1.25rem; font-weight: 500; }
          .blog-content ul { list-style-type: none; padding-left: 0; margin-bottom: 2rem; }
          .blog-content ul li { position: relative; padding-left: 2rem; margin-bottom: 0.75rem; color: #475569; }
          .blog-content ul li::before { content: ""; position: absolute; left: 0; top: 0.6rem; w: 0.75rem; h: 0.75rem; background: #4f46e5; border-radius: 4px; }
          .blog-content strong { color: #0f172a; font-weight: 800; }
          .blog-content a { color: #4f46e5; text-decoration: underline; font-weight: 600; text-underline-offset: 4px; }
          .blog-content a:hover { color: #1e1b4b; }
        `}} />

        {/* Featured Image */}
        {post.imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="aspect-[16/9] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl shadow-indigo-100 mb-16"
            >
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px] gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-slate prose-indigo max-w-none"
            >
                <div className="blog-content text-slate-600 text-lg md:text-xl leading-[1.8] font-serif space-y-6 [&_img]:rounded-3xl [&_img]:shadow-2xl [&_img]:shadow-indigo-100/50 [&_img]:mx-auto [&_img]:max-w-full [&_img]:my-12">
                    <Markdown>{post.content}</Markdown>
                </div>
            </motion.div>

            {/* Sticky Socials */}
            <div className="hidden lg:block">
                <div className="sticky top-32 space-y-4">
                    {[
                        { icon: Facebook, color: 'hover:bg-blue-600 group-hover:text-white' },
                        { icon: Twitter, color: 'hover:bg-sky-500 group-hover:text-white' },
                        { icon: Linkedin, color: 'hover:bg-blue-700 group-hover:text-white' },
                        { icon: Share2, color: 'hover:bg-slate-900 group-hover:text-white transition-all ring-4 ring-slate-100' }
                    ].map((item, idx) => (
                        <button key={idx} className={`w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 transition-all group ${item.color} shadow-sm active:scale-90`}>
                            <item.icon size={20} />
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Bottom Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden group"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/10 pointer-events-none"></div>
            <MessageSquare size={40} className="text-indigo-400 mx-auto mb-6" />
            <h3 className="text-3xl font-display font-black text-white mb-4">Join the Conversation</h3>
            <p className="text-slate-400 font-medium mb-10 max-w-md mx-auto">Have thoughts on this article? Subscribe to our newsletter to receive the latest tech insights directly in your inbox.</p>
            <div className="flex max-w-sm mx-auto gap-3">
                <input type="email" placeholder="Your work email..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all" />
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-indigo-500/20">Join</button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
