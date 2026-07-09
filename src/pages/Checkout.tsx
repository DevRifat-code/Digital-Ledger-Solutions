import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, handleAuthError } from '../lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ArrowLeft, ShieldCheck, Wallet, ChevronRight, CheckCircle2, 
  User as UserIcon, LogIn, CreditCard as CardIcon, Lock, AlertCircle, Sparkles, Loader2, Info
} from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { sendOrderNotificationEmail } from '../lib/emailService';
import { cn } from '../lib/utils';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currency = settings.currencySymbol || '৳';

  // Payment configuration
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'stripe' | 'paypal'>('bkash');
  const [stripeForm, setStripeForm] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });
  
  const [paypalData, setPaypalData] = useState({
    email: '',
    transactionId: '',
    completed: false
  });

  const [paypalModal, setPaypalModal] = useState({
    isOpen: false,
    step: 'login' as 'login' | 'pay' | 'success',
    email: '',
    password: '',
    loading: false
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bkashNumber: '',
    transactionId: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setFormData(prev => ({ ...prev, fullName: u.displayName || '', email: u.email || '' }));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const validateCardNumber = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let isDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let d = parseInt(clean[i]);
      if (isDouble) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      isDouble = !isDouble;
    }
    return sum % 10 === 0;
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    if (clean.startsWith('6')) return 'Discover';
    return 'Unknown';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!user || !product) {
        alert('Please login first');
        navigate('/admin');
        return;
    }

    if (paymentMethod === 'stripe') {
      const cardNum = stripeForm.cardNumber.replace(/\D/g, '');
      const expiry = stripeForm.cardExpiry.replace(/\s/g, '');
      const cvv = stripeForm.cardCvv.replace(/\D/g, '');

      if (!cardNum || cardNum.length < 15) {
        setValidationError('Invalid Credit Card format. Please check the card number.');
        return;
      }
      if (!validateCardNumber(cardNum)) {
        setValidationError('Card Number failed Luhn checksum. Please enter a valid card.');
        return;
      }
      if (expiry.length < 4 || !expiry.includes('/')) {
        setValidationError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cvv.length < 3) {
        setValidationError('CVV/CVC must be at least 3 digits.');
        return;
      }
      if (!stripeForm.cardName.trim()) {
        setValidationError('Please enter the cardholder Name.');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!paypalData.completed) {
        setValidationError('Please click the "Pay with PayPal Checkout" button to authorize transaction first.');
        return;
      }
    } else {
      // bkash validation
      if (!formData.bkashNumber || formData.bkashNumber.length < 11) {
        setValidationError('bKash Number must be a valid 11-digit mobile number.');
        return;
      }
      if (!formData.transactionId || formData.transactionId.trim().length < 6) {
        setValidationError('Please enter a valid bKash Transaction ID.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let orderData: any = {
        productId: product.id,
        productName: product.name,
        amount: product.price,
        customerName: formData.fullName,
        customerEmail: user.email, // Always use user.email to pass strict firestore.rules
        userId: user.uid,
        createdAt: serverTimestamp(),
        paymentMethod: paymentMethod
      };

      if (paymentMethod === 'stripe') {
        const last4 = stripeForm.cardNumber.replace(/\s/g, '').slice(-4);
        orderData.status = 'paid';
        orderData.transactionId = `STXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        orderData.cardBrand = getCardBrand(stripeForm.cardNumber);
        orderData.cardLast4 = last4;
      } else if (paymentMethod === 'paypal') {
        orderData.status = 'paid';
        orderData.transactionId = paypalData.transactionId;
        orderData.paypalEmail = paypalData.email;
      } else {
        orderData.status = 'pending';
        orderData.bkashNumber = formData.bkashNumber;
        orderData.transactionId = formData.transactionId;
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Send email notification if enabled
      if (settings.orderNotificationsEnabled && settings.contactEmail) {
        sendOrderNotificationEmail({ id: docRef.id, ...orderData }, settings.contactEmail);
      }

      navigate(`/success/${docRef.id}`);
    } catch (err) {
      handleFirestoreError(err, 'create', 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="pt-32 text-center text-slate-900">Validating checkout session...</div>;
  if (!product) return <div className="pt-32 text-center text-slate-900">Product not found.</div>;

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
            <Link to={`/product/${product.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                <ArrowLeft size={16} />
                Back to product
            </Link>
            <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                <ShoppingBag className="text-indigo-600" />
                Complete Your Order
            </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7">
            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-xl shadow-slate-200/50 text-center"
              >
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-100">
                  <UserIcon size={40} />
                </div>
                <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">Login Required</h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">To place an order and track it in your profile, please sign in to your account.</p>
                <Link
                  to="/auth"
                  state={{ from: { pathname: `/checkout/${id}` } }}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-500/20"
                >
                  <LogIn size={20} />
                  Login to Purchase
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-xl shadow-slate-200/50"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Validation Error Banner */}
                  {validationError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm"
                    >
                      <AlertCircle className="shrink-0 text-red-500" size={20} />
                      <span>{validationError}</span>
                    </motion.div>
                  )}

                  {/* Customer Info */}
                  <div>
                     <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                         <UserIcon size={20} className="text-indigo-600" />
                         Your Information
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Full Name</label>
                          <input
                            required
                            type="text"
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                            placeholder="Ex: Md Rifat Hossain"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Email Address (Read Only)</label>
                          <input
                            disabled
                            type="email"
                            value={user.email || ''}
                            className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-6 py-4 text-slate-500 cursor-not-allowed outline-none"
                          />
                        </div>
                     </div>
                  </div>

                  {/* Payment Methods Tabs */}
                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                       <Wallet size={20} className="text-indigo-600" />
                       Select Payment Gateway
                    </h3>

                    <div className="grid grid-cols-3 gap-3 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('bkash'); setValidationError(null); }}
                        className={cn(
                          "py-3.5 rounded-xl font-bold text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-2",
                          paymentMethod === 'bkash' 
                            ? "bg-white text-pink-600 shadow-md border border-pink-100" 
                            : "text-slate-500 hover:bg-white/50"
                        )}
                      >
                        <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse hidden sm:inline-block"></span>
                        bKash Wallet
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('stripe'); setValidationError(null); }}
                        className={cn(
                          "py-3.5 rounded-xl font-bold text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-2",
                          paymentMethod === 'stripe' 
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-700" 
                            : "text-slate-500 hover:bg-white/50"
                        )}
                      >
                        <CardIcon size={16} />
                        Stripe (Cards)
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('paypal'); setValidationError(null); }}
                        className={cn(
                          "py-3.5 rounded-xl font-bold text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-2",
                          paymentMethod === 'paypal' 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-100 border border-blue-700" 
                            : "text-slate-500 hover:bg-white/50"
                        )}
                      >
                        <span className="font-extrabold italic hidden sm:inline text-xs text-yellow-400">Pay</span>
                        PayPal
                      </button>
                    </div>

                    {/* render corresponding body */}
                    {paymentMethod === 'bkash' && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                                <span className="font-bold text-xs">P</span>
                            </div>
                            <div>
                                <h5 className="font-bold text-indigo-900 mb-1 leading-none uppercase text-xs tracking-wider">Payment Instructions</h5>
                                <p className="text-indigo-700 text-sm leading-relaxed mt-2">
                                    Please send the amount to our bKash personal number: <br />
                                    <span className="font-extrabold text-indigo-900 text-lg">{settings.bkashNumber || '018XXXXXXXX'}</span> <br />
                                    Then provide your bKash number and Transaction ID below.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Your bKash Number</label>
                            <input
                              required={paymentMethod === 'bkash'}
                              type="text"
                              value={formData.bkashNumber}
                              onChange={e => setFormData({...formData, bkashNumber: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                              placeholder="017/018XXXXXXXX"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Transaction ID (TrxID)</label>
                            <input
                              required={paymentMethod === 'bkash'}
                              type="text"
                              value={formData.transactionId}
                              onChange={e => setFormData({...formData, transactionId: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono tracking-widest"
                              placeholder="8JAL3K9A"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'stripe' && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Live Credit Card Visual Mockup */}
                        <div className="relative h-48 w-full max-w-[340px] mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white p-6 shadow-2xl overflow-hidden mb-6 flex flex-col justify-between font-mono">
                          {/* Shine glow */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">Stripe Sandbox Card</span>
                              {/* Card Chip Visual */}
                              <div className="w-10 h-7 bg-gradient-to-r from-yellow-300 to-amber-500 rounded-md mt-1 relative overflow-hidden border border-yellow-400/20">
                                <div className="absolute inset-x-2 inset-y-1 border border-amber-600/30 rounded-sm grid grid-cols-3 gap-0.5 animate-pulse">
                                  <span className="border-r border-b border-amber-600/30"></span>
                                  <span className="border-r border-b border-amber-600/30"></span>
                                  <span className="border-b border-amber-600/30"></span>
                                </div>
                              </div>
                            </div>
                            {/* Card Brand */}
                            <div className="text-right">
                              <span className="text-lg font-bold tracking-tight italic text-indigo-400">
                                {getCardBrand(stripeForm.cardNumber) === 'Unknown' ? 'Stripe Secure' : getCardBrand(stripeForm.cardNumber)}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="text-lg tracking-widest mb-4">
                              {stripeForm.cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="flex justify-between text-xs uppercase tracking-wider text-slate-400">
                              <div className="max-w-[140px] truncate">
                                <p className="text-[8px] text-slate-500 leading-none mb-0.5">Cardholder</p>
                                <p className="truncate text-[10px]">{stripeForm.cardName || 'CARDHOLDER NAME'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-slate-500 leading-none mb-0.5">Expires</p>
                                <p className="text-[10px]">{stripeForm.cardExpiry || 'MM/YY'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-slate-500 leading-none mb-0.5">CVC</p>
                                <p className="text-[10px]">{stripeForm.cardCvv || '•••'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Card Number (Supports 4242 For Testing)</label>
                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">Secure SSL Standard</span>
                            </div>
                            <div className="relative">
                              <input
                                required={paymentMethod === 'stripe'}
                                type="text"
                                placeholder="4242 4242 4242 4242"
                                value={stripeForm.cardNumber}
                                onChange={e => setStripeForm({ ...stripeForm, cardNumber: formatCardNumber(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pl-12 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono"
                              />
                              <CardIcon className="absolute left-4 top-4.5 text-slate-400" size={18} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Expiry Date</label>
                            <input
                              required={paymentMethod === 'stripe'}
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              value={stripeForm.cardExpiry}
                              onChange={e => setStripeForm({ ...stripeForm, cardExpiry: formatCardExpiry(e.target.value) })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Card Verification Code (CVC/CVV)</label>
                            <input
                              required={paymentMethod === 'stripe'}
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={stripeForm.cardCvv}
                              onChange={e => setStripeForm({ ...stripeForm, cardCvv: e.target.value.replace(/\D/g, '') })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Cardholder Name</label>
                            <input
                              required={paymentMethod === 'stripe'}
                              type="text"
                              placeholder="Md Rifat Hossain"
                              value={stripeForm.cardName}
                              onChange={e => setStripeForm({ ...stripeForm, cardName: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'paypal' && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {!paypalData.completed ? (
                          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                              <Sparkles size={28} className="animate-pulse" />
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-2">PayPal Smart Billing Gateway</h4>
                            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                              Complete sandbox authorization to securely pay the custom invoice starting with immediate billing.
                            </p>
                            <button
                              type="button"
                              onClick={() => setPaypalModal(prev => ({ ...prev, isOpen: true, step: 'login' }))}
                              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-yellow-500/10 uppercase tracking-wider text-xs"
                            >
                              <span className="font-display font-black tracking-tighter text-blue-900">PayPal</span> Smart Checkout
                            </button>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                              <CheckCircle2 size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-green-900 leading-none">PayPal Checkout Authorized</h5>
                              <p className="text-green-700 text-sm mt-1 leading-relaxed truncate">
                                Email: <span className="font-medium">{paypalData.email}</span>
                              </p>
                              <p className="text-xs text-green-600 mt-1 font-mono tracking-wider">
                                Ref ID: {paypalData.transactionId}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPaypalData({ email: '', transactionId: '', completed: false })}
                              className="text-xs text-red-600 hover:underline font-bold"
                            >
                              Disconnect
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Submission Button */}
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-indigo-600 text-white rounded-[1.25rem] py-6 flex items-center justify-center gap-3 font-bold text-xl hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing Order...' : 'Place Order Now'}
                    <ChevronRight size={24} />
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
                      <ShieldCheck size={16} />
                      Secure SSL encrypted Transaction gateway
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Order Summary Side */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Order Summary</h4>
                    </div>
                    <div className="p-8">
                        <div className="flex gap-6 mb-8">
                            <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center p-4 border border-indigo-400 overflow-hidden shrink-0 shadow-lg shadow-indigo-100">
                                {product.imageUrl && product.imageUrl !== "" ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
                                ) : (
                                    <ShoppingBag size={32} className="text-white opacity-20" />
                                )}
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-900 text-xl leading-tight mb-1">{product.name}</h5>
                                <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{product.category}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between text-slate-500 font-semibold mb-2">
                                <span>Subtotal</span>
                                <span>{currency}{product.price.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 font-semibold">
                                <span>Service Fee</span>
                                <span className="text-green-600 uppercase text-xs tracking-widest">FREE</span>
                            </div>
                            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">Total Payable</span>
                                <span className="text-3xl font-display font-extrabold text-indigo-600">{currency}{product.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full" />
                    <h5 className="font-bold mb-4 relative z-10 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Why Choose Us?
                    </h5>
                    <ul className="space-y-3 relative z-10">
                        <li className="text-slate-400 text-sm flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Full Source Code Protection</li>
                        <li className="text-slate-400 text-sm flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Instant Delivery After Verification</li>
                        <li className="text-slate-400 text-sm flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Free Regular Updates</li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Gateway Secure Simulation Modal */}
      <AnimatePresence>
        {paypalModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#003087] text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#003087] flex items-center justify-center font-black italic tracking-tighter text-lg">
                    P
                  </div>
                  <span className="font-display font-black tracking-tighter text-lg italic uppercase text-yellow-400">PayPal</span>
                  <span className="text-[10px] text-blue-200 uppercase tracking-widest pl-2 border-l border-blue-800 font-bold">Sandbox</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPaypalModal(prev => ({ ...prev, isOpen: false }))}
                  className="text-white hover:text-yellow-400 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 flex-1">
                {paypalModal.step === 'login' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-slate-800 mb-1">Log in to PayPal</h4>
                      <p className="text-xs text-slate-500 font-medium">Use demo credentials to authorize sandbox billing.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="paypal-buyer@example.com"
                          value={paypalModal.email}
                          onChange={e => setPaypalModal(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none text-sm transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={paypalModal.password}
                          onChange={e => setPaypalModal(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                      By logging in, you authorize this application to connect with PayPal Sandbox API client for instant billing secure simulation.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (!paypalModal.email || !paypalModal.password) {
                          alert('Please enter sandbox email and password.');
                          return;
                        }
                        setPaypalModal(prev => ({ ...prev, loading: true }));
                        setTimeout(() => {
                          setPaypalModal(prev => ({ ...prev, loading: false, step: 'pay' }));
                        }, 1200);
                      }}
                      disabled={paypalModal.loading}
                      className="w-full bg-[#0070ba] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#005ea6] transition-colors shadow-lg shadow-blue-500/10"
                    >
                      {paypalModal.loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Connecting...
                        </>
                      ) : (
                        'Log In to Sandbox'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setPaypalModal(prev => ({ 
                          ...prev, 
                          email: 'sb-buyer-rifat@business.example.com', 
                          password: '12345testuser' 
                        }));
                      }}
                      className="w-full text-center text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Autofill Test Buyer Credentials 💡
                    </button>
                  </div>
                )}

                {paypalModal.step === 'pay' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="text-xs text-slate-500 font-semibold">Paying to</span>
                        <span className="text-xs text-slate-800 font-bold">{settings.siteName}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-slate-500 font-semibold">Product Purchased</span>
                        <span className="text-xs text-slate-800 font-bold truncate max-w-[150px]">{product.name}</span>
                      </div>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest leading-none mb-1">Total Authorized Amount</p>
                      <h4 className="text-3xl font-display font-extrabold text-slate-900">{currency}{product.price.toLocaleString()}</h4>
                      <p className="text-[10px] text-slate-500 mt-2">Paying with: Visa Debit Card (Ending in •••• 9912)</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPaypalModal(prev => ({ ...prev, loading: true }));
                        setTimeout(() => {
                          const generatedRef = `PP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
                          setPaypalData({
                            email: paypalModal.email,
                            transactionId: generatedRef,
                            completed: true
                          });
                          setPaypalModal(prev => ({ ...prev, loading: false, step: 'success' }));
                        }, 1500);
                      }}
                      disabled={paypalModal.loading}
                      className="w-full bg-[#ffc439] hover:bg-[#f2b522] text-slate-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-500/10 text-sm uppercase tracking-wide"
                    >
                      {paypalModal.loading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Authorizing Pay...
                        </>
                      ) : (
                        `Authorize Payment of ${currency}${product.price.toLocaleString()}`
                      )}
                    </button>
                  </div>
                )}

                {paypalModal.step === 'success' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-100 border border-green-200 rounded-full flex items-center justify-center text-green-600 mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">PayPal Authorization Success</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Transaction cleared and securely authorized. Returning to complete the order listing.
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 inline-block">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none mb-1">Reference ID</span>
                      <span className="text-xs text-slate-700 font-mono font-bold tracking-widest">{paypalData.transactionId}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaypalModal(prev => ({ ...prev, isOpen: false }))}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition-all text-sm mt-4"
                    >
                      Proceed
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
