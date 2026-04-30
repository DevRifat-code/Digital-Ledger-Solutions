import { motion } from 'motion/react';
import { Mail, Github, Twitter, Facebook, Code2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#051512] pt-24 pb-12 text-slate-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                    <Zap size={24} />
                </div>
                <span className="text-2xl font-display font-black text-white tracking-tighter uppercase">{settings.siteName}</span>
            </Link>
            <p className="mb-8 text-sm leading-relaxed max-w-xs">{settings.description}</p>
            <div className="flex gap-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Facebook size={18} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Twitter size={18} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Github size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Product Catalog</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Premium Scripts</Link></li>
              <li><Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Web Templates</Link></li>
              <li><Link to="/marketplace" className="hover:text-emerald-400 transition-colors">SaaS Solutions</Link></li>
              <li><Link to="/marketplace" className="hover:text-emerald-400 transition-colors">API Projects</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/#pricing" className="hover:text-emerald-400 transition-colors">Pricing Plans</Link></li>
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Support & Contact</h4>
            <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-slate-300">
                    <Mail size={16} className="text-yellow-500" />
                    <span className="font-bold">{settings.contactEmail || 'mdrifathossainpersonal@gmail.com'}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Office Hours</p>
                    <p className="text-xs text-emerald-400 font-bold tracking-tight">Sat - Thu: 10AM - 10PM</p>
                </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium uppercase tracking-tight text-slate-500">
            © {year} {settings.siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-slate-400">
            <span>Powered by RifatDev System</span>
            <div className="w-1 h-1 bg-slate-500 rounded-full" />
            <span>Secure Enterprise Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
