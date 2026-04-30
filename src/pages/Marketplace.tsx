import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

export function Marketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (error) {
        handleFirestoreError(error, 'list', 'products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">Software Solutions</h1>
            <p className="text-slate-500 font-medium">Ready-to-deploy digital assets and premium scripts.</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4">
             {/* Search */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
                />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-white border border-slate-100 rounded-[2rem] animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p as any} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white border border-slate-200 border-dashed rounded-[3rem]">
            <p className="text-slate-400 text-xl font-bold italic tracking-tight">No products found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
