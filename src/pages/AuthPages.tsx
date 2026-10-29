import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { VerifyEmail } from '../components/auth/VerifyEmail';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldAlert,
  Loader2,
  HelpCircle,
  Languages,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage, isValidLanguage } from '../lib/i18n';
import { Logo } from '../components/common/Logo';

// Clean Google SVG Icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

export const AuthCombinedPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading, signIn, signInWithGoogle, signUp } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(
    isValidLanguage(language) ? language : 'so'
  );
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Security Lockout state
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockedEmail, setLockedEmail] = useState('');

  // Verification state (OTP screen)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    (location.state as any)?.verificationEmail || (location.state as any)?.email || null
  );

  // Sync mode with route prop if user navigates directly
  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  // Check URL query parameters and hash fragment for OAuth callback errors (e.g. Unsupported Provider)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashString = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashString);

      const errParam = searchParams.get('error') || hashParams.get('error');
      const errDesc =
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('msg') ||
        hashParams.get('msg');
      const errCode =
        searchParams.get('error_code') ||
        hashParams.get('error_code') ||
        searchParams.get('code') ||
        hashParams.get('code');

      if (errParam || errDesc) {
        const combined = `${errParam || ''} ${errDesc || ''} ${errCode || ''}`.toLowerCase();
        if (
          combined.includes('unsupported provider') ||
          combined.includes('provider is not enabled') ||
          combined.includes('provider is not active') ||
          combined.includes('unsupported_provider') ||
          combined.includes('validation_failed')
        ) {
          setError(
            'Google Authentication is not yet enabled in the Supabase Dashboard. To activate it, go to your Supabase Project > Authentication > Providers > Google, enable the toggle, and add your Google Client ID and Secret. In the meantime, please log in or sign up using your Email and Password below.'
          );
        } else {
          setError(decodeURIComponent(errDesc || errParam || 'Authentication failed. Please try again.'));
        }

        // Clean URL cleanly without reloading page
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch {}
  }, []);

  // Requested destination: default strictly to /chat and prevent redirecting back to login/signup or old dashboard
  const requestedDestination = (location.state as any)?.from;
  const targetDestination =
    requestedDestination &&
    requestedDestination !== '/login' &&
    requestedDestination !== '/signup' &&
    requestedDestination !== '/register' &&
    requestedDestination !== '/dashboard'
      ? requestedDestination
      : '/chat';

  // Existing sessions: If user is already authenticated, directly navigate to chat
  useEffect(() => {
    if (!isAuthLoading && user && !verificationEmail) {
      navigate('/chat', { replace: true });
    }
  }, [user, isAuthLoading, verificationEmail, navigate]);

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setIsAccountLocked(false);
    navigate(newMode === 'login' ? '/login' : '/signup', {
      replace: true,
      state: location.state,
    });
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      const raw = String(err?.message || err?.msg || 'Google sign-in could not be initiated.').toLowerCase();
      if (
        raw.includes('unsupported provider') ||
        raw.includes('provider is not enabled') ||
        raw.includes('validation_failed')
      ) {
        setError(
          'Google Authentication is not yet enabled in the Supabase Dashboard. To activate it, go to your Supabase Project > Authentication > Providers > Google, enable the toggle, and add your Google Client ID and Secret. In the meantime, please log in or sign up using your Email and Password below.'
        );
      } else {
        setError(err?.message || 'Google sign-in could not be initiated.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Fadlan geli email sax ah (Please enter a valid email address).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Furaha sirta ah waa inuu ugu yaraan ka koobnaadaa 6 xaraf (Password must be at least 6 characters).');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Fadlan qor magacaaga buuxa (Please enter your full name).');
        return;
      }
    }

    setIsLoading(true);

    if (mode === 'login') {
      const res = await signIn(cleanEmail, password);
      setIsLoading(false);
      if (res.isLocked) {
        setIsAccountLocked(true);
        setLockedEmail(cleanEmail);
        setError(
          res.error ||
            'Your account has been temporarily locked for security reasons. Please contact the Help Center for assistance.'
        );
      } else if ((res as any).isUnconfirmed) {
        setVerificationEmail(cleanEmail);
        navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`, {
          state: { email: cleanEmail, verificationEmail: cleanEmail },
        });
      } else if (res.error) {
        setError(res.error);
      } else {
        navigate(targetDestination, { replace: true });
      }
    } else {
      const res = await signUp(
        cleanEmail,
        password,
        displayName.trim(),
        undefined,
        undefined,
        selectedLang
      );
      setIsLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        setLanguage(selectedLang);
        if (res.requiresVerification) {
          setVerificationEmail(cleanEmail);
          navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`, {
            state: { email: cleanEmail, verificationEmail: cleanEmail },
          });
        } else {
          setSuccessMsg(res.message || 'Account created successfully!');
          navigate(targetDestination, { replace: true });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/25 to-slate-100 text-slate-900 flex flex-col justify-between items-center p-3 sm:p-6 sm:py-8 selection:bg-blue-100 w-full max-w-full overflow-x-hidden box-border relative">
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[360px] bg-gradient-to-tr from-blue-400/15 via-indigo-400/10 to-blue-200/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-100px] right-[-50px] w-[350px] h-[350px] bg-blue-300/10 blur-[90px] rounded-full pointer-events-none -z-10" />

      {/* Top Navigation / Brand Bar */}
      <header className="w-full max-w-md mx-auto pt-2 pb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <Logo size="md" className="group-hover:scale-105 shadow-sm shadow-blue-500/10 transition-transform" />
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            EMufti <span className="text-blue-600">AI</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs backdrop-blur-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Centered Modern Glass Card */}
      <main className="w-full max-w-[460px] my-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-blue-900/5 rounded-3xl p-6 min-[420px]:p-8 sm:p-10 space-y-6 transition-all duration-300 box-border">
          {verificationEmail ? (
            <VerifyEmail
              email={verificationEmail}
              onSuccess={() => {
                navigate(targetDestination, { replace: true });
              }}
              onChangeEmail={() => {
                setVerificationEmail(null);
                setMode('signup');
              }}
              onBackToSignup={() => {
                setVerificationEmail(null);
                setMode('signup');
              }}
              onBackToLogin={() => {
                setVerificationEmail(null);
                setMode('login');
              }}
            />
          ) : (
            <>
              {/* Card Header: Welcoming Heading & Subtitle */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                  <span>
                    {mode === 'login'
                      ? 'Madal Islaami ah oo Toosan'
                      : 'Baro Diintaada oo Hel Jawaabo Sugan'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {mode === 'login' ? 'Ku Soo Dhawow' : 'Sameyso Akoon Cusub'}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {mode === 'login'
                    ? 'Gal akoonkaaga si aad u hesho weydiimahaagii gaarka ahaa, aayadaha xafidan, iyo fatwooyinka.'
                    : 'Ku biir kumanaan qof oo adduunka ku nool si aad u hesho cilmi diini ah oo daliilaysan.'}
                </p>
              </div>

              {/* Mode Segmented Pill Switcher */}
              <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-2 gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    mode === 'login'
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    mode === 'signup'
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Security Lockout Alert Card */}
              {isAccountLocked ? (
                <div
                  role="alert"
                  className="p-5 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive space-y-3.5 animate-in fade-in-50 duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldAlert className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-destructive">
                        Security Protection Notice
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-800 font-medium">
                        Akoonkaaga waxaa si ku meel gaar ah loo xiray sababo ammaan awgood. Fadlan la xiriir
                        Xarunta Caawinta.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Link
                      to={`/help?tab=submit&reason=lockout&email=${encodeURIComponent(lockedEmail || email)}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Contact Help Center</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountLocked(false);
                        setError(null);
                        setPassword('');
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer text-center"
                    >
                      Try Another Account
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Feedback Alerts */}
                  {error && (
                    <div
                      role="alert"
                      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in-50 ${
                        error.toLowerCase().includes('google') || error.toLowerCase().includes('provider')
                          ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200'
                          : 'bg-destructive/10 border-destructive/20 text-destructive'
                      }`}
                    >
                      <AlertCircle
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          error.toLowerCase().includes('google') || error.toLowerCase().includes('provider')
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-destructive'
                        }`}
                      />
                      <div className="flex-1 space-y-1.5 leading-relaxed">
                        <span className="block font-medium">{error}</span>
                        {error.toLowerCase().includes('already exists') && (
                          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                switchMode('login');
                              }}
                              className="font-bold underline text-destructive hover:opacity-80 cursor-pointer"
                            >
                              Sign In Instead
                            </button>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => {
                                const clean = email.trim().toLowerCase();
                                setVerificationEmail(clean);
                                navigate(`/verify-email?email=${encodeURIComponent(clean)}`, {
                                  state: { email: clean, verificationEmail: clean },
                                });
                              }}
                              className="font-bold underline text-destructive hover:opacity-80 cursor-pointer"
                            >
                              Enter Verification Code
                            </button>
                          </div>
                        )}
                        {(error.toLowerCase().includes('google') || error.toLowerCase().includes('provider')) && (
                          <div className="pt-2 text-[11px] font-semibold text-amber-800 dark:text-amber-200 border-t border-amber-200/80 dark:border-amber-800/60 mt-1 space-y-1.5">
                            <div>💡 Tip: Waxaad hoos ku geli kartaa Emailkaaga iyo Furahaaga sirta ah (Use Email &amp; Password below).</div>
                            <details className="cursor-pointer group/details pt-0.5">
                              <summary className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 hover:underline list-none flex items-center gap-1">
                                <span>▶ Tilmaamaha Horumariyaha (Developer Setup Guide)</span>
                              </summary>
                              <div className="mt-2 p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800/60 text-[10px] font-mono leading-relaxed space-y-1 text-slate-800 dark:text-slate-200">
                                <div className="font-bold text-amber-900 dark:text-amber-300">Supabase Dashboard Configuration:</div>
                                <div>1. Gal Supabase Dashboard &rarr; Authentication &rarr; Providers &rarr; Google</div>
                                <div>2. Daaro toggle-ka &quot;Enable Google provider&quot;</div>
                                <div>3. Geli Client ID iyo Client Secret ee Google Cloud Console</div>
                                <div>4. Authorized Redirect URI: <span className="underline font-bold">https://ozvvxuzecwhlpbfongiy.supabase.co/auth/v1/callback</span></div>
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {successMsg && (
                    <div
                      role="status"
                      className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5 animate-in fade-in-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{successMsg}</span>
                    </div>
                  )}

                  {/* Continue with Google Action */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md hover:border-slate-300 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer group"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  {/* Clean Hairline Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative px-3 bg-white text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      {t('auth.or_with_email', 'or continue with email')}
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          {t('auth.full_name', 'Magacaaga Buuxa (Full Name)')}
                        </label>
                        <div className="relative group">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Tusaale: Cabdiraxmaan Cali"
                            className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        {t('auth.email', 'Ciwaanka Email-ka (Email Address)')}
                      </label>
                      <div className="relative group">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="magac@tusaale.com"
                          className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          {t('auth.password', 'Furaha Sirta ah (Password)')}
                        </label>
                        {mode === 'login' && (
                          <Link
                            to="/forgot-password"
                            className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-bold"
                          >
                            {t('auth.forgot_password', 'Ma ilowday furaha?')}
                          </Link>
                        )}
                      </div>
                      <div className="relative group">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title={showPassword ? 'Qari furaha' : 'Muuji furaha'}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {mode === 'signup' && (
                        <div className="space-y-1 pt-0.5">
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                password.length >= 6 ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                            />
                            <span>{t('auth.password_min', 'Ugu yaraan 6 xaraf (Minimum 6 characters)')}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {mode === 'signup' && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Languages className="w-3.5 h-3.5 text-blue-600" />
                          <span>Luuqadda aad doorbideyso (Language)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { code: 'so', label: 'Soomaali', flag: '🇸🇴' },
                            { code: 'en', label: 'English', flag: '🇬🇧' },
                            { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                          ].map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => setSelectedLang(item.code as SupportedLanguage)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                selectedLang === item.code
                                  ? 'bg-blue-50 text-blue-700 border-blue-500/70 shadow-2xs font-extrabold'
                                  : 'bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>{item.flag}</span>
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('common.loading', 'Fadlan sug...')}</span>
                        </>
                      ) : mode === 'login' ? (
                        <>
                          <span>{t('common.sign_in', 'Gal Akoonkaaga (Sign In)')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t('common.create_account', 'Sameyso Akoon Bilaash ah')}</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          )}

          {/* Seamless Mode Switch Footer */}
          <div className="pt-2 text-center space-y-3">
            <p className="text-xs text-slate-600 font-medium">
              {mode === 'login' ? (
                <>
                  Miyaanad weli akoon lahayn?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Sameyso akoon bilaash ah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  Horay ma u lahayd akoon?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Halkan ka gal (Sign In)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </p>

            {/* Trust & Privacy Signals */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>RLS Private & Secure</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Quraan & Sunnah Daliil</span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Global Clean Page Footer */}
      <footer className="w-full max-w-md mx-auto pt-6 pb-2 text-center text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <Link to="/privacy" className="hover:text-blue-600 transition-colors font-medium">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-blue-600 transition-colors font-medium">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/help" className="hover:text-blue-600 transition-colors font-medium">
            Help Center
          </Link>
          <span>•</span>
          <Link to="/admin/login" className="hover:text-slate-900 transition-colors text-slate-400">
            Admin Portal
          </Link>
        </div>
        <p className="text-[10px] text-slate-400">
          © {new Date().getFullYear()} EMufti AI. Dhammaan xuquuqda way dhowran tahay.
        </p>
      </footer>
    </div>
  );
};

export const LoginPage: React.FC = () => <AuthCombinedPage initialMode="login" />;
export const SignupPage: React.FC = () => <AuthCombinedPage initialMode="signup" />;

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam =
    searchParams.get('email') ||
    (location.state as any)?.email ||
    (location.state as any)?.verificationEmail ||
    '';
  const [manualEmail, setManualEmail] = useState(emailParam);
  const [submittedEmail, setSubmittedEmail] = useState(emailParam);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualEmail.trim().includes('@')) {
      setSubmittedEmail(manualEmail.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/25 to-slate-100 text-slate-900 flex flex-col justify-between items-center p-3 sm:p-6 sm:py-8 selection:bg-blue-100 w-full max-w-full overflow-x-hidden box-border relative">
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-400/15 blur-[90px] rounded-full pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="w-full max-w-md mx-auto pt-2 pb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <Logo size="md" className="group-hover:scale-105 shadow-sm shadow-blue-500/10 transition-transform" />
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            EMufti <span className="text-blue-600">AI</span>
          </span>
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </Link>
      </header>

      <main className="w-full max-w-[460px] my-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-blue-900/5 rounded-3xl p-6 min-[420px]:p-8 sm:p-10 space-y-6 box-border">
          {submittedEmail ? (
            <VerifyEmail
              email={submittedEmail}
              onSuccess={() => navigate('/chat', { replace: true })}
              onChangeEmail={() => {
                navigate('/signup');
              }}
              onBackToSignup={() => {
                navigate('/signup');
              }}
              onBackToLogin={() => navigate('/login')}
            />
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-xs">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Verify Your Email</h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Geli ciwaanka email-kaaga si aad akoonkaaga ugu xaqiijiso lambarka sirta ah ee 8-da god ah.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Account Email</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="seeker@example.com"
                    className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm rounded-xl bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 cursor-pointer"
              >
                Continue to Code Entry
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="w-full max-w-md mx-auto pt-4 pb-2 text-center text-xs text-slate-400">
        <p className="text-[10px]">© {new Date().getFullYear()} EMufti AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    const res = await resetPassword(email.trim().toLowerCase());
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setMessage(
        res.message ||
          'Haddii email-kani akoon leeyahay, waxaan kuugu soo dirnay xiriirka aad furaha ku beddeli karto.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/25 to-slate-100 text-slate-900 flex flex-col justify-between items-center p-3 sm:p-6 sm:py-8 selection:bg-blue-100 w-full max-w-full overflow-x-hidden box-border relative">
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-400/15 blur-[90px] rounded-full pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="w-full max-w-md mx-auto pt-2 pb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <Logo size="md" className="group-hover:scale-105 shadow-sm shadow-blue-500/10 transition-transform" />
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            EMufti <span className="text-blue-600">AI</span>
          </span>
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      <main className="w-full max-w-[460px] my-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-blue-900/5 rounded-3xl p-6 min-[420px]:p-8 sm:p-10 space-y-6 box-border">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Reset Password</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Geli email-kaaga diiwaangashan si aan kuugu soo dirno tilmaamaha aad furaha sirta ah ku beddeli
              karto.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div
              role="status"
              className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Account Email</label>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="magac@tusaale.com"
                  className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm rounded-xl bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Dirayaa...' : 'Soo Dir Xiriirka Furaha (Send Recovery Link)'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ku noqo Galitaanka (Back to Sign In)</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-md mx-auto pt-4 pb-2 text-center text-xs text-slate-400">
        <p className="text-[10px]">© {new Date().getFullYear()} EMufti AI. All rights reserved.</p>
      </footer>
    </div>
  );
};
