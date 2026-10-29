import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Search,
  Sliders,
  X,
  ExternalLink,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Scroll,
  Info,
  ChevronDown,
  Layers,
  Headphones,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Surah, Ayah, QariReciter, QuranBookmark } from '../../types/database';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { ALL_30_JUZ, getJuzByNumber, getSurahsForJuz } from '../../data/juzMetadata';
import {
  ALL_60_HIZB,
  ALL_120_HALF_HIZB,
  ALL_240_RUB_AL_HIZB,
  HizbInfo,
  HalfHizbInfo,
  RubAlHizbInfo,
} from '../../data/quranDivisions';
import { quranService } from '../../lib/quranService';
import { SOMALI_SCHOLARS_TAFSIR } from '../../data/tafsirData';

export type QuranNavigationTab = 'suurad' | 'jizz' | 'hizb' | 'half_hizb' | 'rub_al_hizb';
export type QuranFontSize = 'sm' | 'md' | 'lg' | 'xl';

interface IntegratedQuranReaderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAskEMufti?: (prompt: string) => void;
  initialSurah?: number;
  initialAyah?: number;
}

export const IntegratedQuranReaderPanel: React.FC<IntegratedQuranReaderPanelProps> = ({
  isOpen,
  onClose,
  onAskEMufti,
  initialSurah = 1,
  initialAyah = 1,
}) => {
  // Navigation Tabs: Suurad (Surah), Jizz (Juz), Hizb (60), Half-Hizb (120 Barkiis), Rub al-Hizb (240 Rubuc)
  const [activeTab, setActiveTab] = useState<QuranNavigationTab>('suurad');
  
  // Selection States
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(initialSurah);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(initialAyah);
  const [surahAyahs, setSurahAyahs] = useState<Ayah[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [goToAyahInput, setGoToAyahInput] = useState<string>('');

  // Reading Preferences
  const [fontSize, setFontSize] = useState<QuranFontSize>('md');
  const [showSomaliTranslation, setShowSomaliTranslation] = useState<boolean>(true);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState<boolean>(false);
  const [readingMode, setReadingMode] = useState<'read' | 'listen'>('read');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Reciter & Audio States
  const [reciters, setReciters] = useState<QariReciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<QariReciter | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loopAyah, setLoopAyah] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Modals & Popovers
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Ayah | null>(null);
  const [activeViewAyah, setActiveViewAyah] = useState<Ayah | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Record<string, boolean>>({});
  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const versesContainerRef = useRef<HTMLDivElement | null>(null);
  const ayahElementRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Current metadata
  const currentSurah = useMemo(() => {
    return ALL_114_SURAHS.find((s) => s.number === currentSurahNumber) || ALL_114_SURAHS[0];
  }, [currentSurahNumber]);

  const currentJuz = useMemo(() => {
    return ALL_30_JUZ.find((j) => currentSurahNumber >= j.startSurah && currentSurahNumber <= j.endSurah) || ALL_30_JUZ[0];
  }, [currentSurahNumber]);

  // Load Reciters on Mount
  useEffect(() => {
    const allReciters = quranService.getReciters();
    setReciters(allReciters);
    const defaultReciter = quranService.getDefaultReciter();
    setSelectedReciter(defaultReciter);
  }, []);

  // Load Verses when Surah changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingVerses(true);

    quranService
      .fetchSurahVerses(currentSurahNumber)
      .then((ayahs) => {
        if (!isCancelled) {
          setSurahAyahs(ayahs);
          setIsLoadingVerses(false);
          // If active ayah is beyond length, reset to 1
          if (activeAyahNumber > ayahs.length) {
            setActiveAyahNumber(1);
          }
        }
      })
      .catch((err) => {
        console.warn('[IntegratedQuranReader] Verse load error:', err);
        if (!isCancelled) {
          setIsLoadingVerses(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentSurahNumber]);

  // Load User Bookmarks
  useEffect(() => {
    quranService.getBookmarks().then((bms) => {
      const map: Record<string, boolean> = {};
      bms.forEach((b) => {
        map[`${b.surah_number}:${b.ayah_number}`] = true;
      });
      setBookmarkedVerses(map);
    });
  }, []);

  // Smooth scroll to active ayah
  const scrollToAyah = (ayahNum: number) => {
    const el = ayahElementRefs.current[ayahNum];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Play Ayah Audio
  const playAyahAudio = (ayahNum: number) => {
    if (!selectedReciter) return;
    setAudioError(null);
    setIsAudioLoading(true);
    setActiveAyahNumber(ayahNum);

    const url = quranService.getVerseAudioUrl(selectedReciter, currentSurahNumber, ayahNum);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
          scrollToAyah(ayahNum);
        })
        .catch((err) => {
          console.warn('[IntegratedQuranReader] Audio play error:', err);
          setAudioError(`Audio stream unavailable for Ayah ${ayahNum}`);
          setIsPlaying(false);
          setIsAudioLoading(false);
        });
    }
  };

  // Audio Play / Pause Toggle
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === '') {
        playAyahAudio(activeAyahNumber);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => {
            console.warn('[IntegratedQuranReader] Resume error:', e);
            playAyahAudio(activeAyahNumber);
          });
      }
    }
  };

  // Next / Previous Ayah
  const handleNextAyah = () => {
    const totalAyahs = currentSurah?.numberOfAyahs || surahAyahs.length;
    if (activeAyahNumber < totalAyahs) {
      const nextNum = activeAyahNumber + 1;
      setActiveAyahNumber(nextNum);
      if (isPlaying) playAyahAudio(nextNum);
      scrollToAyah(nextNum);
    } else if (currentSurahNumber < 114) {
      // Advance to next surah
      setCurrentSurahNumber(currentSurahNumber + 1);
      setActiveAyahNumber(1);
    }
  };

  const handlePreviousAyah = () => {
    if (activeAyahNumber > 1) {
      const prevNum = activeAyahNumber - 1;
      setActiveAyahNumber(prevNum);
      if (isPlaying) playAyahAudio(prevNum);
      scrollToAyah(prevNum);
    } else if (currentSurahNumber > 1) {
      // Go to previous surah
      const prevSurahNum = currentSurahNumber - 1;
      const prevSurahMeta = ALL_114_SURAHS.find((s) => s.number === prevSurahNum);
      setCurrentSurahNumber(prevSurahNum);
      setActiveAyahNumber(prevSurahMeta?.numberOfAyahs || 1);
    }
  };

  // Audio time updates
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  // Audio ended handler
  const handleAudioEnded = () => {
    if (loopAyah) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
    } else {
      handleNextAyah();
    }
  };

  // Go to Ayah action
  const handleGoToAyahSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(goToAyahInput.trim(), 10);
    const maxAyahs = currentSurah?.numberOfAyahs || surahAyahs.length;
    if (!isNaN(num) && num >= 1 && num <= maxAyahs) {
      setActiveAyahNumber(num);
      scrollToAyah(num);
      if (readingMode === 'listen') {
        playAyahAudio(num);
      }
      setGoToAyahInput('');
    } else {
      showToast(`Aayadda waa inay u dhaxaysaa 1 iyo ${maxAyahs}`);
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = async (ayah: Ayah) => {
    const key = `${currentSurahNumber}:${ayah.numberInSurah}`;
    const isCurrentlyBookmarked = Boolean(bookmarkedVerses[key]);

    if (isCurrentlyBookmarked) {
      await quranService.deleteBookmark(currentSurahNumber, ayah.numberInSurah);
      setBookmarkedVerses((prev) => ({ ...prev, [key]: false }));
      showToast(`Aayadda ${ayah.numberInSurah} waa laga saaray keydka`);
    } else {
      await quranService.saveBookmark({
        surah_number: currentSurahNumber,
        ayah_number: ayah.numberInSurah,
        surah_name: currentSurah.englishName,
        arabic_text: ayah.text,
        translation: ayah.translationSo || ayah.translationEn,
        note: `Saved from Quran Reader`,
      });
      setBookmarkedVerses((prev) => ({ ...prev, [key]: true }));
      showToast(`Aayadda ${ayah.numberInSurah} si guul leh ayaa loo keydiyay`);
    }
  };

  // Copy Ayah
  const handleCopyAyah = (ayah: Ayah) => {
    const text = `Suuradda ${currentSurah.englishName} (${currentSurahNumber}:${ayah.numberInSurah})\n\n« ${ayah.text} »\n\n${ayah.translationSo ? `Soomaali: ${ayah.translationSo}` : ''}\n${ayah.translationEn ? `English: ${ayah.translationEn}` : ''}\n\n— EMufti AI Holy Quran`;
    navigator.clipboard.writeText(text);
    const key = `${currentSurahNumber}:${ayah.numberInSurah}`;
    setCopiedAyahKey(key);
    showToast('Aayadda si buuxda ayaa loo guriyay');
    setTimeout(() => setCopiedAyahKey(null), 2000);
  };

  // Ask EMufti action: sends verse context to AI Chat (Center Panel B)
  const handleAskEMufti = (ayah: Ayah) => {
    const prompt = `Fadlan ii faahfaahi aayaddan: Suuradda ${currentSurah.englishName} (${currentSurahNumber}:${ayah.numberInSurah})\n\n« ${ayah.text} »\n\nMaxay aayaddani ka hadlaysaa, maxaase laga baran karaa xagga caqiidada, axkaamta, iyo duruusta nolosha?`;
    
    if (onAskEMufti) {
      onAskEMufti(prompt);
      showToast('Su\'aasha waxaa loo diray EMufti AI Chat');
      // If mobile width (< 1024), close panel to display response
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtered Surahs for quick search
  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return ALL_114_SURAHS;
    const q = surahSearch.toLowerCase().trim();
    return ALL_114_SURAHS.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        (s.somaliNameTranslation && s.somaliNameTranslation.toLowerCase().includes(q)) ||
        String(s.number).includes(q)
    );
  }, [surahSearch]);

  // Font size classes
  const getArabicFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-lg leading-loose';
      case 'lg':
        return 'text-2xl leading-loose';
      case 'xl':
        return 'text-3xl leading-loose';
      case 'md':
      default:
        return 'text-xl leading-loose';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Main Quran Reader Panel Shell */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-[95vw] lg:static lg:z-20 lg:w-[400px] xl:w-[440px] lg:max-w-none border-l border-border bg-white dark:bg-[#121212] text-foreground flex flex-col h-full shadow-2xl lg:shadow-none overflow-hidden transition-all duration-200">
        
        {/* ========================================================================= */}
        {/* PANEL HEADER: Title "Quran", Close button, Division Tabs                   */}
        {/* ========================================================================= */}
        <div className="shrink-0 border-b border-border/70 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm select-none">
          <div className="h-14 px-3.5 sm:px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">Quran</h2>
                <p className="text-[10px] text-muted-foreground">
                  Holy Quran Reader & Recitations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Settings Toggle */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                  isSettingsOpen
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Reading Settings (Fonts, Translations)"
                aria-label="Reading Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Close Quran Reader"
                aria-label="Close Quran Reader"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5 Primary Navigation Tabs */}
          <div className="flex items-center px-2 pb-2 gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'suurad', label: 'Suurad', badge: '114' },
              { id: 'jizz', label: 'Jizz', badge: '30' },
              { id: 'hizb', label: 'Hizb', badge: '60' },
              { id: 'half_hizb', label: 'Half-Hizb', badge: '120' },
              { id: 'rub_al_hizb', label: 'Rub al-Hizb', badge: '240' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as QuranNavigationTab)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Collapsible Settings Drawer */}
          {isSettingsOpen && (
            <div className="p-3 bg-muted/40 border-t border-border/60 text-xs space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Dooro cabbirka:</span>
                <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
                  {[
                    { id: 'sm', label: 'Yar' },
                    { id: 'md', label: 'Caadi' },
                    { id: 'lg', label: 'Weyn' },
                    { id: 'xl', label: 'Aad u weyn' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setFontSize(sz.id as QuranFontSize)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        fontSize === sz.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Somali Translation (Abduh):</span>
                <button
                  type="button"
                  onClick={() => setShowSomaliTranslation(!showSomaliTranslation)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    showSomaliTranslation ? 'bg-blue-600' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showSomaliTranslation ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">English Translation (Saheeh):</span>
                <button
                  type="button"
                  onClick={() => setShowEnglishTranslation(!showEnglishTranslation)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    showEnglishTranslation ? 'bg-blue-600' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showEnglishTranslation ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Mode:</span>
                <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setReadingMode('read')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      readingMode === 'read'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingMode('listen')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      readingMode === 'listen'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Listen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SELECTION CONTROLS ROW: Surah Dropdown, Juz Dropdown, Go to Ayah          */}
        {/* ========================================================================= */}
        <div className="p-3 border-b border-border/60 bg-muted/20 space-y-2 select-none shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {/* Surah Selector */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Surah (1-114)
              </label>
              <select
                value={currentSurahNumber}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setCurrentSurahNumber(num);
                  setActiveAyahNumber(1);
                  if (isPlaying) playAyahAudio(1);
                }}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-border/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {ALL_114_SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.englishName} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Juz Selector */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Juz (1-30)
              </label>
              <select
                value={currentJuz.number}
                onChange={(e) => {
                  const jNum = Number(e.target.value);
                  const selectedJuz = getJuzByNumber(jNum);
                  if (selectedJuz) {
                    setCurrentSurahNumber(selectedJuz.startSurah);
                    setActiveAyahNumber(selectedJuz.startAyah);
                  }
                }}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-border/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {ALL_30_JUZ.map((j) => (
                  <option key={j.number} value={j.number}>
                    Juz {j.number} - {j.nameEnglish}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Go to Ayah Form */}
          <form onSubmit={handleGoToAyahSubmit} className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={currentSurah.numberOfAyahs}
              value={goToAyahInput}
              onChange={(e) => setGoToAyahInput(e.target.value)}
              placeholder={`Go to Ayah (1 - ${currentSurah.numberOfAyahs})...`}
              className="flex-1 bg-white dark:bg-[#1a1a1a] border border-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Go
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* TAB VIEWS: Either Navigation Lists or Quran Ayahs Content                  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto chat-scrollbar relative min-h-0" ref={versesContainerRef}>
          {/* TAB 1: SUURAD LIST (Browse Surahs) */}
          {activeTab === 'suurad' && (
            <div className="p-3 space-y-3">
              {/* Surah Header Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 text-center relative overflow-hidden">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {currentSurah.revelationType} • {currentSurah.numberOfAyahs} Ayahs • Page {currentSurah.page}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-arabic text-blue-950 dark:text-blue-100 my-1">
                  {currentSurah.name}
                </h3>
                <p className="text-xs font-semibold text-foreground">
                  Surah {currentSurah.englishName} ({currentSurah.somaliNameTranslation || currentSurah.englishNameTranslation})
                </p>

                {/* Bismillah calligraphy (for all surahs except Surah 9 At-Tawbah) */}
                {currentSurahNumber !== 9 && (
                  <div className="mt-2.5 pt-2 border-t border-blue-500/15">
                    <p className="font-arabic text-blue-800 dark:text-blue-300 text-lg select-none">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                )}
              </div>

              {/* Verses List */}
              {isLoadingVerses ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Loading authentic Quran verses...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {surahAyahs.map((ayah) => {
                    const isActive = ayah.numberInSurah === activeAyahNumber;
                    const isBookmarked = Boolean(bookmarkedVerses[`${currentSurahNumber}:${ayah.numberInSurah}`]);
                    const isCopied = copiedAyahKey === `${currentSurahNumber}:${ayah.numberInSurah}`;

                    return (
                      <div
                        key={ayah.numberInSurah}
                        ref={(el) => (ayahElementRefs.current[ayah.numberInSurah] = el)}
                        onClick={() => {
                          setActiveAyahNumber(ayah.numberInSurah);
                          if (readingMode === 'listen') {
                            playAyahAudio(ayah.numberInSurah);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-sm ring-1 ring-blue-500/30'
                            : 'bg-white dark:bg-[#181818] border-border/70 hover:border-blue-500/30 hover:bg-muted/30'
                        }`}
                      >
                        {/* Ayah Top Meta & Marker */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {ayah.numberInSurah}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {currentSurah.englishName} : {ayah.numberInSurah}
                            </span>
                          </div>

                          {/* Quick Play Audio Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playAyahAudio(ayah.numberInSurah);
                            }}
                            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              isActive && isPlaying
                                ? 'bg-blue-600 text-white'
                                : 'text-muted-foreground hover:text-blue-600 hover:bg-muted'
                            }`}
                            title={`Play Ayah ${ayah.numberInSurah}`}
                          >
                            {isActive && isPlaying ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                        </div>

                        {/* Arabic Uthmani Text */}
                        <p
                          dir="rtl"
                          className={`font-arabic text-right text-blue-950 dark:text-blue-100 ${getArabicFontSizeClass()} mb-2`}
                        >
                          {ayah.text}{' '}
                          <span className="inline-block text-blue-600 dark:text-blue-400 font-normal px-1 text-base select-none">
                            ۝{ayah.numberInSurah}
                          </span>
                        </p>

                        {/* Somali Translation (Abduh) */}
                        {showSomaliTranslation && ayah.translationSo && (
                          <p className="text-xs text-foreground/90 leading-relaxed mb-1.5 font-sans">
                            <strong className="text-blue-700 dark:text-blue-400 font-semibold text-[10px] uppercase block">
                              Soomaali:
                            </strong>
                            {ayah.translationSo}
                          </p>
                        )}

                        {/* English Translation (Saheeh) */}
                        {showEnglishTranslation && ayah.translationEn && (
                          <p className="text-xs text-muted-foreground italic leading-relaxed mb-2 font-sans">
                            <strong className="text-muted-foreground font-semibold text-[10px] uppercase block not-italic">
                              English:
                            </strong>
                            "{ayah.translationEn}"
                          </p>
                        )}

                        {/* Ayah Actions Toolbar */}
                        <div
                          className="flex items-center justify-between pt-2 mt-2 border-t border-border/40 text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            {/* Tafsiir Action */}
                            <button
                              type="button"
                              onClick={() => setActiveTafsirAyah(ayah)}
                              className="px-2 py-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              title="Tafsiirka Aayadda (Not Available)"
                            >
                              <BookOpen className="w-3 h-3 text-blue-600" />
                              <span>Tafsiir</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                                N/A
                              </span>
                            </button>

                            {/* Bookmark Action */}
                            <button
                              type="button"
                              onClick={() => handleToggleBookmark(ayah)}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isBookmarked
                                  ? 'text-blue-600 bg-blue-500/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                              title={isBookmarked ? 'Bookmarked' : 'Bookmark Ayah'}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Copy Action */}
                            <button
                              type="button"
                              onClick={() => handleCopyAyah(ayah)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                              title="Copy Ayah text"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* "Waydii EMufti" Action (Sends to Chat in Panel B) */}
                          <button
                            type="button"
                            onClick={() => handleAskEMufti(ayah)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                            title="Weydii EMufti AI su'aal ku saabsan aayaddan"
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                            <span>Waydii EMufti</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JIZZ (Juz 1–30 List) */}
          {activeTab === 'jizz' && (
            <div className="p-3 space-y-2">
              <div className="px-1 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All 30 Juz of the Holy Quran
              </div>
              <div className="space-y-1.5">
                {ALL_30_JUZ.map((juz) => {
                  const isCurrent = currentJuz.number === juz.number;
                  return (
                    <div
                      key={juz.number}
                      onClick={() => {
                        setCurrentSurahNumber(juz.startSurah);
                        setActiveAyahNumber(juz.startAyah);
                        setActiveTab('suurad');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-500/10 border-blue-500/50 shadow-xs'
                          : 'bg-white dark:bg-[#181818] border-border/70 hover:border-blue-500/30 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 font-bold text-xs flex items-center justify-center">
                            {juz.number}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">
                              Juz {juz.number} • {juz.nameEnglish}
                            </h4>
                            <p className="text-[10px] text-muted-foreground">
                              {juz.startSurahName} ({juz.startAyah}) - {juz.endSurahName} ({juz.endAyah})
                            </p>
                          </div>
                        </div>
                        <span className="font-arabic text-sm text-blue-800 dark:text-blue-300">
                          {juz.nameArabic}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HIZB (60 Hizbs List) */}
          {activeTab === 'hizb' && (
            <div className="p-3 space-y-2">
              <div className="px-1 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All 60 Hizbs (2 Hizbs per Juz)
              </div>
              <div className="space-y-1.5">
                {ALL_60_HIZB.map((hizb) => (
                  <div
                    key={hizb.number}
                    onClick={() => {
                      setCurrentSurahNumber(hizb.startSurah);
                      setActiveAyahNumber(hizb.startAyah);
                      setActiveTab('suurad');
                    }}
                    className="p-3 rounded-xl border bg-white dark:bg-[#181818] border-border/70 hover:border-blue-500/40 hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 font-bold text-xs flex items-center justify-center">
                        {hizb.number}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {hizb.nameSomali}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Juz {hizb.juzNumber} • Surah {hizb.startSurahName} ({hizb.startAyah}) • Page {hizb.startPage}
                        </p>
                      </div>
                    </div>
                    <span className="font-arabic text-sm text-blue-800 dark:text-blue-300">
                      {hizb.nameArabic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HALF-HIZB (120 Barkiis List) */}
          {activeTab === 'half_hizb' && (
            <div className="p-3 space-y-2">
              <div className="px-1 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                120 Half-Hizbs (Barkiis - 2 per Hizb)
              </div>
              <div className="space-y-1.5">
                {ALL_120_HALF_HIZB.map((half) => (
                  <div
                    key={half.number}
                    onClick={() => {
                      setCurrentSurahNumber(half.startSurah);
                      setActiveAyahNumber(half.startAyah);
                      setActiveTab('suurad');
                    }}
                    className="p-2.5 rounded-xl border bg-white dark:bg-[#181818] border-border/70 hover:border-blue-500/40 hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 font-bold text-[11px] flex items-center justify-center">
                        {half.number}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {half.nameSomali}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Hizb {half.hizbNumber} • Juz {half.juzNumber} • Page {half.startPage}
                        </p>
                      </div>
                    </div>
                    <span className="font-arabic text-xs text-blue-800 dark:text-blue-300">
                      {half.nameArabic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RUB AL-HIZB (240 Quarters List) */}
          {activeTab === 'rub_al_hizb' && (
            <div className="p-3 space-y-2">
              <div className="px-1 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                240 Rub al-Hizb (Quarters - 4 per Hizb)
              </div>
              <div className="space-y-1.5">
                {ALL_240_RUB_AL_HIZB.map((rub) => (
                  <div
                    key={rub.number}
                    onClick={() => {
                      setCurrentSurahNumber(rub.startSurah);
                      setActiveAyahNumber(rub.startAyah);
                      setActiveTab('suurad');
                    }}
                    className="p-2.5 rounded-xl border bg-white dark:bg-[#181818] border-border/70 hover:border-blue-500/40 hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 font-bold text-[10px] flex items-center justify-center">
                        {rub.number}
                      </span>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">
                          {rub.nameSomali}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Hizb {rub.hizbNumber} • Juz {rub.juzNumber} • Page {rub.startPage}
                        </p>
                      </div>
                    </div>
                    <span className="font-arabic text-xs text-blue-800 dark:text-blue-300">
                      {rub.nameArabic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STICKY BOTTOM AUDIO PLAYER: Qari Selector, Controls, Progress Bar        */}
        {/* ========================================================================= */}
        <div className="shrink-0 border-t border-border/70 bg-white dark:bg-[#161616] p-3 space-y-2 select-none shadow-lg">
          {/* Top row: Qari Selector + Loop Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <select
                value={selectedReciter?.id || ''}
                onChange={(e) => {
                  const recId = e.target.value;
                  const found = reciters.find((r) => r.id === recId);
                  if (found) {
                    setSelectedReciter(found);
                    quranService.saveSelectedReciter(found.id);
                    if (isPlaying) {
                      playAyahAudio(activeAyahNumber);
                    }
                  }
                }}
                className="w-full bg-muted/60 hover:bg-muted border border-border/70 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 truncate cursor-pointer"
                title="Select Reciter (50+ Verified Qurra)"
              >
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Loop Ayah Toggle */}
            <button
              type="button"
              onClick={() => setLoopAyah(!loopAyah)}
              className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer shrink-0 ${
                loopAyah
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={loopAyah ? 'Repeat Ayah Active' : 'Repeat Ayah'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Middle row: Audio Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePreviousAyah}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Previous Ayah"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              disabled={isAudioLoading}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer"
              title={isPlaying ? 'Pause Audio' : 'Play Ayah Audio'}
            >
              {isAudioLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNextAyah}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Next Ayah"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom row: Progress Bar + Time */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span>
              {Math.floor(audioCurrentTime / 60)}:
              {String(Math.floor(audioCurrentTime % 60)).padStart(2, '0')}
            </span>
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{
                  width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%`,
                }}
              />
            </div>
            <span>
              {Math.floor(audioDuration / 60)}:
              {String(Math.floor(audioDuration % 60)).padStart(2, '0')}
            </span>
          </div>

          {audioError && (
            <p className="text-[10px] text-destructive text-center">{audioError}</p>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAFSIIR MODAL / DRAWER (Somali Scholars)                                  */}
        {/* ========================================================================= */}
        {activeTafsirAyah && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#181818] border border-border rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="h-14 px-4 border-b border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-foreground">
                    Tafsiirka Aayadda {activeTafsirAyah.numberInSurah} ({currentSurah.englishName})
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                    Not Available
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTafsirAyah(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 text-xs">
                {/* Not Available Alert */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-medium text-center">
                  Qaybta Tafsiirka Culimada Soomaaliyeed ee aayaddan xilligan lama heli karo (Not Available). Waxaa ku socda dib-u-habeyn iyo hubin dheeraad ah.
                </div>

                {/* Ayah Card */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p dir="rtl" className="font-arabic text-right text-blue-950 dark:text-blue-100 text-lg mb-2">
                    {activeTafsirAyah.text}
                  </p>
                  {activeTafsirAyah.translationSo && (
                    <p className="text-foreground/90 font-medium">
                      {activeTafsirAyah.translationSo}
                    </p>
                  )}
                </div>

                {/* Somali Scholars Commentary */}
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-blue-700 dark:text-blue-400">
                    Sharaxaadda Culumada Soomaaliyeed
                  </h4>

                  {SOMALI_SCHOLARS_TAFSIR.map((scholar) => {
                    const lesson = scholar.lessons.find((l) => l.surahNumber === currentSurahNumber);
                    return (
                      <div key={scholar.id} className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{scholar.somaliName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/10 text-blue-600 font-semibold">
                            Tafsiir Sugan
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {scholar.descriptionSo}
                        </p>
                        {lesson && lesson.audioUrl && (
                          <div className="pt-2">
                            <a
                              href={lesson.audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-colors"
                            >
                              <Headphones className="w-3.5 h-3.5" />
                              <span>Dhageyso Casharka ({lesson.duration || '35 min'})</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 border-t border-border/70 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleAskEMufti(activeTafsirAyah);
                    setActiveTafsirAyah(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Weydii EMufti Faahfaahin Dheeraad ah</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOAST NOTIFICATION                                                        */}
        {/* ========================================================================= */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 flex items-center gap-1.5 pointer-events-none">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </aside>
    </>
  );
};
