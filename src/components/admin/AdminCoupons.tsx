import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Ticket, Plus, Trash2, Search, Percent } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: 0,
    type: 'percentage' as 'percentage' | 'fixed',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      setCoupons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        discount: Number(newCoupon.discount),
        createdAt: serverTimestamp()
      });
      setNewCoupon({ code: '', discount: 0, type: 'percentage' });
      fetchCoupons();
    } catch (err) {
      handleFirestoreError(err, 'create', 'coupons');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      fetchCoupons();
    } catch (err) {
      handleFirestoreError(err, 'delete', `coupons/${id}`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Coupon Manager</h1>
          <p className="text-slate-500 font-medium mt-1">Create and manage discount codes for your customers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-display font-black text-slate-900 mb-6 uppercase tracking-tight">New Promo Code</h3>
            <form onSubmit={handleAddCoupon} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Coupon Code</label>
                <input
                  required
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  placeholder="SAVE30"
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Discount</label>
                  <input
                    required
                    type="number"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  >
                    <option value="percentage">Percent (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20">
                Create Coupon
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => (
              <motion.div 
                layout
                key={c.id} 
                className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-slate-200 relative group overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-50 -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket size={16} className="text-indigo-600" />
                      <span className="text-lg font-mono font-black text-slate-900">{c.code}</span>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">
                      {c.type === 'percentage' ? `${c.discount}% OFF` : `৳${c.discount} OFF`}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
            {coupons.length === 0 && !loading && (
              <div className="md:col-span-2 py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Percent size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold italic">No active coupons available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
