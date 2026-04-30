import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Key, ExternalLink, Package, Clock, ShieldX, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const currency = settings.currencySymbol || '৳';

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrder({ id: docSnap.id, ...data });
        
        // Fetch product info for the download link
        if (data.productId) {
            getDoc(doc(db, 'products', data.productId)).then(pSnap => {
                if (pSnap.exists()) setProduct({ id: pSnap.id, ...pSnap.data() });
            });
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [orderId]);

  if (loading) return <div className="pt-32 text-center text-slate-900">Verifying order status...</div>;
  if (!order) return <div className="pt-32 text-center text-slate-900">Order record not found.</div>;

  const isPending = order.status === 'pending';
  const isPaid = order.status === 'paid' || order.status === 'delivered';
  const isRejected = order.status === 'rejected';

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full px-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-8 md:p-16 text-center shadow-slate-200/50"
        >
            {/* Status Icon */}
            <div className="mb-8">
                {isPaid ? (
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-green-200">
                        <CheckCircle2 size={48} />
                    </div>
                ) : isRejected ? (
                    <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-red-200">
                        <ShieldX size={48} />
                    </div>
                ) : (
                    <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-amber-200">
                        <Clock size={48} className="animate-spin-slow" style={{ animationDuration: '4s' }} />
                    </div>
                )}
            </div>

            <h1 className="text-4xl font-display font-extrabold text-slate-900 mb-4">
                {isPaid ? 'Payment Verified!' : isRejected ? 'Order Rejected' : 'Order Received!'}
            </h1>
            <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto">
                {isPaid 
                  ? 'Thank you! Your payment has been verified. You can download your product now.' 
                  : isRejected 
                  ? 'There was an issue with your payment verification. Please contact support.' 
                  : 'We have received your payment details. Please wait while we verify your transaction (usually takes 10-30 mins).'}
            </p>

            {/* Order Details Display Card */}
            <div className="bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden mb-12 text-left">
                <div className="p-6 border-b border-slate-100 bg-white/50 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Order Details</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <Package size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 leading-tight">{order.productName}</h4>
                                <span className="text-xs text-slate-400 font-semibold">{currency}{order.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {isPaid && order.licenseKey && (
                        <div className="flex flex-col gap-2 p-6 bg-indigo-600 rounded-[1.25rem] text-white shadow-xl shadow-indigo-200">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70">
                                <Key size={14} />
                                Licensing Key
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-mono font-bold tracking-widest">{order.licenseKey}</span>
                                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {isPaid && product?.buyUrl ? (
                    <a 
                      href={product.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-indigo-600 text-white py-5 rounded-[1.25rem] font-bold text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                    >
                        <Download size={24} />
                        Download Now
                    </a>
                ) : isPending ? (
                    <button disabled className="w-full bg-slate-100 text-slate-400 py-5 rounded-[1.25rem] font-bold text-xl cursor-not-allowed">
                        Waiting for Verification
                    </button>
                ) : (
                    <Link 
                      to="/marketplace" 
                      className="w-full bg-indigo-600 text-white py-5 rounded-[1.25rem] font-bold text-xl hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                    >
                        Browse More
                        <ArrowRight size={24} />
                    </Link>
                )}
                
                <Link to="/profile" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors uppercase text-[10px] tracking-widest mt-2">
                    View My Order History
                </Link>
                <Link to="/" className="text-slate-500 font-bold hover:text-indigo-600 transition-colors uppercase text-[10px] tracking-widest">
                    Return to Homepage
                </Link>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
