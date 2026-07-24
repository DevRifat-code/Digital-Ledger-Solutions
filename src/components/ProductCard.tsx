import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { settings } = useSiteSettings();
  const currency = settings.currencySymbol || '৳';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col"
    >
      {/* Visual Header */}
      <div className="p-4">
        <div className="aspect-[4/3] relative rounded-[1.5rem] overflow-hidden bg-indigo-600 dark:bg-indigo-950/60 flex items-center justify-center p-8 group-hover:scale-[1.02] transition-transform duration-500 shadow-inner">
          {product.imageUrl && product.imageUrl.trim() !== "" ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          ) : (
            <ShoppingCart size={64} className="text-white opacity-20" />
          )}
          
          <div className="absolute top-4 left-4">
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8 pt-2 flex flex-col flex-1">
        <h3 className="font-display font-bold text-xl mb-2 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors">
          {product.name}
        </h3>
        <span className="text-2xl font-display font-extrabold text-indigo-600 dark:text-emerald-400 mb-4 block">
          {currency}{(product.price ?? 0).toLocaleString()}
        </span>
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-8 leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <Link
            to={`/product/${product.id}`}
            className="w-full bg-indigo-600 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-emerald-500 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-indigo-600/10"
          >
            Order Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
