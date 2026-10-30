import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Square,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Headphones,
  Settings,
  User,
  Info,
  Clock,
  ChevronRight,
  Check,
  Award,
  RefreshCw,
  Search,
  ListFilter,
  Globe,
  Sliders,
  Filter,
} from 'lucide-react';
import { Surah, Ayah, QariReciter } from '../../types/database';
import { quranService } from '../../lib/quranService';
import { ALL_50_QARIS, getAvailableCountries, searchQaris } from '../../data/qarisData';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import {
  tajweedAssessmentEngine,
  StrictAyahEvaluationResult,
  tokenizeAyahWithTajweed,
} from '../../lib/tajweedAssessmentEngine';
import { MacallinMistake } from '../../types/database';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getVerseTiming, isFullSurahReciter } from '../../lib/verseTimingService';
import { normalizeArabicForComparison } from '../../lib/macallinService';
import { ReciterAvatar } from './ReciterAvatar';

interface SubcisPracticeProps {
  surahs?: Surah[];
  currentSurahNumber: number;
  onChangeSurah: (surahNumber: number) => void;
  ayahs: Ayah[];
  selectedQari: QariReciter;
  onChangeQari: (qari: QariReciter) => void;
  uiLanguage?: 'en' | 'so' | 'ar';
}

// Subcis Phase & Turn States
export type SubcisWorkflowPhase = 'welcome' | 'setup_select' | 'active_session' | 'completed';
export type SubcisWizardStep = 'surah' | 'reciter' | 'start';
export type SubcisTurnRole = 'qari' | 'user';
export type SubcisTurnState =
  | 'idle'
  | 'qari_reciting'
  | 'user_recording'
  | 'user_recorded'
  | 'completed';

// Flexible Practice Range Selection Modes
export type PracticeRangeMode = 'entire_surah' | 'ayah_range' | 'quantity';

// Speech Recognition interfaces for browser Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

interface UserAttemptRecord {
  ayahNumber: number;
  expectedText: string;
  userTranscript: string;
  userAudioBlobUrl: string | null;
  qariAudioUrl: string;
  hasAudio: boolean;
  evaluation?: StrictAyahEvaluationResult;
}

