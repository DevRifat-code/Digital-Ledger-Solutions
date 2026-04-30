import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, handleAuthError } from '../lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, ShieldCheck, Wallet, ChevronRight, CheckCircle2, User as UserIcon, LogIn } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { sendOrderNotificationEmail } from '../lib/emailService';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currency = settings.currencySymbol || '৳';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bkashNumber: '',
    transactionId: ''
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setFormData(prev => ({ ...prev, fullName: u.displayName || '', email: u.email || '' }));
      }
    });
    return () => unsub();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) {
        alert('Please login first');
        navigate('/admin');
        return;
    }
    
    setIsSubmitting(true);
    try {
      const orderData = {
        productId: product.id,
        productName: product.name,
        amount: product.price,
        customerName: formData.fullName,
        customerEmail: formData.email,
        bkashNumber: formData.bkashNumber,
        transactionId: formData.transactionId,
        status: 'pending',
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Send email notification if enabled
      if (settings.orderNotificationsEnabled && settings.contactEmail) {
        sendOrderNotificationEmail({ id: docRef.id, ...orderData }, settings.contactEmail);
      }

      navigate(`/success/${docRef.id}`);
    } catch (err) {
      handleFirestoreError(err, 'create', 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="pt-32 text-center text-slate-900">Validating checkout session...</div>;
  if (!product) return <div className="pt-32 text-center text-slate-900">Product not found.</div>;

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
            <Link to={`/product/${product.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                <ArrowLeft size={16} />
                Back to product
            </Link>
            <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                <ShoppingBag className="text-indigo-600" />
                Complete Your Order
            </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7">
            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-xl shadow-slate-200/50 text-center"
              >
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-100">
                  <UserIcon size={40} />
                </div>
                <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">Login Required</h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">To place an order and track it in your profile, please sign in to your account.</p>
                <Link
                  to="/auth"
                  state={{ from: { pathname: `/checkout/${id}` } }}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-500/20"
                >
                  <LogIn size={20} />
                  Login to Purchase
                </Link>
              </motion.div>
            ) : (
              <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-xl shadow-slate-200/50"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                       <UserIcon size={20} className="text-indigo-600" />
                       Your Information
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Full Name</label>
                        <input
                          required
                          type="text"
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                          placeholder="Ex: Md Rifat Hossain"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Email Address</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                          placeholder="rifat@example.com"
                        />
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                       <Wallet size={20} className="text-indigo-600" />
                       Payment Information (bKash)
                    </h3>
                    
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                            <span className="font-bold text-xs">P</span>
                        </div>
                        <div>
                            <h5 className="font-bold text-indigo-900 mb-1 leading-none uppercase text-xs tracking-wider">Payment Instructions</h5>
                            <p className="text-indigo-700 text-sm leading-relaxed">
                                Please send the amount to our bKash personal number: <br />
                                <span className="font-extrabold text-indigo-900 text-lg">{settings.bkashNumber || '018XXXXXXXX'}</span> <br />
                                Then provide your bKash number and Transaction ID below.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Your bKash Number</label>
                        <input
                          required
                          type="text"
                          value={formData.bkashNumber}
                          onChange={e => setFormData({...formData, bkashNumber: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                          placeholder="017/018XXXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Transaction ID (TrxID)</label>
                        <input
                          required
                          type="text"
                          value={formData.transactionId}
                          onChange={e => setFormData({...formData, transactionId: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono tracking-widest"
                          placeholder="8JAL3K9A"
                        />
                      </div>
                    </div>
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-indigo-600 text-white rounded-[1.25rem] py-6 flex items-center justify-center gap-3 font-bold text-xl hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing Order...' : 'Place Order Now'}
                  <ChevronRight size={24} />
                </button>
                
                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
                    <ShieldCheck size={16} />
                    Secure Transaction with manual verification
                </div>
              </form>
            </motion.div>
          )}
          </div>

          {/* Order Summary Side */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Order Summary</h4>
                    </div>
                    <div className="p-8">
                        <div className="flex gap-6 mb-8">
                            <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center p-4 border border-indigo-400 overflow-hidden shrink-0 shadow-lg shadow-indigo-100">
                                {product.imageUrl && product.imageUrl !== "" ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
                                ) : (
                                    <ShoppingBag size={32} className="text-white opacity-20" />
                                )}
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-900 text-xl leading-tight mb-1">{product.name}</h5>
                                <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{product.category}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between text-slate-500 font-semibold mb-2">
                                <span>Subtotal</span>
                                <span>{currency}{product.price.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 font-semibold">
                                <span>Service Fee</span>
                                <span className="text-green-600 uppercase text-xs tracking-widest">FREE</span>
                            </div>
                            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">Total Payable</span>
                                <span className="text-3xl font-display font-extrabold text-indigo-600">{currency}{product.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full" />
                    <h5 className="font-bold mb-4 relative z-10 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Why Choose Us?
                    </h5>
                    <ul className="space-y-3 relative z-10">
                        <li className="text-slate-400 text-sm flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Full Source Code Protection</li>
                        <li className="text-slate-400 text-sm flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Instant Delivery After Verification</li>
                        <li className="text-slate-400 text-sm flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Free Regular Updates</li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
