import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, handleAuthError } from '../lib/firebase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, UserPlus, Globe, ShieldCheck, MailQuestion, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();
  
  const from = (location.state as any)?.from?.pathname || '/';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-8 font-bold text-sm">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100">
            <Globe size={32} />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">
            {isLogin ? 'Login to your account' : 'Create new account'}
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            {isLogin ? 'Access your orders and dashboard' : 'Join our digital marketplace today'}
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-2xl shadow-slate-200/50">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
                <ShieldCheck size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                    <UserPlus size={18} />
                  </span>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-6 rounded-2xl text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Md Rifat Hossain"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-6 rounded-2xl text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-6 rounded-2xl text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                />
              </div>
              {isLogin && (
                <div className="flex justify-end p-1">
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'Login Now' : 'Sign Up'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
          
          <div className="mt-10 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
