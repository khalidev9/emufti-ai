import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Scroll,
  Compass,
  Sparkles,
  ShieldCheck,
  Globe,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Menu,
  X,
  Mic,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SYSTEM_PLANS } from '../lib/payment';
import { OFFICIAL_WHATSAPP_LINK } from '../lib/constants';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { Footer } from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartChat = () => {
    if (user) {
      navigate('/chat');
    } else {
      navigate('/login', { state: { from: '/chat' } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20 w-full max-w-full overflow-x-hidden box-border">
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-30 shadow-xs w-full max-w-full box-border">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0 overflow-hidden relative">
            <img
              src="/logo-frontend.png"
              alt="EMufti AI Logo"
              className="w-full h-full object-contain p-0.5 bg-white rounded-lg"
            />
            <span className="sr-only">E</span>
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
            EMufti <span className="text-blue-600 dark:text-blue-400">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links (Modernized White & Blue Theme) */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          <Link
            to="/quran"
            className="px-3 py-1.5 rounded-xl text-blue-600 bg-blue-50/70 hover:bg-blue-100/80 font-bold transition-all flex items-center gap-1.5 shadow-2xs border border-blue-200/50"
            title="Holy Quran (Mushaf)"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Holy Quran</span>
          </Link>

          <Link
            to="/verify-certificate"
            data-testid="header-nav-certificate"
            className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 font-semibold transition-all flex items-center gap-1.5 border border-transparent hover:border-blue-100"
            title="Hubinta Shahaadada / Quran Certificate Verification"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Quran Certificate</span>
          </Link>

          <Link
            to="/features"
            className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 font-medium transition-all"
          >
            Features
          </Link>

          <a
            href="#trust"
            className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 font-medium transition-all"
          >
            Religious Accuracy
          </a>

          <Link
            to="/pricing"
            className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 font-medium transition-all"
          >
            Plans
          </Link>

          <Link
            to="/help"
            className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 font-medium transition-all"
          >
            Help Center &amp; FAQ
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle />

          {user ? (
            <Link
              to="/settings"
              className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
            >
              My Account
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={handleStartChat}
            className="text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden min-[360px]:inline">Start Chat</span>
            <span className="min-[360px]:hidden">Chat</span>
          </button>

          {/* Mobile Navigation Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg z-20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1.5 text-sm font-medium">
            <Link
              to="/quran"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/70 text-blue-600 font-semibold border border-blue-200/50"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Holy Quran (Mushaf)</span>
            </Link>
            <Link
              to="/verify-certificate"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Quran Certificate (Hubinta Shahaadada)</span>
            </Link>
            <Link
              to="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Features & Tools</span>
            </Link>
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Subscription Plans</span>
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Help Center & FAQ</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            {user ? (
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="font-semibold text-blue-600 hover:underline p-1"
              >
                Account Settings
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="font-semibold text-blue-600 hover:underline p-1"
              >
                Sign In to Account
              </Link>
            )}
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="font-semibold text-slate-900 p-1"
            >
              Start Chat →
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="py-12 sm:py-24 px-3 sm:px-8 text-center max-w-5xl mx-auto flex flex-col items-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-xs max-w-full text-center">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Grounded Islamic Knowledge Platform</span>
        </div>

        <h1 className="text-2xl min-[360px]:text-3xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-tight sm:leading-tight mb-6">
          Authentic Islamic Knowledge, <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Rooted in Scripture & Classical Tradition.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          A respectful, citation-grounded Islamic AI assistant anchored in the Holy Quran, verified Sunnah, and recognized scholarly traditions. Inquire with confidence in English, Somali, and Arabic.
        </p>

        {/* CTAs (Cleaned Hero Group: Start Chat & Holy Quran routing directly to /quran) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleStartChat}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/quran"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Holy Quran (Mushaf)</span>
          </Link>
          <Link
            to="/pricing"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all shadow-2xs"
          >
            Explore Plans
          </Link>
        </div>

        {/* Floating Feature Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Quran & Surah Verse Citations
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Authentic Hadith Collections
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Four Madhhabs Comparative Fiqh
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Somali, Arabic, and English
          </span>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/80 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              A Purpose-Built Platform for Islamic Learning
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Designed with religious integrity, citation transparency, and modern usability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Quranic Tafsir & Linguistics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore surahs with verse citations [e.g. 2:183], classical commentary from Ibn Kathir and Al-Tabari, and Arabic linguistic analysis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Scroll className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hadith Corpus & Grading</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clear distinction between Sahih, Hasan, and Da'if narrations with reference to Sahih al-Bukhari, Sahih Muslim, and the Sunan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Four Madhhabs Fiqh (Ikhtilaf)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Understand the scholarly nuances between the Hanafi, Maliki, Shafi'i, and Hanbali traditions without misrepresenting single opinions as universal consensus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Religious Integrity Section */}
      <section id="trust" className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/80 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">Religious Accuracy & Ethical Guardrails</h3>
              <p className="text-xs text-slate-500">Our foundational commitment to religious truth</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Zero Fabrication Guarantee
              </span>
              <p className="text-slate-500 leading-relaxed">
                EMufti AI is strictly instructed to never invent verses, hadiths, or scholarly quotes. If a citation cannot be verified, it admits uncertainty.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Not a Human Mufti
              </span>
              <p className="text-slate-500 leading-relaxed">
                EMufti AI is an educational tool. For complex personal legal rulings (divorce, inheritance, criminal matters), users are instructed to consult qualified local scholars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-16 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Transparent Plans for Every Seeker</h2>
          <p className="text-sm text-slate-500 mt-2">
            Start with our generous free tier or upgrade for scholarly depth and higher daily limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SYSTEM_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-white border flex flex-col justify-between shadow-sm transition-all ${
                plan.slug === 'pro'
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {plan.slug === 'pro' && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                  {plan.description}
                </p>

                <div className="my-4">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${(plan.price_amount / 100).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>

                <ul className="space-y-2 text-xs text-left mb-6">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/pricing"
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all text-center ${
                  plan.slug === 'pro'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {plan.slug === 'free' ? 'Get Started' : 'Subscribe to Plan'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
            <h4 className="font-semibold text-slate-900 text-sm">
              Can EMufti AI issue binding fatwas?
            </h4>
            <p className="text-slate-500 leading-relaxed">
              No. Fatwas require human juristic discretion, contextual understanding of individuals, and certified scholarly authority. EMufti AI provides structured educational explanations of existing classical rulings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
            <h4 className="font-semibold text-slate-900 text-sm">
              How does EMufti AI support the Somali language?
            </h4>
            <p className="text-slate-500 leading-relaxed">
              EMufti AI uses authentic Somali Islamic terminology (such as Salaad, Soon, Sakada, Tiirarka Islaamka, Tawxiid) to provide clear explanations for Somali speakers worldwide.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
            <h4 className="font-semibold text-slate-900 text-sm">
              Are my conversations kept private?
            </h4>
            <p className="text-slate-500 leading-relaxed">
              Yes. All conversations are protected by Supabase Row Level Security. Users only have access to their own inquiries and saved content.
            </p>
          </div>
        </div>
      </section>

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};
