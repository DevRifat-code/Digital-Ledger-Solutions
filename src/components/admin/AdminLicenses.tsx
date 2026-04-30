import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Key, Plus, Trash2, Search, Filter, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { generateLicenseKey } from '../../lib/utils';

export function AdminLicenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLicense, setNewLicense] = useState({
    productId: '',
    key: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [licenseSnap, productSnap] = await Promise.all([
        getDocs(collection(db, 'licenses')),
        getDocs(collection(db, 'products'))
      ]);
      
      setLicenses(licenseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setProducts(productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = products.find(p => p.id === newLicense.productId);
      if (!newLicense.productId) return;
      
      await addDoc(collection(db, 'licenses'), {
        productId: newLicense.productId,
        key: newLicense.key,
        productName: product?.name || 'Unknown Product',
        status: 'available',
        createdAt: serverTimestamp()
      });
      setNewLicense({ productId: '', key: '' });
      fetchData();
    } catch (err) {
      handleFirestoreError(err, 'create', 'licenses');
    }
  };

  const handleBulkGenerate = async (count: number) => {
    if (!newLicense.productId) {
      alert('Please select a product first');
      return;
    }
    
    try {
      const product = products.find(p => p.id === newLicense.productId);
      const promises = [];
      
      for (let i = 0; i < count; i++) {
        promises.push(
          addDoc(collection(db, 'licenses'), {
            productId: newLicense.productId,
            key: generateLicenseKey(),
            productName: product?.name || 'Unknown Product',
            status: 'available',
            createdAt: serverTimestamp()
          })
        );
      }
      
      await Promise.all(promises);
      alert(`Successfully generated ${count} keys!`);
      fetchData();
    } catch (err) {
      handleFirestoreError(err, 'create', 'licenses-bulk');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this license key?')) return;
    try {
      await deleteDoc(doc(db, 'licenses', id));
      fetchData();
    } catch (err) {
      handleFirestoreError(err, 'delete', `licenses/${id}`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">License Management</h1>
          <p className="text-slate-500 font-medium mt-1">Generate and manage activation keys for your products.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-display font-black text-slate-900 mb-6 uppercase tracking-tight">Add License Key</h3>
            <form onSubmit={handleAddLicense} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Product</label>
                <select
                  required
                  value={newLicense.productId}
                  onChange={(e) => setNewLicense({ ...newLicense, productId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">License Key</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    value={newLicense.key}
                    onChange={(e) => setNewLicense({ ...newLicense, key: e.target.value })}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="flex-1 bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setNewLicense({ ...newLicense, key: generateLicenseKey() })}
                    className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Generate Random Key"
                  >
                    <Sparkles size={18} />
                  </button>
                </div>
              </div>

              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20">
                Add Selected Key
              </button>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bulk Generation</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => handleBulkGenerate(10)}
                    className="px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    Generate 10
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleBulkGenerate(50)}
                    className="px-4 py-3 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    Generate 50
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search licenses..." className="flex-1 bg-transparent border-none outline-none font-medium text-sm text-slate-700" />
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Key</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">{lic.productName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{lic.key}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        lic.status === 'available' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {lic.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(lic.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {licenses.length === 0 && !loading && (
              <div className="py-20 text-center text-slate-400 font-bold italic">
                No licenses found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
