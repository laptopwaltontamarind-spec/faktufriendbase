import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import { Lock, Mail, ArrowRight, Zap, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, adminLogin } = useAuth();
  const { setCurrentPage, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Signed in successfully!', 'success');
      setCurrentPage('dashboard');
    } else {
      showToast(res.error || 'Failed to sign in', 'error');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotSuccessMsg(data.message || 'Reset instructions dispatched.');
    } catch {
      setForgotSuccessMsg('Failed to process request.');
    }
  };

  // Quick fill demo helper
  const handleQuickFill = (type: 'simple' | 'premium') => {
    if (type === 'simple') {
      setEmail('user@example.com');
      setPassword('user123456');
    } else {
      setEmail('premium@example.com');
      setPassword('premium123456');
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#0f1422] border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        
        {/* Brand Icon */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-600/30">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-white text-center tracking-tight mb-1">
          Welcome to Method Tricks
        </h2>
        <p className="text-slate-400 text-xs text-center mb-6">
          Sign in to access your dashboard, saved methods, and courses.
        </p>

        {/* Demo Credentials Quick Switcher */}
        <div className="mb-6 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>One-Click Demo Fill:</span>
            <span className="text-[10px] text-purple-400">Instant Test</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('simple')}
              className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer text-center"
            >
              Simple User (Free)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('premium')}
              className="py-1.5 px-2 rounded bg-purple-950/70 border border-purple-500/30 hover:bg-purple-900/60 text-purple-300 text-[11px] font-medium transition-colors cursor-pointer text-center"
            >
              VIP User (Premium)
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] text-purple-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link to register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Don't have an account yet? </span>
          <button
            onClick={() => setCurrentPage('register')}
            className="text-purple-400 font-semibold hover:underline cursor-pointer"
          >
            Register Free
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered email address to receive recovery instructions.
            </p>

            {forgotSuccessMsg ? (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-purple-300 mb-4">
                {forgotSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3 mb-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl"
                >
                  Send Reset Link
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setForgotModalOpen(false);
                setForgotSuccessMsg('');
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { setCurrentPage, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(name, email, phone, password);
    setLoading(false);

    if (res.success) {
      showToast('Account created! Welcome as Simple User.', 'success');
      setCurrentPage('dashboard');
    } else {
      showToast(res.error || 'Failed to register', 'error');
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#0f1422] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-600/30">
          <Zap className="w-6 h-6 fill-white" />
        </div>

        <h2 className="text-2xl font-bold text-white text-center tracking-tight mb-1">
          Create Free Account
        </h2>
        <p className="text-slate-400 text-xs text-center mb-6">
          New registered users automatically become Simple Users.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01700-000000"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400">
            <span>By registering, you agree to our </span>
            <button
              type="button"
              onClick={() => setCurrentPage('terms')}
              className="text-purple-400 underline"
            >
              Terms & Conditions
            </button>
            <span> and </span>
            <button
              type="button"
              onClick={() => setCurrentPage('privacy')}
              className="text-purple-400 underline"
            >
              Privacy Policy
            </button>.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Already registered? </span>
          <button
            onClick={() => setCurrentPage('login')}
            className="text-purple-400 font-semibold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
