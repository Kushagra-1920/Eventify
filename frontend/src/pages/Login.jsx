import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { showAlert } = useAlertStore();

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/');
    } catch (error) {
      showAlert('Login Failed', error.response?.data?.message || 'Invalid credentials or connection issue.');
    }
  };

  return (
    <div className="min-h-[80vh]  flex items-center justify-center">

      <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Ticket size={40} className="text-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-8">Sign in to book your next experience</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <a 
              href={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/oauth2/authorization/google` : "http://localhost:8080/oauth2/authorization/google"}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 dark:bg-slate-900 transition-all shadow-sm mb-6"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Continue with Google
            </a>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-grow"></div>
              <span className="text-sm font-medium text-slate-400">or sign in with email</span>
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-grow"></div>
            </div>

            <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Email Address</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 dark:bg-slate-900 font-medium"
              placeholder="you@example.com"
            />
            {errors.email && <span className="text-rose-500 text-xs mt-1 font-semibold">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 dark:bg-slate-900 font-medium"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-rose-500 text-xs mt-1 font-semibold">{errors.password.message}</span>}
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-bold">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

