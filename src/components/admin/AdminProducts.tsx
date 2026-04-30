import React, { useState } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, ExternalLink, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../../lib/imageUtils';

interface AdminProductsProps {
  products: any[];
  newProduct: any;
  setNewProduct: (p: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
  onEdit: (product: any) => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  isSubmitting: boolean;
}

export function AdminProducts({ 
  products, 
  newProduct, 
  setNewProduct, 
  onSubmit, 
  onDelete,
  onEdit,
  editingProductId,
  setEditingProductId,
  isSubmitting 
}: AdminProductsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal when editingProductId is set
  React.useEffect(() => {
    if (editingProductId) {
      setIsModalOpen(true);
    }
  }, [editingProductId]);

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProductId(null);
    setNewProduct({ name: '', description: '', price: 0, category: '', imageUrl: '', demoUrl: '', buyUrl: '' });
  };

  // Close modal when submission is successful
  React.useEffect(() => {
    if (!isSubmitting && isModalOpen) {
      // Check if product was cleared (meaning it was successful)
      if (newProduct.name === '') {
        setIsModalOpen(false);
      }
    }
  }, [isSubmitting, newProduct.name]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress product thumbnail to max 600px wide
        const compressedBase64 = await compressImage(file, 600, 600, 0.7);
        setNewProduct({ ...newProduct, imageUrl: compressedBase64 });
      } catch (err) {
        console.error('Error compressing product image:', err);
        alert('Failed to process image. Please try another one.');
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Product Management</h1>
          <p className="text-slate-500 font-medium mt-1">Add, update and organize your digital assets.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-slate-900 transition-all active:scale-95"
            >
                <Plus size={20} />
                Create Product
            </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">
                    {editingProductId ? 'Update Digital Asset' : 'New Digital Asset'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    {editingProductId ? 'Modify your existing asset details' : 'Fill in the details to list your asset'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-red-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                <form onSubmit={handleFormSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Thumbnail Preview</label>
                            <label className="w-full aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-600 transition-all">
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            {newProduct.imageUrl && newProduct.imageUrl !== "" ? (
                                <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-slate-300 flex flex-col items-center gap-2">
                                <Package size={32} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-center">Click to Upload<br/>(PNG/JPG)</span>
                                </div>
                            )}
                            </label>
                            <p className="text-[9px] text-slate-400 font-bold uppercase pl-1 text-center">Base64 encoded storage enabled</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                            <textarea
                            required
                            rows={6}
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 resize-none"
                            placeholder="Tell users why they need this script or asset..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Product Name', key: 'name', type: 'text', placeholder: 'e.g. E-commerce Script' },
                            { label: 'Category', key: 'category', type: 'text', placeholder: 'e.g. PHP Scripts' },
                            { label: 'Price (BDT)', key: 'price', type: 'number', placeholder: '0.00' },
                            { label: 'Demo URL', key: 'demoUrl', type: 'url', placeholder: 'https://...' },
                            { label: 'Download Link', key: 'buyUrl', type: 'url', placeholder: 'https://...' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{field.label}</label>
                            <input
                                required
                                type={field.type}
                                value={newProduct[field.key as keyof typeof newProduct]}
                                onChange={(e) => setNewProduct({ ...newProduct, [field.key]: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                                placeholder={field.placeholder}
                            />
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                        disabled={isSubmitting}
                        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {isSubmitting ? 'Processing Entry...' : (editingProductId ? 'Update Asset' : 'Broadcast Asset')}
                    </button>
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] mt-4">Safe & Secure Storage Implementation</p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* List Search */}
        <div className="bg-white px-8 py-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-4">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Filter through your assets library..." className="flex-1 bg-transparent border-none outline-none font-medium text-sm text-slate-700 placeholder:text-slate-300" />
            <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((p) => (
                <motion.div 
                layout
                key={p.id} 
                className="bg-white p-7 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
                >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 flex items-center justify-center p-8 text-indigo-400 opacity-20">
                    <Package size={48} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex gap-6 items-start mb-6">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden shrink-0 border-2 border-white shadow-inner flex items-center justify-center">
                            {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                            ) : (
                                <Package size={24} className="text-slate-300" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] block mb-1">{p.category}</span>
                            <h4 className="font-display font-black text-slate-900 truncate mb-1 leading-tight">{p.name}</h4>
                            <p className="text-xl font-black text-indigo-600">৳{Number(p.price).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3">
                        <button 
                            onClick={() => onEdit(p)}
                            className="flex-1 h-12 flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-slate-100"
                        >
                            <Edit3 size={14} />
                            Modify
                        </button>
                        <button 
                            onClick={() => onDelete(p.id)}
                            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className="w-px h-6 bg-slate-100 mx-1"></div>
                        <a 
                            href={p.demoUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>
                </motion.div>
            ))}
        </div>

        {products.length === 0 && (
            <div className="py-40 text-center bg-white border-4 border-dashed border-slate-100 rounded-[4rem]">
                <Package size={64} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-display font-black text-slate-900 mb-2 uppercase tracking-tight">Vault is Empty</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">You haven't uploaded any digital assets yet. Use the action button above to start your catalog.</p>
            </div>
        )}
      </div>
    </div>
  );
}
