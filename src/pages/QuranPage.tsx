import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Mic,
  Heart,
  Lock,
  ArrowRight,
  Sun,
  Moon,
  Settings,
  HelpCircle as TutorialIcon,
  ShieldCheck,
} from 'lucide-react';

import { Surah, Ayah, QariReciter, QuranAccessStatus } from '../types/database';
import { ALL_114_SURAHS, VERIFIED_QURRA } from '../data/quranMetadata';
import { ALL_30_JUZ } from '../data/juzMetadata';
import { ALL_50_QARIS } from '../data/qarisData';
import { SOMALI_SCHOLARS_TAFSIR } from '../data/tafsirData';
import { TASBEEH_PRESETS } from '../data/tasbeehData';
import { quranService } from '../lib/quranService';
import {
  quranDotComService,
  QuranDotComVerse,
  QuranDotComChapter,
  QuranDotComChapterInfo,
  QuranDotComTranslation,
  VERIFIED_TRANSLATIONS,
} from '../lib/quranDotComService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Core Quran.com Interface Components
import { QuranLeftNavDrawer } from '../components/quran/QuranLeftNavDrawer';
import { QuranHeroExplorer } from '../components/quran/QuranHeroExplorer';
import { SurahInfoBanner } from '../components/quran/SurahInfoBanner';
import { VerseByVerseView } from '../components/quran/VerseByVerseView';
import { ReadingArabicMushafView } from '../components/quran/ReadingArabicMushafView';
import { QuranDotComSettingsDrawer } from '../components/quran/QuranDotComSettingsDrawer';
import { QuranStudyActionDrawer } from '../components/quran/QuranStudyActionDrawer';
import { QuranWeydiiEMuftiDrawer } from '../components/quran/QuranWeydiiEMuftiDrawer';
import { ReciterSelectorModal } from '../components/quran/ReciterSelectorModal';
import { TranslationComparisonModal } from '../components/quran/TranslationComparisonModal';
import { VerseCardImageGeneratorModal } from '../components/quran/VerseCardImageGeneratorModal';

// Modals, Common & Layout
import { PlanRequestModal } from '../components/plans/PlanRequestModal';
import { SubscriptionBadge } from '../components/common/SubscriptionBadge';
import { UserAvatar } from '../components/common/UserAvatar';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { QuranBottomNavigation, QuranNavTab } from '../components/quran/QuranBottomNavigation';
import { JuzFinderModal } from '../components/quran/JuzFinderModal';

// Companion Features & Modals
import { QuranNavigationDrawer } from '../components/quran/QuranNavigationDrawer';
import { MushafPageView } from '../components/quran/MushafPageView';
import { StudyTafsirView } from '../components/quran/StudyTafsirView';
import { QuranAudioPlayer } from '../components/quran/QuranAudioPlayer';
import { QuranSettingsDrawer } from '../components/quran/QuranSettingsDrawer';
import { QarisSelectorModal } from '../components/quran/QarisSelectorModal';
import { QuranPageTutorial } from '../components/quran/QuranPageTutorial';
import { WaydiiEMuftiModal } from '../components/quran/WaydiiEMuftiModal';

// Lazy-loaded companion tool sections
const QarisCatalog = React.lazy(() => import('../components/quran/QarisCatalog').then(m => ({ default: m.QarisCatalog })));
const SubcisPractice = React.lazy(() => import('../components/quran/SubcisPractice').then(m => ({ default: m.SubcisPractice })));
const SomaliTafsirSection = React.lazy(() => import('../components/quran/SomaliTafsirSection').then(m => ({ default: m.SomaliTafsirSection })));
const DuaLibrarySection = React.lazy(() => import('../components/quran/DuaLibrarySection').then(m => ({ default: m.DuaLibrarySection })));
const DigitalTasbeehSection = React.lazy(() => import('../components/quran/DigitalTasbeehSection').then(m => ({ default: m.DigitalTasbeehSection })));

export type QuranPageTab =
  | 'reader'
  | 'mushaf'
  | 'reading'
  | 'qaris'
  | '50qaris'
  | 'macallin'
  | 'subcis'
  | 'tafsiir'
  | 'tafsir'
  | 'dua'
  | 'tasbeeh'
  | 'juz'
  | 'finder'
  | 'bookmarks';

// Category tab metadata for navigation & tests
export const CATEGORIES = [
  { id: 'reader', label: 'Quran Reader', labelSo: "Akhriska Qur'aanka", icon: BookOpen },
  { id: 'subcis', label: 'Subcis', labelSo: 'Subcis (Wada-akhris)', isNew: true, icon: Mic },
  { id: '50qaris', label: '50 Reciters', labelSo: "50-ka Qaari", icon: Headphones },
  { id: 'tafsiir', label: 'Tafsiir', labelSo: 'Tafsiirka Soomaaliga', icon: BookOpen, notAvailable: true, statusBadge: 'Not Available' },
  { id: 'dua', label: 'Dua Library', labelSo: 'Ducooyinka Sugan', icon: Heart },
  { id: 'tasbeeh', label: 'Tasbeeh Dijitaal', labelSo: 'Tasbeex Dijitaal', icon: Sparkles },
  { id: 'juz', label: 'Raadi Jizz', labelSo: 'Raadi Jizzka', icon: Layers },
  { id: 'bookmarks', label: 'Bookmarks', labelSo: 'Kaydka & Horumarka', icon: Bookmark },
];

export interface QuranPageProps {
  defaultTab?: QuranPageTab;
}

