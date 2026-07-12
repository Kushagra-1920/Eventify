import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, CreditCard, Ticket, CheckCircle2, MapPin, Coffee, Utensils, Percent, FileText, ChevronRight, ShoppingBag, Receipt, Printer, X, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useAlertStore } from '../store/useAlertStore';
import QuotationModal from '../components/CheckoutPageComponents/QuotationModal';
import MTicket from '../components/MTicket';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ADDON_CATALOG = [
  { id: 'addon_popcorn', name: 'Classic Popcorn', desc: 'Freshly popped butter salted popcorn (Large)', price: 150, icon: '🍿' },
  { id: 'addon_nachos',  name: 'Nachos with Cheese', desc: 'Crispy tortilla chips served with warm cheese sauce', price: 180, icon: '🧀' },
  { id: 'addon_coffee',  name: 'Cold Brew Coffee', desc: 'Premium Arabica cold brew over ice', price: 120, icon: '☕' },
  { id: 'addon_soda',    name: 'Premium Soft Drink', desc: 'Refreshing chilled fountain soda (500ml)', price: 80, icon: '🥤' }
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showAlert } = useAlertStore();
  const [initialBooking, setInitialBooking] = useState(location.state?.booking);

  // Ultra-smooth custom scrolling function
  const smoothScrollToTop = (duration = 1000) => {
    const startY = window.scrollY;
    const startTime = performance.now();
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const scroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY * (1 - easeInOutCubic(progress)));
      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };
    requestAnimationFrame(scroll);
  };

  const [timeLeft, setTimeLeft] = useState(600);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  // State for interactive details
  const [addons, setAddons] = useState(
    ADDON_CATALOG.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [finalizedBooking, setFinalizedBooking] = useState(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  useEffect(() => {
    if (!initialBooking) {
      navigate('/');
      return;
    }

    loadRazorpayScript().then(res => setIsScriptLoaded(res));

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showAlert('Session Expired', 'Your seat lock session has expired. The seats have been released.').then(() => {
            navigate(`/events/${initialBooking.eventId}/seats`);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialBooking, navigate]);

  // Backend validation/finalize request
  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const selectedAddons = Object.entries(addons)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = ADDON_CATALOG.find(x => x.id === id);
          return { id, name: item.name, quantity: qty, price: item.price };
        });

      const response = await api.put(`/bookings/${initialBooking.id}/finalize`, {
        addons: selectedAddons,
        couponCode: appliedCoupon
      });
      return response.data;
    },
    onSuccess: (data) => {
      setFinalizedBooking(data);
      setCouponError('');
    },
    onError: (error) => {
      setCouponError(error.response?.data?.message || 'Failed to apply changes');
      setAppliedCoupon('');
    }
  });

  // Trigger recalculation on addons change or coupon code validation
  useEffect(() => {
    if (initialBooking) {
      finalizeMutation.mutate();
    }
  }, [addons, appliedCoupon]);

  const verifyMutation = useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post('/payments/verify', {
        bookingId: initialBooking.id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setFinalizedBooking(data);
      setShowTicketModal(true);
      smoothScrollToTop(1000); // 1-second ultra-smooth scroll
    },
    onError: (error) => {
      showAlert('Payment Verification Failed', error.response?.data?.message || 'Payment verification failed. Please contact support.');
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/payments/create-order', { bookingId: initialBooking.id });
      return response.data;
    },
    onSuccess: (data) => {
      if (!isScriptLoaded) {
        showAlert('Razorpay Gateway Error', 'Razorpay SDK failed to load. Please verify your internet connection.');
        return;
      }
      
      const options = {
        key: 'rzp_test_SUNvosgFmwxxZ3',
        amount: data.amount,
        currency: data.currency,
        name: 'Eventify Tickets',
        description: `Booking for ${initialBooking.eventTitle}`,
        order_id: data.id,
        handler: function (response) {
          verifyMutation.mutate(response);
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || ''
        },
        theme: {
          color: '#6366f1'
        }
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    },
    onError: (error) => {
      showAlert('Order Placement Failed', error.response?.data?.message || 'Failed to create payment order. Please try again.');
    }
  });

  const handleConfirm = () => {
    createOrderMutation.mutate();
  };

  if (!initialBooking) return null;

  const currentBooking = finalizedBooking || initialBooking;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isDanger = timeLeft < 60;

  // Calculators for client UI (fallback if finalizedBooking is loading)
  const ticketSubtotal = initialBooking.seats.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const addonSubtotal = Object.entries(addons).reduce((sum, [id, qty]) => {
    const item = ADDON_CATALOG.find(x => x.id === id);
    return sum + (item.price * qty);
  }, 0);

  const updateAddonQty = (id, delta) => {
    setAddons(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    setAppliedCoupon(couponCode.trim());
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon('');
  };

  // Google Maps Search link
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentBooking.venue)}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Review & Pay</h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold mt-1">Complete your ticket checkout securely</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-black shadow-inner ${isDanger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 animate-pulse' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'}`}>
          <Clock size={18} />
          <span>Checkout expires in: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Top Row - Summary & Coupons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Booking Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Ticket className="text-primary" /> Booking Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Event</p>
                <p className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{currentBooking.eventTitle}</p>
                
                <a 
                  href={mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline group"
                >
                  <MapPin size={15} />
                  <span className="line-clamp-1">{currentBooking.venue}</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seats Selected ({currentBooking.seats.length})</p>
                <div className="flex flex-wrap gap-2">
                  {currentBooking.seats.map(seat => (
                    <span key={seat.id} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl font-bold text-sm border border-indigo-100 dark:border-indigo-900/60 shadow-sm">
                      {seat.seatNumber} ({seat.section})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Input */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Percent className="text-primary" /> Promo Coupons
            </h2>
            <div className="w-full">
              {!appliedCoupon ? (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Enter Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none uppercase"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="bg-primary hover:bg-indigo-600 text-white font-extrabold px-5 rounded-xl transition-all shadow-md text-sm"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-rose-500 text-xs font-bold">{couponError}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <button onClick={() => setCouponCode('WELCOME10')} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600">WELCOME10</button>
                    <button onClick={() => setCouponCode('EARLYBIRD')} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600">EARLYBIRD</button>
                    <button onClick={() => setCouponCode('FESTIVE25')} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600">FESTIVE25</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 size={16} />
                    <span>Applied: <strong className="uppercase">{appliedCoupon}</strong></span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-500 hover:text-rose-600 p-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-md transition-colors hover:bg-rose-200 dark:hover:bg-rose-900">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Add-ons & Bill Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Add-ons Selector */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
            <div className="w-full flex items-center justify-between text-xl font-black text-slate-900 dark:text-white mb-2 pb-4 border-b border-slate-100 dark:border-slate-700">
              <span className="flex items-center gap-2.5">
                <Coffee className="text-primary" /> Elevate Your Experience (Add-ons)
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 flex-grow">
                    {ADDON_CATALOG.map((item) => (
                      <div key={item.id} className="flex flex-col gap-4 p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 justify-between transition-all hover:border-slate-200 dark:hover:border-slate-600 group hover:shadow-md h-full">
                        <div className="flex flex-col gap-2">
                          <span className="text-4xl mb-1 transform group-hover:scale-110 transition-transform origin-left">{item.icon}</span>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{item.name}</h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight">{item.desc}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                          <p className="text-sm font-black text-primary">₹{item.price}</p>
                          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
                            <button 
                              onClick={() => updateAddonQty(item.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-black text-slate-900 dark:text-white text-sm">
                              {addons[item.id]}
                            </span>
                            <button 
                              onClick={() => updateAddonQty(item.id, 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
          </div>

          {/* Invoice breakdown & Checkout */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white space-y-6 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2.5 border-b border-slate-800 pb-4">
                <Receipt className="text-emerald-400" /> Bill Details
              </h2>

            {/* Price Calculations */}
            <div className="space-y-3.5 text-sm font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Tickets Subtotal</span>
                <span>₹{ticketSubtotal.toFixed(2)}</span>
              </div>
              
              {currentBooking.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{parseFloat(currentBooking.discountAmount).toFixed(2)}</span>
                </div>
              )}

              {addonSubtotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Add-ons Subtotal</span>
                  <span>₹{addonSubtotal.toFixed(2)}</span>
                </div>
              )}

              {currentBooking.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">18% GST Taxes</span>
                  <span>₹{parseFloat(currentBooking.taxAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                <span className="font-extrabold text-base">Total Payable</span>
                <span className="text-3xl font-black text-emerald-400">₹{currentBooking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            </div>

            <div className="flex gap-2 mt-auto pt-6">
              <button
                onClick={handleConfirm}
                disabled={createOrderMutation.isPending || verifyMutation.isPending || timeLeft <= 0}
                className="flex-grow bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl hover:bg-emerald-400 transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 disabled:opacity-50 text-sm"
              >
                <CheckCircle2 size={18} />
                {createOrderMutation.isPending ? 'Connecting...' : verifyMutation.isPending ? 'Verifying...' : 'Pay with Razorpay'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quotation Modal ─────────────────────────────────────── */}
      {/* ── Quotation Modal ─────────────────────────────────────── */}
      {showQuotation && (
        <QuotationModal
          user={user}
          currentBooking={currentBooking}
          ticketSubtotal={ticketSubtotal}
          addonSubtotal={addonSubtotal}
          addons={addons}
          addonCatalog={ADDON_CATALOG}
          onClose={() => setShowQuotation(false)}
        />
      )}

      {/* Success Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && finalizedBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-hidden flex justify-center items-start pt-[25vh] px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full flex justify-center"
            >
              <button 
                onClick={() => navigate('/my-bookings')}
                className="absolute -top-10 right-0 sm:right-4 text-white hover:text-gray-300 bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors print:hidden z-10"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col items-center max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-4">
                  <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-full inline-flex mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Payment Successful!</h2>
                  <p className="text-slate-300 text-base">Thank you for your purchase.</p>
                  <p className="text-emerald-400 text-sm font-semibold mt-2">Your M-ticket will be available on the My Bookings page.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 w-full print:hidden">
                  <button 
                    onClick={() => navigate('/')}
                    className="text-slate-300 hover:text-white text-sm font-bold bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-full transition-colors w-full sm:w-auto"
                  >
                    Back to Home
                  </button>
                  <button 
                    onClick={() => navigate('/my-bookings')}
                    className="text-white hover:text-gray-200 text-sm font-bold bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full transition-colors w-full sm:w-auto"
                  >
                    Go to My Bookings
                  </button>
                </div>
              </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
