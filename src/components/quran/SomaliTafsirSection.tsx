import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Search,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
  FileText,
  AlertCircle,
  Headphones,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  RotateCcw,
  SkipForward,
  SkipBack,
  Share2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  X,
  MessageSquare,
  HelpCircle,
  Sliders,
  Timer,
} from 'lucide-react';
import {
  SomaliScholarTafsir,
  TafsirLesson,
  SurahTafsirSummary,
  SurahTafsirCoverageStatus,
  Ayah,
  UserTafsirProgress,
} from '../../types/database';
import {
  getAllSomaliScholars,
  getSomaliScholarById,
  getAll114SurahsTafsirStatus,
  getSurahTafsirStatus,
  getTafsirLessonsForSurah,
  searchTafsirLessons,
  getTafsirLibraryStats,
  saveUserTafsirProgress,
  getLastPlayedTafsirLesson,
  getAll15JuzTafsirSummaries,
  getAll30JuzTafsirSummaries,
  getJuzTafsirSummary,
  JuzTafsirSummary,
} from '../../data/tafsirData';
import { getFirst15Juz, getSurahsForJuz } from '../../data/juzMetadata';
import { quranService } from '../../lib/quranService';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export type HonestTafsirStatus =
  | 'all'
  | 'complete'
  | 'partially_available'
  | 'audio_only'
  | 'transcript_only'
  | 'not_digitized';

export const getHonestCoverageTag = (summary: SurahTafsirSummary) => {
  if (summary.hasAudio && summary.hasText && summary.status === 'complete') {
    return {
      key: 'complete' as const,
      label: 'Available (Complete)',
      badge: '✓ Available',
      class: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
    };
  }
  if (summary.hasAudio && !summary.hasText) {
    return {
      key: 'audio_only' as const,
      label: 'Available (Audio only)',
      badge: '🎧 Available (Audio)',
      class: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
    };
  }
  if (!summary.hasAudio && summary.hasText) {
    return {
      key: 'transcript_only' as const,
      label: 'Available (Transcript only)',
      badge: '📄 Available (Transcript)',
      class: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
    };
  }
  if (summary.status === 'in_progress') {
    return {
      key: 'partially_available' as const,
      label: 'Partially Available (Partially available)',
      badge: '⏳ Partially Available',
      class: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    };
  }
  if (summary.status === 'not_available') {
    return {
      key: 'not_digitized' as const,
      label: 'Not Yet Digitized (Not yet digitized)',
      badge: '⚙ Not Yet Digitized',
      somaliLabel: 'Tafsiirkan weli lama hayo',
      englishLabel: 'Not yet available',
      class: 'bg-slate-500/15 text-slate-500 border border-slate-500/30',
    };
  }
  return {
    key: 'not_digitized' as const,
    label: 'Not Yet Digitized (Not yet digitized)',
    badge: '⚙ Not Yet Digitized',
    somaliLabel: 'Tafsiirkan weli lama hayo',
    englishLabel: 'Not yet available',
    class: 'bg-slate-500/15 text-slate-500 border border-slate-500/30',
  };
};

interface SomaliTafsirSectionProps {
  surahs?: any[];
  uiLanguage?: 'en' | 'so' | 'ar';
  currentSurahNumber?: number;
  initialSurahNumber?: number;
  onSurahChange?: (surahNumber: number) => void;
  selectedScholarId?: string;
  onScholarChange?: (scholarId: string) => void;
}

