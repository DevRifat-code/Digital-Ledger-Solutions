import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../../lib/firebase';
import { motion } from 'motion/react';
import { Mail, Trash2, Calendar, User, MessageSquare, Trash } from 'lucide-react';

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, 'list', 'inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      setInquiries(inquiries.filter(i => i.id !== id));
    } catch (error) {
      handleFirestoreError(error, 'delete', 'inquiries');
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading inquiries...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight mb-2">Customer Inquiries</h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage messages from your contact form.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {inquiries.length > 0 ? inquiries.map((inquiry) => (
          <motion.div
            key={inquiry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                      <User size={14} className="text-emerald-500" />
                      {inquiry.name}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                      <Mail size={14} className="text-indigo-500" />
                      {inquiry.email}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                      <Calendar size={14} className="text-amber-500" />
                      {inquiry.createdAt?.toDate().toLocaleDateString()}
                   </div>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{inquiry.subject}</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group">
                    <MessageSquare size={16} className="absolute top-4 right-4 text-slate-200 group-hover:text-emerald-400 transition-colors" />
                    <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{inquiry.message}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(inquiry.id)}
                className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shrink-0 self-start"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Mail className="mx-auto text-slate-200 mb-6" size={64} />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">No inquiries found yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
