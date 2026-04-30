import React, { useMemo, useState } from 'react';
import { Search, User, Mail, ShoppingBag, CreditCard, ChevronRight, Phone, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminCustomersProps {
  orders: any[];
}

export function AdminCustomers({ orders }: AdminCustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const customerStats = useMemo(() => {
    const customers: Record<string, any> = {};
    
    orders.forEach(order => {
      if (!customers[order.customerEmail]) {
        customers[order.customerEmail] = {
          email: order.customerEmail,
          name: order.customerName,
          totalSpent: 0,
          orderCount: 0,
          phone: order.customerPhone,
          lastOrder: order.createdAt,
          orders: []
        };
      }
      customers[order.customerEmail].totalSpent += (order.amount || 0);
      customers[order.customerEmail].orderCount += 1;
      customers[order.customerEmail].orders.push(order);
    });

    return Object.values(customers)
      .filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, searchTerm]);

  if (selectedCustomer) {
    return (
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Customer Profile</h1>
            <p className="text-slate-500 font-medium mt-1">Detailed activity and intelligence for {selectedCustomer.name}.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 text-3xl font-black border border-indigo-100 mx-auto mb-6">
                {selectedCustomer.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-display font-black text-slate-900">{selectedCustomer.name}</h2>
              <p className="text-slate-400 font-medium mb-8">{selectedCustomer.email}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Phone size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                    <p className="text-sm font-bold text-slate-700">{selectedCustomer.phone || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Calendar size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Last Interaction</p>
                    <p className="text-sm font-bold text-slate-700">{selectedCustomer.lastOrder?.toDate().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Total Life Time Value</p>
                <h3 className="text-4xl font-display font-black tracking-tight mb-8">৳{selectedCustomer.totalSpent.toLocaleString()}</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Orders</p>
                    <p className="text-lg font-black leading-none">{selectedCustomer.orderCount}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Order Architecture</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Chronological transaction history</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Asset</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {selectedCustomer.orders.map((order: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 font-mono text-xs font-black text-slate-400">#{order.id.slice(-6).toUpperCase()}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-900">{order.productName}</p>
                                    </td>
                                    <td className="px-8 py-6 font-display font-black text-slate-900">৳{order.amount?.toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right text-xs text-slate-500 font-bold">
                                        {order.createdAt?.toDate().toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Customer Intelligence</h1>
        <p className="text-slate-500 font-medium mt-1">Manage and analyze your growing user base.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-6">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..." 
                  className="w-full bg-slate-50 border border-slate-200 py-3 pl-12 pr-6 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm focus:shadow-indigo-100" 
                />
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Users</p>
                <p className="text-xl font-display font-black text-indigo-600">{customerStats.length}</p>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Profile</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Orders</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerStats.map((customer, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                        {customer.name.charAt(0)}
                      </div>
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-left hover:text-indigo-600 transition-colors"
                      >
                        <p className="text-sm font-black text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">{customer.name}</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">{customer.email}</p>
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                      <ShoppingBag size={12} />
                      {customer.orderCount}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-display font-black text-slate-900">
                    ৳{customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {customerStats.length === 0 && (
                <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <User size={40} />
                      </div>
                       <h3 className="text-xl font-display font-black text-slate-900 uppercase">No Matches Found</h3>
                       <p className="text-slate-400 text-sm font-medium mt-1">Try adjusting your search criteria.</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
