import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  headerTitle: string;
  faviconUrl: string;
  description: string;
  basicPrice: number;
  currencySymbol?: string;
  bkashNumber?: string;
  contactEmail?: string;
  orderNotificationsEnabled?: boolean;
  metaDescription?: string;
  metaKeywords?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Digital Ledger Solutions',
  logoUrl: '',
  headerTitle: 'Premium Digital Solutions',
  faviconUrl: '',
  description: 'Expert software development and digital marketplace.',
  basicPrice: 20,
  currencySymbol: '৳',
  bkashNumber: '',
  contactEmail: '',
  orderNotificationsEnabled: false,
  metaDescription: '',
  metaKeywords: ''
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error('Settings listener error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { settings, loading };
}
