import { FileText, Printer, X } from 'lucide-react';

const QuotationModal = ({
  user,
  currentBooking,
  ticketSubtotal,
  addonSubtotal,
  addons,
  addonCatalog,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[90vh] animate-[fadeSlideDown_0.2s_ease]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X size={20} />
        </button>

        {/* Quotation Header */}
        <div className="text-center mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-950/40 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
            <FileText size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Official Quotation</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Eventify booking system</p>
        </div>

        {/* Bill Info */}
        <div className="space-y-4 border-t border-b border-slate-100 dark:border-slate-700 py-6">
          <div className="grid grid-cols-2 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-bold block text-slate-400 text-xs uppercase tracking-wider mb-0.5">Billed To</span>
              <span className="font-black text-slate-900 dark:text-white">{user?.name}</span>
              <span className="block">{user?.email}</span>
            </div>
            <div className="text-right">
              <span className="font-bold block text-slate-400 text-xs uppercase tracking-wider mb-0.5">Reference ID</span>
              <span className="font-black text-slate-900 dark:text-white">QT-{currentBooking.id}-{Date.now().toString().slice(-4)}</span>
              <span className="block">{new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
            </div>
          </div>

          {/* Event detail */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <h4 className="font-black text-slate-900 dark:text-white">{currentBooking.eventTitle}</h4>
            <p className="text-xs text-slate-500 mt-1">📍 {currentBooking.venue}</p>
          </div>

          {/* Quotation Line items */}
          <div className="space-y-3">
            <span className="font-bold block text-slate-400 text-xs uppercase tracking-wider mb-1">Line Items</span>
            <table className="w-full text-sm text-slate-700 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-left text-slate-400 text-xs font-black uppercase">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Seats */}
                <tr className="border-b border-slate-100 dark:border-slate-700/40">
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">Tickets - {currentBooking.seats.map(s => s.seatNumber).join(', ')}</td>
                  <td className="py-2.5 text-center font-bold">{currentBooking.seats.length}</td>
                  <td className="py-2.5 text-right">₹{(ticketSubtotal / currentBooking.seats.length).toFixed(2)}</td>
                  <td className="py-2.5 text-right font-black">₹{ticketSubtotal.toFixed(2)}</td>
                </tr>
                {/* Addons */}
                {Object.entries(addons).filter(([_, qty]) => qty > 0).map(([id, qty]) => {
                  const item = addonCatalog.find(x => x.id === id);
                  return (
                    <tr key={id} className="border-b border-slate-100 dark:border-slate-700/40">
                      <td className="py-2.5 font-semibold">{item.name}</td>
                      <td className="py-2.5 text-center">{qty}</td>
                      <td className="py-2.5 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold">₹{(item.price * qty).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Taxation breakdown */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4 max-w-sm ml-auto text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{(ticketSubtotal + addonSubtotal).toFixed(2)}</span>
            </div>
            {currentBooking.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Coupon ({currentBooking.couponCode})</span>
                <span className="font-bold">-₹{parseFloat(currentBooking.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <span>Net Amount</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ₹{(ticketSubtotal + addonSubtotal - (currentBooking.discountAmount || 0)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CGST (9%)</span>
              <span>₹{(currentBooking.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (9%)</span>
              <span>₹{(currentBooking.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-base font-black text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-primary">₹{currentBooking.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-sm"
          >
            <Printer size={16} /> Print/Download PDF
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-extrabold hover:bg-indigo-600 shadow-md transition-all text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;
