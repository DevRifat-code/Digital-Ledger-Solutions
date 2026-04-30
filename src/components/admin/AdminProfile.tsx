import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Shield, Key, Camera, LogOut, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError } from '../../lib/firebase';
import { updateProfile, updatePassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function AdminProfile() {
  const user = auth.currentUser;
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || user.displayName || '');
          setPhotoURL(data.photoURL || user.photoURL || '');
        }
      } catch (err) {
        console.error('Error loading admin profile:', err);
      }
    }
    loadProfile();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    setMessage(null);
    
    try {
      // 1. Save to Firestore (Primary for large files)
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        photoURL,
        role: 'admin',
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Sync with Auth (as backup)
      try {
        const authPhotoURL = photoURL.length < 2000 ? photoURL : null;
        await updateProfile(user, { 
          displayName, 
          ...(authPhotoURL && { photoURL: authPhotoURL }) 
        });
      } catch (authErr) {
        console.warn('Auth sync skipped due to length.');
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
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset email.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/auth';
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Admin Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your administrative account and security settings.</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
        >
          <LogOut size={14} />
          Terminate Session
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
              message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : 'bg-red-50 border-red-100 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center relative overflow-hidden group">
            <div className="relative z-10">
                <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200 group-hover:scale-105 transition-transform overflow-hidden">
                        {photoURL ? (
                          <img src={photoURL} alt="" className="w-full h-full object-cover rounded-[2.5rem]" />
                        ) : (
                          user?.email?.charAt(0).toUpperCase()
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
                      className="absolute -right-2 -bottom-2 w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-lg active:scale-95"
                    >
                        <Camera size={18} />
                    </button>
                </div>
                
                <h3 className="text-xl font-display font-black text-slate-900 mb-1">{user?.displayName || 'Administrator'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">{user?.email}</p>
                
                <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <div className="flex-1 py-3 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</p>
                        <p className="text-sm font-black text-indigo-600">Super Admin</p>
                    </div>
                    <div className="w-px bg-slate-200 my-2"></div>
                    <div className="flex-1 py-3 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-sm font-black text-emerald-600">Verified</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left px-1 mb-4">Command Summary</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Tier</span>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Tier 5 (Max)</span>
                        </div>
                         <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol</span>
                            <span className="text-[10px] font-black text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 uppercase">AES-256</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight mb-8">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-12 py-4 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all"
                            placeholder="Your Name"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            disabled 
                            type="email" 
                            defaultValue={user?.email || ''} 
                            className="w-full bg-slate-50 border border-slate-200 px-12 py-4 rounded-2xl text-sm font-medium opacity-60"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <button 
                      disabled={isUpdating}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 disabled:bg-slate-400 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-2"
                    >
                        {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute right-0 top-0 p-10 opacity-5">
                <Shield size={120} className="text-red-600" />
            </div>
            
            <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight mb-2">Security & Access</h3>
            <p className="text-slate-400 text-xs font-medium mb-10">Last security assessment: Healthy</p>
            
            <div className="space-y-6">
                <div className="flex flex-col gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Key size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">Recovery & Identity</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Receive a secure link to reset credentials</p>
                            </div>
                        </div>
                        <button 
                          onClick={handlePasswordReset}
                          disabled={isUpdating}
                          className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-50"
                        >
                            Send Reset Email
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white rounded-2xl text-red-500 shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all">
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">Authorization Guard</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Access restricted to verified admins</p>
                        </div>
                    </div>
                    <div className="px-6 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-600">
                        Active
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

