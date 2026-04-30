import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Printer, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminSalesReportProps {
  orders: any[];
}

export function AdminSalesReport({ orders }: AdminSalesReportProps) {
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid' || o.status === 'delivered').length;
    const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    // Daily Sales Data
    const dailyData: Record<string, number> = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    last7Days.forEach(day => dailyData[day] = 0);

    orders.forEach(order => {
      const date = new Date(order.createdAt?.toDate?.() || Date.now());
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyData[day] !== undefined) {
        dailyData[day] += (order.amount || 0);
      }
    });

    const chartData = Object.entries(dailyData).map(([name, value]) => ({ name, value }));

    return { totalSales, completedOrders, avgOrderValue, chartData };
  }, [orders]);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Comprehensive breakdown of your store's performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
            <Share2 size={18} />
            Export
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all">
            <Printer size={18} />
            Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Revenue', value: stats.totalSales, icon: DollarSign, color: 'text-emerald-600', trend: 12 },
          { label: 'Avg. Order', value: stats.avgOrderValue, icon: TrendingUp, color: 'text-indigo-600', trend: 5 },
          { label: 'Conversion Rate', value: '4.2%', icon: ArrowUpRight, color: 'text-indigo-600', trend: 8 },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-slate-50 ${s.color}`}>
                  <s.icon size={28} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-black bg-emerald-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={14} />
                  {s.trend}%
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-3xl font-display font-black text-slate-900">
                {typeof s.value === 'number' ? `৳${s.value.toLocaleString()}` : s.value}
              </h3>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">Revenue Stream</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Visualizing income over the past 7 days</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase shadow-sm">Weekly</button>
              <button className="px-4 py-1.5 text-slate-500 text-[10px] font-black uppercase">Monthly</button>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 0, 0]} 
                  barSize={40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-display font-black uppercase tracking-tight mb-8">Performance Snapshot</h3>
            
            <div className="space-y-10">
              {[
                { label: 'Completed Orders', value: stats.completedOrders, total: orders.length, color: 'bg-indigo-500' },
                { label: 'Inventory Health', value: 85, total: 100, color: 'bg-emerald-500' },
                { label: 'Support Response', value: 92, total: 100, color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-lg font-black">{item.value} <span className="text-[10px] text-slate-500 font-bold">/ {item.total}</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / item.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Calendar size={20} className="text-slate-300" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Payout</p>
                <p className="font-bold">Next Monday, 27 Apr</p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </div>
      </div>
    </div>
  );
}
