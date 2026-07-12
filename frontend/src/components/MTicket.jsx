import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

const MTicket = ({ booking }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(booking.eventDateTime).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = new Date(booking.eventDateTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const seatsList = booking.seats.map(s => `${s.section} - ${s.seatNumber}`).join(', ');
  const bannerImg = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600&h=300";
  const bookingIdText = booking.id ? `WWDDFL${booking.id}` : 'WWDDFL9';

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* ======================================= */}
      {/* VISIBLE PREVIEW TICKET (HORIZONTAL)     */}
      {/* ======================================= */}
      <div id="preview-ticket" className="w-full max-w-3xl h-auto flex bg-[#f5f5f5] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 mx-auto font-sans text-slate-900">
        
        {/* Left Side: Poster & Basic Info */}
        <div className="w-[30%] relative bg-slate-900 flex flex-col">
          <div className="flex-1 w-full relative">
            <img src={bannerImg} crossOrigin="anonymous" alt="Event Poster" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <h2 className="absolute bottom-2 right-3 text-white font-black tracking-widest text-sm drop-shadow-md uppercase text-right">Eventify</h2>
          </div>
          <div className="bg-black p-4 flex flex-col justify-center h-20">
             <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
             <p className="font-bold text-white tracking-wider text-sm">{bookingIdText}</p>
          </div>
        </div>

        {/* Middle Side: Event Details */}
        <div className="w-[45%] p-4 sm:p-6 flex flex-col justify-between border-r-2 border-dashed border-gray-300 relative bg-white">
          {/* Top/Bottom Notches */}
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-black/80 rounded-full shadow-inner z-10"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-black/80 rounded-full shadow-inner z-10"></div>

          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight mb-4">
              {booking.eventTitle} <span className="text-[10px] font-bold text-gray-500 ml-1">(U/A)</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-500 font-medium mb-0.5">Date</p>
                <p className="font-bold text-slate-800 text-sm tracking-tight">{formattedDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium mb-0.5">Time</p>
                <p className="font-bold text-slate-800 text-sm tracking-tight">{formattedTime}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-[10px] text-gray-500 font-medium mb-0.5">Venue(s)</p>
              <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{booking.venue}</p>
            </div>
          </div>
          
          <div>
             <p className="text-[10px] text-gray-500 font-medium mb-0.5">Seats</p>
             <p className="font-bold text-slate-800 text-sm leading-tight text-indigo-600 line-clamp-2">{seatsList}</p>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div className="w-[25%] p-4 flex flex-col items-center justify-center bg-[#f5f5f5]">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 w-full flex items-center justify-center aspect-square max-w-[120px]">
            <QRCodeSVG 
              value={`EVENTIFY:${booking.id}|${booking.eventTitle}`} 
              className="w-full h-full"
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="mt-4 text-center">
            <span className="font-bold tracking-tighter text-[10px] text-red-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">book</span>
            <span className="font-bold text-[10px] tracking-tight ml-1">my show</span>
          </div>
        </div>
      </div>
      
      {/* PDF Download Button */}
      <button 
        onClick={handlePrint}
        className="mt-8 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 print:hidden"
      >
        <Download size={18} />
        Download Mobile PDF
      </button>

      {/* Footer / Space removed because we deleted the vertical ticket */}
      
      {/* CSS to control PDF rendering format */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          html, body {
            height: 100vh;
            overflow: hidden;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #preview-ticket, #preview-ticket * {
            visibility: visible;
          }
          #preview-ticket {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            width: 700px !important;
            height: auto !important;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default MTicket;
