import React, { useMemo } from 'react';
import { CreditCard, CheckCircle, Clock, XCircle, Search, Filter, ShieldCheck, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminPaymentsProps {
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

export function AdminPayments({ orders, settings }: AdminPaymentsProps) {
  const currency = settings.currencySymbol || '৳';
  
  const paymentStats = useMemo(() => {
    const paid = orders.filter(o => o.status === 'paid' || o.status === 'delivered');
    const pending = orders.filter(o => o.status === 'pending');
    
    return {
      totalPaid: paid.reduce((acc, curr) => acc + (curr.amount || 0), 0),
      pendingAmount: pending.reduce((acc, curr) => acc + (curr.amount || 0), 0),
      count: orders.length
    };
  }, [orders]);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Financial Records</h1>
          <p className="text-slate-500 font-medium mt-1">Track all incoming payments and transaction IDs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Verified</p>
          <p className="text-2xl font-display font-black text-emerald-600">{currency}{paymentStats.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Clearances</p>
          <p className="text-2xl font-display font-black text-amber-500">{currency}{paymentStats.pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Volume</p>
          <p className="text-2xl font-display font-black text-slate-900">{paymentStats.count} Transactions</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/30">
          <Search size={18} className="text-slate-400" />
          <input type="text" placeholder="Search by Transaction ID..." className="bg-transparent border-none outline-none font-medium text-sm flex-1" />
          <button className="p-2 text-slate-400 hover:text-indigo-600"><Filter size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Phone</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono text-sm font-black text-slate-900 uppercase tracking-wider">{order.transactionId}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-600 font-mono">{order.customerPhone}</span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-900">
                    {currency}{order.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                    {new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">No payments recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
