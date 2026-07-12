import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store token so the api interceptor picks it up
      localStorage.setItem('token', token);

      // Pass token explicitly in header to avoid any race condition
      api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setAuth(response.data, token);
          navigate('/');
        })
        .catch(err => {
          console.error('Failed to fetch profile', err);
          localStorage.removeItem('token');
          navigate('/login', { state: { error: 'Failed to complete Google login.' } });
        });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authenticating...</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Please wait while we log you in securely.</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;

