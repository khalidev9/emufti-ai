import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  MessageSquare,
  Trophy,
  Mic,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  ChevronRight,
  Headphones,
  Layers,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import { storage } from '../lib/storage';
import { quranService } from '../lib/quranService';
import { getDetailedIslamicDate } from '../lib/islamicCalendarService';
import { PlanRequestModal } from '../components/plans/PlanRequestModal';
import { SubscriptionBadge } from '../components/common/SubscriptionBadge';
import { ALL_114_SURAHS } from '../data/quranMetadata';
import { QuranReadingProgress, SavedItem, Conversation, PlanSlug } from '../types/database';

import { PrayerTimesWidget } from '../components/dashboard/PrayerTimesWidget';
import { ReadingStreakWidget } from '../components/dashboard/ReadingStreakWidget';
import { QuranAnalyticsWidget } from '../components/dashboard/QuranAnalyticsWidget';
import { QuranKhatmChallengeWidget } from '../components/dashboard/QuranKhatmChallengeWidget';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, activePlan } = useAuth();
  const { language, t } = useLanguage();
  const { createNewChat } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Real Application Data State (Zero fabricated numbers)
  const userId = user?.id || 'seeker_user';
  const [readingProgress, setReadingProgress] = useState<QuranReadingProgress | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // Load real user data
  useEffect(() => {
    // 1. Quran Reading Progress
    quranService.getReadingProgress(userId).then((progress) => {
      setReadingProgress(progress);
    });

    // 2. Real Conversations
    const userConvs = storage.getConversations(userId);
    setConversations(userConvs.slice(0, 4));

    // 3. Saved Items
    const items = storage.getSavedItems(userId);
    setSavedItems(items);
  }, [userId]);

  // Quota & Daily Usage
  const usage = storage.getDailyUsage(userId);
  const planLimits: Record<PlanSlug, number> = { free: 5, pro: 150, premium: 1000 };
  const currentLimit = planLimits[activePlan] || 5;
  const remainingToday = Math.max(0, currentLimit - usage.count);
  const usedPercent = Math.min(100, Math.round((usage.count / currentLimit) * 100));

  // Islamic & Gregorian Date
  const islamicDate = useMemo(() => getDetailedIslamicDate(new Date()), []);

  const handleStartNewConsultation = async () => {
    const newId = await createNewChat();
    navigate(`/chat/${newId}`);
  };

  // Find Surah metadata for last read
  const lastSurahMeta = useMemo(() => {
    if (!readingProgress?.last_surah) return null;
    return ALL_114_SURAHS.find((s) => s.number === readingProgress.last_surah);
  }, [readingProgress?.last_surah]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans w-full max-w-full overflow-x-hidden box-border">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out w-full max-w-full overflow-x-hidden box-border ${
          isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        <Header
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          onOpenShareModal={() => {}}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 w-full max-w-full overflow-x-hidden box-border">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* 1. Modern Welcome & Islamic Date Header */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 border border-blue-100 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    <span>{islamicDate.fullHijriString} • {islamicDate.gregorianString}</span>
                    {islamicDate.islamicEvent && (
                      <span className="hidden sm:inline font-bold text-blue-900">
                        ({islamicDate.islamicEvent})
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    As-salamu alaykum,{' '}
                    <span className="text-blue-600">
                      {profile?.display_name || user?.email?.split('@')[0] || 'Seeker of Knowledge'}
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Continue your authentic journey in understanding the Holy Quran, Prophetic Sunnah, and verified rulings of the Shariah.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleStartNewConsultation}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Weydii Muftiga (Ask AI)</span>
                  </button>

                  <Link
                    to="/quran"
                    className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Xarunta Qur'aanka</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Real Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Metric 1: Quran Reading Progress */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Quran Progress</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {readingProgress?.last_verse ? `Ayah ${readingProgress.last_verse}` : 'Surah Al-Fatihah'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {lastSurahMeta ? `${lastSurahMeta.name} (Ayah ${readingProgress?.last_verse || 1})` : 'Ready to begin'}
                </div>
              </div>

              {/* Metric 2: Today's Inquiries Remaining */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Inquiry Quota</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-blue-600">
                  {remainingToday} Left
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {usage.count} of {currentLimit} used today
                </div>
              </div>

              {/* Metric 3: Islamic Inquiries */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Inquiries</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {conversations.length}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Islamic discussions & fatwas
                </div>
              </div>

              {/* Metric 4: Saved Knowledge Items */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Saved Proofs</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Bookmark className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {savedItems.length}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Bookmarked references
                </div>
              </div>
            </div>

            {/* 3. Continue Learning Banner */}
            {readingProgress && lastSurahMeta && (
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 block">
                      Continue Quran Reading
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {lastSurahMeta.name} ({lastSurahMeta.englishName}) — Ayah {readingProgress.last_verse || 1}
                    </h3>
                  </div>
                </div>

                <Link
                  to="/quran?tab=subcis"
                  className="px-4 py-2 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* 4. Advanced Quran Reading Analytics & Statistics (Pages, Juzz, Ayahs) */}
            <QuranAnalyticsWidget userId={userId} />

            {/* 5. Location-Based Prayer Times & Reading Streak Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PrayerTimesWidget />
              <ReadingStreakWidget userId={userId} />
            </div>

            {/* 6. 1-Month Quran Completion Khidma (Khatm Challenge: 20 Pages / 5 Prayer Slots + PDF Certificate) */}
            <QuranKhatmChallengeWidget
              userId={userId}
              defaultUserName={profile?.display_name || user?.email?.split('@')[0] || 'Seeker of Knowledge'}
            />

            {/* 7. Core Application Navigation & Recent Consultations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols): Quick Hub & Recent Chats */}
              <div className="lg:col-span-2 space-y-6">
                {/* 8 Core Application Sections Quick Hub */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Islamic Learning Navigation</span>
                    </h2>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      All Core Sections
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { to: '/chat', label: 'EMufti Chat', desc: 'Islamic AI Scholar', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
                      { to: '/quran', label: "Xarunta Qur'aanka", desc: '114 Surahs & 30 Juz', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
                      { to: '/khitma', label: 'Khatm Challenge', desc: '604 Pages & Tasks', icon: Trophy, color: 'text-emerald-600 bg-emerald-50' },
                      { to: '/quran?tab=subcis', label: 'Subcis Practice', desc: 'Alternating Recitation', icon: Mic, color: 'text-cyan-600 bg-cyan-50' },
                      { to: '/quran?tab=50qaris', label: '50 Reciters', desc: 'Global Qurra Audio', icon: Headphones, color: 'text-indigo-600 bg-indigo-50' },
                      { to: '/saved', label: 'Saved Answers', desc: 'Custom Folders & Proofs', icon: Bookmark, color: 'text-rose-600 bg-rose-50' },
                      { to: '/pricing', label: 'Subscription Plans', desc: 'Upgrade Limits', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
                      { to: '/verify-certificate', label: 'Hubinta Shahaadada', desc: 'Verify Certificate ID', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left flex flex-col justify-between group cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 block truncate transition-colors">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Consultations */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Wadahadalladii U Dambeeyay (Recent Consultations)</span>
                    </h2>

                    <Link
                      to="/chat"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Dhamaan Eeg (View All)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {conversations.length > 0 ? (
                    <div className="divide-y divide-slate-100 space-y-0.5">
                      {conversations.map((conv) => (
                        <Link
                          key={conv.id}
                          to={`/chat/${conv.id}`}
                          className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {conv.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {new Date(conv.updated_at || conv.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <MessageSquare className="w-6 h-6 mx-auto text-slate-400" />
                      <p className="text-xs font-medium">No previous conversations recorded.</p>
                      <button
                        type="button"
                        onClick={handleStartNewConsultation}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Ask First Question
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (1 Col): Subscription Card */}
              <div className="space-y-6">
                {/* Subscription Status Card */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subscription Plan
                    </span>
                    <SubscriptionBadge plan={activePlan} size="sm" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Daily Inquiries</span>
                      <span className="font-mono font-bold text-slate-900">
                        {usage.count} / {currentLimit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                  </div>

                  {activePlan !== 'premium' ? (
                    <button
                      type="button"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="w-full py-2.5 min-h-[44px] rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upgrade Plan & Inquiries</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-blue-50/60 text-blue-700 text-xs font-semibold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Full Scholar Access Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Plan Request & Upgrade Modal */}
      <PlanRequestModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        defaultPlan={(activePlan === 'pro' ? 'premium' : 'pro') as PlanSlug}
      />
    </div>
  );
};
