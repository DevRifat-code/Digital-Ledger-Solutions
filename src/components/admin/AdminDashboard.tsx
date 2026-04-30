import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Calendar,
  MoreVertical,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Check,
  Circle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  isUp: boolean;
  icon: any;
  color: string;
  chartData: any[];
}

const StatCard = ({ title, value, trend, isUp, icon: Icon, color, chartData }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all group overflow-hidden relative">
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3.5 rounded-2xl shadow-lg shadow-current/10 transition-transform group-hover:scale-110 group-hover:rotate-3", color)}>
          <Icon size={20} />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
          isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      
      <div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">{value}</h3>
      </div>

      <div className="h-16 w-full mt-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#10B981" : "#F43F5E"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isUp ? "#10B981" : "#F43F5E"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={isUp ? "#10B981" : "#F43F5E"} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill={`url(#gradient-${title.replace(/\s+/g, '')})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

interface AdminDashboardProps {
  products: any[];
  orders: any[];
  settings: any;
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    pending: {
      label: 'Pending',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    paid: {
      label: 'Paid',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    delivered: {
      label: 'Delivered',
      icon: Truck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    rejected: {
      label: 'Rejected',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${config.bg} ${config.color} ${config.border}`}>
      <Icon size={10} strokeWidth={3} />
      {config.label}
    </span>
  );
};

export function AdminDashboard({ products, orders, settings }: AdminDashboardProps) {
  const [tasks, setTasks] = React.useState([
    { id: 1, text: 'Review pending orders from bKash', completed: false },
    { id: 2, text: 'Verify new customer inquiries', completed: false },
    { id: 3, text: 'Update featured product stock counts', completed: true },
    { id: 4, text: 'Respond to high-priority support emails', completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const currency = settings.currencySymbol || '৳';
  
  // Calculate Dynamic Stats
  const totalSales = useMemo(() => orders
    .filter(o => o.status === 'paid' || o.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0), [orders]);

  const totalCustomers = useMemo(() => [...new Set(orders.map(o => o.customerEmail))].length, [orders]);
  
  // Process Sales Data for Area Chart (Group by Date)
  const salesChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse();

    const stats = last7Days.map(dateLabel => {
      const daySales = orders
        .filter(o => (o.status === 'paid' || o.status === 'delivered'))
        .filter(o => {
          const orderDate = new Date(o.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return orderDate === dateLabel;
        })
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
      
      return { name: dateLabel, sales: daySales };
    });

    return stats;
  }, [orders]);

  // Process Product Data for Pie Chart & Bar Chart
  const productDistribution = useMemo(() => {
    const counts: Record<string, { value: number; units: number }> = {};
    orders.forEach(o => {
      if (!counts[o.productName]) {
        counts[o.productName] = { value: 0, units: 0 };
      }
      counts[o.productName].value += (o.amount || 0);
      counts[o.productName].units += 1;
    });

    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
    return Object.entries(counts)
      .map(([name, data], idx) => ({
        name,
        value: data.value,
        units: data.units,
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [orders]);

  // Process Customer Growth Data (New Customers per Day)
  const customerGrowthData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse();

    const customerFirstOrders: Record<string, string> = {};
    
    // Find first order date for each customer
    [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt?.toDate?.() || 0).getTime();
      const dateB = new Date(b.createdAt?.toDate?.() || 0).getTime();
      return dateA - dateB;
    }).forEach(o => {
      if (!customerFirstOrders[o.customerEmail]) {
        customerFirstOrders[o.customerEmail] = new Date(o.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    });

    return last7Days.map(dateLabel => {
      const newCustomersCount = Object.values(customerFirstOrders).filter(d => d === dateLabel).length;
      return { name: dateLabel, customers: newCustomersCount };
    });
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Welcome Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back, Rifat! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
            <Calendar size={18} />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={`${currency}${totalSales.toLocaleString()}`} 
          trend="12.5%" 
          isUp={true} 
          icon={CreditCard} 
          color="bg-indigo-50 text-indigo-600" 
          chartData={salesChartData.map(d => ({ value: d.sales }))}
        />
        <StatCard 
          title="Total Orders" 
          value={orders.length.toString()} 
          trend="8.2%" 
          isUp={true} 
          icon={ShoppingCart} 
          color="bg-emerald-50 text-emerald-600" 
          chartData={salesChartData.map(d => ({ value: Math.floor(d.sales / 500) }))}
        />
        <StatCard 
          title="Total Products" 
          value={products.length.toString()} 
          trend="No Change" 
          isUp={true} 
          icon={Package} 
          color="bg-blue-50 text-blue-600" 
          chartData={[{value: 20}, {value: 20}, {value: 20}, {value: 20}]}
        />
        <StatCard 
          title="Total Customers" 
          value={totalCustomers.toString()} 
          trend="5.4%" 
          isUp={true} 
          icon={Users} 
          color="bg-amber-50 text-amber-600" 
          chartData={customerGrowthData.map(d => ({ value: d.customers }))}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Overview */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Sales Trends</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Daily revenue performance</p>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} 
                  tickFormatter={(val) => val >= 1000 ? `${currency}${val/1000}k` : `${currency}${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                  cursor={{ stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Product */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Product Share</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Revenue distribution</p>
            </div>
          </div>
          <div className="h-[250px] w-full mb-6 relative flex items-center justify-center">
            {productDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productDistribution}
                      cx="51%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {productDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pt-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory</span>
                  <span className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none mt-1">{productDistribution.length}</span>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 font-bold italic">No sales data yet</div>
            )}
          </div>
          <div className="space-y-3">
            {productDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 leading-none block">{currency}{item.value.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-indigo-500 mt-0.5 block">{((item.value / totalSales) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Popularity (Units Sold) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Popular Products</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Sold volume by asset</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Zap size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productDistribution.map(p => ({ ...p, units: p.units }))} layout="vertical" margin={{ left: 50, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="units" radius={[0, 8, 8, 0]} barSize={24}>
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">New Audience</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Customer base expansion</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Users size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="customers" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10B981', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 font-mono text-xs font-black text-slate-400 group-hover:text-indigo-600">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-900 block leading-none">{order.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-1 block">{order.customerEmail}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-600">{order.productName}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-900">{currency}{order.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">No orders available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Tasks Widget */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Daily Tasks</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Stay organized with routine operations</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="space-y-4 flex-grow">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all text-left group"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: task.completed ? [1, 1.3, 1] : 1,
                      rotate: task.completed ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent group-hover:border-indigo-400"
                    )}
                  >
                    <Check size={14} strokeWidth={4} />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <motion.p
                    animate={{ 
                      opacity: task.completed ? 0.5 : 1,
                      x: task.completed ? 4 : 0
                    }}
                    className={cn(
                      "text-sm font-bold transition-all",
                      task.completed ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700"
                    )}
                  >
                    {task.text}
                  </motion.p>
                </div>
              </button>
            ))}
          </div>

          <button className="mt-8 pt-6 border-t border-slate-100 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-slate-900 transition-colors w-full text-center">
            View All Routine Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
