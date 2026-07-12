import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Info } from 'lucide-react';
import api from '../services/api';

const EventDetails = () => {
  const { id } = useParams();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get(`/events/${id}`);
      return response.data;
    }
  });

  if (isLoading) return <div className="text-center p-10 font-bold text-slate-500 dark:text-slate-400">Loading experience...</div>;
  if (error) return <div className="text-center text-rose-500 p-10 font-bold bg-rose-50 rounded-xl">Event not found.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700">
        <div className="h-80 md:h-96 w-full relative">
          <img src={event.bannerUrl || `https://picsum.photos/seed/${event.id}/1200/600`} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
            <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">{event.category}</span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">{event.title}</h1>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <Info className="text-primary" /> About the Event
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{event.description}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl"><Calendar className="text-primary" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Date & Time</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(event.dateTime).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl"><MapPin className="text-primary" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Venue</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary hover:underline transition-colors block"
                    >
                      {event.venue}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl"><Tag className="text-emerald-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Status</p>
                    <p className="font-bold text-emerald-600">{event.status}</p>
                  </div>
                </div>
              </div>

              <Link to={`/events/${event.id}/seats`} className="block w-full text-center bg-gradient-to-r from-primary to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-primary-dark hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
                Select Seats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

