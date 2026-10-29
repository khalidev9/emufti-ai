import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  Award,
  HelpCircle,
  FileText,
  Lock,
  Headphones,
  Compass,
  Trophy,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Mail,
  Send,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import {
  OFFICIAL_WHATSAPP_NUMBER,
  OFFICIAL_WHATSAPP_LINK,
  OFFICIAL_SUPPORT_EMAIL,
  OFFICIAL_TELEGRAM_LINK,
} from '../../lib/constants';

export interface FooterProps {
  className?: string;
  hideDisclaimer?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  className = '',
  hideDisclaimer = false,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors box-border ${className}`}
    >
      {/* Decorative Top Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-200/80 dark:border-slate-800">
          {/* ========================================================= */}
          {/* COLUMN 1 (5 cols on lg): Brand & "About" (Ku Saabsan)    */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <div>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <span>EMufti AI</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Barashada &amp; Faafinta Cilmiga Diinta ee Sugan
                </p>
              </div>
            </div>

            {/* Comprehensive "About" Description */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-0 sm:pr-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Ku Saabsan EMufti AI / About Us</span>
              </h3>
              <p>
                <strong>EMufti AI</strong> waa madal Islaami ah oo u taagan bixinta iyo fududaynta barashada diinta Islaamka ee saxda ah. Waxay si adag ugu qotontaa <strong>Kitaabka Qur'aanka Kariimka</strong>, <strong>Sunnada Nabiga (NNKH)</strong>, iyo fahamka suubban ee culumada afarta mad-habadood (Xanafi, Maaliki, Shaafici, iyo Xanbali).
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Waxaan isku xirnaa cilmiga dhaqanka Islaamka iyo farsamada casriga ah si qof kasta meel kasta uu joogo uu u helo akhriska Qur'aanka, tarjumaado, subcinta, imtixaannada diiniga ah, iyo baaris cilmiyeed oo daliilaysan.
              </p>
            </div>

            {/* Core Values Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>Qur'aan &amp; Sunnah</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Afarta Mad-habadood</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60">
                <Lock className="w-3 h-3 text-purple-600" />
                <span>Amni &amp; Qarsanaanta Xogta</span>
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2 (2 cols on lg): Platform Features & Quran        */}
          {/* ========================================================= */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Astaamaha Madasha</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/quran"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Qur'aanka Kariimka</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/quran?tab=50qaris"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Headphones className="w-3.5 h-3.5 text-slate-400" />
                  <span>50+ Qaari &amp; Codad</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/quran?tab=subcis"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>Subcis (Alternating)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/khitma"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-200"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Khatma Challenge</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Imtixaan &amp; Tartan</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Awoodaha AI-ga</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>Qorshayaasha (Pricing)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3 (2 cols on lg): Resources & Legal                */}
          {/* ========================================================= */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Xogta &amp; Shuruudaha</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-200"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Siyaasadda Khaaska ah</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Shuruudaha Isticmaalka</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/verify-certificate"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hubinta Shahaadada</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/track"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <SearchIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Raadinta Weydiinta</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Xarunta Caawinta (FAQ)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 4 (3 cols on lg): Official Contact & Support       */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Xiriirka &amp; Taageerada</span>
            </h3>

            {/* Official WhatsApp Card */}
            <a
              href={OFFICIAL_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 transition-colors">
                      WhatsApp Support
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                      {OFFICIAL_WHATSAPP_NUMBER}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                Fariin toos ah noogu soo dir WhatsApp si aad u hesho taageero degdeg ah.
              </p>
            </a>

            {/* Additional Contact Channels */}
            <div className="space-y-1.5 pt-1 text-xs">
              <Link
                to="/help?tab=submit"
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Gudbi Cabasho ama Su&apos;aal</span>
              </Link>
              <a
                href={OFFICIAL_TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
              >
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Telegram Community</span>
              </a>
              <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span>{OFFICIAL_SUPPORT_EMAIL}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EDUCATIONAL & ISLAMIC DISCLAIMER                         */}
        {/* ========================================================= */}
        {!hideDisclaimer && (
          <div className="py-4 my-6 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white font-semibold">
                Digniin Diineed (Islamic Educational Disclaimer):
              </strong>{' '}
              EMufti AI waxaa loogu talagalay waxbarasho, cilmi-baaris, iyo fidinta diinta Islaamka ee ku salaysan Kitaabka iyo Sunnada. Uma taagna fatwo rasmi ah oo maxkamadeed. Arrimaha xasaasiga ah ee ku saabsan nolosha, xukunka guurka, dhaxalka, iyo garsoorka fadlan la kaasho culimo nool oo aqoon iyo shahaado u leh.
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM COPYRIGHT & LEGAL PILLS                           */}
        {/* ========================================================= */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400 pb-16 lg:pb-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>
              &copy; {currentYear} <strong>EMufti AI Platform</strong>. Dhammaan xuquuqda way dhowran yihiin (All rights reserved).
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link to="/help" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Help Center
            </Link>
            <span>&bull;</span>
            <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default Footer;
