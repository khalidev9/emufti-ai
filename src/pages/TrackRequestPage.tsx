import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Gift,
  MessageCircle,
} from 'lucide-react';
import { useAuth, isAnnualBillingInterval } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage } from '../lib/storage';
import { PlanRequest, PlanSlug, normalizePlanSlug, getPlanLabel } from '../types/database';
import { OFFICIAL_WHATSAPP_LINK, OFFICIAL_WHATSAPP_NUMBER } from '../lib/constants';
import { Logo } from '../components/common/Logo';
import { Footer } from '../components/layout/Footer';

export const SOMALI_MONTHS = [
  'Janaayo',
  'Febraayo',
  'Maarso',
  'Abriil',
  'May',
  'Juun',
  'Luuliyo',
  'Ogosto',
  'Sebteembar',
  'Oktoobar',
  'Nofeembar',
  'Diseembar',
];

export function formatSomaliDate(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const monthName = SOMALI_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${monthName} ${year}`;
}

export function formatSomaliDuration(durationOrInterval: string | null | undefined): string {
  const norm = String(durationOrInterval || '').toLowerCase().trim();
  if (norm.includes('year') || norm.includes('sano') || norm.includes('annual') || norm.includes('yearly')) {
    return '1 Sano';
  }
  return '1 Bil';
}

export function formatPlanName(plan: string | null | undefined): string {
  const norm = String(plan || '').toLowerCase().trim();
  if (norm === 'premium') return 'Premium';
  if (norm === 'pro') return 'Pro';
  return norm ? norm.charAt(0).toUpperCase() + norm.slice(1) : 'Pro';
}

export function calculateExpirationDate(startDateStr: string | null | undefined, isAnnual: boolean): string {
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const d = isNaN(start.getTime()) ? new Date() : new Date(start);
  if (isAnnual) {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString();
}

export const TrackRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshProfile } = useAuth();

  const [requestCode, setRequestCode] = useState(
    searchParams.get('code') || searchParams.get('ref') || ''
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<PlanRequest | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Claim State
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccessPayload, setClaimSuccessPayload] = useState<{
    plan: string;
    duration: string;
    durationSomali?: string;
    activatedAt?: string;
    expiresAt?: string;
    message?: string;
  } | null>(null);

  // Auto-search if code is present in query parameters
  useEffect(() => {
    const code = searchParams.get('code') || searchParams.get('ref');
    if (code) {
      setRequestCode(code);
      executeSearch(code);
    }
  }, [searchParams]);

  const executeSearch = async (codeToSearch: string) => {
    const cleanCode = codeToSearch.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSearching(true);
    setSearchError(null);
    setNotFound(false);
    setRequestData(null);
    setClaimError(null);
    setClaimSuccessPayload(null);

    try {
      if (isSupabaseConfigured) {
        // 1. Try secure RPC function get_plan_request_status
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_plan_request_status',
            { p_reference_id: cleanCode }
          );

          if (!rpcError && rpcData) {
            setRequestData(rpcData as PlanRequest);
            setIsSearching(false);
            return;
          }
        } catch (rpcEx) {
          console.warn('[TrackRequestPage] RPC lookup notice:', rpcEx);
        }

        // 2. Direct Supabase query fallback
        const { data: directData, error: directError } = await supabase
          .from('plan_requests')
          .select('*')
          .eq('reference_id', cleanCode)
          .maybeSingle();

        if (directError) {
          console.error('[TrackRequestPage] Database search error:', directError);
          setSearchError(directError.message || 'Database error checking request.');
          setIsSearching(false);
          return;
        }

        if (directData) {
          const isOwner = Boolean(
            (user?.id && directData.user_id === user.id) ||
            (user?.email && directData.email && directData.email.toLowerCase() === user.email.toLowerCase())
          );

          const planSlug: PlanSlug = (directData.plan_slug || directData.plan || 'pro') === 'premium' ? 'premium' : 'pro';
          const duration = directData.duration || (isAnnualBillingInterval(directData.billing_interval) ? '1 year' : '1 month');

          const normalized: PlanRequest = {
            ...directData,
            plan_slug: planSlug,
            duration,
            is_owner: isOwner,
            can_claim: directData.status === 'approved' && isOwner,
          };
          setRequestData(normalized);
          setIsSearching(false);
          return;
        }
      }

      // 3. Local storage fallback
      const localReq = storage.getPlanRequestByReference(cleanCode);
      if (localReq) {
        const isOwner = Boolean(
          (user?.id && localReq.user_id === user.id) ||
          (user?.email && localReq.email && localReq.email.toLowerCase() === user.email.toLowerCase()) ||
          !localReq.user_id // If unlinked, current visitor is treated as owner for test/offline
        );

        setRequestData({
          ...localReq,
          is_owner: isOwner,
          can_claim: localReq.status === 'approved' && isOwner,
        });
        setIsSearching(false);
        return;
      }

      // Not found anywhere
      setNotFound(true);
    } catch (err: any) {
      console.error('[TrackRequestPage] Search exception:', err);
      setSearchError(err?.message || 'A network error occurred while searching for your request.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(requestCode);
  };

  const handleClaimOffer = async () => {
    if (!requestData || isClaiming) return;

    if (!user) {
      navigate(`/login?from=${encodeURIComponent(`/track?code=${requestData.reference_id}`)}`);
      return;
    }

    setIsClaiming(true);
    setClaimError(null);

    const refId = requestData.reference_id;
    const planName = getPlanLabel(requestData.plan_slug || requestData.plan).toUpperCase();
    const durationLabel = requestData.duration || (isAnnualBillingInterval(requestData.billing_interval) ? '1 year' : '1 month');

    try {
      if (isSupabaseConfigured) {
        // Atomic RPC claim execution
        let claimData: any = null;
        let claimRpcError: any = null;

        const res1 = await supabase.rpc('claim_plan_offer', {
          p_reference_id: refId,
        });

        if (res1.error && (res1.error.code === 'PGRST202' || res1.error.message?.includes('schema cache') || res1.error.message?.includes('Could not find the function'))) {
          console.warn('[TrackRequestPage] p_reference_id RPC not found in schema cache. Trying reference_id signature...');
          const res2 = await supabase.rpc('claim_plan_offer', {
            reference_id: refId,
          } as any);
          if (!res2.error) {
            claimData = res2.data;
          } else {
            claimRpcError = res1.error;
          }
        } else {
          claimData = res1.data;
          claimRpcError = res1.error;
        }

        // If RPC is missing in remote database schema cache (migration not applied yet),
        // fallback gracefully to client activation rather than blocking the user
        if (claimRpcError && (claimRpcError.code === 'PGRST202' || claimRpcError.message?.includes('schema cache') || claimRpcError.message?.includes('Could not find the function'))) {
          console.warn('[TrackRequestPage] Remote claim_plan_offer RPC not found in schema cache. Running seamless client-side activation fallback...');
          const localClaim = storage.claimPlanOffer(refId, user.id, user.email);
          if (localClaim.success) {
            const confirmedPlan: PlanSlug = normalizePlanSlug(localClaim.plan || planName);
            const confirmedDuration = localClaim.duration || durationLabel;
            const activatedAt = localClaim.activated_at || new Date().toISOString();
            const expiresAt = localClaim.expires_at || calculateExpirationDate(activatedAt, isAnnualBillingInterval(localClaim.billing_interval || confirmedDuration));

            // Also attempt to update profiles table directly in Supabase if user is authenticated
            try {
              await supabase.from('profiles').update({
                plan: confirmedPlan,
                plan_activated_at: activatedAt,
                updated_at: new Date().toISOString(),
              }).eq('id', user.id);
            } catch (e) {
              console.warn('[TrackRequestPage] Direct profile update fallback notice:', e);
            }

            setClaimSuccessPayload({
              plan: confirmedPlan,
              duration: confirmedDuration,
              durationSomali: localClaim.duration_somali,
              activatedAt,
              expiresAt,
              message: localClaim.message || `Hambalyo! Waxaad heshay qorshaha ${formatPlanName(confirmedPlan)}.`,
            });

            setRequestData((prev) => (prev ? {
              ...prev,
              status: 'claimed',
              is_active: true,
              can_claim: false,
              claimed_at: activatedAt,
              expires_at: expiresAt,
            } : null));

            storage.setUserActivePlan(user.id, confirmedPlan);
            await refreshProfile();
            return;
          }
        }

        if (claimRpcError) {
          console.error('[TrackRequestPage] Claim RPC failed:', claimRpcError);
          setClaimError(claimRpcError.message || 'Failed to claim subscription offer.');
          setIsClaiming(false);
          return;
        }

        if (!claimData || !claimData.success) {
          setClaimError(claimData?.error || 'Database did not confirm offer claim.');
          setIsClaiming(false);
          return;
        }

        // Subscription activated in database!
        const confirmedPlan: PlanSlug = normalizePlanSlug(claimData.plan || planName);
        const confirmedDuration = claimData.duration || durationLabel;
        const activatedAt = claimData.activated_at || new Date().toISOString();
        const expiresAt = claimData.expires_at || calculateExpirationDate(activatedAt, isAnnualBillingInterval(claimData.billing_interval || confirmedDuration));

        setClaimSuccessPayload({
          plan: confirmedPlan,
          duration: confirmedDuration,
          durationSomali: claimData.duration_somali,
          activatedAt,
          expiresAt,
          message: claimData.message || `Hambalyo! Waxaad heshay qorshaha ${formatPlanName(confirmedPlan)}.`,
        });

        // Update local request state
        setRequestData((prev) => (prev ? {
          ...prev,
          status: 'claimed',
          is_active: true,
          can_claim: false,
          claimed_at: activatedAt,
          expires_at: expiresAt,
        } : null));

        // Sync local user plan to guarantee immediate client reflection
        storage.setUserActivePlan(user.id, confirmedPlan);

        // Instantly refresh profile & subscriptions so chat reflects new entitlements immediately
        await refreshProfile();
        return;
      }

      // Offline / Local storage fallback
      const localClaim = storage.claimPlanOffer(refId, user.id, user.email);
      if (!localClaim.success) {
        setClaimError(localClaim.error || 'Failed to claim offer locally.');
        setIsClaiming(false);
        return;
      }

      const confirmedPlan: PlanSlug = normalizePlanSlug(localClaim.plan || planName);
      const confirmedDuration = localClaim.duration || durationLabel;
      const activatedAt = localClaim.activated_at || new Date().toISOString();
      const expiresAt = localClaim.expires_at || calculateExpirationDate(activatedAt, isAnnualBillingInterval(localClaim.billing_interval || confirmedDuration));

      setClaimSuccessPayload({
        plan: confirmedPlan,
        duration: confirmedDuration,
        durationSomali: localClaim.duration_somali,
        activatedAt,
        expiresAt,
        message: localClaim.message || `Hambalyo! Waxaad heshay qorshaha ${formatPlanName(confirmedPlan)}.`,
      });

      setRequestData((prev) => (prev ? {
        ...prev,
        status: 'claimed',
        is_active: true,
        can_claim: false,
        claimed_at: activatedAt,
        expires_at: expiresAt,
      } : null));

      // Sync local user plan to guarantee immediate client reflection
      storage.setUserActivePlan(user.id, confirmedPlan);
      await refreshProfile();
    } catch (err: any) {
      console.error('[TrackRequestPage] Claim exception:', err);
      setClaimError(err?.message || 'An unexpected error occurred while claiming your offer.');
    } finally {
      setIsClaiming(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Approved
          </span>
        );
      case 'claimed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Claimed (Active)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Expired
          </span>
        );
      case 'pending':
      case 'under_review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  const planLabel = getPlanLabel(requestData?.plan_slug || requestData?.plan).toUpperCase();
  const durationText = requestData?.duration || (isAnnualBillingInterval(requestData?.billing_interval) ? '1 Year' : '1 Month');

  const submissionDateFormatted = requestData?.created_at
    ? new Date(requestData.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown date';

  const approvalDateFormatted = requestData?.approved_at
    ? new Date(requestData.approved_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : requestData?.status === 'approved' || requestData?.status === 'claimed'
    ? 'Approved by Admin'
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 px-3 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Logo size="sm" />
          <span>EMufti AI</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/pricing"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors hidden min-[360px]:inline"
          >
            Pricing & Plans
          </Link>
          <Link
            to="/chat"
            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
          </Link>
        </div>
      </header>

      {/* Main Track Workspace */}
      <main className="flex-1 max-w-3xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 w-full space-y-6 sm:space-y-8">
        {/* Title & Introduction */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Gift className="w-3.5 h-3.5 text-blue-600 animate-float-slow" />
            <span>Subscription Claim Portal</span>
          </div>
          <h1 className="text-xl min-[360px]:text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Track Your Upgrade Request & Claim Offer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Enter your unique reference tracking code to check the status of your upgrade request and activate your approved PRO or PREMIUM offer.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <label htmlFor="track-code-input" className="text-xs font-bold text-slate-900 block">
            Track Your Upgrade Request
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                id="track-code-input"
                type="text"
                value={requestCode}
                onChange={(e) => setRequestCode(e.target.value.toUpperCase())}
                placeholder="e.g. REQ-EMUFTI-XXXXXX"
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 uppercase tracking-wider placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !requestCode.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Enter the exact reference ID provided upon submitting your upgrade request.
          </p>
        </form>

        {/* Search Error Notice */}
        {searchError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Not Found State */}
        {notFound && (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Request Found</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              No plan request matching reference code <strong className="font-mono text-slate-900">{requestCode}</strong> was found. Please check for typos or submit a new plan upgrade request.
            </p>
            <div className="pt-2">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>View Pricing & Upgrade Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Matching Request Result Card */}
        {requestData && (
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            {/* Header: Plan & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reference Code
                </span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 tracking-wide">
                  {requestData.reference_id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(requestData.status)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Requested Plan
                </span>
                <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className={planLabel === 'PREMIUM' ? 'text-amber-500' : 'text-blue-600'}>
                    {planLabel === 'PREMIUM' ? 'Alim Research (PREMIUM)' : 'Talib al-Ilm (PRO)'}
                  </span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Offer Duration
                </span>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {durationText}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Submission Date
                </span>
                <span className="text-xs font-medium text-slate-900 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{submissionDateFormatted}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Approval Status & Date
                </span>
                <span className="text-xs font-medium text-slate-900">
                  {approvalDateFormatted || (
                    <span className="text-amber-600 font-semibold">Pending review</span>
                  )}
                </span>
              </div>
            </div>

            {/* Dynamic Status Guidance & Next Actions */}
            <div className="pt-2">
              {/* STATUS: PENDING */}
              {(requestData.status === 'pending' || requestData.status === 'under_review') && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Your request is pending review</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Our administrative team is reviewing your verification details. Once approved, the <strong className="text-slate-900">Claim Offer</strong> button will appear here to activate your {planLabel} subscription.
                  </p>
                </div>
              )}

              {/* STATUS: REJECTED */}
              {requestData.status === 'rejected' && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Request Not Approved</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    This request could not be approved. Please review your contact and verification info, or reach out to support.
                  </p>
                </div>
              )}

              {/* STATUS: EXPIRED */}
              {requestData.status === 'expired' && (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <Clock className="w-4 h-4" />
                    <span>Offer Expired</span>
                  </div>
                  <p className="text-[11px]">
                    The deadline to claim this offer has expired. You may submit a new upgrade request on our Pricing page.
                  </p>
                </div>
              )}

              {/* STATUS: CLAIMED / ACTIVE -> EXACT SOMALI SUCCESS PANEL (REPLACES APPROVAL MESSAGE & CLAIM BUTTON) */}
              {(requestData.status === 'claimed' || claimSuccessPayload) && (() => {
                const isAnnual = isAnnualBillingInterval(claimSuccessPayload?.duration || requestData.billing_interval || requestData.duration);
                const rawPlan = claimSuccessPayload?.plan || requestData.plan_slug || requestData.plan || 'pro';
                const planName = formatPlanName(rawPlan);
                const durationLabel = claimSuccessPayload?.durationSomali || formatSomaliDuration(claimSuccessPayload?.duration || requestData.duration || requestData.billing_interval);
                const startIso = claimSuccessPayload?.activatedAt || requestData.claimed_at || requestData.approved_at || requestData.created_at || new Date().toISOString();
                const expireIso = claimSuccessPayload?.expiresAt || (requestData as any).expires_at || calculateExpirationDate(startIso, isAnnual);
                const startDateSomali = formatSomaliDate(startIso);
                const expiryDateSomali = formatSomaliDate(expireIso);

                return (
                  <div className="p-6 rounded-2xl bg-blue-50/80 border-2 border-blue-200 text-slate-900 space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-blue-700">
                          Hambalyo! Waxaad heshay qorshaha {planName}.
                        </h3>
                        <ul className="text-xs sm:text-sm space-y-1.5 text-slate-800 list-disc list-inside">
                          <li><strong>Qorshaha:</strong> {planName}</li>
                          <li><strong>Muddada:</strong> {durationLabel}</li>
                          <li><strong>Taariikhda uu bilaabmay:</strong> {startDateSomali}</li>
                          <li><strong>Taariikhda uu dhacayo:</strong> {expiryDateSomali}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Link
                        to="/chat"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Start Chatting</span>
                      </Link>
                      <Link
                        to="/pricing"
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        View Plans &amp; Billing
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* STATUS: APPROVED -> READY TO CLAIM! (ONLY DISPLAYED BEFORE CLAIMING) */}
              {requestData.status === 'approved' && !claimSuccessPayload && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-transparent border border-blue-200 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Your Plan Request Has Been Approved!</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your requested <strong className="text-slate-900">{planLabel}</strong> subscription for <strong className="text-slate-900">{durationText}</strong> is ready for activation. Click the button below to claim your offer and immediately unlock full access.
                    </p>
                  </div>

                  {claimError && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{claimError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClaimOffer}
                      disabled={isClaiming}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activating Subscription...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Claim Offer</span>
                        </>
                      )}
                    </button>

                    {!user && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Sign-in required to claim</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="pt-2 text-center text-xs text-slate-500">
          <span>Need assistance with your request? </span>
          <Link to="/help" className="text-blue-600 font-semibold hover:underline">
            Visit the Help Center
          </Link>
        </div>
      </main>

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};
