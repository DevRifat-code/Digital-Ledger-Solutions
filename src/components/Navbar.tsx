import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, LayoutGrid, Home, User, Code2, LogIn, Zap, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import { GlobalSearch } from './GlobalSearch';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings } = useSiteSettings();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled 
        ? location.pathname === '/' 
          ? "bg-[#061D19]/80 backdrop-blur-md border-[#0a2e28] text-white shadow-[0_10px_30px_rgb(6,29,25,0.4)] border-b py-0" 
          : "bg-white/70 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800 text-slate-900 dark:text-white shadow-lg shadow-slate-100/50 dark:shadow-none py-0"
        : location.pathname === '/' 
          ? "bg-transparent text-white border-b border-transparent py-2" 
          : "bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-2"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex items-center justify-between transition-all duration-500",
          isScrolled ? "h-16" : "h-20"
        )}>
          <Link to="/" className="flex items-center group shrink-0" title={settings.siteName}>
            <div className={cn(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all shadow-2xs group-hover:scale-[1.02]",
              location.pathname === '/' && !isScrolled
                ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
                : "bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white hover:border-emerald-500/40"
            )}>
              {settings.logoUrl && settings.logoUrl.trim() !== "" ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="w-6 h-6 sm:w-7 sm:h-7 object-contain group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:rotate-6 transition-transform">
                  <Zap size={14} />
                </div>
              )}
              <span className={cn(
                "font-display font-black text-xs sm:text-sm tracking-wider uppercase",
                location.pathname === '/' && !isScrolled ? "text-white" : "text-slate-900 dark:text-white"
              )}>
                {settings.siteName}
              </span>
            </div>
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
                    } else if (link.href === '/#pricing' && location.pathname === '/') {
                      const elem = document.getElementById('pricing');
                      if (elem) {
                        elem.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className={cn(
                    "text-[13px] font-black uppercase tracking-widest transition-all hover:opacity-100",
                    location.pathname === link.href ? "opacity-100" : "opacity-60 dark:opacity-75 hover:opacity-80 dark:hover:opacity-100",
                    location.pathname === '/' && location.pathname === link.href ? "text-yellow-500" : 
                    location.pathname !== '/' && location.pathname === link.href ? "text-emerald-600 dark:text-emerald-400" : ""
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
              {/* Global Search Bar */}
              <GlobalSearch navbarThemeOverride={location.pathname === '/'} />

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-2.5 rounded-xl transition-all relative overflow-hidden border",
                  location.pathname === '/' 
                    ? "bg-white/10 hover:bg-white/20 border-white/10 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
                aria-label="Toggle Theme"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: theme === 'dark' ? 0 : 1, 
                      rotate: theme === 'dark' ? -90 : 0,
                      opacity: theme === 'dark' ? 0 : 1 
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                  >
                    <Sun size={20} className="text-amber-500" />
                  </motion.div>
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: theme === 'dark' ? 1 : 0, 
                      rotate: theme === 'dark' ? 0 : 90,
                      opacity: theme === 'dark' ? 1 : 0 
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                  >
                    <Moon size={20} className="text-indigo-400" />
                  </motion.div>
                </div>
              </button>

              {!user ? (
                <>
                  <Link to="/auth" className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl border transition-all",
                    location.pathname === '/' ? "border-white/20 text-white hover:bg-white/10" : "border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
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
                      location.pathname === '/' ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
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
                location.pathname === '/' ? "text-white hover:bg-white/10" : "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
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
          className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-4"
        >
          {/* Mobile Global Search trigger */}
          <div className="pb-1">
            <GlobalSearch isMobileNav={true} onCloseMobileNav={() => setIsOpen(false)} />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => {
                setIsOpen(false);
                if (link.href === '/#pricing' && location.pathname === '/') {
                  const elem = document.getElementById('pricing');
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="block text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-emerald-400"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-emerald-400 transition-colors"
              >
                Profile
              </Link>
              {(user.email === 'mdrifathossainpersonal@gmail.com' || settings.contactEmail === user.email) && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-bold text-indigo-600 dark:text-emerald-400 hover:text-indigo-700 dark:hover:text-emerald-300 transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="block text-lg font-bold text-indigo-600 dark:text-emerald-400 hover:text-indigo-700 dark:hover:text-emerald-300 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Mobile Theme Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Appearance</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200/50 dark:border-slate-700/50"
            >
              {theme === 'dark' ? (
                <>
                  <Moon size={14} className="text-indigo-400" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun size={14} className="text-amber-500" />
                  Light Mode
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
