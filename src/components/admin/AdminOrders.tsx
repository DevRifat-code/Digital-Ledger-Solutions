import React from 'react';
import { Search, Filter, Calendar, MoreVertical, CheckCircle2, XCircle, Ban, Key, User, Phone, Package, CreditCard, ShoppingCart, Clock, ShieldCheck, Truck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminOrdersProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string, licenseKey?: string) => void;
  currency: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    pending: {
      label: 'Pending',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-800/50',
    },
    paid: {
      label: 'Paid',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-800/50',
    },
    delivered: {
      label: 'Delivered',
      icon: Truck,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-800/50',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-800/50',
    },
    rejected: {
      label: 'Rejected',
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-100 dark:border-red-800/50',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${config.bg} ${config.color} ${config.border}`}>
      <Icon size={12} strokeWidth={3} />
      {config.label}
    </span>
  );
};

export function AdminOrders({ orders, onUpdateStatus, currency }: AdminOrdersProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [verifyingOrder, setVerifyingOrder] = React.useState<any>(null);
  const [licenseKeyInput, setLicenseKeyInput] = React.useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleApprove = () => {
    if (verifyingOrder) {
      if (!licenseKeyInput.trim()) {
        alert('Please enter a license key to approve the order.');
        return;
      }
      onUpdateStatus(verifyingOrder.id, 'delivered', licenseKeyInput);
      setVerifyingOrder(null);
      setLicenseKeyInput('');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-slate-100">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">Order Verification</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Review and fulfill customer purchase requests.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Calendar size={18} />
                All Time
            </button>
            <button className="bg-indigo-600 dark:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 dark:shadow-none hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all">
                Export CSV
            </button>
        </div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {verifyingOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVerifyingOrder(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">Verify Order</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 font-bold mt-1">Validate transaction and deliver assets</p>
                </div>
                <button onClick={() => setVerifyingOrder(null)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Transaction ID</span>
                    <p className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">{verifyingOrder.transactionId}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">bKash Number</span>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{verifyingOrder.bkashNumber}</p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Package size={16} className="text-indigo-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-black text-indigo-900 dark:text-emerald-400 uppercase tracking-widest">Order Details</span>
                  </div>
                  <p className="text-sm font-bold text-indigo-900 dark:text-white">{verifyingOrder.productName}</p>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-emerald-400 uppercase mt-1">{currency}{verifyingOrder.amount.toLocaleString()}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Activation/License Key</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={licenseKeyInput}
                      onChange={e => setLicenseKeyInput(e.target.value)}
                      placeholder="Enter activation key..." 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <button 
                  onClick={() => {
                    onUpdateStatus(verifyingOrder.id, 'rejected');
                    setVerifyingOrder(null);
                  }}
                  className="flex-1 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                >
                  Reject
                </button>
                <button 
                  onClick={handleApprove}
                  className="flex-[2] px-6 py-4 bg-indigo-600 dark:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
                  >
                    <CheckCircle2 size={16} />
                  </motion.div>
                  Verify & Deliver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-6">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search orders by customer or product..." 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 pl-12 pr-6 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                />
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-emerald-500 transition-all"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Customer & ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Product Details</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Payment (bKash)</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest text-center">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-mono font-black text-indigo-600 dark:text-emerald-400 bg-indigo-50 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">#{order.id.slice(-6)}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{order.customerEmail}</p>
                            <div className="flex items-center gap-2 mt-1 text-slate-400 dark:text-slate-500">
                                <span className="text-[10px] font-bold uppercase tracking-tight">{order.customerName}</span>
                            </div>
                        </div>
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-emerald-400">
                            <Package size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{order.productName}</p>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-widest">{currency}{order.amount.toLocaleString()}</p>
                        </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</span>
                            <CreditCard size={12} className="text-pink-500" />
                        </div>
                        <p className="text-xs font-mono font-black text-slate-900 dark:text-white tracking-wider uppercase">{order.transactionId}</p>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setVerifyingOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-emerald-500 transition-all shadow-md shadow-indigo-600/10 dark:shadow-none"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              initial={false}
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                              }}
                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                              <CheckCircle2 size={14} />
                            </motion.div>
                            Verify
                          </button>
                        </>
                      )}
                      
                      {order.status === 'delivered' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 relative group/key">
                             <Key size={14} />
                             <span className="truncate max-w-[80px]">{order.licenseKey}</span>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover/key:opacity-100 transition-opacity">
                               {order.licenseKey}
                             </div>
                        </div>
                      )}

                      {order.status !== 'pending' && order.status !== 'delivered' && (
                         <div className="p-2 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl opacity-50">
                             <Ban size={18} />
                         </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                    <td colSpan={5} className="py-32 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-6">
                            <ShoppingCart size={40} />
                        </div>
                        <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">No orders found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xs mx-auto mt-2">Try adjusting your filters or search terms to find what you're looking for.</p>
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

