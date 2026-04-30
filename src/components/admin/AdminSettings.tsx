import React, { useRef } from 'react';
import { Save, Globe, ShieldCheck, Wallet, Info, Palette, Type, Layout, Mail, Globe2, Camera, ShieldAlert, History } from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';

interface AdminSettingsProps {
  settings: any;
  setSettings: (s: any) => void;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export function AdminSettings({ settings, setSettings, onSave, isSaving }: AdminSettingsProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Significantly compress logo and favicon
        // Logo: max 400px, Favicon: max 64px
        const maxWidth = type === 'logo' ? 400 : 64;
        const maxHeight = type === 'logo' ? 400 : 64;
        const quality = type === 'logo' ? 0.8 : 0.6;
        
        const compressedBase64 = await compressImage(file, maxWidth, maxHeight, quality);
        
        if (type === 'logo') {
          setSettings({ ...settings, logoUrl: compressedBase64 });
        } else {
          setSettings({ ...settings, faviconUrl: compressedBase64 });
        }
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('Failed to process image. Please try a smaller file.');
      }
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">System & Security</h1>
          <p className="text-slate-500 font-medium mt-1">Configure your store identity, visual theme, and global security protocols.</p>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Deploying...' : 'Save Production'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Core Branding Section */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Globe2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">Main Identity</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Foundational store metadata</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Site Title</label>
                <input
                  type="text"
                  value={settings.shopName || ''}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  placeholder="e.g. AssetVault"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Support Email</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="email"
                        value={settings.contactEmail || ''}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 pl-13 pr-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                        placeholder="help@yourstore.com"
                    />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Site Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Camera size={24} className="text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => handleFileChange(e, 'logo')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Select Logo
                  </button>
                  {settings.logoUrl && (
                    <button 
                      type="button"
                      onClick={() => setSettings({ ...settings, logoUrl: '' })}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Favicon Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                    {settings.faviconUrl ? (
                      <img src={settings.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                    ) : (
                      <Globe size={24} className="text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={faviconInputRef}
                    onChange={(e) => handleFileChange(e, 'favicon')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Select Icon
                  </button>
                  {settings.faviconUrl && (
                    <button 
                      type="button"
                      onClick={() => setSettings({ ...settings, faviconUrl: '' })}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Store Tagline</label>
                <textarea
                   rows={2}
                   value={settings.siteDescription || ''}
                   onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all resize-none"
                   placeholder="Premium digital assets for modern creators..."
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Meta Description (SEO)</label>
                <textarea
                  rows={3}
                   value={settings.metaDescription || ''}
                   onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:bg-white outline-none transition-all resize-none"
                   placeholder="Brief summary for search engines..."
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Meta Keywords (SEO)</label>
                <input
                  type="text"
                  value={settings.metaKeywords || ''}
                  onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  placeholder="e.g. software, templates, react, digital assets"
                />
                <p className="text-[9px] text-slate-400 font-bold mt-1 px-1 uppercase tracking-widest">Comma-separated values</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">Advanced Security</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Protect your platform from unauthorized access</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-900">Force Two-Factor</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Requires 2FA for all admins</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSettings({ ...settings, force2FA: !settings.force2FA })}
                  className={`w-12 h-7 rounded-full transition-all relative ${settings.force2FA ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.force2FA ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-900">Login Rate Limiting</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Max 5 attempts per 30 mins</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSettings({ ...settings, loginRateLimit: !settings.loginRateLimit })}
                  className={`w-12 h-7 rounded-full transition-all relative ${settings.loginRateLimit ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.loginRateLimit ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">IP Whitelist (Admin Only)</label>
                <input
                  type="text"
                  value={settings.ipWhitelist || ''}
                  onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  placeholder="e.g. 192.168.1.1, 203.0.113.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Session Timeout (Minutes)</label>
                <div className="relative">
                  <History size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={settings.sessionTimeout || 60}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 pl-13 pr-6 py-4 rounded-2xl text-sm font-bold focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Preferences */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Layout size={18} />
                    </div>
                    <h3 className="text-xl font-display font-black uppercase tracking-tight">System Controls</h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between group/toggle">
                        <div>
                            <p className="text-sm font-black">Maintenance Mode</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Locks Frontend Access</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                            className={`w-12 h-7 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black">Currency</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Pricing Symbol</p>
                        </div>
                        <select
                            value={settings.currencySymbol || '৳'}
                            onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm font-black focus:outline-none"
                        >
                            <option value="৳">৳ (BDT)</option>
                            <option value="$">$ (USD)</option>
                            <option value="€">€ (EUR)</option>
                        </select>
                    </div>

                    <div className="pt-6 border-t border-slate-800 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                             <Wallet size={12} className="text-pink-500" />
                             bKash Merchant
                        </label>
                        <input
                            type="text"
                            value={settings.bkashNumber || ''}
                            onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 px-5 py-3.5 rounded-xl text-sm font-bold focus:border-indigo-600 outline-none transition-all"
                            placeholder="01XXX-XXXXXX"
                        />
                    </div>
                </div>
            </div>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-[100px]"></div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex gap-5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                  <ShieldCheck size={20} />
              </div>
              <div>
                  <h4 className="text-sm font-black text-slate-900">Cloud Security Protocol</h4>
                  <p className="text-[10px] text-indigo-900/60 font-bold leading-relaxed mt-1">
                      Advanced encryption applies to all stored settings. Data is secured via Firebase Firestore Security Rules.
                  </p>
              </div>
            </div>

             <div className="flex gap-5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                  <Mail size={20} />
              </div>
              <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-900">Admin Notifications</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">Order Alerts</span>
                      <button 
                        type="button"
                        onClick={() => setSettings({ ...settings, orderNotificationsEnabled: !settings.orderNotificationsEnabled })}
                        className={`w-10 h-6 rounded-full transition-all relative ${settings.orderNotificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.orderNotificationsEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Emails will be sent to: <span className="text-indigo-600 font-black">{settings.contactEmail || 'Not set'}</span>
                    </p>
                  </div>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                  <Palette size={20} />
              </div>
              <div>
                  <h4 className="text-sm font-black text-slate-900">Custom Brand Colors</h4>
                  <div className="flex items-center gap-4 mt-2">
                      <input
                          type="color"
                          value={settings.primaryColor || '#4f46e5'}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{settings.primaryColor || '#4f46e5'}</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
