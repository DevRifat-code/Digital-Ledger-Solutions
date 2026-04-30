import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Download, Search, Link as LinkIcon, ExternalLink, Package } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminDownloads() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateLink = async (productId: string, url: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), { buyUrl: url });
      fetchProducts();
      alert('Download link updated!');
    } catch (err) {
      handleFirestoreError(err, 'update', `products/${productId}`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Downloads Hub</h1>
          <p className="text-slate-500 font-medium mt-1">Manage source file links and delivery URLs for your assets.</p>
        </div>
      </div>

      <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 max-w-2xl">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search products to set links..." 
          className="flex-1 bg-transparent border-none outline-none font-medium text-sm text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <motion.div 
            layout
            key={p.id}
            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
          >
            <div className="flex gap-4 items-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Package size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{p.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Download URL</label>
                <div className="relative">
                  <input
                    type="url"
                    defaultValue={p.buyUrl}
                    onBlur={(e) => handleUpdateLink(p.id, e.target.value)}
                    placeholder="https://storage.rifatdev.com/file.zip"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs font-mono focus:border-indigo-600 focus:bg-white outline-none transition-all pr-10"
                  />
                  <LinkIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
              
              {p.buyUrl && (
                <a 
                  href={p.buyUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                >
                  <ExternalLink size={14} />
                  Test Link
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[3rem]">
          <Download size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold text-xl italic">No assets matching your search.</p>
        </div>
      )}
    </div>
  );
}
