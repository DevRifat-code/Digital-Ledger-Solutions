import React from 'react';
import { 
  Layout, 
  Package, 
  ShoppingCart, 
  Settings, 
  Users, 
  CreditCard, 
  FileKey, 
  Download, 
  Ticket, 
  Star, 
  Mail, 
  Bell, 
  FileText,
  MessageSquare,
  BarChart3, 
  PieChart, 
  LogOut,
  Globe,
  ChevronLeft,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: any;
  active: boolean;
  onClick: (id: string) => void;
}

const SidebarItem = ({ id, label, icon: Icon, active, onClick }: SidebarItemProps) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    <Icon size={20} className="shrink-0" />
    <span className="text-sm">{label}</span>
  </button>
);

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ activeTab, setActiveTab, onLogout, isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[50] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:sticky top-0 left-0 z-[60] h-screen bg-[#0F172A] text-white flex flex-col border-r border-slate-800 transition-all duration-300 shrink-0 select-none
        ${isOpen 
          ? "w-72 p-6 translate-x-0 opacity-100" 
          : "w-0 p-0 border-r-0 opacity-0 -translate-x-full overflow-hidden pointer-events-none"
        }
      `}>
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Globe size={22} className="text-white" />
            </div>
            <div className="truncate">
              <h2 className="text-lg font-display font-black tracking-tight leading-none text-white truncate">RifatDev Store</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
            </div>
          </div>
          
          {/* Hide Sidebar Button (Works on Desktop & Mobile) */}
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all shrink-0 ml-2"
            title="Hide Sidebar (সাইডবার বন্ধ করুন)"
            aria-label="Hide Sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
          {/* Manage Section */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Manage</p>
            <nav className="space-y-1">
              <SidebarItem id="dashboard" label="Dashboard" icon={Layout} active={activeTab === 'dashboard'} onClick={setActiveTab} />
              <SidebarItem id="products" label="Products" icon={Package} active={activeTab === 'products'} onClick={setActiveTab} />
              <SidebarItem id="orders" label="Orders" icon={ShoppingCart} active={activeTab === 'orders'} onClick={setActiveTab} />
              <SidebarItem id="customers" label="Customers" icon={Users} active={activeTab === 'customers'} onClick={setActiveTab} />
              <SidebarItem id="payments" label="Payments" icon={CreditCard} active={activeTab === 'payments'} onClick={setActiveTab} />
              <SidebarItem id="licenses" label="Licenses" icon={FileKey} active={activeTab === 'licenses'} onClick={setActiveTab} />
              <SidebarItem id="downloads" label="Downloads" icon={Download} active={activeTab === 'downloads'} onClick={setActiveTab} />
            </nav>
          </div>

          {/* Marketing Section */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Marketing</p>
            <nav className="space-y-1">
              <SidebarItem id="coupons" label="Coupons" icon={Ticket} active={activeTab === 'coupons'} onClick={setActiveTab} />
              <SidebarItem id="reviews" label="Reviews" icon={Star} active={activeTab === 'reviews'} onClick={setActiveTab} />
              <SidebarItem id="subscribers" label="Subscribers" icon={Mail} active={activeTab === 'subscribers'} onClick={setActiveTab} />
              <SidebarItem id="announcements" label="Announcements" icon={Bell} active={activeTab === 'announcements'} onClick={setActiveTab} />
              <SidebarItem id="blog" label="Blog Posts" icon={FileText} active={activeTab === 'blog'} onClick={setActiveTab} />
              <SidebarItem id="sitemap" label="Sitemap Generator" icon={Globe} active={activeTab === 'sitemap'} onClick={setActiveTab} />
              <SidebarItem id="inquiries" label="Inquiries" icon={MessageSquare} active={activeTab === 'inquiries'} onClick={setActiveTab} />
            </nav>
          </div>

          {/* Reports Section */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Reports</p>
            <nav className="space-y-1">
              <SidebarItem id="sales-report" label="Sales Report" icon={BarChart3} active={activeTab === 'sales-report'} onClick={setActiveTab} />
              <SidebarItem id="analytics" label="Analytics" icon={PieChart} active={activeTab === 'analytics'} onClick={setActiveTab} />
            </nav>
          </div>

          {/* Settings Section */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Settings</p>
            <nav className="space-y-1">
              <SidebarItem id="settings" label="Settings" icon={Settings} active={activeTab === 'settings'} onClick={setActiveTab} />
              <SidebarItem id="profile" label="Profile" icon={Users} active={activeTab === 'profile'} onClick={setActiveTab} />
            </nav>
          </div>
        </div>

        <div className="pt-4 mt-auto border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all group whitespace-nowrap"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
