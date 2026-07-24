import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, MessageSquare, Loader2, FileText } from 'lucide-react';
import { db, handleFirestoreError } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useSEO } from '../hooks/useSEO';
import { formatDate, formatFullIso } from '../lib/dateUtils';
import { BlogPostDetailsSkeleton } from '../components/Skeletons';

export function BlogPostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const postExcerpt = post ? (post.excerpt || post.content?.replace(/[#*`_~]/g, '').substring(0, 160) + '...') : '';
  const postCanonical = `https://digitalledgersolutions.pro.bd/blog/${post?.permalink || id}`;

  useSEO({
    title: post ? `${post.title} | Digital Ledger Solutions` : 'Blog Article | Digital Ledger Solutions',
    description: postExcerpt || 'Read the full insights and article on Digital Ledger Solutions.',
    canonical: postCanonical,
    ogType: 'article',
    ogImage: post?.imageUrl,
    author: post?.author,
    jsonLd: post ? {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': postCanonical
      },
      'headline': post.title,
      'description': postExcerpt,
      'image': post.imageUrl ? [post.imageUrl] : undefined,
      'datePublished': formatFullIso(post.createdAt),
      'author': {
        '@type': 'Person',
        'name': post.author || 'Digital Ledger Solutions'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Digital Ledger Solutions',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://digitalledgersolutions.pro.bd/favicon.ico'
        }
      }
    } : undefined
  });

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      // 1. Try to fetch as direct document ID first
      try {
        const docSnap = await getDoc(doc(db, 'blog', id!));
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
          setIsLoading(false);
          return;
        }
      } catch (docErr) {
        // ID might not be a valid Firestore ID (it's a slug), continue to query
        console.log('Not a direct document ID, querying by permalink...');
      }

      // 2. If direct document ID doesn't exist or is invalid, query by permalink field
      const q = query(collection(db, 'blog'), where('permalink', '==', id!), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docObj = querySnapshot.docs[0];
        setPost({ id: docObj.id, ...docObj.data() });
      }
    } catch (err) {
      handleFirestoreError(err, 'get', `blog/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReadingTime = (text?: string) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const readingTime = post ? calculateReadingTime(post.content) : 0;

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950">
        <BlogPostDetailsSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-8">
                <FileText size={40} />
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Article Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">The article you are looking for might have been moved or archived.</p>
            <Link to="/blog" className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all shadow-xl shadow-indigo-100 dark:shadow-none">
                <ArrowLeft size={18} />
                Back to Feed
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <Link to="/blog" className="inline-flex items-center gap-3 text-slate-400 hover:text-indigo-600 dark:hover:text-emerald-400 transition-all group mb-12">
            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-slate-800 group-hover:border-indigo-100 transition-all">
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
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-200 dark:shadow-none">
                {post.category || 'Editorial'}
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-8">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 border-y border-slate-200 dark:border-slate-800 py-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 dark:bg-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                    {(post.author || 'Digital Ledger').charAt(0)}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Written By</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{post.author || 'Digital Ledger Solutions'}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Published</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(post.createdAt)}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                    <Clock size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reading Time</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{readingTime} min read</p>
                </div>
            </div>
          </div>
        </motion.header>

        {/* Improved Markdown Styling wrapper */}
        <style dangerouslySetInnerHTML={{ __html: `
          .blog-content h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 900; font-size: 2.25rem; margin-top: 3rem; margin-bottom: 1.5rem; line-height: 1.2; }
          .blog-content h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 900; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; }
          .blog-content p { margin-bottom: 1.5rem; }
          .blog-content blockquote { border-left: 6px solid #4f46e5; padding: 2rem; border-radius: 2rem; font-style: italic; margin: 3rem 0; font-size: 1.25rem; font-weight: 500; }
          .blog-content ul { list-style-type: none; padding-left: 0; margin-bottom: 2rem; }
          .blog-content ul li { position: relative; padding-left: 2rem; margin-bottom: 0.75rem; }
          .blog-content ul li::before { content: ""; position: absolute; left: 0; top: 0.6rem; width: 0.75rem; height: 0.75rem; background: #4f46e5; border-radius: 4px; }
          .blog-content strong { font-weight: 800; }
          .blog-content a { color: #4f46e5; text-decoration: underline; font-weight: 600; text-underline-offset: 4px; }
          html.dark .blog-content h2 { color: #f8fafc; }
          html.dark .blog-content h3 { color: #f8fafc; }
          html.dark .blog-content p { color: #cbd5e1; }
          html.dark .blog-content blockquote { background: #0f172a; color: #f1f5f9; border-left-color: #10b981; }
          html.dark .blog-content ul li { color: #cbd5e1; }
          html.dark .blog-content ul li::before { background: #10b981; }
          html.dark .blog-content strong { color: #f8fafc; }
          html.dark .blog-content a { color: #34d399; }
        `}} />

        {/* Featured Image */}
        {post.imageUrl && post.imageUrl.trim() !== "" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="aspect-[16/9] rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl shadow-indigo-100 dark:shadow-none mb-16"
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
              className="prose prose-slate dark:prose-invert prose-indigo max-w-none"
            >
                <div className="blog-content text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-[1.8] font-serif space-y-6 [&_img]:rounded-3xl [&_img]:shadow-2xl [&_img]:shadow-indigo-100/50 [&_img]:mx-auto [&_img]:max-w-full [&_img]:my-12">
                    <Markdown 
                      rehypePlugins={[rehypeRaw]}
                      urlTransform={(url) => url}
                      components={{
                        img: ({ node, ...props }) => {
                          if (!props.src || props.src.trim() === '') return null;
                          return (
                            <img
                              {...props}
                              alt={props.alt || 'Article Image'}
                              className="rounded-3xl shadow-2xl shadow-indigo-100/50 dark:shadow-none mx-auto max-w-full my-8 object-cover border border-slate-100 dark:border-slate-800"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          );
                        }
                      }}
                    >
                      {post.content}
                    </Markdown>
                </div>
            </motion.div>

            {/* Sticky Socials */}
            <div className="hidden lg:block">
                <div className="sticky top-32 space-y-4">
                    {[
                        { icon: Facebook, color: 'hover:bg-blue-600 group-hover:text-white' },
                        { icon: Twitter, color: 'hover:bg-sky-500 group-hover:text-white' },
                        { icon: Linkedin, color: 'hover:bg-blue-700 group-hover:text-white' },
                        { icon: Share2, color: 'hover:bg-slate-900 group-hover:text-white transition-all ring-4 ring-slate-100 dark:ring-slate-800' }
                    ].map((item, idx) => (
                        <button key={idx} className={`w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 transition-all group ${item.color} shadow-sm active:scale-90`}>
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
          className="mt-20 p-12 bg-slate-900 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-[3rem] text-center relative overflow-hidden group"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/10 pointer-events-none"></div>
            <MessageSquare size={40} className="text-indigo-400 dark:text-emerald-400 mx-auto mb-6" />
            <h3 className="text-3xl font-display font-black text-white mb-4">Join the Conversation</h3>
            <p className="text-slate-400 font-medium mb-10 max-w-md mx-auto">Have thoughts on this article? Subscribe to our newsletter to receive the latest tech insights directly in your inbox.</p>
            <div className="flex max-w-sm mx-auto gap-3">
                <input type="email" placeholder="Your work email..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all" />
                <button className="px-8 py-4 bg-indigo-600 dark:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 dark:hover:bg-emerald-500 transition-all shadow-xl shadow-indigo-500/20">Join</button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
