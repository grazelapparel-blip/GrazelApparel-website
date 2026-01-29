import { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/app-store';

interface UserAuthProps {
  onSuccess: () => void;
}

export function UserAuth({ onSuccess }: UserAuthProps) {
  const { loginUser, registerUser } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const success = await loginUser(formData.email, formData.password);
        if (success) {
          onSuccess();
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Sign Up
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const success = await registerUser(formData.name, formData.email, formData.password);
        if (success) {
          onSuccess();
        } else {
          setError('Email already registered');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h1 className="font-[var(--font-serif)] text-4xl text-[var(--charcoal)] mb-2">Grazel</h1>
          <p className="text-gray-600 text-sm tracking-wide">Old Money Luxury Apparel</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {/* Tab Switch */}
          <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-[var(--crimson)] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-[var(--crimson)] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Title */}
          <h2 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Join us to access your personal shopping history'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                />
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Email:</strong> user@example.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Each login creates a separate account with your own order history and fit profile
        </p>
      </div>
    </div>
  );
}
