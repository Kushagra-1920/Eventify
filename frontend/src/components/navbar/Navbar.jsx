import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Search, Moon, Sun } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { useAuthStore } from '../../store/useAuthStore';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      navigate(val.trim() ? `/?search=${encodeURIComponent(val.trim())}` : '/');
    }, 350);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    navigate(searchQuery.trim() ? `/?search=${encodeURIComponent(searchQuery.trim())}` : '/');
  };

  const navLinks = [
    { label: 'All Events', to: '/' },
    { label: 'Movies',     to: '/?category=Movie' },
    { label: 'Comedy',     to: '/?category=Comedy' },
    { label: 'Music',      to: '/?category=Music' },
    { label: 'Sports',     to: '/?category=Sports' },
  ];

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 h-18 flex items-center justify-between py-4">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-md shadow-indigo-500/30">
              <Ticket className="text-white" size={22} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">
              Eventify
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex gap-7 items-center">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="relative text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative ml-2 hidden lg:block group/search">
              <input
                type="text"
                placeholder="Search events…"
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-none text-sm font-medium rounded-full py-2 pl-10 pr-4 w-56 focus:w-72 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-700 outline-none transition-all duration-500"
              />
              <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within/search:text-primary transition-colors" />
            </form>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/my-bookings"
                className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                My Bookings
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <div className="pl-3 border-l border-slate-200 dark:border-slate-700">
                <ProfileDropdown />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary-dark text-white text-sm font-bold py-2 px-5 rounded-full transition-all shadow-md shadow-primary/30 hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
