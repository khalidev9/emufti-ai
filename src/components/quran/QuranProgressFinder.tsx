import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  BookOpen,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Surah, Ayah } from '../../types/database';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { ALL_30_JUZ, calculateQuranLocationProgress, getJuzForPage } from '../../data/juzMetadata';
import { quranService } from '../../lib/quranService';

interface QuranProgressFinderProps {
  userId?: string;
  onNavigateToQuran?: (surahNumber: number, ayahNumber: number) => void;
  uiLanguage: 'en' | 'so' | 'ar';
}

type FinderMode = 'by_surah' | 'by_juz';

export const QuranProgressFinder: React.FC<QuranProgressFinderProps> = ({
  userId,
  onNavigateToQuran,
  uiLanguage,
}) => {
  const [mode, setMode] = useState<FinderMode>('by_surah');

  // Search by Surah & Ayah state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(1);
  const [ayahData, setAyahData] = useState<Ayah | null>(null);
  const [isLoadingAyah, setIsLoadingAyah] = useState<boolean>(false);

  // Search by Juz state
  const [selectedJuzNumber, setSelectedJuzNumber] = useState<number>(30); // Default to Juz Amma

  // Saved position confirmation toast
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const selectedSurah = ALL_114_SURAHS.find((s) => s.number === selectedSurahNumber) || ALL_114_SURAHS[0];

  // Load saved user position on mount
  useEffect(() => {
    loadSavedPosition();
  }, [userId]);

  const loadSavedPosition = async () => {
    try {
      const pos = await quranService.getUserPosition(userId);
      if (pos && pos.last_surah) {
        setSelectedSurahNumber(pos.last_surah);
        setSelectedAyahNumber(pos.last_verse || 1);
      }
    } catch {}
  };

  // Fetch ayah details to get exact page, juz, hizbQuarter metadata
  useEffect(() => {
    fetchAyahMeta();
  }, [selectedSurahNumber, selectedAyahNumber]);

  const fetchAyahMeta = async () => {
    setIsLoadingAyah(true);
    try {
      const verses = await quranService.fetchSurahVerses(selectedSurahNumber);
      const found = verses.find((a) => a.numberInSurah === selectedAyahNumber) || verses[0];
      setAyahData(found);
    } catch (e) {
      console.warn('Failed to fetch specific ayah metadata:', e);
    } finally {
      setIsLoadingAyah(false);
    }
  };

  // Calculations for Mode A: Surah & Ayah
  const mushafPage = ayahData?.page || selectedSurah.page || 1;
  const juzNum = ayahData?.juz || getJuzForPage(mushafPage).number;
  const hizbQuarter = ayahData?.hizbQuarter;

  const progressStats = calculateQuranLocationProgress(mushafPage, juzNum, hizbQuarter, 604);

  // Mode B: Selected Juz stats
  const selectedJuz = ALL_30_JUZ[selectedJuzNumber - 1] || ALL_30_JUZ[29];
  const precedingJuzCount = selectedJuz.number - 1;
  const remainingJuzCount = 30 - selectedJuz.number;
  const precedingPagesCount = selectedJuz.startPage - 1;
  const remainingPagesCount = 604 - selectedJuz.endPage;

  const handleSaveCurrentPosition = async () => {
    await quranService.saveUserPosition(
      userId || 'guest',
      selectedSurahNumber,
      selectedAyahNumber,
      mushafPage,
      juzNum,
      progressStats.hizb,
      selectedSurah.englishName
    );

    setSaveSuccessMsg(
      uiLanguage === 'so'
        ? `Mowqifkaaga akhriska waxaa loo kaydiyay: ${selectedSurah.englishName}, Aayadda ${selectedAyahNumber}`
        : `Reading position saved: ${selectedSurah.englishName}, Ayah ${selectedAyahNumber}`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-foreground">
                {uiLanguage === 'so'
                  ? 'Raadi Meeshaad Joogto (Quran Progress Finder)'
                  : uiLanguage === 'ar'
                  ? 'محدد موضع القراءة في القرآن الكريم'
                  : 'Quran Progress Finder (Where Am I in the Quran?)'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {uiLanguage === 'so'
                ? 'Geli suuradda iyo aayadda aad mareyso ama dooro Juz si aad u ogaato bogga, xisbiga, inta kuu dhiman iyo inta aad soo akhriday.'
                : uiLanguage === 'ar'
                ? 'حدد السورة والآية أو الجزء لمعرفة رقم الصفحة والحزب وما أنجزته والمتبقي بدقة وفق مصحف المدينة ٦٠٤ صفحة.'
                : 'Determine your exact Quran location by Surah/Ayah or Juz: calculated pages, Juz completed, and pages remaining in the standard 604-page Madinah Mushaf.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setMode('by_surah')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'by_surah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {uiLanguage === 'so' ? 'Ku Raadi Suurad & Aayad' : 'By Surah & Ayah'}
            </button>
            <button
              type="button"
              onClick={() => setMode('by_juz')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'by_juz'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {uiLanguage === 'so' ? 'Ku Raadi Juz (1–30)' : 'By Juz (1–30)'}
            </button>
          </div>
        </div>

        {/* Success toast */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* MODE A: Find by Surah & Ayah */}
      {mode === 'by_surah' && (
        <div className="space-y-6">
          {/* Input Controls Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Surah Dropdown */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {uiLanguage === 'so' ? '1. Dooro Suuradda' : '1. Select Surah'}
                </label>
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => {
                    setSelectedSurahNumber(Number(e.target.value));
                    setSelectedAyahNumber(1);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border/80 focus:ring-1 focus:ring-emerald-500 text-foreground cursor-pointer"
                >
                  {ALL_114_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.englishName} ({s.name}) — {s.numberOfAyahs} verses
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayah Number Input */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {uiLanguage === 'so' ? '2. Geli Tirada Aayadda' : '2. Enter Ayah Number'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={selectedSurah.numberOfAyahs}
                    value={selectedAyahNumber}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= selectedSurah.numberOfAyahs) {
                        setSelectedAyahNumber(val);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border/80 focus:ring-1 focus:ring-emerald-500 text-foreground"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    / {selectedSurah.numberOfAyahs} ayahs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formatted Output Results Card (User-Friendly Display) */}
          <div className="bg-card border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xs bg-emerald-500/5 space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
                Madinah Mushaf (604 Pages)
              </span>

              {/* Exact user-friendly result block */}
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-3">
                {uiLanguage === 'so'
                  ? `Waxaad joogtaa: Suuradda ${selectedSurah.englishName} (${selectedSurah.name}), Aayadda ${selectedAyahNumber}`
                  : uiLanguage === 'ar'
                  ? `موضعك الحالي: سورة ${selectedSurah.name} (${selectedSurah.englishName})، الآية ${selectedAyahNumber}`
                  : `You are at: Surah ${selectedSurah.englishName} (${selectedSurah.name}), Ayah ${selectedAyahNumber}`}
              </h3>
            </div>

            {/* Structured Calculated Metrics List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border/80">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {uiLanguage === 'so' ? 'Juz-ka' : 'Juz'}
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  Juz {progressStats.juz} / 30
                </span>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border/80">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {uiLanguage === 'so' ? 'Xisbiga & Rubuca' : 'Hizb & Quarter'}
                </span>
                <span className="text-lg font-bold text-foreground mt-1 block">
                  Hizb {progressStats.hizb} (Rub\' {progressStats.quarter})
                </span>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border/80">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {uiLanguage === 'so' ? 'Bogga (Page)' : 'Mushaf Page'}
                </span>
                <span className="text-lg font-bold text-foreground mt-1 block">
                  Page {progressStats.page} of 604
                </span>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border/80">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {uiLanguage === 'so' ? 'Boqolkiiba' : 'Overall Progress'}
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {progressStats.percentage}%
                </span>
              </div>
            </div>

            {/* Preceding vs Remaining Detailed Comparison */}
            <div className="p-4 rounded-xl bg-background border border-border/80 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">
                  {uiLanguage === 'so' ? '• Bogagga kaa horreeya (Pages completed before):' : '• Pages completed before:'}
                </span>
                <span className="font-bold text-foreground">{progressStats.pagesCompletedBefore} pages</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">
                  {uiLanguage === 'so' ? '• Bogagga kuu dhiman / haray (Pages remaining after):' : '• Pages remaining after:'}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {progressStats.pagesRemainingAfter} pages
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">
                  {uiLanguage === 'so' ? '• Juz-yada kaa horreeya (Juz completed before):' : '• Juz completed before:'}
                </span>
                <span className="font-bold text-foreground">{progressStats.juzCompletedBefore} Juz</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">
                  {uiLanguage === 'so' ? '• Juz-yada kuu haray (Juz remaining after):' : '• Juz remaining after:'}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {progressStats.juzRemainingAfter} Juz
                </span>
              </div>
            </div>

            {/* Visual Location Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span>Surah 1: Al-Fatihah</span>
                <span className="text-emerald-600 font-bold">Current: {selectedSurah.englishName}</span>
                <span>Surah 114: An-Nas</span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-2.5 overflow-hidden border border-border/60">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressStats.percentage}%` }}
                />
              </div>
            </div>

            {/* Actions: Save Position & Read in Quran */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveCurrentPosition}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {uiLanguage === 'so' ? 'U Kaydi Meeshayda Akhriska' : 'Save as My Current Reading Position'}
                </span>
              </button>

              {onNavigateToQuran && (
                <button
                  type="button"
                  onClick={() => onNavigateToQuran(selectedSurahNumber, selectedAyahNumber)}
                  className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>{uiLanguage === 'so' ? 'Ka Akhri Halkan' : 'Read Ayah in Quran'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE B: Find by Juz (All 30 Juz in order) */}
      {mode === 'by_juz' && (
        <div className="space-y-6">
          {/* Selected Juz Card */}
          <div className="bg-card border border-emerald-500/30 rounded-2xl p-6 shadow-xs bg-emerald-500/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
                  {selectedJuz.number === 30 ? '★ JUZ 30 (JUZ AMMA)' : `JUZ ${selectedJuz.number} OF 30`}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  {selectedJuz.nameEnglish} • <span className="font-arabic">{selectedJuz.nameArabic}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedJuz.nameSomali}</p>
              </div>

              {onNavigateToQuran && (
                <button
                  type="button"
                  onClick={() => onNavigateToQuran(selectedJuz.startSurah, selectedJuz.startAyah)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Read Start of Juz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-background border border-border/80">
                <span className="text-[10px] font-semibold text-muted-foreground block">Starting Verse</span>
                <span className="font-bold text-foreground mt-1 block">
                  {selectedJuz.startSurahName} {selectedJuz.startSurah}:{selectedJuz.startAyah}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border/80">
                <span className="text-[10px] font-semibold text-muted-foreground block">Ending Verse</span>
                <span className="font-bold text-foreground mt-1 block">
                  {selectedJuz.endSurahName} {selectedJuz.endSurah}:{selectedJuz.endAyah}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border/80">
                <span className="text-[10px] font-semibold text-muted-foreground block">Mushaf Page Range</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  Pages {selectedJuz.startPage} – {selectedJuz.endPage}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border/80">
                <span className="text-[10px] font-semibold text-muted-foreground block">Hizb Range</span>
                <span className="font-bold text-foreground mt-1 block">
                  Hizb {selectedJuz.startHizb} – {selectedJuz.endHizb}
                </span>
              </div>
            </div>

            {/* Preceding vs Remaining Calculation */}
            <div className="p-3 rounded-xl bg-background border border-border/80 text-xs flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
              <span>
                • Preceding: <strong>{precedingJuzCount} Juz</strong> ({precedingPagesCount} pages)
              </span>
              <span>
                • Total in this Juz: <strong>{selectedJuz.totalPages} pages</strong>
              </span>
              <span>
                • Remaining after: <strong>{remainingJuzCount} Juz</strong> ({remainingPagesCount} pages)
              </span>
            </div>
          </div>

          {/* Interactive Grid of all 30 Juz */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {ALL_30_JUZ.map((j) => {
              const isSelected = selectedJuzNumber === j.number;
              const isJuzAmma = j.number === 30;

              return (
                <button
                  key={j.number}
                  type="button"
                  onClick={() => setSelectedJuzNumber(j.number)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : isJuzAmma
                      ? 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20 text-foreground'
                      : 'bg-card border-border/80 hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Juz {j.number}</span>
                    {isJuzAmma && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300">
                        Amma
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] opacity-80 truncate">{j.startSurahName}</p>
                  <p className="text-[9px] opacity-70 mt-1">p. {j.startPage}–{j.endPage}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
