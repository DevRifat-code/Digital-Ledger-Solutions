import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Moon, Sun, ChevronDown, Menu, LogOut, User as UserIcon, Home } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

interface AdminHeaderProps {
  user: FirebaseUser;
  onLogout: () => void;
  onMenuToggle: () => void;
  onProfileClick: () => void;
  isSidebarOpen?: boolean;
}

export function AdminHeader({ user, onLogout, onMenuToggle, onProfileClick, isSidebarOpen }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [hasNotifications, setHasNotifications] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
        alert(`Searching for: ${searchValue}`);
        setSearchValue('');
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button (Desktop & Mobile) */}
        <button 
          onClick={onMenuToggle}
          className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm"
          title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
          <span className="text-xs font-bold hidden sm:inline text-slate-700 dark:text-slate-300">
            {isSidebarOpen ? 'Hide Menu' : 'Show Menu'}
          </span>
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-64 md:w-96 group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-emerald-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Global system search..."
            className="block w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 pl-11 pr-12 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center hidden md:flex">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded shadow-sm">
              Enter
            </span>
          </div>
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-1 md:gap-2">
          {/* Home Button */}
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-emerald-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-xl transition-all border border-indigo-100 dark:border-slate-700 shadow-sm font-bold text-xs"
            title="Go to Storefront / Home"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} className="fill-current" /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => {
                setHasNotifications(false);
                alert('All notifications cleared.');
            }}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all relative"
          >
            <Bell size={20} />
            {hasNotifications && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-200 dark:border-slate-800 group"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors">{user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Administrator</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-emerald-400 font-black border border-slate-200 dark:border-slate-700 overflow-hidden">
                {user.photoURL && user.photoURL.trim() !== "" ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0) || 'A'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors">
                <ChevronDown size={12} className={isProfileOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </div>
            </div>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 overflow-hidden overflow-y-auto max-h-[calc(100vh-120px)]"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      to="/"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-sm font-bold"
                    >
                      <Home size={18} />
                      Storefront Home
                    </Link>
                    <button 
                      onClick={() => {
                        onProfileClick();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-sm font-bold"
                    >
                      <UserIcon size={18} />
                      Admin Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all text-sm font-bold" onClick={onLogout}>
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
