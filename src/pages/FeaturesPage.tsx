import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Scroll,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Search,
  Globe,
  Layers,
  FileText,
  Volume2,
  Lock,
  Headphones,
  Compass,
  HelpCircle,
  Mic,
  GraduationCap,
} from 'lucide-react';
import { OFFICIAL_WHATSAPP_LINK, OFFICIAL_WHATSAPP_NUMBER } from '../lib/constants';
import { Logo } from '../components/common/Logo';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { Footer } from '../components/layout/Footer';

interface FeatureCard {
  id: string;
  category: string;
  title: string;
  description: string;
  highlights: string[];
  statusBadge: string;
  icon: React.ComponentType<{ className?: string }>;
  ctaLink: string;
  ctaText: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: 'ai-scholar',
    category: 'Scholar Assistant',
    title: 'Citation-Grounded Islamic AI',
    description:
      'Inquire with confidence about Islamic jurisprudence, worship (Taharah, Salah, Zakat, Sawm), and theology. Every response is grounded in authentic texts.',
    highlights: [
      'Authentic Quranic citations with Ayah numbers and Uthmani Arabic script',
      'Verified Hadith references citing primary collections (Bukhari, Muslim, Sunan)',
      'Four Sunni Madhhabs comparative rulings (Hanafi, Maliki, Shafi\'i, Hanbali)',
      'Natural trilingual understanding in English, Somali (Af-Soomaali), and Arabic',
    ],
    statusBadge: 'Live & Grounded',
    icon: Sparkles,
    ctaLink: '/chat',
    ctaText: 'Start Chatting',
  },
  {
    id: 'quran-tafsir-library',
    category: 'Scripture & Audio',
    title: 'Complete Holy Quran & Somali Tafsir Library',
    description:
      'A full digital Quran reading and listening environment covering all 114 Surahs from Al-Fatihah to An-Nas, integrated with verified Somali scholars audio duruus.',
    highlights: [
      'All 114 Surahs with authentic Uthmani text, Somali (Sheikh Abduh), and English (Sahih Intl)',
      'Verified audio duruus and transcripts from prominent Somali scholars (Sheikh Mustafe, Sheikh Omar Farooq)',
      'Strict honesty: "Tafsiirkan weli lama hayo" displayed whenever audio is in archiving',
      'High-quality audio streaming from 50 world-renowned reciters (Abdur-Rashid Sufi, Alafasy, Al-Husary, Minshawi)',
    ],
    statusBadge: '114 Surahs + Duruus',
    icon: BookOpen,
    ctaLink: '/chat',
    ctaText: 'Explore Knowledge & Citations',
  },
  {
    id: 'subcis-practice',
    category: 'Somali Quran Heritage',
    title: 'Subcis Alternating Recitation Practice',
    description:
      'Immerse in the timeless Somali tradition of alternating Quranic recitation with a world-class Qari, local zero-upload recording, and step-by-step setup.',
    highlights: [
      'Alternating ayah-by-ayah workflow: Qari recites odd verses, you recite even verses',
      'Configurable 20-second practice timer per ayah with automated sequential progression',
      'Strict Turn Enforcement: Programmatic pause for Sheikh Cabdirashiid Ali Sufi and full-surah reciters',
      'End-of-session evaluation report with detailed word-level accuracy analysis',
    ],
    statusBadge: 'Zero Server Upload',
    icon: Mic,
    ctaLink: '/quran?tab=subcis',
    ctaText: 'Practice Subcis',
  },
  {
    id: 'qaris-catalog',
    category: 'World-Class Qurra & Audio',
    title: '50 Verified Reciters & Ten Qira\'at',
    description:
      'Listen to and practice with world-renowned reciters including Sheikh Abdur-Rashid Ali Sufi, Mahmoud Khalil Al-Husary, and Mishary Rashid Alafasy.',
    highlights: [
      'Somali Heritage: Prominent Sheikh Abdur-Rashid Ali Sufi with Ten Qira\'at mastery',
      'Global Qurra: Top reciters across Egypt, Somalia, Kuwait, Saudi Arabia, and beyond',
      'High-quality audio streaming with verse-by-verse and full-surah support',
      'Seamless integration with Subcis alternating recitation',
    ],
    statusBadge: '50 Reciters Global',
    icon: Headphones,
    ctaLink: '/quran?tab=50qaris',
    ctaText: 'Listen to Reciters',
  },
  {
    id: 'learning-plans',
    category: 'Entitlements & Tiers',
    title: 'Flexible Learning Plans & Quota Management',
    description:
      'Three structured tiers designed to support seekers, serious students of knowledge (Talib al-Ilm), and researchers (Alim).',
    highlights: [
      'Free Seeker: 5 questions/24 hours, full Quran access, standard speed',
      'Talib al-Ilm (Pro): 150 questions/day, 4,000 token context depth, unlimited Quran & 50 reciters',
      'Alim (Premium): 1,000 questions/day, 8,000 token context depth, Somali Tafsir audio, formatted study sheets',
      'Active Paid Protection: Prevents accidental downgrade to Free while paid subscription is active',
    ],
    statusBadge: 'Free, Pro & Premium',
    icon: Layers,
    ctaLink: '/pricing',
    ctaText: 'View Pricing & Plans',
  },
  {
    id: 'claim-workflow',
    category: 'Security & Activation',
    title: 'Personal Verification & 1-Click Offer Claim',
    description:
      'A manual onboarding flow that pairs genuine Islamic integrity with automated subscription activation upon verification.',
    highlights: [
      'Transparent plan request submission with unique tracking code (REQ-EMUFTI-XXXXXX)',
      'Direct verified activation with dedicated administrative support',
      '1-Click "Claim Offer" activation in /track that immediately elevates user entitlements',
      'Realtime profile synchronization across all devices via Supabase',
    ],
    statusBadge: 'Automated Activation',
    icon: ShieldCheck,
    ctaLink: '/track',
    ctaText: 'Track & Claim Offer',
  },
  {
    id: 'notebook-bookmarks',
    category: 'Study Tools',
    title: 'Saved Answers & Markdown Export',
    description:
      'Build your personal Islamic notebook of key rulings, verses, and hadiths with complete export capabilities.',
    highlights: [
      'One-click bookmarking of important answers with categorization by topic',
      'Chronological conversation history grouped into Today, Yesterday, and Previous Weeks',
      'Pin critical inquiries to the top of your conversation sidebar',
      'Clean Markdown (.md) export for personal notes, lesson preparation, and offline reading',
    ],
    statusBadge: 'Private & Exportable',
    icon: Bookmark,
    ctaLink: '/saved',
    ctaText: 'View Saved Answers',
  },
  {
    id: 'support-helpcenter',
    category: 'Support & Assistance',
    title: 'Support & Help Center',
    description:
      'Direct human support and searchable documentation for all technical, payment, and scholarly questions.',
    highlights: [
      'Searchable Help Center (/help) with FAQs covering onboarding, rulings, and troubleshooting',
      'Official support request tickets with verified administrator replies',
      'Direct reporting tool for inaccurate translations or unverified hadith references',
      'Fast administrative turnaround for upgrade activations and inquiries',
    ],
    statusBadge: 'Help Center',
    icon: HelpCircle,
    ctaLink: '/help',
    ctaText: 'Visit Help Center',
  },
];

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden box-border">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-30 w-full max-w-full box-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold text-sm tracking-tight text-slate-900">
              EMufti <span className="text-blue-600">AI</span> Features
            </span>
          </Link>
        </div>

        {/* Modernized White & Blue Header Menu Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/verify-certificate"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 hidden sm:inline-flex items-center gap-1.5 transition-all border border-transparent hover:border-blue-100"
            title="Hubinta Shahaadada / Quran Certificate"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Certificate</span>
          </Link>
          <Link
            to="/pricing"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 hidden sm:inline transition-all"
          >
            Plans
          </Link>
          <Link
            to="/help"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 hidden sm:inline transition-all"
          >
            Help Center
          </Link>
          <Link
            to="/chat"
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-95"
          >
            Go to Chat
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-3.5 sm:px-8 py-8 sm:py-10 w-full space-y-8 sm:space-y-10 pb-24 lg:pb-10">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-float-slow" />
            <span>Platform Capabilities</span>
          </div>
          <h1 className="text-2xl min-[360px]:text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Built for Authentic Islamic Learning & Scholarly Research
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Explore the verified tools, classical citations, complete Quran directory, and Somali scholarly lessons powering EMufti AI.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between shadow-sm space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {feat.statusBadge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      {feat.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    {feat.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    to={feat.ctaLink}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <span>{feat.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Comprehensive Global Footer */}
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default FeaturesPage;
