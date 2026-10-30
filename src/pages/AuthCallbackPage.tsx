import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Dhameystirka gelitaanka (Finalizing authentication)...');

  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      try {
        if (!isSupabaseConfigured) {
          navigate('/login', { replace: true });
          return;
        }

        // Check for error parameters in query or hash fragment
        const searchParams = new URLSearchParams(window.location.search);
        const hashString = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hashString);

        const error = searchParams.get('error') || hashParams.get('error');
        const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

        if (error || errorDesc) {
          if (mounted) {
            setErrorMsg(decodeURIComponent(errorDesc || error || 'Authentication failed.'));
          }
          setTimeout(() => {
            if (mounted) navigate(`/login?error=${encodeURIComponent(errorDesc || error || '')}`, { replace: true });
          }, 3000);
          return;
        }

        // Check if there is an active session or exchange the code/hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('[AuthCallback] getSession error:', sessionError);
        }

        if (session?.user) {
          if (mounted) {
            setStatus('Si guul leh ayaad u soo gashay (Authentication successful)!');
          }
          // Redirect to /chat
          setTimeout(() => {
            if (mounted) navigate('/chat', { replace: true });
          }, 600);
          return;
        }

        // If no immediate session, listen for the onAuthStateChange event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && newSession?.user) {
            subscription.unsubscribe();
            if (mounted) {
              navigate('/chat', { replace: true });
            }
          }
        });

        // Safety fallback timer
        setTimeout(() => {
          subscription.unsubscribe();
          if (mounted) {
            navigate('/chat', { replace: true });
          }
        }, 2500);

      } catch (err: any) {
        console.error('[AuthCallback] Exception:', err);
        if (mounted) {
          setErrorMsg(err?.message || 'Authentication callback failed.');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      }
    }

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        {errorMsg ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Failed</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{errorMsg}</p>
            <p className="text-[11px] text-blue-600 font-medium">Ku noqoshada bogga gelitaanka (Redirecting to login)...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">EMufti AI</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{status}</p>
          </>
        )}
      </div>
    </div>
  );
};
