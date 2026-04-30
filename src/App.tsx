/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { testFirestoreConnection } from './lib/firebase';
import { useSiteSettings } from './hooks/useSiteSettings';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { Admin } from './pages/Admin';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { Blog } from './pages/Blog';
import { BlogPostDetails } from './pages/BlogPostDetails';
import { Contact } from './pages/Contact';
import { useState } from 'react';
import { ChevronUp, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function Layout({ children }: { children: React.ReactNode }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
      {!isAdminPage && <Navbar />}
      <main>
        {children}
      </main>
      {!isAdminPage && <Footer />}
      <AnimatePresence>
        {showScrollTop && !isAdminPage && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-10 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 group"
          >
            <ChevronUp size={32} />
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Back to Top
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {!isAdminPage && (
        <a 
          href="https://wa.me/8801700000000" 
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-10 left-10 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 group"
        >
          <MessageSquare size={32} />
          <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with us on WhatsApp
          </span>
        </a>
      )}
    </div>
  );
}

export default function App() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
    if (settings.faviconUrl) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = settings.faviconUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.faviconUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [settings]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/success/:orderId" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPostDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}
