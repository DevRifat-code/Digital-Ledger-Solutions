import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  Globe, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  FileCode, 
  ExternalLink, 
  Layers, 
  ShoppingBag, 
  FileText, 
  ShieldCheck,
  Code,
  Eye,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  type: 'static' | 'blog' | 'product';
  title?: string;
  imageUrl?: string;
}

export function AdminSitemap() {
  const [baseUrl, setBaseUrl] = useState('https://digitalledgersolutions.pro.bd');
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includeBlog, setIncludeBlog] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  
  const [products, setProducts] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'xml'>('preview');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products and blog posts
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products
      try {
        const pSnap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
        setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        const pSnap = await getDocs(collection(db, 'products'));
        setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }

      // 2. Fetch blog posts from 'blog' collection
      try {
        const bSnap = await getDocs(query(collection(db, 'blog'), orderBy('createdAt', 'desc')));
        setBlogPosts(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        const bSnap = await getDocs(collection(db, 'blog'));
        setBlogPosts(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error("Error fetching data for sitemap:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format clean ISO date (YYYY-MM-DD)
  const formatDate = (dateVal: any) => {
    try {
      if (dateVal?.toDate) {
        return dateVal.toDate().toISOString().split('T')[0];
      }
      if (dateVal instanceof Date) {
        return dateVal.toISOString().split('T')[0];
      }
      if (typeof dateVal === 'string' && dateVal) {
        return new Date(dateVal).toISOString().split('T')[0];
      }
    } catch (e) {
      // fallback
    }
    return new Date().toISOString().split('T')[0];
  };

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  // Generate URL list
  const getSitemapUrls = (): SitemapUrl[] => {
    const urls: SitemapUrl[] = [
      {
        loc: `${cleanBaseUrl}/`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0',
        type: 'static',
        title: 'Home Page'
      },
      {
        loc: `${cleanBaseUrl}/marketplace`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.9',
        type: 'static',
        title: 'Marketplace / Digital Products'
      },
      {
        loc: `${cleanBaseUrl}/blog`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.9',
        type: 'static',
        title: 'Blog & Articles'
      },
      {
        loc: `${cleanBaseUrl}/contact`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7',
        type: 'static',
        title: 'Contact Us'
      }
    ];

    // Blog URLs
    if (includeBlog) {
      blogPosts.forEach(post => {
        const slug = post.permalink || post.id;
        urls.push({
          loc: `${cleanBaseUrl}/blog/${slug}`,
          lastmod: formatDate(post.updatedAt || post.createdAt),
          changefreq: 'weekly',
          priority: '0.8',
          type: 'blog',
          title: post.title || 'Blog Post',
          imageUrl: post.imageUrl
        });
      });
    }

    // Product URLs
    if (includeProducts) {
      products.forEach(prod => {
        urls.push({
          loc: `${cleanBaseUrl}/product/${prod.id}`,
          lastmod: formatDate(prod.updatedAt || prod.createdAt),
          changefreq: 'weekly',
          priority: '0.8',
          type: 'product',
          title: prod.name || 'Product Details',
          imageUrl: prod.imageUrl
        });
      });
    }

    return urls;
  };

  const urlList = getSitemapUrls();

  // Generate XML string
  const generateXml = () => {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${includeImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''}>`;

    const body = urlList.map(item => {
      let xml = `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>`;

      if (includeImages && item.imageUrl) {
        xml += `
    <image:image>
      <image:loc>${item.imageUrl}</image:loc>
      <image:title>${item.title?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'Image'}</image:title>
    </image:image>`;
      }

      xml += `\n  </url>`;
      return xml;
    }).join('\n');

    const footer = `\n</urlset>`;
    return `${header}\n${body}${footer}`;
  };

  const xmlContent = generateXml();

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredUrls = urlList.filter(u => 
    u.loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.title && u.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Globe size={22} />
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Sitemap Generator</h1>
          </div>
          <p className="text-slate-500 font-medium mt-1">
            Generate and manage your Google Search Console compliant XML sitemap for products, blogs, and static pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh database entries"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            {copied ? 'Copied XML!' : 'Copy XML'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Download size={18} />
            Download sitemap.xml
          </button>
        </div>
      </div>

      {/* Configuration & Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Config */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Globe size={18} className="text-indigo-600" />
            Website Base URL
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Domain Name</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <p className="text-[11px] text-slate-400">All generated URLs will use this base domain prefix.</p>
          </div>
        </div>

        {/* Inclusions Filter */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            Content Inclusions
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <ShoppingBag size={16} className="text-indigo-600" />
                Include Products ({products.length})
              </span>
              <input
                type="checkbox"
                checked={includeProducts}
                onChange={(e) => setIncludeProducts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                Include Blog Posts ({blogPosts.length})
              </span>
              <input
                type="checkbox"
                checked={includeBlog}
                onChange={(e) => setIncludeBlog(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-indigo-50/50 transition-colors">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <FileCode size={16} className="text-indigo-600" />
                Include Image Tags (`&lt;image:image&gt;`)
              </span>
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Stats Counter */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-[2rem] text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Search Engine Coverage</span>
            <div className="text-4xl font-display font-black tracking-tight">{urlList.length} URLs</div>
            <p className="text-xs text-slate-300 font-medium pt-2">
              Ready to submit to Google Search Console for instant crawling & indexing.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center relative z-10">
            <div>
              <div className="text-sm font-bold text-indigo-300">4</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Static</div>
            </div>
            <div>
              <div className="text-sm font-bold text-indigo-300">{includeBlog ? blogPosts.length : 0}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Blogs</div>
            </div>
            <div>
              <div className="text-sm font-bold text-indigo-300">{includeProducts ? products.length : 0}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs: Visual List vs XML Source */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Controls & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl">
            <button
              onClick={() => setActiveView('preview')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeView === 'preview'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={16} />
              Indexed URLs ({filteredUrls.length})
            </button>
            <button
              onClick={() => setActiveView('xml')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeView === 'xml'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code size={16} />
              Raw XML Source
            </button>
          </div>

          {activeView === 'preview' && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search indexed URLs..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          )}
        </div>

        {/* View Content */}
        {activeView === 'preview' ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-6 py-4">Title / Name</th>
                  <th className="px-6 py-4">URL Location (`loc`)</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Last Modified</th>
                  <th className="px-6 py-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUrls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No URLs match your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredUrls.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                        {item.title || 'Untitled'}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-indigo-600">
                        <a href={item.loc} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          {item.loc}
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.type === 'static' ? 'bg-slate-100 text-slate-600' :
                          item.type === 'blog' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{item.lastmod}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{item.priority}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px]">
            <pre className="whitespace-pre-wrap leading-relaxed">{xmlContent}</pre>
          </div>
        )}
      </div>

      {/* Google Search Console Submission Guide */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-slate-900 tracking-tight">How to Submit to Google Search Console</h3>
            <p className="text-xs text-slate-500 font-medium">Follow these simple steps to ensure Google indexes all your URLs quickly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-indigo-100/80 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">1</div>
            <h4 className="text-sm font-bold text-slate-900">Download Sitemap</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click the <strong>Download sitemap.xml</strong> button above to save your generated XML file.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/80 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">2</div>
            <h4 className="text-sm font-bold text-slate-900">Upload to Web Server</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Place <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">sitemap.xml</code> in your website root folder so it is reachable at <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{cleanBaseUrl}/sitemap.xml</code>.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-indigo-100/80 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">3</div>
            <h4 className="text-sm font-bold text-slate-900">Submit in GSC</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">Google Search Console</a>, navigate to <strong>Sitemaps</strong>, and enter <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">sitemap.xml</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
