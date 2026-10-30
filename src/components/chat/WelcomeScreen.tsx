import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Compass,
  Scroll,
  Sparkles,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SupportRequest } from '../../types/database';
import { storage } from '../../lib/storage';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AIPersonaSelector } from './AIPersonaSelector';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string, targetLanguage?: 'auto' | 'en' | 'so' | 'ar', contextPrompt?: string) => void;
}

interface AnimatedCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  prompt: string;
  contextPrompt?: string;
}

// Legacy category suggestions reference (PROMPT_SUGGESTIONS):
// Categories: 'Quran & Tafsir', 'Salah & Worship', 'Somali Explanation'
// Dispatch pattern: onSelectPrompt(item.prompt, item.lang)

const ANIMATED_CARDS: AnimatedCard[] = [
  {
    id: 'faatixa',
    icon: BookOpen,
    title: 'Macnaha Suuratul Faatixa',
    prompt: 'Waa maxay macnaha Suuratul Faatixa iyo dulucdeeda guud?',
    contextPrompt: "Macnaha iyo Tafsiirka Suuratul Faatixa (Ummul Kitaab):\n1. 7-da aayadood iyo dulucdooda (Al-Xamdu lillaah, Ar-Raxmaan, Maaliki yowmid-diin, Iyyaaka na'budu, Ihdinas-siraad).\n2. Xadiiskii Qudusiga ahaa ee wada-sheekeysiga Alle iyo addoonka ee salaadda dhexdeeda (Sahih Muslim 395).\n3. Tiirnimada Faatixada ee salaadda iyo xukunkeeda.",
  },
  {
    id: 'salaadda',
    icon: Compass,
    title: 'Sida Loo Tukado Salaadda',
    prompt: 'Sidee loo tukadaa salaadda, maxayse yihiin shuruudaha iyo tiirarka salaadda?',
    contextPrompt: "Tilmaanta tallaabo-tallaabo ee sida loo tukado salaadda saxda ah:\n1. Takbiirta hore (Takbiirat al-Ixraam) iyo ducada furashada (Istiftaax).\n2. Akhrinta Faatixada iyo suurad kaddib.\n3. Rukuuca, Ictidaalka, Sujuudda iyo fadhiga labada sujuudood dhexdooda iyo waxa la dhaho.\n4. Tashaxudka koowaad iyo Tashaxudka dambe oo leh salaadda Nabiga ﷺ iyo salaamo-naqsiga.",
  },
  {
    id: 'waysada',
    icon: Scroll,
    title: 'Waxyaabaha Buriya Waysada',
    prompt: 'Maxay yihiin waxyaabaha buriya waysada ee waajibka ka dhiga in la cusboonaysiiyo?',
    contextPrompt: "Waxyaabaha buriya waysada (Nawaaqidul Wuduu):\n1. Wax kasta oo ka soo baxa labada dariiq (kaadi, saxaro, dabayl, dheecaan).\n2. Hurdada culus ee dareenka kaxeysa iyo miyir-beelka.\n3. Taabashada xubinta taranka iyadoo aan dhar u dhexeynin.\n4. Aragtida madhabaha ee ku saabsan taabashada dumarka iyo cunista hilibka geela.",
  },
  {
    id: 'ikhlaas',
    icon: Sparkles,
    title: 'Tafsiirka Suuratul Ikhlaas',
    prompt: 'Sharaxaad kooban iyo tafsiir ku saabsan Suuratul Ikhlaas iyo fadligeeda.',
    contextPrompt: "Sharaxaad iyo Tafsiir ku saabsan Suuratul Ikhlaas (Suuradda 112) iyo fadligeeda weyn ee u dhigma 1/3 Quraanka Kariimka ah.",
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const { user } = useAuth();
  const [unreadReply, setUnreadReply] = useState<{ id: string; reference_id: string; subject?: string } | null>(null);
  const [isReplyDismissed, setIsReplyDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSupportReplies = async () => {
      try {
        let readIds: string[] = [];
        try {
          const raw = localStorage.getItem('emufti_read_support_replies');
          if (raw) readIds = JSON.parse(raw);
        } catch {}

        let requests: SupportRequest[] = [];
        if (isSupabaseConfigured && user?.id) {
          try {
            const { data } = await supabase
              .from('support_requests')
              .select('id, reference_id, subject, description, admin_reply, status')
              .eq('user_id', user.id)
              .not('admin_reply', 'is', null);
            if (data && Array.isArray(data)) {
              requests = data as any;
            }
          } catch (e) {
            console.warn('[WelcomeScreen] Supabase reply check fallback:', e);
          }
        }

        const localRequests = storage.getSupportRequests(user?.id || null);
        for (const loc of localRequests) {
          if (loc.admin_reply && !requests.some((r) => r.reference_id === loc.reference_id)) {
            requests.push(loc);
          }
        }

        const unread = requests.find((r) => r.admin_reply && !readIds.includes(r.id));
        if (isMounted && unread) {
          setUnreadReply({
            id: unread.id,
            reference_id: unread.reference_id,
            subject: unread.subject || unread.description,
          });
        }
      } catch (err) {
        console.warn('[WelcomeScreen] Error checking replies:', err);
      }
    };

    checkSupportReplies();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDismissReply = (id: string) => {
    setIsReplyDismissed(true);
    try {
      const raw = localStorage.getItem('emufti_read_support_replies');
      const prev = raw ? JSON.parse(raw) : [];
      if (!prev.includes(id)) {
        localStorage.setItem('emufti_read_support_replies', JSON.stringify([...prev, id]));
      }
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 sm:pt-10 pb-32 sm:pb-40 max-w-3xl mx-auto w-full text-center select-none">
      {/* =================================================================== */}
      {/* 1. CENTER HERO HEADER: Central Rounded Blue Icon (floatSlow) with Frontend Logo */}
      {/* =================================================================== */}
      <div className="mb-5 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 animate-float-slow mx-auto overflow-hidden p-2 bg-white border-2 border-blue-600/30">
          <img
            src="/logo-frontend.png"
            alt="EMufti AI Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Main Heading with "diinta Islaamka?" in text-blue-600 */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 max-w-2xl mx-auto leading-tight">
        Maxaad jeclaan lahayd inaad ka ogaato{' '}
        <span className="text-blue-600 dark:text-blue-500">diinta Islaamka?</span>
      </h2>

      {/* Subheading */}
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto mb-4 leading-relaxed">
        EMufti AI waxay ku siinaysaa aqoon diini ah oo sax ah adigoo adeegsanaya Qur'aanka Kariimka ah, Sunnada suubban, iyo ilo la hubiyay.
      </p>

      {/* Feature 19: AI Persona Selector */}
      <div className="mb-6 flex justify-center">
        <AIPersonaSelector compact />
      </div>

      {/* Unread Support Response Notice (if any) */}
      {unreadReply && !isReplyDismissed && (
        <div className="mb-6 w-full p-3.5 sm:p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-left flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Support Response Received
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  Verified Support Team
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  #{unreadReply.reference_id}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 line-clamp-1">
                Our support team has reviewed and replied to your ticket. Click to view the official response.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-3">
            <Link
              to="/help?tab=my_requests"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1"
            >
              <span>View Reply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => handleDismissReply(unreadReply.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. 2x2 ANIMATED PROMPT CARDS GRID: Staggered Entrance & Hover Micro */}
      {/* =================================================================== */}
      {/* Prominent Holy Quran Feature Link */}
      <div className="w-full max-w-3xl mb-4">
        <Link
          to="/quran"
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                Qur'aanka Kariimka (Mushaf Dijitaal ah)
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Akhriso 604-ta bog ee Mushafka Madinah oo leh 50 Qaari, Tafsiir & Subcis.
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl w-full text-left mb-8 sm:mb-12 pb-2">
        {ANIMATED_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectPrompt(card.prompt, 'so', card.contextPrompt)}
              style={{ animationDelay: `${(idx + 1) * 0.08}s` }}
              className="group relative p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-850 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-left flex items-start gap-3.5 cursor-pointer shadow-xs animate-fade-in-up backdrop-blur-xs"
            >
              {/* Left icon badge: transitions to solid royal blue on hover */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 transition-all duration-300 shrink-0 mt-0.5 shadow-2xs">
                <Icon className="w-5 h-5 transition-colors" />
              </div>

              {/* Card Title & Content */}
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                  "{card.prompt}"
                </p>
              </div>

              {/* Sliding Right Arrow revealed on hover */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center justify-center shadow-xs">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Trust & Scope Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        <span className="font-semibold">
          Qur'aanka • Sunnada • Fiqiga • Afarta Madhabood • Culimada Soomaaliyeed
        </span>
      </div>
    </div>
  );
};
