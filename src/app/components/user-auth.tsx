import { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import { sendLoginOTP, verifyOTP, supabase } from '../../lib/supabase';
import { useAppStore } from '../store/app-store';

interface UserAuthProps {
  onSuccess: () => void;
}

type AuthStep = 'form' | 'otp' | 'signup-success';

export function UserAuth({ onSuccess }: UserAuthProps) {
  const { setCurrentUser } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  // Handle Sign Up - creates account and immediately sends OTP for login
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    try {
      // Sign up with email confirmation disabled (just create the account)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
          emailRedirectTo: undefined // No email redirect needed
        }
      });

      if (signUpError) throw signUpError;

      if (data.user?.identities?.length === 0) {
        setError('Email already registered. Please login instead.');
        setLoading(false);
        return;
      }

      // Account created - now send OTP for login immediately
      try {
        await sendLoginOTP(formData.email);
        setCooldown(60);
        setMessage(`Account created! OTP sent to ${formData.email}`);
        setStep('otp');
      } catch (otpErr: any) {
        // If OTP fails due to rate limit, show success and let user try login manually
        if (otpErr.message?.includes('rate limit') || otpErr.message?.includes('security purposes')) {
          setMessage('Account created! Please wait a moment then login.');
          setIsLogin(true);
          setCooldown(60);
        } else {
          throw otpErr;
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message?.includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (err.message?.includes('already registered')) {
        setError('Email already registered. Please login instead.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Login - sends OTP to email
  const handleLoginSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another code`);
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    if (!formData.email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    try {
      await sendLoginOTP(formData.email);
      setCooldown(60);
      setMessage(`OTP sent to ${formData.email}`);
      setStep('otp');
    } catch (err: any) {
      console.error('Login OTP error:', err);
      if (err.message?.includes('security purposes') || (err.message?.includes('after') && err.message?.includes('seconds'))) {
        const match = err.message.match(/(\d+)\s*seconds/);
        const seconds = match ? parseInt(match[1]) : 60;
        setCooldown(seconds);
        setError(`Please wait ${seconds} seconds before requesting another code`);
      } else if (err.message?.includes('rate limit')) {
        setCooldown(60);
        setError('Too many attempts. Please wait a minute and try again.');
      } else if (err.message?.includes('Signups not allowed') || err.message?.includes('user_not_found')) {
        setError('No account found with this email. Please sign up first.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP for login
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const { user } = await verifyOTP(formData.email, otpCode);
      
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email || formData.email,
          name: user.user_metadata?.name || formData.name || 'User',
          joinedDate: new Date().toISOString().split('T')[0]
        });
        onSuccess();
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
        setError('Invalid or expired code. Please try again.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another code`);
      return;
    }
    
    setLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);

    try {
      await sendLoginOTP(formData.email);
      setCooldown(60);
      setMessage('New code sent to your email');
    } catch (err: any) {
      if (err.message?.includes('security purposes') || (err.message?.includes('after') && err.message?.includes('seconds'))) {
        const match = err.message.match(/(\d+)\s*seconds/);
        const seconds = match ? parseInt(match[1]) : 60;
        setCooldown(seconds);
        setError(`Please wait ${seconds} seconds before requesting another code`);
      } else if (err.message?.includes('rate limit')) {
        setCooldown(60);
        setError('Too many attempts. Please wait a minute.');
      } else {
        setError(err.message || 'Failed to resend code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('form');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setMessage('');
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setStep('form');
    setError('');
    setMessage('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
          
          {/* Signup Success Step */}
          {step === 'signup-success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Your account has been created successfully. Please login with your email to continue.
              </p>
              <button
                onClick={switchToLogin}
                className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <>
              {/* Tab Switch */}
              <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setMessage('');
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
                    setMessage('');
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
                  ? 'Enter your email to receive a login code' 
                  : 'Create your account with email and password'}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-600">{message}</p>
                </div>
              )}

              {/* Login Form - Email only */}
              {isLogin && (
                <form onSubmit={handleLoginSendOTP} className="space-y-4">
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

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-6"
                  >
                    {loading ? 'Sending...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send Login Code'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* Sign Up Form - Full form */}
              {!isLogin && (
                <form onSubmit={handleSignUp} className="space-y-4">
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

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                      />
                    </div>
                  </div>

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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-6"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[var(--crimson)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="text-[var(--crimson)]" size={28} />
                </div>
                <h2 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-gray-600 text-sm">
                  We sent a 6-digit code to<br />
                  <span className="font-medium text-[var(--charcoal)]">{formData.email}</span>
                </p>
              </div>

              {/* Success Message */}
              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-600">{message}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* OTP Input */}
              <form onSubmit={handleVerifyOTP}>
                <div className="flex gap-2 justify-center mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] focus:ring-2 focus:ring-[var(--crimson)]/20"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Resend Code */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOTP}
                    disabled={loading || cooldown > 0}
                    className="text-[var(--crimson)] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          {step === 'form' && isLogin
            ? 'A secure code will be sent to your email'
            : step === 'form' && !isLogin
            ? 'Create your account, then login with OTP'
            : 'Check your spam folder if you don\'t see the email'}
        </p>
      </div>
    </div>
  );
}
