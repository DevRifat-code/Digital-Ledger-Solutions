import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, LayoutGrid, Home, User, Code2, LogIn, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { settings } = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/marketplace' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      location.pathname === '/' ? "bg-transparent text-white" : "bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-900"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            {settings.logoUrl && settings.logoUrl !== "" ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                <Zap size={24} />
              </div>
            )}
            <span className={cn(
              "font-display font-black text-2xl tracking-tighter",
              location.pathname === '/' ? "text-white" : "text-slate-900"
            )}>
              {settings.siteName}
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => {
                    if (link.href === '/' && location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={cn(
                    "text-[13px] font-black uppercase tracking-widest transition-all hover:opacity-100",
                    location.pathname === link.href ? "opacity-100" : "opacity-60 hover:opacity-80",
                    location.pathname === '/' && location.pathname === link.href ? "text-yellow-500" : 
                    location.pathname !== '/' && location.pathname === link.href ? "text-emerald-600" : ""
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
              {!user ? (
                <>
                  <Link to="/auth" className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl border transition-all",
                    location.pathname === '/' ? "border-white/20 text-white hover:bg-white/10" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                  )}>
                    Login
                  </Link>
                  <Link to="/auth" className="text-[11px] font-black uppercase tracking-[0.2em] bg-yellow-500 text-slate-900 px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10">
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                      location.pathname === '/' ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  {(user.email === 'mdrifathossainpersonal@gmail.com' || settings.contactEmail === user.email) && (
                    <Link
                      to="/admin"
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all"
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                location.pathname === '/' ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-100"
              )}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-bold text-slate-700 hover:text-indigo-600"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block text-lg font-bold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Profile
              </Link>
              {user.email === 'mdrifathossainpersonal@gmail.com' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="block text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Login
            </Link>
          )}
        </motion.div>
      )}
    </nav>
  );
}
