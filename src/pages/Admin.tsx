import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  updateDoc, 
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { LogIn, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { generateLicenseKey } from '../lib/utils';

// New Sub-components
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminCustomers } from '../components/admin/AdminCustomers';
import { AdminPayments } from '../components/admin/AdminPayments';
import { AdminLicenses } from '../components/admin/AdminLicenses';
import { AdminDownloads } from '../components/admin/AdminDownloads';
import { AdminCoupons } from '../components/admin/AdminCoupons';
import { AdminReviews } from '../components/admin/AdminReviews';
import { AdminSubscribers } from '../components/admin/AdminSubscribers';
import { AdminAnnouncements } from '../components/admin/AdminAnnouncements';
import { AdminBlog } from '../components/admin/AdminBlog';
import { AdminSalesReport } from '../components/admin/AdminSalesReport';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import { AdminProfile } from '../components/admin/AdminProfile';
import { AdminInquiries } from '../components/admin/AdminInquiries';

type AdminTab = 
  | 'dashboard' | 'products' | 'orders' | 'settings' | 'customers' 
  | 'payments' | 'licenses' | 'downloads' | 'coupons' | 'reviews' 
  | 'subscribers' | 'announcements' | 'blog' | 'sales-report' | 'analytics' | 'profile' | 'inquiries';

export function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [settings, setSettings] = useState({ 
    shopName: 'RifatDev Store', 
    currencySymbol: '৳', 
    bkashNumber: '', 
    contactEmail: '',
    orderNotificationsEnabled: false,
    headerTitle: '',
    description: '',
    logoUrl: '',
    faviconUrl: '',
    siteDescription: '',
    notificationEmail: '',
    notifyOnNewOrder: true,
    notifyOnNewUser: false,
    force2FA: false,
    loginRateLimit: false,
    ipWhitelist: '',
    sessionTimeout: 60,
    maintenanceMode: false,
    primaryColor: '#4f46e5',
    metaDescription: '',
    metaKeywords: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // New Product State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    demoUrl: '',
    buyUrl: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Only fetch admin data if the user is the admin
        if (u.email === 'mdrifathossainpersonal@gmail.com') {
          fetchProducts();
          fetchSettings();
          fetchOrders();
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function fetchProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      handleFirestoreError(error, 'list', 'products');
    }
  }

  async function fetchSettings() {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({ 
          ...prev, 
          ...data,
          shopName: data.siteName || data.shopName || prev.shopName 
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }

  async function fetchOrders() {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      handleFirestoreError(error, 'list', 'orders');
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string, licenseKey?: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status, 
        ...(licenseKey && { licenseKey })
      });
      fetchOrders();
    } catch (error) {
      handleFirestoreError(error, 'update', `orders/${orderId}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...settings,
        siteName: settings.shopName // sync for legacy compatibility
      });
      alert('System configuration updated successfully!');
    } catch (error) {
      handleFirestoreError(error, 'update', 'settings/global');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarItemClick = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile after clicking
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingProductId) {
        await updateDoc(doc(db, 'products', editingProductId), {
          ...newProduct,
          price: Number(newProduct.price),
          updatedAt: serverTimestamp(),
        });
        alert('Product updated successfully!');
      } else {
        const productRef = await addDoc(collection(db, 'products'), {
          ...newProduct,
          price: Number(newProduct.price),
          createdAt: serverTimestamp(),
        });

        // Automatically generate 5 licenses for the new product
        const licensePromises = [];
        for (let i = 0; i < 5; i++) {
          licensePromises.push(
            addDoc(collection(db, 'licenses'), {
              productId: productRef.id,
              key: generateLicenseKey(),
              productName: newProduct.name,
              status: 'available',
              createdAt: serverTimestamp()
            })
          );
        }
        await Promise.all(licensePromises);

        alert(`Product added successfully! 5 activation keys have been pre-generated.`);
      }
      setNewProduct({ name: '', description: '', price: 0, category: '', imageUrl: '', demoUrl: '', buyUrl: '' });
      setEditingProductId(null);
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, editingProductId ? 'update' : 'create', 'products');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (product: any) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl || '',
      demoUrl: product.demoUrl || '',
      buyUrl: product.buyUrl || ''
    });
    setEditingProductId(product.id);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, 'delete', `products/${id}`);
    }
  };

  if (loading) return <div className="pt-32 text-center text-slate-900 font-bold">Initializing system...</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-200 p-12 rounded-[3rem] text-center shadow-2xl shadow-slate-200"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-200">
            <LogIn size={40} />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">Admin Access</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">Secure gateway for managing digital assets and site configuration. Please login with your administrative credentials.</p>
          <Link
            to="/auth"
            state={{ from: { pathname: '/admin' } }}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
          >
            <LogIn size={20} />
            Login to Admin
          </Link>
        </motion.div>
      </div>
    );
  }

  // Check if unauthorized
  if (user.email !== 'mdrifathossainpersonal@gmail.com') {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-200 p-12 rounded-[3rem] text-center shadow-2xl shadow-slate-200"
        >
          <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-red-200">
            <XCircle size={40} />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">Unauthorized</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">You do not have administrative privileges. If you are looking for your orders, please visit your profile.</p>
          <Link
            to="/profile"
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl"
          >
            Go to My Profile
          </Link>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard products={products} orders={orders} settings={settings} />;
      case 'products':
        return (
          <AdminProducts 
            products={products} 
            newProduct={newProduct} 
            setNewProduct={setNewProduct} 
            onSubmit={handleProductSubmit} 
            onDelete={handleDeleteProduct}
            onEdit={handleEditClick}
            editingProductId={editingProductId}
            setEditingProductId={setEditingProductId}
            isSubmitting={isSubmitting} 
          />
        );
      case 'orders':
        return <AdminOrders orders={orders} onUpdateStatus={handleUpdateOrderStatus} currency={settings.currencySymbol} />;
      case 'settings':
        return <AdminSettings settings={settings} setSettings={setSettings} onSave={handleSaveSettings} isSaving={isSavingSettings} />;
      case 'customers':
        return <AdminCustomers orders={orders} />;
      case 'payments':
        return <AdminPayments orders={orders} settings={settings} />;
      case 'licenses':
        return <AdminLicenses />;
      case 'downloads':
        return <AdminDownloads />;
      case 'coupons':
        return <AdminCoupons />;
      case 'reviews':
        return <AdminReviews />;
      case 'subscribers':
        return <AdminSubscribers />;
      case 'announcements':
        return <AdminAnnouncements />;
      case 'blog':
        return <AdminBlog />;
      case 'sales-report':
        return <AdminSalesReport orders={orders} />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'profile':
        return <AdminProfile />;
      case 'inquiries':
        return <AdminInquiries />;
      default:
        return (
          <div className="p-32 text-center text-slate-400 font-bold">
            Feature "{activeTab}" is coming soon in the next update.
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={handleSidebarItemClick} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 overflow-x-hidden w-full">
        <AdminHeader 
          user={user} 
          onLogout={handleLogout} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          onProfileClick={() => setActiveTab('profile')}
        />
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
