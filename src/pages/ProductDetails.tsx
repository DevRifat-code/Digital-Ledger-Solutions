import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ChevronRight, ShoppingCart, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const currency = settings.currencySymbol || '৳';

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="pt-32 text-center text-slate-900">Loading component...</div>;
  if (!product) return <div className="pt-32 text-center text-slate-900">Product not found.</div>;

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/marketplace" className="hover:text-indigo-600 transition-colors">Products</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden p-8 shadow-xl shadow-slate-200/50"
          >
            <div className="aspect-[4/3] bg-indigo-600 rounded-[2rem] flex items-center justify-center p-12 overflow-hidden shadow-inner">
               <img 
                 src={product.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'} 
                 alt={product.name}
                 className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                 referrerPolicy="no-referrer"
               />
            </div>
          </motion.div>

          {/* Details Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6 w-fit border border-indigo-100">
              {product.category}
            </span>
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-slate-900 mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
               <span className="text-3xl font-display font-extrabold text-indigo-600 tracking-tight">
                 {currency}{product.price.toLocaleString()}
               </span>
               <div className="h-4 w-px bg-slate-200 md:block hidden" />
               <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                 <CheckCircle2 size={16} />
                 Instant Delivery
               </div>
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <p className="text-slate-600 text-lg leading-relaxed">
                {product.description}
              </p>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 list-none p-0">
                {(product.features || [
                  'Full Source Code Access',
                  'Admin Dashboard Included',
                  'One-time Payment',
                  'Lifetime License',
                  'Secure Payment System',
                  'Easy Installation Guide'
                ]).map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="font-semibold text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Link
                to={`/checkout/${product.id}`}
                className="flex-1 bg-indigo-600 text-white px-10 py-5 rounded-[1.25rem] font-bold text-xl hover:bg-slate-950 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3"
              >
                <ShoppingCart size={24} />
                Order Now
              </Link>
              <button 
                onClick={() => navigate(-1)}
                className="px-8 py-5 border-2 border-slate-200 text-slate-600 rounded-[1.25rem] font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
