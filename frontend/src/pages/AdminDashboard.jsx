import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart3, Users, Ticket, Calendar as CalendarIcon, 
  Settings, DollarSign, Activity, CheckCircle, XCircle, 
  ShieldAlert, ShieldCheck, ChevronRight, Plus, Search, Filter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../services/api';
import { useAlertStore } from '../store/useAlertStore';
import Pagination from '../components/Pagination';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('ALL');
  
  const [usersPage, setUsersPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const itemsPerPage = 8;
  
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '', venue: '', category: 'MOVIE', status: 'UPCOMING', bannerUrl: ''
  });
  
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  // Queries
  const { data: globalAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-global-analytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/global');
      return response.data;
    }
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
    enabled: activeTab === 'users'
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await api.get('/admin/bookings');
      return response.data;
    },
    enabled: activeTab === 'bookings'
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const response = await api.get('/events?size=100');
      return response.data.content;
    },
    enabled: activeTab === 'events'
  });

  // Mutations
  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const response = await api.put(`/admin/users/${id}/role?role=${role}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showAlert('Success', 'User role updated', 'success');
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/admin/bookings/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      showAlert('Success', 'Booking forcefully cancelled', 'success');
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/admin/events/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      showAlert('Success', 'Event updated successfully', 'success');
      setEditingEvent(null);
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/admin/events`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      showAlert('Success', 'New event created successfully', 'success');
      setIsCreatingEvent(false);
      setNewEventData({ title: '', venue: '', category: 'MOVIE', status: 'UPCOMING', bannerUrl: '' });
    }
  });

  const sidebarNav = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 size={20} /> },
    { id: 'events', name: 'Events', icon: <CalendarIcon size={20} /> },
    { id: 'bookings', name: 'Bookings', icon: <Ticket size={20} /> },
    { id: 'users', name: 'Users', icon: <Users size={20} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] pt-24 pb-12 text-slate-200 font-sans">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sticky top-28">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Admin Console</h2>
              <nav className="flex flex-col gap-2">
                {sidebarNav.map((nav) => (
                  <button
                    key={nav.id}
                    onClick={() => setActiveTab(nav.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                      activeTab === nav.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {nav.icon}
                    {nav.name}
                    {activeTab === nav.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Platform Overview</h1>
                    <p className="text-slate-400">Real-time metrics and system health.</p>
                  </div>
                </div>

                {analyticsLoading ? (
                  <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0"><DollarSign size={24} /></div>
                          <p className="text-slate-400 font-medium whitespace-nowrap truncate">Total Revenue</p>
                        </div>
                        <p className="text-3xl xl:text-4xl font-black text-white truncate" title={`₹${globalAnalytics?.totalRevenue?.toFixed(2) || '0.00'}`}>
                          ₹{globalAnalytics?.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl shrink-0"><Ticket size={24} /></div>
                          <p className="text-slate-400 font-medium whitespace-nowrap truncate">Total Bookings</p>
                        </div>
                        <p className="text-3xl xl:text-4xl font-black text-white truncate">{globalAnalytics?.totalBookings || 0}</p>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl shrink-0"><Users size={24} /></div>
                          <p className="text-slate-400 font-medium whitespace-nowrap truncate">Total Users</p>
                        </div>
                        <p className="text-3xl xl:text-4xl font-black text-white truncate">{globalAnalytics?.totalUsers || 0}</p>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl min-w-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl shrink-0"><CalendarIcon size={24} /></div>
                          <p className="text-slate-400 font-medium whitespace-nowrap truncate">Total Events</p>
                        </div>
                        <p className="text-3xl xl:text-4xl font-black text-white truncate">{globalAnalytics?.totalEvents || 0}</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl mt-8">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="text-primary"/> Revenue Last 7 Days</h3>
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[...(globalAnalytics?.revenueOverTime || [])].reverse()}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" tick={{fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">User Directory</h1>
                    <p className="text-slate-400">Manage roles and permissions.</p>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-800/50 border-b border-slate-700/50">
                            <th className="p-4 text-slate-400 font-semibold text-sm">ID</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Name</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Email</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Role</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {users?.slice((usersPage - 1) * itemsPerPage, usersPage * itemsPerPage).map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="p-4 font-mono text-slate-500 text-sm">#{u.id}</td>
                              <td className="p-4 font-bold text-white">{u.name}</td>
                              <td className="p-4 text-slate-300">{u.email}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                  u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {u.role === 'ADMIN' ? <ShieldCheck size={14}/> : <Users size={14}/>}
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4">
                                {u.role === 'USER' ? (
                                  <button 
                                    onClick={() => roleMutation.mutate({ id: u.id, role: 'ADMIN' })}
                                    className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-500/30 transition-colors"
                                  >
                                    Promote to Admin
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => roleMutation.mutate({ id: u.id, role: 'USER' })}
                                    className="text-xs font-bold bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-500/30 transition-colors"
                                  >
                                    Demote
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {users && users.length > itemsPerPage && (
                      <Pagination currentPage={usersPage} totalItems={users.length} itemsPerPage={itemsPerPage} onPageChange={setUsersPage} />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Bookings Ledger</h1>
                    <p className="text-slate-400">Monitor and manage all transactions.</p>
                  </div>
                </div>

                {bookingsLoading ? (
                  <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-800/50 border-b border-slate-700/50">
                            <th className="p-4 text-slate-400 font-semibold text-sm">ID</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Event</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Amount</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Status</th>
                            <th className="p-4 text-slate-400 font-semibold text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {bookings?.slice((bookingsPage - 1) * itemsPerPage, bookingsPage * itemsPerPage).map(b => (
                            <tr key={b.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="p-4 font-mono text-slate-500 text-sm">#{b.id}</td>
                              <td className="p-4 font-bold text-white">{b.eventTitle || b.event?.title || 'Unknown Event'}</td>
                              <td className="p-4 font-mono text-emerald-400">₹{b.totalAmount?.toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                  b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {b.bookingStatus === 'CONFIRMED' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                  {b.bookingStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                {b.bookingStatus === 'CONFIRMED' && (
                                  <button 
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to forcibly cancel this booking and refund the user?')) {
                                        cancelBookingMutation.mutate(b.id);
                                      }
                                    }}
                                    className="text-xs font-bold bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-500/30 transition-colors"
                                  >
                                    Force Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {bookings && bookings.length > itemsPerPage && (
                      <Pagination currentPage={bookingsPage} totalItems={bookings.length} itemsPerPage={itemsPerPage} onPageChange={setBookingsPage} />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === 'events' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Event Master</h1>
                    <p className="text-slate-400">Create, edit, and monitor events.</p>
                  </div>
                  <button 
                    onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                    className="bg-primary hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
                  >
                    <Plus size={20} />
                    {isCreatingEvent ? 'Cancel' : 'New Event'}
                  </button>
                </div>
                
                {isCreatingEvent && (
                  <div className="bg-slate-900 border border-primary/30 rounded-3xl p-6 backdrop-blur-xl mb-6 shadow-lg shadow-primary/10">
                    <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">Title</label>
                        <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2" 
                          value={newEventData.title} onChange={(e) => setNewEventData({...newEventData, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">Venue</label>
                        <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2" 
                          value={newEventData.venue} onChange={(e) => setNewEventData({...newEventData, venue: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">Category</label>
                        <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2"
                          value={newEventData.category} onChange={(e) => setNewEventData({...newEventData, category: e.target.value})}>
                          <option>MOVIE</option><option>MUSIC</option><option>COMEDY</option><option>SPORTS</option><option>TECHNOLOGY</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">Status</label>
                        <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2"
                          value={newEventData.status} onChange={(e) => setNewEventData({...newEventData, status: e.target.value})}>
                          <option>UPCOMING</option><option>ONGOING</option><option>COMPLETED</option><option>CANCELLED</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">Banner URL</label>
                        <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2" 
                          value={newEventData.bannerUrl} onChange={(e) => setNewEventData({...newEventData, bannerUrl: e.target.value})} />
                      </div>
                      <div className="col-span-2 flex justify-end mt-2">
                        <button 
                          onClick={() => createEventMutation.mutate(newEventData)}
                          disabled={!newEventData.title || !newEventData.venue || createEventMutation.isPending}
                          className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search events by title or venue..." 
                      className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 backdrop-blur-xl focus:outline-none focus:border-primary transition-colors"
                      value={eventSearchQuery}
                      onChange={(e) => { setEventSearchQuery(e.target.value); setEventsPage(1); }}
                    />
                  </div>
                  <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <select 
                      className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 backdrop-blur-xl focus:outline-none focus:border-primary transition-colors appearance-none"
                      value={eventCategoryFilter}
                      onChange={(e) => { setEventCategoryFilter(e.target.value); setEventsPage(1); }}
                    >
                      <option value="ALL" className="bg-[#020617] text-white">All Categories</option>
                      <option value="MOVIE" className="bg-[#020617] text-white">Movie</option>
                      <option value="MUSIC" className="bg-[#020617] text-white">Music</option>
                      <option value="COMEDY" className="bg-[#020617] text-white">Comedy</option>
                      <option value="SPORTS" className="bg-[#020617] text-white">Sports</option>
                      <option value="TECHNOLOGY" className="bg-[#020617] text-white">Technology</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                   {events?.filter(e => {
                     const matchesSearch = e.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) || e.venue.toLowerCase().includes(eventSearchQuery.toLowerCase());
                     const matchesCategory = eventCategoryFilter === 'ALL' || e.category === eventCategoryFilter;
                     return matchesSearch && matchesCategory;
                   }).slice((eventsPage - 1) * itemsPerPage, eventsPage * itemsPerPage).map(e => (
                     <div key={e.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4">
                        <div className="flex gap-4">
                          <img src={e.bannerUrl} className="w-24 h-32 object-cover rounded-xl" />
                          <div className="flex flex-col justify-between w-full">
                             <div>
                               <h3 className="text-xl font-bold text-white mb-1">{e.title}</h3>
                               <p className="text-slate-400 text-sm mb-2">{e.venue}</p>
                               <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">{e.status}</span>
                             </div>
                             <button 
                               onClick={() => setEditingEvent(editingEvent?.id === e.id ? null : e)}
                               className="text-primary hover:text-indigo-400 text-sm font-bold self-start mt-4"
                             >
                               {editingEvent?.id === e.id ? 'Cancel Editing' : 'Edit Event Configuration'}
                             </button>
                          </div>
                        </div>

                        {editingEvent?.id === e.id && (
                          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 animate-fadeIn">
                            <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Title</label>
                              <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2" 
                                value={editingEvent.title} onChange={(ev) => setEditingEvent({...editingEvent, title: ev.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Venue</label>
                              <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2" 
                                value={editingEvent.venue} onChange={(ev) => setEditingEvent({...editingEvent, venue: ev.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Category</label>
                              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2"
                                value={editingEvent.category} onChange={(ev) => setEditingEvent({...editingEvent, category: ev.target.value})}>
                                <option>MOVIE</option><option>MUSIC</option><option>COMEDY</option><option>SPORTS</option><option>TECHNOLOGY</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Status</label>
                              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2"
                                value={editingEvent.status} onChange={(ev) => setEditingEvent({...editingEvent, status: ev.target.value})}>
                                <option>UPCOMING</option><option>ONGOING</option><option>COMPLETED</option><option>CANCELLED</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs font-bold text-slate-400 mb-1 block">Banner URL</label>
                              <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2" 
                                value={editingEvent.bannerUrl} onChange={(ev) => setEditingEvent({...editingEvent, bannerUrl: ev.target.value})} />
                            </div>
                            <div className="col-span-2 flex justify-end mt-2">
                              <button 
                                onClick={() => updateEventMutation.mutate({ id: e.id, data: editingEvent })}
                                className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        )}
                     </div>
                   ))}
                   
                   {events && events.filter(e => {
                     const matchesSearch = e.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) || e.venue.toLowerCase().includes(eventSearchQuery.toLowerCase());
                     const matchesCategory = eventCategoryFilter === 'ALL' || e.category === eventCategoryFilter;
                     return matchesSearch && matchesCategory;
                   }).length > itemsPerPage && (
                     <Pagination 
                       currentPage={eventsPage} 
                       totalItems={events.filter(e => {
                         const matchesSearch = e.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) || e.venue.toLowerCase().includes(eventSearchQuery.toLowerCase());
                         const matchesCategory = eventCategoryFilter === 'ALL' || e.category === eventCategoryFilter;
                         return matchesSearch && matchesCategory;
                       }).length} 
                       itemsPerPage={itemsPerPage} 
                       onPageChange={setEventsPage} 
                     />
                   )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center h-64 opacity-50">
                <Settings size={48} className="mb-4" />
                <p className="text-lg font-bold">System Configuration (Coming Soon)</p>
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