export const SomaliTafsirSection: React.FC<SomaliTafsirSectionProps> = ({
  surahs,
  uiLanguage = 'so',
  currentSurahNumber,
  initialSurahNumber = 1,
  onSurahChange,
  selectedScholarId: controlledScholarId,
  onScholarChange,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNewChat } = useChat();

  const allScholars = getAllSomaliScholars();
  const all114Summaries = getAll114SurahsTafsirStatus();
  const stats = getTafsirLibraryStats();

  // Navigation & Selected Surah state (synchronized with parent Quran tab)
  const effectiveInitialSurah = currentSurahNumber || initialSurahNumber || 1;
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(effectiveInitialSurah);
  const [selectedScholarId, setSelectedScholarId] = useState<string>(controlledScholarId || 'all');
  const [coverageFilter, setCoverageFilter] = useState<'all' | SurahTafsirCoverageStatus>('all');
  const [honestStatusFilter, setHonestStatusFilter] = useState<HonestTafsirStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'audio_lessons' | 'verse_commentary'>('audio_lessons');
  const [directoryBrowseMode, setDirectoryBrowseMode] = useState<'surahs' | 'juz'>('surahs');
  const [juzRangeFilter, setJuzRangeFilter] = useState<'1_15' | '16_30' | 'all_30'>('1_15');
  const [selectedJuzNumber, setSelectedJuzNumber] = useState<number>(1);
  const [activeAyahInView, setActiveAyahInView] = useState<number>(1);
  const [scholarFilter, setScholarFilter] = useState<'featured' | 'all'>('featured');

  const displayedScholars = useMemo(() => {
    const valid = allScholars.filter(
      (s) => s.id !== 'sheikh-dirir' && s.id !== 'sheikh-umal' && s.id !== 'sheikh-shibli'
    );
    return valid;
  }, [allScholars]);

  const all15JuzSummaries = useMemo(() => getAll15JuzTafsirSummaries(), []);
  const all30JuzSummaries = useMemo(() => getAll30JuzTafsirSummaries(), []);

  const displayedJuzSummaries = useMemo(() => {
    let list: JuzTafsirSummary[];
    if (juzRangeFilter === '1_15') {
      list = all15JuzSummaries;
    } else if (juzRangeFilter === '16_30') {
      list = all30JuzSummaries.filter((j) => j.juzNumber >= 16);
    } else {
      list = all30JuzSummaries;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return list.filter((j) => {
        return (
          j.nameEnglish.toLowerCase().includes(q) ||
          j.nameSomali.toLowerCase().includes(q) ||
          j.nameArabic.includes(q) ||
          String(j.juzNumber) === q ||
          j.surahs.some(
            (s) =>
              s.englishName.toLowerCase().includes(q) ||
              s.somaliNameTranslation.toLowerCase().includes(q)
          )
        );
      });
    }

    return list;
  }, [all15JuzSummaries, all30JuzSummaries, juzRangeFilter, searchQuery]);

  // Synchronize when parent's currentSurahNumber updates
  useEffect(() => {
    if (currentSurahNumber && currentSurahNumber >= 1 && currentSurahNumber <= 114) {
      if (currentSurahNumber !== selectedSurahNumber) {
        setSelectedSurahNumber(currentSurahNumber);
      }
    }
  }, [currentSurahNumber]);

  // Synchronize when parent's controlledScholarId updates
  useEffect(() => {
    if (controlledScholarId && controlledScholarId !== selectedScholarId) {
      setSelectedScholarId(controlledScholarId);
    }
  }, [controlledScholarId]);

  const changeSurah = (num: number) => {
    const validNum = Math.max(1, Math.min(114, num));
    setSelectedSurahNumber(validNum);
    onSurahChange?.(validNum);
  };

  const changeScholar = (scholarId: string) => {
    setSelectedScholarId(scholarId);
    onScholarChange?.(scholarId);
  };

  // Step Navigation: 4 Explicit Steps
  // Step A: 114 Surahs Directory & Coverage Status
  // Step B: Verified Scholar Selection (Somali Mashayikh)
  // Step C: Verse-by-Verse Reading & Listening
  // Step D: Guided Reading Mode (60s Countdown Timer)
  const [activeStep, setActiveStep] = useState<
    'stepA_surahs' | 'stepB_scholars' | 'stepC_reading' | 'stepD_guided'
  >('stepC_reading');

  // Guided Reading Mode State (Step D)
  const [isGuidedReadingActive, setIsGuidedReadingActive] = useState<boolean>(false);
  const [guidedIntervalSeconds, setGuidedIntervalSeconds] = useState<number>(60);
  const [guidedTimerSeconds, setGuidedTimerSeconds] = useState<number>(60);
  const [isGuidedTimerPaused, setIsGuidedTimerPaused] = useState<boolean>(false);
  const [guidedAutoPlayAudio, setGuidedAutoPlayAudio] = useState<boolean>(true);
  const [guidedAyahIndex, setGuidedAyahIndex] = useState<number>(0);

  // Currently playing / selected lesson
  const [selectedLesson, setSelectedLesson] = useState<TafsirLesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  // Verse-by-verse data for selected surah
  const [surahVerses, setSurahVerses] = useState<Ayah[]>([]);
  const verses = surahVerses;
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [versesError, setVersesError] = useState<string | null>(null);

  // Continue Listening state
  const [continueListeningItem, setContinueListeningItem] = useState<{
    lesson: TafsirLesson;
    scholar: SomaliScholarTafsir;
    progress: UserTafsirProgress;
  } | null>(null);

  // EMufti AI Inquiry Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalContext, setAiModalContext] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber?: number;
    arabicText?: string;
    somaliTranslation?: string;
    scholarCommentary?: string;
    scholarName?: string;
  } | null>(null);
  const [aiInquiryText, setAiInquiryText] = useState('');
  const [isSubmittingToAi, setIsSubmittingToAi] = useState(false);

  const [stepCSurahQuery, setStepCSurahQuery] = useState('');
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [playingVerseNumber, setPlayingVerseNumber] = useState<number | null>(null);
  const [isVerseAudioLoading, setIsVerseAudioLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load Continue Listening item on mount
  useEffect(() => {
    const last = getLastPlayedTafsirLesson(user?.id);
    if (last) {
      setContinueListeningItem(last);
    }
  }, [user?.id]);

  // Load bookmarks for selected surah
  useEffect(() => {
    let isMounted = true;
    const loadBookmarks = async () => {
      try {
        const bmarks = await quranService.getBookmarks(user?.id);
        if (!isMounted) return;
        const set = new Set<number>();
        for (const b of bmarks) {
          if (b.surah_number === selectedSurahNumber) {
            set.add(b.verse_number);
          }
        }
        setBookmarkedVerses(set);
      } catch {}
    };
    loadBookmarks();
    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber, user?.id]);

  // When selected surah changes, load its verses and pick an initial lesson if available
  useEffect(() => {
    loadVerses(selectedSurahNumber);
    // Track reading progress
    quranService.saveReadingProgress(
      user?.id || 'guest',
      selectedSurahNumber,
      1,
      currentSurahSummary?.englishName
    );

    const lessons = getTafsirLessonsForSurah(selectedSurahNumber);
    if (lessons.length > 0) {
      if (!selectedLesson || selectedLesson.surahNumber !== selectedSurahNumber) {
        setSelectedLesson(lessons[0].lesson);
      }
    } else {
      setSelectedLesson(null);
      handlePause();
    }
    // Stop any playing verse recitation on surah change
    if (verseAudioRef.current) {
      verseAudioRef.current.pause();
      setPlayingVerseNumber(null);
    }
  }, [selectedSurahNumber]);

  const loadVerses = async (num: number) => {
    setIsLoadingVerses(true);
    setVersesError(null);
    try {
      const ayahs = await quranService.fetchSurahVerses(num);
      setSurahVerses(ayahs);
    } catch (err: any) {
      setVersesError(err?.message || 'Failed to load Quran verses.');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  const handleToggleBookmark = async (ayah: Ayah) => {
    const isBookmarked = bookmarkedVerses.has(ayah.numberInSurah);
    const nextSet = new Set(bookmarkedVerses);
    if (isBookmarked) {
      nextSet.delete(ayah.numberInSurah);
      setBookmarkedVerses(nextSet);
      await quranService.removeBookmark(user?.id || 'guest', selectedSurahNumber, ayah.numberInSurah);
    } else {
      nextSet.add(ayah.numberInSurah);
      setBookmarkedVerses(nextSet);
      await quranService.addBookmark({
        user_id: user?.id || 'guest',
        surah_number: selectedSurahNumber,
        verse_number: ayah.numberInSurah,
        surah_name: currentSurahSummary.englishName,
        verse_text_preview: ayah.text.slice(0, 100),
      });
    }
  };

  const handleCopyVerse = (ayah: Ayah) => {
    const text = `${ayah.text} ۝${ayah.numberInSurah}\n\n[Fasiraadda Af-Soomaaliga - Sh. Maxamuud Maxamed Cabduh]:\n${ayah.translationSo || ''}\n\n[Saheeh International]:\n"${ayah.translationEn || ''}"\n\n— Suuradda ${currentSurahSummary.englishName} (${selectedSurahNumber}:${ayah.numberInSurah}) | EMufti AI`;
    navigator.clipboard.writeText(text);
    setCopiedAyahNumber(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNumber(null), 2000);
  };

  const handlePlayVerseAudio = (verseNum: number) => {
    if (!verseAudioRef.current) return;
    if (isPlaying) {
      handlePause();
    }

    if (playingVerseNumber === verseNum) {
      verseAudioRef.current.pause();
      setPlayingVerseNumber(null);
    } else {
      setIsVerseAudioLoading(true);
      setPlayingVerseNumber(verseNum);
      const reciter = quranService.getDefaultReciter();
      const url = quranService.getVerseAudioUrl(reciter, selectedSurahNumber, verseNum);
      verseAudioRef.current.src = url;
      verseAudioRef.current.load();
      verseAudioRef.current
        .play()
        .then(() => setIsVerseAudioLoading(false))
        .catch((err) => {
          console.warn('Verse playback notice:', err);
          setPlayingVerseNumber(null);
          setIsVerseAudioLoading(false);
        });
    }
  };

  // Guided Reading Countdown Timer Effect (Step D)
  useEffect(() => {
    let timer: any = null;
    if (isGuidedReadingActive && !isGuidedTimerPaused) {
      timer = setInterval(() => {
        setGuidedTimerSeconds((prev) => {
          if (prev <= 1) {
            setGuidedAyahIndex((idx) => {
              if (idx + 1 < surahVerses.length) {
                return idx + 1;
              }
              return idx;
            });
            return guidedIntervalSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGuidedReadingActive, isGuidedTimerPaused, guidedIntervalSeconds, surahVerses.length]);

  const handleGuidedNextAyah = () => {
    if (guidedAyahIndex + 1 < surahVerses.length) {
      setGuidedAyahIndex((prev) => prev + 1);
      setGuidedTimerSeconds(guidedIntervalSeconds);
    }
  };

  const handleGuidedPrevAyah = () => {
    if (guidedAyahIndex > 0) {
      setGuidedAyahIndex((prev) => prev - 1);
      setGuidedTimerSeconds(guidedIntervalSeconds);
    }
  };

  const handleGuidedResetTimer = () => {
    setGuidedTimerSeconds(guidedIntervalSeconds);
  };

  const currentSurahSummary = getSurahTafsirStatus(selectedSurahNumber) || all114Summaries[0];
  const selectedScholar = selectedScholarId !== 'all' ? getSomaliScholarById(selectedScholarId) : null;

  const handleScrollToAyah = (verseNum: number) => {
    setActiveAyahInView(verseNum);
    const el = document.getElementById(`tafsir-ayah-${verseNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevAyahNav = () => {
    const nextNum = Math.max(1, activeAyahInView - 1);
    handleScrollToAyah(nextNum);
  };

  const handleNextAyahNav = () => {
    const max = currentSurahSummary?.numberOfAyahs || surahVerses.length || 1;
    const nextNum = Math.min(max, activeAyahInView + 1);
    handleScrollToAyah(nextNum);
  };

  const currentSurahLessons = getTafsirLessonsForSurah(selectedSurahNumber).filter((item) => {
    if (selectedScholarId === 'all') return true;
    return item.scholar.id === selectedScholarId;
  });

  // Filter surahs for selector and search with honest status flags
  const filteredSurahs = all114Summaries.filter((s) => {
    if (honestStatusFilter !== 'all') {
      const tag = getHonestCoverageTag(s);
      if (tag.key !== honestStatusFilter) {
        return false;
      }
    }
    if (coverageFilter !== 'all' && s.status !== coverageFilter) {
      return false;
    }
    if (selectedScholarId !== 'all') {
      const scholar = getSomaliScholarById(selectedScholarId);
      if (scholar && !scholar.lessons.some((l) => l.surahNumber === s.surahNumber)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName =
        s.englishName.toLowerCase().includes(q) ||
        s.somaliNameTranslation.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        String(s.surahNumber) === q;

      if (matchName) return true;

      // Also search lessons inside this surah
      const hasMatchingLesson = searchTafsirLessons(q, selectedScholarId, s.surahNumber).length > 0;
      return hasMatchingLesson;
    }
    return true;
  });

  // Audio Playback Controls
  const handleSelectLesson = (lesson: TafsirLesson, autoPlay = false) => {
    setSelectedLesson(lesson);
    setCurrentTime(0);
    setAudioError(null);

    if (verseAudioRef.current) {
      verseAudioRef.current.pause();
      setPlayingVerseNumber(null);
    }
    if (audioRef.current && lesson.audioUrl) {
      setAudioLoading(true);
      audioRef.current.src = lesson.audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.load();

      if (autoPlay) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAudioLoading(false);
          })
          .catch((err) => {
            console.warn('Playback notice:', err);
            setIsPlaying(false);
            setAudioLoading(false);
          });
      } else {
        setIsPlaying(false);
        setAudioLoading(false);
      }
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current || !selectedLesson?.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      // Save progress on pause
      if (user?.id && selectedLesson) {
        saveUserTafsirProgress(
          user.id,
          selectedLesson.id,
          selectedLesson.surahNumber,
          currentTime,
          duration
        );
      }
    } else {
      if (verseAudioRef.current) {
        verseAudioRef.current.pause();
        setPlayingVerseNumber(null);
      }
      setAudioLoading(true);
      setAudioError(null);
      if (!audioRef.current.src || audioRef.current.error) {
        audioRef.current.src = selectedLesson.audioUrl;
        audioRef.current.load();
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioLoading(false);
        })
        .catch((err) => {
          console.error('Audio play error:', err);
          setAudioError(
            uiLanguage === 'so'
              ? 'Waan ku guuldarraysanay daaridda maqalka. Fadlan hubi khadkaaga internetka ama riix "Isku day mar kale".'
              : 'Failed to stream audio recording. Please check your network connection or click Retry.'
          );
          setIsPlaying(false);
          setAudioLoading(false);
        });
    }
  };

  const handleRetryAudio = () => {
    if (!audioRef.current || !selectedLesson?.audioUrl) return;
    setAudioError(null);
    setAudioLoading(true);
    audioRef.current.src = selectedLesson.audioUrl;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setAudioLoading(false);
      })
      .catch((err) => {
        console.error('Retry play failed:', err);
        setAudioError(
          uiLanguage === 'so'
            ? 'Xiriirka maqalka wuu furmi waayay. Waxaad toos uga furan kartaa tab cusub linkiga hoose.'
            : 'Audio stream was blocked or unavailable. You can open the direct link below.'
        );
        setIsPlaying(false);
        setAudioLoading(false);
      });
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleSeek = (newSeconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newSeconds;
      setCurrentTime(newSeconds);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const idx = currentSurahLessons.findIndex((l) => l.lesson.id === selectedLesson.id);
    if (idx !== -1 && idx < currentSurahLessons.length - 1) {
      handleSelectLesson(currentSurahLessons[idx + 1].lesson, true);
    } else if (selectedSurahNumber < 114) {
      // Advance to next surah
      changeSurah(selectedSurahNumber + 1);
    }
  };

  const handlePrevLesson = () => {
    if (!selectedLesson) return;
    const idx = currentSurahLessons.findIndex((l) => l.lesson.id === selectedLesson.id);
    if (idx > 0) {
      handleSelectLesson(currentSurahLessons[idx - 1].lesson, true);
    } else if (selectedSurahNumber > 1) {
      changeSurah(selectedSurahNumber - 1);
    }
  };

  const handleResumeContinueListening = () => {
    if (!continueListeningItem) return;
    const { lesson, progress } = continueListeningItem;
    changeSurah(lesson.surahNumber);
    setSelectedLesson(lesson);
    if (audioRef.current && lesson.audioUrl) {
      audioRef.current.src = lesson.audioUrl;
      audioRef.current.load();
      audioRef.current.currentTime = progress.positionSeconds;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleOpenAiInquiry = (context: {
    surahNumber: number;
    surahName: string;
    ayahNumber?: number;
    arabicText?: string;
    somaliTranslation?: string;
    scholarCommentary?: string;
    scholarName?: string;
  }) => {
    setAiModalContext(context);
    setAiInquiryText(
      uiLanguage === 'so'
        ? `Fadlan ii faahfaahi tafsiirka Aayadda ${context.ayahNumber || 'guud'} ee Suuradda ${context.surahName} iyadoo la raacayo fasiraadda iyo tadabburka culimada Soomaaliyeed sida ${context.scholarName || 'Shiikh Mustafe Xaaji Ismaaciil'}.`
        : `Please explain the Tafsir and contemplation of ${context.surahName} Ayah ${context.ayahNumber || 'general'} according to authenticated Somali scholarship.`
    );
    setIsAiModalOpen(true);
  };

  const handleSendToChat = async () => {
    if (!aiInquiryText.trim()) return;
    setIsSubmittingToAi(true);

    const prompt = `[Quran Tafsir Inquiry]
Surah: ${aiModalContext?.surahNumber}. ${aiModalContext?.surahName}
Ayah: ${aiModalContext?.ayahNumber || 'Full section'}
Scholar Commentary Context: ${aiModalContext?.scholarCommentary || 'General tafsir'}
User Question: ${aiInquiryText}

Instructions: Ground your response strictly on verified Sunni Quranic Tafsir and cited Somali scholarship (${aiModalContext?.scholarName || 'Shiikh Mustafe Xaaji Ismaaciil / Culimada Soomaaliyeed'}). Clearly distinguish authentic quotations from summaries.`;

    try {
      await createNewChat(prompt, `Tafsir: ${aiModalContext?.surahName} (${aiModalContext?.ayahNumber || 'Verses'})`);
      setIsAiModalOpen(false);
      navigate('/chat');
    } catch {
      setIsSubmittingToAi(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          handleNextLesson();
        }}
        onError={() => {
          setAudioError(
            uiLanguage === 'so'
              ? 'Dhib baa ka dhacay codka. Fadlan hubi khadkaaga internetka.'
              : 'Failed to stream authentic audio. Please check your internet connection.'
          );
          setIsPlaying(false);
          setAudioLoading(false);
        }}
      />
      <audio
        ref={verseAudioRef}
        onEnded={() => setPlayingVerseNumber(null)}
        onError={() => {
          setPlayingVerseNumber(null);
          setIsVerseAudioLoading(false);
        }}
      />

      {/* ========================================================== */}
      {/* GLOBAL DISABLED STATUS BANNER: NOT AVAILABLE              */}
      {/* ========================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/40 text-foreground space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider mb-0.5">
                <span>Lama heli karo xilligan • Not Available</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Qaybta Tafsiirka Culimada Xilligan Lama Heli Karo
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-bold shrink-0 self-start sm:self-auto border border-amber-500/30">
            Dib-u-habeyn ku socota (Maintenance)
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Duruusta Tafsiirka ee Culimada Soomaaliyeed (Sheikh Mustafe, Sheikh Cumar Faaruuq, iyo culimada kale) xilligan lama heli karo sababo la xiriira dib-u-habeyn ballaaran, hubin xogeed iyo tayeyn codadka ah oo socota. Dhammaan casharrada dib ayaa loo howlgelin doonaa marka shaqada dib-u-habeynta la dhammaystiro insha Allah.
        </p>
      </div>

      {/* Top Header Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {uiLanguage === 'so'
                    ? 'Maktabadda Tafsiirka ee Culimada Soomaaliyeed'
                    : uiLanguage === 'ar'
                    ? 'مكتبة تفسير القرآن الكريم للعلماء الصوماليين'
                    : 'Somali Scholars Quran Tafsir Library (114 Surahs)'}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Lama heli karo • Not Available</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {uiLanguage === 'so'
                ? "Tafsiirka & Tadabburka Qur'aanka ee Culimada Soomaaliyeed"
                : 'Somali Scholars Quran Exegesis & Contemplation'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {uiLanguage === 'so'
                ? "Diiwaan rasmi ah oo ay ku kaydsan yihiin duruus maqal ah oo tayo sare leh oo laga soo xigtay Sh. Mustafe Xaaji Ismaaciil, Sh. Cumar Faaruuq, iyo Sh. Cabdirashiid Cali Suufi."
                : 'Authentic Somali Quranic Tafsir and Contemplation library featuring verified audio exegesis from Sheikh Mustafe Haji Ismail, Sheikh Omar Faruq, and Sheikh Abdur-Rashid Ali Sufi.'}
            </p>
          </div>

          {/* Library Completion Badge Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-2xl border border-border/60 text-center">
            <div className="px-2">
              <span className="text-lg font-extrabold text-blue-600 block">
                {stats.completeSurahs}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Complete</span>
            </div>
            <div className="px-2 border-x border-border/60">
              <span className="text-lg font-extrabold text-amber-600 block">
                {stats.inProgressSurahs}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">In Progress</span>
            </div>
            <div className="px-2">
              <span className="text-lg font-extrabold text-slate-500 block">
                {stats.notAvailableSurahs}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Pending</span>
            </div>
          </div>
        </div>

        {/* Continue Listening Alert (if user has active session) */}
        {continueListeningItem && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-transparent border border-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-foreground">
                  Continue Listening: {continueListeningItem.lesson.titleSo}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {continueListeningItem.scholar.somaliName} • Surah {continueListeningItem.lesson.surahNumber}:{' '}
                  {continueListeningItem.lesson.surahName} ({formatTime(continueListeningItem.progress.positionSeconds)} saved)
                </p>
              </div>
            </div>
            <button
              onClick={handleResumeContinueListening}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          </div>
        )}

        {/* Search, Scholar Filter & Coverage Status Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border/60">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                uiLanguage === 'so'
                  ? 'Raadi suurad, aayad, caalim, ama cinwaan...'
                  : 'Search by surah, ayah, scholar, or lesson...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/50 border border-border/80 focus:ring-1 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scholar selector */}
          <div className="flex items-center gap-2 bg-muted/50 border border-border/80 px-3 py-1.5 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <select
              value={selectedScholarId}
              onChange={(e) => changeScholar(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Somali Scholars ({allScholars.length})</option>
              {allScholars.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.somaliName} ({s.lessons.length} lessons)
                </option>
              ))}
            </select>
          </div>

          {/* Honest Coverage Status Filter */}
          <div className="flex items-center gap-2 bg-muted/50 border border-border/80 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <select
              value={honestStatusFilter}
              onChange={(e) => setHonestStatusFilter(e.target.value as any)}
              className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All 114 Surahs Coverage ({all114Summaries.length})</option>
              <option value="complete">✓ Complete ({all114Summaries.filter(s => getHonestCoverageTag(s).key === 'complete').length})</option>
              <option value="partially_available">⏳ Partially available ({all114Summaries.filter(s => getHonestCoverageTag(s).key === 'partially_available').length})</option>
              <option value="audio_only">🎧 Audio only ({all114Summaries.filter(s => getHonestCoverageTag(s).key === 'audio_only').length})</option>
              <option value="transcript_only">📄 Transcript only ({all114Summaries.filter(s => getHonestCoverageTag(s).key === 'transcript_only').length})</option>
              <option value="not_digitized">⚙ Not yet digitized ({all114Summaries.filter(s => getHonestCoverageTag(s).key === 'not_digitized').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4-Step Quran Tafsir Workflow Navigation Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-2 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setActiveStep('stepA_surahs')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeStep === 'stepA_surahs'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-muted/40 border-border/60 hover:bg-muted/70 text-foreground'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                activeStep === 'stepA_surahs' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
              }`}>
                A
              </span>
              <span className="text-xs font-bold truncate">Step A: 114 Surahs</span>
            </div>
            <p className={`text-[11px] truncate ${activeStep === 'stepA_surahs' ? 'text-white/80' : 'text-muted-foreground'}`}>
              Honest coverage status flags
            </p>
          </button>

          <button
            onClick={() => setActiveStep('stepB_scholars')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeStep === 'stepB_scholars'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-muted/40 border-border/60 hover:bg-muted/70 text-foreground'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                activeStep === 'stepB_scholars' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
              }`}>
                B
              </span>
              <span className="text-xs font-bold truncate">Step B: Verified Scholars</span>
            </div>
            <p className={`text-[11px] truncate ${activeStep === 'stepB_scholars' ? 'text-white/80' : 'text-muted-foreground'}`}>
              Somali mashayikh directory
            </p>
          </button>

          <button
            onClick={() => setActiveStep('stepC_reading')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeStep === 'stepC_reading'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-muted/40 border-border/60 hover:bg-muted/70 text-foreground'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                activeStep === 'stepC_reading' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
              }`}>
                C
              </span>
              <span className="text-xs font-bold truncate">Step C: Verse-by-Verse</span>
            </div>
            <p className={`text-[11px] truncate ${activeStep === 'stepC_reading' ? 'text-white/80' : 'text-muted-foreground'}`}>
              Reading & audio commentary
            </p>
          </button>

          <button
            onClick={() => {
              setActiveStep('stepD_guided');
              setIsGuidedReadingActive(true);
              setGuidedTimerSeconds(guidedIntervalSeconds);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeStep === 'stepD_guided'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-muted/40 border-border/60 hover:bg-muted/70 text-foreground'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                activeStep === 'stepD_guided' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
              }`}>
                D
              </span>
              <span className="text-xs font-bold truncate">Step D: Guided Reading</span>
            </div>
            <p className={`text-[11px] truncate ${activeStep === 'stepD_guided' ? 'text-white/80' : 'text-muted-foreground'}`}>
              60s countdown interval timer
            </p>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* STEP A: 114 CANONICAL SURAHS CATALOG (VERTICAL SINGLE COLUMN) */}
      {/* ===================================================================== */}
      {activeStep === 'stepA_surahs' && (
        <div className="space-y-4 max-w-4xl mx-auto w-full animate-in fade-in">
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Step A: 114 Canonical Surahs & 15 Juz Catalog — Honest Verification Coverage
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select any surah or juz to open its authentic commentary and audio recordings.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 self-start sm:self-auto">
                {directoryBrowseMode === 'surahs'
                  ? `${filteredSurahs.length} / 114 Surahs`
                  : `${displayedJuzSummaries.length} Juz (${juzRangeFilter === '1_15' ? '15 Juz ee Hore' : juzRangeFilter === '16_30' ? '15 Juz ee Dambe' : 'Dhammaan 30 Juz'})`}
              </span>
            </div>

            {/* View Mode Switcher: Browse by Surah (All 114) vs Browse by Juz (15 Juz / All 30) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/80 w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setDirectoryBrowseMode('surahs')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    directoryBrowseMode === 'surahs'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Suuradaha (All 114 Surahs)
                </button>
                <button
                  type="button"
                  onClick={() => setDirectoryBrowseMode('juz')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    directoryBrowseMode === 'juz'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  15 Juz ee Hore & Dhammaan 30 Juz
                </button>
              </div>

              {directoryBrowseMode === 'juz' && (
                <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => setJuzRangeFilter('1_15')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      juzRangeFilter === '1_15'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    15 Juz ee Hore (1 – 15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJuzRangeFilter('16_30')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      juzRangeFilter === '16_30'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    15 Juz ee Dambe (16 – 30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJuzRangeFilter('all_30')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      juzRangeFilter === 'all_30'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Dhammaan 30 Juz
                  </button>
                </div>
              )}
            </div>

            {/* BROWSE MODE 1: Vertical single-column list of 114 surahs */}
            {directoryBrowseMode === 'surahs' && (
              <div className="divide-y divide-border/40">
                {filteredSurahs.map((surah) => {
                  const isSelected = surah.surahNumber === selectedSurahNumber;
                  const honestTag = getHonestCoverageTag(surah);
                  return (
                    <div
                      key={surah.surahNumber}
                      onClick={() => {
                        changeSurah(surah.surahNumber);
                        setActiveStep('stepC_reading');
                      }}
                      className={`py-3 px-3.5 rounded-2xl border my-1.5 text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-xs border-blue-600'
                          : 'bg-muted/20 border-border/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {surah.surahNumber}
                        </span>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-foreground'}`}>
                              {surah.englishName}
                            </span>
                            <span className="text-xs sm:text-sm font-arabic font-semibold opacity-90">{surah.nameArabic}</span>
                          </div>
                          <p className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {surah.somaliNameTranslation} • {surah.numberOfAyahs} ayahs • {surah.revelationType}
                          </p>
                        </div>
                      </div>

                      {/* Honest Status Pill */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isSelected ? 'bg-white/20 text-white' : honestTag.class
                            }`}
                          >
                            {honestTag.badge}
                          </span>
                          {surah.status === 'not_available' && (
                            <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500 font-medium'}`}>
                              {uiLanguage === 'so' ? 'Tafsiirkan weli lama hayo' : 'Not yet available'}
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                  );
                })}

                {filteredSurahs.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                    <AlertCircle className="w-6 h-6 mx-auto text-muted-foreground" />
                    <p className="font-semibold">No surahs match your current search/filter.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCoverageFilter('all');
                        changeScholar('all');
                      }}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* BROWSE MODE 2: Organized 15 Juz & 30 Juz Cards with Canonical Boundaries */}
            {directoryBrowseMode === 'juz' && (
              <div className="space-y-4 pt-1">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-950 dark:text-blue-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>
                      {juzRangeFilter === '1_15'
                        ? 'Waxaa la muujiyay 15-ka Juz ee Hore (Juz 1 ilaa Juz 15) ee Qur’aanka Kariimka.'
                        : juzRangeFilter === '16_30'
                        ? 'Waxaa la muujiyay 15-ka Juz ee Dambe (Juz 16 ilaa Juz 30) ee Qur’aanka Kariimka.'
                        : 'Waxaa la muujiyay dhammaan 30-ka Juz ee Qur’aanka Kariimka.'}
                    </span>
                  </div>
                  <span className="font-bold text-[11px] bg-card px-2.5 py-1 rounded-xl border border-border shrink-0">
                    {displayedJuzSummaries.length} Juz
                  </span>
                </div>

                <div className="space-y-3">
                  {displayedJuzSummaries.map((juz) => {
                    const isSelected = juz.surahs.some((s) => s.surahNumber === selectedSurahNumber);
                    return (
                      <div
                        key={juz.juzNumber}
                        className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 ${
                          isSelected
                            ? 'bg-card border-blue-500/60 shadow-md ring-2 ring-blue-500/20'
                            : 'bg-card border-border/80 hover:border-blue-500/40 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                              {juz.juzNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                                  {juz.nameEnglish}
                                </h3>
                                <span className="font-arabic font-bold text-blue-600 dark:text-blue-400 text-sm">
                                  {juz.nameArabic}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {juz.nameSomali} • Bogagga {juz.startPage} – {juz.endPage} ({juz.totalPages} bog)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                juz.status === 'complete'
                                  ? 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                                  : juz.status === 'in_progress'
                                  ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                                  : 'bg-slate-500/15 text-slate-500 border border-slate-500/30'
                              }`}
                            >
                              {juz.status === 'complete'
                                ? '✓ Available'
                                : juz.status === 'in_progress'
                                ? '⏳ Partially Available'
                                : '⚙ Not Yet Digitized'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                changeSurah(juz.startSurah);
                                setActiveStep('stepC_reading');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <span>Fur Juz-kan</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Juz Scholar Availability info */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-bold text-foreground">Culimada: </span>
                            {juz.scholarsAvailable.length > 0 ? (
                              <span className="text-blue-700 dark:text-blue-300 font-medium">
                                {juz.scholarsAvailable.join(', ')} ({juz.verifiedLessonsCount} cashar)
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">
                                {uiLanguage === 'so' ? 'Tafsiirkan weli lama hayo (Pending digitization)' : 'Not yet digitized'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold">
                            Wadarta: {juz.surahs.length} Suuradood
                          </span>
                        </div>

                        {/* Surahs inside this Juz with exact ayah boundaries */}
                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                            Suuradaha ku jira Juz-kan & Xuduudaha Aayadaha:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {juz.surahs.map((s) => {
                              const isSurahSelected = s.surahNumber === selectedSurahNumber;
                              return (
                                <button
                                  key={s.surahNumber}
                                  type="button"
                                  onClick={() => {
                                    changeSurah(s.surahNumber);
                                    setActiveStep('stepC_reading');
                                  }}
                                  className={`p-2.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                    isSurahSelected
                                      ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                                      : 'bg-muted/30 border-border/60 hover:bg-muted/70 text-foreground'
                                  }`}
                                >
                                  <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[11px] font-black w-5 text-center shrink-0 ${isSurahSelected ? 'text-white' : 'text-blue-600'}`}>
                                        {s.surahNumber}.
                                      </span>
                                      <span className="font-bold truncate text-xs">
                                        {s.englishName}
                                      </span>
                                    </div>
                                    <p className={`text-[10px] truncate ml-6.5 ${isSurahSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                      Aayadaha {s.startAyahInJuz} – {s.endAyahInJuz} {s.isEntireSurahInJuz ? '(Dhan)' : ''}
                                    </p>
                                  </div>
                                  <span className={`font-arabic text-xs shrink-0 ${isSurahSelected ? 'text-white/90' : 'text-blue-600'}`}>
                                    {s.nameArabic}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP C: SURAH TAFSIR WORKSPACE & PLAYER (VERTICAL SINGLE COLUMN) */}
      {/* ===================================================================== */}
      {activeStep === 'stepC_reading' && (
        <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in">
          {/* Active Surah Banner */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentSurahSummary.surahNumber}
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                      <span>Surah {currentSurahSummary.englishName}</span>
                      <span className="font-arabic text-blue-600 dark:text-blue-400 text-base">
                        {currentSurahSummary.nameArabic}
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {currentSurahSummary.somaliNameTranslation} • {currentSurahSummary.numberOfAyahs} Ayahs •{' '}
                      {currentSurahSummary.revelationType} Revelation
                    </p>
                  </div>
                </div>
              </div>

              {/* Surah Switcher & Prev / Next Surah Navigation */}
              <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 sm:self-center">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={uiLanguage === 'so' ? 'Dooro/Qor suurad...' : 'Jump to surah...'}
                    value={stepCSurahQuery}
                    onChange={(e) => {
                      setStepCSurahQuery(e.target.value);
                      const val = e.target.value.trim().toLowerCase();
                      if (!val) return;
                      const num = parseInt(val, 10);
                      if (num >= 1 && num <= 114) {
                        changeSurah(num);
                        return;
                      }
                      const match = all114Summaries.find(
                        (s) =>
                          s.englishName.toLowerCase().includes(val) ||
                          s.somaliNameTranslation.toLowerCase().includes(val) ||
                          s.nameArabic.includes(val)
                      );
                      if (match) {
                        changeSurah(match.surahNumber);
                      }
                    }}
                    className="w-full sm:w-40 pl-8 pr-6 py-1.5 rounded-xl bg-muted/70 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {stepCSurahQuery && (
                    <button
                      onClick={() => setStepCSurahQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <select
                  value={selectedSurahNumber}
                  onChange={(e) => changeSurah(Number(e.target.value))}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-muted/70 border border-border/80 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[200px]"
                  title="Switch to another Surah"
                >
                  {all114Summaries.map((s) => (
                    <option key={s.surahNumber} value={s.surahNumber}>
                      {s.surahNumber}. {s.englishName} ({s.nameArabic})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={selectedSurahNumber <= 1}
                    onClick={() => changeSurah(selectedSurahNumber - 1)}
                    className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    title="Previous Surah"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={selectedSurahNumber >= 114}
                    onClick={() => changeSurah(selectedSurahNumber + 1)}
                    className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    title="Next Surah"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status & Coverage Overview */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
              <span className="font-semibold text-muted-foreground">Verification Status:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getHonestCoverageTag(currentSurahSummary).class}`}>
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                <span>
                  {currentSurahSummary.status === 'not_available'
                    ? 'TAFSIIRKAN WELI LAMA HAYO • NOT YET AVAILABLE (COMMENTARY NOT YET DIGITIZED)'
                    : getHonestCoverageTag(currentSurahSummary).badge.toUpperCase()}
                </span>
              </span>

              {currentSurahSummary.scholarsAvailable.length > 0 ? (
                <span className="text-muted-foreground text-[11px] sm:ml-auto">
                  Available Scholars:{' '}
                  <strong className="text-foreground">
                    {currentSurahSummary.scholarsAvailable.join(', ')}
                  </strong>
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] sm:ml-auto">
                  {uiLanguage === 'so' ? 'Tafsiirkan weli lama hayo (Pending digitization)' : 'Tafsir not yet available (Pending digitization)'}
                </span>
              )}
            </div>

            {/* View Mode Switcher + Guided Reading Mode Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-muted/60 p-1 rounded-2xl border border-border/80 w-full sm:w-fit gap-1 sm:gap-0">
                <button
                  onClick={() => setViewMode('audio_lessons')}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === 'audio_lessons'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Scholar Audio Lessons ({currentSurahLessons.length})</span>
                </button>
                <button
                  onClick={() => setViewMode('verse_commentary')}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === 'verse_commentary'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Verse-by-Verse Text & Translation</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveStep('stepD_guided');
                  setIsGuidedReadingActive(true);
                  setGuidedTimerSeconds(guidedIntervalSeconds);
                }}
                className="w-full sm:w-auto justify-center px-3.5 py-2 sm:py-1.5 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Launch Guided Reading Mode (60s Timer)</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: SCHOLAR AUDIO LESSONS & PLAYER */}
          {viewMode === 'audio_lessons' && (
            <div className="space-y-6">
              {/* Active Audio Player Card */}
              {selectedLesson ? (
                <div className="bg-card border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-sm bg-gradient-to-br from-blue-500/5 to-transparent space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/15 text-blue-700 dark:text-blue-300">
                        <span>
                          Ayahs {selectedLesson.ayahRange || 'Complete'} • {selectedLesson.duration || 'Full lesson'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {uiLanguage === 'so' ? selectedLesson.titleSo : selectedLesson.titleEn}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Scholar: <strong>{selectedLesson.scholarSomaliName || selectedLesson.scholarName}</strong> •{' '}
                        {selectedLesson.sourceAttribution}
                      </p>
                    </div>

                    {/* Main Play / Pause Button */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={handlePrevLesson}
                        className="p-2.5 rounded-xl bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Previous Lesson"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleTogglePlay}
                        disabled={!selectedLesson.audioUrl || audioLoading}
                        className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-700/25 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                        title={isPlaying ? 'Pause' : 'Play audio lesson'}
                      >
                        {audioLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <button
                        onClick={handleNextLesson}
                        className="p-2.5 rounded-xl bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Next Lesson"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scrubber & Timeline */}
                  {selectedLesson.audioUrl && (
                    <div className="space-y-1.5 pt-2">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-muted rounded-full cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Secondary Audio Controls: Speed & Mute */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold">Speed:</span>
                      {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                            playbackSpeed === speed
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted/70 hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleMute}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Ask AI Button */}
                      <button
                        onClick={() =>
                          handleOpenAiInquiry({
                            surahNumber: selectedLesson.surahNumber,
                            surahName: selectedLesson.surahName,
                            scholarName: selectedLesson.scholarSomaliName,
                            scholarCommentary: selectedLesson.transcriptSo,
                          })
                        }
                        className="px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-blue-500/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Weydii EMufti AI</span>
                      </button>
                    </div>
                  </div>

                  {audioError && (
                    <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{audioError}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={handleRetryAudio}
                          className="px-2.5 py-1 rounded-xl bg-destructive/15 hover:bg-destructive/25 text-destructive font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{uiLanguage === 'so' ? 'Isku day mar kale' : 'Retry Playback'}</span>
                        </button>
                        {selectedLesson?.audioUrl && (
                          <a
                            href={selectedLesson.audioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-xl bg-muted/80 hover:bg-muted text-foreground font-medium flex items-center gap-1.5 transition-colors border border-border/60"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{uiLanguage === 'so' ? 'Fur Codka Toos' : 'Open Direct Audio Link'}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transcript / Scholarly Commentary */}
                  {(selectedLesson.transcriptSo || selectedLesson.transcriptEn) && (
                    <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>{uiLanguage === 'so' ? 'Qoraalka & Dulmarka Casharka' : 'Lesson Commentary & Transcript'}</span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-2xl border border-border/40">
                        {uiLanguage === 'so'
                          ? selectedLesson.transcriptSo || selectedLesson.transcriptEn
                          : selectedLesson.transcriptEn || selectedLesson.transcriptSo}
                      </p>
                    </div>
                  )}
                </div>
              ) : currentSurahLessons.length === 0 ? (
                <div className="p-8 rounded-3xl bg-amber-500/5 dark:bg-amber-500/10 border-2 border-dashed border-amber-500/30 text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/25">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <span>Tafsiirkan weli lama hayo • Not yet available</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {uiLanguage === 'so'
                        ? 'Tafsiirkan weli lama hayo'
                        : `Tafsir Not Yet Available: Surah ${currentSurahSummary.englishName}`}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {uiLanguage === 'so'
                        ? `Ma jiro tafsiir la xaqiijiyay oo hadda u diiwaangashan suuraddan. Duruusta tafsiirka codka ah ee culimada Soomaaliyeed ee Suuradda ${currentSurahSummary.englishName} (${currentSurahSummary.nameArabic}) weli lama hayo lamana gelin diiwaanka. No verified audio recording is currently logged for this surah. EMUFTI AI adheres to strict academic honesty and does not fabricate recordings.`
                        : `Ma jiro tafsiir la xaqiijiyay oo hadda u diiwaangashan. Verified Somali scholarly audio commentary for Surah ${currentSurahSummary.englishName} (${currentSurahSummary.nameArabic}) is not yet available in our verified archives. No verified audio recording is currently logged for this surah. EMUFTI AI adheres to strict academic honesty and does not fabricate recordings.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('verse_commentary')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{uiLanguage === 'so' ? 'Akhri Qoraalka & Fasiraadda Aayadaha' : 'Read Verse-by-Verse Text & Translation'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenAiInquiry({
                          surahNumber: currentSurahSummary.surahNumber,
                          surahName: currentSurahSummary.englishName,
                          scholarName: 'Culimada Soomaaliyeed',
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-card border border-border hover:border-blue-500/40 text-foreground text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>{uiLanguage === 'so' ? 'Weydii EMufti AI (Caawiyaha AI)' : 'Ask EMufti AI (AI Assistant)'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-card border border-border/80 text-center space-y-3">
                  <Headphones className="w-10 h-10 text-muted-foreground mx-auto" />
                  <h3 className="text-base font-bold text-foreground">
                    {uiLanguage === 'so' ? 'Dooro Cashar Tafsiir Ah' : 'Select a Tafsir Lesson'}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Dooro mid ka mid ah casharrada hoose si aad u dhageysato tafsiirka Shiikha.
                  </p>
                </div>
              )}

              {/* List of Available Lessons for this Surah */}
              <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lessons for Surah {currentSurahSummary.englishName} ({currentSurahLessons.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {currentSurahLessons.map((item) => {
                    const isSelected = selectedLesson?.id === item.lesson.id;
                    return (
                      <div
                        key={item.lesson.id}
                        onClick={() => handleSelectLesson(item.lesson, true)}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500 text-foreground font-semibold shadow-xs'
                            : 'bg-muted/30 border-border/60 hover:bg-muted/70 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected && isPlaying
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-blue-600'
                            }`}
                          >
                            {isSelected && isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                          <div className="truncate">
                            <p className="text-xs font-bold text-foreground truncate">
                              {uiLanguage === 'so' ? item.lesson.titleSo : item.lesson.titleEn}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.scholar.somaliName} • Ayahs {item.lesson.ayahRange || 'Full Surah'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-medium text-muted-foreground flex-shrink-0">
                          {item.lesson.duration || ''}
                        </span>
                      </div>
                    );
                  })}

                  {currentSurahLessons.length === 0 && (
                    <div className="p-6 text-center text-xs text-muted-foreground space-y-2 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-dashed border-amber-500/30">
                      <AlertCircle className="w-5 h-5 mx-auto text-amber-500" />
                      <p className="font-bold text-foreground">
                        {uiLanguage === 'so'
                          ? 'Tafsiirkan weli lama hayo / Not yet available'
                          : 'Tafsiirkan weli lama hayo • Not yet available for this surah'}
                      </p>
                      <p className="text-[11px] max-w-md mx-auto leading-relaxed">
                        No verified audio recording is currently logged for this surah. EMUFTI AI adheres to strict academic honesty and does not fabricate recordings. You can read the Arabic text and Somali translation below.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: VERSE-BY-VERSE TEXT & TRANSLATION */}
          {viewMode === 'verse_commentary' && (
            <div className="space-y-4">
              {isLoadingVerses && (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span>Loading authentic Arabic text and Somali translations...</span>
                </div>
              )}

              {versesError && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive text-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{versesError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadVerses(selectedSurahNumber)}
                    className="px-3 py-1.5 rounded-xl bg-destructive/20 hover:bg-destructive/30 text-destructive font-semibold flex items-center gap-1.5 transition-colors w-fit cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{uiLanguage === 'so' ? 'Isku day mar kale' : 'Retry Loading Verses'}</span>
                  </button>
                </div>
              )}

              {!isLoadingVerses && surahVerses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1 bg-muted/40 rounded-2xl border border-border/50">
                    <span className="font-medium">
                      {uiLanguage === 'so'
                        ? `Waxaa la muujiyay dhamaan ${verses.length} / ${currentSurahSummary?.numberOfAyahs || verses.length} aayadood ee Suuradda`
                        : `Displaying all ${verses.length} / ${currentSurahSummary?.numberOfAyahs || verses.length} verses of the Surah`}
                    </span>
                    <span className="text-[11px] font-mono bg-card px-2 py-0.5 rounded-lg border border-border/50 text-foreground">
                      Uthmani Script • Verified Mushaf
                    </span>
                  </div>

                  {/* Ayah Navigation & Fast Jumper Bar */}
                  <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevAyahNav}
                        disabled={activeAyahInView <= 1}
                        className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground disabled:opacity-40 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Aayaddii Hore</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextAyahNav}
                        disabled={activeAyahInView >= surahVerses.length}
                        className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground disabled:opacity-40 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Aayadda Xigta</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-semibold">Dooro Aayad:</span>
                      <select
                        value={activeAyahInView}
                        onChange={(e) => handleScrollToAyah(Number(e.target.value))}
                        className="px-2.5 py-1.5 rounded-xl bg-muted/60 border border-border text-foreground font-bold text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {surahVerses.map((v) => (
                          <option key={v.numberInSurah} value={v.numberInSurah}>
                            Aayadda {v.numberInSurah} ee {surahVerses.length}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Scholar Availability Status Notice */}
                  {selectedScholar && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                        currentSurahLessons.length > 0
                          ? 'bg-blue-500/10 border-blue-500/25 text-blue-950 dark:text-blue-100'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-950 dark:text-amber-100'
                      }`}
                    >
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="font-bold block">
                          Tafsiirka {selectedScholar.somaliName}:
                        </span>
                        <p className="text-[11px] leading-relaxed opacity-90">
                          {currentSurahLessons.length > 0
                            ? `Waxaa la hayaa ${currentSurahLessons.length} cashar oo cod ah oo uu Shiikhu ka duubay Suuradda ${currentSurahSummary.englishName}. Waxaad codka ka dhageysan kartaa tab-ka "Scholar Audio Lessons".`
                            : `Tafsiirka Shiikha ee Suuradda ${currentSurahSummary.englishName} weli lama hayo (Weli lama gelin nidaamka). EMUFTI AI adheres to authentic verified sources and does not invent tafsiir. Waxaad akhrisan kartaa fasiraadda Sh. Maxamuud Maxamed Cabduh ee hoose.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {surahVerses.map((ayah) => {
                    const isBookmarked = bookmarkedVerses.has(ayah.numberInSurah);
                    const isPlayingVerse = playingVerseNumber === ayah.numberInSurah;
                    const isCopied = copiedAyahNumber === ayah.numberInSurah;

                    return (
                      <div
                        key={ayah.number}
                        id={`tafsir-ayah-${ayah.numberInSurah}`}
                        className={`p-5 rounded-3xl bg-card border transition-all duration-200 space-y-3 hover:border-blue-500/40 shadow-xs ${
                          isPlayingVerse
                            ? 'border-blue-500/60 ring-2 ring-blue-500/20 bg-blue-500/5'
                            : 'border-border/80'
                        }`}
                      >
                        {/* Top Header: Verse Number, Coordinates & Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2.5 border-b border-border/40 gap-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {ayah.numberInSurah}
                            </span>
                            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">
                              {currentSurahSummary.englishName} • {selectedSurahNumber}:{ayah.numberInSurah}
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* Verse Recitation Play/Pause Button */}
                              <button
                                type="button"
                                onClick={() => handlePlayVerseAudio(ayah.numberInSurah)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isPlayingVerse
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                                title={isPlayingVerse ? 'Hakad dhig qiraa’ada' : 'Dhageyso qiraa’ada aayadda'}
                                aria-label="Play verse recitation"
                              >
                                {isPlayingVerse && isVerseAudioLoading ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : isPlayingVerse ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                                <span className="text-[10px] hidden sm:inline">
                                  {isPlayingVerse ? 'Playing' : 'Recite'}
                                </span>
                              </button>

                              {/* Bookmark Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleBookmark(ayah)}
                                className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                                  isBookmarked
                                    ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                    : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                                title={isBookmarked ? 'Calaamadda ka qaad' : 'Calaamadee aayaddan'}
                                aria-label="Bookmark verse"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Copy Verse Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyVerse(ayah)}
                                className="p-1.5 rounded-xl bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
                                title="Nuqul ka qaad aayadda & fasiraadda"
                                aria-label="Copy verse"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-blue-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Ask EMufti AI Tafsir Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenAiInquiry({
                                  surahNumber: selectedSurahNumber,
                                  surahName: currentSurahSummary.englishName,
                                  ayahNumber: ayah.numberInSurah,
                                  arabicText: ayah.text,
                                  somaliTranslation: ayah.translationSo,
                                  scholarName: 'Culimada Soomaaliyeed',
                                })
                              }
                              className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                              title="Weydii EMufti AI Tafsiirka"
                            >
                              <Sparkles className="w-3 h-3 flex-shrink-0" />
                              <span className="whitespace-nowrap">Weydii EMufti AI Tafsiirka</span>
                            </button>
                          </div>
                        </div>

                        {/* Arabic Quran Text (RTL) */}
                        <div className="text-right py-2" dir="rtl">
                          <p className="font-arabic text-xl sm:text-2xl leading-loose font-normal text-foreground">
                            {ayah.text}
                            <span className="inline-block mx-2 text-blue-600 font-bold text-sm">
                              ۝{ayah.numberInSurah}
                            </span>
                          </p>
                        </div>

                        {/* Somali Translation */}
                        {ayah.translationSo && (
                          <div className="p-3.5 rounded-2xl bg-muted/40 text-xs text-foreground leading-relaxed border border-border/40">
                            <strong className="text-blue-700 dark:text-blue-400 block mb-1">
                              [Fasiraadda Af-Soomaaliga - Sh. Maxamuud Maxamed Cabduh]:
                            </strong>
                            <p>{ayah.translationSo}</p>
                          </div>
                        )}

                        {/* English Translation */}
                        {ayah.translationEn && (
                          <p className="text-xs text-muted-foreground leading-relaxed italic pl-1">
                            "{ayah.translationEn}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP B: VERIFIED SCHOLARS DIRECTORY */}
      {/* ===================================================================== */}
      {activeStep === 'stepB_scholars' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Step B: Verified Scholars</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Verified Mashayikh Directory
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-foreground mt-1">
                Verified Somali Quran Scholars & Duruus
              </h2>
              <p className="text-xs text-muted-foreground">
                Authentic scholarly commentary from accredited Somali and Arab scholars with verified archives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep('stepC_reading')}
              className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold self-start sm:self-center transition-colors cursor-pointer"
            >
              Continue to Verse Reading →
            </button>
          </div>

          {/* Scholar Filter Tabs */}
          <div className="flex items-center gap-2 pb-1">
            <button
              type="button"
              onClick={() => setScholarFilter('featured')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scholarFilter === 'featured'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              ★ Culimada Tadabburka & Tafsiirka (Sheikh Mustafe)
            </button>
            <button
              type="button"
              onClick={() => setScholarFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scholarFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              Dhammaan Diiwaanka Kaydsan ({allScholars.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedScholars.map((scholar) => {
              const isSelected = selectedScholarId === scholar.id;
              const isMustafe = scholar.id === 'sheikh-mustafe';
              const isAdjusted = scholar.id === 'sheikh-dirir' || scholar.id === 'sheikh-umal';

              return (
                <div
                  key={scholar.id}
                  className={`p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500/60 shadow-md ring-2 ring-blue-500/20'
                      : isMustafe
                      ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 hover:border-amber-500/60 shadow-xs'
                      : 'bg-card border-border/80 hover:border-blue-500/30'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      {/* Scholar Portrait Photo with Fallback */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-blue-500/30 shadow-xs bg-muted/60">
                        {scholar.portraitUrl ? (
                          <img
                            src={scholar.portraitUrl}
                            alt={scholar.somaliName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: scholar.portraitUrl ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center font-bold text-base bg-blue-600/15 text-blue-700 dark:text-blue-300"
                        >
                          {scholar.somaliName.slice(0, 2).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {isMustafe && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-2xs">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Sheekha Tadabburka</span>
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isAdjusted
                            ? 'bg-muted text-muted-foreground border border-border'
                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          <span>{isAdjusted ? 'Duruus Kaydsan' : 'Verified Scholar'}</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground">{scholar.somaliName}</h3>
                      <p className="font-arabic text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {scholar.scholarArabic}
                      </p>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {scholar.country} • {scholar.lessons.length} lessons recorded
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {scholar.descriptionSo || scholar.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    {scholar.externalLink ? (
                      <a
                        href={scholar.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <span>Archive Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Direct Archive</span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        changeScholar(scholar.id);
                        setActiveStep('stepC_reading');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-600/15 hover:bg-blue-600/25 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {isSelected ? 'Active Scholar ✓' : 'Select Scholar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP D: GUIDED READING MODE (60-SECOND TIMER) */}
      {/* ===================================================================== */}
      {activeStep === 'stepD_guided' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Guided Reading Header & Controls */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600/15 via-teal-600/10 to-transparent border border-blue-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    <span>Step D: Guided Reading Mode</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Surah {currentSurahSummary.englishName} ({currentSurahSummary.nameArabic})
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-foreground mt-1">
                  Synchronized 60-Second Guided Reading Interval
                </h2>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Timed reading interval counts down and advances across verses automatically. Standard manual reading is completely preserved below.
                </p>
              </div>

              {/* Live Countdown Clock Badge */}
              <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-blue-500/40 shadow-sm self-start sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Next Ayah In
                  </span>
                  <span className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
                    00:{guidedTimerSeconds.toString().padStart(2, '0')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGuidedTimerPaused(!isGuidedTimerPaused)}
                  className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
                  title={isGuidedTimerPaused ? 'Resume countdown' : 'Pause countdown'}
                >
                  {isGuidedTimerPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                </button>
              </div>
            </div>

            {/* Adjustable Interval, Skip, and Auto-Play Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
              {/* Interval duration selector: '30s', '60s', '90s', '120s' */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-muted-foreground font-semibold">Reading Interval:</span>
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setGuidedIntervalSeconds(sec);
                      setGuidedTimerSeconds(sec);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      guidedIntervalSeconds === sec
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {sec}s {sec === 60 ? '(Default)' : ''}
                  </button>
                ))}
              </div>

              {/* Verse navigation controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGuidedPrevAyah}
                  disabled={guidedAyahIndex === 0}
                  className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-30 text-foreground font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>Prev Ayah</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuidedResetTimer}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Reset interval timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleGuidedNextAyah}
                  disabled={guidedAyahIndex >= surahVerses.length - 1}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Next Ayah</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auto-play toggle & exit guided mode */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={guidedAutoPlayAudio}
                    onChange={(e) => setGuidedAutoPlayAudio(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <span>Audio Auto-Play</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsGuidedReadingActive(false);
                    setActiveStep('stepC_reading');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Exit Guided Mode
                </button>
              </div>
            </div>
          </div>

          {/* Spotlighted Current Verse */}
          {surahVerses.length > 0 && surahVerses[guidedAyahIndex] && (
            <div className="p-6 rounded-3xl bg-card border-2 border-blue-500/60 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {surahVerses[guidedAyahIndex].numberInSurah}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Ayah {surahVerses[guidedAyahIndex].numberInSurah} of {surahVerses.length}
                  </span>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Active Reading Focus (Timer Active)</span>
                </span>
              </div>

              {/* Arabic Quranic Text (RTL) */}
              <div className="text-right py-4" dir="rtl">
                <p className="font-arabic text-2xl sm:text-3xl leading-loose font-normal text-foreground">
                  {surahVerses[guidedAyahIndex].text}{' '}
                  <span className="inline-block mx-2 text-blue-600 font-bold">
                    ۝{surahVerses[guidedAyahIndex].numberInSurah}
                  </span>
                </p>
              </div>

              {/* Somali Translation */}
              {surahVerses[guidedAyahIndex].translationSo && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-sm text-foreground leading-relaxed">
                  <strong className="text-blue-700 dark:text-blue-400 block mb-1">
                    [Fasiraadda Af-Soomaaliga - Sh. Maxamuud Maxamed Cabduh]:
                  </strong>
                  <p>{surahVerses[guidedAyahIndex].translationSo}</p>
                </div>
              )}

              {/* English Translation */}
              {surahVerses[guidedAyahIndex].translationEn && (
                <p className="text-xs text-muted-foreground leading-relaxed italic pl-1">
                  "{surahVerses[guidedAyahIndex].translationEn}"
                </p>
              )}

              <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenAiInquiry({
                      surahNumber: selectedSurahNumber,
                      surahName: currentSurahSummary.englishName,
                      ayahNumber: surahVerses[guidedAyahIndex].numberInSurah,
                      arabicText: surahVerses[guidedAyahIndex].text,
                      somaliTranslation: surahVerses[guidedAyahIndex].translationSo,
                      scholarName: 'Culimada Soomaaliyeed',
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Weydii EMufti AI Tafsiirka Aayaddan</span>
                </button>

                <span className="text-[11px] text-muted-foreground font-mono">
                  Interval pace: {guidedIntervalSeconds}s • Ayah {guidedAyahIndex + 1}/{surahVerses.length}
                </span>
              </div>
            </div>
          )}

          {/* Standard manual reading is completely preserved below without blocking */}
          <div className="space-y-3 pt-4 border-t border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              All Verses in Surah {currentSurahSummary.englishName} (Manual Navigation & Reading)
            </h3>
            <div className="space-y-3">
              {surahVerses.map((ayah, idx) => (
                <div
                  key={ayah.number}
                  onClick={() => {
                    setGuidedAyahIndex(idx);
                    setGuidedTimerSeconds(guidedIntervalSeconds);
                  }}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    idx === guidedAyahIndex
                      ? 'bg-blue-500/10 border-blue-500/60 ring-2 ring-blue-500/20'
                      : 'bg-card border-border/80 hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center">
                      {ayah.numberInSurah}
                    </span>
                    {idx === guidedAyahIndex && (
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        Current Focus
                      </span>
                    )}
                  </div>
                  <div className="text-right py-2" dir="rtl">
                    <p className="font-arabic text-lg sm:text-xl leading-loose font-normal text-foreground">
                      {ayah.text}{' '}
                      <span className="inline-block mx-1 text-blue-600 font-bold">
                        ۝{ayah.numberInSurah}
                      </span>
                    </p>
                  </div>
                  {ayah.translationSo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {ayah.translationSo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EMUFTI AI TAFSIR INQUIRY MODAL */}
      {/* ===================================================================== */}
      {isAiModalOpen && aiModalContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border p-6 rounded-3xl shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Weydii EMufti AI Tafsiirka
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Suuradda {aiModalContext.surahName} • Aayadda {aiModalContext.ayahNumber || 'Guud'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ayah Reference Box */}
            {aiModalContext.arabicText && (
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-right" dir="rtl">
                <p className="font-arabic text-sm text-foreground leading-relaxed">
                  {aiModalContext.arabicText}
                </p>
              </div>
            )}

            {aiModalContext.somaliTranslation && (
              <p className="text-xs text-muted-foreground italic">
                "{aiModalContext.somaliTranslation}"
              </p>
            )}

            {/* Question Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Su'aashaada ama Qodobka aad doonayso in laguugu faahfaahiyo:
              </label>
              <textarea
                rows={3}
                value={aiInquiryText}
                onChange={(e) => setAiInquiryText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-blue-500 text-foreground resize-none"
              />
            </div>

            {/* Clear demarcation notice */}
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-foreground leading-relaxed">
              <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5">
                {uiLanguage === 'so' ? 'Ogeysiiska Kaalmada AI (Separate from Scholar Commentary):' : 'AI Assistance Notice (Distinct from Scholar Lectures):'}
              </span>
              <p className="text-muted-foreground text-[11px]">
                {uiLanguage === 'so'
                  ? 'Falanqayntan waxaa soo saaraya EMufti AI isagoo tixraacaya ilaha Islaamiga ah ee sugan. Kuma beddelayso darsiga tooska ah ee duuban ee culimada Soomaaliyeed.'
                  : 'This response is synthesized by EMufti AI grounded in accredited Sunni sources. It is separate and distinct from recorded scholarly lectures.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Citations based on verified Sunni scholars</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
              >
                Kanoqo / Cancel
              </button>
              <button
                type="button"
                onClick={handleSendToChat}
                disabled={isSubmittingToAi || !aiInquiryText.trim()}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingToAi ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Fur Wada-hadalka / Chat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
