import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionNotice = (location.state as any)?.message;
  const { adminSignIn, isAdmin } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as admin, redirect to /admin
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await adminSignIn(username, password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-3 sm:p-6 selection:bg-blue-100">
      {/* Top minimal bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs text-slate-500">
        <Link
          to="/"
          className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Portal</span>
        </Link>
        <span className="font-mono text-[10px] tracking-wider uppercase text-blue-600 font-bold">
          SECURE ADMINISTRATIVE ENVIRONMENT
        </span>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mx-auto mb-1">
            <Logo size="lg" className="shadow-sm shadow-blue-500/10" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            EMufti AI Administrative Gateway
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Restricted to verified Islamic content moderators, fatwa reviewers, and platform coordinators.
          </p>
        </div>

        {sessionNotice && !error && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div className="space-y-1">
              <span className="font-semibold block">Session Notice</span>
              <p className="leading-relaxed">{sessionNotice}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="space-y-1">
              <span className="font-semibold block">Authentication Notice</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Admin Identifier or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username or email"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Administrative Passphrase
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Verifying Administrative Key...</span>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Authorize & Enter Console</span>
              </>
            )}
          </button>
        </form>

        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] text-slate-600 leading-normal space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-blue-800 text-[11px]">
            <Lock className="w-3 h-3 text-blue-600" />
            <span>Brute-Force & Access Guard</span>
          </div>
          <p>
            Failed login attempts trigger automated progressive rate-limiting and audit logging. In development mode, enter your admin passphrase.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400">
        EMufti AI Platform · Administrative Gateway · Encrypted Session
      </div>
    </div>
  );
};

export default AdminLoginPage;
