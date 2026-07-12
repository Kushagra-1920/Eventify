import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const { showAlert } = useAlertStore();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/');
    } catch (error) {
      showAlert('Registration Failed', error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        
        <div className="flex justify-center mb-8">
          <div className="bg-secondary/10 p-4 rounded-2xl">
            <UserPlus size={40} className="text-secondary" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2">Create Account</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-8">Join us to book your next experience</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Full Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 dark:bg-slate-900 font-medium"
              placeholder="John Doe"
            />
            {errors.name && <span className="text-rose-500 text-xs mt-1 font-semibold">{errors.name.message}</span>}
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
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-slate-50 dark:bg-slate-900 font-medium"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-rose-500 text-xs mt-1 font-semibold">{errors.password.message}</span>}
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Sign Up
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-secondary hover:underline font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

