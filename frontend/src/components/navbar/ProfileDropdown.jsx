import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Phone, Camera, Edit3, X, Save, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

const ProfileDropdown = () => {
  const { user, logout, setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [form, setForm]           = useState({ name: '', phone: '', profilePicture: '' });
  const dropdownRef = useRef(null);

  // Sync form from user whenever dropdown opens
  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
      });
      setEditing(false);
      setSaved(false);
    }
  }, [open, user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePicture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/me', form);
      const updatedUser = res.data;
      // Update store — keep existing token
      const currentToken = useAuthStore.getState().token;
      setAuth({ ...updatedUser }, currentToken);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Profile update failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-transform hover:scale-105"
        aria-label="Open profile menu"
      >
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30">
            {initials}
          </div>
        )}
        {/* Online dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-slate-900/80 border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-[fadeSlideDown_0.2s_ease]">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 px-5 pt-5 pb-12">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{user.role}</p>
            <h3 className="text-white font-black text-lg leading-tight">{user.name}</h3>
            <p className="text-white/70 text-sm font-medium">{user.email}</p>
          </div>

          {/* Profile Pic floating */}
          <div className="relative flex justify-center -mt-8 mb-3">
            <div className="relative">
              {form.profilePicture || user.profilePicture ? (
                <img
                  src={editing ? form.profilePicture : user.profilePicture}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 ring-4 ring-white dark:ring-slate-800 shadow-lg flex items-center justify-center text-white font-black text-2xl">
                  {initials}
                </div>
              )}
              {editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer group">
                  <Camera size={18} className="text-white" />
                  <input type="file" accept="image/*" onChange={handlePicture} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-5 pb-5 space-y-3">
            {editing ? (
              <>
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User size={11} /> Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone size={11} /> Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
                  >
                    {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={14} />}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Read-only info */}
                <div className="space-y-2">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <Phone size={13} className="text-primary" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {!user.phone && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No phone number added yet</p>
                  )}
                </div>

                {saved && (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                    <Check size={14} /> Profile updated!
                  </div>
                )}

                <button
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </button>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