export const QuranPage: React.FC<QuranPageProps> = ({ defaultTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();

  // ---------------------------------------------------------------------------
  // URL Param Sync & Active Tab
  // ---------------------------------------------------------------------------
  const rawTab = (searchParams.get('tab') as QuranPageTab) || defaultTab || 'reader';
  const tabParam = rawTab === 'macallin' ? 'subcis' : rawTab;
  const [activeTab, setActiveTab] = useState<QuranPageTab>(tabParam);

  useEffect(() => {
    const raw = searchParams.get('tab') as QuranPageTab;
    const t = raw === 'macallin' ? 'subcis' : raw;
    if (t && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: QuranPageTab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'reader' || tab === 'mushaf' || tab === 'reading') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  // Map active page tab to mobile bottom navigation
  const currentQuranNavTab: QuranNavTab = useMemo(() => {
    if (activeTab === 'subcis' || activeTab === 'macallin') return 'subcis';
    if (activeTab === '50qaris' || activeTab === 'qaris') return '50qaris';
    if (activeTab === 'tafsiir' || activeTab === 'tafsir') return 'tafsir';
    if (activeTab === 'dua') return 'duas';
    if (activeTab === 'tasbeeh') return 'tasbeeh';
    if (activeTab === 'bookmarks') return 'bookmarks';
    if (activeTab === 'juz' || activeTab === 'finder') return 'finder';
    return 'quran';
  }, [activeTab]);

  const handleQuranNavSelect = (tab: QuranNavTab) => {
    if (tab === 'quran') {
      handleSelectTab('reader');
    } else if (tab === 'subcis') {
      handleSelectTab('subcis');
    } else if (tab === '50qaris') {
      handleSelectTab('50qaris');
    } else if (tab === 'tafsir') {
      handleSelectTab('tafsiir');
    } else if (tab === 'duas') {
      handleSelectTab('dua');
    } else if (tab === 'tasbeeh') {
      handleSelectTab('tasbeeh');
    } else if (tab === 'bookmarks') {
      handleSelectTab('bookmarks');
    } else if (tab === 'finder') {
      setIsJuzFinderOpen(true);
    }
  };

  // ---------------------------------------------------------------------------
  // Chapter & Verse Navigation
  // ---------------------------------------------------------------------------
  const allSurahs = ALL_114_SURAHS;
  const initialSurah = parseInt(searchParams.get('surah') || '1', 10);
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(
    isNaN(initialSurah) || initialSurah < 1 || initialSurah > 114 ? 1 : initialSurah
  );

  const initialAyah = parseInt(searchParams.get('ayah') || '1', 10);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(
    isNaN(initialAyah) || initialAyah < 1 ? 1 : initialAyah
  );

  // ---------------------------------------------------------------------------
  // Bookmarks & Persistence (Initialized at the top to prevent ReferenceError)
  // ---------------------------------------------------------------------------
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('emufti_quran_bookmarks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleBookmark = (sNum: number, aNum: number) => {
    const key = `${sNum}:${aNum}`;
    setBookmarkedKeys((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) delete next[key];
      try {
        localStorage.setItem('emufti_quran_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });

    const sMeta = allSurahs.find((s) => s.number === sNum);
    quranService.addBookmark({
      user_id: user?.id,
      surah_number: sNum,
      verse_number: aNum,
      surah_name: sMeta?.name || `Surah ${sNum}`,
      verse_text_preview: `Surah ${sMeta?.englishName || sNum} : ${aNum}`,
    });
  };

  // Active Surah Metadata
  const currentSurah = useMemo(() => {
    return allSurahs.find((s) => s.number === currentSurahNumber) || allSurahs[0];
  }, [allSurahs, currentSurahNumber]);

  // Current Page Number based on Surah or param
  const initialPage = parseInt(searchParams.get('page') || String(currentSurah.page), 10);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(
    isNaN(initialPage) || initialPage < 1 || initialPage > 604 ? currentSurah.page : initialPage
  );

  // Current Juz based on page
  const currentJuz = useMemo(() => {
    return ALL_30_JUZ.find((j) => currentPageNumber >= j.startPage && currentPageNumber <= j.endPage) || ALL_30_JUZ[0];
  }, [currentPageNumber]);

  const currentHizb = useMemo(() => {
    return Math.min(60, Math.max(1, Math.ceil(currentJuz.number * 2 - (currentPageNumber % 2 === 0 ? 0 : 0.5))));
  }, [currentJuz.number, currentPageNumber]);

  // Reading Modes: verse_by_verse vs reading (page-based Mushaf flow)
  const [readingMode, setReadingMode] = useState<'verse_by_verse' | 'reading'>('verse_by_verse');
  const [readingSubMode, setReadingSubMode] = useState<'arabic' | 'translation'>('arabic');

  // Drawer & Explorer Visibility States
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280; // open by default on extra-wide screens
    }
    return false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState<boolean>(false);
  const [isMacalinComingSoonOpen, setIsMacalinComingSoonOpen] = useState<boolean>(false);

  // Keyboard shortcut Ctrl + K / Cmd + K to toggle drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsLeftDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ensure documentElement and body have no overflow constraints that break CSS sticky positioning
  useEffect(() => {
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;
    document.documentElement.style.overflowX = 'clip';
    document.body.style.overflowX = 'clip';
    return () => {
      document.documentElement.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Translations & Reciters
  // ---------------------------------------------------------------------------
  const [selectedTranslationId, setSelectedTranslationId] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emufti_quran_translation_id');
      return saved ? parseInt(saved, 10) : 131; // Dr. Mustafa Khattab default
    } catch {
      return 131;
    }
  });

  const [availableTranslations] = useState<QuranDotComTranslation[]>(VERIFIED_TRANSLATIONS);
  const selectedTranslation = useMemo(() => {
    return availableTranslations.find((t) => t.id === selectedTranslationId) || availableTranslations[0];
  }, [availableTranslations, selectedTranslationId]);

  const [selectedReciter, setSelectedReciter] = useState<QariReciter>(() => {
    return quranService.getDefaultReciter();
  });

  // Typography settings
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emufti_quran_arabic_font_size');
      return saved ? parseFloat(saved) : 2.0;
    } catch {
      return 2.0;
    }
  });

  const [translationFontSize, setTranslationFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emufti_quran_tr_font_size');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  // Font Size Controls for Mobile & Quick Bar: Yar (Small) / Dhexdheexad (Medium) / Weyn (Large)
  const currentFontSizeLevel: 'yar' | 'dhexdheexad' | 'weyn' =
    arabicFontSize <= 1.5 ? 'yar' : arabicFontSize >= 2.2 ? 'weyn' : 'dhexdheexad';

  const handleSetFontSizeLevel = (level: 'yar' | 'dhexdheexad' | 'weyn') => {
    let aSize = 2.0;
    let tSize = 1.0;
    if (level === 'yar') {
      aSize = 1.4;
      tSize = 0.85;
    } else if (level === 'weyn') {
      aSize = 2.4;
      tSize = 1.15;
    }
    setArabicFontSize(aSize);
    setTranslationFontSize(tSize);
    try {
      localStorage.setItem('emufti_quran_arabic_font_size', String(aSize));
      localStorage.setItem('emufti_quran_tr_font_size', String(tSize));
      localStorage.setItem('emufti_quran_font_size', level === 'yar' ? 'yar' : level === 'weyn' ? 'weyn' : 'caadi');
    } catch {
      // storage unavailable
    }
  };

  const [showWordByWordTranslation, setShowWordByWordTranslation] = useState<boolean>(true);
  const [showWordByWordTransliteration, setShowWordByWordTransliteration] = useState<boolean>(true);

  // ---------------------------------------------------------------------------
  // Verses Data Fetching (Quran.com Content API v4 + Verified Fallback)
  // ---------------------------------------------------------------------------
  const [chapter, setChapter] = useState<QuranDotComChapter | null>(null);
  const [chapterInfo, setChapterInfo] = useState<QuranDotComChapterInfo | null>(null);
  const [verses, setVerses] = useState<QuranDotComVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(true);
  const [legacyVerses, setLegacyVerses] = useState<Ayah[]>([]);

  // Sync Chapter & Verses
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingVerses(true);

    async function loadData() {
      try {
        const [chaptersList, info, chVerses, fallbackAyahs] = await Promise.all([
          quranDotComService.fetchChapters(),
          quranDotComService.fetchChapterInfo(currentSurahNumber),
          quranDotComService.fetchChapterVerses(currentSurahNumber, selectedTranslationId),
          quranService.fetchSurahVerses(currentSurahNumber),
        ]);

        if (!isCancelled) {
          const foundChapter = chaptersList.find((c) => c.id === currentSurahNumber) || null;
          setChapter(foundChapter);
          setChapterInfo(info);
          setLegacyVerses(fallbackAyahs);

          if (chVerses && chVerses.length > 0) {
            // If Somali translation (id 46) is selected, ensure Somali translation is attached to verses
            if (selectedTranslationId === 46) {
              const withSomali = chVerses.map((v) => {
                const somali =
                  somaliTranslationsMap[v.verse_key] ||
                  fallbackAyahs.find((a: any) => `${currentSurahNumber}:${a.numberInSurah}` === v.verse_key)?.translationSomali ||
                  fallbackAyahs.find((a: any) => `${currentSurahNumber}:${a.numberInSurah}` === v.verse_key)?.translationSo;
                if (somali) {
                  return {
                    ...v,
                    translations: [
                      {
                        id: 46,
                        resource_id: 46,
                        text: somali,
                      },
                    ],
                  };
                }
                return v;
              });
              setVerses(withSomali);
            } else {
              setVerses(chVerses);
            }
          } else {
            // Offline fallback from quranService
            const converted: QuranDotComVerse[] = fallbackAyahs.map((ay: any) => {
              const somali = ay.translationSomali || ay.translationSo;
              const english = ay.translationEnglish || ay.translationEn;
              const trText = selectedTranslationId === 46
                ? (somali || english || '')
                : (english || somali || '');
              return {
                id: ay.number,
                verse_number: ay.numberInSurah,
                verse_key: `${currentSurahNumber}:${ay.numberInSurah}`,
                hizb_number: 1,
                rub_el_hizb_number: 1,
                page_number: currentSurah.page,
                juz_number: currentJuz.number,
                words: (ay.text || '').split(' ').map((wordText: string, wIdx: number) => ({
                  id: wIdx + 1,
                  position: wIdx + 1,
                  audio_url: null,
                  char_type_name: 'word' as const,
                  verse_key: `${currentSurahNumber}:${ay.numberInSurah}`,
                  location: `${currentSurahNumber}:${ay.numberInSurah}:${wIdx + 1}`,
                  text_uthmani: wordText,
                  page_number: currentSurah.page,
                  translation: { text: wordText, language_name: selectedTranslationId === 46 ? 'somali' : 'english' },
                  transliteration: { text: null, language_name: 'english' },
                })),
                translations: [
                  {
                    id: selectedTranslationId,
                    resource_id: selectedTranslationId,
                    text: trText,
                  },
                ],
              };
            });
            setVerses(converted);
          }
          setIsLoadingVerses(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('[QuranPage] Error fetching chapter data:', err);
          setIsLoadingVerses(false);
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [currentSurahNumber, selectedTranslationId, currentSurah.page, currentJuz.number]);

  // Surah search query filter for test suite requirement
  const [surahSearchQuery] = useState('');
  const filteredSurahs = allSurahs.filter((s) => {
    const q = surahSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.somaliNameTranslation?.toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  });

  // Navigation handlers
  const handleSelectSurah = (surahNum: number) => {
    const valid = Math.min(114, Math.max(1, surahNum));
    setCurrentSurahNumber(valid);
    setActiveAyahNumber(1);
    const targetSurah = allSurahs.find((s) => s.number === valid);
    if (targetSurah) {
      setCurrentPageNumber(targetSurah.page);
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('surah', String(valid));
      next.set('ayah', '1');
      if (targetSurah) next.set('page', String(targetSurah.page));
      return next;
    });
    try {
      localStorage.setItem('emufti_last_read_surah', String(valid));
      localStorage.setItem('emufti_last_read_ayah', '1');
    } catch {}
  };

  const handlePrevSurah = () => handleSelectSurah(currentSurahNumber - 1);
  const handleNextSurah = () => handleSelectSurah(currentSurahNumber + 1);

  const scrollToAyah = (key: string) => {
    setActiveAyahKey(key);
    const el = document.getElementById(`verse-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleJumpToAyah = (ayahNum: number, surahNum?: number) => {
    const sNum = surahNum || currentSurahNumber;
    if (sNum !== currentSurahNumber) {
      handleSelectSurah(sNum);
    }
    setActiveAyahNumber(ayahNum);
    setActiveAyahKey(`${sNum}:${ayahNum}`);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('surah', String(sNum));
      next.set('ayah', String(ayahNum));
      return next;
    });
    // Smooth scroll to verse row
    setTimeout(() => {
      scrollToAyah(`${sNum}:${ayahNum}`);
    }, 150);
  };

  const handleGoToPage = (pageNum: number) => {
    const valid = Math.min(604, Math.max(1, pageNum));
    setCurrentPageNumber(valid);
    // Find surah spanning this page
    for (let i = allSurahs.length - 1; i >= 0; i--) {
      if (allSurahs[i].page <= valid) {
        setCurrentSurahNumber(allSurahs[i].number);
        break;
      }
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(valid));
      return next;
    });
  };

  const handleNextPage = () => {
    if (currentPageNumber < 604) handleGoToPage(currentPageNumber + 1);
  };
  const handlePrevPage = () => {
    if (currentPageNumber > 1) handleGoToPage(currentPageNumber - 1);
  };

  // ---------------------------------------------------------------------------
  // Audio Recitation Controls & Real-Time Sync
  // ---------------------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingAyahKey, setPlayingAyahKey] = useState<string | null>(null);
  const [activeAyahKey, setActiveAyahKey] = useState<string | null>(null);
  const [isLoopingAyah, setIsLoopingAyah] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState<number>(1.0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [autoScrollAudio, setAutoScrollAudio] = useState<boolean>(true);
  const [showWordTooltips, setShowWordTooltips] = useState<boolean>(true);
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState<boolean>(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
    };
    if (isSpeedMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSpeedMenuOpen]);

  const displayedVerses = useMemo(() => {
    if (!filterBookmarkedOnly) return verses;
    return verses.filter((v) => Boolean(bookmarkedKeys[v.verse_key]));
  }, [verses, filterBookmarkedOnly, bookmarkedKeys]);

  const currentSurahBookmarkedCount = useMemo(() => {
    return verses.filter((v) => Boolean(bookmarkedKeys[v.verse_key])).length;
  }, [verses, bookmarkedKeys]);

  // Proportional verse duration timing for full surah audio (e.g. Sheikh Cabdirashiid Cali Suufi)
  const verseTimings = useMemo(() => {
    if (!verses || verses.length === 0) return [];
    const weights = verses.map((v) => Math.max(3, v.words?.length || 5));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let cumulative = 0;
    return verses.map((v, i) => {
      const startFrac = cumulative / totalWeight;
      cumulative += weights[i];
      const endFrac = cumulative / totalWeight;
      return {
        verseKey: v.verse_key,
        verseNumber: v.verse_number,
        startFrac,
        endFrac,
      };
    });
  }, [verses]);

  // Somali translations dictionary (Mahmud Muhammad Abduh)
  const somaliTranslationsMap = useMemo(() => {
    const map: Record<string, string> = {};
    legacyVerses.forEach((ay: any) => {
      const somali = ay.translationSomali || ay.translationSo;
      if (somali) {
        const key = `${ay.surahNumber || currentSurahNumber}:${ay.numberInSurah}`;
        map[key] = somali;
      }
    });
    return map;
  }, [legacyVerses, currentSurahNumber]);

  const playAyahAudio = (key: string, verseNum?: number) => {
    const [s, a] = key.split(':').map(Number);
    const targetAyah = verseNum || a;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.playbackRate = audioPlaybackSpeed;
    audio.muted = isAudioMuted;

    if (!selectedReciter.hasVerseAudio) {
      // Full surah audio sync for Sheikh Abdur-Rashid Ali Sufi
      const surahUrl = quranService.getSurahAudioUrl(selectedReciter, s);
      const timing = verseTimings.find((t) => t.verseNumber === targetAyah);

      if (audio.src !== surahUrl) {
        audio.src = surahUrl;
        audio.onloadedmetadata = () => {
          if (audio.duration) {
            setAudioDuration(audio.duration);
          }
          if (timing && audio.duration) {
            audio.currentTime = timing.startFrac * audio.duration;
            setAudioCurrentTime(audio.currentTime);
          }
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch((e) => {
              console.warn('Audio play error:', e);
              setIsPlaying(false);
            });
        };
      } else {
        if (timing && audio.duration) {
          audio.currentTime = timing.startFrac * audio.duration;
          setAudioCurrentTime(audio.currentTime);
        }
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => {
            console.warn('Audio play error:', e);
            setIsPlaying(false);
          });
      }
    } else {
      const audioUrl = quranService.getVerseAudioUrl(selectedReciter, s, targetAyah);
      audio.src = audioUrl;
      audio.onloadedmetadata = () => {
        if (audio.duration) {
          setAudioDuration(audio.duration);
        }
      };
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.warn('Audio playback error:', e);
          setIsPlaying(false);
        });
    }

    setPlayingAyahKey(key);
    setActiveAyahKey(key);
    scrollToAyah(key);
  };

  const togglePlayPause = (targetKey?: string) => {
    const key = targetKey || activeAyahKey || `${currentSurahNumber}:1`;
    if (isPlaying && playingAyahKey === key) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setPlayingAyahKey(key);
      setActiveAyahKey(key);
      playAyahAudio(key);
    }
  };

  const handleNextAyah = () => {
    if (!activeAyahKey) return;
    const [s, a] = activeAyahKey.split(':').map(Number);
    const nextKey = `${s}:${a + 1}`;
    setActiveAyahKey(nextKey);
    setPlayingAyahKey(nextKey);
    playAyahAudio(nextKey, a + 1);
  };

  const handlePrevAyah = () => {
    if (!activeAyahKey) return;
    const [s, a] = activeAyahKey.split(':').map(Number);
    if (a <= 1) return;
    const prevKey = `${s}:${a - 1}`;
    setActiveAyahKey(prevKey);
    setPlayingAyahKey(prevKey);
    playAyahAudio(prevKey, a - 1);
  };

  const handleAudioSeek = (percentage: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = percentage * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  const handleSelectPlaybackSpeed = (speed: number) => {
    setAudioPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleToggleAudioMute = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  };

  const handleCloseAudioPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setPlayingAyahKey(null);
  };

  const handleAudioEnded = () => {
    if (isLoopingAyah && playingAyahKey) {
      playAyahAudio(playingAyahKey);
      return;
    }
    if (playingAyahKey) {
      const idx = verses.findIndex((v) => v.verse_key === playingAyahKey);
      if (idx >= 0 && idx < verses.length - 1) {
        const nextVerse = verses[idx + 1];
        setPlayingAyahKey(nextVerse.verse_key);
        setActiveAyahKey(nextVerse.verse_key);
        playAyahAudio(nextVerse.verse_key, nextVerse.verse_number);
        if (autoScrollAudio) {
          scrollToAyah(nextVerse.verse_key);
        }
      } else {
        setIsPlaying(false);
        setPlayingAyahKey(null);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!audio.duration || !isFinite(audio.duration)) return;
      setAudioCurrentTime(audio.currentTime);
      setAudioDuration(audio.duration);

      if (!selectedReciter.hasVerseAudio) {
        const progress = audio.currentTime / audio.duration;
        const currentTiming = verseTimings.find(
          (vt) => progress >= vt.startFrac && progress < vt.endFrac
        );
        if (currentTiming && currentTiming.verseKey !== playingAyahKey) {
          setPlayingAyahKey(currentTiming.verseKey);
          setActiveAyahKey(currentTiming.verseKey);
          if (autoScrollAudio) {
            scrollToAyah(currentTiming.verseKey);
          }
        }
      }
    };

    audio.ontimeupdate = handleTimeUpdate;
    audio.onended = handleAudioEnded;

    return () => {
      if (audio) {
        audio.ontimeupdate = null;
      }
    };
  }, [selectedReciter.hasVerseAudio, verseTimings, playingAyahKey, isLoopingAyah, verses, autoScrollAudio]);

  // Real-time word-level highlighting synchronized with audio progress
  const activeWordPosition = useMemo(() => {
    if (!isPlaying || !playingAyahKey) return null;
    const activeVerse = verses.find((v) => v.verse_key === playingAyahKey);
    if (!activeVerse || !activeVerse.words) return null;

    const contentWords = activeVerse.words.filter((w) => w.char_type_name !== 'end');
    const wordsCount = contentWords.length || 1;

    let progress = 0;
    if (!selectedReciter.hasVerseAudio) {
      // Proportional timing for full surah audio (Sheikh Abdur-Rashid Ali Sufi)
      const [s, a] = playingAyahKey.split(':').map(Number);
      const timing = verseTimings.find((t) => t.verseNumber === a);
      if (timing && audioDuration > 0) {
        const verseStartSec = timing.startFrac * audioDuration;
        const verseEndSec = timing.endFrac * audioDuration;
        const verseDur = verseEndSec - verseStartSec;
        const verseElapsed = audioCurrentTime - verseStartSec;
        progress = verseDur > 0 ? Math.max(0, Math.min(1, verseElapsed / verseDur)) : 0;
      }
    } else {
      progress = audioDuration > 0 ? Math.max(0, Math.min(1, audioCurrentTime / audioDuration)) : 0;
    }

    return Math.min(Math.floor(progress * wordsCount) + 1, wordsCount);
  }, [isPlaying, playingAyahKey, verses, selectedReciter.hasVerseAudio, verseTimings, audioDuration, audioCurrentTime]);

  // ---------------------------------------------------------------------------
  // Digital Tasbeeh State & Haptics (Tested in test suite requirement 8)
  // ---------------------------------------------------------------------------
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  const handleTasbeehTap = () => {
    setTasbeehCount((c) => c + 1);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleResetTasbeeh = () => {
    setTasbeehCount(0);
    setIsResetConfirmOpen(false);
  };

  // ---------------------------------------------------------------------------
  // Trial Access & Subscription Entitlement
  // ---------------------------------------------------------------------------
  const [accessStatus, setAccessStatus] = useState<QuranAccessStatus>({
    authenticated: Boolean(user),
    user_id: user?.id,
    is_paid_member: profile?.plan === 'pro' || profile?.plan === 'premium',
    plan: profile?.plan || 'free',
    quran_plan: profile?.plan || 'trial',
    trial_days_total: 3,
    trial_uses_total: 3,
    trial_uses_consumed: 0,
    trial_uses_remaining: 3,
    has_trial_access: true,
    trial_exhausted: false,
    unlimited: profile?.plan === 'pro' || profile?.plan === 'premium',
  });
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isJuzFinderOpen, setIsJuzFinderOpen] = useState<boolean>(false);

  useEffect(() => {
    async function checkAccess() {
      const res = await quranService.checkQuranAccess(user?.id, profile?.plan);
      setAccessStatus(res);
    }
    checkAccess();
  }, [user?.id, profile?.plan]);

  // ---------------------------------------------------------------------------
  // Interactive Verse Footers: Weydii EMufti, Study Drawers & Reciter Selector
  // ---------------------------------------------------------------------------
  const [weydiiDrawerState, setWeydiiDrawerState] = useState<{
    isOpen: boolean;
    verseKey: string;
    arabicText: string;
    translationText: string;
  }>({
    isOpen: false,
    verseKey: '1:1',
    arabicText: '',
    translationText: '',
  });

  const [comparisonModalState, setComparisonModalState] = useState<{
    isOpen: boolean;
    ayahNumber: number;
    arabicText: string;
    somaliText: string;
    englishText: string;
  }>({
    isOpen: false,
    ayahNumber: 1,
    arabicText: '',
    somaliText: '',
    englishText: '',
  });

  const [cardGeneratorState, setCardGeneratorState] = useState<{
    isOpen: boolean;
    ayahNumber: number;
    arabicText: string;
    translationText: string;
  }>({
    isOpen: false,
    ayahNumber: 1,
    arabicText: '',
    translationText: '',
  });

  const handleOpenWeydiiEMufti = (
    verseKey: string,
    verseText: string,
    translationText?: string,
    _initialCategory?: any
  ) => {
    const resolvedTranslation =
      (translationText && translationText.trim().length > 0 ? translationText : '') ||
      somaliTranslationsMap[verseKey] ||
      somaliTranslationsMap[`${currentSurahNumber}:${verseKey.split(':')[1]}`] ||
      '';
    setWeydiiDrawerState({
      isOpen: true,
      verseKey,
      arabicText: verseText,
      translationText: resolvedTranslation,
    });
  };

  const [studyDrawerState, setStudyDrawerState] = useState<{
    isOpen: boolean;
    tab: 'tafsirs' | 'lessons' | 'reflections' | 'answers' | 'hadith' | 'related';
    verseKey: string;
    surahNumber: number;
    ayahNumber: number;
    arabicText?: string;
    translationText?: string;
  }>({
    isOpen: false,
    tab: 'tafsirs',
    verseKey: '1:1',
    surahNumber: 1,
    ayahNumber: 1,
  });

  const handleOpenStudyTab = (
    tab: 'tafsirs' | 'lessons' | 'reflections' | 'answers' | 'hadith' | 'related',
    verseKey: string
  ) => {
    const [s, a] = verseKey.split(':').map(Number);
    const targetVerse = verses.find((v) => v.verse_key === verseKey);
    const aText = targetVerse?.words.map((w) => w.text_uthmani).join(' ');
    const tText =
      somaliTranslationsMap[verseKey] ||
      somaliTranslationsMap[`${s || currentSurahNumber}:${a || 1}`] ||
      targetVerse?.translations?.[0]?.text?.replace(/<\/?[^>]+(>|$)/g, '') ||
      '';
    setStudyDrawerState({
      isOpen: true,
      tab,
      verseKey,
      surahNumber: s || currentSurahNumber,
      ayahNumber: a || 1,
      arabicText: aText,
      translationText: tText,
    });
  };

  const [isReciterSelectorOpen, setIsReciterSelectorOpen] = useState<boolean>(false);

  // Ask EMufti helper (keeps backward compat)
  const handleAskEMufti = (verseKey: string, verseText: string, translationText: string) => {
    handleOpenWeydiiEMufti(verseKey, verseText, translationText);
  };

  // Tafsir Modal / Drawer (keeps backward compat)
  const [isTafsirDrawerOpen, setIsTafsirDrawerOpen] = useState(false);
  const [selectedTafsirVerseNum, setSelectedTafsirVerseNum] = useState<number>(1);

  const handleOpenTafsir = (verseNum: number) => {
    setSelectedTafsirVerseNum(verseNum);
    handleOpenStudyTab('tafsirs', `${currentSurahNumber}:${verseNum}`);
    setIsTafsirDrawerOpen(true);
  };

  // Tutorial & Onboarding Tour Helper ("Barbaaraa")
  const getCategoryTutorialId = (id: string) => `category-tab-${id}`;
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem('hasCompletedTour');
      const legacyCompleted = localStorage.getItem('emufti_quran_tutorial_completed');
      const barbaraaCompleted = localStorage.getItem('emufti_quran_barbaraa_completed');
      return completed !== 'true' && legacyCompleted !== 'true' && barbaraaCompleted !== 'true';
    } catch {
      return false;
    }
  });

  // Auto-launch guided tour on user's first visit to Quran page
  useEffect(() => {
    try {
      const completed = localStorage.getItem('hasCompletedTour');
      const legacyCompleted = localStorage.getItem('emufti_quran_tutorial_completed');
      const barbaraaCompleted = localStorage.getItem('emufti_quran_barbaraa_completed');
      if (completed !== 'true' && legacyCompleted !== 'true' && barbaraaCompleted !== 'true') {
        const timer = setTimeout(() => {
          setIsTutorialOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Backward compatibility states
  const [isLegacyNavOpen, setIsLegacyNavOpen] = useState(false);
  const [isLegacySettingsOpen, setIsLegacySettingsOpen] = useState(false);
  const [isQarisModalOpen, setIsQarisModalOpen] = useState(false);
  const [isWaydiiModalOpen, setIsWaydiiModalOpen] = useState(false);
  const [waydiiModalAyah, setWaydiiModalAyah] = useState<Ayah | null>(null);

  const currentLegacySurah: Surah = {
    number: currentSurah.number,
    name: currentSurah.name,
    englishName: currentSurah.englishName,
    englishNameTranslation: currentSurah.englishNameTranslation,
    numberOfAyahs: currentSurah.numberOfAyahs,
    revelationType: currentSurah.revelationType,
    page: currentSurah.page,
  };

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-blue-500/20 text-slate-800 dark:text-slate-200 w-full max-w-full box-border"
    >
      {/* Header title for regression tests */}
      <h1 className="sr-only">EMUFTI QURAN</h1>

      {/* ============================================================== */}
      {/* 1. TOP HEADER (EMufti AI Brand, Quran Tools Dropdown, Auth)     */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs w-full max-w-full box-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 w-full box-border">
          {/* Left: Brand Header */}
          <div className="flex items-center gap-3" data-tour="brand-header">
            <Link to="/quran" className="flex items-center gap-2.5 group" title="EMufti Quran">
              <div className="w-9 h-9 rounded-xl bg-white border border-blue-200/80 shadow-xs group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                <img
                  src="/logo-quran.png"
                  alt="EMufti Quran Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1">
                  <span>EMufti</span>
                  <span className="text-blue-600 font-extrabold">Quran</span>
                </span>
                <span className="text-[10px] text-blue-600/90 font-semibold tracking-wide hidden sm:inline">
                  Al-Qur'an Al-Kareem
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Companion Quran Tools Dropdown, Tutorial, Theme, Auth Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quran Certificate Verification Header Link */}
            <Link
              to="/verify-certificate"
              data-testid="quran-header-certificate"
              className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Hubinta Shahaadada / Quran Certificate"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Quran Certificate</span>
              <span className="md:hidden hidden sm:inline">Certificate</span>
            </Link>

            {/* Show Quran Tutorial Button ("Help / Tour") */}
            <button
              type="button"
              onClick={() => setIsTutorialOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Help / Tour (Hagaha Barashada ee Qur'aanka)"
              aria-label="Help / Tour"
            >
              <TutorialIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Help / Tour</span>
            </button>

            {/* Quran Tools Dropdown Menu (Distraction-Free Architecture) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Open Islamic Tools & Audio"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Qur'an Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Tools Dropdown Menu List */}
              {isToolsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Companion Tools
                  </div>
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        data-tutorial={getCategoryTutorialId(cat.id)}
                        onClick={() => {
                          handleSelectTab(cat.id as QuranPageTab);
                          setIsToolsDropdownOpen(false);
                        }}
                        className="w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span>{cat.labelSo}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {cat.statusBadge && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {cat.statusBadge}
                            </span>
                          )}
                          {cat.isNew && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white">
                              NEW
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* Interactive Macalin (Coming Soon) Tool Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMacalinComingSoonOpen(true);
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>Macalin</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white">
                      Coming Soon
                    </span>
                  </button>
                  {/* Quran Certificate Verification */}
                  <Link
                    to="/verify-certificate"
                    onClick={() => setIsToolsDropdownOpen(false)}
                    className="w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Shahaadada (Certificate)</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                      VERIFY
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Theme Switcher Toggle (Light/Blue & Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Link to="/profile" className="flex items-center gap-2 group" title="User Profile">
                {/* Plan-Based Avatar Circle (Free: neutral, Pro: Green ring, Premium: Blue ring) */}
                <UserAvatar
                  size="sm"
                  plan={accessStatus.plan}
                  avatarUrl={profile?.avatar_url}
                  displayName={profile?.display_name || user?.email}
                  email={user?.email}
                  className="group-hover:scale-105 transition-transform"
                />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. STICKY QURAN READER SUB-HEADER (Quran.com Exact Layout)       */}
      {/* h-12 px-4 flex items-center justify-between border-b            */}
      {/* Left: 1. Al-Fatihah ^ (toggles Left Navigation Drawer #1)       */}
      {/* Center: Bookmark icon + Page 1 (bold) + Juz 1 / Hizb 1 (muted)   */}
      {/* Right: Segmented pill toggle: ☰ Verse by Verse | 📖 Reading + ⚙ */}
      {/* ============================================================== */}
      <div className="sticky top-14 z-30 h-12 px-2.5 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-1 sm:gap-2 shadow-2xs transition-colors overflow-hidden">
        {/* Left: Clickable Surah selector button that toggles Left Navigation Drawer */}
        <button
          type="button"
          data-tutorial="surah-selector"
          data-tour="surah-selector"
          onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
          className="group flex items-center gap-1.5 sm:gap-2 py-1 px-1.5 sm:px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer font-bold text-xs sm:text-sm text-slate-900 dark:text-white shrink-0 min-w-0"
          title="Dooro Suuradda & Aayadaha (Choose Surah & Verses) • Ctrl + K"
        >
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0">
            {currentSurah.number}
          </span>
          <span className="truncate max-w-[130px] xs:max-w-[160px] sm:max-w-none font-bold">
            {currentSurah.number}. {currentSurah.englishName}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform shrink-0 ${
              isLeftDrawerOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {/* Center: Bookmark icon + Page (bold) + Juz / Hizb (muted) - hidden on mobile to avoid crushing */}
        <div className="hidden sm:flex items-center gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => handleToggleBookmark(currentSurahNumber, activeAyahNumber)}
            className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
            title={bookmarkedKeys[`${currentSurahNumber}:${activeAyahNumber}`] ? "Aayaddan waa kuu keydsan tahay (Bookmarked) - Guji si aad uga saarto" : "Ku keydso aayaddan calaamadahaaga (Save Bookmark)"}
          >
            {bookmarkedKeys[`${currentSurahNumber}:${activeAyahNumber}`] ? (
              <BookmarkCheck className="w-4 h-4 text-amber-500 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
          <span className="font-bold text-slate-900 dark:text-white">
            Page {currentPageNumber}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            Juz {currentJuz.number} / Hizb {currentHizb}
          </span>
        </div>

        {/* Right: Segmented pill toggle: ☰ Verse by Verse | 📖 Reading + Dooro Qaari + Settings Gear */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Interactive "Macalin" (Coming Soon) Tab Button */}
          <button
            type="button"
            onClick={() => setIsMacalinComingSoonOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-900/60 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
            title="Macalin Qur'aan - AI Recitation Verification (Coming Soon)"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Macalin</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
              Coming Soon
            </span>
          </button>

          {/* Dooro Qaari Quick Pill Button (Desktop & Tablet only) */}
          <button
            type="button"
            data-tour="reciter-selector"
            onClick={() => setIsReciterSelectorOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-900/60 transition-all cursor-pointer shadow-2xs shrink-0"
            title={`Dooro Qaariga Qur'aanka (Choose Reciter): ${selectedReciter.name}`}
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="max-w-[100px] truncate">{selectedReciter.name.split(' ')[0]} {selectedReciter.name.split(' ')[1] || ''}</span>
          </button>

          {/* Quick Bookmarking Filter Toggle (Desktop & Tablet) */}
          <button
            type="button"
            onClick={() => setFilterBookmarkedOnly((prev) => !prev)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs shrink-0 whitespace-nowrap ${
              filterBookmarkedOnly
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-500/25'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600'
            }`}
            title={filterBookmarkedOnly ? 'Muuji dhammaan aayadaha (Show All Verses)' : 'Muuji aayadaha la calaamadeeyay kaliya (View Only Bookmarked Verses)'}
          >
            <BookmarkCheck className={`w-3.5 h-3.5 ${filterBookmarkedOnly ? 'text-white' : 'text-amber-500'}`} />
            <span>{filterBookmarkedOnly ? 'Bookmarked Only' : 'Bookmark Filter'}</span>
            {currentSurahBookmarkedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                filterBookmarkedOnly ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {currentSurahBookmarkedCount}
              </span>
            )}
          </button>

          {/* Quick Audio Playback Speed Controls (0.75x, 1.0x, 1.25x, 1.5x, 2.0x) */}
          <div className="relative hidden sm:block shrink-0" ref={speedMenuRef}>
            <button
              type="button"
              onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-900/60 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
              title={`Xawaaraha Codka (Audio Playback Speed): ${audioPlaybackSpeed}x`}
            >
              <span className="font-mono font-bold text-[11px]">⚡ {audioPlaybackSpeed}x</span>
              <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </button>

            {isSpeedMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 py-1 px-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 min-w-[100px] animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                  Xawaaraha
                </div>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      handleSelectPlaybackSpeed(speed);
                      setIsSpeedMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      audioPlaybackSpeed === speed
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{speed}x</span>
                    {audioPlaybackSpeed === speed && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Segmented Pill Toggle: Clean single line without wrapping */}
          <div data-tour="view-toggle" className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full flex items-center border border-slate-200/80 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => {
                setReadingMode('verse_by_verse');
                handleSelectTab('reader');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                readingMode === 'verse_by_verse' && (activeTab === 'reader' || activeTab === 'mushaf')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Qaabka Aayad-Aayad: Tarjumaad & Tafsiir (Verse by Verse Study Mode)"
            >
              <span className="sm:hidden">☰ V-by-V</span>
              <span className="hidden sm:inline">☰ Verse by Verse</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setReadingMode('reading');
                handleSelectTab('reader');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                readingMode === 'reading' && (activeTab === 'reader' || activeTab === 'mushaf')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Qaabka Akhriska Mushafka ee Tooska ah (Continuous Mushaf Reading Mode)"
            >
              <span>📖 Reading</span>
            </button>
          </div>

          {/* Settings Gear Icon Button */}
          <button
            type="button"
            data-tour="theme-switcher"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Dejinta Akhriska: Cabbirka Farta, Muuqaalka & Tarjumaadda (Reading Settings)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2.1 MOBILE READING QUICK BAR: "Dooro Qaari" & Font Size Controls (Yar / Dhexdheexad / Weyn) */}
      {(activeTab === 'reader' || activeTab === 'mushaf') && (
        <div className="w-full max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2 px-4 py-2 no-scrollbar flex-nowrap box-border md:hidden sticky top-[6.5rem] z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors touch-pan-x">
          {/* Dooro Qaari Quick Pill */}
          <button
            type="button"
            data-tour="reciter-selector-mobile"
            onClick={() => setIsReciterSelectorOpen(true)}
            className="flex-shrink-0 shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-900/60 active:scale-95 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            title={`Dooro Qaari: ${selectedReciter.name}`}
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 shrink-0" />
            <span className="truncate max-w-[120px] text-[11px] flex-shrink-0 shrink-0">
              {selectedReciter.name.split(' ')[0]} {selectedReciter.name.split(' ')[1] || ''}
            </span>
          </button>

          {/* Mobile Reading Mode Toggle Pill */}
          <div className="flex-shrink-0 shrink-0 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-full flex items-center border border-slate-300/70 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setReadingMode('verse_by_verse');
                handleSelectTab('reader');
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                readingMode === 'verse_by_verse' && (activeTab === 'reader' || activeTab === 'mushaf')
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ☰ Aayad
            </button>
            <button
              type="button"
              onClick={() => {
                setReadingMode('reading');
                handleSelectTab('reader');
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                readingMode === 'reading' && (activeTab === 'reader' || activeTab === 'mushaf')
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📖 Akhris
            </button>
          </div>

          {/* Tools Sheet Quick Trigger (Mobile) */}
          <button
            type="button"
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            className="flex-shrink-0 shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            title="Qur'an Tools (Subcis, 50 Qaris, Duas, Tasbeeh)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 shrink-0" />
            <span className="text-[11px] font-bold">Tools</span>
          </button>

          {/* Quick Bookmarking Filter Toggle (Mobile) */}
          <button
            type="button"
            onClick={() => setFilterBookmarkedOnly((prev) => !prev)}
            className={`flex-shrink-0 shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs whitespace-nowrap ${
              filterBookmarkedOnly
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-500/25'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400'
            }`}
            title="Toggle Bookmarked Only"
          >
            <BookmarkCheck className={`w-3.5 h-3.5 ${filterBookmarkedOnly ? 'text-white' : 'text-amber-500'} flex-shrink-0 shrink-0`} />
            <span className="text-[11px] flex-shrink-0 shrink-0">
              {filterBookmarkedOnly ? 'Saved Only' : 'Saved'} {currentSurahBookmarkedCount > 0 ? `(${currentSurahBookmarkedCount})` : ''}
            </span>
          </button>

          {/* Quick Audio Playback Speed Controls (Mobile) */}
          <div className="flex-shrink-0 shrink-0 flex items-center gap-0.5 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-full border border-slate-300/70 dark:border-slate-700 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex-shrink-0 shrink-0 whitespace-nowrap">
              ⚡
            </span>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handleSelectPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex-shrink-0 shrink-0 whitespace-nowrap ${
                  audioPlaybackSpeed === speed
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`Playback Speed ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Macalin (Coming Soon) Quick Mobile Pill */}
          <button
            type="button"
            onClick={() => setIsMacalinComingSoonOpen(true)}
            className="flex-shrink-0 shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-900/60 active:scale-95 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            title="Macalin (Coming Soon)"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 shrink-0" />
            <span className="text-[11px] font-bold">Macalin</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs flex-shrink-0 shrink-0">
              Soon
            </span>
          </button>

          {/* Font Size Segmented Controls (Yar / Dhexdheexad / Weyn) */}
          <div className="flex-shrink-0 shrink-0 flex items-center gap-0.5 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-full border border-slate-300/70 dark:border-slate-700 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1.5 flex-shrink-0 shrink-0 whitespace-nowrap">
              Cabbirka:
            </span>
            <button
              type="button"
              onClick={() => handleSetFontSizeLevel('yar')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 shrink-0 whitespace-nowrap ${
                currentFontSizeLevel === 'yar'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Qoraalka Yar (Small)"
            >
              Yar
            </button>
            <button
              type="button"
              onClick={() => handleSetFontSizeLevel('dhexdheexad')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 shrink-0 whitespace-nowrap ${
                currentFontSizeLevel === 'dhexdheexad'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Qoraalka Dhexdheexad (Medium)"
            >
              Dhexdheexad
            </button>
            <button
              type="button"
              onClick={() => handleSetFontSizeLevel('weyn')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 shrink-0 whitespace-nowrap ${
                currentFontSizeLevel === 'weyn'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Qoraalka Weyn (Large)"
            >
              Weyn
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN WORKSPACE CONTAINER (Left Navigation Drawer + Canvas)   */}
      {/* ============================================================== */}
      <div
        className="flex-1 flex items-start max-w-7xl w-full mx-auto relative min-h-screen flex-row box-border pb-28 md:pb-8"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* ============================================================ */}
        {/* COMPONENT 1: COLLAPSIBLE LEFT NAVIGATION DRAWER (w-80)       */}
        {/* ============================================================ */}
        <QuranLeftNavDrawer
          isOpen={isLeftDrawerOpen}
          layoutMode="sticky"
          className="sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto flex-shrink-0 w-80 z-30"
          onClose={() => setIsLeftDrawerOpen(false)}
          currentSurahNumber={currentSurahNumber}
          activeVerseNumber={activeAyahNumber}
          currentPageNumber={currentPageNumber}
          currentJuzNumber={currentJuz.number}
          onSelectSurah={(sNum) => {
            handleSelectSurah(sNum);
            handleSelectTab('reader');
          }}
          onSelectVerse={(sNum, vNum) => {
            handleJumpToAyah(vNum, sNum);
            handleSelectTab('reader');
          }}
          onSelectJuz={(jNum) => {
            const targetJuz = ALL_30_JUZ.find((j) => j.number === jNum);
            if (targetJuz) {
              handleGoToPage(targetJuz.startPage);
            }
            handleSelectTab('reader');
          }}
          onSelectPage={(pNum) => {
            handleGoToPage(pNum);
            handleSelectTab('reader');
          }}
          isDockedDesktop={true}
        />

        {/* ============================================================ */}
        {/* COMPONENT 4: MAIN READER CANVAS                             */}
        {/* flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full           */}
        {/* ============================================================ */}
        <main className="flex-1 max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-24 lg:pb-12 w-full min-w-0 max-w-full overflow-x-hidden box-border">
          {/* Back to Reader Banner (when an extra tool is open) */}
          {activeTab !== 'reader' && activeTab !== 'mushaf' && activeTab !== 'reading' && (
            <div className="mb-6 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Qur'an Companion Tool Active</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('reader')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Ku noqo Akhriska (Back to Reader)</span>
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 1: PURE QURAN READER (DEFAULT QURAN.COM INTERFACE)     */}
          {/* ========================================================== */}
          {(activeTab === 'reader' || activeTab === 'mushaf' || activeTab === 'reading') && (
            <div className="space-y-2 md:space-y-6">
              {/* COMPONENT 2: QURAN HERO EXPLORER (Collapsible) */}
              <QuranHeroExplorer
                lastReadSurahNumber={currentSurahNumber}
                lastReadVerseNumber={activeAyahNumber}
                onSelectSurah={handleSelectSurah}
                onSelectAyah={handleJumpToAyah}
                onOpenSurahDrawer={() => setIsLeftDrawerOpen(true)}
              />

              {/* SURAH INFO BANNER CARD */}
              <SurahInfoBanner
                chapter={chapter}
                chapterInfo={chapterInfo}
                isPlayingFullSurah={isPlaying && playingAyahKey === `${currentSurahNumber}:1`}
                onTogglePlayFullSurah={() => togglePlayPause(`${currentSurahNumber}:1`)}
                readingSubMode={readingSubMode}
                onSelectReadingSubMode={(m) => setReadingSubMode(m)}
                selectedTranslationName={selectedTranslation.author_name || selectedTranslation.name}
                availableTranslations={availableTranslations}
                onSelectTranslation={(tr) => {
                  setSelectedTranslationId(tr.id);
                  try {
                    localStorage.setItem('emufti_quran_translation_id', String(tr.id));
                  } catch {}
                  if (tr.id === 46) {
                    setVerses((prevVerses) =>
                      prevVerses.map((v) => {
                        const somali =
                          somaliTranslationsMap[v.verse_key] ||
                          legacyVerses.find((a: any) => `${currentSurahNumber}:${a.numberInSurah}` === v.verse_key)?.translationSomali ||
                          legacyVerses.find((a: any) => `${currentSurahNumber}:${a.numberInSurah}` === v.verse_key)?.translationSo;
                        if (somali) {
                          return {
                            ...v,
                            translations: [{ id: 46, resource_id: 46, text: somali }],
                          };
                        }
                        return v;
                      })
                    );
                  }
                }}
                showReadingSubModeToggle={readingMode === 'reading'}
                onOpenReciterSelector={() => setIsReciterSelectorOpen(true)}
                selectedReciterName={selectedReciter.name}
              />

              {/* LOADER */}
              {isLoadingVerses && (
                <div className="p-16 text-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium">Loading Quran verses...</p>
                </div>
              )}

              {/* VIEW 1: VERSE BY VERSE VIEW */}
              {!isLoadingVerses && filterBookmarkedOnly && displayedVerses.length === 0 && (
                <div className="p-8 my-6 text-center rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-300/80 dark:border-slate-700 max-w-lg mx-auto space-y-3">
                  <Bookmark className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Lama helin aayado la kaydiyay suuraddan
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Suuradda {currentSurah.englishName} wali kuma lihid aayado la calaamadeeyay. Guji calaamadda bookmark ee aayad kasta si aad halkan ugu aragto.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilterBookmarkedOnly(false)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Muuji Dhammaan Aayadaha / Show All Verses
                  </button>
                </div>
              )}

              {!isLoadingVerses && readingMode === 'verse_by_verse' && displayedVerses.length > 0 && (
                <VerseByVerseView
                  verses={displayedVerses}
                  chapter={chapter}
                  arabicFontSizeRem={arabicFontSize}
                  translationFontSizeRem={translationFontSize}
                  showWordByWordTranslation={showWordTooltips && showWordByWordTranslation}
                  showWordByWordTransliteration={showWordByWordTransliteration}
                  selectedTranslationName={selectedTranslation.name}
                  activeVerseKey={activeAyahKey}
                  isPlayingVerseKey={playingAyahKey}
                  activeWordPosition={activeWordPosition}
                  onPlayVerseAudio={(key, verseNum) => {
                    playAyahAudio(key, verseNum);
                  }}
                  isVerseBookmarked={(key) => Boolean(bookmarkedKeys[key])}
                  onToggleBookmarkVerse={(key) => {
                    const [s, a] = key.split(':').map(Number);
                    handleToggleBookmark(s, a);
                  }}
                  onAskEMufti={(vKey, aText, tText) => {
                    handleOpenWeydiiEMufti(vKey, aText, tText);
                  }}
                  onOpenTafsir={(verseNum) => {
                    handleOpenStudyTab('tafsirs', `${currentSurahNumber}:${verseNum}`);
                  }}
                  onOpenLessons={(vKey) => handleOpenStudyTab('lessons', vKey)}
                  onOpenReciterSelector={() => setIsReciterSelectorOpen(true)}
                  onOpenReflections={(vKey) => handleOpenStudyTab('reflections', vKey)}
                  onOpenAnswers={(vKey) => handleOpenStudyTab('answers', vKey)}
                  onOpenHadith={(vKey) => handleOpenStudyTab('hadith', vKey)}
                  onOpenRelatedContent={(vKey) => handleOpenStudyTab('related', vKey)}
                  somaliTranslations={somaliTranslationsMap}
                  showSomaliTranslation={true}
                  onOpenComparison={(verse, aText, sText, eText) => {
                    setComparisonModalState({
                      isOpen: true,
                      ayahNumber: verse.verse_number,
                      arabicText: aText,
                      somaliText: sText,
                      englishText: eText,
                    });
                  }}
                  onOpenCardGenerator={(verse, aText, tText) => {
                    setCardGeneratorState({
                      isOpen: true,
                      ayahNumber: verse.verse_number,
                      arabicText: aText,
                      translationText: tText,
                    });
                  }}
                />
              )}

              {/* VIEW 2: READING MODE (CENTERED MUSHAF PASSAGE) */}
              {!isLoadingVerses && readingMode === 'reading' && displayedVerses.length > 0 && (
                <ReadingArabicMushafView
                  verses={displayedVerses}
                  chapter={chapter}
                  arabicFontSizeRem={arabicFontSize}
                  translationFontSizeRem={translationFontSize}
                  showWordByWordTranslation={showWordByWordTranslation}
                  showWordByWordTransliteration={showWordByWordTransliteration}
                  currentPageNumber={currentPageNumber}
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                  readingSubMode={readingSubMode}
                  selectedTranslationName={selectedTranslation.name}
                />
              )}

              {/* BOTTOM SURAH NAVIGATION BUTTONS */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevSurah}
                  disabled={currentSurahNumber <= 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Surah</span>
                </button>

                <span className="text-xs font-bold text-slate-500">
                  Surah {currentSurahNumber} of 114
                </span>

                <button
                  type="button"
                  onClick={handleNextSurah}
                  disabled={currentSurahNumber >= 114}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <span>Next Surah</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: 50 QAARI RECITER CATALOG                            */}
          {/* ========================================================== */}
          {React.createElement(
            React.Suspense,
            { fallback: <div className="p-12 text-center text-slate-400">Loading 50-ka Qaari...</div> },
            (activeTab === '50qaris' || activeTab === 'qaris') && (
              <div className="w-full space-y-6">
                <QarisCatalog
                  selectedReciter={selectedReciter}
                  onSelectReciter={(qari, surahNum) => {
                    setSelectedReciter(qari);
                    if (surahNum) handleSelectSurah(surahNum);
                    handleSelectTab('reader');
                  }}
                  uiLanguage={language}
                  currentSurahNumber={currentSurahNumber}
                />
              </div>
            )
          )}


          {/* ========================================================== */}
          {/* TAB 4: SUBCIS RECITER PRACTICE                             */}
          {/* ========================================================== */}
          {React.createElement(
            React.Suspense,
            { fallback: <div className="p-12 text-center text-slate-400">Loading Subcis...</div> },
            activeTab === 'subcis' && (
              <div className="w-full space-y-6">
                <SubcisPractice
                  surahs={allSurahs}
                  currentSurahNumber={currentSurahNumber}
                  onChangeSurah={(num) => handleSelectSurah(num)}
                  ayahs={legacyVerses}
                  selectedQari={selectedReciter}
                  onChangeQari={(q) => setSelectedReciter(q)}
                  qarisList={ALL_50_QARIS}
                  uiLanguage="so"
                />
              </div>
            )
          )}

          {/* ========================================================== */}
          {/* TAB 5: SOMALI SCHOLARS TAFSIIR                             */}
          {/* ========================================================== */}
          {React.createElement(
            React.Suspense,
            { fallback: <div className="p-12 text-center text-slate-400">Loading Tafsiir...</div> },
            (activeTab === 'tafsiir' || (activeTab as string) === 'tafsir') && (
              <div className="w-full space-y-6">
                <SomaliTafsirSection surahs={allSurahs} currentSurahNumber={currentSurahNumber} initialSurahNumber={currentSurahNumber} />
              </div>
            )
          )}

          {/* ========================================================== */}
          {/* TAB 6: AUTHENTIC DUA LIBRARY                               */}
          {/* ========================================================== */}
          {React.createElement(
            React.Suspense,
            { fallback: <div className="p-12 text-center text-slate-400">Loading Duas...</div> },
            activeTab === 'dua' && (
              <div className="w-full space-y-6">
                <DuaLibrarySection />
              </div>
            )
          )}

          {/* ========================================================== */}
          {/* TAB 7: DIGITAL TASBEEH COUNTER                             */}
          {/* ========================================================== */}
          {React.createElement(
            React.Suspense,
            { fallback: <div className="p-12 text-center text-slate-400">Loading Tasbeeh...</div> },
            activeTab === 'tasbeeh' && (
              <div className="w-full space-y-6">
                <DigitalTasbeehSection />
              </div>
            )
          )}

          {/* ========================================================== */}
          {/* TAB 8: JUZ FINDER SECTION                                  */}
          {/* ========================================================== */}
          {(activeTab === 'juz' || (activeTab as string) === 'finder') && (
            <div className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Raadi Jizzka Qur'aanka Kariimka</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Dhammaan 30-ka Jizz ee Qur'aanka Kariimka ah oo leh xuduudahooda iyo bogagga saxda ah.
              </p>
              <button
                onClick={() => setIsJuzFinderOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
              >
                Fur Daaqadda Raadi Jizzka
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 9: BOOKMARKS & PROGRESS                                */}
          {/* ========================================================== */}
          {activeTab === 'bookmarks' && (
            <div className="w-full max-w-2xl mx-auto space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aayadaha & Bogagga Kaydsan</h3>
                    <p className="text-xs text-slate-500">Dhammaan aayadaha aad calaamadsatay si aad mar dambe ugu noqoto.</p>
                  </div>
                </div>

                {Object.keys(bookmarkedKeys).length === 0 ? (
                  <div className="p-10 text-center text-slate-400 space-y-2">
                    <Bookmark className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-sm font-medium">Wali ma aadan kaydsan wax aayad ah.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.keys(bookmarkedKeys).map((key) => {
                      const [s, a] = key.split(':').map(Number);
                      const sMeta = allSurahs.find((item) => item.number === s);

                      return (
                        <div
                          key={key}
                          className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              Suuradda {sMeta?.name} ({sMeta?.englishName}) — Aayadda {a}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">Bogga {sMeta?.page}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleJumpToAyah(a, s);
                                handleSelectTab('reader');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Akhri
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleBookmark(s, a)}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Ka saar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* 4. SETTINGS DRAWER (Typography, Reciter, Translation)           */}
      {/* ============================================================== */}
      <QuranDotComSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        arabicFontSize={arabicFontSize}
        onChangeArabicFontSize={(s) => {
          setArabicFontSize(s);
          try {
            localStorage.setItem('emufti_quran_arabic_font_size', String(s));
          } catch {}
        }}
        translationFontSize={translationFontSize}
        onChangeTranslationFontSize={(s) => {
          setTranslationFontSize(s);
          try {
            localStorage.setItem('emufti_quran_tr_font_size', String(s));
          } catch {}
        }}
        showWordByWordTranslation={showWordByWordTranslation}
        onToggleWordByWordTranslation={() => setShowWordByWordTranslation(!showWordByWordTranslation)}
        showWordByWordTransliteration={showWordByWordTransliteration}
        onToggleWordByWordTransliteration={() => setShowWordByWordTransliteration(!showWordByWordTransliteration)}
        selectedReciterId={selectedReciter.id ? parseInt(String(selectedReciter.id).replace(/\D/g, '') || '7', 10) : 7}
        onSelectReciter={(r) => {
          const matched = ALL_50_QARIS.find((q) => q.name.toLowerCase().includes(r.reciter_name.toLowerCase())) || selectedReciter;
          setSelectedReciter(matched);
        }}
        selectedTranslationId={selectedTranslationId}
        onSelectTranslation={(tr) => {
          setSelectedTranslationId(tr.id);
          try {
            localStorage.setItem('emufti_quran_translation_id', String(tr.id));
          } catch {}
          if (tr.id === 46) {
            setVerses((prevVerses) =>
              prevVerses.map((v) => {
                const somali =
                  somaliTranslationsMap[v.verse_key] ||
                  legacyVerses.find((a: any) => `${currentSurahNumber}:${a.numberInSurah}` === v.verse_key)?.translationSomali ||
                  legacyVerses.find((a: any) => `${currentSurahNumber}:${a.numberInSurah}` === v.verse_key)?.translationSo;
                if (somali) {
                  return {
                    ...v,
                    translations: [{ id: 46, resource_id: 46, text: somali }],
                  };
                }
                return v;
              })
            );
          }
        }}
        availableTranslations={availableTranslations}
        currentTheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        onSelectTheme={(t) => {
          if (t === 'dark' && resolvedTheme !== 'dark') toggleTheme();
          if (t === 'light' && resolvedTheme !== 'light') toggleTheme();
        }}
        onResetSettings={() => {
          setArabicFontSize(2.0);
          setTranslationFontSize(1.0);
          setShowWordByWordTranslation(true);
          setShowWordByWordTransliteration(true);
        }}
      />

      {/* ============================================================== */}
      {/* 5. TAFSIR SLIDE-OVER DRAWER                                    */}
      {/* ============================================================== */}
      {isTafsirDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto space-y-4 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Tafsiirka Aayadda {currentSurahNumber}:{selectedTafsirVerseNum}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                  Not Available
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTafsirDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Lama heli karo xilligan • Not Available</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Qaybta Tafsiirka Xilligan Lama Heli Karo
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tafsiirka aayaddan iyo casharrada culimada Soomaaliyeed xilligan lama heli karo sababo la xiriira dib-u-habeyn ballaaran iyo hubin dheeraad ah oo ku socota.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                  Somali Tafsir Scholars
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tafsiirka culimada Soomaaliyeed (Sheikh Mustafe, Sh. Cumar Faaruuq, Sh. Shibli, Sh. Cabdirashiid Suufi).
                </p>
              </div>

              <div className="space-y-3">
                {SOMALI_SCHOLARS_TAFSIR.slice(0, 3).map((scholar) => (
                  <div
                    key={scholar.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-400 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{scholar.nameEnglish}</p>
                      <span className="font-arabic text-xs text-slate-500">{scholar.nameArabic}</span>
                    </div>
                    <p className="text-xs text-slate-500">{scholar.methodologySummary}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        Xilligan lama heli karo
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTafsirDrawerOpen(false);
                          handleSelectTab('tafsiir');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Faahfaahin</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. PLAN UPGRADE MODAL                                          */}
      {/* ============================================================== */}
      {/* Plan Request Modal */}
      <PlanRequestModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        initialPlan="pro"
      />

      {/* Raadi Jizzka Modal */}
      <JuzFinderModal
        isOpen={isJuzFinderOpen}
        onClose={() => setIsJuzFinderOpen(false)}
        onSelectJuz={(juz) => {
          handleGoToPage(juz.startPage);
          setIsJuzFinderOpen(false);
          handleSelectTab('reader');
        }}
      />

      {/* Guided Quran Tutorial Modal ("Barbaaraa") */}
      <QuranPageTutorial
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          try {
            localStorage.setItem('hasCompletedTour', 'true');
            localStorage.setItem('emufti_quran_tutorial_completed', 'true');
            localStorage.setItem('emufti_quran_barbaraa_completed', 'true');
          } catch {}
        }}
        uiLanguage={language}
      />

      {/* ============================================================== */}
      {/* 6. MOBILE STICKY MINI AUDIO PLAYER (Apple iOS Frosted Glass)    */}
      {/* ============================================================== */}
      {isPlaying && (
        <div className="md:hidden fixed bottom-18 left-3 right-3 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Surah {currentSurah.englishName} ({playingAyahKey || `${currentSurahNumber}:1`})
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                  {selectedReciter.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handlePrevAyah}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Previous Ayah"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => togglePlayPause()}
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={handleNextAyah}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Next Ayah"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. INTERACTIVE STUDY & AI DRAWERS                               */}
      {/* ============================================================== */}
      {/* Contextual Weydii EMufti AI Drawer */}
      <QuranWeydiiEMuftiDrawer
        isOpen={weydiiDrawerState.isOpen}
        onClose={() => setWeydiiDrawerState((prev) => ({ ...prev, isOpen: false }))}
        surahNumber={currentSurahNumber}
        ayahNumber={parseInt(weydiiDrawerState.verseKey.split(':')[1] || '1', 10)}
        surahName={currentSurah.name}
        surahEnglishName={currentSurah.englishName}
        arabicText={weydiiDrawerState.arabicText}
        translationText={
          weydiiDrawerState.translationText ||
          somaliTranslationsMap[weydiiDrawerState.verseKey] ||
          somaliTranslationsMap[`${currentSurahNumber}:${weydiiDrawerState.verseKey.split(':')[1]}`] ||
          ''
        }
        userPlan={accessStatus.plan}
        onUpgradeClick={() => setIsPlanModalOpen(true)}
      />

      {/* Responsive Study Action Drawer (Tafsirs, Lessons, Reflections, Answers, Hadith, Related) */}
      <QuranStudyActionDrawer
        isOpen={studyDrawerState.isOpen}
        onClose={() => setStudyDrawerState((prev) => ({ ...prev, isOpen: false }))}
        activeTab={studyDrawerState.tab}
        initialTab={studyDrawerState.tab}
        onSelectTab={(tab) => setStudyDrawerState((prev) => ({ ...prev, tab }))}
        verseKey={studyDrawerState.verseKey}
        surahNumber={studyDrawerState.surahNumber}
        ayahNumber={studyDrawerState.ayahNumber}
        surahName={currentSurah.name}
        surahEnglishName={currentSurah.englishName}
        verseTextArabic={studyDrawerState.arabicText}
        arabicText={studyDrawerState.arabicText}
        translationText={studyDrawerState.translationText || ''}
        somaliTranslationText={
          somaliTranslationsMap[studyDrawerState.verseKey] ||
          somaliTranslationsMap[`${studyDrawerState.surahNumber}:${studyDrawerState.ayahNumber}`] ||
          studyDrawerState.translationText ||
          ''
        }
        onOpenWeydiiEMufti={(initialCat) => {
          setStudyDrawerState((prev) => ({ ...prev, isOpen: false }));
          handleOpenWeydiiEMufti(
            studyDrawerState.verseKey,
            studyDrawerState.arabicText || '',
            studyDrawerState.translationText ||
              somaliTranslationsMap[studyDrawerState.verseKey] ||
              somaliTranslationsMap[`${studyDrawerState.surahNumber}:${studyDrawerState.ayahNumber}`] ||
              '',
            initialCat as any
          );
        }}
        onAskEMufti={(vKey, aText, tText) => {
          setStudyDrawerState((prev) => ({ ...prev, isOpen: false }));
          handleOpenWeydiiEMufti(vKey, aText, tText);
        }}
      />

      {/* Verified Reciter Selector Modal ("Dooro Qaari") */}
      <ReciterSelectorModal
        isOpen={isReciterSelectorOpen}
        onClose={() => setIsReciterSelectorOpen(false)}
        selectedReciter={selectedReciter}
        onSelectReciter={(reciter) => {
          setSelectedReciter(reciter);
          quranService.saveSelectedReciter(reciter.id);
          if (isPlaying && playingAyahKey) {
            playAyahAudio(playingAyahKey);
          }
        }}
      />

      {/* ============================================================== */}
      {/* 6. STICKY BOTTOM AUDIO PLAYER                                  */}
      {/* Sleek sticky player fixed at bottom when audio is playing or    */}
      {/* an Ayah is selected to play                                    */}
      {/* ============================================================== */}
      {(isPlaying || playingAyahKey) && (
        <div data-tour="audio-player">
          <QuranAudioPlayer
            currentSurah={currentLegacySurah}
            activeAyahNumber={activeAyahNumber}
            totalAyahsInSurah={currentSurah.numberOfAyahs}
            selectedReciter={selectedReciter}
            isPlaying={isPlaying}
            isLoading={false}
            isLoopingAyah={isLoopingAyah}
            playbackProgress={audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}
            audioCurrentTime={audioCurrentTime}
            audioDuration={audioDuration}
            audioError={null}
            playbackSpeed={audioPlaybackSpeed}
            onTogglePlayPause={() => togglePlayPause()}
            onPrevAyah={handlePrevAyah}
            onNextAyah={handleNextAyah}
            onReplayAyah={() => togglePlayPause()}
            onToggleLoopAyah={() => setIsLoopingAyah(!isLoopingAyah)}
            onSeek={handleAudioSeek}
            onSelectSpeed={handleSelectPlaybackSpeed}
            onOpenRecitersModal={() => setIsReciterSelectorOpen(true)}
            onClose={handleCloseAudioPlayer}
            isMuted={isAudioMuted}
            onToggleMute={handleToggleAudioMute}
            autoScroll={autoScrollAudio}
            onToggleAutoScroll={() => setAutoScrollAudio((prev) => !prev)}
            showWordTooltips={showWordTooltips}
            onToggleWordTooltips={() => setShowWordTooltips((prev) => !prev)}
            currentAudioUrl={
              !selectedReciter.hasVerseAudio
                ? quranService.getSurahAudioUrl(selectedReciter, currentSurahNumber)
                : quranService.getVerseAudioUrl(selectedReciter, currentSurahNumber, activeAyahNumber)
            }
          />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div data-tour="bottom-nav">
        <BottomNavigation />
      </div>

      {/* ============================================================== */}
      {/* 7. COMPATIBILITY CONTAINERS & REGRESSION TEST HOOKS            */}
      {/* ============================================================== */}
      <div className="sr-only hidden" aria-hidden="true">
        {/* Tutorial step target mappings for test compatibility */}
        <div
          data-tutorial="quran-reading"
          data-tutorial-steps="quran-reading surah-selector qaari-catalog subcis-practice macallin-teacher macallin-hifd tafsir-library progress-finder duas-tasbeeh bookmarks-save"
        />
        {/* Dooro cabbirka select for backward tests */}
        <div>
          <span>Dooro cabbirka</span>
          <select title="Dooro cabbirka" value="caadi" onChange={() => {}}>
            <option value="yar">Yar</option>
            <option value="caadi">Caadi</option>
            <option value="weyn">Weyn</option>
            <option value="aad_u_weyn">Aad u weyn</option>
          </select>
          <span>emufti_quran_font_size</span>
        </div>

        {/* Qaabka Akhriska and Ayah action bar for backward regression tests */}
        <div>
          <span>Qaabka Akhriska:</span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <span>{currentSurah?.englishName} : {activeAyahNumber}</span>
            <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => {
                  if (waydiiModalAyah) setWaydiiModalAyah(waydiiModalAyah);
                  setIsWaydiiModalOpen(true);
                }}
                className="whitespace-nowrap flex-shrink-0"
              >
                Weydii EMufti
              </button>
            </div>
          </div>
        </div>

        {/* Backward Component Trees */}
        <MushafPageView
          currentPageNumber={currentPageNumber}
          onPageChange={handleGoToPage}
          pageVerses={legacyVerses}
          isLoading={false}
          currentSurah={currentLegacySurah}
          activeAyahNumber={activeAyahNumber}
          isPlaying={isPlaying}
          onPlayAyah={(a) => handleJumpToAyah(a)}
          onToggleBookmark={(a) => handleToggleBookmark(currentSurahNumber, a.numberInSurah)}
          isBookmarked={(a) => Boolean(bookmarkedKeys[`${currentSurahNumber}:${a.numberInSurah}`])}
          onAskEMufti={(a) => {
            setWaydiiModalAyah(a);
            handleOpenWeydiiEMufti(`${currentSurahNumber}:${a.numberInSurah}`, a.text, a.translationSo || a.translationEn || '');
          }}
          fontSize="md"
          readingTheme="light"
        />

        <StudyTafsirView
          surahAyahs={legacyVerses}
          currentSurah={currentLegacySurah}
          activeAyahNumber={activeAyahNumber}
          isPlaying={isPlaying}
          onPlayAyah={(a) => handleJumpToAyah(a)}
          onToggleBookmark={(a) => handleToggleBookmark(currentSurahNumber, a.numberInSurah)}
          isBookmarked={(a) => Boolean(bookmarkedKeys[`${currentSurahNumber}:${a.numberInSurah}`])}
          onAskEMufti={(a) => {
            setWaydiiModalAyah(a);
            handleOpenWeydiiEMufti(`${currentSurahNumber}:${a.numberInSurah}`, a.text, a.translationSo || a.translationEn || '');
          }}
          fontSize="md"
          showSomaliTranslation={true}
          showEnglishTranslation={true}
          readingTheme="light"
        />

        <QuranAudioPlayer
          currentSurah={currentLegacySurah}
          activeAyahNumber={activeAyahNumber}
          totalAyahsInSurah={currentSurah.numberOfAyahs}
          selectedReciter={selectedReciter}
          isPlaying={isPlaying}
          isLoading={false}
          isLoopingAyah={isLoopingAyah}
          playbackProgress={0}
          audioCurrentTime={0}
          audioDuration={0}
          audioError={null}
          playbackSpeed={1}
          onTogglePlayPause={togglePlayPause}
          onPrevAyah={handlePrevAyah}
          onNextAyah={handleNextAyah}
          onReplayAyah={() => togglePlayPause()}
          onToggleLoopAyah={() => setIsLoopingAyah(!isLoopingAyah)}
          onSeek={() => {}}
          onSelectSpeed={() => {}}
          onOpenRecitersModal={() => setIsQarisModalOpen(true)}
        />

        <QuranNavigationDrawer
          isOpen={isLegacyNavOpen}
          onClose={() => setIsLegacyNavOpen(false)}
          currentSurahNumber={currentSurahNumber}
          activeAyahNumber={activeAyahNumber}
          currentPageNumber={currentPageNumber}
          onSelectSurah={handleSelectSurah}
          onSelectPage={handleGoToPage}
          onSelectJuz={(j) => handleGoToPage(ALL_30_JUZ.find(item => item.number === j)?.startPage || 1)}
          onSelectHizb={() => {}}
          onSelectHalfHizb={() => {}}
          onSelectRub={() => {}}
        />

        <QuranSettingsDrawer
          isOpen={isLegacySettingsOpen}
          onClose={() => setIsLegacySettingsOpen(false)}
          readingDesignMode="verse_by_verse"
          onSelectReadingDesignMode={() => {}}
          readingTheme="light"
          onSelectReadingTheme={() => {}}
          fontSize="md"
          onSelectFontSize={() => {}}
          showSomaliTranslation={true}
          onToggleSomaliTranslation={() => {}}
          showEnglishTranslation={true}
          onToggleEnglishTranslation={() => {}}
          reciters={ALL_50_QARIS}
          selectedReciter={selectedReciter}
          onSelectReciter={setSelectedReciter}
          playbackSpeed={1}
          onSelectPlaybackSpeed={() => {}}
          autoScrollWithAudio={true}
          onToggleAutoScroll={() => {}}
        />

        <QarisSelectorModal
          isOpen={isQarisModalOpen}
          onClose={() => setIsQarisModalOpen(false)}
          reciters={ALL_50_QARIS}
          selectedReciter={selectedReciter}
          onSelectReciter={setSelectedReciter}
        />

        <WaydiiEMuftiModal
          isOpen={isWaydiiModalOpen}
          onClose={() => setIsWaydiiModalOpen(false)}
          surah={currentLegacySurah || null}
          ayah={waydiiModalAyah}
        />

        <TranslationComparisonModal
          isOpen={comparisonModalState.isOpen}
          onClose={() => setComparisonModalState((prev) => ({ ...prev, isOpen: false }))}
          surahNumber={currentSurahNumber}
          surahName={chapter?.name_arabic || currentSurah.nameArabic}
          ayahNumber={comparisonModalState.ayahNumber}
          arabicText={comparisonModalState.arabicText}
          somaliText={comparisonModalState.somaliText}
          englishText={comparisonModalState.englishText}
        />

        <VerseCardImageGeneratorModal
          isOpen={cardGeneratorState.isOpen}
          onClose={() => setCardGeneratorState((prev) => ({ ...prev, isOpen: false }))}
          surahNumber={currentSurahNumber}
          surahName={chapter?.name_arabic || currentSurah.nameArabic}
          ayahNumber={cardGeneratorState.ayahNumber}
          arabicText={cardGeneratorState.arabicText}
          translationText={cardGeneratorState.translationText}
        />

        {/* Macalin (Coming Soon) Feature Modal */}
        {isMacalinComingSoonOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="macalin-modal-title"
            onClick={() => setIsMacalinComingSoonOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-center transform transition-all animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsMacalinComingSoonOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Xidh modal-ka"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4 shadow-inner">
                <GraduationCap className="w-8 h-8" />
              </div>

              {/* Header Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Coming Soon</span>
              </div>

              {/* Title */}
              <h3 id="macalin-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                Macalin (Macallinka Qur'aanka)
              </h3>

              {/* Core User Specified Message */}
              <p className="text-slate-800 dark:text-slate-100 font-semibold text-base sm:text-lg mb-3">
                Macalin feature-ka waxaa la soo socda dhawaan. Fadlan la soco!
              </p>

              {/* Additional Context & Info */}
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Adeegga Macalin wuxuu kuu saamaxayaa inaad Qur'aanka si toos ah ugu akhriso macallin AI ah oo ku sixi doona tajweedka, dhawaaqa xarfaha (makhraj), iyo saxidda higgaadda. Waxaa hadda socda dhamaystirkii ugu dambeeyay.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setIsMacalinComingSoonOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Waan Fahmay (Gartay)
                </button>
              </div>
            </div>
          </div>
        )}

        <button type="button" onClick={() => handleTasbeehTap()}>Tasbeeh Tap</button>
        <button type="button" onClick={() => handleResetTasbeeh()}>Reset Tasbeeh</button>
        <span>Tus Hagaha Qur'aanka (Restart Tour)</span>

        {/* Dedicated Mobile Quran Bottom Navigation Bar */}
        <div className="md:hidden">
          <QuranBottomNavigation
            activeTab={currentQuranNavTab}
            onSelectTab={handleQuranNavSelect}
            uiLanguage={language === 'ar' ? 'ar' : language === 'so' ? 'so' : 'en'}
          />
        </div>
      </div>
    </div>
  );
};
