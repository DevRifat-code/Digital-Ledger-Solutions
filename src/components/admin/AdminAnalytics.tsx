import React from 'react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Users, Globe, Smartphone, Monitor, MousePointer2, Clock, Map } from 'lucide-react';
import { motion } from 'motion/react';

const visitData = [
  { name: 'Mon', visits: 2400, bounce: 400 },
  { name: 'Tue', visits: 1398, bounce: 300 },
  { name: 'Wed', visits: 9800, bounce: 2000 },
  { name: 'Thu', visits: 3908, bounce: 2780 },
  { name: 'Fri', visits: 4800, bounce: 1890 },
  { name: 'Sat', visits: 3800, bounce: 2390 },
  { name: 'Sun', visits: 4300, bounce: 3490 },
];

const deviceData = [
  { name: 'Desktop', value: 55, color: '#4f46e5' },
  { name: 'Mobile', value: 35, color: '#10b981' },
  { name: 'Tablet', value: 10, color: '#f59e0b' },
];

export function AdminAnalytics() {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Traffic Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time insights into your store's visitor behavior.</p>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
           {['24h', '7d', '30d', '1y'].map((period) => (
             <button key={period} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${period === '7d' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-900'}`}>
               {period}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Visits', value: '48.2k', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Unique Users', value: '12.5k', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg. Duration', value: '3m 24s', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Bounce Rate', value: '24.5%', icon: MousePointer2, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
                    <s.icon size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <h4 className="text-xl font-display font-black text-slate-900">{s.value}</h4>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">Active Traffic</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">Real-time session monitoring</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>
                    <span className="text-xs font-black text-slate-900">48 ONLINE NOW</span>
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
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
                        <Tooltip />
                        <Area 
                            type="monotone" 
                            dataKey="visits" 
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorVisits)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight mb-8">Device Mix</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {deviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </RePieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-4">
                {deviceData.map((d, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                            <span className="text-sm font-bold text-slate-700">{d.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{d.value}%</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-display font-black uppercase tracking-tight">Geo Traffic</h3>
                <Map size={24} className="text-indigo-400" />
            </div>
            <div className="space-y-6">
                {[
                  { country: 'Bangladesh', percentage: 45, users: 4200 },
                  { country: 'United States', percentage: 25, users: 2400 },
                  { country: 'India', percentage: 15, users: 1500 },
                  { country: 'Others', percentage: 15, users: 1400 },
                ].map((item, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400 uppercase tracking-widest">{item.country}</span>
                            <span>{item.users.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight mb-8">Top Pages</h3>
            <div className="space-y-2">
                {[
                    { page: '/', views: '12,450', bounce: '12%' },
                    { page: '/products', views: '8,320', bounce: '24%' },
                    { page: '/service-details', views: '4,210', bounce: '18%' },
                    { page: '/auth', views: '3,110', bounce: '44%' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-2xl group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Globe size={16} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{item.page}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Views</p>
                                <p className="text-xs font-black text-slate-900">{item.views}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Bounce</p>
                                <p className="text-xs font-black text-slate-900">{item.bounce}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
