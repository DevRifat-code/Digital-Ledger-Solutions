import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://digitalledgersolutions.pro.bd';

const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/marketplace', priority: '0.9', changefreq: 'daily' },
  { url: '/blog', priority: '0.8', changefreq: 'daily' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/auth', priority: '0.5', changefreq: 'monthly' }
];

// Product IDs to include in sitemap
const defaultProducts = [
  'starter-one-time',
  'pro-monthly',
  'enterprise-yearly'
];

function generateSitemapXml() {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  staticRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${route.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Product routes
  defaultProducts.forEach(productId => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/product/${productId}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`[Sitemap] Generated sitemap successfully at ${sitemapPath}`);
}

generateSitemapXml();
