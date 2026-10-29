
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Check,
  Copy,
  Phone,
  Send,
  User,
  Mail,
  ShieldCheck,
  AlertCircle,
  Search,
  Clock,
  MessageCircle,
  CreditCard,
  Smartphone,
  Shield,
  ArrowRight,
  Crown,
  BookOpen,
  Calendar,
  Zap,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import {
  PlanSlug,
  PlanRequest,
  PlanRequestStatus,
  PlanActivationState,
  MobileProvider,
  PaymentMethod,
  PaymentTransaction,
  normalizePlanSlug,
  getPlanLabel,
} from '../../types/database';

import {
  detectSomaliOperator,
  validateSomaliMobileNumber,
  validateCardNumber,
  validateCardExpiry,
  validateCardCvv,
  formatCardNumberInput,
  formatExpiryInput,
  maskPhoneNumber,
  maskCardNumber,
  getAuthorizedPaymentConfig,
  getAutomaticPaymentFailedMessage,
  type SomaliOperator,
} from '../../lib/automaticPayment';

/*
 * Resilient Schema-Mismatch Handling:
 * If PostgREST reports missing columns or schema-cache mismatches (PGRST204 / 42703),
 * gracefully fallback so user submissions never fail during schema transitions.
 */
const isMissingColErr = (err?: { code?: string; message?: string } | null) => {
  if (!err) return false;
  return (
    err.code === 'PGRST204' ||
    err.code === '42703' ||
    (typeof err.message === 'string' &&
      (err.message.includes('schema cache') ||
        err.message.includes('column') ||
        err.message.includes('Could not find')))
  );
};

import { getTranslation, type SupportedLanguage } from '../../lib/i18n';

import { storage } from '../../lib/storage';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth, isAnnualBillingInterval } from '../../context/AuthContext';
import { OFFICIAL_WHATSAPP_LINK, OFFICIAL_WHATSAPP_NUMBER } from '../../lib/constants';
import {
  formatSomaliDate,
  formatSomaliDuration,
  formatPlanName,
  calculateExpirationDate,
} from '../../pages/TrackRequestPage';

interface PlanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: PlanSlug;
  defaultInterval?: 'monthly' | 'yearly';
  onRequestSubmitted?: (request: PlanRequest) => void;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

type TrackResult = PlanRequest | null | 'not_found';

const isUuid = (value?: string | null): value is string =>
  Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
      )
  );

const emailIsValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getDatabaseError = (error: {
  code?: string;
  message?: string;
}) => {
  switch (error.code) {
    case '42501':
      return 'Supabase denied the request. Check the plan_requests INSERT policy and table privileges.';
    case '42P01':
      return 'The plan_requests table was not found. Check your Supabase migration.';
    case '23505':
      return 'This reference ID already exists. Please submit again.';
    case '23502':
      return `A required database field is missing: ${error.message || 'unknown field'}`;
    case '23514':
      return 'The request contains a value that does not meet a database constraint.';
    case '22P02':
      return 'A submitted value has an invalid database format.';
    case 'PGRST204':
    case '42703':
      return `The database columns do not match the application: ${error.message || 'schema mismatch'}`;
    default:
      return error.message || 'An unexpected database error occurred.';
  }
};