export const SubcisPractice: React.FC<SubcisPracticeProps> = ({
  surahs = ALL_114_SURAHS,
  currentSurahNumber,
  onChangeSurah,
  ayahs,
  selectedQari,
  onChangeQari,
  uiLanguage = 'so',
}) => {
  // ---------------------------------------------------------------------------
  // 1. Workflow Phases & Wizard Steps
  // ---------------------------------------------------------------------------
  // Defaults to the clean step-by-step setup wizard ('setup_select' -> Step 1: 'surah')
  const [workflowPhase, setWorkflowPhase] = useState<SubcisWorkflowPhase>('setup_select');
  const [wizardStep, setWizardStep] = useState<SubcisWizardStep>('surah');
  const [activeRole, setActiveRoleState] = useState<SubcisTurnRole>('qari');
  const activeRoleRef = useRef<SubcisTurnRole>('qari');
  const setActiveRole = (role: SubcisTurnRole) => {
    activeRoleRef.current = role;
    setActiveRoleState(role);
  };
  const [turnState, setTurnState] = useState<SubcisTurnState>('idle');
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const currentAyahIndexRef = useRef<number>(0);

  // Single source of truth updater for currentAyahIndex ensuring ref and state are in sync
  const updateCurrentAyahIndex = (newIndex: number) => {
    currentAyahIndexRef.current = newIndex;
    setCurrentAyahIndex(newIndex);
  };

  useEffect(() => {
    currentAyahIndexRef.current = currentAyahIndex;
  }, [currentAyahIndex]);

  // Ayahs loaded for the active session
  const [loadedAyahs, setLoadedAyahs] = useState<Ayah[]>(ayahs);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [ayahLoadError, setAyahLoadError] = useState<string | null>(null);

  // Step 1 Search and Category Filter
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');
  const [surahCategoryFilter, setSurahCategoryFilter] = useState<'all' | 'popular' | 'juz_amma'>('all');

  // Step 2 Reciter Search and Country Filter
  const [reciterSearchQuery, setReciterSearchQuery] = useState<string>('');
  const [reciterCountryFilter, setReciterCountryFilter] = useState<string>('All');

  // Preference toggles
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(true);

  // ---------------------------------------------------------------------------
  // 2. Exact 20-Second Countdown Timer for User Recitation
  // ---------------------------------------------------------------------------
  const USER_RECITE_TIME_LIMIT = 20; // Exactly 20 seconds as strictly required
  const [userCountdown, setUserCountdown] = useState<number>(USER_RECITE_TIME_LIMIT);
  const countdownIntervalRef = useRef<any>(null);
  const advanceTimeoutRef = useRef<any>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const isFinishingUserTurnRef = useRef<boolean>(false);

  // Progressive Reveal States (Subcis Hidden-Verse Partner Mode)
  const [revealedWordCount, setRevealedWordCountState] = useState<number>(0);
  const revealedWordCountRef = useRef<number>(0);
  const setRevealedWordCount = (updater: number | ((prev: number) => number)) => {
    setRevealedWordCountState((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      revealedWordCountRef.current = nextVal;
      return nextVal;
    });
  };
  const [isVerseCompleted, setIsVerseCompleted] = useState<boolean>(false);
  const isCompletingVerseRef = useRef<boolean>(false);
  const triggerVerseCompletionRef = useRef<(() => void) | null>(null);
  const audioContextRef = useRef<any>(null);
  const audioAnalyserIntervalRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // ---------------------------------------------------------------------------
  // 3. Audio & Speech Recognition References & Watchers
  // ---------------------------------------------------------------------------
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Strict Turn Enforcement Watchers for Sheikh Cabdirashiid Ali Sufi & Full-Surah Reciters
  const turnWatchIntervalRef = useRef<any>(null);
  const turnSafetyTimeoutRef = useRef<any>(null);

  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [qariAudioError, setQariAudioError] = useState<string | null>(null);
  const [isQariAudioLoading, setIsQariAudioLoading] = useState<boolean>(false);
  const [qariAudioPlaying, setQariAudioPlaying] = useState<boolean>(false);
  const [qariAudioPlaybackFailed, setQariAudioPlaybackFailed] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 4. Flexible Range Selection & Session States
  // ---------------------------------------------------------------------------
  const [rangeMode, setRangeMode] = useState<PracticeRangeMode>('entire_surah');
  const [rangeStartAyah, setRangeStartAyah] = useState<number>(1);
  const [rangeEndAyah, setRangeEndAyah] = useState<number>(7);
  const [rangeQuantity, setRangeQuantity] = useState<number>(5);
  const [customTargetAyahs, setCustomTargetAyahs] = useState<number[] | null>(null);

  // Review & Duration States
  const [isReviewRequested, setIsReviewRequested] = useState<boolean>(false);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // 5. Session History & Final Evaluation Records
  // ---------------------------------------------------------------------------
  const [userAttemptRecords, setUserAttemptRecords] = useState<UserAttemptRecord[]>([]);
  const mistakesSectionRef = useRef<HTMLDivElement | null>(null);

  // Reciters for Subcis: ALL verified reciters, prominently including Sheikh Abdul Rashid Ali Sufi
  const verseReciters = ALL_50_QARIS.filter((q) => q.hasVerseAudio || q.id === 'abdulrasheed-sufi');
  const activeQari = selectedQari || ALL_50_QARIS[0];

  // Current active Surah metadata
  const surahMeta = ALL_114_SURAHS.find((s) => s.number === currentSurahNumber) || surahs[0];
  const totalAyahsInSurah =
    surahMeta?.numberOfAyahs ||
    (loadedAyahs.length > 0 ? loadedAyahs.length : ayahs.length) ||
    7;

  // Sync default range whenever surah changes
  useEffect(() => {
    const total = surahMeta?.numberOfAyahs || 7;
    setRangeStartAyah(1);
    setRangeEndAyah(total);
    setCustomTargetAyahs(null);
  }, [currentSurahNumber, surahMeta?.numberOfAyahs]);

  // Validated Range Calculation
  const effectiveStartAyah = Math.max(1, Math.min(rangeStartAyah, totalAyahsInSurah));
  let effectiveEndAyah = totalAyahsInSurah;

  if (rangeMode === 'entire_surah') {
    effectiveEndAyah = totalAyahsInSurah;
  } else if (rangeMode === 'ayah_range') {
    effectiveEndAyah = Math.max(effectiveStartAyah, Math.min(rangeEndAyah, totalAyahsInSurah));
  } else if (rangeMode === 'quantity') {
    const qty = Math.max(1, Math.min(rangeQuantity, totalAyahsInSurah - effectiveStartAyah + 1));
    effectiveEndAyah = Math.min(totalAyahsInSurah, effectiveStartAyah + qty - 1);
  }

  // Active Ayahs in the session
  const sessionAyahs = useMemo(() => {
    const baseAyahs = loadedAyahs.length > 0 ? loadedAyahs : ayahs;
    if (baseAyahs.length === 0) return [];

    // If practicing specific mistakes:
    if (customTargetAyahs && customTargetAyahs.length > 0) {
      const filtered = baseAyahs.filter((a) => customTargetAyahs.includes(a.numberInSurah));
      if (filtered.length > 0) return filtered;
    }

    return baseAyahs.filter(
      (a) => a.numberInSurah >= effectiveStartAyah && a.numberInSurah <= effectiveEndAyah
    );
  }, [loadedAyahs, ayahs, customTargetAyahs, effectiveStartAyah, effectiveEndAyah]);

  const activeAyahs = sessionAyahs;
  const currentAyah = activeAyahs[currentAyahIndex];
  const totalAyahsCount = activeAyahs.length;
  const isOddAyahCount = totalAyahsCount % 2 !== 0;

  // ---------------------------------------------------------------------------
  // 6. Verse Synchronization & Loading
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;
    const syncVerses = async () => {
      if (ayahs.length > 0 && ayahs[0].numberInSurah === 1 && (!surahMeta || ayahs.length === surahMeta.numberOfAyahs)) {
        setLoadedAyahs(ayahs);
        return;
      }
      setIsLoadingAyahs(true);
      setAyahLoadError(null);
      try {
        const fetched = await quranService.fetchSurahVerses(currentSurahNumber);
        if (!isCancelled) {
          setLoadedAyahs(fetched);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('[Subcis] Error fetching surah verses:', err);
          setAyahLoadError(err?.message || 'Could not load verified Quran verses.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAyahs(false);
        }
      }
    };

    syncVerses();
    return () => {
      isCancelled = true;
    };
  }, [currentSurahNumber, ayahs]);

  // Reset active session if surah or Qari changes to prevent playing mismatched audio or out-of-sync sequence
  useEffect(() => {
    if (workflowPhase === 'active_session') {
      handleResetToSetup();
    }
  }, [currentSurahNumber, activeQari.id]);

  // Track recorded blob URLs for cleanup on component unmount
  const recordedUrlsRef = useRef<string[]>([]);
  const activePlayPromiseRef = useRef<Promise<void> | null>(null);
  const playbackSessionIdRef = useRef<number>(0);

  const cleanupPlaybackWatchers = () => {
    if (turnWatchIntervalRef.current) {
      clearInterval(turnWatchIntervalRef.current);
      turnWatchIntervalRef.current = null;
    }
    if (turnSafetyTimeoutRef.current) {
      clearTimeout(turnSafetyTimeoutRef.current);
      turnSafetyTimeoutRef.current = null;
    }
  };

  const cancelActivePlayback = () => {
    playbackSessionIdRef.current += 1;
    cleanupPlaybackWatchers();
    const audio = qariAudioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  };

  // Clean up timers, recording tracks, and speech recognition on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
      cleanupPlaybackWatchers();
      stopMicrophoneStream();
      stopSpeechRecognition();
      cancelActivePlayback();
      recordedUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
  }, []);

  const cleanupTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (audioAnalyserIntervalRef.current) {
      clearInterval(audioAnalyserIntervalRef.current);
      audioAnalyserIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  const stopMicrophoneStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      micStreamRef.current = null;
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try {
        rec.onend = null;
        rec.onerror = null;
        rec.abort();
      } catch {}
      try {
        rec.stop();
      } catch {}
    }
  };

  // ---------------------------------------------------------------------------
  // 7. Subcis Workflow: Sequential Alternating Recitation with Strict Turn Cutoff
  // ---------------------------------------------------------------------------

  /**
   * Begins the alternating recitation session starting at Ayah 1 (Qari)
   */
  const handleStartActiveSession = () => {
    if (activeAyahs.length === 0) return;
    cleanupTimers();
    cleanupPlaybackWatchers();
    setUserAttemptRecords([]);
    isTransitioningRef.current = false;
    isFinishingUserTurnRef.current = false;
    updateCurrentAyahIndex(0);
    setActiveRole('qari');
    setWorkflowPhase('active_session');

    // Sequential Audio Coordination: start with Qari playing Ayah 1
    playQariAyah(0);
  };

  /**
   * Plays the designated Qari ayah using a race-safe audio playback controller.
   * STRICT TURN ENFORCEMENT for Sheikh Abdur-Rashid Ali Sufi & all full-surah reciters:
   * Programmatically pauses (audio.pause()) and cuts off precisely at the end of
   * the Sheikh's assigned turn.
   */
  const playQariAyah = async (index: number, isExplicitReplay = false) => {
    cleanupTimers();
    cleanupPlaybackWatchers();
    stopMicrophoneStream();
    stopSpeechRecognition();
    isTransitioningRef.current = false;
    isFinishingUserTurnRef.current = false;

    if (index >= activeAyahs.length) {
      handleCompleteSession();
      return;
    }

    const ayahToPlay = activeAyahs[index];
    if (!ayahToPlay) return;

    updateCurrentAyahIndex(index);
    setActiveRole('qari');
    setTurnState('qari_reciting');
    setIsQariAudioLoading(true);
    setQariAudioPlaying(false);
    setQariAudioPlaybackFailed(false);
    setQariAudioError(null);

    const isFullSurah = isFullSurahReciter(activeQari);
    const versesText = activeAyahs.map((a) => a.text);

    // Audio URL: if reciter has full-surah audio, load authentic surah audio
    const audioUrl = isFullSurah
      ? quranService.getSurahAudioUrl(activeQari, currentSurahNumber)
      : quranService.getVerseAudioUrl(activeQari, currentSurahNumber, ayahToPlay.numberInSurah);

    playbackSessionIdRef.current += 1;
    const thisSessionId = playbackSessionIdRef.current;

    const audio = qariAudioRef.current;
    if (!audio) return;

    // 1. Wait for any in-flight play() request to settle before touching src or calling pause()
    if (activePlayPromiseRef.current) {
      try {
        await activePlayPromiseRef.current;
      } catch {}
    }

    if (playbackSessionIdRef.current !== thisSessionId) {
      return;
    }

    // 2. Pause and determine start timestamp
    try {
      audio.pause();
    } catch {}

    const timing = isFullSurah
      ? getVerseTiming(
          currentSurahNumber,
          ayahToPlay.numberInSurah,
          totalAyahsInSurah,
          versesText,
          audio.duration,
          activeQari.id
        )
      : null;

    // 3. Set the new source if needed and load
    try {
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
        audio.load();
      }
    } catch (loadErr) {
      console.warn('[Subcis] Audio load warning:', loadErr);
    }

    // 4. Seek to the start timestamp
    if (isFullSurah && timing) {
      try {
        audio.currentTime = timing.startTime;
      } catch {}
    } else {
      try {
        audio.currentTime = 0;
      } catch {}
    }

    if (playbackSessionIdRef.current !== thisSessionId) {
      return;
    }

    // 5. Play audio and arm strict turn cutoff
    try {
      const playPromise = audio.play();
      activePlayPromiseRef.current = playPromise;
      await playPromise;

      if (playbackSessionIdRef.current !== thisSessionId || activeRoleRef.current !== 'qari') {
        try {
          audio.pause();
        } catch {}
        return;
      }

      setIsQariAudioLoading(false);
      setQariAudioPlaying(true);
      setQariAudioPlaybackFailed(false);
      setQariAudioError(null);

      // STRICT TURN ENFORCEMENT FOR SHEIKH CABDIRASHIID ALI SUFI & FULL-SURAH RECITERS:
      // Programmatically monitor playback and pause precisely at timing.endTime!
      if (isFullSurah && timing) {
        setupTurnCutoffWatcher(thisSessionId, timing.endTime, timing.startTime);
      }
    } catch (err: any) {
      if (playbackSessionIdRef.current !== thisSessionId || activeRoleRef.current !== 'qari') {
        return;
      }

      const isAbort =
        err?.name === 'AbortError' ||
        (typeof err?.message === 'string' &&
          (err.message.includes('interrupted') || err.message.includes('pause')));

      if (isAbort) {
        return;
      }

      console.warn('[Subcis] Qari audio play error:', err);
      setIsQariAudioLoading(false);
      setQariAudioPlaying(false);
      setQariAudioPlaybackFailed(true);
      setQariAudioError(
        `Codka qariga lama bilaabi karin (${err?.message || 'Playback blocked or network error'}). Fadlan riix "Isku day mar kale".`
      );
    } finally {
      if (playbackSessionIdRef.current === thisSessionId) {
        activePlayPromiseRef.current = null;
      }
    }
  };

  /**
   * Sets up high-precision polling and safety timeout to programmatically pause
   * and cut off the Sheikh's recitation at the exact verse end timestamp.
   */
  const setupTurnCutoffWatcher = (sessionId: number, targetEndTime: number, startTime: number) => {
    cleanupPlaybackWatchers();

    const checkCutoff = () => {
      if (playbackSessionIdRef.current !== sessionId || activeRoleRef.current !== 'qari') {
        cleanupPlaybackWatchers();
        return;
      }
      const audio = qariAudioRef.current;
      if (!audio) return;

      // Programmatically pause precisely at the end of the Sheikh's assigned turn
      if (audio.currentTime >= targetEndTime) {
        cleanupPlaybackWatchers();
        try {
          audio.pause();
        } catch {}
        handleQariAudioFinished();
      }
    };

    // 1. High-frequency check every 50ms
    turnWatchIntervalRef.current = setInterval(checkCutoff, 50);

    // 2. Safety timeout fallback
    const turnDuration = Math.max(2.5, targetEndTime - startTime);
    turnSafetyTimeoutRef.current = setTimeout(() => {
      if (playbackSessionIdRef.current === sessionId && activeRoleRef.current === 'qari') {
        cleanupPlaybackWatchers();
        const audio = qariAudioRef.current;
        if (audio) {
          try {
            audio.pause();
          } catch {}
        }
        handleQariAudioFinished();
      }
    }, (turnDuration + 0.35) * 1000);
  };

  /**
   * When Qari finishes their ayah:
   * Programmatically pauses audio, and triggers the student's turn state.
   */
  const handleQariAudioFinished = () => {
    cleanupPlaybackWatchers();
    if (activeRoleRef.current !== 'qari' || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    playbackSessionIdRef.current += 1;

    // Strict Turn Enforcement: ensure audio is definitely paused
    if (qariAudioRef.current) {
      try {
        qariAudioRef.current.pause();
      } catch {}
    }
    setQariAudioPlaying(false);
    setIsQariAudioLoading(false);

    const currentIndex = currentAyahIndexRef.current;
    const nextUserIndex = currentIndex + 1;

    // Check bounds: if nextUserIndex >= total ayahs, the surah has an ODD count of ayahs,
    // and the Qari completed the final ayah!
    if (nextUserIndex >= activeAyahs.length) {
      handleCompleteSession();
      return;
    }

    // Automatically transition to User's consecutive next ayah
    transitionToUserTurn(nextUserIndex);
  };

  /**
   * Prepares and starts the user's turn for the consecutive next ayah.
   * Starts a 20-second countdown and records user's voice.
   */
  const transitionToUserTurn = (userIndex: number) => {
    cleanupTimers();
    cleanupPlaybackWatchers();
    playbackSessionIdRef.current += 1;
    if (qariAudioRef.current) {
      try {
        qariAudioRef.current.pause();
      } catch {}
    }
    setQariAudioPlaying(false);
    setIsQariAudioLoading(false);

    isTransitioningRef.current = false;
    isFinishingUserTurnRef.current = false;
    isCompletingVerseRef.current = false;

    updateCurrentAyahIndex(userIndex);
    setActiveRole('user');
    setTurnState('user_recording');
    setUserCountdown(USER_RECITE_TIME_LIMIT);
    setSpeechTranscript('');
    setRevealedWordCount(0);
    setIsVerseCompleted(false);

    let remainingSeconds = USER_RECITE_TIME_LIMIT;
    const targetAyah = activeAyahs[userIndex];
    const targetWordTokens = targetAyah ? targetAyah.text.trim().split(/\s+/).filter(Boolean) : [];
    const totalWords = targetWordTokens.length || 5;

    // Start 20-second countdown timer safely in background (hidden UI)
    countdownIntervalRef.current = setInterval(() => {
      remainingSeconds -= 1;
      if (remainingSeconds <= 0) {
        setUserCountdown(0);
        // Strict: Do NOT auto-advance or timeout while user is silent or preparing to recite.
        // Advancement is strictly and exclusively triggered when the verse recitation is completed.
        if (isCompletingVerseRef.current || revealedWordCountRef.current >= totalWords) {
          cleanupTimers();
          handleFinishUserTurnAutomatically();
        }
      } else {
        setUserCountdown(remainingSeconds);
      }
    }, 1000);

    // Initialize microphone and Arabic speech recognition
    setTimeout(() => {
      startUserRecording(userIndex);
    }, 250);
  };

  /**
   * Normalizes Arabic text for faithful real-time recitation token comparison.
   * Strips tashkeel (shakil / diacritics), pause signs, superscripts, and normalizes alef variants.
   */
  const normalizeArabicVerseText = (str: string): string => {
    return normalizeArabicForComparison(str);
  };

  /**
   * Checks if a spoken Arabic token matches a target Quranic word flexibly
   */
  const isWordMatch = (spoken: string, target: string): boolean => {
    if (!spoken || !target) return false;
    if (spoken === target) return true;
    // Strip common Quranic prefixes: waw, faa, baa, alif-lam, laam
    const clean = (w: string) => w.replace(/^(ال|و|ف|ب|ل|ك)/, '');
    const cleanSpoken = clean(spoken);
    const cleanTarget = clean(target);
    if (cleanSpoken && cleanTarget && cleanSpoken === cleanTarget) return true;
    if (cleanTarget === spoken || target === cleanSpoken) return true;
    if (spoken.length >= 3 && target.includes(spoken)) return true;
    if (target.length >= 3 && spoken.includes(target)) return true;
    // 1-character difference for longer words (accounting for speech recognition acoustic ambiguity)
    if (Math.abs(spoken.length - target.length) <= 1 && (spoken.length >= 4 || target.length >= 4)) {
      let diff = 0;
      const minLen = Math.min(spoken.length, target.length);
      for (let k = 0; k < minLen; k++) {
        if (spoken[k] !== target[k]) diff++;
        if (diff > 1) break;
      }
      if (diff <= 1) return true;
    }
    return false;
  };

  /**
   * Starts microphone recording and authentic Arabic speech recognition for the user's ayah.
   * Progressively reveals the verse text word-by-word as words are pronounced into the mic ("Kelmad-Kelmad").
   */
  const startUserRecording = async (targetIndex?: number) => {
    if (activeRoleRef.current !== 'user') return;
    const recordIndex = typeof targetIndex === 'number' ? targetIndex : currentAyahIndexRef.current;
    setMicPermissionError(null);
    let gatheredTranscript = '';

    const targetAyah = activeAyahs[recordIndex];
    const targetWordTokens = targetAyah ? targetAyah.text.trim().split(/\s+/).filter(Boolean) : [];
    const totalWords = targetWordTokens.length || 5;
    const targetTokens = targetWordTokens.map(normalizeArabicVerseText);

    // Trigger seamless completion: reveals complete verse and automatically passes turn to Sheikh
    const triggerVerseCompletionAndNext = () => {
      if (activeRoleRef.current !== 'user' || isCompletingVerseRef.current) return;
      isCompletingVerseRef.current = true;
      setIsVerseCompleted(true);
      setRevealedWordCount(totalWords);
      // Natural 500ms celebration pause to show completed verse before automatically handing turn to Sheikh
      setTimeout(() => {
        if (activeRoleRef.current === 'user') {
          handleFinishUserTurnAutomatically();
        }
      }, 500);
    };

    triggerVerseCompletionRef.current = triggerVerseCompletionAndNext;

    // 1. Initialize Browser Speech Recognition (Arabic)
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const startRecognitionInstance = () => {
        if (
          activeRoleRef.current !== 'user' ||
          isCompletingVerseRef.current ||
          isFinishingUserTurnRef.current
        ) {
          return;
        }

        try {
          if (recognitionRef.current) {
            const oldRec = recognitionRef.current;
            recognitionRef.current = null;
            try {
              oldRec.onend = null;
              oldRec.onerror = null;
              oldRec.abort();
            } catch {}
          }

          const recognition: SpeechRecognitionInstance = new SpeechRecognitionClass();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'ar-SA';
          try {
            (recognition as any).maxAlternatives = 3;
          } catch {}

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let fullTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                fullTranscript += res[0].transcript + ' ';
              } else {
                interimTranscript += res[0].transcript + ' ';
              }
            }
            const directTranscript = event.results[0]?.[0]?.transcript || '';
            const currentCombined = (fullTranscript + ' ' + interimTranscript).trim() || directTranscript.trim();
            if (!currentCombined) return;

            gatheredTranscript = currentCombined;
            setSpeechTranscript(currentCombined);

            // Real-time speech-driven progressive reveal ("Kelmad-Kelmad")
            if (totalWords > 0 && !isCompletingVerseRef.current) {
              const normalizedSpoken = normalizeArabicVerseText(currentCombined);
              const spokenTokens = normalizedSpoken.split(/\s+/).filter(Boolean);

              if (spokenTokens.length > 0) {
                // Real-time sequential matching against target verse words
                let matchedWords = 0;
                let targetPointer = 0;

                for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
                  const spokenWord = spokenTokens[sIdx];
                  if (targetPointer < targetTokens.length) {
                    if (isWordMatch(spokenWord, targetTokens[targetPointer])) {
                      matchedWords++;
                      targetPointer++;
                    } else if (
                      targetPointer + 1 < targetTokens.length &&
                      isWordMatch(spokenWord, targetTokens[targetPointer + 1])
                    ) {
                      matchedWords += 2;
                      targetPointer += 2;
                    } else if (
                      targetPointer + 2 < targetTokens.length &&
                      isWordMatch(spokenWord, targetTokens[targetPointer + 2])
                    ) {
                      matchedWords += 3;
                      targetPointer += 3;
                    }
                  }
                }

                // Progressively reveal words strictly and exclusively matching live spoken Arabic words
                // Zero auto-reveal: only matching spoken pronunciation advances the reveal
                const wordsProgress = Math.min(totalWords, Math.max(matchedWords, targetPointer));
                if (wordsProgress > 0) {
                  setRevealedWordCount((prev) => {
                    const nextCount = Math.max(prev, wordsProgress);
                    if (nextCount >= totalWords) {
                      triggerVerseCompletionAndNext();
                    }
                    return nextCount;
                  });
                }
              }
            }
          };

          recognition.onspeechstart = () => {};

          recognition.onspeechend = () => {
            // Only auto-trigger completion if all words were already recited
            if (!isCompletingVerseRef.current && revealedWordCountRef.current >= totalWords) {
              triggerVerseCompletionAndNext();
            }
          };

          recognition.onerror = (e: any) => {
            const err = e?.error;
            // 'no-speech' and 'aborted' are benign browser lifecycle events; handle gracefully without dropping listener
            if (err === 'no-speech' || err === 'aborted') {
              return;
            }
            if (err === 'not-allowed' || err === 'service-not-allowed') {
              setMicPermissionError(
                uiLanguage === 'so'
                  ? 'Fadlan oggolow makarafoonka browser-ka si aad codkaaga u duubto.'
                  : 'Microphone permission denied. Please allow microphone access to record your recitation.'
              );
            }
            console.warn('[Subcis SpeechRecognition notice]:', err || e);
          };

          recognition.onend = () => {
            // Robust auto-restart on onend:
            // If user's turn ("Adiga ayaa akhrinaya") is active, automatically restart so microphone listener never drops out
            if (
              activeRoleRef.current === 'user' &&
              !isCompletingVerseRef.current &&
              !isFinishingUserTurnRef.current
            ) {
              setTimeout(() => {
                if (
                  activeRoleRef.current === 'user' &&
                  !isCompletingVerseRef.current &&
                  !isFinishingUserTurnRef.current
                ) {
                  startRecognitionInstance();
                }
              }, 60);
            }
          };

          recognition.start();
        } catch {
          // If start throws or instance state conflicts, retry shortly if student's turn is still active
          setTimeout(() => {
            if (
              activeRoleRef.current === 'user' &&
              !isCompletingVerseRef.current &&
              !isFinishingUserTurnRef.current
            ) {
              startRecognitionInstance();
            }
          }, 100);
        }
      };

      try {
        stopSpeechRecognition();
        setTimeout(() => {
          startRecognitionInstance();
        }, 60);
      } catch (err) {
        console.warn('[Subcis] Speech recognition start notice:', err);
      }
    }

    // 2. Initialize MediaRecorder for local audio capture (Zero Server Upload)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        recordedUrlsRef.current.push(url);
        const hasCapturedAudio = audioChunksRef.current.length > 0 && audioBlob.size > 200;

        const currentTarget = activeAyahs[recordIndex];
        if (currentTarget) {
          const qariUrl = quranService.getVerseAudioUrl(
            activeQari,
            currentSurahNumber,
            currentTarget.numberInSurah
          );

          setUserAttemptRecords((prev) => [
            ...prev,
            {
              ayahNumber: currentTarget.numberInSurah,
              expectedText: currentTarget.text,
              userTranscript: gatheredTranscript || speechTranscript,
              userAudioBlobUrl: url,
              qariAudioUrl: qariUrl,
              hasAudio: hasCapturedAudio,
            },
          ]);
        }

        // Stop hardware microphone tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();

      // 3. AudioContext initialization for live audio stream monitoring (NO auto-reveal timer)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
          const sourceNode = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.3;
          sourceNode.connect(analyser);
        }
      } catch (acErr) {
        console.warn('[Subcis AudioContext notice]:', acErr);
      }
    } catch (err: any) {
      console.error('[Subcis] Microphone error:', err);
      setMicPermissionError(
        uiLanguage === 'so'
          ? 'Fadlan oggolow makarafoonka browser-ka si aad codkaaga u duubto.'
          : 'Microphone permission denied. Please allow microphone access to record your recitation.'
      );
    }
  };

  /**
   * Called when the 20-second timer expires or user submits turn early.
   */
  const handleFinishUserTurnAutomatically = () => {
    if (activeRoleRef.current !== 'user' || isFinishingUserTurnRef.current) return;
    isFinishingUserTurnRef.current = true;

    cleanupTimers();
    cleanupPlaybackWatchers();

    stopMicrophoneStream();
    stopSpeechRecognition();
    setTurnState('user_recorded');

    const currentIndex = currentAyahIndexRef.current;
    const nextQariIndex = currentIndex + 1;

    // Check bounds: if nextQariIndex >= total ayahs, the surah had an EVEN count of ayahs,
    // and the user finished the final ayah!
    if (nextQariIndex >= activeAyahs.length) {
      advanceTimeoutRef.current = setTimeout(() => {
        isFinishingUserTurnRef.current = false;
        handleCompleteSession();
      }, 500);
      return;
    }

    // Instantly transition state to Sheikh's turn ("Sheikh ayaa akhrinaya") and trigger audio
    setActiveRole('qari');
    setTurnState('qari_reciting');

    advanceTimeoutRef.current = setTimeout(() => {
      isFinishingUserTurnRef.current = false;
      playQariAyah(nextQariIndex);
    }, 150);
  };

  /**
   * Concludes the session, calculates stats, and prepares completion summary
   */
  const handleCompleteSession = () => {
    cleanupTimers();
    cleanupPlaybackWatchers();
    isTransitioningRef.current = false;
    isFinishingUserTurnRef.current = false;
    stopMicrophoneStream();
    stopSpeechRecognition();
    if (qariAudioRef.current) {
      try {
        qariAudioRef.current.pause();
      } catch {}
    }
    setSessionDurationSeconds(Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000)));
    setTurnState('completed');
    setWorkflowPhase('completed');
  };

  /**
   * Evaluates all recorded ayahs on-demand when user clicks "Review My Recitation"
   */
  const handleRunRecitationReview = () => {
    setIsAssessing(true);

    setTimeout(() => {
      const evaluatedRecords: UserAttemptRecord[] = userAttemptRecords.map((attempt) => {
        const hasSpeech = Boolean(attempt.userTranscript && attempt.userTranscript.trim().length > 0);

        if (!hasSpeech && !attempt.hasAudio) {
          const unverifiedEvaluation: StrictAyahEvaluationResult = {
            ayahNumber: attempt.ayahNumber,
            status: 'unverified',
            confidence: 0,
            mistakes: [],
            wordVerifications: tokenizeAyahWithTajweed(attempt.expectedText).map((tok, wIdx) => ({
              word_index: wIdx,
              wordIndex: wIdx,
              ayah_number: attempt.ayahNumber,
              raw_text: tok.rawText,
              rawText: tok.rawText,
              normalized_text: tok.normalizedText,
              normalizedText: tok.normalizedText,
              status: 'pending' as const,
              errorType: null,
            })),
            feedbackMessageSo: 'Lama helin cod la xaqiijin karo (Not Assessed / Missing Recording).',
            feedbackMessageAr: '',
            feedbackMessageEn: '',
          };
          return {
            ...attempt,
            evaluation: unverifiedEvaluation,
          };
        }

        const targetAyah = activeAyahs.find((a) => a.numberInSurah === attempt.ayahNumber) || {
          numberInSurah: attempt.ayahNumber,
          text: attempt.expectedText,
        };

        const evaluation = tajweedAssessmentEngine.evaluateAyahStrict(
          targetAyah.numberInSurah,
          targetAyah.text,
          attempt.userTranscript,
          currentSurahNumber
        );

        return {
          ...attempt,
          evaluation,
        };
      });

      setUserAttemptRecords(evaluatedRecords);
      setIsAssessing(false);
      setIsReviewRequested(true);

      // Save evaluated session to Supabase
      saveSessionToSupabase(evaluatedRecords);
    }, 500);
  };

  const handlePracticeMistakesAgain = () => {
    const mistakeAyahs = userAttemptRecords
      .filter((r) => r.evaluation && r.evaluation.mistakes && r.evaluation.mistakes.length > 0)
      .map((r) => r.ayahNumber);

    if (mistakeAyahs.length === 0) return;

    setCustomTargetAyahs(mistakeAyahs);
    handleStartActiveSession();
  };

  const handlePracticeSingleAyah = (ayahNum: number) => {
    setCustomTargetAyahs([ayahNum]);
    handleStartActiveSession();
  };

  const saveSessionToSupabase = async (records: UserAttemptRecord[] = userAttemptRecords) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const totalVerses = activeAyahs.length;
      const userAttemptsCount = records.length;
      const qariCount = totalVerses - userAttemptsCount;
      const cleanCount = records.filter((r) => r.evaluation?.status === 'passed').length;
      const totalMistakes = records.reduce((acc, r) => acc + (r.evaluation?.mistakes?.length || 0), 0);
      const totalWords = records.reduce((acc, r) => acc + (r.evaluation?.wordVerifications?.length || 0), 0);
      const correctWords = records.reduce(
        (acc, r) => acc + (r.evaluation?.wordVerifications?.filter((w) => w.status === 'correct').length || 0),
        0
      );
      const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

      const mistakesList = records.flatMap((r) =>
        (r.evaluation?.mistakes || []).map((m) => ({
          ayahNumber: r.ayahNumber,
          category: m.category,
          categoryLabelSo: m.categoryLabelSo,
          expectedText: m.expectedText,
          detectedText: m.detectedText,
          correctionNoteSo: m.correctionNoteSo,
        }))
      );

      if (isSupabaseConfigured && userId) {
        await supabase.from('quran_subcis_sessions').insert({
          user_id: userId,
          surah_number: currentSurahNumber,
          surah_name: surahMeta?.englishName || '',
          qari_id: activeQari.id,
          qari_name: activeQari.name,
          total_ayahs: totalVerses,
          user_ayahs_count: userAttemptsCount,
          qari_ayahs_count: qariCount,
          passed_count: cleanCount,
          mistakes_count: totalMistakes,
          accuracy_percentage: accuracy,
          mistakes_data: mistakesList,
        });
      }

      const localHistory = JSON.parse(localStorage.getItem('emufti_subcis_history') || '[]');
      localHistory.unshift({
        surah_number: currentSurahNumber,
        surah_name: surahMeta?.englishName || '',
        qari_name: activeQari.name,
        total_ayahs: totalVerses,
        user_ayahs_count: userAttemptsCount,
        accuracy_percentage: accuracy,
        completed_at: new Date().toISOString(),
      });
      localStorage.setItem('emufti_subcis_history', JSON.stringify(localHistory.slice(0, 20)));
    } catch (err) {
      console.warn('[Subcis] Supabase session persistence notice:', err);
    }
  };

  /**
   * Resets the entire session back to Welcome
   */
  const handleResetToWelcome = () => {
    cleanupTimers();
    cleanupPlaybackWatchers();
    isTransitioningRef.current = false;
    isFinishingUserTurnRef.current = false;
    stopMicrophoneStream();
    stopSpeechRecognition();
    if (qariAudioRef.current) qariAudioRef.current.pause();
    if (userAudioPlayerRef.current) userAudioPlayerRef.current.pause();
    setActiveAudioPlayingId(null);
    setIsReviewRequested(false);
    setIsAssessing(false);
    setCustomTargetAyahs(null);
    updateCurrentAyahIndex(0);
    setActiveRole('qari');
    setTurnState('idle');
    setWorkflowPhase('welcome');
    setUserCountdown(USER_RECITE_TIME_LIMIT);
  };

  /**
   * Resets to the step-by-step setup selection phase
   */
  const handleResetToSetup = () => {
    cleanupTimers();
    cleanupPlaybackWatchers();
    isTransitioningRef.current = false;
    isFinishingUserTurnRef.current = false;
    stopMicrophoneStream();
    stopSpeechRecognition();
    if (qariAudioRef.current) qariAudioRef.current.pause();
    if (userAudioPlayerRef.current) userAudioPlayerRef.current.pause();
    setActiveAudioPlayingId(null);
    setIsReviewRequested(false);
    setIsAssessing(false);
    setCustomTargetAyahs(null);
    updateCurrentAyahIndex(0);
    setActiveRole('qari');
    setTurnState('idle');
    setWorkflowPhase('setup_select');
    setWizardStep('surah');
    setUserCountdown(USER_RECITE_TIME_LIMIT);
  };

  // Filtered Surahs for setup search
  const popularSurahNumbers = [1, 18, 36, 55, 56, 67, 78, 112, 113, 114];
  const filteredSurahs = useMemo(() => {
    return ALL_114_SURAHS.filter((s) => {
      const matchesSearch =
        s.englishName.toLowerCase().includes(surahSearchQuery.toLowerCase()) ||
        s.name.includes(surahSearchQuery) ||
        String(s.number).includes(surahSearchQuery);

      if (!matchesSearch) return false;

      if (surahCategoryFilter === 'popular') {
        return popularSurahNumbers.includes(s.number);
      }
      if (surahCategoryFilter === 'juz_amma') {
        return s.number >= 78;
      }
      return true;
    });
  }, [surahSearchQuery, surahCategoryFilter]);

  // Filtered Reciters for Step 2
  const filteredReciters = useMemo(() => {
    return ALL_50_QARIS.filter((q) => {
      const matchesSearch =
        q.name.toLowerCase().includes(reciterSearchQuery.toLowerCase()) ||
        q.arabicName.includes(reciterSearchQuery) ||
        q.country.toLowerCase().includes(reciterSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (reciterCountryFilter !== 'All') {
        return q.country.toLowerCase().includes(reciterCountryFilter.toLowerCase());
      }
      return true;
    });
  }, [reciterSearchQuery, reciterCountryFilter]);

  // Parity & Statistics
  const userRecitedAyahsCount = userAttemptRecords.length;
  const assessedAyahsCount = userAttemptRecords.filter(
    (r) => r.evaluation && r.evaluation.status !== 'unverified'
  ).length;
  const unverifiedAyahsCount = userAttemptRecords.filter(
    (r) => !r.evaluation || r.evaluation.status === 'unverified'
  ).length;
  const cleanPassCount = userAttemptRecords.filter((r) => r.evaluation?.status === 'passed').length;
  const totalMistakesCount = userAttemptRecords.reduce(
    (acc, r) => acc + (r.evaluation?.mistakes?.length || 0),
    0
  );

  return (
    <div className="subcis-container space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
      {/* 
        Persistent Single Audio Players:
        Mounted permanently at the root so they NEVER unmount when switching
        between views. Guarantees clean audio playback and reliable event delivery.
      */}
      <audio
        ref={qariAudioRef}
        preload="auto"
        onPlaying={() => {
          if (activeRoleRef.current !== 'qari') {
            try {
              qariAudioRef.current?.pause();
            } catch {}
            return;
          }
          setIsQariAudioLoading(false);
          setQariAudioPlaying(true);
          setQariAudioPlaybackFailed(false);
          setQariAudioError(null);
        }}
        onPause={() => setQariAudioPlaying(false)}
        onEnded={() => {
          if (activeRoleRef.current === 'qari') {
            handleQariAudioFinished();
          }
        }}
        onError={() => {
          if (activeRoleRef.current === 'qari') {
            setIsQariAudioLoading(false);
            setQariAudioPlaying(false);
            setQariAudioPlaybackFailed(true);
            setQariAudioError('Codka qariga lama helin aayaddan ama xiriirka ayaa go\'ay. Fadlan riix "Isku day mar kale".');
          }
        }}
      />
      <audio
        ref={userAudioPlayerRef}
        onEnded={() => setActiveAudioPlayingId(null)}
        onError={() => setActiveAudioPlayingId(null)}
      />

      {/* ----------------------------------------------------------------------- */}
      {/* 7. VIEW 1: Welcome Header Banner                                         */}
      {/* ----------------------------------------------------------------------- */}
      {(workflowPhase === 'welcome' || workflowPhase === 'setup_select') && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-blue-700 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-4 sm:p-7 shadow-xl shadow-blue-950/20 border border-blue-500/40">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 sm:w-56 h-44 sm:h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] sm:text-xs font-semibold mb-3 max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">Dhaqanka Subcis-ka Soomaaliyeed (Alternating Recitation)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Ku soo dhawoow Subcis
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-blue-50 leading-relaxed font-medium">
              Dhageyso qaariga, akhri aayadaha ku xiga, kuna horumari akhriskaaga Qur’aanka.
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-blue-100">
              <span className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-xl border border-white/15 text-[11px] font-medium">
                <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                <span>20 Ilbiriqsi aayad kasta (20s per ayah)</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-xl border border-white/15 text-[11px] font-medium">
                <ShieldCheck className="w-3 h-3 text-blue-300 shrink-0" />
                <span>Local Recording Only (Zero Server Upload)</span>
              </span>
            </div>

            {workflowPhase === 'welcome' && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setWorkflowPhase('setup_select');
                    setWizardStep('surah');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 active:scale-[0.99] font-extrabold text-xs sm:text-sm shadow-lg ring-2 ring-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Bilow Imminka</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* 8. STEP-BY-STEP SETUP WIZARD (Surah -> Reciter -> Bilow Subciska)         */}
      {/* ----------------------------------------------------------------------- */}
      {workflowPhase === 'setup_select' && (
        <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 pb-24 sm:pb-8 shadow-xs space-y-6">
          {/* Wizard Step Navigation Indicator */}
          <div className="border-b border-border/70 pb-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Habaynta Subcis-ka (Step-by-Step Setup)
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {wizardStep === 'surah' ? 'Tallaabada 1 / 3' : wizardStep === 'reciter' ? 'Tallaabada 2 / 3' : 'Tallaabada 3 / 3'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {/* Step 1 Pill */}
              <button
                type="button"
                onClick={() => setWizardStep('surah')}
                className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  wizardStep === 'surah'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-muted/40 border-border/60 text-foreground hover:bg-muted/70'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    wizardStep === 'surah' ? 'bg-white text-blue-600' : 'bg-muted-foreground/20 text-foreground'
                  }`}
                >
                  1
                </div>
                <div className="min-w-0 hidden sm:block">
                  <span className="text-xs font-bold block truncate">Dooro Suuradda</span>
                  <span className={`text-[10px] block truncate ${wizardStep === 'surah' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {surahMeta.englishName}
                  </span>
                </div>
                <span className="text-xs font-bold sm:hidden truncate">Suuradda</span>
              </button>

              {/* Step 2 Pill */}
              <button
                type="button"
                onClick={() => setWizardStep('reciter')}
                className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  wizardStep === 'reciter'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-muted/40 border-border/60 text-foreground hover:bg-muted/70'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    wizardStep === 'reciter' ? 'bg-white text-blue-600' : 'bg-muted-foreground/20 text-foreground'
                  }`}
                >
                  2
                </div>
                <div className="min-w-0 hidden sm:block">
                  <span className="text-xs font-bold block truncate">Dooro Qaariga</span>
                  <span className={`text-[10px] block truncate ${wizardStep === 'reciter' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {activeQari.name.split(' ')[0]}
                  </span>
                </div>
                <span className="text-xs font-bold sm:hidden truncate">Qaariga</span>
              </button>

              {/* Step 3 Pill */}
              <button
                type="button"
                onClick={() => setWizardStep('start')}
                className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  wizardStep === 'start'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-muted/40 border-border/60 text-foreground hover:bg-muted/70'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    wizardStep === 'start' ? 'bg-white text-blue-600' : 'bg-muted-foreground/20 text-foreground'
                  }`}
                >
                  3
                </div>
                <div className="min-w-0 hidden sm:block">
                  <span className="text-xs font-bold block truncate">Bilow Subciska</span>
                  <span className={`text-[10px] block truncate ${wizardStep === 'start' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    Bilaabid
                  </span>
                </div>
                <span className="text-xs font-bold sm:hidden truncate">Bilow</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* STEP 1: CHOOSE SURAH (DOORO SUURADDA)                                */}
          {/* ------------------------------------------------------------------- */}
          {wizardStep === 'surah' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Tallaabada 1 — Dooro Suuradda (Choose Surah)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dooro suuradda aad rabto inaad barato mid ka mid ah dhammaan 114-ka Suuradood.
                  </p>
                </div>

                {/* Category Pills - Smooth horizontal scrolling without clipping */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 px-1 py-1 w-full max-w-full touch-pan-x whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setSurahCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      surahCategoryFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    Dhammaan (114)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurahCategoryFilter('popular')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      surahCategoryFilter === 'popular'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    Caanka ah (Popular)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurahCategoryFilter('juz_amma')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      surahCategoryFilter === 'juz_amma'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    Juz Amma (78-114)
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Raadi magaca ama lambarka suuradda (tusaale: Al-Fatihah, Ya-Sin, 67)..."
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Surahs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto chat-scrollbar pr-1">
                {filteredSurahs.map((s) => {
                  const isSelected = s.number === currentSurahNumber;
                  return (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => {
                        onChangeSurah(s.number);
                        setWizardStep('reciter');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                          : 'bg-muted/20 border-border/70 hover:bg-muted/50 hover:border-blue-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {s.number}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {s.englishName}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {s.numberOfAyahs} Aayadood • {s.revelationType === 'Meccan' ? 'Makki' : 'Madani'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-arabic text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 block" dir="rtl">
                          {s.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-blue-600 flex items-center justify-end gap-1 mt-0.5">
                            <Check className="w-3 h-3" />
                            <span>La doortay</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav Row for Step 1 */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <span className="text-xs text-muted-foreground">
                  Suuradda la xushay: <strong className="text-foreground">{surahMeta.number}. {surahMeta.englishName}</strong> ({surahMeta.numberOfAyahs} Aayadood)
                </span>
                <button
                  type="button"
                  onClick={() => setWizardStep('reciter')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Xiga: Dooro Qaariga</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STEP 2: CHOOSE RECITER (DOORO QAARIGA)                               */}
          {/* ------------------------------------------------------------------- */}
          {wizardStep === 'reciter' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Dooro Qaariga kula subcinaya
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dooro Qaariga aad rabto inaad la subciso — oo uu ku jiro Sheikh Cabdirashiid Cali Suufi.
                  </p>
                </div>

                {/* Country Filter Pills - Smooth horizontal scrolling without clipping */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 px-1 py-1 w-full max-w-full touch-pan-x whitespace-nowrap">
                  {['All', 'Somalia', 'Egypt', 'Kuwait', 'Saudi Arabia'].map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => setReciterCountryFilter(country)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        reciterCountryFilter === country
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {country === 'All' ? 'Dhammaan (50)' : country === 'Somalia' ? '🇸🇴 Somalia' : country}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breadcrumb Info Bar */}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    Suuradda la doortay: {surahMeta.number}. {surahMeta.englishName} ({surahMeta.name}) — {surahMeta.numberOfAyahs} Aayadood
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep('surah')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Beddel Suuradda
                </button>
              </div>

              {/* Instant Qari Avatar Badges Row - Smooth horizontal scrolling without clipping */}
              <div className="flex overflow-x-auto no-scrollbar gap-2 px-1 py-1 w-full max-w-full touch-pan-x whitespace-nowrap">
                {verseReciters.slice(0, 8).map((q) => {
                  const isSelected = activeQari.id === q.id;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        onChangeQari(q);
                        setWizardStep('start');
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[76px] ${
                        isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                          : 'bg-muted/30 border-border/70 hover:bg-muted/60 text-muted-foreground'
                      }`}
                      title={q.name}
                    >
                      <div className="relative">
                        <ReciterAvatar reciter={q} isSelected={isSelected} size="sm" showSomaliFlag />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] border-2 border-background font-bold z-10">
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold truncate max-w-[72px] text-center ${
                          isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-foreground'
                        }`}
                      >
                        {q.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Reciter Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Raadi magaca qariga ama dalka (tusaale: Cabdirashiid Suufi, Al-Husary, Alafasy)..."
                  value={reciterSearchQuery}
                  onChange={(e) => setReciterSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Reciters List with Authentic Portraits & Origin Badges */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto chat-scrollbar pr-1 pb-4">
                {filteredReciters.map((q) => {
                  const isSelected = activeQari.id === q.id;
                  const isSufi = q.id === 'abdulrasheed-sufi';
                  const isSomali = q.country.toLowerCase().includes('somalia');

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        onChangeQari(q);
                        setWizardStep('start');
                      }}
                      className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                          : isSufi
                          ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-400/50 hover:border-blue-500'
                          : 'bg-muted/20 border-border/70 hover:bg-muted/50 hover:border-blue-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                        {/* Authentic Avatar Badge */}
                        <ReciterAvatar reciter={q} isSelected={isSelected} size="md" showSomaliFlag />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {q.name}
                            </h3>
                            <span className="text-xs font-arabic text-blue-700 dark:text-blue-400 font-bold" dir="rtl">
                              {q.arabicName}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {/* Origin Badge */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border/60">
                              <Globe className="w-2.5 h-2.5 text-blue-600" />
                              <span>{q.country}</span>
                            </span>

                            {isSomali && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                🇸🇴 Somali Heritage
                              </span>
                            )}

                            {isSufi && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                ★ Tobanka Qiraa'o
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground border border-border/40">
                              {q.style}
                            </span>

                            {q.hasVerseAudio && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                Verse-by-Verse
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Doortay</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900 border border-blue-200/80 dark:border-blue-900/60 text-xs font-bold transition-colors">
                            Dooro
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav Row for Step 2 */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setWizardStep('surah')}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Dib u noqo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardStep('start')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Xiga: Bilow Subciska</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STEP 3: START SUBCIS CANVAS (BILOW SUBCISKA)                         */}
          {/* ------------------------------------------------------------------- */}
          {wizardStep === 'start' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Tallaabada 3 — Diyaar ma tahay? Bilow Subciska
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hubi doorashadaada, xulo aayadaha aad rabto, kadibna bilow wareegga wada-akhriska.
                </p>
              </div>

              {/* Overview Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Surah Summary */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {surahMeta.number}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Suuradda
                      </span>
                      <h4 className="text-sm font-bold text-foreground">
                        {surahMeta.englishName} ({surahMeta.name})
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {surahMeta.numberOfAyahs} Aayadood • {surahMeta.revelationType === 'Meccan' ? 'Makki' : 'Madani'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWizardStep('surah')}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Beddel
                  </button>
                </div>

                {/* Reciter Summary */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ReciterAvatar reciter={activeQari} size="md" showSomaliFlag />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Qaariga kula subcinaya
                      </span>
                      <h4 className="text-sm font-bold text-foreground">
                        {activeQari.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {activeQari.country} • {activeQari.style}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWizardStep('reciter')}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Beddel
                  </button>
                </div>
              </div>

              {/* Turn Rules Explanation Card */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="text-xs leading-relaxed text-blue-950 dark:text-blue-100">
                  <p className="font-bold text-sm mb-1">
                    Sidee buu Subcis-ku u shaqaynayaa?
                  </p>
                  <p>
                    Qaarigu wuxuu bilaabayaa <strong>Aayadda {effectiveStartAyah}-aad</strong>. Marka uu dhammeeyo, codkiisu si toos ah buu u joogsanayaa adigaana akhrinaya <strong>Aayadda {Math.min(effectiveEndAyah, effectiveStartAyah + 1)}-aad</strong> adoo haysta 20 ilbiriqsi. Sidaas ayaad u kala qaadanaysaan ilaa dhammaadka!
                  </p>
                </div>
              </div>

              {/* Range Mode Switcher Tabs */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-foreground">
                  Xulo Qaybta aad baranayso (Practice Range Selection):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetAyahs(null);
                      setRangeMode('entire_surah');
                    }}
                    className={`p-3 min-h-[44px] rounded-xl text-left border transition-all cursor-pointer ${
                      rangeMode === 'entire_surah' && !customTargetAyahs
                        ? 'bg-blue-50 border-blue-500 text-blue-800 dark:text-blue-300 font-bold shadow-xs'
                        : 'bg-muted/30 border-border/70 text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Suuradda Oo Dhan</span>
                      {rangeMode === 'entire_surah' && !customTargetAyahs && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      1 ilaa {totalAyahsInSurah} ({totalAyahsInSurah} Aayadood)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetAyahs(null);
                      setRangeMode('ayah_range');
                    }}
                    className={`p-3 min-h-[44px] rounded-xl text-left border transition-all cursor-pointer ${
                      rangeMode === 'ayah_range' && !customTargetAyahs
                        ? 'bg-blue-50 border-blue-500 text-blue-800 dark:text-blue-300 font-bold shadow-xs'
                        : 'bg-muted/30 border-border/70 text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Xulo Aayadaha (Range)</span>
                      {rangeMode === 'ayah_range' && !customTargetAyahs && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Dooro bilow iyo dhammaad (e.g. 1-10)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomTargetAyahs(null);
                      setRangeMode('quantity');
                    }}
                    className={`p-3 min-h-[44px] rounded-xl text-left border transition-all cursor-pointer ${
                      rangeMode === 'quantity' && !customTargetAyahs
                        ? 'bg-blue-50 border-blue-500 text-blue-800 dark:text-blue-300 font-bold shadow-xs'
                        : 'bg-muted/30 border-border/70 text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Tiro Aayado ah (Quantity)</span>
                      {rangeMode === 'quantity' && !customTargetAyahs && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Dooro inta aayadood ee aad rabto
                    </p>
                  </button>
                </div>

                {/* Range Controls Inputs */}
                {rangeMode === 'ayah_range' && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Ka bilow Aayadda:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalAyahsInSurah}
                        value={rangeStartAyah}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 1;
                          setRangeStartAyah(Math.max(1, Math.min(totalAyahsInSurah, val)));
                        }}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Ku dhammee Aayadda:
                      </label>
                      <input
                        type="number"
                        min={rangeStartAyah}
                        max={totalAyahsInSurah}
                        value={rangeEndAyah}
                        onChange={(e) => {
                          const val = Number(e.target.value) || rangeStartAyah;
                          setRangeEndAyah(Math.max(rangeStartAyah, Math.min(totalAyahsInSurah, val)));
                        }}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground font-semibold"
                      />
                    </div>
                  </div>
                )}

                {rangeMode === 'quantity' && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Ka bilow Aayadda:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalAyahsInSurah}
                        value={rangeStartAyah}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 1;
                          setRangeStartAyah(Math.max(1, Math.min(totalAyahsInSurah, val)));
                        }}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Tirada Aayadaha aad baranayso (Quantity):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalAyahsInSurah - effectiveStartAyah + 1}
                        value={rangeQuantity}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 1;
                          setRangeQuantity(
                            Math.max(1, Math.min(totalAyahsInSurah - effectiveStartAyah + 1, val))
                          );
                        }}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Big Action Button to Start Subcis */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleStartActiveSession}
                  disabled={isLoadingAyahs || activeAyahs.length === 0}
                  className="w-full py-4 px-8 min-h-[52px] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl ring-2 ring-blue-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingAyahs ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Loading Verses...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Bilow Subciska (Start Subcis)</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Nav Row for Step 3 */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setWizardStep('reciter')}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Beddel Qaariga</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardStep('surah')}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Beddel Suuradda</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* 9. VIEW 3: Active Alternating Recitation (Automatic 20-Second Engine)   */}
      {/* ----------------------------------------------------------------------- */}
      {workflowPhase === 'active_session' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Top Progress Bar & Exit Button */}
          <div className="bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="font-bold text-xs sm:text-sm text-foreground">
                  {surahMeta?.number}. {surahMeta?.englishName} ({surahMeta?.name})
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  Aayadda {currentAyah ? currentAyah.numberInSurah : 1} ee {totalAyahsCount}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold ml-2">
                  • Qaariga: {activeQari.name}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetToSetup}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Jooji / Beddel Suuradda & Qaariga</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted/60 rounded-full h-1.5 sm:h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round(((currentAyahIndex + 1) / totalAyahsCount) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Main Active Recitation Card: Clean Circular Container Design */}
          {currentAyah ? (
            <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-sm text-center relative overflow-hidden flex flex-col items-center justify-center">
              {/* Surah & Ayah Numbering at the Top (e.g., Al-Fatihah - 2/7) */}
              <div className="mb-4 sm:mb-6 text-center space-y-1.5 w-full">
                <div className="inline-flex items-center justify-center gap-2">
                  <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">
                    {surahMeta?.englishName || 'Surah'}
                  </h2>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold text-base sm:text-xl">-</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold">
                    {currentAyah.numberInSurah}/{totalAyahsCount}
                  </span>
                </div>

                {/* Status Badges: "Sheikh ayaa akhrinaya" vs "Adiga ayaa akhrinaya" */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {activeRole === 'qari' ? (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/25 text-xs sm:text-sm font-black transition-all">
                      <Volume2 className="w-4 h-4 animate-pulse shrink-0" />
                      <span>Sheikh ayaa akhrinaya</span>
                      <span className="sr-only">
                        Qaarigu wuxuu akhrinayaa aayadda… • {activeQari.name}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/25 text-xs sm:text-sm font-black animate-pulse transition-all">
                      <Mic className="w-4 h-4 animate-bounce shrink-0" />
                      <span>Adiga ayaa akhrinaya</span>
                      <span className="sr-only">Hadda adiga akhri aayadda xigta.</span>
                      <span className="sr-only">Codkaaga waa la duubayaa…</span>
                      <span className="sr-only">Akhri waqtiga haray: {userCountdown}s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real Audio Error Notice with Retry Button */}
              {qariAudioError && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-2.5 text-center max-w-md mx-auto my-3">
                  <div className="flex items-center justify-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Khalad ku yimid codka Qariga</span>
                  </div>
                  <p className="leading-relaxed">{qariAudioError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQariAudioPlaybackFailed(false);
                      playQariAyah(currentAyahIndexRef.current, true);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-sm transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Isku day mar kale</span>
                  </button>
                </div>
              )}

              {/* Clean Circular Recitation Container Centered on Screen */}
              <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[460px] md:h-[460px] rounded-full mx-auto flex flex-col items-center justify-between p-6 sm:p-9 shadow-2xl transition-all duration-500 bg-gradient-to-b from-blue-50/70 via-background to-blue-50/30 dark:from-blue-950/30 dark:via-background dark:to-blue-950/20 border-4 border-blue-500/20 dark:border-blue-500/30 overflow-hidden">
                {/* Smooth Circular SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="47"
                    className="stroke-muted/30 dark:stroke-muted/20"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="47"
                    className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-500"
                    strokeWidth="3"
                    strokeDasharray={295.3}
                    strokeDashoffset={295.3 - (295.3 * Math.min(100, Math.round(((currentAyahIndex + 1) / totalAyahsCount) * 100))) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Top of Circle: Ayah Number Label */}
                <div className="pt-2 z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-[11px] sm:text-xs font-bold text-blue-600 dark:text-blue-400">
                    Aayadda {currentAyah.numberInSurah}
                  </span>
                </div>

                {/* Middle of Circle: Connected Arabic Verse Text with Progressive Reveal */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4 max-w-[270px] sm:max-w-[350px] md:max-w-[390px] overflow-y-auto no-scrollbar py-2 z-10">
                  {activeRole === 'user' && !isVerseCompleted ? (
                    <div
                      dir="rtl"
                      onClick={() => triggerVerseCompletionRef.current?.()}
                      className="font-arabic text-xl sm:text-2xl md:text-3xl text-foreground font-normal leading-[2.4] sm:leading-[2.6] select-text break-normal cursor-pointer"
                      style={{ wordBreak: 'normal', overflowWrap: 'normal', letterSpacing: 'normal' }}
                      title="Riix ama ku akhri codkaaga si aayaddu u dhamaystiranto"
                    >
                      <span className="sr-only">{currentAyah.text}</span>
                      {currentAyah.text
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((word, wIdx) => {
                          const isRevealed = wIdx < revealedWordCount;
                          if (isRevealed) {
                            return (
                              <span
                                key={wIdx}
                                className="inline-block mx-1 text-blue-600 dark:text-blue-400 font-bold transition-all duration-300 animate-in fade-in zoom-in-95"
                              >
                                {word}
                              </span>
                            );
                          }
                          return (
                            <span
                              key={wIdx}
                              className="inline-flex items-center justify-center h-6 sm:h-8 px-2 sm:px-3.5 my-0.5 mx-1 rounded-full bg-slate-200/90 dark:bg-slate-800/90 border border-slate-300/60 dark:border-slate-700/60 animate-pulse align-middle shadow-2xs select-none transition-all duration-300 hover:border-blue-400"
                              title="Ku akhri codkaaga si uu u furmo"
                            >
                              <span className="w-3.5 sm:w-5 h-1.5 bg-slate-400/50 dark:bg-slate-600/50 rounded-full" />
                            </span>
                          );
                        })}
                      <span className="font-arabic text-blue-600 dark:text-blue-400 font-bold inline-block mx-1 text-lg sm:text-2xl align-middle">
                        ۝{currentAyah.numberInSurah}
                      </span>
                    </div>
                  ) : (
                    <p
                      dir="rtl"
                      className={`font-arabic text-xl sm:text-2xl md:text-3xl font-normal leading-[2.4] sm:leading-[2.6] select-text break-normal transition-all duration-300 ${
                        isVerseCompleted ? 'text-blue-600 dark:text-blue-400 font-bold animate-in zoom-in-95' : 'text-foreground'
                      }`}
                      style={{ wordBreak: 'normal', overflowWrap: 'normal', letterSpacing: 'normal' }}
                    >
                      {currentAyah.text}
                      <span className="font-arabic text-blue-600 dark:text-blue-400 font-bold inline-block mx-1 text-lg sm:text-2xl align-middle">
                        ۝{currentAyah.numberInSurah}
                      </span>
                    </p>
                  )}

                  {/* Somali translation */}
                  {currentAyah.translationSo && (
                    <p className="mt-2 text-[11px] sm:text-xs text-blue-900/80 dark:text-blue-200/80 font-medium leading-relaxed max-w-[240px] sm:max-w-[320px] line-clamp-2">
                      {currentAyah.translationSo}
                    </p>
                  )}
                </div>

                {/* Bottom of Circle: Prominent Circular Microphone / Audio Button */}
                <div className="pb-2 z-10 flex flex-col items-center">
                  {activeRole === 'user' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isVerseCompleted) {
                          setRevealedWordCount(999);
                          setIsVerseCompleted(true);
                        }
                        handleFinishUserTurnAutomatically();
                      }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 animate-pulse"
                      title="Riix si aad u gudbiso ama u dhammaystirto aayadda"
                    >
                      <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => playQariAyah(currentAyahIndexRef.current, true)}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      title="Dhageyso mar kale"
                    >
                      <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground mt-1">
                    {activeRole === 'user'
                      ? isVerseCompleted
                        ? 'Dhammaystiran ✓'
                        : 'Duubaya…'
                      : activeQari.name.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Error notice if mic blocked */}
              {micPermissionError && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs max-w-md mx-auto text-center">
                  {micPermissionError}
                </div>
              )}

              {/* Desktop & Tablet Bottom Controls */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/60 hidden md:flex items-center justify-center gap-3">
                {activeRole === 'qari' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => playQariAyah(currentAyahIndexRef.current, true)}
                      className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Dhageyso Mar Kale</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeRoleRef.current !== 'qari') return;
                        if (qariAudioRef.current) qariAudioRef.current.pause();
                        handleQariAudioFinished();
                      }}
                      className="min-h-[48px] px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>U gudub adiga (Skip)</span>
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeRoleRef.current !== 'user') return;
                      if (!isVerseCompleted) {
                        setRevealedWordCount(999);
                        setIsVerseCompleted(true);
                      }
                      handleFinishUserTurnAutomatically();
                    }}
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gudbi Akhriska (Dhammee)</span>
                  </button>
                )}
              </div>

              {/* Mobile Frosted-Glass Bottom Action Bar */}
              <div className="fixed bottom-16 inset-x-0 z-40 backdrop-blur-xl bg-slate-900/80 border-t border-slate-800 p-4 flex md:hidden items-center justify-between gap-3 shadow-2xl">
                <button
                  type="button"
                  onClick={handleResetToSetup}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Jooji / Beddel"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden xs:inline">Beddel</span>
                </button>

                {activeRole === 'qari' ? (
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <button
                      type="button"
                      onClick={() => playQariAyah(currentAyahIndexRef.current, true)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Volume2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">Dhageyso Mar Kale</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeRoleRef.current !== 'qari') return;
                        if (qariAudioRef.current) qariAudioRef.current.pause();
                        handleQariAudioFinished();
                      }}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      title="U gudub adiga"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeRoleRef.current !== 'user') return;
                      if (!isVerseCompleted) {
                        setRevealedWordCount(999);
                        setIsVerseCompleted(true);
                      }
                      handleFinishUserTurnAutomatically();
                    }}
                    className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="truncate">Gudbi Akhriska</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Soo diyaarinaya aayadda…</p>
            </div>
          )}

          {/* Alternating Verse Cards: Recitation History Thread */}
          {userAttemptRecords.length > 0 && (
            <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <ListFilter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-foreground">
                      Taariikhda Subcis-ka (Recitation History)
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Wareegyada la kala qaatay ee adiga iyo qariga
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {userAttemptRecords.length} wareeg oo la duubay
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto chat-scrollbar pr-1">
                {userAttemptRecords.map((attempt, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* Sheikh Turn Card */}
                    <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ReciterAvatar reciter={activeQari} size="xs" />
                        <div className="truncate">
                          <span className="font-bold text-blue-900 dark:text-blue-200 block truncate">
                            Sheekha ({activeQari.name.split(' ')[0]}) • Aayadda {attempt.ayahNumber - 1 > 0 ? attempt.ayahNumber - 1 : 1}
                          </span>
                          <span className="text-[10px] text-blue-700/70 dark:text-blue-300/70">
                            Si guul leh ayaa loo dhageystay
                          </span>
                        </div>
                      </div>
                      {attempt.qariAudioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            if (qariAudioRef.current) {
                              qariAudioRef.current.src = attempt.qariAudioUrl;
                              qariAudioRef.current.play().catch(() => {});
                            }
                          }}
                          className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Dhageyso Qariga</span>
                        </button>
                      )}
                    </div>

                    {/* Student Turn Card */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between gap-3 text-xs ml-3 sm:ml-5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">
                              Adiga • Aayadda {attempt.ayahNumber}
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </div>
                          <span className="text-[10px] text-emerald-700/70 dark:text-emerald-300/70 truncate block" dir="rtl">
                            {attempt.expectedText}
                          </span>
                        </div>
                      </div>
                      {attempt.userAudioBlobUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            if (userAudioPlayerRef.current) {
                              userAudioPlayerRef.current.src = attempt.userAudioBlobUrl!;
                              userAudioPlayerRef.current.play().catch(() => {});
                            }
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                        >
                          <Play className="w-3 h-3" />
                          <span>Dhageyso Codkaaga</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* 10. VIEW 4: Final Comprehensive Error Report ("Natiijada Subcis-kaaga")    */}
      {/* ------------------------------------------------------------------------- */}
      {workflowPhase === 'completed' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>

              <p className="text-base sm:text-lg font-bold text-foreground">
                Waxaad dhamaysay Subcis-ka suuradda {surahMeta?.name} ({surahMeta?.englishName}). Hoos ka eeg khaladaadka lagaa helay iyo sida loo saxo.
              </p>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {isOddAyahCount
                  ? `Suuraddu waxay ka koobnayd ${totalAyahsCount} aayadood (tiro kinsi ah). Qariga (${activeQari.name}) ayaa soo gebagebeeyey aayadda ugu dambaysa.`
                  : `Suuraddu waxay ka koobnayd ${totalAyahsCount} aayadood (tiro dhaban ah). Adiga ayaa si guul leh ugu soo gabagabeeyey aayadda ugu dambaysa.`}
              </p>

              <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <span>
                  Suuradda: <strong className="text-foreground">{surahMeta?.number}. {surahMeta?.englishName}</strong>
                </span>
                <span>
                  Aayadaha: <strong className="text-foreground">{effectiveStartAyah} – {effectiveEndAyah}</strong> ({userRecitedAyahsCount} aad duubtay / {totalAyahsCount} wadarta)
                </span>
                <span>
                  Waqtiga Tababarka: <strong className="text-foreground">{sessionDurationSeconds > 0 ? `${Math.floor(sessionDurationSeconds / 60)}d ${sessionDurationSeconds % 60}i` : 'Dhameystiran'}</strong>
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Local Recording Only (Zero Server Upload)</span>
                </span>
              </div>

              {/* 4-Stat Accuracy Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                    Aayadaha La Baaray
                  </span>
                  <span className="text-lg font-black text-blue-950 dark:text-blue-100">
                    {assessedAyahsCount} / {userRecitedAyahsCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                    Aayadaha Saxda Ah
                  </span>
                  <span className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                    {cleanPassCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-red-700 dark:text-red-300 block">
                    Khaladaadka La Helay
                  </span>
                  <span className="text-lg font-black text-red-950 dark:text-red-100">
                    {totalMistakesCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">
                    Lama Xaqiijin
                  </span>
                  <span className="text-lg font-black text-amber-950 dark:text-amber-100">
                    {unverifiedAyahsCount}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                {!isReviewRequested ? (
                  <button
                    type="button"
                    onClick={handleRunRecitationReview}
                    disabled={isAssessing}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAssessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>AI ayaa baaraya...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Review My Recitation (Dib u eeg Akhriskayga)</span>
                      </>
                    )}
                  </button>
                ) : totalMistakesCount > 0 ? (
                  <button
                    type="button"
                    onClick={handlePracticeMistakesAgain}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ku celi Khaladaadka (Practice Mistakes Again)</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    mistakesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                    if (!isReviewRequested) {
                      handleRunRecitationReview();
                    }
                  }}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Dib u eeg khaladaadka</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartActiveSession}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ku celi Subcis-ka</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToSetup}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Dooro Suurad Kale</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Mistakes breakdown */}
          {isReviewRequested && !isAssessing && (
            <div ref={mistakesSectionRef} className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    Natiijada Subcis-kaaga
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Suuradda: <strong>{surahMeta?.number}. {surahMeta?.englishName} ({surahMeta?.name})</strong> • Qaariga: <strong>{activeQari.name}</strong> • Aayadaha: <strong>{effectiveStartAyah} – {effectiveEndAyah}</strong>
                  </p>
                </div>

                {totalMistakesCount > 0 && (
                  <button
                    type="button"
                    onClick={handlePracticeMistakesAgain}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ku celi khaladaadka ({totalMistakesCount})</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {userAttemptRecords.map((record) => {
                  const ev = record.evaluation;
                  const isUnverified = !ev || ev.status === 'unverified';
                  const isPassed = ev?.status === 'passed';
                  const mistakes = ev?.mistakes || [];

                  return (
                    <div
                      key={record.ayahNumber}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPassed
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                          : isUnverified
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-500/30'
                          : 'bg-red-50/40 dark:bg-red-950/20 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-foreground">
                          Aayadda {record.ayahNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPassed
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : isUnverified
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {isPassed ? 'Waa saxantahay' : isUnverified ? 'Lama xaqiijin' : `${mistakes.length} Khalad`}
                        </span>
                      </div>

                      <p dir="rtl" className="font-arabic text-lg sm:text-xl text-foreground font-normal mb-3" style={{ wordBreak: 'normal', overflowWrap: 'normal', letterSpacing: 'normal' }}>
                        {record.expectedText}
                      </p>

                      {record.userTranscript && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Waxa lagaa maqlay: <span className="font-arabic font-semibold text-foreground">{record.userTranscript}</span>
                        </p>
                      )}

                      {mistakes.length > 0 && (
                        <div className="space-y-1.5 mt-2 pt-2 border-t border-border/50">
                          {mistakes.map((m, mIdx) => (
                            <div key={mIdx} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">{m.categoryLabelSo || m.category}:</span> {m.correctionNoteSo}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Retry Single Ayah Button */}
                      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handlePracticeSingleAyah(record.ayahNumber)}
                          className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Ku celi aayaddan</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubcisPractice;
