import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Star, Trash2, MessageSquare, User, Package } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      fetchReviews();
    } catch (err) {
      handleFirestoreError(err, 'delete', `reviews/${id}`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Reviews & Feedback</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor and moderate what customers are saying about your assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <motion.div 
            layout
            key={r.id} 
            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                />
              ))}
              <span className="text-[10px] font-black text-slate-400 ml-auto uppercase tracking-widest">
                {r.createdAt?.toDate().toLocaleDateString() || 'Just now'}
              </span>
            </div>

            <p className="text-sm text-slate-600 italic mb-6 leading-relaxed">"{r.comment}"</p>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{r.userName || 'Anonymous'}</p>
                <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-black uppercase">
                  <Package size={10} />
                  <span className="truncate">{r.productName || 'Product'}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
        {reviews.length === 0 && !loading && (
          <div className="col-span-full py-24 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
            <MessageSquare size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold text-xl italic">No feedback received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
