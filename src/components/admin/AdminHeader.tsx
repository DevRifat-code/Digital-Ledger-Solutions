import React, { useState } from 'react';
import { Search, Bell, Moon, ChevronDown, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface AdminHeaderProps {
  user: FirebaseUser;
  onLogout: () => void;
  onMenuToggle: () => void;
  onProfileClick: () => void;
}

export function AdminHeader({ user, onLogout, onMenuToggle, onProfileClick }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  const toggleDarkMode = () => {
    const newState = !isDarkMode;
    setIsDarkMode(newState);
    if (newState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
        alert(`Searching for: ${searchValue}`);
        setSearchValue('');
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-64 md:w-96 group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Global system search..."
            className="block w-full bg-slate-50 border border-slate-200 py-2.5 pl-11 pr-12 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center hidden md:flex">
            <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
              Enter
            </span>
          </div>
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl transition-all relative ${isDarkMode ? 'bg-slate-900 text-amber-400' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Moon size={20} className={isDarkMode ? 'fill-current' : ''} />
          </button>
          <button 
            onClick={() => {
                setHasNotifications(false);
                alert('All notifications cleared.');
            }}
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative"
          >
            <Bell size={20} />
            {hasNotifications && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-200 group"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">{user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Administrator</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 font-black border border-slate-200 overflow-hidden">
                {user.photoURL && user.photoURL !== "" ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0) || 'A'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
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
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-2 overflow-hidden overflow-y-auto max-h-[calc(100vh-120px)]"
                >
                  <div className="px-4 py-3 border-b border-slate-50 mb-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        onProfileClick();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold"
                    >
                      <UserIcon size={18} />
                      Admin Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold" onClick={onLogout}>
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
