import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Star, Zap } from 'lucide-react';
import api from '../services/api';
import MainCarousel from '../components/HomePageComponents/MainCarousel';
import EventCard from '../components/HomePageComponents/EventCard';
import Pagination from '../components/Pagination';

const categoryOrder = ['', 'Movie', 'Comedy', 'Music', 'Sports'];

const smoothScrollTo = (targetPosition, duration) => {
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime = null;

  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
    else window.scrollTo(0, targetPosition);
  };

  const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  requestAnimationFrame(animation);
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchFilter   = searchParams.get('search');
  const eventsRef      = useRef(null);

  const currentCat = categoryFilter || '';
  const currentIndex = categoryOrder.findIndex(c => c.toLowerCase() === currentCat.toLowerCase());
  const prevIndexRef = useRef(0);
  const [animationDir, setAnimationDir] = useState('right');
  const [animKey, setAnimKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    if (currentIndex !== prevIndex) {
      if (currentIndex === 0) {
         setAnimationDir('left'); // from left to right for "All Events"
      } else {
         setAnimationDir(currentIndex > prevIndex ? 'right' : 'left');
      }
      setAnimKey(k => k + 1);
      prevIndexRef.current = currentIndex;
    }
    
    // Reset page to 1 when filters change
    setCurrentPage(1);

    const timer = setTimeout(() => {
      if (categoryFilter || searchFilter) {
        if (eventsRef.current) {
          const topPos = eventsRef.current.getBoundingClientRect().top + window.scrollY - 96;
          smoothScrollTo(topPos, 800); // 800ms satisfying smooth cinematic scroll
        }
      } else {
        smoothScrollTo(0, 350); // 350ms quick scroll up to top for All Events
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [categoryFilter, searchFilter, currentIndex]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get('/events?size=100')).data.content,
  });

  const filteredEvents = data?.filter(ev => {
    const okCat    = categoryFilter ? ev.category.toLowerCase() === categoryFilter.toLowerCase() : true;
    const okSearch = searchFilter
      ? [ev.title, ev.venue, ev.category].some(f => f.toLowerCase().includes(searchFilter.toLowerCase()))
      : true;
    return okCat && okSearch;
  });

  const paginatedEvents = filteredEvents?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = [
    { icon: <TrendingUp size={19} />, value: `${data?.length ?? '50'}+`, label: 'Live Events' },
    { icon: <Star        size={19} />, value: '4.9★',                    label: 'Avg Rating'   },
    { icon: <Zap         size={19} />, value: '10K+',                    label: 'Tickets Sold' },
  ];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-80 gap-3">
      <div className="w-11 h-11 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary animate-spin" />
      <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading events…</p>
    </div>
  );

  if (error) return (
    <div className="text-center p-8 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-semibold">
      Failed to load events. Is the backend running?
    </div>
  );

  return (
    <div className="space-y-14">

      {/* Hero Carousel */}
      <MainCarousel />

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 py-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-default">
            <div className="text-primary group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Events Listing */}
      <div ref={eventsRef} className="scroll-mt-24">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
              {categoryFilter ? 'Filtered by' : 'Handpicked for you'}
            </p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {categoryFilter ? `${categoryFilter} Events` : 'Trending Now'}
            </h2>
          </div>
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
            {filteredEvents?.length ?? 0} events
          </span>
        </div>

        {filteredEvents?.length === 0 ? (
          <div key={`empty-${animKey}`} className={`text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 ${animationDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}>
            <div className="text-5xl mb-4">🎭</div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mb-2">No events found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No "{categoryFilter}" events right now.
            </p>
          </div>
        ) : (
          <>
            <div key={`grid-${animKey}-${currentPage}`} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${animationDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}>
              {paginatedEvents?.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
            {filteredEvents && filteredEvents.length > itemsPerPage && (
              <Pagination 
                currentPage={currentPage}
                totalItems={filteredEvents.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => {
                   setCurrentPage(page);
                   smoothScrollTo(eventsRef.current.getBoundingClientRect().top + window.scrollY - 96, 400);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
