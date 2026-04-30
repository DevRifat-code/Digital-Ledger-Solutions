import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, LogOut, ExternalLink, ShoppingBag, User, Mail, 
  Shield, Key, Camera, CheckCircle, AlertCircle, Loader2, 
  ArrowRight, CreditCard, Calendar, Smartphone
} from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

export function Profile() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Félix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Léo'
  ];

  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const currency = settings.currencySymbol || '৳';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch extended profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.displayName || u.displayName || '');
            setPhotoURL(data.photoURL || u.photoURL || '');
          } else {
            setDisplayName(u.displayName || '');
            setPhotoURL(u.photoURL || '');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setDisplayName(u.displayName || '');
          setPhotoURL(u.photoURL || '');
        }
        fetchOrders(u.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function fetchOrders(uid: string) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    return {
      totalSpent: orders.reduce((sum, order) => sum + (order.amount || 0), 0),
      orderCount: orders.length,
      lastOrder: orders[0]?.createdAt || null
    };
  }, [orders]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    setMessage(null);
    
    try {
      // 1. Update Firestore Profile (Supports larger photoURL/Base64)
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        photoURL,
        email: user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Try to update Auth Profile (might fail if URL is too long, but we have Firestore as backup)
      try {
        // Only attempt Auth update if photoURL is short enough (standard limit ~2048 chars)
        const authPhotoURL = photoURL.length < 2000 ? photoURL : null;
        await updateProfile(user, { 
          displayName, 
          ...(authPhotoURL && { photoURL: authPhotoURL }) 
        });
      } catch (authErr) {
        console.warn('Auth profile update skipped/failed (length limit), using Firestore as primary.');
      }

      setMessage({ type: 'success', text: 'Identity updated successfully.' });
    } catch (err: any) {
      handleFirestoreError(err, 'update', `users/${user.uid}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsUpdating(true);
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage({ type: 'success', text: 'Security link sent to your email.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset email.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Secure Data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-12 rounded-[3rem] text-center shadow-2xl">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">Identity Required</h2>
          <p className="text-slate-500 mb-10 font-medium">You must be authenticated to access your digital environment.</p>
          <Link to="/auth" className="block w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all">
            Enter Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb & Tab Switches */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              User Intelligence <ArrowRight size={12} /> Account Dashboard
            </p>
            <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight">
              Hello, {user.displayName?.split(' ')[0] || 'User'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all",
                activeTab === 'orders' ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-600 shadow-sm"
              )}
            >
              Order Architecture
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all",
                activeTab === 'settings' ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-600 shadow-sm"
              )}
            >
              Security & Identity
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' ? (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Lifecycle Value</p>
                    <h3 className="text-4xl font-display font-black text-slate-900">{currency}{stats.totalSpent.toLocaleString()}</h3>
                  </div>
                  <CreditCard className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Successful Assets</p>
                    <h3 className="text-4xl font-display font-black">{stats.orderCount} <span className="text-xl font-medium opacity-60">Orders</span></h3>
                  </div>
                  <Package className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Last Interaction</p>
                    <h3 className="text-xl font-display font-black text-slate-900">
                      {stats.lastOrder ? stats.lastOrder.toDate().toLocaleDateString() : 'No History'}
                    </h3>
                  </div>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <Calendar size={32} />
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-6">
                 {orders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={order.id}
                        className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-center gap-8 w-full lg:w-auto">
                          <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 border border-slate-100 shrink-0 group-hover:bg-indigo-50 transition-colors">
                            <Package size={32} />
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                order.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                order.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-red-50 text-red-600 border-red-100"
                              )}>
                                {order.status}
                              </span>
                            </div>
                            <h3 className="text-xl font-display font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{order.productName}</h3>
                            <p className="text-indigo-600 font-black text-lg">{currency}{order.amount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                          {order.licenseKey && (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1 sm:min-w-[280px]">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Key size={10} /> Active Digital Component
                              </p>
                              <p className="font-mono text-sm font-black text-slate-700 select-all tracking-tight">{order.licenseKey}</p>
                            </div>
                          )}
                          <Link
                            to={`/success/${order.id}`}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                          >
                            <ExternalLink size={16} />
                            View Assets
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 border-dashed rounded-[3rem] py-32 text-center shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
                      <ShoppingBag size={48} />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-900 uppercase mb-2 tracking-tight">Empty Inventory</h3>
                    <p className="text-slate-400 font-medium text-lg mb-12">Your command center shows no history of acquisitions.</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all">
                      Acquire Assets <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
               key="settings"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              {/* Profile Card */}
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center">
                    <div className="relative inline-block mb-8 group">
                        <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 text-4xl font-black border border-indigo-100 transition-transform group-hover:scale-105 duration-500 overflow-hidden shadow-inner">
                            {photoURL ? (
                              <img src={photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              user.email?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -right-2 -bottom-2 w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-lg group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all cursor-pointer"
                        >
                            <Camera size={18} />
                        </button>
                    </div>
                    <h2 className="text-2xl font-display font-black text-slate-900 mb-1">{user.displayName || 'Identity Pending'}</h2>
                    <p className="text-slate-400 font-medium mb-8 select-all">{user.email}</p>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      Terminate Session
                    </button>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 relative z-10">Endpoint Intelligence</h4>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60">
                                <Mail size={18} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-none mb-1">Authenticated Email</p>
                                <p className="text-sm font-bold truncate max-w-[150px]">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60">
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-none mb-1">Identity Provider</p>
                                <p className="text-sm font-bold">{user.providerData[0]?.providerId || 'Direct'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                </div>
              </div>

              {/* Forms Panel */}
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                      <div>
                        <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Identity Configuration</h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Configure your digital representation</p>
                      </div>
                      <AnimatePresence>
                        {message && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={cn(
                              "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                              message.type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                            )}
                          >
                            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {message.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>

                   <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Identity Name</label>
                           <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-6 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-sm focus:shadow-indigo-50"
                                placeholder="Your full name"
                              />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Avatar Resource</label>
                           <div className="relative">
                              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="text"
                                value={photoURL}
                                onChange={(e) => setPhotoURL(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-6 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-sm focus:shadow-indigo-50"
                                placeholder="https://image-url..."
                              />
                           </div>
                           <div className="flex flex-wrap gap-3">
                              {suggestedAvatars.map((url, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setPhotoURL(url)}
                                  className={cn(
                                    "w-12 h-12 rounded-xl border-2 transition-all p-1 bg-white overflow-hidden hover:scale-110",
                                    photoURL === url ? "border-indigo-600 scale-110" : "border-slate-100"
                                  )}
                                >
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>
                      <div className="pt-4">
                         <button 
                            disabled={isUpdating}
                            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-slate-900 disabled:bg-slate-300 transition-all active:scale-95 flex items-center gap-3"
                         >
                            {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                            Save Profile Changes
                         </button>
                      </div>
                   </form>
                </div>

                {/* Security Panel */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                <Shield size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight uppercase">Credential Guard</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Receive a cryptographic reset link via email</p>
                            </div>
                        </div>
                        <button 
                          onClick={handlePasswordReset}
                          disabled={isUpdating}
                          className="px-8 py-5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                        >
                            Execute Security Reset
                        </button>
                    </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
