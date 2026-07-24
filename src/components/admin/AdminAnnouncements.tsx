import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Bell, Plus, Trash2, Megaphone, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnnouncement,
        createdAt: serverTimestamp()
      });
      setNewAnnouncement({ title: '', content: '', type: 'info' });
      fetchAnnouncements();
    } catch (err) {
      handleFirestoreError(err, 'create', 'announcements');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      fetchAnnouncements();
    } catch (err) {
      handleFirestoreError(err, 'delete', `announcements/${id}`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-slate-100">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">System Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Broadcast important news and updates to all users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-display font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Post Update</h3>
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Title</label>
                <input
                  required
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="e.g. Server Maintenance"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Type</label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                >
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="What's happening?"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <button className="w-full py-4 bg-indigo-600 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all shadow-xl shadow-indigo-600/20 dark:shadow-none">
                Post Announcement
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {announcements.map((a) => (
            <motion.div 
              layout
              key={a.id} 
              className={`p-8 rounded-[2.5rem] border shadow-sm relative group ${
                a.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50' :
                a.type === 'success' ? 'bg-green-50 dark:bg-emerald-950/40 border-green-100 dark:border-emerald-900/50' :
                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    a.type === 'warning' ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' :
                    a.type === 'success' ? 'bg-green-200 dark:bg-emerald-900/60 text-green-700 dark:text-emerald-300' :
                    'bg-indigo-600 dark:bg-emerald-600 text-white'
                  }`}>
                    <Megaphone size={18} />
                  </div>
                  <h4 className="font-display font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">{a.title}</h4>
                </div>
                <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">{a.content}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <Calendar size={12} />
                {a.createdAt?.toDate().toLocaleString() || 'Recently'}
              </div>
            </motion.div>
          ))}
          {announcements.length === 0 && !loading && (
            <div className="py-32 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
              <Bell size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xl italic">Silence is golden. No announcements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
