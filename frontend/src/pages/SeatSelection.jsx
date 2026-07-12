import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAlertStore } from '../store/useAlertStore';
import { useAuthStore } from '../store/useAuthStore';

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const { showAlert } = useAlertStore();
  const { user } = useAuthStore();

  const { data: seats, isLoading } = useQuery({
    queryKey: ['seats', id],
    queryFn: async () => {
      const response = await api.get(`/events/${id}/seats`);
      return response.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const lockSeatsMutation = useMutation({
    mutationFn: async (seatIds) => {
      const response = await api.post('/bookings/lock-seats', {
        eventId: parseInt(id),
        seatIds,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Pass the booking data to the checkout page
      navigate('/checkout', { state: { booking: data } });
    },
    onError: (error) => {
      // E.g. OptimisticLockException resulting in 409 Conflict
      showAlert('Failed to Lock Seats', error.response?.data?.message || 'Some seats might no longer be available. Please re-select.');
      setSelectedSeatIds([]); // Reset selection
    },
  });

  if (isLoading) return <div className="text-center p-10 font-bold">Loading seats...</div>;

  // Group seats by section and row
  const groupedSeats = seats?.reduce((acc, seat) => {
    if (!acc[seat.section]) acc[seat.section] = {};
    if (!acc[seat.section][seat.row]) acc[seat.section][seat.row] = [];
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {});

  const toggleSeat = (seatId, status, lockOwner) => {
    if (status !== 'AVAILABLE' && lockOwner !== user?.id) return;
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleLockSeats = () => {
    if (selectedSeatIds.length === 0) return;
    if (!user) {
      showAlert('Login Required', 'You need to be logged in to book tickets.', 'warning');
      navigate('/login');
      return;
    }
    lockSeatsMutation.mutate(selectedSeatIds);
  };

  const getSeatColor = (status, isSelected, lockOwner) => {
    if (isSelected) return 'bg-indigo-500 border-indigo-600 text-white shadow-md transform scale-110';
    if (status === 'LOCKED' && lockOwner === user?.id) return 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 text-emerald-800 cursor-pointer';
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 text-emerald-800 cursor-pointer';
      case 'LOCKED': return 'bg-amber-100 border-amber-300 text-amber-500 cursor-not-allowed opacity-70';
      case 'BOOKED': return 'bg-rose-100 border-rose-300 text-rose-500 cursor-not-allowed opacity-70';
      default: return 'bg-gray-200';
    }
  };

  const selectedSeatsData = seats?.filter(s => selectedSeatIds.includes(s.id)) || [];
  const totalPrice = selectedSeatsData.reduce((sum, s) => sum + parseFloat(s.price), 0);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Legend & Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-black tracking-tight mb-2">Select Your Seats</h1>
        <p className="text-slate-400 font-medium">Choose your preferred seats. Seats are refreshed every 5 seconds.</p>
        
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-emerald-100 border border-emerald-300"></div> <span className="text-sm font-semibold">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 opacity-70"></div> <span className="text-sm font-semibold">Locked</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-rose-100 border border-rose-300 opacity-70"></div> <span className="text-sm font-semibold">Booked</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-indigo-500 border border-indigo-600"></div> <span className="text-sm font-semibold">Selected</span></div>
        </div>
      </div>

      {/* Your Selection Summary Panel - Displays ABOVE the Hall */}
      <div className="sticky top-[65px] z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-grow w-full">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Your Selection</h2>
            {selectedSeatIds.length === 0 ? (
              <div className="py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No seats selected yet. Click on available seats below to start booking.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Chosen seats:</span>
                {selectedSeatsData.map(seat => (
                  <span key={seat.id} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-1.5 rounded-xl font-bold text-xs border border-indigo-100 dark:border-indigo-900/60 shadow-sm flex items-center gap-1.5">
                    {seat.seatNumber} <span className="text-[10px] text-slate-400 font-normal">({seat.section} • ₹{seat.price})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {selectedSeatIds.length > 0 && (
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-700">
              <div className="text-left md:text-right min-w-[120px]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Subtotal</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">₹{totalPrice.toFixed(2)}</p>
              </div>
              
              <button
                onClick={handleLockSeats}
                disabled={lockSeatsMutation.isPending}
                className="bg-primary hover:bg-indigo-600 text-white font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-sm whitespace-nowrap"
              >
                {lockSeatsMutation.isPending ? 'Locking Seats...' : `Continue to Checkout (${selectedSeatIds.length})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hall Layout - Taking Full Width */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <div className="inline-block min-w-[820px] w-full align-middle">
          
          {/* Stage representation */}
          <div className="relative w-full max-w-4xl h-24 bg-gradient-to-b from-indigo-500/20 to-transparent dark:from-indigo-500/30 dark:to-transparent rounded-t-[100%] mb-16 flex items-end justify-center pb-4 text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-[0.5em] text-sm mx-auto border-t-8 border-indigo-500 shadow-[0_-20px_60px_-15px_rgba(99,102,241,0.5)]">
            <span className="opacity-80">Screen</span>
          </div>

          {/* Seat Map sections */}
          <div className="space-y-10 px-2">
            {groupedSeats && Object.entries(groupedSeats).map(([section, rows]) => (
              <div key={section} className="space-y-4">
                <h3 className="flex items-center justify-center gap-2 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs mb-3 bg-slate-100 dark:bg-slate-900/50 py-2 px-4 rounded-full w-max mx-auto border border-slate-200 dark:border-slate-800">
                  <span>{section} SECTION</span>
                  <span className="text-primary">•</span>
                  <span className="text-primary font-bold">₹{Object.values(rows)[0][0].price}</span>
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(rows).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center justify-center gap-1.5">
                      <span className="w-6 text-center font-bold text-slate-400 dark:text-slate-500 text-xs">{row}</span>
                      <div className="flex gap-1.5">
                        {rowSeats.sort((a, b) => a.id - b.id).map(seat => (
                          <div
                            key={seat.id}
                            onClick={() => toggleSeat(seat.id, seat.status, seat.lockOwner)}
                            className={`w-8 h-8 rounded-t-lg rounded-b-md border flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${getSeatColor(seat.status, selectedSeatIds.includes(seat.id), seat.lockOwner)}`}
                            title={`Seat ${seat.seatNumber} - ₹${seat.price}`}
                          >
                            {seat.seatNumber.replace(row, '')}
                          </div>
                        ))}
                      </div>
                      <span className="w-6 text-center font-bold text-slate-400 dark:text-slate-500 text-xs">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
