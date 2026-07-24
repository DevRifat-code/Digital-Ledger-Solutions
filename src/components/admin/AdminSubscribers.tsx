import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Mail, Trash2, Search, Download, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      const q = query(collection(db, 'subscribers'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setSubscribers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await deleteDoc(doc(db, 'subscribers', id));
      fetchSubscribers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-slate-100">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">Newsletter Subscribers</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your mailing list and audience reach.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 dark:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 dark:shadow-none hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Subscriber Email</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Joined On</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-indigo-600 dark:text-emerald-400">
                      <Mail size={16} />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{s.email}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {s.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                </td>
                <td className="px-8 py-5">
                  <span className="flex items-center gap-1.5 text-green-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <UserCheck size={12} />
                    Active
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && !loading && (
          <div className="py-24 text-center">
            <Mail size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-bold italic">No subscribers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
