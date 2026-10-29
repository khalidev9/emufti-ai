import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Layers,
  Compass,
  ArrowRight,
  Hash,
  Check,
} from 'lucide-react';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { ALL_30_JUZ } from '../../data/juzMetadata';
import {
  ALL_60_HIZB,
  ALL_120_HALF_HIZB,
  ALL_240_RUB_AL_HIZB,
} from '../../data/quranDivisions';

export type NavTabType = 'surahs' | 'juz' | 'hizb' | 'half_hizb' | 'rub_al_hizb' | 'page';

interface QuranNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurahNumber: number;
  activeAyahNumber: number;
  currentPageNumber: number;
  onSelectSurah: (surahNumber: number, ayahNumber?: number) => void;
  onSelectPage: (pageNumber: number) => void;
  onSelectJuz: (juzNumber: number) => void;
  onSelectHizb: (hizbNumber: number) => void;
  onSelectHalfHizb: (halfHizbNumber: number) => void;
  onSelectRub: (rubNumber: number) => void;
}

export const QuranNavigationDrawer: React.FC<QuranNavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentSurahNumber,
  activeAyahNumber: _activeAyahNumber,
  currentPageNumber,
  onSelectSurah,
  onSelectPage,
  onSelectJuz,
  onSelectHizb,
  onSelectHalfHizb,
  onSelectRub,
}) => {
  const [activeTab, setActiveTab] = useState<NavTabType>('surahs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directPageInput, setDirectPageInput] = useState<string>('');

  if (!isOpen) return null;

  // Filter Surahs
  const filteredSurahs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_114_SURAHS;
    return ALL_114_SURAHS.filter(
      (s) =>
        s.number.toString().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.somaliNameTranslation?.toLowerCase().includes(q) ||
        s.name.includes(q)
    );
  }, [searchQuery]);

  // Filter Juz
  const filteredJuz = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_30_JUZ;
    return ALL_30_JUZ.filter(
      (j) =>
        j.number.toString().includes(q) ||
        j.nameArabic.includes(q) ||
        j.nameSomali.toLowerCase().includes(q) ||
        j.startSurahName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter Hizb
  const filteredHizb = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_60_HIZB;
    return ALL_60_HIZB.filter(
      (h) =>
        h.number.toString().includes(q) ||
        h.nameArabic.includes(q) ||
        h.nameSomali.toLowerCase().includes(q) ||
        h.startSurahName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter Half-Hizb (120 Barkiis)
  const filteredHalfHizb = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_120_HALF_HIZB;
    return ALL_120_HALF_HIZB.filter(
      (hh) =>
        hh.number.toString().includes(q) ||
        hh.nameArabic.includes(q) ||
        hh.nameSomali.toLowerCase().includes(q) ||
        hh.startSurahName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter Rub (240 Rubuc)
  const filteredRub = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_240_RUB_AL_HIZB;
    return ALL_240_RUB_AL_HIZB.filter(
      (r) =>
        r.number.toString().includes(q) ||
        r.nameArabic.includes(q) ||
        r.nameSomali.toLowerCase().includes(q) ||
        r.startSurahName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleJumpDirectPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(directPageInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      onSelectPage(p);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] h-full shadow-2xl flex flex-col z-10 border-l border-stone-200/80 dark:border-white/10 animate-in slide-in-from-right duration-200 select-none">
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Hagaha Qur'aanka (Quran Navigation)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Surahs, Juz, Hizb, Half-Hizb, Rub, & Pages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-2 bg-stone-100/70 dark:bg-stone-900/50 border-b border-stone-200/70 dark:border-white/5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('surahs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'surahs'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800'
            }`}
          >
            Suurad (114)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('juz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'juz'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800'
            }`}
          >
            Jizz (30)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hizb')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'hizb'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800'
            }`}
          >
            Xisbi (60)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('half_hizb')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'half_hizb'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800'
            }`}
          >
            Barkiis (120)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rub_al_hizb')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'rub_al_hizb'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800'
            }`}
          >
            Rubuc (240)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('page')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'page'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800'
            }`}
          >
            Bog (604)
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-stone-200/70 dark:border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'surahs'
                  ? 'Raadi suuradaha (magac, lambar)...'
                  : activeTab === 'juz'
                  ? 'Raadi Jizz (1-30)...'
                  : activeTab === 'hizb'
                  ? 'Raadi Xisbi (1-60)...'
                  : activeTab === 'half_hizb'
                  ? 'Raadi Barkiis (1-120)...'
                  : activeTab === 'rub_al_hizb'
                  ? 'Raadi Rubuc (1-240)...'
                  : 'Raadi bog (1-604)...'
              }
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800/80 border-0 focus:ring-1 focus:ring-emerald-500 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Tab 1: Surahs List */}
        {activeTab === 'surahs' && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 chat-scrollbar">
            {filteredSurahs.map((surah) => {
              const isSelected = surah.number === currentSurahNumber;
              return (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => {
                    onSelectSurah(surah.number, 1);
                    onClose();
                  }}
                  className={`group relative w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border border-transparent hover:border-emerald-500/30 hover:bg-stone-50/90 dark:hover:bg-stone-800/60 bg-white/40 dark:bg-stone-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 shadow-xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-emerald-500/15 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {surah.number}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground block truncate">
                          {surah.englishName}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ${
                            surah.revelationType === 'Meccan'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {surah.revelationType === 'Meccan' ? 'Makki' : 'Madani'}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {surah.englishNameTranslation} • {surah.numberOfAyahs} aayadood
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-arabic text-base text-emerald-700 dark:text-emerald-300 font-bold transition-transform duration-200 group-hover:scale-105">
                      {surah.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Juz List */}
        {activeTab === 'juz' && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 chat-scrollbar">
            {filteredJuz.map((j) => (
              <button
                key={j.number}
                type="button"
                onClick={() => {
                  onSelectJuz(j.number);
                  onClose();
                }}
                className="group w-full text-left p-3 rounded-2xl border border-stone-200/70 dark:border-white/5 hover:border-emerald-500/40 hover:bg-stone-50/90 dark:hover:bg-stone-800/60 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {j.number}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {j.nameSomali}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      Bilow: {j.startSurahName} ({j.startSurah}:{j.startAyah}) • Bogga {j.startPage}
                    </span>
                  </div>
                </div>
                <span className="font-arabic text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0 transition-transform duration-200 group-hover:scale-105">
                  {j.nameArabic}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: 60 Hizbs */}
        {activeTab === 'hizb' && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 chat-scrollbar">
            {filteredHizb.map((h) => (
              <button
                key={h.number}
                type="button"
                onClick={() => {
                  onSelectHizb(h.number);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border border-stone-200/70 dark:border-white/5 hover:border-emerald-500/40 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {h.number}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {h.nameSomali}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {h.startSurahName} ({h.startSurah}:{h.startAyah}) • Bogga {h.startPage}
                    </span>
                  </div>
                </div>
                <span className="font-arabic text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                  {h.nameArabic}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 4: 120 Half-Hizb (Barkiis) */}
        {activeTab === 'half_hizb' && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 chat-scrollbar">
            {filteredHalfHizb.map((hh) => (
              <button
                key={hh.number}
                type="button"
                onClick={() => {
                  onSelectHalfHizb(hh.number);
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl border border-stone-200/70 dark:border-white/5 hover:border-emerald-500/40 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all flex items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {hh.number}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {hh.nameSomali}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {hh.startSurahName} • Bogga {hh.startPage}
                    </span>
                  </div>
                </div>
                <span className="font-arabic text-xs font-medium text-muted-foreground shrink-0">
                  {hh.nameArabic}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 5: 240 Rub al-Hizb (Rubuc) */}
        {activeTab === 'rub_al_hizb' && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 chat-scrollbar">
            {filteredRub.map((r) => (
              <button
                key={r.number}
                type="button"
                onClick={() => {
                  onSelectRub(r.number);
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl border border-stone-200/70 dark:border-white/5 hover:border-emerald-500/40 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all flex items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {r.number}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {r.nameSomali}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {r.startSurahName} • Bogga {r.startPage}
                    </span>
                  </div>
                </div>
                <span className="font-arabic text-xs font-medium text-muted-foreground shrink-0">
                  {r.nameArabic}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 6: 604 Pages Direct Jump & Grid */}
        {activeTab === 'page' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
            {/* Direct Page Input */}
            <form onSubmit={handleJumpDirectPage} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={604}
                value={directPageInput}
                onChange={(e) => setDirectPageInput(e.target.value)}
                placeholder="Geli lambarka bogga (1-604)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border-0 focus:ring-1 focus:ring-emerald-500 text-foreground"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Tag Bogga
              </button>
            </form>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Bogagga Muhiimka ah (Key Quran Pages):
            </div>

            {/* Quick Page Jump Pills */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 282, 293, 305, 440, 562, 582, 604].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => {
                    onSelectPage(page);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    page === currentPageNumber
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                      : 'border-stone-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-xs font-bold block">Bog {page}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
