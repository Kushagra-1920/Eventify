export const CATEGORY_META = {
  MUSIC:      { label: 'Music',      gradient: 'from-violet-500 to-fuchsia-500',  badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
  SPORTS:     { label: 'Sports',     gradient: 'from-emerald-500 to-teal-500',    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  COMEDY:     { label: 'Comedy',     gradient: 'from-amber-500 to-orange-500',    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  TECHNOLOGY: { label: 'Technology', gradient: 'from-sky-500 to-indigo-500',      badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300' },
  MOVIE:      { label: 'Movie',      gradient: 'from-rose-500 to-pink-500',       badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
};

export const SLIDES = [
  {
    title: 'Experience the', highlight: 'Extraordinary',
    subtitle: 'Book tickets for the most anticipated concerts, sports events, and conferences worldwide.',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1400&q=80',
    badge: '🎵 Music & Arts',
    overlay: 'from-indigo-900/90 via-purple-900/60 to-transparent',
    accent: 'from-violet-400 to-fuchsia-400',
    link: '/?category=Music',
  },
  {
    title: 'Feel the', highlight: 'Electric Rush',
    subtitle: 'Get front-row seats to championship finals, live tournaments, and the biggest sporting moments.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1400&q=80',
    badge: '⚡ Live Sports',
    overlay: 'from-emerald-900/90 via-teal-900/60 to-transparent',
    accent: 'from-emerald-400 to-cyan-400',
    link: '/?category=Sports',
  },
  {
    title: 'Discover the', highlight: 'Big Screen',
    subtitle: 'Premiere screenings, director Q&As, and IMAX experiences — only on Eventify.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&q=80',
    badge: '🎬 Cinema Events',
    overlay: 'from-rose-900/90 via-pink-900/60 to-transparent',
    accent: 'from-rose-400 to-orange-400',
    link: '/?category=Movie',
  },
];
