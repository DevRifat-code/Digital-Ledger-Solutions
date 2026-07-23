import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  author?: string;
  publishedTime?: any;
  jsonLd?: Record<string, any>;
}

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage,
  author,
  publishedTime,
  jsonLd
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    const setMetaTag = (nameAttr: 'name' | 'property', attrValue: string, contentValue: string) => {
      let element: HTMLMetaElement | null = document.querySelector(`meta[${nameAttr}='${attrValue}']`);
      if (element) {
        element.setAttribute('content', contentValue);
      } else {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        element.setAttribute('content', contentValue);
        document.head.appendChild(element);
      }
    };

    // 2. Robots Tag (Explicitly tell Google to index and follow)
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    // 4. Meta Keywords
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 5. OpenGraph & Twitter
    if (title) {
      setMetaTag('property', 'og:title', title);
      setMetaTag('name', 'twitter:title', title);
    }
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Digital Ledger Solutions');

    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('name', 'twitter:image', ogImage);
      setMetaTag('name', 'twitter:card', 'summary_large_image');
    }

    // 6. Canonical Link
    const currentUrl = canonical || window.location.href;
    setMetaTag('property', 'og:url', currentUrl);

    let canonicalLink: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', currentUrl);
      document.head.appendChild(canonicalLink);
    }

    // 7. Schema.org JSON-LD
    let scriptElement: HTMLScriptElement | null = document.querySelector('#seo-json-ld');
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'seo-json-ld';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }

  }, [title, description, keywords, canonical, ogType, ogImage, author, publishedTime, JSON.stringify(jsonLd)]);
}