export const PlanRequestModal: React.FC<PlanRequestModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'pro',
  defaultInterval = 'monthly',
  onRequestSubmitted,
  userEmail,
  userName,
  userPhone,
}) => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'request' | 'track'>('request');
  const [selectedPlan, setSelectedPlan] = useState<PlanSlug>(
    defaultPlan === 'free' ? 'pro' : defaultPlan
  );
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>(
    defaultInterval
  );

  const [fullName, setFullName] = useState(userName || profile?.display_name || '');
  const [email, setEmail] = useState(userEmail || user?.email || '');
  const [whatsapp, setWhatsapp] = useState(userPhone || profile?.phone_number || '');
  const [telegram, setTelegram] = useState('');
  const [message, setMessage] = useState('');

  // Keep state synchronized with live user / profile / prop changes
  useEffect(() => {
    if (defaultPlan && defaultPlan !== 'free') {
      setSelectedPlan(defaultPlan);
    }
  }, [defaultPlan]);

  useEffect(() => {
    if (defaultInterval) {
      setBillingInterval(defaultInterval);
    }
  }, [defaultInterval]);

  // Keep state synchronized with live user / profile changes
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
    if (profile?.display_name && !fullName) {
      setFullName(profile.display_name);
    }
  }, [user, profile]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] =
    useState<PlanRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const [trackRefId, setTrackRefId] = useState('');
  const [trackedResult, setTrackedResult] = useState<TrackResult>(null);
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Claim Offer State
  const [isClaimingModal, setIsClaimingModal] = useState(false);
  const [claimModalError, setClaimModalError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<{
    plan: string;
    duration: string;
    durationSomali?: string;
    activatedAt?: string;
    expiresAt?: string;
    message?: string;
  } | null>(null);

  // Language resolution
  const currentLang: SupportedLanguage =
    (profile?.preferred_language as SupportedLanguage) ||
    storage.getPreferredLanguage() ||
    'en';

  // Method 1 (Manual Verification) vs Method 2 (Automatic Payment)
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'automatic'>('manual');
  const [autoPaymentOption, setAutoPaymentOption] = useState<'mobile_money' | 'card'>('mobile_money');

  // Method 2 — Mobile Money
  const [mobileProvider, setMobileProvider] = useState<MobileProvider>('eVC Plus');
  const [mobileNumber, setMobileNumber] = useState(
    userPhone
      ? (userPhone.replace(/\D/g, '').startsWith('252')
          ? userPhone.replace(/\D/g, '').slice(3)
          : userPhone.replace(/\D/g, '').slice(-9))
      : ''
  );

  // Method 2 — Card
  const [cardHolder, setCardHolder] = useState(userName || profile?.display_name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingCountry, setBillingCountry] = useState('Somalia');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [autoPaymentError, setAutoPaymentError] = useState<string | null>(null);

  // 60-Second Admin Submission Countdown & Waiting State
  const [isWaitingForAdmin, setIsWaitingForAdmin] = useState(false);
  const [adminCountdown, setAdminCountdown] = useState(60);
  const adminTimerRef = useRef<any>(null);
  const pendingSubmissionRef = useRef<{
    referenceId: string;
    validUserId: string;
    cleanName: string;
    submissionEmail: string;
    cleanWhatsapp: string | null;
    cleanTelegram: string | null;
    requestedPlanSlug: PlanSlug;
    billingInterval: 'monthly' | 'yearly';
    durationStr: string;
    calculatedPrice: number;
    cleanMessage: string | null;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (adminTimerRef.current) {
        clearInterval(adminTimerRef.current);
        adminTimerRef.current = null;
      }
    };
  }, []);

  const getCountdownStatusMessage = (seconds: number) => {
    if (seconds > 45) {
      return {
        title: currentLang === 'so'
          ? 'Diyaarinta xogta dalabka...'
          : currentLang === 'ar'
          ? 'جاري إعداد بيانات طلبك...'
          : 'Preparing order details & encryption...',
        desc: currentLang === 'so'
          ? 'Waxaa la hubinayaa xogtaada diiwaangashan iyo heerka qorshaha la doortay.'
          : currentLang === 'ar'
          ? 'يتم التحقق من بيانات حسابك وتفاصيل الباقة المختارة.'
          : 'Validating your registered account and selected subscription tier.',
        step: 1,
      };
    }
    if (seconds > 30) {
      return {
        title: currentLang === 'so'
          ? 'Ku xiridda nidaamka maamulka...'
          : currentLang === 'ar'
          ? 'جاري الاتصال بنظام بوابة الإدارة...'
          : 'Connecting to administrative gateway...',
        desc: currentLang === 'so'
          ? 'Nidaamka wuxuu la xiriirayaa khadka maamulayaasha iyo xaqiijinta tooska ah.'
          : currentLang === 'ar'
          ? 'النظام يتصل الآن بقناة التنسيق والإشراف المعتمدة.'
          : 'Establishing secure communication with verified coordinator channel.',
        step: 2,
      };
    }
    if (seconds > 15) {
      return {
        title: currentLang === 'so'
          ? 'Fadlan sug 60 ilbiriqsi inta laga diiwaangelinayo dalabkaaga...'
          : currentLang === 'ar'
          ? 'يرجى الانتظار 60 ثانية بينما يتم تسجيل طلبك في السجل...'
          : 'Registering plan request in administrative ledger...',
        desc: currentLang === 'so'
          ? 'Diiwaanka dalabyada maamulka ayaa la cusboonaysiinayaa koodhkaaga gaarka ah.'
          : currentLang === 'ar'
          ? 'يتم الآن تدوين معرف المتابعة الفريد الخاص بك في السجل الإداري.'
          : 'Updating database tracking registry with your secure reference code.',
        step: 3,
      };
    }
    return {
      title: currentLang === 'so'
        ? 'Dhammaystirka diiwaangelinta iyo dirista maamulka...'
        : currentLang === 'ar'
        ? 'اكتمال التسجيل وإرسال الطلب إلى الإدارة...'
        : 'Finalizing admin dispatch and coordinator sync...',
      desc: currentLang === 'so'
        ? 'Ku dhowaad waa diyaar! Waxaa si toos ah laguu siin doonaa koodhkaaga iyo xiriirka maamulka.'
        : currentLang === 'ar'
        ? 'أوشك على الانتهاء! سيتم تزويدك برمز المتابعة وروابط التواصل المباشر.'
        : 'Almost complete! Generating your reference ID and direct coordinator links.',
      step: 4,
    };
  };

  const startAdminCountdown = (payload: NonNullable<typeof pendingSubmissionRef.current>) => {
    pendingSubmissionRef.current = payload;
    setIsWaitingForAdmin(true);
    setAdminCountdown(60);

    if (adminTimerRef.current) {
      clearInterval(adminTimerRef.current);
    }

    let remaining = 60;
    adminTimerRef.current = setInterval(() => {
      remaining -= 1;
      setAdminCountdown(remaining);
      if (remaining <= 0) {
        if (adminTimerRef.current) {
          clearInterval(adminTimerRef.current);
          adminTimerRef.current = null;
        }
        finalizeAdminDispatch();
      }
    }, 1000);
  };

  const cancelAdminCountdown = () => {
    if (adminTimerRef.current) {
      clearInterval(adminTimerRef.current);
      adminTimerRef.current = null;
    }
    setIsWaitingForAdmin(false);
    setAdminCountdown(60);
  };

  const finalizeAdminDispatch = async () => {
    if (adminTimerRef.current) {
      clearInterval(adminTimerRef.current);
      adminTimerRef.current = null;
    }
    const payload = pendingSubmissionRef.current;
    if (!payload) {
      setIsWaitingForAdmin(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPayload = {
        reference_id: payload.referenceId,
        user_id: payload.validUserId,
        full_name: payload.cleanName,
        email: payload.submissionEmail,
        whatsapp: payload.cleanWhatsapp || null,
        telegram: payload.cleanTelegram || null,
        plan: payload.requestedPlanSlug,
        plan_slug: payload.requestedPlanSlug,
        billing_interval: payload.billingInterval,
        duration: payload.durationStr,
        price_amount: payload.calculatedPrice,
        currency: 'USD',
        message: payload.cleanMessage || null,
        status: 'pending',
        payment_verified: false,
      };

      let { error: insertError } = await supabase
        .from('plan_requests')
        .insert(fullPayload);

      if (isMissingColErr(insertError)) {
        console.warn(
          'Plan request INSERT encountered schema cache/column mismatch:',
          insertError?.message
        );

        const hasDurationError =
          typeof insertError?.message === 'string' &&
          insertError.message.includes('duration');

        if (!hasDurationError) {
          const payloadWithDuration = {
            reference_id: payload.referenceId,
            user_id: payload.validUserId,
            full_name: payload.cleanName,
            email: payload.submissionEmail,
            whatsapp: payload.cleanWhatsapp || null,
            telegram: payload.cleanTelegram || null,
            plan: payload.requestedPlanSlug,
            plan_slug: payload.requestedPlanSlug,
            duration: payload.durationStr,
            message: payload.cleanMessage || null,
            status: 'pending',
            payment_verified: false,
          };

          const retryWithDuration = await supabase
            .from('plan_requests')
            .insert(payloadWithDuration);

          if (!retryWithDuration.error) {
            insertError = null;
          } else {
            insertError = retryWithDuration.error;
          }
        }

        if (isMissingColErr(insertError)) {
          console.warn(
            'Falling back to guaranteed core columns for plan_requests:',
            insertError?.message
          );

          const corePayload = {
            reference_id: payload.referenceId,
            user_id: payload.validUserId,
            full_name: payload.cleanName,
            email: payload.submissionEmail,
            whatsapp: payload.cleanWhatsapp || null,
            telegram: payload.cleanTelegram || null,
            plan: payload.requestedPlanSlug,
            plan_slug: payload.requestedPlanSlug,
            message: payload.cleanMessage || null,
            status: 'pending',
            payment_verified: false,
          };

          const retry = await supabase
            .from('plan_requests')
            .insert(corePayload);

          insertError = retry.error;
        }
      }

      if (insertError) {
        console.error('Plan request INSERT failed:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });

        setError(getDatabaseError(insertError));
        setIsWaitingForAdmin(false);
        setIsSubmitting(false);
        return;
      }

      const confirmedRequest = {
        ...fullPayload,
        reference_id: payload.referenceId,
        plan_slug: payload.requestedPlanSlug,
        duration: payload.durationStr,
        status: 'pending',
        payment_verified: false,
      } as unknown as PlanRequest;

      try {
        storage.savePlanRequest(confirmedRequest);
      } catch (storageError) {
        console.warn('Local request cache could not be saved:', storageError);
      }

      setIsWaitingForAdmin(false);
      setSubmittedRequest(confirmedRequest);
      onRequestSubmitted?.(confirmedRequest);
    } catch (err: unknown) {
      console.error('Plan request submission exception:', err);
      setError(
        err instanceof Error
          ? `Unable to submit request: ${err.message}`
          : 'Unable to submit the request. Check your connection and try again.'
      );
      setIsWaitingForAdmin(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync cardholder when profile loads
  useEffect(() => {
    if (profile?.display_name && !cardHolder) {
      setCardHolder(profile.display_name);
    }
  }, [profile]);

  const getPlanPrice = (plan: PlanSlug, interval: 'monthly' | 'yearly'): number => {
    if (plan === 'premium') {
      return interval === 'yearly' ? 75.99 : 20.99;
    }
    return interval === 'yearly' ? 50.99 : 5.99;
  };

  if (!isOpen) return null;

  const resetAndClose = () => {
    cancelAdminCountdown();
    setError(null);
    setTrackError(null);
    setSubmittedRequest(null);
    setTrackedResult(null);
    setTrackRefId('');
    setClaimModalError(null);
    setClaimSuccess(null);
    setAutoPaymentError(null);
    setCardNumber('');
    setCardCvv('');
    onClose();
  };

  const handleAutomaticPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setAutoPaymentError(null);

    if (!user?.id) {
      setAutoPaymentError(
        currentLang === 'so'
          ? 'Fadlan gal akoonkaaga si aad u bixiso xubinnimada.'
          : currentLang === 'ar'
          ? 'يُرجى تسجيل الدخول إلى حسابك لإتمام الدفع.'
          : 'Please sign in to your account to process your subscription payment.'
      );
      return;
    }

    const currentPrice = getPlanPrice(selectedPlan, billingInterval);

    if (autoPaymentOption === 'mobile_money') {
      const validation = validateSomaliMobileNumber(mobileNumber, mobileProvider, currentLang);
      if (!validation.isValid) {
        setAutoPaymentError(validation.error || 'Invalid mobile number.');
        return;
      }
    } else {
      if (!cardHolder.trim()) {
        setAutoPaymentError(
          currentLang === 'so'
            ? 'Fadlan geli magaca kaarka ku qoran.'
            : currentLang === 'ar'
            ? 'يُرجى إدخال اسم حامل البطاقة.'
            : 'Please enter the cardholder name.'
        );
        return;
      }
      const cardVal = validateCardNumber(cardNumber);
      if (!cardVal.isValid) {
        setAutoPaymentError(cardVal.error || 'Invalid card number.');
        return;
      }
      const expVal = validateCardExpiry(cardExpiry);
      if (!expVal.isValid) {
        setAutoPaymentError(expVal.error || 'Invalid expiration date.');
        return;
      }
      const isAmex = cardVal.brand === 'American Express';
      if (!validateCardCvv(cardCvv, isAmex)) {
        setAutoPaymentError(
          currentLang === 'so'
            ? `CVV/CVC waa inuu ahaadaa ${isAmex ? '4' : '3'} lambar.`
            : currentLang === 'ar'
            ? `يجب أن يتكون رمز الأمان من ${isAmex ? '4' : '3'} أرقام.`
            : `CVV/CVC must be ${isAmex ? '4' : '3'} digits.`
        );
        return;
      }
      if (!billingAddress.trim() || !billingCity.trim() || !billingCountry.trim()) {
        setAutoPaymentError(
          currentLang === 'so'
            ? 'Fadlan buuxi dhammaan cinwaanka biilka (cinwaanka, magaalada, dalka).'
            : currentLang === 'ar'
            ? 'يُرجى إكمال جميع بيانات عنوان الفوترة (العنوان، المدينة، البلد).'
            : 'Please complete all billing address fields (address, city, country).'
        );
        return;
      }
      if (!acceptTerms) {
        setAutoPaymentError(
          currentLang === 'so'
            ? 'Fadlan aqbal shuruudaha biil bixinta si aad u sii wadato.'
            : currentLang === 'ar'
            ? 'يُرجى الموافقة على شروط الفوترة للمتابعة.'
            : 'Please accept the billing terms and conditions to proceed.'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const refId = `TX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const maskedId = autoPaymentOption === 'mobile_money'
        ? maskPhoneNumber(`+252${mobileNumber}`)
        : maskCardNumber(cardNumber);
      const cardBrandDetected = autoPaymentOption === 'card'
        ? validateCardNumber(cardNumber).brand
        : undefined;
      const operatorDetected = autoPaymentOption === 'mobile_money'
        ? detectSomaliOperator(mobileNumber).operator
        : undefined;

      const txRecord: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        reference_id: refId,
        user_id: user.id,
        plan_slug: selectedPlan,
        billing_interval: billingInterval,
        payment_method: autoPaymentOption,
        payment_option: autoPaymentOption === 'mobile_money' ? mobileProvider : 'card',
        mobile_operator: operatorDetected,
        mobile_provider: autoPaymentOption === 'mobile_money' ? mobileProvider : undefined,
        masked_identifier: maskedId,
        card_brand: cardBrandDetected,
        amount: currentPrice,
        currency: 'USD',
        status: 'failed',
        failure_reason: 'merchant_gateway_unconfigured',
        metadata: {
          attempted_at: new Date().toISOString(),
          payment_mode: 'automatic',
          city: billingCity || undefined,
          country: billingCountry || undefined,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.rpc('record_payment_transaction', {
            p_reference_id: txRecord.reference_id,
            p_plan_slug: txRecord.plan_slug,
            p_billing_interval: txRecord.billing_interval,
            p_payment_method: txRecord.payment_method,
            p_payment_option: txRecord.payment_option,
            p_mobile_operator: txRecord.mobile_operator,
            p_mobile_provider: txRecord.mobile_provider,
            p_masked_identifier: txRecord.masked_identifier,
            p_card_brand: txRecord.card_brand,
            p_amount: txRecord.amount,
            p_currency: txRecord.currency,
            p_status: txRecord.status,
            p_failure_reason: txRecord.failure_reason,
            p_metadata: txRecord.metadata,
          });
        } catch (dbErr) {
          console.warn('[PlanRequestModal] Supabase record_payment_transaction fallback:', dbErr);
        }
      }

      storage.savePaymentTransaction(txRecord);

      // Sensitive card details wiped immediately
      setCardNumber('');
      setCardCvv('');

      // Show exact required localized error message
      setAutoPaymentError(getAutomaticPaymentFailedMessage(currentLang));
    } catch (err: any) {
      console.error('[PlanRequestModal] Automatic payment error:', err);
      setAutoPaymentError(getAutomaticPaymentFailedMessage(currentLang));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanWhatsapp = whatsapp.trim();
    const cleanTelegram = telegram.trim();
    const cleanMessage = message.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!emailIsValid(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!cleanWhatsapp && !cleanTelegram) {
      setError('Please provide a WhatsApp number or Telegram username.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Obtain live authenticated user directly from Supabase Auth
      let liveUserId: string | null = null;
      let submissionEmail = cleanEmail;

      if (isSupabaseConfigured) {
        try {
          const { data: authData, error: authErr } = await supabase.auth.getUser();
          if (!authErr && authData?.user?.id && isUuid(authData.user.id)) {
            liveUserId = authData.user.id;
            // Always bind to the authenticated user's verified email if logged in
            if (authData.user.email) {
              submissionEmail = authData.user.email.trim().toLowerCase();
            }
          }
        } catch (authFetchErr) {
          console.warn('[PlanRequestModal] Could not fetch live auth user:', authFetchErr);
        }
      }

      // Fallback to AuthContext user if live check was null/failed but context has valid user
      if (!liveUserId && user?.id && isUuid(user.id)) {
        liveUserId = user.id;
        if (user.email) {
          submissionEmail = user.email.trim().toLowerCase();
        }
      }

      if (!liveUserId) {
        setError('You must be signed in to submit an upgrade request. Please sign in or create an account first.');
        setIsSubmitting(false);
        return;
      }

      const referenceId = storage.generateReferenceId();
      const validUserId = liveUserId;

      // Prevent duplicate or conflicting active requests
      if (isSupabaseConfigured && (validUserId || submissionEmail)) {
        try {
          let dupQuery = supabase
            .from('plan_requests')
            .select('reference_id, plan, plan_slug, status')
            .in('status', ['pending', 'under_review', 'approved']);

          if (validUserId) {
            dupQuery = dupQuery.eq('user_id', validUserId);
          } else {
            dupQuery = dupQuery.eq('email', submissionEmail);
          }

          const { data: existingActive } = await dupQuery.limit(1).maybeSingle();
          if (existingActive) {
            const existingPlan = (existingActive.plan_slug || existingActive.plan || 'pro').toUpperCase();
            setError(
              `You already have an active ${existingPlan} request (${existingActive.reference_id}) with status "${existingActive.status}". Please track your existing request or wait for review.`
            );
            setIsSubmitting(false);
            return;
          }
        } catch (dupErr) {
          console.warn('[PlanRequestModal] Duplicate check skipped:', dupErr);
        }
      }

      // Normalize requested plan strictly to 'pro' or 'premium'
      const requestedPlanSlug = selectedPlan === 'premium' ? 'premium' : 'pro';
      const durationStr = billingInterval === 'yearly' ? '1 year' : '1 month';

      // Determine authoritative price based on plan and billing interval:
      // AI Pro: $5.99/mo, $50.99/yr
      // AI Premium: $20.99/mo, $75.99/yr
      const calculatedPrice =
        requestedPlanSlug === 'premium'
          ? billingInterval === 'yearly'
            ? 75.99
            : 20.99
          : billingInterval === 'yearly'
          ? 50.99
          : 5.99;

      const fullPayload = {
        reference_id: referenceId,
        user_id: validUserId,
        full_name: cleanName,
        email: submissionEmail,
        whatsapp: cleanWhatsapp || null,
        telegram: cleanTelegram || null,
        plan: requestedPlanSlug,
        plan_slug: requestedPlanSlug,
        billing_interval: billingInterval,
        duration: durationStr,
        price_amount: calculatedPrice,
        currency: 'USD',
        message: cleanMessage || null,
        status: 'pending',
        payment_verified: false,
      };

      // Launch interactive 60-second administrative countdown before final dispatch
      const pendingPayload = {
        referenceId,
        validUserId,
        cleanName,
        submissionEmail,
        cleanWhatsapp,
        cleanTelegram,
        requestedPlanSlug,
        billingInterval,
        durationStr,
        calculatedPrice,
        cleanMessage,
      };

      setIsSubmitting(false);
      startAdminCountdown(pendingPayload);
    } catch (err: unknown) {
      console.error('Plan request submission exception:', err);

      setError(
        err instanceof Error
          ? `Unable to submit request: ${err.message}`
          : 'Unable to submit the request. Check your connection and try again.'
      );
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = async () => {
    if (!submittedRequest) return;

    try {
      await navigator.clipboard.writeText(submittedRequest.reference_id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Unable to copy reference ID:', err);
      setError('Could not copy the reference ID. Please copy it manually.');
    }
  };

  const runSearch = async (refInput: string) => {
    const referenceId = refInput.trim().toUpperCase();

    if (!referenceId) return;

    setIsSearchingTrack(true);
    setTrackedResult(null);
    setTrackError(null);
    setClaimModalError(null);
    setClaimSuccess(null);

    try {
      if (isSupabaseConfigured) {
        let rowData: any = null;

        // 1. First try secure RPC if installed (handles RLS cleanly for anon applicants)
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_plan_request_status',
            { p_reference_id: referenceId }
          );
          if (!rpcError && rpcData) {
            rowData = rpcData;
          } else if (rpcError && rpcError.code !== 'PGRST202' && rpcError.code !== '42883') {
            console.warn('[PlanRequestModal] get_plan_request_status note:', rpcError);
          }
        } catch (rpcEx) {
          console.warn('[PlanRequestModal] RPC exception:', rpcEx);
        }

        // 2. Fetch matching row from public.plan_requests using exact reference_id
        if (!rowData) {
          let { data, error: searchError } = await supabase
            .from('plan_requests')
            .select(
              'reference_id, plan, plan_slug, status, payment_verified, duration, billing_interval, created_at, approved_at, offer_expires_at, claimed_at'
            )
            .eq('reference_id', referenceId)
            .maybeSingle();

          // Graceful fallback to guaranteed baseline columns if extended columns (e.g. duration) are not in the schema cache
          if (
            searchError &&
            (searchError.code === '42703' ||
              searchError.code === 'PGRST204' ||
              (typeof searchError.message === 'string' &&
                (searchError.message.includes('column') ||
                  searchError.message.includes('schema cache'))))
          ) {
            console.warn(
              '[PlanRequestModal] Falling back to baseline select columns:',
              searchError.message
            );
            const baselineSearch = await supabase
              .from('plan_requests')
              .select(
                'reference_id, plan, plan_slug, status, payment_verified, created_at'
              )
              .eq('reference_id', referenceId)
              .maybeSingle();

            data = baselineSearch.data as any;
            searchError = baselineSearch.error;
          }

          if (searchError) {
            console.error('Request tracking failed:', {
              code: searchError.code,
              message: searchError.message,
            });

            // Requirement 5: Never display "Reference ID not found" when the actual issue is a database permission error or network failure
            setTrackError(getDatabaseError(searchError));
            return;
          }

          if (data) {
            rowData = data;
          }
        }

        // 3. Fallback to public tracking view if available
        if (!rowData) {
          try {
            const { data: viewData, error: viewError } = await supabase
              .from('plan_request_tracking')
              .select(
                'reference_id, plan, plan_slug, status, payment_verified, created_at'
              )
              .eq('reference_id', referenceId)
              .maybeSingle();
            if (!viewError && viewData) {
              rowData = viewData;
            }
          } catch {
            // view optional fallback
          }
        }

        if (rowData) {
          // Select and display actual status, plan, and plan_slug returned by Supabase
          const planVal = (rowData.plan_slug || rowData.plan || 'pro') as PlanSlug;
          const isAnnual = isAnnualBillingInterval(rowData.billing_interval) || rowData.duration === '1 year';
          const durationVal = rowData.duration || (isAnnual ? '1 year' : '1 month');
          const isOwner = Boolean(
            (user?.id && rowData.user_id === user.id) ||
            (user?.email && rowData.email && rowData.email.toLowerCase() === user.email.toLowerCase()) ||
            rowData.is_owner
          );
          const normalized: PlanRequest = {
            id: (rowData as any).id || rowData.reference_id,
            reference_id: rowData.reference_id,
            plan_slug: planVal,
            plan: (rowData.plan || planVal) as PlanSlug,
            duration: durationVal,
            billing_interval: rowData.billing_interval || (isAnnual ? 'yearly' : 'monthly'),
            status: rowData.status as PlanRequestStatus,
            payment_verified: Boolean(rowData.payment_verified),
            has_registered_account:
              rowData.has_registered_account !== undefined
                ? Boolean(rowData.has_registered_account)
                : undefined,
            is_active:
              rowData.is_active !== undefined
                ? Boolean(rowData.is_active)
                : (rowData.status === 'claimed'),
            activation_state: rowData.activation_state,
            created_at: rowData.created_at,
            approved_at: rowData.approved_at,
            offer_expires_at: rowData.offer_expires_at,
            claimed_at: rowData.claimed_at,
            is_owner: isOwner,
            can_claim: (rowData.status === 'approved') && (isOwner || !rowData.user_id),
          } as PlanRequest;

          setTrackedResult(normalized);

          // Update local cache with verified latest state from Supabase
          try {
            storage.savePlanRequest(normalized);
          } catch (storageErr) {
            console.warn('Local cache sync skipped:', storageErr);
          }
          return;
        }

        // Check local storage backup if not found remotely
        const localRequest = storage.getPlanRequestByReference(referenceId);
        if (localRequest) {
          const isOwner = Boolean(
            (user?.id && localRequest.user_id === user.id) ||
            (user?.email && localRequest.email && localRequest.email.toLowerCase() === user.email.toLowerCase()) ||
            !localRequest.user_id
          );
          setTrackedResult({
            ...localRequest,
            duration: localRequest.duration || (isAnnualBillingInterval(localRequest.billing_interval) ? '1 year' : '1 month'),
            is_owner: isOwner,
            can_claim: (localRequest.status === 'approved') && isOwner,
            admin_notes: undefined,
          });
          return;
        }

        // Supabase query returned no matching row
        // Never default missing data or query errors to Pending
        setTrackedResult('not_found');
        return;
      }

      // Offline fallback only when Supabase is not configured
      const localRequest = storage.getPlanRequestByReference(referenceId);

      if (localRequest) {
        const isOwner = Boolean(
          (user?.id && localRequest.user_id === user.id) ||
          (user?.email && localRequest.email && localRequest.email.toLowerCase() === user.email.toLowerCase()) ||
          !localRequest.user_id
        );
        setTrackedResult({
          ...localRequest,
          duration: localRequest.duration || (isAnnualBillingInterval(localRequest.billing_interval) ? '1 year' : '1 month'),
          is_owner: isOwner,
          can_claim: (localRequest.status === 'approved') && isOwner,
          admin_notes: undefined,
        });
      } else {
        setTrackedResult('not_found');
      }
    } catch (err: unknown) {
      console.error('Request tracking exception:', err);
      setTrackError(
        err instanceof Error
          ? err.message
          : 'A connection error occurred while checking your request.'
      );
    } finally {
      setIsSearchingTrack(false);
    }
  };

  const handleTrackSearch = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const referenceId = trackRefId.trim().toUpperCase();
    if (!referenceId || isSearchingTrack) return;
    await runSearch(referenceId);
  };

  const handleModalClaimOffer = async () => {
    if (!trackedResult || trackedResult === 'not_found' || isClaimingModal) return;

    if (!user) {
      setClaimModalError('Please sign in to your EMufti AI account to claim your offer.');
      return;
    }

    setIsClaimingModal(true);
    setClaimModalError(null);

    const refId = trackedResult.reference_id;
    const planName = getPlanLabel(trackedResult.plan_slug || trackedResult.plan).toUpperCase();
    const durationLabel = trackedResult.duration || (isAnnualBillingInterval(trackedResult.billing_interval) ? '1 year' : '1 month');

    try {
      if (isSupabaseConfigured) {
        let claimData: any = null;
        let claimRpcError: any = null;

        const res1 = await supabase.rpc('claim_plan_offer', {
          p_reference_id: refId,
        });

        if (res1.error && (res1.error.code === 'PGRST202' || res1.error.message?.includes('schema cache') || res1.error.message?.includes('Could not find the function'))) {
          console.warn('[PlanRequestModal] p_reference_id RPC not found in schema cache. Trying reference_id signature...');
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
          console.warn('[PlanRequestModal] Remote claim_plan_offer RPC not found in schema cache. Running seamless client-side activation fallback...');
          const localClaim = storage.claimPlanOffer(refId, user.id, user.email);
          if (localClaim.success) {
            const confirmedPlan: PlanSlug = normalizePlanSlug(localClaim.plan || planName);
            const confirmedDuration = localClaim.duration || durationLabel;
            const activatedAt = localClaim.activated_at || new Date().toISOString();
            const expiresAt = localClaim.expires_at || calculateExpirationDate(activatedAt, isAnnualBillingInterval(localClaim.billing_interval || confirmedDuration));

            try {
              await supabase.from('profiles').update({
                plan: confirmedPlan,
                plan_activated_at: activatedAt,
                updated_at: new Date().toISOString(),
              }).eq('id', user.id);
            } catch (e) {
              console.warn('[PlanRequestModal] Direct profile update fallback notice:', e);
            }

            setClaimSuccess({
              plan: confirmedPlan,
              duration: confirmedDuration,
              durationSomali: localClaim.duration_somali,
              activatedAt,
              expiresAt,
              message: localClaim.message || `Hambalyo! Waxaad heshay qorshaha ${formatPlanName(confirmedPlan)}.`,
            });

            setTrackedResult((prev) => (prev && prev !== 'not_found' ? {
              ...prev,
              status: 'claimed',
              is_active: true,
              can_claim: false,
              claimed_at: activatedAt,
              expires_at: expiresAt,
            } : prev));

            if (user?.id) {
              storage.setUserActivePlan(user.id, confirmedPlan);
            }
            await refreshProfile();
            return;
          }
        }

        if (claimRpcError) {
          console.error('[PlanRequestModal] Claim RPC failed:', claimRpcError);
          setClaimModalError(claimRpcError.message || 'Failed to claim offer.');
          setIsClaimingModal(false);
          return;
        }

        if (!claimData || !claimData.success) {
          setClaimModalError(claimData?.error || 'Database did not confirm offer claim.');
          setIsClaimingModal(false);
          return;
        }

        const confirmedPlan: PlanSlug = normalizePlanSlug(claimData.plan || planName);
        const confirmedDuration = claimData.duration || durationLabel;
        const activatedAt = claimData.activated_at || new Date().toISOString();
        const expiresAt = claimData.expires_at || calculateExpirationDate(activatedAt, isAnnualBillingInterval(claimData.billing_interval || confirmedDuration));

        setClaimSuccess({
          plan: confirmedPlan,
          duration: confirmedDuration,
          durationSomali: claimData.duration_somali,
          activatedAt,
          expiresAt,
          message: claimData.message || `Hambalyo! Waxaad heshay qorshaha ${formatPlanName(confirmedPlan)}.`,
        });

        setTrackedResult((prev) => (prev && prev !== 'not_found' ? {
          ...prev,
          status: 'claimed',
          is_active: true,
          can_claim: false,
          claimed_at: activatedAt,
          expires_at: expiresAt,
        } : prev));
        if (user?.id) {
          storage.setUserActivePlan(user.id, confirmedPlan);
        }
        await refreshProfile();
        return;
      }

      // Offline / Local storage fallback
      const localClaim = storage.claimPlanOffer(refId, user.id, user.email);
      if (!localClaim.success) {
        setClaimModalError(localClaim.error || 'Failed to claim offer locally.');
        setIsClaimingModal(false);
        return;
      }

      const confirmedPlan: PlanSlug = normalizePlanSlug(localClaim.plan || planName);
      const confirmedDuration = localClaim.duration || durationLabel;
      const activatedAt = localClaim.activated_at || new Date().toISOString();
      const expiresAt = localClaim.expires_at || calculateExpirationDate(activatedAt, isAnnualBillingInterval(localClaim.billing_interval || confirmedDuration));

      setClaimSuccess({
        plan: confirmedPlan,
        duration: confirmedDuration,
        durationSomali: localClaim.duration_somali,
        activatedAt,
        expiresAt,
        message: localClaim.message || `Hambalyo! Waxaad heshay qorshaha ${formatPlanName(confirmedPlan)}.`,
      });

      setTrackedResult((prev) => (prev && prev !== 'not_found' ? {
        ...prev,
        status: 'claimed',
        is_active: true,
        can_claim: false,
        claimed_at: activatedAt,
        expires_at: expiresAt,
      } : prev));
      if (user?.id) {
        storage.setUserActivePlan(user.id, confirmedPlan);
      }
      await refreshProfile();
    } catch (err: any) {
      console.error('[PlanRequestModal] Claim exception:', err);
      setClaimModalError(err?.message || 'Error occurred while claiming offer.');
    } finally {
      setIsClaimingModal(false);
    }
  };

  const renderStatusBadge = (
    status: PlanRequestStatus,
    activationState?: PlanActivationState
  ) => {
    const common =
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border';

    if (activationState === 'active') {
      return (
        <span className={`${common} bg-blue-500/10 text-blue-600 border-blue-500/20`}>
          <Check className="w-3 h-3" />
          Active
        </span>
      );
    }

    if (activationState === 'awaiting_registration') {
      return (
        <span className={`${common} bg-amber-500/10 text-amber-600 border-amber-500/20`}>
          <Clock className="w-3 h-3" />
          Awaiting Registration
        </span>
      );
    }

    if (activationState === 'payment_pending') {
      return (
        <span className={`${common} bg-amber-500/10 text-amber-600 border-amber-500/20`}>
          <Clock className="w-3 h-3" />
          Payment Pending
        </span>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <span className={`${common} bg-amber-500/10 text-amber-600 border-amber-500/20`}>
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );

      case 'under_review':
        return (
          <span className={`${common} bg-blue-500/10 text-blue-600 border-blue-500/20`}>
            <Search className="w-3 h-3" />
            Under Review
          </span>
        );

      case 'approved':
        return (
          <span className={`${common} bg-blue-500/10 text-blue-600 border-blue-500/20`}>
            <Check className="w-3 h-3" />
            Approved
          </span>
        );

      case 'completed':
        return (
          <span className={`${common} bg-blue-600/15 text-blue-700 border-blue-500/30`}>
            <ShieldCheck className="w-3 h-3" />
            Completed
          </span>
        );

      case 'claimed':
        return (
          <span className={`${common} bg-blue-600/15 text-blue-700 border-blue-500/30`}>
            <Sparkles className="w-3 h-3" />
            Claimed
          </span>
        );

      case 'expired':
        return (
          <span className={`${common} bg-muted text-muted-foreground border-border`}>
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );

      case 'rejected':
        return (
          <span className={`${common} bg-destructive/10 text-destructive border-destructive/20`}>
            <X className="w-3 h-3" />
            Rejected
          </span>
        );

      default:
        return (
          <span className={`${common} bg-muted text-muted-foreground border-border`}>
            Unknown Status
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 w-full max-w-full box-border overflow-y-auto">
      <div className="relative flex max-h-[92vh] sm:max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-2xl box-border">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-4 py-3.5 sm:px-6 sm:py-5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Sparkles className="h-4 w-4 text-blue-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                {activeTab === 'request'
                  ? (currentLang === 'so' ? 'Kor u Qaad Qorshaha' : currentLang === 'ar' ? 'ترقية الباقة' : 'Upgrade Plan')
                  : (currentLang === 'so' ? 'La Soco Dalabka Kor u Qaadista' : currentLang === 'ar' ? 'تتبع طلب الترقية' : 'Track Upgrade Request')}
              </h3>
              <p className="text-[11px] text-blue-100/80">
                {currentLang === 'so'
                  ? 'Hawlgelin degdeg ah iyo xaqiijin rasmi ah'
                  : currentLang === 'ar'
                  ? 'تفعيل فوري ووصول موثق للحساب'
                  : 'Instant activation & verified account access'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-xl p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!submittedRequest && !isWaitingForAdmin && (
          <div className="flex border-b border-border bg-muted/40 px-3 sm:px-6 pt-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setActiveTab('request');
                setError(null);
                setTrackError(null);
              }}
              className={`border-b-2 px-3 pb-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'request'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {currentLang === 'so' ? 'Gudbi Dalabka Kor u Qaadista' : currentLang === 'ar' ? 'تقديم طلب الترقية' : 'Submit Upgrade'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('track');
                setError(null);
                setTrackError(null);
              }}
              className={`border-b-2 px-3 pb-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'track'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {currentLang === 'so' ? 'La Soco Dalabka' : currentLang === 'ar' ? 'تتبع الطلب' : 'Track Upgrade Status'}
            </button>
          </div>
        )}

        <div className="space-y-4 sm:space-y-5 overflow-y-auto p-4 sm:p-6">
          {isWaitingForAdmin ? (
            /* ============================================================= */
            /* 60-SECOND WAITING & SUBMISSION ANIMATION TO ADMIN             */
            /* ============================================================= */
            <div className="space-y-6 py-4 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Circular Countdown Ring with Animated Pulse */}
              <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
                {/* Outer pulsing glow ring */}
                <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-md animate-pulse" />

                {/* SVG Circular Progress */}
                <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 144 144">
                  {/* Track circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-800"
                    fill="transparent"
                  />
                  {/* Animated Progress Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="url(#admin-timer-gradient)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - (60 - adminCountdown) / 60)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id="admin-timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="50%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Countdown numbers in center */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    {adminCountdown}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {currentLang === 'so' ? 'Ilbiriqsi' : currentLang === 'ar' ? 'ثانية' : 'Seconds'}
                  </span>
                </div>
              </div>

              {/* Dynamic Status Title and Description */}
              {(() => {
                const statusInfo = getCountdownStatusMessage(adminCountdown);
                return (
                  <div className="space-y-2 px-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/25">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Tallaabada {statusInfo.step} ee 4</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-foreground">
                      {statusInfo.title}
                    </h4>
                    <p className="mx-auto max-w-sm text-xs text-muted-foreground leading-relaxed">
                      {statusInfo.desc}
                    </p>
                  </div>
                );
              })()}

              {/* Linear Progress Bar */}
              <div className="mx-auto max-w-sm space-y-1.5 px-2">
                <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                  <span>{currentLang === 'so' ? 'Gudbinta Maamulka' : currentLang === 'ar' ? 'إرسال الطلب للإدارة' : 'Admin Dispatch Progress'}</span>
                  <span className="font-mono font-bold text-blue-600">
                    {Math.round(((60 - adminCountdown) / 60) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-1000 ease-linear shadow-sm"
                    style={{ width: `${((60 - adminCountdown) / 60) * 100}%` }}
                  />
                </div>
              </div>

              {/* Status Milestone Pills */}
              <div className="mx-auto grid max-w-md grid-cols-2 gap-2 text-left px-1">
                <div className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2 ${
                  adminCountdown <= 60 ? 'border-blue-500/30 bg-blue-500/5 text-foreground' : 'border-border bg-card text-muted-foreground'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    adminCountdown <= 45 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 animate-pulse'
                  }`}>
                    {adminCountdown <= 45 ? <Check className="w-3 h-3" /> : '1'}
                  </div>
                  <span className="text-[11px] font-medium truncate">Xaqiijinta Xogta</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2 ${
                  adminCountdown <= 45 ? 'border-blue-500/30 bg-blue-500/5 text-foreground' : 'border-border bg-card text-muted-foreground'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    adminCountdown <= 30 ? 'bg-blue-600 text-white' : adminCountdown <= 45 ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {adminCountdown <= 30 ? <Check className="w-3 h-3" /> : '2'}
                  </div>
                  <span className="text-[11px] font-medium truncate">Xiriirka Maamulka</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2 ${
                  adminCountdown <= 30 ? 'border-blue-500/30 bg-blue-500/5 text-foreground' : 'border-border bg-card text-muted-foreground'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    adminCountdown <= 15 ? 'bg-blue-600 text-white' : adminCountdown <= 30 ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {adminCountdown <= 15 ? <Check className="w-3 h-3" /> : '3'}
                  </div>
                  <span className="text-[11px] font-medium truncate">Diiwaangelinta Koodhka</span>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2 ${
                  adminCountdown <= 15 ? 'border-blue-500/30 bg-blue-500/5 text-foreground' : 'border-border bg-card text-muted-foreground'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    adminCountdown <= 0 ? 'bg-blue-600 text-white' : adminCountdown <= 15 ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {adminCountdown <= 0 ? <Check className="w-3 h-3" /> : '4'}
                  </div>
                  <span className="text-[11px] font-medium truncate">Dhammaystirka Dirista</span>
                </div>
              </div>

              {/* Expedite / Fast-track & Cancel Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 px-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={finalizeAdminDispatch}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] py-2.5 px-4 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Diiwaangelinayaa...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{currentLang === 'so' ? 'Gudbi Hadda (Dhammaystir Hadda)' : currentLang === 'ar' ? 'إرسال فوري الآن' : 'Fast-Track / Dispatch Now'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={cancelAdminCountdown}
                  className="rounded-xl border border-border bg-card py-2.5 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {currentLang === 'so' ? 'Jooji Dalabka' : currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : submittedRequest ? (
            <div className="space-y-5 py-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600">
                <Check className="h-7 w-7" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-foreground">
                  Upgrade Request Received!
                </h4>
                <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                  Jazakallahu Khayran. Your request for the{' '}
                  <span className="font-semibold capitalize text-blue-600">
                    {submittedRequest.plan_slug || submittedRequest.plan} Plan ({isAnnualBillingInterval(submittedRequest.billing_interval) ? 'Annual – 1 Year (365 Days)' : 'Monthly – 1 Month (30 Days)'})
                  </span>{' '}
                  amounting to <strong className="text-foreground">${submittedRequest.price_amount ? Number(submittedRequest.price_amount).toFixed(2) : (submittedRequest.plan_slug === 'premium' ? '20.99' : '5.99')} USD</strong> has been recorded.
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/80 bg-muted/50 p-4 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Tracking Reference
                </span>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5">
                  <span className="break-all font-mono text-sm font-bold tracking-wide text-foreground">
                    {submittedRequest.reference_id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="ml-2 flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-500/20"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Please save your unique tracking code. You will need it to track your approval status and claim your offer.
                </p>
                {error && (
                  <p role="alert" className="text-xs text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <div className="space-y-2 rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4 text-left text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  What happens next?
                </div>
                <ol className="list-inside list-decimal space-y-1 text-[11px] leading-relaxed">
                  <li>Our team reviews your request.</li>
                  <li>We contact you using your supplied contact details.</li>
                  <li>Once approved, you can enter your code in the Track tab to claim and activate your subscription.</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`${OFFICIAL_WHATSAPP_LINK}?text=${encodeURIComponent(
                    `Asc, waxaan codsaday kor u qaadista qorshaha ${(submittedRequest.plan_slug || submittedRequest.plan || '').toUpperCase()}. Koodhka dalabkaygu waa ${submittedRequest.reference_id}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Support</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const code = submittedRequest.reference_id;
                    setSubmittedRequest(null);
                    setActiveTab('track');
                    setTrackRefId(code);
                    runSearch(code);
                  }}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Track Request Status</span>
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-xl border border-border bg-card py-2.5 px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
                >
                  Return to Learning
                </button>
              </div>
            </div>
          ) : activeTab === 'request' ? (
            <form onSubmit={paymentMethod === 'automatic' ? handleAutomaticPayment : handleSubmit} className="space-y-4">
              {error && paymentMethod === 'manual' && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              {!user && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Account Required to Request Upgrades
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        Please sign in or create an account before requesting an upgrade so your subscription can be activated for your profile.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetAndClose();
                        navigate(`/login?redirect=/pricing&action=upgrade&plan=${selectedPlan}&interval=${billingInterval}`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetAndClose();
                        navigate(`/signup?redirect=/pricing&action=upgrade&plan=${selectedPlan}&interval=${billingInterval}`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Method Switcher: Method 1 vs Method 2 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Habka Lacag-Bixinta (Payment Method)</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    2 Xulasho ayaa Diyaar ah
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('manual');
                      setError(null);
                      setAutoPaymentError(null);
                    }}
                    className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer ${
                      paymentMethod === 'manual'
                        ? 'border-blue-600 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-indigo-500/10 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10 animate-pulse-glow'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/70 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                          paymentMethod === 'manual' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                        }`}>
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            {getTranslation(currentLang, 'payment.method_1', 'Method 1 — Manual Verification')}
                          </span>
                        </div>
                      </div>
                      {paymentMethod === 'manual' && (
                        <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full shrink-0 shadow-xs animate-in fade-in">
                          Dooran
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pl-9">
                      {getTranslation(currentLang, 'payment.method_1_sub', 'WhatsApp & Telegram coordinator verification')}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('automatic');
                      setError(null);
                      setAutoPaymentError(null);
                    }}
                    className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer ${
                      paymentMethod === 'automatic'
                        ? 'border-blue-600 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-indigo-500/10 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10 animate-pulse-glow'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/70 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                          paymentMethod === 'automatic' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                        }`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            {getTranslation(currentLang, 'payment.method_2', 'Method 2 — Automatic Payment')}
                          </span>
                        </div>
                      </div>
                      {paymentMethod === 'automatic' && (
                        <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full shrink-0 shadow-xs animate-in fade-in">
                          Dooran
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pl-9">
                      {getTranslation(currentLang, 'payment.method_2_sub', 'Instant activation via Mobile Money or Card')}
                    </p>
                  </button>
                </div>
              </div>

              {/* Billing Interval Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Muddada Biilka (Billing Duration)</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    Sanadleed: Qiimo Dhimis 30%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setBillingInterval('monthly')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-95 ${
                      billingInterval === 'monthly'
                        ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-500/20 dark:bg-slate-900 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Billeed (30 Days)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingInterval('yearly')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 relative ${
                      billingInterval === 'yearly'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-500'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Sanadleed (365 Days)</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider animate-pulse ${
                      billingInterval === 'yearly'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'bg-blue-600 text-white'
                    }`}>
                      Save 30%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dooro Qorshaha (Select Plan)</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Biyo-dhaca adeegyada AI & Quran
                  </span>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('pro')}
                    aria-pressed={selectedPlan === 'pro'}
                    className={`group relative rounded-2xl border p-3.5 text-left transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer ${
                      selectedPlan === 'pro'
                        ? 'border-blue-600 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/5 ring-2 ring-blue-500 shadow-lg shadow-blue-500/15 animate-pulse-glow'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-extrabold text-foreground">
                          Talib (Pro)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-600">
                          ${billingInterval === 'yearly' ? '50.99' : '5.99'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium block">
                          {billingInterval === 'yearly' ? '/sanad' : '/bil'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] leading-snug text-muted-foreground">
                      150 AI queries/day · Includes <strong>Quran Pro</strong> bundled · Qaari · Subcis
                    </p>
                    {selectedPlan === 'pro' && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Qorshe Doortay</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan('premium')}
                    aria-pressed={selectedPlan === 'premium'}
                    className={`group relative rounded-2xl border p-3.5 text-left transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer ${
                      selectedPlan === 'premium'
                        ? 'border-blue-600 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/5 ring-2 ring-blue-500 shadow-lg shadow-blue-500/15 animate-pulse-glow'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />
                        <span>Ugu Fiican</span>
                      </span>
                    </div>

                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-extrabold text-foreground">
                          Alim (Premium)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-600">
                          ${billingInterval === 'yearly' ? '75.99' : '20.99'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium block">
                          {billingInterval === 'yearly' ? '/sanad' : '/bil'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] leading-snug text-muted-foreground">
                      1,000 AI queries/day · Includes <strong>Quran Premium</strong> bundled · Scholars Tafsir
                    </p>
                    {selectedPlan === 'premium' && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Qorshe Doortay</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* METHOD 1 — MANUAL VERIFICATION */}
              {paymentMethod === 'manual' ? (
                <>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="plan-full-name" className="text-xs font-semibold text-foreground">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="plan-full-name"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={120}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ahmed Nur"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="plan-email" className="text-xs font-semibold text-foreground">
                          Email Address *
                        </label>
                        {user?.email && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Account Email</span>
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="plan-email"
                          type="email"
                          autoComplete="email"
                          required
                          disabled={Boolean(user?.email)}
                          maxLength={254}
                          value={user?.email || email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seeker@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-foreground">
                        Contact Details *
                      </label>
                      <span className="text-[10px] font-medium text-blue-600">
                        At least one required
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                        <input
                          type="tel"
                          autoComplete="tel"
                          maxLength={40}
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="WhatsApp number (+252...)"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Send className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                        <input
                          type="text"
                          maxLength={100}
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                          placeholder="Telegram username (@username)"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] leading-normal text-muted-foreground">
                      Our coordinators will use your provided contact details to follow up on your request.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="plan-message" className="text-xs font-semibold text-foreground">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="plan-message"
                      rows={3}
                      maxLength={2000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your study needs..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {/* Order & Verification Summary */}
                  <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>Order Summary</span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
                        {billingInterval === 'yearly' ? '365 Days' : '30 Days'} Access
                      </span>
                    </div>
                    <div className="space-y-1 text-muted-foreground text-[11px]">
                      <div className="flex justify-between">
                        <span>Requested Tier:</span>
                        <strong className="text-foreground">
                          {selectedPlan === 'premium' ? 'Alim (Premium)' : 'Talib al-Ilm (Pro)'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Quran Entitlement:</span>
                        <strong className="text-blue-600 dark:text-blue-400">
                          {selectedPlan === 'premium' ? 'Quran Premium Included' : 'Quran Pro Included'}
                        </strong>
                      </div>
                      <div className="flex justify-between border-t border-border/80 pt-1 text-xs">
                        <span className="font-semibold text-foreground">Verification Amount:</span>
                        <strong className="text-foreground text-sm font-extrabold text-blue-600">
                          ${selectedPlan === 'premium' ? (billingInterval === 'yearly' ? '75.99' : '20.99') : (billingInterval === 'yearly' ? '50.99' : '5.99')} USD
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !user}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition-colors hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <span>{currentLang === 'so' ? 'Waa la gudbinayaa...' : currentLang === 'ar' ? 'جاري إرسال الطلب...' : 'Submitting Upgrade...'}</span>
                    ) : !user ? (
                      <span>{currentLang === 'so' ? 'Soo gal si aad u kor u qaaddo' : currentLang === 'ar' ? 'سجل الدخول للترقية' : 'Sign In to Upgrade'}</span>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{currentLang === 'so' ? 'Gudbi Dalabka Kor u Qaadista' : currentLang === 'ar' ? 'إرسال طلب الترقية' : 'Submit Upgrade'}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* METHOD 2 — AUTOMATIC PAYMENT */
                <div className="space-y-4">
                  {/* Automatic Payment Sub-options: Mobile Money vs Card */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Automatic Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-xl border border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setAutoPaymentOption('mobile_money');
                          setAutoPaymentError(null);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          autoPaymentOption === 'mobile_money'
                            ? 'bg-card text-blue-600 shadow-xs ring-1 ring-blue-500/30'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{getTranslation(currentLang, 'payment.mobile_money', 'Mobile Money')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoPaymentOption('card');
                          setAutoPaymentError(null);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          autoPaymentOption === 'card'
                            ? 'bg-card text-blue-600 shadow-xs ring-1 ring-blue-500/30'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{getTranslation(currentLang, 'payment.card', 'Credit / Debit Card')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Failure / Error display with exact required localized message & Method 1 switch button */}
                  {autoPaymentError && (
                    <div
                      role="alert"
                      className="space-y-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="font-semibold break-words">{autoPaymentError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('manual');
                          setAutoPaymentError(null);
                        }}
                        className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <span>{getTranslation(currentLang, 'payment.switch_to_method_1', 'Switch to Method 1 (Manual Verification)')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* 1. Mobile Money Form */}
                  {autoPaymentOption === 'mobile_money' && (
                    <div className="space-y-3.5">
                      {/* Provider Selectors: eVC Plus, Sahal, ZAAD */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">
                          {getTranslation(currentLang, 'payment.select_provider', 'Select Mobile Money Provider')}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['eVC Plus', 'Sahal', 'ZAAD'] as MobileProvider[]).map((prov) => (
                            <button
                              key={prov}
                              type="button"
                              onClick={() => {
                                setMobileProvider(prov);
                                setAutoPaymentError(null);
                              }}
                              className={`group py-2.5 px-2 rounded-2xl border text-center transition-all duration-200 transform hover:scale-[1.03] active:scale-95 cursor-pointer ${
                                mobileProvider === prov
                                  ? 'border-blue-600 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/40 shadow-sm animate-pulse-glow'
                                  : 'border-slate-200 bg-white text-muted-foreground hover:border-blue-300 hover:text-foreground'
                              }`}
                            >
                              <span className="text-xs font-black block">{prov}</span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                                {prov === 'eVC Plus' ? 'Hormuud' : prov === 'Sahal' ? 'Golis' : 'Telesom'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Number with fixed +252 prefix and 9 digits */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="auto-mobile-num" className="text-xs font-semibold text-foreground">
                            {getTranslation(currentLang, 'payment.phone_number', 'Mobile Number')} *
                          </label>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {mobileNumber.length}/9 digits
                          </span>
                        </div>

                        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                          <div className="flex items-center px-3 bg-muted/70 text-xs font-bold text-foreground border-r border-border select-none shrink-0">
                            <span>+252</span>
                          </div>
                          <input
                            id="auto-mobile-num"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            required
                            maxLength={9}
                            value={mobileNumber}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                              setMobileNumber(digits);
                              setAutoPaymentError(null);
                            }}
                            placeholder="615123456"
                            className="w-full bg-transparent px-3 py-2 text-xs outline-none font-mono"
                          />
                        </div>

                        {/* Real-time Operator Detection Badge */}
                        {mobileNumber.length >= 2 && (() => {
                          const detection = detectSomaliOperator(mobileNumber);
                          if (detection.isValidKnownOperator) {
                            const isMismatch = (
                              (mobileProvider === 'eVC Plus' && detection.operator !== 'Hormuud') ||
                              (mobileProvider === 'Sahal' && detection.operator !== 'Golis') ||
                              (mobileProvider === 'ZAAD' && detection.operator !== 'Telesom')
                            );

                            return (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">
                                    {getTranslation(currentLang, 'payment.detected_network', 'Detected Network')}:
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    detection.operator === 'Hormuud'
                                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                      : detection.operator === 'Golis'
                                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                      : detection.operator === 'Telesom'
                                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                      : 'bg-muted text-foreground border border-border'
                                  }`}>
                                    <Check className="w-3 h-3" />
                                    <span>{detection.operator} ({detection.detectedPrefix})</span>
                                  </span>
                                </div>

                                {isMismatch && (
                                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span>
                                      {currentLang === 'so'
                                        ? `Digniin: ${mobileProvider} waxay ku shaqaysaa shabakadda ${mobileProvider === 'eVC Plus' ? 'Hormuud' : mobileProvider === 'Sahal' ? 'Golis' : 'Telesom'}. Lambarkani waa ${detection.operator}.`
                                        : currentLang === 'ar'
                                        ? `تنبيه: تعمل خدمة ${mobileProvider} على شبكة ${mobileProvider === 'eVC Plus' ? 'هرمز' : mobileProvider === 'Sahal' ? 'غوليس' : 'تليسوم'}. هذا الرقم يتبع ${detection.operator}.`
                                        : `Warning: ${mobileProvider} operates on ${mobileProvider === 'eVC Plus' ? 'Hormuud' : mobileProvider === 'Sahal' ? 'Golis' : 'Telesom'}. Detected network is ${detection.operator}.`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          if (detection.isUnknown) {
                            return (
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">
                                  {getTranslation(currentLang, 'payment.detected_network', 'Detected Network')}:
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Unknown — try again</span>
                                </span>
                              </div>
                            );
                          }

                          return null;
                        })()}

                        <p className="text-[10px] text-muted-foreground">
                          {getTranslation(currentLang, 'payment.phone_help', 'Enter exactly 9 digits after +252 (e.g. 61XXXXXXX, 63XXXXXXX, 90XXXXXXX)')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2. Credit / Debit Card Form */}
                  {autoPaymentOption === 'card' && (
                    <div className="space-y-3">
                      {/* Cardholder Name */}
                      <div className="space-y-1">
                        <label htmlFor="auto-card-holder" className="text-xs font-semibold text-foreground">
                          {getTranslation(currentLang, 'payment.card_name', 'Cardholder Full Name')} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="auto-card-holder"
                            type="text"
                            autoComplete="cc-name"
                            required
                            maxLength={120}
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="e.g. Ahmed Nur"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label htmlFor="auto-card-number" className="text-xs font-semibold text-foreground">
                            {getTranslation(currentLang, 'payment.card_number', 'Card Number')} *
                          </label>
                          {cardNumber && (() => {
                            const val = validateCardNumber(cardNumber);
                            if (val.brand && val.brand !== 'Unknown') {
                              return (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                  {val.brand}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="auto-card-number"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            required
                            maxLength={23}
                            value={cardNumber}
                            onChange={(e) => {
                              setCardNumber(formatCardNumberInput(e.target.value));
                              setAutoPaymentError(null);
                            }}
                            placeholder="4532 •••• •••• 8892"
                            className="w-full rounded-xl border border-border bg-muted/40 py-2 pl-9 pr-3 text-xs outline-none font-mono focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label htmlFor="auto-card-expiry" className="text-xs font-semibold text-foreground">
                            {getTranslation(currentLang, 'payment.card_expiry', 'Expiry Date (MM/YY)')} *
                          </label>
                          <input
                            id="auto-card-expiry"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            required
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              setCardExpiry(formatExpiryInput(e.target.value));
                              setAutoPaymentError(null);
                            }}
                            placeholder="MM/YY"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="auto-card-cvv" className="text-xs font-semibold text-foreground">
                            {getTranslation(currentLang, 'payment.card_cvv', 'CVV / CVC')} *
                          </label>
                          <input
                            id="auto-card-cvv"
                            type="password"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            required
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => {
                              setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                              setAutoPaymentError(null);
                            }}
                            placeholder="•••"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                          />
                        </div>
                      </div>

                      {/* Billing Address, City, Country */}
                      <div className="space-y-2 rounded-2xl border border-border/80 bg-muted/30 p-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {getTranslation(currentLang, 'payment.billing_address', 'Billing Address')} *
                        </span>
                        <input
                          type="text"
                          autoComplete="street-address"
                          required
                          maxLength={200}
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          placeholder="Street Address or District"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            autoComplete="address-level2"
                            required
                            maxLength={100}
                            value={billingCity}
                            onChange={(e) => setBillingCity(e.target.value)}
                            placeholder="City (e.g. Mogadishu)"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                          <input
                            type="text"
                            autoComplete="country-name"
                            required
                            maxLength={100}
                            value={billingCountry}
                            onChange={(e) => setBillingCountry(e.target.value)}
                            placeholder="Country"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Terms Acceptance Checkbox */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/20 border border-border/50 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-0.5 rounded border-border text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px] text-muted-foreground leading-snug">
                          {getTranslation(currentLang, 'payment.terms_accept', 'I accept the billing terms and subscription conditions.')}
                        </span>
                      </label>

                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{getTranslation(currentLang, 'payment.security_notice', 'Your card details are never stored or logged on our servers.')}</span>
                      </p>
                    </div>
                  )}

                  {/* Order & Total Due Summary for Automatic Payment */}
                  <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>Order Summary</span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
                        {billingInterval === 'yearly' ? '365 Days' : '30 Days'} Access
                      </span>
                    </div>
                    <div className="space-y-1 text-muted-foreground text-[11px]">
                      <div className="flex justify-between">
                        <span>Selected Plan:</span>
                        <strong className="text-foreground">
                          {selectedPlan === 'premium' ? 'Alim (Premium)' : 'Talib al-Ilm (Pro)'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <strong className="text-foreground">
                          {autoPaymentOption === 'mobile_money' ? `Mobile Money (${mobileProvider})` : 'Credit / Debit Card'}
                        </strong>
                      </div>
                      <div className="flex justify-between border-t border-border/80 pt-1 text-xs">
                        <span className="font-semibold text-foreground">Total Due:</span>
                        <strong className="text-foreground text-sm font-extrabold text-blue-600">
                          ${getPlanPrice(selectedPlan, billingInterval).toFixed(2)} USD
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Method 2 Pay Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !user}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition-colors hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <span>{getTranslation(currentLang, 'payment.processing', 'Processing Secure Payment...')}</span>
                    ) : !user ? (
                      <span>Sign In to Pay</span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>
                          {getTranslation(currentLang, 'payment.pay_now', 'Pay')}{' '}
                          ${getPlanPrice(selectedPlan, billingInterval).toFixed(2)} USD{' '}
                          {autoPaymentOption === 'mobile_money' ? `via ${mobileProvider}` : 'with Card'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleTrackSearch} className="space-y-2">
                <label htmlFor="plan-track-ref" className="text-xs font-semibold text-foreground">
                  Enter Your Tracking Reference ID
                </label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="plan-track-ref"
                      type="text"
                      required
                      maxLength={100}
                      value={trackRefId}
                      onChange={(e) => setTrackRefId(e.target.value)}
                      placeholder="Enter reference ID"
                      className="w-full rounded-xl border border-border bg-muted/40 py-2 pl-9 pr-3 font-mono text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingTrack}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSearchingTrack ? 'Checking...' : 'Track'}
                  </button>
                </div>
              </form>

              {trackError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackedResult === 'not_found' && (
                <div className="space-y-1 rounded-2xl border border-border bg-muted/40 p-4 text-center">
                  <AlertCircle className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground">
                    Reference ID not found
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    No plan upgrade request was found matching this tracking reference ID. Please check the code and try again.
                  </p>
                </div>
              )}

              {trackedResult && trackedResult !== 'not_found' && (
                <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="min-w-0">
                      <span className="break-all font-mono text-xs font-bold text-foreground">
                        {trackedResult.reference_id}
                      </span>
                      <p className="text-[10px] capitalize text-muted-foreground">
                        {(trackedResult.plan_slug === 'premium' || trackedResult.plan === 'premium') ? 'Alim (Premium)' : 'Talib (Pro)'} Plan Request
                      </p>
                    </div>
                    {renderStatusBadge(
                      trackedResult.status,
                      trackedResult.activation_state
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="text-right font-medium text-foreground">
                        {trackedResult.created_at
                          ? new Date(trackedResult.created_at).toLocaleDateString()
                          : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Offer Duration:</span>
                      <span className="text-right font-medium text-foreground capitalize">
                        {trackedResult.duration || (isAnnualBillingInterval(trackedResult.billing_interval) ? '1 year' : '1 month')}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Plan Amount:</span>
                      <span className="text-right font-bold text-blue-600">
                        ${trackedResult.price_amount ? Number(trackedResult.price_amount).toFixed(2) : ((trackedResult.plan_slug === 'premium' || trackedResult.plan === 'premium') ? (isAnnualBillingInterval(trackedResult.billing_interval) ? '75.99' : '20.99') : (isAnnualBillingInterval(trackedResult.billing_interval) ? '50.99' : '5.99'))} USD
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Approval Status & Date:</span>
                      <span className="text-right font-medium text-foreground">
                        {trackedResult.approved_at
                          ? new Date(trackedResult.approved_at).toLocaleDateString()
                          : (trackedResult.status === 'approved' || trackedResult.status === 'claimed'
                            ? 'Approved by Admin'
                            : 'Pending review')}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <span
                        className={`text-right font-semibold ${
                          trackedResult.payment_verified
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {trackedResult.payment_verified
                          ? 'Verified'
                          : 'Pending Verification'}
                      </span>
                    </div>
                  </div>

                  {/* Pending Review Guidance */}
                  {(trackedResult.status === 'pending' || trackedResult.status === 'under_review') && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                        Your request is pending review
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        Our administrative team is reviewing your verification details. Once approved, the Claim Offer button will appear here to activate your subscription.
                      </p>
                    </div>
                  )}

                  {/* Claim Success / Claimed Panel (Exact Somali Format) */}
                  {(trackedResult.status === 'claimed' || claimSuccess) && (() => {
                    const isAnnual = isAnnualBillingInterval(claimSuccess?.duration || trackedResult.billing_interval || trackedResult.duration);
                    const rawPlan = claimSuccess?.plan || trackedResult.plan_slug || trackedResult.plan || 'pro';
                    const planName = formatPlanName(rawPlan);
                    const durationLabel = claimSuccess?.durationSomali || formatSomaliDuration(claimSuccess?.duration || trackedResult.duration || trackedResult.billing_interval);
                    const startIso = claimSuccess?.activatedAt || trackedResult.claimed_at || trackedResult.approved_at || trackedResult.created_at || new Date().toISOString();
                    const expireIso = claimSuccess?.expiresAt || (trackedResult as any).expires_at || calculateExpirationDate(startIso, isAnnual);
                    const startDateSomali = formatSomaliDate(startIso);
                    const expiryDateSomali = formatSomaliDate(expireIso);

                    return (
                      <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h5 className="text-xs sm:text-sm font-extrabold text-blue-700 dark:text-blue-300">
                              Hambalyo! Waxaad heshay qorshaha {planName}.
                            </h5>
                            <ul className="text-xs space-y-1 text-foreground list-disc list-inside">
                              <li><strong>Qorshaha:</strong> {planName}</li>
                              <li><strong>Muddada:</strong> {durationLabel}</li>
                              <li><strong>Taariikhda uu bilaabmay:</strong> {startDateSomali}</li>
                              <li><strong>Taariikhda uu dhacayo:</strong> {expiryDateSomali}</li>
                            </ul>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            resetAndClose();
                            window.location.href = '/chat';
                          }}
                          className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Start Chatting</span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* Claim Offer Action (Only shown before claiming) */}
                  {trackedResult.status === 'approved' && !claimSuccess && (
                    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          Your Plan Request Has Been Approved!
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Your requested <strong className="text-foreground">{(trackedResult.plan_slug || trackedResult.plan).toUpperCase()}</strong> plan for <strong className="text-foreground">{trackedResult.duration || (isAnnualBillingInterval(trackedResult.billing_interval) ? '1 year' : '1 month')}</strong> is ready for activation. Click Claim Offer to immediately unlock full access.
                        </p>
                      </div>

                      {claimModalError && (
                        <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{claimModalError}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleModalClaimOffer}
                        disabled={isClaimingModal}
                        className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isClaimingModal ? (
                          <span>Activating Subscription...</span>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Claim Offer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Truthful Activation Status Details */}
                  {trackedResult.activation_state === 'awaiting_registration' && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                      <p className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Account Registration Required
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        This request is approved, but no EMufti AI account was found for your email. Please create an account or sign in using your application email to activate your plan.
                      </p>
                    </div>
                  )}

                  {trackedResult.activation_state === 'active' && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-400">
                      <p className="font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" />
                        Plan Successfully Activated
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        Your {(trackedResult.plan_slug === 'premium' || trackedResult.plan === 'premium') ? 'Alim (Premium)' : 'Talib (Pro)'} plan is fully active on your registered account with all features unlocked.
                      </p>
                    </div>
                  )}

                  {trackedResult.activation_state === 'payment_pending' && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                      <p className="font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        Payment Verification Pending
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        Our administrative team is confirming your payment. Your plan will activate automatically once verified.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
