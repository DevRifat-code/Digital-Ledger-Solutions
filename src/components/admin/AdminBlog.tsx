import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../../lib/utils';
import { FileText, Plus, Search, Filter, Edit3, Trash2, Calendar, User, Image as ImageIcon, X, Camera, Type, List, ListOrdered, Quote, Link as LinkIcon, Download, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../../lib/imageUtils';
import { RichArticleEditor } from './RichArticleEditor';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Keep Unicode letters/numbers, spaces, and hyphens
    .replace(/[-\s]+/g, '-');          // Replace spaces and duplicate hyphens with a single hyphen
}

export function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [newPost, setNewPost] = useState({
    title: '',
    permalink: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    imageUrl: ''
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setNewPost(prev => {
      const updated = { ...prev, title };
      const previousAutoSlug = generateSlug(prev.title);
      if (!prev.permalink || prev.permalink === previousAutoSlug) {
        updated.permalink = generateSlug(title);
      }
      return updated;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1200, 800, 0.7);
        setNewPost({ ...newPost, imageUrl: compressedBase64 });
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('Failed to process image.');
      }
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('blog-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newValue = `${before}${prefix}${selection}${suffix}${after}`;
    setNewPost({ ...newPost, content: newValue });
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Use smaller size for content images to save space
        const compressedBase64 = await compressImage(file, 800, 600, 0.6);
        const imageMarkdown = `\n\n![Image](${compressedBase64})\n\n`;
        insertMarkdown(imageMarkdown);
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('Failed to process image.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalPost = {
        ...newPost,
        permalink: newPost.permalink.trim() || generateSlug(newPost.title)
      };
      if (editingPostId) {
        await updateDoc(doc(db, 'blog', editingPostId), {
          ...finalPost,
          updatedAt: serverTimestamp()
        });
        alert('Article updated successfully!');
      } else {
        await addDoc(collection(db, 'blog'), {
          ...finalPost,
          createdAt: serverTimestamp()
        });
        alert('Article published successfully!');
      }
      handleCloseModal();
      fetchPosts();
    } catch (err) {
      handleFirestoreError(err, editingPostId ? 'update' : 'create', 'blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post: any) => {
    setNewPost({
      title: post.title,
      permalink: post.permalink || generateSlug(post.title),
      content: post.content,
      excerpt: post.excerpt || '',
      author: post.author,
      category: post.category || '',
      imageUrl: post.imageUrl || ''
    });
    setEditingPostId(post.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteDoc(doc(db, 'blog', id));
      alert('Article deleted successfully!');
      fetchPosts();
    } catch (err) {
      handleFirestoreError(err, 'delete', 'blog');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPostId(null);
    setIsPreviewMode(false);
    setNewPost({ title: '', permalink: '', content: '', excerpt: '', author: '', category: '', imageUrl: '' });
  };

  const generateSitemapXml = () => {
    const baseUrl = 'https://digitalledgersolutions.pro.bd';
    const staticPages = [
      { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { url: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily' },
      { url: `${baseUrl}/marketplace`, priority: '0.8', changefreq: 'weekly' },
      { url: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' }
    ];

    const postUrls = posts.map(post => {
      const slug = post.permalink || post.id;
      const date = post.updatedAt?.toDate
        ? post.updatedAt.toDate().toISOString().split('T')[0]
        : (post.createdAt?.toDate ? post.createdAt.toDate().toISOString().split('T')[0] : '2026-07-23');
      return `  <url>\n    <loc>${baseUrl}/blog/${slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });

    const staticXml = staticPages.map(p => `  <url>\n    <loc>${p.url}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticXml}\n${postUrls.join('\n')}\n</urlset>`;
  };

  const handleDownloadSitemap = () => {
    const xml = generateSitemapXml();
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Sitemap.xml generated and downloaded! Upload this to your root directory or Google Search Console.');
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-slate-100">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">Blog Articles</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your platform's editorial content and news.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadSitemap}
            className="flex items-center gap-2 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-emerald-400 rounded-3xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95"
            title="Download sitemap.xml for Google Search Console"
          >
            <Download size={18} />
            Generate Sitemap
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 dark:bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Write Article
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author..." 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 pl-12 pr-6 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-emerald-500 transition-all font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Article</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Author</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        {post.imageUrl && post.imageUrl.trim() !== "" ? (
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{post.title}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-tight">
                      <User size={14} className="text-slate-400 dark:text-slate-500" />
                      {post.author}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {post.category || 'Opinion'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs">
                       <Calendar size={14} />
                       {post.createdAt?.toDate().toLocaleDateString()}
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleEdit(post)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-emerald-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                       >
                        <Edit3 size={18} />
                       </button>
                       <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                       >
                        <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-6">
                      <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">No articles found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xs mx-auto mt-2">Start writing your first blog post to engage with your audience.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            >
              <div className="sticky top-0 p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingPostId ? 'Update Article' : 'New Article'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-widest">Digital Content Engine</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      isPreviewMode ? "bg-slate-900 dark:bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {isPreviewMode ? <FileText size={14} /> : <ImageIcon size={14} />}
                    {isPreviewMode ? 'Back to Editor' : 'Live Preview'}
                  </button>
                  <button 
                    onClick={handleCloseModal}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {isPreviewMode ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-[700px] mx-auto space-y-10 py-10">
                      <div className="space-y-6">
                        <span className="px-4 py-1.5 bg-indigo-600 dark:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                          {newPost.category || 'Preview'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white leading-tight">
                          {newPost.title || 'Untitled Post'}
                        </h1>
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-bold text-xs">
                          <User size={14} /> {newPost.author || 'Author Name'} • <Calendar size={14} /> Preview Mode
                        </div>
                      </div>
                      
                      {newPost.imageUrl && newPost.imageUrl.trim() !== "" && (
                        <div className="aspect-video rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-800">
                          <img src={newPost.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="prose dark:prose-invert max-w-none">
                        <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-serif space-y-4 [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:max-w-full">
                          <Markdown 
                            rehypePlugins={[rehypeRaw]}
                            urlTransform={(url) => url}
                            components={{
                              img: ({ node, ...props }) => {
                                if (!props.src || props.src.trim() === '') return null;
                                return (
                                  <img
                                    {...props}
                                    alt={props.alt || 'Blog Image'}
                                    className="rounded-2xl shadow-lg max-w-full my-4 mx-auto object-cover border border-slate-200 dark:border-slate-700"
                                    referrerPolicy="no-referrer"
                                  />
                                );
                              }
                            }}
                          >
                            {newPost.content || '*No content yet...*'}
                          </Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Article Title</label>
                      <input
                        required
                        type="text"
                        value={newPost.title}
                        onChange={handleTitleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="e.g. 10 Tips for Scaling Your Startup"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Permalink / Slug</label>
                        <span className="text-[9px] text-indigo-600 dark:text-emerald-400 font-bold bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">SEO URL</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono text-xs">/blog/</span>
                        <input
                          required
                          type="text"
                          value={newPost.permalink}
                          onChange={(e) => setNewPost({ ...newPost, permalink: generateSlug(e.target.value) })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-4 pl-[3.5rem] pr-6 rounded-2xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                          placeholder="article-slug-url"
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-1 uppercase tracking-widest">Auto-generated from title, can be customized</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Author Name</label>
                        <input
                          required
                          type="text"
                          value={newPost.author}
                          onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          placeholder="e.g. Admin"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                        <input
                          type="text"
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          placeholder="e.g. Technology"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Short Excerpt (SEO)</label>
                      <textarea
                        value={newPost.excerpt}
                        onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all h-24 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Brief summary of the article..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cover Image</label>
                        {newPost.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setNewPost({ ...newPost, imageUrl: '' })}
                            className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                      
                      {newPost.imageUrl && newPost.imageUrl.trim() !== "" ? (
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                          <img src={newPost.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            <button 
                              type="button" 
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-indigo-600 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 dark:hover:bg-emerald-500 shadow-lg"
                            >
                              Change File
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setNewPost({ ...newPost, imageUrl: '' })}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-lg"
                            >
                              Remove
                            </button>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="w-full aspect-video bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-600 dark:hover:border-emerald-500 hover:bg-indigo-50/20 dark:hover:bg-slate-800/50 transition-all">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                            />
                            <Camera size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Click to Upload File</span>
                          </label>
                          <input
                            type="url"
                            value={newPost.imageUrl}
                            onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                            placeholder="OR paste Image URL (https://...)"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Article Content (Rich Text / HTML / Markdown)</label>
                  <RichArticleEditor
                    content={newPost.content}
                    onChange={(val) => setNewPost({ ...newPost, content: val })}
                  />
                </div>
                  </>
                )}

                <div className="flex gap-4">
                   <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-5 bg-indigo-600 dark:bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? 'Publishing...' : (editingPostId ? 'Save Changes' : 'Publish Article')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
