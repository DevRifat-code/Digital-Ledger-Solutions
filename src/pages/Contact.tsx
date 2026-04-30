import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Contact() {
  const { settings } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-emerald-600 font-black uppercase text-xs tracking-[0.3em] mb-4">Contact Us</p>
          <h1 className="text-4xl lg:text-6xl font-display font-black text-slate-900 tracking-tight mb-6">
            Get in <span className="text-emerald-600">Touch</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Have questions about our Digital Ledger Solutions or need a custom enterprise setup? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6">
                  <Mail size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Email Us</h4>
                <p className="text-slate-500 text-sm">{settings.contactEmail || 'mdrifathossainpersonal@gmail.com'}</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-slate-900 mb-6">
                  <Phone size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Call Us</h4>
                <p className="text-slate-500 text-sm">+880 1700 000000</p>
              </div>
            </div>

            <div className="bg-[#061D19] p-10 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-xl">
                  <MapPin size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-display font-black mb-4">Our Office</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Dhaka, Bangladesh <br />
                  Ready to serve you nationwide with our Digital Ledger Solutions.
                </p>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors">
                    <MessageSquare size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Send size={40} />
                </div>
                <h2 className="text-3xl font-display font-black text-slate-900 mb-4">Message Sent!</h2>
                <p className="text-slate-500 mb-8">Thank you for reaching out. We'll get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Your Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Subject</label>
                  <input 
                    required
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    placeholder="How can we help?"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Message</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us about your requirements..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-emerald-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-emerald-600 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
