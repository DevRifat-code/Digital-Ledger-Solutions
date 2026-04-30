import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Code2, 
  Database, 
  Globe, 
  ShoppingBag, 
  Terminal, 
  Zap, 
  BarChart3, 
  CreditCard, 
  Package, 
  Settings, 
  Users, 
  LifeBuoy, 
  HelpCircle,
  Plus,
  Minus,
  Check,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useEffect, useState } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { cn } from '../lib/utils';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const { settings } = useSiteSettings();

  const pricingPlans = [
    {
      name: 'Starter Plan',
      monthlyPrice: '৳5,000',
      yearlyPrice: '৳50,000',
      period: isYearly ? 'Lifetime Support' : 'One Time Payment',
      desc: 'Perfect for small retail shops getting started with automation.',
      features: ['Up to 1,000 Products', 'Single User Access', 'Basic Reports', 'Standard Email Support'],
      href: '/auth'
    },
    {
      name: 'Pro Plan',
      monthlyPrice: '৳12,000',
      yearlyPrice: '৳1,10,000',
      period: isYearly ? 'Lifetime Support' : 'One Time Payment',
      desc: 'Manage your store like a pro with advanced features.',
      features: ['Unlimited Products', 'Multi-User Access', 'Advanced POS System', 'Cloud Database Sync', 'Priority 24/7 Support', 'Custom Reports'],
      featured: true,
      href: '/auth'
    },
    {
      name: 'Enterprise',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      period: 'Billed Yearly',
      desc: 'Tailored solutions for large chain shops and supermarkets.',
      features: ['Multi-Store Connection', 'Warehouse Tracking', 'Full Accounting Suite', 'Dedicated Account Manager', 'Custom Integration'],
      href: '/contact'
    }
  ];

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, 'products'), limit(3));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeaturedProducts(items);
      } catch (error) {
        handleFirestoreError(error, 'list', 'products');
      }
    }
    fetchFeatured();
  }, []);

  const features = [
    { icon: CreditCard, title: 'Digital Ledger Solutions', desc: 'Digital Ledger Solutions streamlines sales, inventory and customer transactions efficiently.' },
    { icon: Package, title: 'Inventory Management', desc: 'Inventory management software optimizes stock control, tracking and order fulfillment operations.' },
    { icon: Settings, title: 'Store Operations', desc: 'Store operations software enhances efficiency in retail management, inventory and customer service.' },
    { icon: ShoppingBag, title: 'Order Processing', desc: 'Order processing software automates sales order management for streamlined and efficient operations.' },
  ];

  const valueProps = [
    { title: 'Cloud Based', desc: 'A SaaS web-hosted Digital Ledger solution that stores all your data on a remote server. Manage sales, inventory and reports in real time.', color: 'bg-indigo-500/10 text-indigo-600' },
    { title: 'Dedicated Support', desc: 'We understand the urgency, hence dedicated to solving your problem as fast as possible. Support team always ready.', color: 'bg-emerald-500/10 text-emerald-600' },
    { title: 'Flexible Subscriptions', desc: 'Digital Ledger Solutions offers both monthly and yearly subscriptions. Affordable pricing packages based on your requirements.', color: 'bg-amber-500/10 text-amber-600' },
    { title: 'Instant Summary Report', desc: 'Track daily, monthly, or yearly summaries and stay updated with real-time sales graphs. Clear performance view.', color: 'bg-rose-500/10 text-rose-600' },
  ];

  const businessStructure = [
    { title: 'Dynamic Dashboard', icon: BarChart3, category: 'Analytics' },
    { title: 'Analytics and Reporting', icon: BarChart3, category: 'Analytics' },
    { title: 'Customer CRM', icon: Users, category: 'Management' },
    { icon: Package, title: 'Stock Management', category: 'Inventory' },
    { icon: Users, title: 'HR Management', category: 'Management' },
    { icon: ShoppingBag, title: 'Sales System', category: 'Sales' },
    { icon: Database, title: 'Accounting System', category: 'Finance' },
    { icon: Terminal, title: 'Activity Log', category: 'System' },
    { icon: Globe, title: 'Delivery Management', category: 'Logistics' },
    { icon: Package, title: 'Warehouse Tracking', category: 'Logistics' },
  ];

  const howItWorks = [
    { 
      step: '01', 
      title: 'Setup Your Store', 
      desc: 'Create your store profile and configure your specific business settings in minutes.',
      icon: Plus,
      color: 'bg-indigo-500/10 text-indigo-600'
    },
    { 
      step: '02', 
      title: 'Add Inventory', 
      desc: 'Easily upload products, manage stock levels, and set pricing with our bulk tools.',
      icon: Package,
      color: 'bg-emerald-500/10 text-emerald-600'
    },
    { 
      step: '03', 
      title: 'Start Billing', 
      desc: 'Use our sleek interface to process sales efficiently while tracking every transaction.',
      icon: CreditCard,
      color: 'bg-amber-500/10 text-amber-600'
    },
    { 
      step: '04', 
      title: 'Analyze & Grow', 
      desc: 'Monitor real-time reports and analytics to make smarter, data-driven decisions.',
      icon: BarChart3,
      color: 'bg-rose-500/10 text-rose-600'
    }
  ];

  const faqs = [
    { q: "What is Digital Ledger Solutions?", a: "Digital Ledger Solutions is a combination of software and hardware that allows retail businesses to process transactions, manage inventory, and track sales performance in real-time." },
    { q: "Which Businesses Benefit Most From Digital Ledger Solutions?", a: "Supermarkets, retail shops, chain supershops, and convenience stores benefit significantly from Digital Ledger Solutions due to high transaction volumes and complex inventory needs." },
    { q: "How Does Digital Ledger Solutions Benefit A Retail Business?", a: "It improves accuracy, speeds up checkouts, provides detailed analytics, automates inventory tracking, and enhances customer relationship management." },
    { q: "Is Trial Available For Digital Ledger Solutions?", a: "Yes, we offer a 30-day free trial so you can experience the absolute speed and efficiency of Digital Ledger Solutions before committing." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-[#061D19] overflow-hidden pt-20">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-2/3 h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-yellow-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                 Next-Gen Retail Solution
              </div>
              <h1 className="text-4xl lg:text-7xl font-display font-black text-white leading-tight mb-6">
                Digital Ledger Solutions <br />
                <span className="text-yellow-500">Best For...</span>
              </h1>
              <p className="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed">
                Digital Ledger Solutions is the name of revolution in the retail store management operation. Let the Digital Ledger Solutions handle the workload and simplify operations with a faster, advanced Retail Management Solution.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth" className="bg-yellow-500 text-slate-900 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
                  Start Free Trial
                </Link>
                <Link to="/marketplace" className="border border-white/20 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
                  Watch Demo
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 p-2 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=2070" 
                  alt="Digital Ledger Interface"
                  className="rounded-[2rem] shadow-2xl w-full"
                />
              </div>
              
              {/* Floating badges pattern */}
              <div className="absolute -bottom-10 -left-10 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '6s' }}>
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                      <Zap />
                  </div>
                  <div className="pr-4">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Performance</p>
                      <h4 className="font-bold text-slate-900 text-sm">Ultra Fast Sync</h4>
                  </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Power Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-emerald-600 font-black uppercase text-xs tracking-[0.3em] mb-4">The Platform</p>
            <h2 className="text-3xl lg:text-5xl font-display font-black text-slate-900 leading-tight mb-4">
              Power Your Store <br />
              with <span className="text-emerald-600">Smart Digital Solutions</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                  <f.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0 hidden lg:block" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <p className="text-emerald-600 font-black uppercase text-xs tracking-[0.3em] mb-4">Simple Implementation</p>
            <h2 className="text-3xl lg:text-5xl font-display font-black text-slate-900 leading-tight">
              How <span className="text-emerald-600">Digital Ledger</span> Works
            </h2>
            <p className="text-slate-500 mt-6 max-w-2xl mx-auto font-medium">
              Getting started with the ultimate retail management solution is easy. Follow these four simple steps to transform your store operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-8">
                  <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110", item.color)}>
                    <item.icon size={36} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black ring-4 ring-white shadow-lg group-hover:bg-emerald-600 transition-colors">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Device Showcase */}
      <section className="py-24 bg-white overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl lg:text-4xl font-display font-black text-slate-900 mb-16 uppercase tracking-tight">
              Manage Stores with the <span className="text-emerald-600">Digital Ledger</span> <br />
              <span className="text-emerald-600">Solutions</span>
          </h2>
          <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] bg-emerald-500/5 blur-[120px] rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=2070" 
                alt="Manage Multi-Store"
                className="relative z-10 w-full rounded-3xl shadow-2xl border border-slate-100"
              />
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xl lg:text-2xl font-display font-black text-slate-900 uppercase tracking-widest mb-4">
              Digital Ledger Solutions Offers
            </h2>
            <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-sm">
              The Best Retail Management Solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((p, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", p.color)}>
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{p.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight 1 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Maximized Productivity</p>
              <h2 className="text-3xl lg:text-4xl font-display font-black text-slate-900 mb-8 leading-tight">
                Experience Absolute Speed and Efficiency with Digital Ledger Solutions
              </h2>
              <ul className="space-y-4 mb-10">
                {[
                  'Complete e-commerce management',
                  'Multi-store management features',
                  'Detailed accounting modules',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <Check size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/marketplace" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all inline-block">
                Learn More
              </Link>
            </motion.div>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2070" 
                alt="Productivity"
                className="relative z-10 rounded-[2.5rem] shadow-2xl border border-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-display font-black text-slate-900 leading-tight">
              Transform Your Business Structure <br />
              with Simple <span className="text-emerald-600">Retail Solution</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {businessStructure.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                  <s.icon size={24} />
                </div>
                <h4 className="text-[13px] font-black text-slate-900 text-center uppercase tracking-tight">{s.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Essential Functions (Dark) */}
      <section className="py-24 bg-[#061D19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full" />
              <div className="bg-emerald-500/10 border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-xl relative z-10">
                 <div className="flex items-center gap-6 mb-10">
                    <span className="text-6xl font-black text-emerald-400">↑ 35%</span>
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-widest leading-tight">Reduction in <br /> Costs</p>
                 </div>
                 <div className="space-y-4">
                    <div className="h-2 w-full bg-white/10 rounded-full" />
                    <div className="h-2 w-[70%] bg-emerald-400 rounded-full" />
                 </div>
              </div>
            </div>
            <div>
              <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-4">Efficiency First</p>
              <h2 className="text-3xl lg:text-4xl font-display font-black text-white mb-6">
                Essential Function of <span className="text-emerald-500">Digital Ledger Solutions</span>
              </h2>
              <ul className="space-y-4">
                {[
                  'Live dashboard with sales updates',
                  'Well-organized GUI Ledger interface',
                  'Automated stock calculation',
                  'Fast, error-free sales reports',
                  'Flexible business settings',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-300">
                    <div className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-emerald-600 font-black uppercase text-xs tracking-[0.3em] mb-4">Pricing Plans</p>
            <h2 className="text-3xl lg:text-5xl font-display font-black text-slate-900 leading-tight mb-8">
              Choose the Best <span className="text-emerald-600">Plan for Business</span>
            </h2>
            
            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-4 mb-20">
              <span className={cn("text-xs font-black uppercase tracking-widest", !isYearly ? "text-slate-900" : "text-slate-400")}>One-Time</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="w-16 h-8 bg-slate-200 rounded-full relative p-1 transition-colors hover:bg-slate-300"
              >
                <div className={cn(
                  "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                  isYearly ? "translate-x-8" : "translate-x-0"
                )} />
              </button>
              <span className={cn("text-xs font-black uppercase tracking-widest flex items-center gap-2", isYearly ? "text-emerald-600" : "text-slate-400")}>
                Lifetime
                <span className="bg-emerald-100 text-emerald-600 text-[8px] px-2 py-1 rounded-md">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i} 
                className={cn(
                  "relative p-10 rounded-[3rem] border transition-all duration-500 flex flex-col group",
                  plan.featured 
                    ? "bg-[#061D19] border-emerald-500/30 text-white shadow-2xl shadow-emerald-500/20 scale-105 z-10" 
                    : "bg-white border-slate-200 text-slate-900 hover:shadow-xl shadow-slate-200/50"
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className={cn("text-xl font-black uppercase tracking-tight mb-4", plan.featured ? "text-emerald-400" : "text-slate-900")}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", plan.featured ? "text-slate-400" : "text-slate-500")}>
                      / {plan.period}
                    </span>
                  </div>
                </div>

                <p className={cn("text-sm leading-relaxed mb-8", plan.featured ? "text-slate-400 font-medium" : "text-slate-500")}>
                  {plan.desc}
                </p>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feat, fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", plan.featured ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600")}>
                        <Check size={12} />
                      </div>
                      <span className={cn("text-xs font-bold", plan.featured ? "text-slate-300" : "text-slate-600")}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to={plan.href}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-center",
                    plan.featured 
                      ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20" 
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  )}
                >
                  Get Started Now
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-black text-slate-900 px-24">
              Frequently Asked <span className="text-emerald-600">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 pb-4">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left py-4 hover:text-emerald-600 transition-colors"
                >
                  <span className="text-lg font-bold text-slate-800">{faq.q}</span>
                  <ChevronDown className={cn("transition-transform text-slate-400", openFaq === i && "rotate-180")} size={20} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-slate-500 leading-relaxed text-sm">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Marketplace Section (Keeping current functionality) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-emerald-600 font-black uppercase text-xs tracking-widest mb-3">Our Marketplace</p>
              <h2 className="text-4xl font-display font-black text-slate-900">Featured Products</h2>
            </div>
            <Link to="/marketplace" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200">
                <p className="text-slate-500 italic">Explore our marketplace for premium digital assets.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
