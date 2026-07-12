import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Ticket className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Eventify</span>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              Your premium destination for booking tickets to the most exclusive events worldwide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors font-medium">Facebook</a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors font-medium">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors font-medium">Instagram</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><Link to="/?category=Music" className="text-slate-400 hover:text-primary font-medium transition-colors">Concerts & Music</Link></li>
              <li><Link to="/?category=Sports" className="text-slate-400 hover:text-primary font-medium transition-colors">Sports Events</Link></li>
              <li><Link to="/?category=Comedy" className="text-slate-400 hover:text-primary font-medium transition-colors">Comedy Shows</Link></li>
              <li><Link to="/?category=Technology" className="text-slate-400 hover:text-primary font-medium transition-colors">Tech Conferences</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-primary font-medium transition-colors">Help Center</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary font-medium transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary font-medium transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary font-medium transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Stay Updated</h3>
            <p className="text-slate-400 font-medium mb-4">Subscribe to our newsletter for the latest events.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
              />
              <button className="bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            © {new Date().getFullYear()} Eventify. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
            Made with <span className="text-rose-500">♥</span> for great events.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
