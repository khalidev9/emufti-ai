import React, { useState, useMemo } from 'react';
import {
  Search,
  Mic,
  Bookmark,
  ChevronRight,
  Sparkles,
  TrendingUp,
  List,
  BookOpen,
} from 'lucide-react';
import { ALL_114_SURAHS, POPULAR_SURAHS } from '../../data/quranMetadata';
import { QuranKhatmChallengeWidget } from '../dashboard/QuranKhatmChallengeWidget';
import { useAuth } from '../../context/AuthContext';

interface QuranHeroExplorerProps {
  lastReadSurahNumber: number;
  lastReadVerseNumber: number;
  onSelectSurah: (surahNumber: number) => void;
  onSelectAyah: (surahNumber: number, ayahNumber: number) => void;
  onOpenSurahDrawer: () => void;
}

export const QuranHeroExplorer: React.FC<QuranHeroExplorerProps> = ({
  lastReadSurahNumber,
  lastReadVerseNumber,
  onSelectSurah,
  onSelectAyah,
  onOpenSurahDrawer,
}) => {
  const { user, profile } = useAuth();
  const userId = user?.id || 'seeker_user';
  const defaultUserName = profile?.display_name || user?.email?.split('@')[0] || 'Seeker of Knowledge';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'surahs' | 'popular'>('surahs');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Last read surah metadata
  const lastReadSurah = useMemo(() => {
    return ALL_114_SURAHS.find((s) => s.number === lastReadSurahNumber) || ALL_114_SURAHS[0];
  }, [lastReadSurahNumber]);

  // Quick popular surahs for Quran.com style popular filter
  const POPULAR_ITEMS = [
    { number: 36, name: 'Ya-Sin', arabic: 'يس', reason: 'Heart of Quran' },
    { number: 67, name: 'Al-Mulk', arabic: 'الملك', reason: 'Protection from punishment' },
    { number: 18, name: 'Al-Kahf', arabic: 'الكهف', reason: 'Friday Recitation' },
    { number: 55, name: 'Ar-Rahman', arabic: 'الرحمن', reason: 'The Beneficent' },
    { number: 56, name: 'Al-Waqi\'ah', arabic: 'الواقعة', reason: 'Abundance & Sustenance' },
    { number: 2, name: 'Ayat Al-Kursi (2:255)', arabic: 'آية الكرسي', ayah: 255 },
  ];

  // Quick inline search suggestions
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return ALL_114_SURAHS.filter(
      (s) =>
        s.number.toString() === q ||
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please type to search.');
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsVoiceListening(true);
    recognition.onend = () => setIsVoiceListening(false);
    recognition.onerror = () => setIsVoiceListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsVoiceListening(false);
    };

    recognition.start();
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-50/40 via-white to-transparent dark:from-slate-900/60 dark:via-slate-900 dark:to-transparent border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* ============================================================ */}
        {/* 1. KHATMA CHALLENGE BANNER & TRACKER INTERFACE (RELOCATED)   */}
        {/*    Positioned precisely in the highlighted area above search */}
        {/* ============================================================ */}
        <div className="w-full">
          <QuranKhatmChallengeWidget
            userId={userId}
            defaultUserName={defaultUserName}
            className="w-full"
            defaultExpanded={false}
          />
        </div>

        {/* ============================================================ */}
        {/* 2. REFACTORED CENTERED PILL SEARCH BAR (DESKTOP & MOBILE)    */}
        {/* ============================================================ */}
        <div className="relative max-w-2xl mx-auto w-full" data-tour="quran-search">
          <div className="relative flex items-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all p-1.5 pl-3.5 sm:pl-4 pr-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0 mr-2 sm:mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the Quran (e.g. Al-Baqarah, 2, 'mercy', 2:255)..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />

            {/* Voice search button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isVoiceListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
              title="Search with your voice"
              aria-label="Voice Search"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Live search autocomplete dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 p-2 space-y-1">
                  {searchResults.map((s) => (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => {
                        onSelectSurah(s.number);
                        setSearchQuery('');
                      }}
                      className="group w-full px-3 py-2.5 rounded-xl text-left hover:bg-blue-50/80 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-all duration-150 cursor-pointer hover:translate-x-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                          {s.number}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {s.englishName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {s.englishNameTranslation} • {s.numberOfAyahs} ayahs
                          </p>
                        </div>
                      </div>
                      <span className="font-arabic font-semibold text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform text-sm">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. QUICK FILTER PILL BUTTONS: Surah List & Popular */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('surahs');
                  onOpenSurahDrawer();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeFilter === 'surahs'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-blue-50/70 hover:text-blue-600'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Surah List</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'popular' ? 'surahs' : 'popular')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeFilter === 'popular'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-blue-50/70 hover:text-blue-600'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Popular Surahs</span>
              </button>
            </div>

            {/* Popular quick links grid when active */}
            {activeFilter === 'popular' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl mx-auto pt-1 animate-in fade-in duration-150">
                {POPULAR_ITEMS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (item.ayah) {
                        onSelectAyah(item.number, item.ayah);
                      } else {
                        onSelectSurah(item.number);
                      }
                    }}
                    className="group p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-left hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.reason}
                      </p>
                    </div>
                    <span className="font-arabic text-base text-blue-600 dark:text-blue-400 font-semibold group-hover:scale-110 transition-transform duration-200">
                      {item.arabic}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* ============================================================ */}
            {/* 4. "CONTINUE READING / MY QURAN" SECTION                     */}
            {/* ============================================================ */}
            <div className="pt-2 max-w-2xl mx-auto space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Continue Reading
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>My Quran</span>
                </span>
              </div>

              {/* Wide Rounded Card */}
              <div
                data-tour="continue-reading"
                data-testid="continue-reading-card"
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    {lastReadSurah.number}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lastReadSurah.englishName} — {lastReadSurah.englishNameTranslation}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Page {lastReadSurah.page} • Surah {lastReadSurah.number} • {lastReadSurah.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAyah(lastReadSurah.number, lastReadVerseNumber || 1)}
                  className="whitespace-nowrap shrink-0 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:scale-105"
                >
                  <span className="whitespace-nowrap">Verse {lastReadVerseNumber || 1}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
};
