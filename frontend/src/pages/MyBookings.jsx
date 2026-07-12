import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Ticket, XCircle, MapPin, Calendar, Receipt, ChevronDown, ChevronUp, Bell, CalendarCheck, Share2, X } from 'lucide-react';
import api from '../services/api';
import { useAlertStore } from '../store/useAlertStore';
import MTicket from '../components/MTicket';
import Pagination from '../components/Pagination';

const MyBookings = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const successMessage = location.state?.successMessage;
  const { showConfirm, showAlert } = useAlertStore();

  const [expandedBooking, setExpandedBooking] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/my');
      return response.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId) => {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      showAlert('Cancellation Success', 'Your booking has been cancelled successfully.');
    },
    onError: (error) => {
      showAlert('Cancellation Failed', error.response?.data?.message || 'Failed to cancel booking. Please try again.');
    }
  });

  // Google Calendar URL Generator
  const getGoogleCalendarUrl = (booking) => {
    const start = new Date(booking.eventDateTime);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // assume 3 hours duration
    
    const formatUTC = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const title = encodeURIComponent(booking.eventTitle);
    const dates = `${formatUTC(start)}/${formatUTC(end)}`;
    const details = encodeURIComponent(`Booking ID: ${booking.id}\nSeats: ${booking.seats.map(s => s.seatNumber).join(', ')}`);
    const location = encodeURIComponent(booking.venue);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  // Download ICS file helper
  const downloadIcs = (booking) => {
    const start = new Date(booking.eventDateTime);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    
    const formatUTC = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Eventify//NONSGML Event Booking//EN
BEGIN:VEVENT
UID:booking-${booking.id}@eventify.com
DTSTAMP:${formatUTC(new Date())}
DTSTART:${formatUTC(start)}
DTEND:${formatUTC(end)}
SUMMARY:${booking.eventTitle}
DESCRIPTION:Booking ID: ${booking.id}\\nSeats: ${booking.seats.map(s => s.seatNumber).join(', ')}
LOCATION:${booking.venue}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `eventify-booking-${booking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-80 gap-3">
      <div className="w-11 h-11 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary animate-spin" />
      <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading your bookings…</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-sm animate-bounce">
          <Ticket className="text-emerald-500" /> {successMessage}
        </div>
      )}

      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Bookings</h1>

      {bookings?.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No bookings yet</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">When you book tickets, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(booking => {
            const parsedAddons = booking.addons ? JSON.parse(booking.addons) : [];
            const isExpanded = expandedBooking === booking.id;
            const isDropdownOpen = activeDropdown === booking.id;
            
            const eventDate = new Date(booking.eventDateTime);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venue)}`;

            return (
              <div 
                key={booking.id} 
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {/* Visible Card Summary */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{booking.eventTitle}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        booking.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        booking.bookingStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-primary" />
                        <span>Event: {eventDate.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ticket size={14} className="text-primary" />
                        <span>{booking.seats.length} Tickets</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {booking.seats.map(seat => (
                        <span key={seat.id} className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700/60 shadow-sm">
                          {seat.seatNumber} ({seat.section})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">₹{booking.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Show Details Toggle */}
                      <button 
                        onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                        title="View Details & Receipt"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* Calendar Reminder Dropdown */}
                      {booking.bookingStatus === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => setTicketModalBooking(booking)}
                            className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors border border-emerald-100 dark:border-emerald-900/60 flex items-center gap-1.5 font-bold text-xs"
                          >
                            <Ticket size={15} />
                            M-Ticket
                          </button>
                          
                          <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(isDropdownOpen ? null : booking.id)}
                            className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-primary dark:text-indigo-300 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-1.5 font-bold text-xs"
                          >
                            <Bell size={15} />
                            Reminder
                          </button>
                          
                          {isDropdownOpen && (
                            <div className="absolute right-0 top-11 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-30 animate-[fadeSlideDown_0.15s_ease]">
                              <a
                                href={getGoogleCalendarUrl(booking)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                              >
                                <CalendarCheck size={16} className="text-primary" />
                                Google Calendar
                              </a>
                              <button
                                onClick={() => { downloadIcs(booking); setActiveDropdown(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                              >
                                <Share2 size={16} className="text-primary" />
                                Apple / ICS File
                              </button>
                            </div>
                          )}
                        </div>
                        </>
                      )}

                      {/* Cancel Button */}
                      {(booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'PENDING') && (
                        <button 
                          onClick={async () => {
                            const confirmed = await showConfirm(
                              'Cancel Booking Warning',
                              'Only 40% of the total booking fee will be refunded. Are you sure you want to cancel this booking?',
                              'Yes, Cancel',
                              'No, Keep Booking'
                            );
                            if (confirmed) {
                              cancelMutation.mutate(booking.id);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-3 py-2.5 rounded-xl transition-colors border border-rose-100 dark:border-rose-900/40 disabled:opacity-50"
                        >
                          <XCircle size={15} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Invoice Breakdown Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/20 p-6 space-y-6 rounded-b-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Location & Directions */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Venue Details</h4>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{booking.venue}</p>
                          <a 
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
                          >
                            <MapPin size={13} /> View on Google Maps →
                          </a>
                        </div>
                      </div>

                      {/* Breakdown Invoice Receipt */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Price Breakdown</h4>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          
                          {/* Add-ons list if any */}
                          {parsedAddons.length > 0 && (
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 space-y-1">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Add-ons Purchased</span>
                              {parsedAddons.map((add, idx) => (
                                <div key={idx} className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                  <span>{add.quantity}x {add.name}</span>
                                  <span>₹{(add.price * add.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Base math breakdown */}
                          {booking.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>Promo Discount ({booking.couponCode})</span>
                              <span>-₹{parseFloat(booking.discountAmount).toFixed(2)}</span>
                            </div>
                          )}
                          
                          {booking.addonAmount > 0 && (
                            <div className="flex justify-between">
                              <span>Add-ons Subtotal</span>
                              <span>₹{parseFloat(booking.addonAmount).toFixed(2)}</span>
                            </div>
                          )}

                          {booking.taxAmount > 0 && (
                            <div className="flex justify-between">
                              <span>18% GST (CGST + SGST)</span>
                              <span>₹{parseFloat(booking.taxAmount).toFixed(2)}</span>
                            </div>
                          )}

                          <div className="border-t border-slate-100 dark:border-slate-700 pt-2 flex justify-between font-black text-slate-900 dark:text-white text-base">
                            <span>Grand Total Paid</span>
                            <span className="text-emerald-600 dark:text-emerald-400">₹{booking.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {bookings && bookings.length > itemsPerPage && (
            <Pagination 
              currentPage={currentPage}
              totalItems={bookings.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => {
                 setCurrentPage(page);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      )}

      {/* MTicket Modal */}
      <AnimatePresence>
        {ticketModalBooking && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-hidden flex items-center justify-center p-4">
              <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full flex justify-center"
            >
              <button 
                onClick={() => setTicketModalBooking(null)}
                className="absolute -top-10 right-0 sm:right-4 text-white hover:text-gray-300 bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors print:hidden z-10"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col items-center w-full">
                <MTicket booking={ticketModalBooking} />
              </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MyBookings;
