import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import Markdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { FileText, Plus, Search, Filter, Edit3, Trash2, Calendar, User, Image as ImageIcon, X, Camera, Type, List, ListOrdered, Quote, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../../lib/imageUtils';

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
    content: '',
    excerpt: '',
    author: '',
    category: '',
    imageUrl: ''
  });

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
      if (editingPostId) {
        await updateDoc(doc(db, 'blog', editingPostId), {
          ...newPost,
          updatedAt: serverTimestamp()
        });
        alert('Article updated successfully!');
      } else {
        await addDoc(collection(db, 'blog'), {
          ...newPost,
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
    setNewPost({ title: '', content: '', excerpt: '', author: '', category: '', imageUrl: '' });
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Blog Articles</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your platform's editorial content and news.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Write Article
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author..." 
              className="w-full bg-slate-50 border border-slate-200 py-3 pl-12 pr-6 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-600 transition-all font-sans" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Article</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Author</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{post.title}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                      <User size={14} className="text-slate-400" />
                      {post.author}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {post.category || 'Opinion'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                       <Calendar size={14} />
                       {post.createdAt?.toDate().toLocaleDateString()}
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleEdit(post)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                       >
                        <Edit3 size={18} />
                       </button>
                       <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                      <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-display font-black text-slate-900">No articles found</h3>
                    <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto mt-2">Start writing your first blog post to engage with your audience.</p>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">
                    {editingPostId ? 'Update Article' : 'New Article'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Digital Content Engine</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      isPreviewMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {isPreviewMode ? <FileText size={14} /> : <ImageIcon size={14} />}
                    {isPreviewMode ? 'Back to Editor' : 'Live Preview'}
                  </button>
                  <button 
                    onClick={handleCloseModal}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-2xl transition-all"
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
                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                          {newPost.category || 'Preview'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 leading-tight">
                          {newPost.title || 'Untitled Post'}
                        </h1>
                        <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                          <User size={14} /> {newPost.author || 'Author Name'} • <Calendar size={14} /> Preview Mode
                        </div>
                      </div>
                      
                      {newPost.imageUrl && (
                        <div className="aspect-video rounded-3xl overflow-hidden border-4 border-slate-100">
                          <img src={newPost.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="prose prose-slate prose-indigo max-w-none">
                        <div className="text-slate-600 text-lg leading-relaxed font-serif space-y-4 [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:max-w-full">
                          <Markdown>{newPost.content || '*No content yet...*'}</Markdown>
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
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                        placeholder="e.g. 10 Tips for Scaling Your Startup"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Author Name</label>
                        <input
                          required
                          type="text"
                          value={newPost.author}
                          onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                          placeholder="e.g. Admin"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                        <input
                          type="text"
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                          placeholder="e.g. Technology"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Short Excerpt (SEO)</label>
                      <textarea
                        value={newPost.excerpt}
                        onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all h-24 resize-none"
                        placeholder="Brief summary of the article..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cover Image</label>
                      <label className="w-full aspect-video bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-600 transition-all">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                        {newPost.imageUrl ? (
                          <img src={newPost.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera size={32} className="text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Click to Upload</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Article Content (Markdown Supported)</label>
                  
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                    <button type="button" onClick={() => insertMarkdown('### ')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" title="Heading">
                      <Type size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600 font-bold" title="Bold">
                      B
                    </button>
                    <button type="button" onClick={() => insertMarkdown('_', '_')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600 italic" title="Italic">
                      I
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button type="button" onClick={() => insertMarkdown('- ')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" title="Bullet List">
                      <List size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('1. ')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" title="Numbered List">
                      <ListOrdered size={16} />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button type="button" onClick={() => insertMarkdown('> ')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" title="Quote">
                      <Quote size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600" title="Link">
                      <LinkIcon size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => contentImageInputRef.current?.click()}
                      className="inline-flex items-center gap-2 p-2 px-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ml-auto hover:bg-slate-900 shadow-lg shadow-indigo-200"
                    >
                      <Camera size={14} />
                      Insert Image
                    </button>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      ref={contentImageInputRef}
                      onChange={handleContentImageUpload}
                    />
                  </div>

                  <textarea
                    id="blog-content"
                    required
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-8 py-6 rounded-[2rem] text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all min-h-[500px] font-serif leading-relaxed"
                    placeholder="Write your story here using Markdown..."
                  />
                </div>
                  </>
                )}

                <div className="flex gap-4">
                   <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 active:scale-95"
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
