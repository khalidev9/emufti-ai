import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  Shield,
  AlertCircle,
  ArrowLeft,
  Zap,
  Info,
  Search,
  MessageCircle,
  ShieldCheck,
  Clock,
  BookOpen,
  Check,
} from 'lucide-react';
import { SYSTEM_PLANS, PLAN_PRICES } from '../lib/payment';
import { useAuth, isAnnualBillingInterval } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { storage } from '../lib/storage';
import { PlanSlug, PlanRequest } from '../types/database';
import { PlanRequestModal } from '../components/plans/PlanRequestModal';
import { PlanActivationBanner } from '../components/chat/PlanActivationBanner';
import { Logo } from '../components/common/Logo';
import { Footer } from '../components/layout/Footer';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, activePlan, subscription, isLoading, profileError } = useAuth();
  const { t, language, direction } = useLanguage();
  const userId = user?.id || 'guest_user';
  const isRtl = direction === 'rtl' || language === 'ar';

  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [localPlanOverride, setLocalPlanOverride] = useState<PlanSlug | null>(null);
  const currentPlanSlug: PlanSlug = localPlanOverride || activePlan;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultPlan, setModalDefaultPlan] = useState<PlanSlug>('pro');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalPlanOverride(null);
  }, [activePlan]);

  const isPaidActive = activePlan === 'pro' || activePlan === 'premium';
  const rawExpiry = profile?.plan_expires_at || profile?.expires_at || subscription?.current_period_end || subscription?.expires_at;
  const formattedExpiryDate = rawExpiry
    ? new Date(rawExpiry).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'the end of your active period';
  const activePaidNotice = `Your ${activePlan.toUpperCase()} subscription is active until ${formattedExpiryDate}. You can use the Free plan after your paid subscription expires.`;

  const usage = storage.getDailyUsage(userId);

  const getLimitForPlan = (slug: PlanSlug) => {
    const p = SYSTEM_PLANS.find((x) => x.slug === slug);
    return p ? p.message_limit : (slug === 'free' ? 5 : 15);
  };

  const currentLimit = getLimitForPlan(currentPlanSlug);
  const usedPercent = Math.min(100, Math.round((usage.count / currentLimit) * 100));

  const handleSelectPlan = (slug: PlanSlug) => {
    if (slug === currentPlanSlug) return;
    if (slug === 'free') {
      if (isPaidActive) {
        setBannerMessage(activePaidNotice);
        return;
      }
      storage.setUserActivePlan(userId, 'free');
      setLocalPlanOverride('free');
      setBannerMessage('Switched to Free Seeker plan.');
      return;
    }

    setModalDefaultPlan(slug);
    setModalOpen(true);
  };

  const handleRequestSubmitted = (req: PlanRequest) => {
    setBannerMessage(
      `Your request for the ${req.plan_slug.toUpperCase()} plan (Reference: ${
        req.reference_id
      }) was successfully submitted! Our team will reach out via WhatsApp/Telegram to complete verification.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden box-border" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Navigation */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 w-full max-w-full box-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t('common.back', 'Back')}</span>
        </button>
        <Link to="/" className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Logo size="xs" />
          <span>EMufti</span>
          <span className="text-blue-600">AI</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/features"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline hidden md:inline"
          >
            {t('nav.features', 'Features')}
          </Link>
          <Link
            to="/help"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline hidden sm:inline"
          >
            {t('help.title', 'Help Center')}
          </Link>
          <Link
            to="/track"
            className="text-xs font-semibold text-blue-600 hover:underline hidden sm:inline"
          >
            {t('plans.track_offer', 'Track & Claim Offer')}
          </Link>
          <Link
            to="/chat"
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm"
          >
            {t('common.return_to_chat', 'Go to Chat')}
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10 pb-16 sm:pb-12 w-full max-w-full overflow-x-hidden box-border space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-float-slow" />
            <span>{t('plans.title', 'Seeker Subscription Plans')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {language === 'so' ? 'Dooro Qorshahaaga Barashada Diinta' : (language === 'ar' ? 'اختر باقة دراسة العلوم الشرعية المناسبة' : 'Elevate Your Islamic Studies')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {language === 'so'
              ? 'Hel xog sugan, daliilo fiqi iyo tafsiir qoto-dheer oo waafaqsan manhajka Ahlus-Sunnah.'
              : (language === 'ar'
                ? 'استفد من بحوث شرعية موثقة ومقارنة فقهية وتفسير معتمد باللغات الثلاث.'
                : 'Choose the depth of scholarly research that fits your study, personal questions, or teaching needs.')}
          </p>

          {/* Billing interval switcher */}
          <div className="inline-flex max-w-full overflow-x-auto items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mt-3 scrollbar-none">
            <button
              type="button"
              onClick={() => setBillingInterval('month')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                billingInterval === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'so' ? 'Bille (Monthly)' : (language === 'ar' ? 'اشتراك شهري' : 'Monthly Billing')}
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('year')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                billingInterval === 'year'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{language === 'so' ? 'Sannadle (Annual)' : (language === 'ar' ? 'اشتراك سنوي' : 'Annual Billing')}</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                {language === 'so' ? 'Badbaadi 70%' : (language === 'ar' ? 'وفر حتى 70%' : 'Save up to 70%')}
              </span>
            </button>
          </div>
        </div>

        {/* Verification & Manual Activation Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900">
                {language === 'so' ? 'Hawlgelinta Tooska ah ee Xubinnimada' : (language === 'ar' ? 'تفعيل فوري موثق لجميع الباقات' : 'Instant Verified Plan Activation')}
              </span>
              <p className="text-[11px] text-slate-500">
                {language === 'so'
                  ? 'Qorshayaasha Pro iyo Premium waxaa lagu kiciyaa hab toos ah oo degdeg ah oo ay la socoto taageero joogto ah.'
                  : (language === 'ar'
                    ? 'يتم تفعيل باقات Pro و Premium فوراً مع وصول كامل لكافة المصادر الإسلامية ودعم مستمر.'
                    : 'Pro and Premium tiers are activated automatically with dedicated Islamic scholarly support.')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/track"
              className="flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('plans.track_offer', 'Track & Claim Offer')}</span>
            </Link>
          </div>
        </div>

        {/* Current Usage Status Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('plans.current_plan', 'Current Active Plan')}:
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {currentPlanSlug.toUpperCase()}
              </span>
              {isPaidActive && (
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {isAnnualBillingInterval(profile?.billing_interval) ? 'Annual (1 Year)' : 'Monthly (1 Month)'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              You have asked <strong className="text-slate-900">{usage.count}</strong> of{' '}
              <strong className="text-slate-900">{currentLimit}</strong> questions{' '}
              {currentPlanSlug === 'free' ? 'in this rolling 24-hour window' : 'today'}.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Daily Quota</span>
              <span>{usedPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Notification banner */}
        {bannerMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{bannerMessage}</p>
          </div>
        )}

        {/* Database Error Banner if connection or query encountered issues */}
        {profileError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">Notice: {profileError}. Using cached subscription entitlement.</p>
          </div>
        )}

        {/* Automatic Plan Activation Congratulations Banner */}
        <PlanActivationBanner className="mb-4" />

        {/* Plan Cards Grid: FREE, PRO, PREMIUM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SYSTEM_PLANS.map((plan) => {
            const isCurrent = currentPlanSlug === plan.slug;
            const isFreeDowngradeDisabled = plan.slug === 'free' && isPaidActive;
            const isDisabled = isCurrent || isFreeDowngradeDisabled;
            const isPro = plan.slug === 'pro';
            const isPremium = plan.slug === 'premium';
            const price =
              billingInterval === 'year'
                ? PLAN_PRICES[plan.slug].yearly
                : PLAN_PRICES[plan.slug].monthly;
            const durationLabel = billingInterval === 'year' ? 'per year (365 days)' : 'per month (30 days)';

            return (
              <div
                key={plan.id}
                className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border flex flex-col justify-between transition-all ${
                  isPro
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20 relative'
                    : isPremium
                    ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20 relative'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {language === 'so' ? 'Ugu Caansan' : (language === 'ar' ? 'الأكثر طلباً' : 'Most Popular')}
                    </span>
                  )}
                  {isPremium && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {language === 'so' ? 'Cilmibaarista Culimada' : (language === 'ar' ? 'بحث علمي متقدم' : 'Scholarly Research')}
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {plan.slug === 'free' ? 'Free Forever' : durationLabel}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                    {language === 'so' ? 'Muuqaalada Qorshaha:' : (language === 'ar' ? 'مزايا الباقة:' : 'Features & Limits:')}
                  </div>
                  <ul className="space-y-2 text-xs text-left mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isPremium ? 'text-amber-500' : 'text-blue-600'}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isFreeDowngradeDisabled && (
                    <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed text-left">
                      <div className="font-semibold flex items-center gap-1.5 text-amber-800 mb-0.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{activePlan.toUpperCase()} Active</span>
                      </div>
                      <p>
                        Your {activePlan.toUpperCase()} subscription is active until <strong className="text-slate-900">{formattedExpiryDate}</strong>.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleSelectPlan(plan.slug)}
                    disabled={isDisabled}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? plan.slug === 'premium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
                          : plan.slug === 'pro'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-default'
                          : 'bg-slate-100 text-slate-400 cursor-default border border-slate-200'
                        : isFreeDowngradeDisabled
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : isPremium
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold shadow-sm'
                        : isPro
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {plan.slug === 'free' ? 'CURRENT FREE TIER' : `${plan.slug.toUpperCase()} ACTIVE`}
                        </span>
                      </>
                    ) : isFreeDowngradeDisabled ? (
                      <span>Free Active After Expiry</span>
                    ) : plan.slug === 'free' ? (
                      'Select Free Seeker'
                    ) : (
                      t('pricing.subscribe', 'Subscribe')
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Section */}
        <div className="pt-8 border-t border-slate-200">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {language === 'so' ? 'Isbarbardhiga Dhammaystiran ee Qorshayaasha' : (language === 'ar' ? 'مقارنة المزايا الكاملة بين الباقات' : 'Comprehensive Plan Comparison')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'so' ? 'Muuqaalka faahfaahsan ee awoodaha qorshe kasta' : 'Detailed breakdown of all features across Free, Pro, and Premium tiers'}
            </p>
          </div>

          {/* 1. Mobile Stackable Card Layout (Visible on screens < 768px) */}
          <div className="md:hidden space-y-3.5">
            {[
              {
                capability: 'Daily AI Question Quota',
                capabilitySo: "Tirada Su'aalaha AI ee Maalintii",
                free: '5 queries / 24 hours',
                pro: '150 queries / day',
                premium: '1,000 queries / day',
              },
              {
                capability: 'Context Window Depth',
                capabilitySo: 'Dhererka Xusuusta Wadahadalka',
                free: '1,500 tokens',
                pro: '4,000 tokens',
                premium: '8,000 tokens',
              },
              {
                capability: 'Response Speed & Queue',
                capabilitySo: 'Xawaaraha & Safka Jawaabaha',
                free: 'Standard',
                pro: 'Priority speed',
                premium: 'Ramadan & peak priority VIP',
              },
              {
                capability: 'Quran Access Entitlement',
                capabilitySo: "Fursadda Akhriska & Dhageysiga Qur'aanka",
                free: '2-Day Quran Free Trial (Full mushaf & verified reciters)',
                pro: 'Quran Pro Bundled (Unlimited 114 Surahs, Qaari Catalog, Subcis Practice)',
                premium: 'Quran Premium Bundled (All Pro features + Somali Scholars Tafsir + Khatmah Planner)',
              },
              {
                capability: 'Billing Options',
                capabilitySo: 'Qiimaha & Bixinta',
                free: 'Free Forever ($0)',
                pro: '$5.99 / mo (30 days) or $50.99 / yr (365 days)',
                premium: '$20.99 / mo (30 days) or $75.99 / yr (365 days)',
              },
            ].map((row, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    {language === 'so' ? row.capabilitySo : row.capability}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {`#${idx + 1}`}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {/* Free Seeker */}
                  <div className="flex items-start justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-500 shrink-0 text-[11px]">Free Seeker:</span>
                    <span className="text-right text-slate-600 text-[11px] font-medium">{row.free}</span>
                  </div>
                  {/* Talib al-Ilm (Pro) */}
                  <div className="flex items-start justify-between gap-2 bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl">
                    <span className="font-bold text-blue-700 shrink-0 text-[11px]">Talib al-Ilm (Pro):</span>
                    <span className="text-right font-bold text-blue-700 text-[11px]">{row.pro}</span>
                  </div>
                  {/* Alim (Premium) */}
                  <div className="flex items-start justify-between gap-2 bg-amber-50/70 border border-amber-100 p-2.5 rounded-xl">
                    <span className="font-bold text-amber-800 shrink-0 text-[11px]">Alim (Premium):</span>
                    <span className="text-right font-bold text-amber-800 text-[11px]">{row.premium}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Desktop Full Table View (Visible on screens >= 768px, smooth scrollable min-w-[700px]) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[700px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-900 font-semibold">
                <tr>
                  <th className="p-3.5 border-b border-slate-200">Capability</th>
                  <th className="p-3.5 border-b border-slate-200">Free Seeker</th>
                  <th className="p-3.5 border-b border-slate-200 text-blue-600">Talib al-Ilm (Pro)</th>
                  <th className="p-3.5 border-b border-slate-200 text-amber-600">Alim (Premium)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3.5 font-medium">Daily AI Question Quota</td>
                  <td className="p-3.5 text-slate-500">5 queries / 24 hours</td>
                  <td className="p-3.5 font-bold text-blue-600">150 queries / day</td>
                  <td className="p-3.5 font-bold text-amber-600">1,000 queries / day</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Context Window Depth</td>
                  <td className="p-3.5 text-slate-500">1,500 tokens</td>
                  <td className="p-3.5 font-bold text-blue-600">4,000 tokens</td>
                  <td className="p-3.5 font-bold text-amber-600">8,000 tokens</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Response Speed & Queue</td>
                  <td className="p-3.5 text-slate-500">Standard</td>
                  <td className="p-3.5 font-bold text-blue-600">Priority speed</td>
                  <td className="p-3.5 font-bold text-amber-600">Ramadan & peak priority VIP</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Quran Access Entitlement</td>
                  <td className="p-3.5 text-amber-600 font-medium">2-Day Quran Free Trial (Full mushaf & verified reciters)</td>
                  <td className="p-3.5 font-bold text-blue-600">Quran Pro Bundled (Unlimited 114 Surahs, Qaari Catalog, Subcis Practice)</td>
                  <td className="p-3.5 font-bold text-amber-600">Quran Premium Bundled (All Pro features + Somali Scholars Tafsir + Khatmah Planner)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">Billing Options</td>
                  <td className="p-3.5 text-slate-500">Free Forever ($0)</td>
                  <td className="p-3.5 font-semibold text-slate-900">$5.99 / mo (30 days) or $50.99 / yr (365 days)</td>
                  <td className="p-3.5 font-semibold text-slate-900">$20.99 / mo (30 days) or $75.99 / yr (365 days)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Plan Request Modal */}
      <PlanRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPlan={modalDefaultPlan}
        defaultInterval={billingInterval === 'year' ? 'yearly' : 'monthly'}
        onRequestSubmitted={handleRequestSubmitted}
      />

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};

export default PricingPage;
