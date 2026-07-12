import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { CATEGORY_META } from './constants';

const EventCard = ({ event }) => {
  const meta = CATEGORY_META[event.category] || CATEGORY_META['MUSIC'];
  const imgSrc = event.bannerUrl?.startsWith('data:')
    ? event.bannerUrl
    : (event.bannerUrl || `https://picsum.photos/seed/${event.id}/600/400`);

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/60 transition-all duration-400 hover:-translate-y-1.5"
    >
      {/* Image */}
      <div className="h-48 relative overflow-hidden bg-slate-200 dark:bg-slate-700">
        <img
          src={imgSrc}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* dark scrim on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Category pill */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r ${meta.gradient} text-white shadow-md`}>
          {meta.label}
        </div>
        {/* Hover CTA */}
        <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="bg-white text-slate-900 text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
            Book Now →
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow gap-2">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {event.title}
        </h3>

        <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-primary flex-shrink-0" />
            <span>{new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-primary flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            event.status === 'UPCOMING'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {event.status === 'UPCOMING' ? '● Live Soon' : event.status}
          </span>
          <span className="text-xs font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
