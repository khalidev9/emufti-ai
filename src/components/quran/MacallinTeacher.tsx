import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GraduationCap,
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  ChevronDown,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  HelpCircle,
  Award,
  Layers,
  History,
  Lock,
  ChevronRight,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  Flame,
  Target,
} from 'lucide-react';
import {
  Surah,
  Ayah,
  QariReciter,
  MacallinLesson,
  MacallinAttempt,
  MacallinMistake,
  MacallinProgressSummary,
  MacallinWordVerification,
  MacallinErrorCategory,
  MacallinLetterSegment,
} from '../../types/database';
import { quranService } from '../../lib/quranService';
import {
  macallinService,
  EvaluationResult,
  getLocalDateString,
} from '../../lib/macallinService';
import {
  tokenizeAyahWithTajweed,
  tajweedAssessmentEngine,
  AyahWordToken,
  type StrictPassageEvaluationResult,
} from '../../lib/tajweedAssessmentEngine';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { ALL_50_QARIS } from '../../data/qarisData';
import { LiveAudioVisualizer } from './LiveAudioVisualizer';

export type MacallinFlowState =
  | 'ready'
  | 'recitingAyah'
  | 'advancingAyah'
  | 'passageCompleted'
  | 'assessingPassage'
  | 'showingFinalResult';

export interface AyahRecitationAttempt {
  ayahIndex: number;
  ayahNumber: number;
  text: string;
  transcript: string;
  audioBlob: Blob | null;
}

interface MacallinTeacherProps {
  userId?: string;
  uiLanguage?: 'en' | 'so' | 'ar';
  selectedQari?: QariReciter;
  onChangeQari?: (qari: QariReciter) => void;
  onNavigateToSurah?: (surahNumber: number) => void;
  surahs?: Surah[];
  currentSurahNumber?: number;
  onChangeSurah?: (surahNumber: number) => void;
  ayahs?: Ayah[];
}

type MacallinSubTab = 'practice' | 'tomorrow' | 'history';

// Browser Web Speech Recognition interface declaration
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

export const MacallinTeacher: React.FC<MacallinTeacherProps> = ({
  userId = 'guest_user',
  uiLanguage = 'so',
  selectedQari = ALL_50_QARIS[0],
  onChangeQari = () => {},
  onNavigateToSurah,
  surahs = ALL_114_SURAHS,
  currentSurahNumber = 1,
  onChangeSurah,
  ayahs = [],
}) => {
  // Navigation within Macallin
  const [subTab, setSubTab] = useState<MacallinSubTab>('practice');

  // Lessons and Scheduling State
  const [activeLesson, setActiveLesson] = useState<MacallinLesson | null>(null);
  const [tomorrowLesson, setTomorrowLesson] = useState<MacallinLesson | null>(null);
  const [isPendingPrevious, setIsPendingPrevious] = useState<boolean>(false);
  const [lessonHistory, setLessonHistory] = useState<MacallinLesson[]>([]);
  const [progressSummary, setProgressSummary] = useState<MacallinProgressSummary | null>(null);
  const [isLoadingLessons, setIsLoadingLessons] = useState<boolean>(true);

  // Practice Passage Configuration
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [passageStartAyah, setPassageStartAyah] = useState<number>(1);
  const [passageEndAyah, setPassageEndAyah] = useState<number>(5);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState<boolean>(false);
  const [surahSearch, setSurahSearch] = useState<string>('');

  // Option 1 (Full Surah) vs Option 2 (Custom Ayah Range) and Passage States
  const [passageSelectionMode, setPassageSelectionMode] = useState<'full_surah' | 'ayah_range'>('ayah_range');
  const [passageDisplayView, setPassageDisplayView] = useState<'passage' | 'verse_by_verse'>('passage');
  const [rangeValidationError, setRangeValidationError] = useState<string | null>(null);
  const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false);
  const [consolidatedPassageResult, setConsolidatedPassageResult] = useState<StrictPassageEvaluationResult | null>(null);

  // Verses & Arabic Text
  const [verses, setVerses] = useState<Ayah[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);
  const [versesError, setVersesError] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState<boolean>(true);

  // Audio Playback & Dedicated User Recording State
  const [userRecordingBlob, setUserRecordingBlob] = useState<Blob | null>(null);
  const latestRecordedBlobRef = useRef<Blob | null>(null);
  const qariReferenceAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  // Aliases for backward compatibility with existing tests and internal handlers
  const qariAudioRef = qariReferenceAudioRef;
  const userAudioRef = userAudioPlayerRef;
  const [isPlayingQari, setIsPlayingQari] = useState<boolean>(false);
  const [isPlayingUser, setIsPlayingUser] = useState<boolean>(false);
  const [userAudioBlobUrl, setUserAudioBlobUrl] = useState<string | null>(null);

  // Recording & Speech Recognition State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  // 30-Second Final Review State
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewCountdown, setReviewCountdown] = useState<number>(30);
  const [reviewStep, setReviewStep] = useState<number>(1);
  const [pendingEvaluationResult, setPendingEvaluationResult] = useState<EvaluationResult | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Evaluation & Results State
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [selectedWordMistake, setSelectedWordMistake] = useState<MacallinMistake | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [completedLessonInfo, setCompletedLessonInfo] = useState<{
    completedLesson: MacallinLesson;
    tomorrowLesson: MacallinLesson;
  } | null>(null);

  // Dual-Mode Recitation System: 'hifd' (Ayah text hidden until verified recitation) vs 'review' (Ayah text visible for reading and revision)
  const [recitationMode, setRecitationMode] = useState<'hifd' | 'review'>('hifd');
  const isMemorizationMode = recitationMode === 'hifd';
  const setIsMemorizationMode = (val: boolean | ((prev: boolean) => boolean)) => {
    setRecitationMode((prev) => {
      const currentVal = prev === 'hifd';
      const nextVal = typeof val === 'function' ? val(currentVal) : val;
      return nextVal ? 'hifd' : 'review';
    });
  };

  // State to track whether current Ayah in Hifd Mode has been verified and revealed for review
  const [isAyahRevealedForReview, setIsAyahRevealedForReview] = useState<boolean>(false);

  // Hidden-Ayah Memorization Mode State
  const [memorizationSessionActive, setMemorizationSessionActive] = useState<boolean>(false);
  const [memorizationState, setMemorizationState] = useState<
    'idle' | 'recording' | 'reviewing' | 'mistake_review' | 'ayah_passed' | 'paused' | 'all_completed'
  >('idle');
  const [completedAyahIndices, setCompletedAyahIndices] = useState<number[]>([]);
  const [revealedCorrectionForCurrentAyah, setRevealedCorrectionForCurrentAyah] = useState<boolean>(false);
  const [sessionMistakes, setSessionMistakes] = useState<MacallinMistake[]>([]);

  // Full-Passage Sequential Progression & Hidden Next Ayah State
  const [passageFlowState, setPassageFlowState] = useState<MacallinFlowState>('ready');
  const collectedAyahAttemptsRef = useRef<AyahRecitationAttempt[]>([]);
  const [collectedAyahAttempts, setCollectedAyahAttempts] = useState<AyahRecitationAttempt[]>([]);
  const isAdvancingRef = useRef<boolean>(false);
  const isAssessingRef = useRef<boolean>(false);

  // Internal references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const reviewTimerRef = useRef<any>(null);
  const assessmentTimeoutRef = useRef<any>(null);
  const assessmentAbortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const verseCardRef = useRef<HTMLDivElement>(null);

  // Reciters with verified audio (including Somali master Sheikh Abdul Rashid Ali Sufi)
  const verseReciters = ALL_50_QARIS.filter((q) => q.hasVerseAudio || q.id === 'abdulrasheed-sufi');
  const activeQari = (selectedQari.hasVerseAudio || selectedQari.id === 'abdulrasheed-sufi') ? selectedQari : (verseReciters[0] || selectedQari);

  const selectedSurah = ALL_114_SURAHS.find((s) => s.number === selectedSurahNumber) || ALL_114_SURAHS[0];

  // Sliced passage verses for current practice range (derived safely before any hook/callback)
  const passageVerses = useMemo(() => {
    return (verses || []).filter(
      (v) => v.numberInSurah >= passageStartAyah && v.numberInSurah <= passageEndAyah
    );
  }, [verses, passageStartAyah, passageEndAyah]);

  const currentAyah = passageVerses[currentAyahIndex] || passageVerses[0] || null;

  // Tokenize current ayah with full Tajweed & makharij metadata
  const currentAyahTokens: AyahWordToken[] = useMemo(() => {
    return currentAyah ? tokenizeAyahWithTajweed(currentAyah.text) : [];
  }, [currentAyah]);

  // Live letter-level & word-level recitation tracking as the user recites into microphone
  const liveRecitationEvaluation = useMemo(() => {
    if (!isRecording || !speechTranscript || speechTranscript.trim().length < 2 || !currentAyah) {
      return null;
    }
    return tajweedAssessmentEngine.evaluateAyahStrict(
      currentAyah.numberInSurah,
      currentAyah.text,
      speechTranscript,
      selectedSurahNumber
    );
  }, [isRecording, speechTranscript, currentAyah, selectedSurahNumber]);

  // Initialize today's lesson, tomorrow's lesson and history
  useEffect(() => {
    loadLessonsAndSchedule();
  }, [userId]);

  const loadLessonsAndSchedule = async () => {
    setIsLoadingLessons(true);
    try {
      const { lesson, isPendingPrevious: pending } = await macallinService.getOrScheduleTodayLesson(userId, 1);
      setActiveLesson(lesson);
      setIsPendingPrevious(pending);

      setSelectedSurahNumber(lesson.surah_number);
      setPassageStartAyah(lesson.start_ayah);
      setPassageEndAyah(lesson.end_ayah);

      const tomorrow = await macallinService.getTomorrowLesson(userId);
      setTomorrowLesson(tomorrow);

      const all = await macallinService.getAllLessons(userId);
      setLessonHistory(all);

      const summary = await macallinService.getProgressSummary(userId);
      setProgressSummary(summary);
    } catch (e) {
      console.error('[MacallinTeacher] Failed to load lessons:', e);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Fetch verified verses whenever selectedSurahNumber changes
  useEffect(() => {
    loadSurahVerses(selectedSurahNumber);
  }, [selectedSurahNumber]);

  const loadSurahVerses = async (surahNum: number) => {
    setIsLoadingVerses(true);
    setVersesError(null);
    try {
      const fetched = await quranService.fetchSurahVerses(surahNum);
      setVerses(fetched);
      setCurrentAyahIndex(0);
    } catch (err: any) {
      setVersesError(err?.message || 'Failed to load Quran verses. Please check your connection.');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  // Synchronize 30-second review finish and transition to results screen
  useEffect(() => {
    if (isReviewing && reviewCountdown <= 0) {
      if (pendingEvaluationResult) {
        setIsReviewing(false);
        setEvaluationResult(pendingEvaluationResult);
        setIsEvaluating(false);
        setPassageFlowState('showingFinalResult');
        isAssessingRef.current = false;

        if (pendingEvaluationResult.status === 'passed') {
          const _totalVerses = passageVerses.length;
          if (isMemorizationMode) {
            setMemorizationState('all_completed');
            setCompletedAyahIndices(passageVerses.map((_, idx) => idx));
          }

          // Mark lesson as passed if recitation was completed WITHOUT confirmed errors!
          if (activeLesson) {
            macallinService
              .markLessonCompletedAndScheduleTomorrow(activeLesson, 0, {
                mode: passageSelectionMode === 'full_surah' ? 'entire_surah' : 'ayah_range',
                ayahCount: passageVerses.length,
                accuracy: consolidatedPassageResult?.overallAccuracy || 100,
              })
              .then((res) => {
                setCompletedLessonInfo(res);
                setTomorrowLesson(res.tomorrowLesson);
                setShowSuccessModal(true);
              })
              .catch((e) => {
                console.error('[Macallin] Failed to complete lesson:', e);
              });
          }
        } else if (pendingEvaluationResult.status === 'errors_detected') {
          if (isMemorizationMode) {
            setMemorizationState('mistake_review');
            setRevealedCorrectionForCurrentAyah(false);
            setSessionMistakes(pendingEvaluationResult.mistakes);
          }
        } else {
          if (isMemorizationMode) {
            setMemorizationState('paused');
          }
        }
      } else if (reviewError) {
        setIsReviewing(false);
        setIsEvaluating(false);
        isAssessingRef.current = false;
        setPassageFlowState('ready');
      }
    }
  }, [
    isReviewing,
    reviewCountdown,
    pendingEvaluationResult,
    reviewError,
    currentAyahIndex,
    isMemorizationMode,
    passageVerses,
    activeLesson,
  ]);

  // Revoke audio blob URL when a new one is created
  useEffect(() => {
    return () => {
      if (userAudioBlobUrl) {
        URL.revokeObjectURL(userAudioBlobUrl);
      }
    };
  }, [userAudioBlobUrl]);

  // Clean up timers, abort controller, and speech recognition on component unmount ONLY
  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current);
      clearInterval(reviewTimerRef.current);
      if (assessmentTimeoutRef.current) {
        clearTimeout(assessmentTimeoutRef.current);
      }
      if (assessmentAbortControllerRef.current) {
        assessmentAbortControllerRef.current.abort();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Audio Playback Controls
  // ---------------------------------------------------------------------------
  const handlePlayQariAudio = () => {
    if (!currentAyah) return;
    if (isPlayingQari && qariReferenceAudioRef.current) {
      qariReferenceAudioRef.current.pause();
      setIsPlayingQari(false);
      return;
    }

    // CRITICAL: Stop microphone recording immediately before starting Qari reference playback.
    // Never allow the microphone to record the Qari's audio output through speakers
    // and treat it as the user's recitation.
    if (isRecording || (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording')) {
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);
      setIsTranscribing(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn('[Macallin] Stopping recorder before Qari playback:', e);
        }
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Stop user audio playback if active
    if (userAudioPlayerRef.current && isPlayingUser) {
      userAudioPlayerRef.current.pause();
      setIsPlayingUser(false);
    }

    // Note: userRecordingBlob and userAudioBlobUrl are PRESERVED!
    // The user can listen to the Qari and then compare with their own recording.
    const audioUrl = quranService.getVerseAudioUrl(activeQari, selectedSurahNumber, currentAyah.numberInSurah);
    if (qariReferenceAudioRef.current) {
      qariReferenceAudioRef.current.src = audioUrl;
      qariReferenceAudioRef.current
        .play()
        .then(() => setIsPlayingQari(true))
        .catch((err) => {
          console.warn('[Macallin] Qari audio playback error:', err);
          setIsPlayingQari(false);
        });
    }
  };

  const handlePlayUserAudio = () => {
    if (!userAudioBlobUrl || !userAudioPlayerRef.current) return;
    if (isPlayingUser) {
      userAudioPlayerRef.current.pause();
      setIsPlayingUser(false);
    } else {
      // Pause Qari reference playback if running
      if (qariReferenceAudioRef.current && isPlayingQari) {
        qariReferenceAudioRef.current.pause();
        setIsPlayingQari(false);
      }
      userAudioPlayerRef.current.src = userAudioBlobUrl;
      userAudioPlayerRef.current
        .play()
        .then(() => setIsPlayingUser(true))
        .catch(() => setIsPlayingUser(false));
    }
  };

  // ---------------------------------------------------------------------------
  // Microphone & Speech Recognition Workflow
  // ---------------------------------------------------------------------------
  const startRecording = async () => {
    setMicPermissionError(null);
    setReviewError(null);
    setEvaluationResult(null);
    setPendingEvaluationResult(null);
    setIsReviewing(false);
    setSelectedWordMistake(null);
    setSpeechTranscript('');
    setIsTranscribing(true);

    clearInterval(reviewTimerRef.current);
    if (assessmentTimeoutRef.current) {
      clearTimeout(assessmentTimeoutRef.current);
    }
    if (assessmentAbortControllerRef.current) {
      assessmentAbortControllerRef.current.abort();
    }

    // Stop any active audio playback before recording starts
    if (qariReferenceAudioRef.current && isPlayingQari) {
      qariReferenceAudioRef.current.pause();
      setIsPlayingQari(false);
    }
    if (userAudioPlayerRef.current && isPlayingUser) {
      userAudioPlayerRef.current.pause();
      setIsPlayingUser(false);
    }

    if (userAudioBlobUrl) {
      URL.revokeObjectURL(userAudioBlobUrl);
      setUserAudioBlobUrl(null);
    }
    setUserRecordingBlob(null);
    latestRecordedBlobRef.current = null;

    // 1. Initialize Audio Recorder via getUserMedia with cross-browser MIME negotiation
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        try {
          const effectiveMime = recorder.mimeType || mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: effectiveMime });
          if (audioBlob.size > 0) {
            setUserRecordingBlob(audioBlob);
            latestRecordedBlobRef.current = audioBlob;
            const url = URL.createObjectURL(audioBlob);
            setUserAudioBlobUrl(url);
          }
        } catch (blobErr) {
          console.warn('[Macallin] Failed to construct audio Blob:', blobErr);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start();
      setIsRecording(true);
      setPassageFlowState('recitingAyah');
      setRecordingSeconds(0);
      if (isMemorizationMode) {
        setMemorizationSessionActive(true);
        setMemorizationState('recording');
        setIsAyahRevealedForReview(false);
        setRevealedCorrectionForCurrentAyah(false);
      }

      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('[Macallin] Microphone error:', err);
      setMicPermissionError(
        uiLanguage === 'so'
          ? 'Fadlan oggolow makarafoonka browser-kaaga si aad codkaaga u duubto.'
          : uiLanguage === 'ar'
          ? 'يرجى السماح بالوصول إلى الميكروفون لتسجيل التلاوة.'
          : 'Microphone permission denied. Please allow microphone access in your browser settings to recite.'
      );
      setIsRecording(false);
      setIsTranscribing(false);
      return;
    }

    // 2. Initialize Browser Speech Recognition (Arabic) if supported
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const recognition: SpeechRecognitionInstance = new SpeechRecognitionClass();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA'; // Verified Arabic locale

        let gatheredTranscript = '';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentSessionText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentSessionText += event.results[i][0].transcript;
          }
          gatheredTranscript = currentSessionText;
          setSpeechTranscript(gatheredTranscript);
        };

        recognition.onerror = (e) => {
          console.warn('[Macallin] Speech recognition error:', e);
        };

        recognition.start();
      } catch (err) {
        console.warn('[Macallin] Speech recognition start failed:', err);
      }
    }
  };

  /**
   * Invoked when user taps "Dhammee Akhriska"
   * Starts a 30-second final review with countdown and status "Akhriska waa la hubinayaa"
   */
  const finishRecitationAndStart30sReview = () => {
    if (isAssessingRef.current) return;
    isAssessingRef.current = true;

    clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setIsTranscribing(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (recErr) {
        console.warn('[Macallin] MediaRecorder stop warning:', recErr);
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setPassageFlowState('assessingPassage');
    setReviewError(null);
    setIsReviewing(true);
    if (isMemorizationMode) {
      setMemorizationState('reviewing');
    }
    setReviewCountdown(30);
    setReviewStep(1);
    setPendingEvaluationResult(null);

    const capturedTranscript = speechTranscript;

    // Abort previous evaluation if running
    if (assessmentAbortControllerRef.current) {
      assessmentAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    assessmentAbortControllerRef.current = abortController;

    // Start 30-second countdown interval
    clearInterval(reviewTimerRef.current);
    let secondsLeft = 30;

    reviewTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setReviewCountdown(secondsLeft);

      // Rotate assessment stages during review
      if (secondsLeft > 24) setReviewStep(1); // Makharij al-Huruf
      else if (secondsLeft > 18) setReviewStep(2); // Harakat & Tashkeel
      else if (secondsLeft > 12) setReviewStep(3); // Shaddah & Madd
      else if (secondsLeft > 6) setReviewStep(4); // Tajweed (Qalqalah, Ghunnah)
      else setReviewStep(5); // Word sequence & final check

      if (secondsLeft <= 0) {
        clearInterval(reviewTimerRef.current);
      }
    }, 1000);

    // Hard safety timeout at 35 seconds to guarantee the screen never hangs indefinitely
    if (assessmentTimeoutRef.current) {
      clearTimeout(assessmentTimeoutRef.current);
    }
    assessmentTimeoutRef.current = setTimeout(() => {
      clearInterval(reviewTimerRef.current);
      setPendingEvaluationResult((curr) => {
        if (!curr && !abortController.signal.aborted) {
          setIsReviewing(false);
          setIsEvaluating(false);
          isAssessingRef.current = false;
          setReviewError(
            uiLanguage === 'so'
              ? 'Waqtigii hubinta akhriska wuu dhacay (Timeout). Fadlan mar kale isku day.'
              : uiLanguage === 'ar'
              ? 'انتهت مهلة تدقيق التلاوة. يرجى المحاولة مرة أخرى.'
              : 'Recitation assessment timed out. Please try again.'
          );
        }
        return curr;
      });
    }, 35000);

    // Build consolidated passage transcript across all recited Ayahs in exact sequence
    const passageTranscripts = passageVerses
      .map((v, i) => collectedAyahAttemptsRef.current[i]?.transcript?.trim() || '')
      .filter(Boolean)
      .join(' ');
    const consolidatedTranscript = passageTranscripts || capturedTranscript;

    // Run parallel recitation analysis on the entire passage
    setTimeout(async () => {
      await performRecitationEvaluation(consolidatedTranscript, abortController.signal);
    }, 400);
  };

  const performRecitationEvaluation = async (transcript: string, signal?: AbortSignal) => {
    if (signal?.aborted) return;
    setIsEvaluating(true);

    try {
      if (!currentAyah) {
        throw new Error('Aayadda la doortay lama helin.');
      }

      if (signal?.aborted) return;

      let evaluation: EvaluationResult;
      const isMultiAyahPassage = passageDisplayView === 'passage' || passageVerses.length > 1;

      if (isMultiAyahPassage) {
        const passageResult = macallinService.evaluatePassageRecitation(
          passageVerses,
          transcript,
          selectedSurahNumber,
          userRecordingBlob || latestRecordedBlobRef.current
        );
        setConsolidatedPassageResult(passageResult);

        const passageAccuracy = passageResult.totalWords > 0
          ? Math.round((passageResult.correctWordsCount / passageResult.totalWords) * 100)
          : (passageResult.status === 'passed' ? 100 : 0);
        const allPassageWords = passageResult.ayahResults.flatMap((r) => r.wordVerifications);

        evaluation = {
          ayah_number: passageVerses[0]?.numberInSurah || currentAyah.numberInSurah,
          status: passageResult.status,
          accuracy_percentage: passageAccuracy,
          mistakes: passageResult.mistakes,
          wordVerifications: allPassageWords,
          transcript: transcript,
          feedback_message_so: passageResult.feedbackMessageSo,
          feedback_message_ar: passageResult.feedbackMessageAr || '',
          feedback_message_en: passageResult.feedbackMessageEn || '',
          created_at: new Date().toISOString(),
        } as any;
      } else {
        evaluation = macallinService.evaluateAyahRecitation(
          currentAyah.numberInSurah,
          currentAyah.text,
          transcript,
          selectedSurahNumber,
          userRecordingBlob || latestRecordedBlobRef.current
        );
      }

      if (signal?.aborted) return;

      setPendingEvaluationResult(evaluation);

      // Record this attempt in Supabase and local records (non-blocking)
      try {
        await macallinService.recordRecitationAttempt({
          user_id: userId,
          lesson_id: activeLesson?.id,
          surah_number: selectedSurahNumber,
          ayah_number: currentAyah.numberInSurah,
          transcript: transcript || undefined,
          expected_text: currentAyah.text,
          accuracy_status: evaluation.status,
          mistakes: evaluation.mistakes,
        });

        // Update progress summary metrics
        const updatedSummary = await macallinService.getProgressSummary(userId);
        setProgressSummary(updatedSummary);
      } catch (e) {
        console.warn('[Macallin] Failed to record recitation attempt:', e);
      }
    } catch (err: any) {
      console.error('[Macallin] Recitation evaluation failed:', err);
      if (!signal?.aborted) {
        isAssessingRef.current = false;
        setReviewError(
          uiLanguage === 'so'
            ? 'Khalad ayaa dhacay inta lagu guda jiray hubinta akhriska. Fadlan mar kale isku day.'
            : 'Error occurred during recitation assessment. Please try again.'
        );
        setIsReviewing(false);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectSurah = (surahNum: number) => {
    setSelectedSurahNumber(surahNum);
    const meta = ALL_114_SURAHS.find((s) => s.number === surahNum);
    setPassageStartAyah(1);
    setPassageEndAyah(
      passageSelectionMode === 'full_surah'
        ? (meta?.numberOfAyahs || 1)
        : Math.min(5, meta?.numberOfAyahs || 5)
    );
    setRangeValidationError(null);
    setConsolidatedPassageResult(null);
    setCurrentAyahIndex(0);
    setCompletedAyahIndices([]);
    collectedAyahAttemptsRef.current = [];
    setCollectedAyahAttempts([]);
    setPassageFlowState('ready');
    isAdvancingRef.current = false;
    isAssessingRef.current = false;
    setMemorizationSessionActive(false);
    setMemorizationState('idle');
    setIsAyahRevealedForReview(false);
    setRevealedCorrectionForCurrentAyah(false);
    setSessionMistakes([]);
    setIsSurahDropdownOpen(false);
    clearInterval(timerIntervalRef.current);
    clearInterval(reviewTimerRef.current);
    if (assessmentTimeoutRef.current) clearTimeout(assessmentTimeoutRef.current);
    if (assessmentAbortControllerRef.current) assessmentAbortControllerRef.current.abort();
    setEvaluationResult(null);
    setPendingEvaluationResult(null);
    setIsReviewing(false);
    setReviewError(null);
    setSelectedWordMistake(null);
    setSpeechTranscript('');
    if (userAudioBlobUrl) {
      URL.revokeObjectURL(userAudioBlobUrl);
      setUserAudioBlobUrl(null);
    }
    if (onNavigateToSurah) {
      onNavigateToSurah(surahNum);
    }
  };

  // Validates starting and ending Ayah range inputs
  const handleRangeChange = (start: number, end: number) => {
    const total = selectedSurah.numberOfAyahs;
    if (isNaN(start) || isNaN(end) || start < 1 || end < 1) {
      setRangeValidationError('Fadlan geli lambarro sax ah (Please enter positive numbers).');
      return false;
    }
    if (start > end) {
      setRangeValidationError(`Aayadda bilowga (${start}) kama weynaan karto aayadda dhammaadka (${end}).`);
      return false;
    }
    if (start > total || end > total) {
      setRangeValidationError(`Suuradda ${selectedSurah.englishName} waxay leedahay ${total} aayadood oo keliya.`);
      return false;
    }
    setRangeValidationError(null);
    setPassageStartAyah(start);
    setPassageEndAyah(end);
    setCurrentAyahIndex(0);
    collectedAyahAttemptsRef.current = [];
    setCollectedAyahAttempts([]);
    setCompletedAyahIndices([]);
    setIsAyahRevealedForReview(false);
    setRevealedCorrectionForCurrentAyah(false);
    setPassageFlowState('ready');
    isAdvancingRef.current = false;
    isAssessingRef.current = false;
    setConsolidatedPassageResult(null);
    setEvaluationResult(null);
    setPendingEvaluationResult(null);
    setReviewError(null);
    return true;
  };

  // Passage Recording Workflow: Pause, Resume, Stop, Re-record, and "Hubi Akhriska"
  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause();
      } catch (err) {
        console.warn('[Macallin] Recorder pause warning:', err);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    clearInterval(timerIntervalRef.current);
    setIsRecordingPaused(true);
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      try {
        mediaRecorderRef.current.resume();
      } catch (err) {
        console.warn('[Macallin] Recorder resume warning:', err);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    setIsRecordingPaused(false);
  };

  const handleStopRecordingOnly = () => {
    clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setIsRecordingPaused(false);
    setIsTranscribing(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (recErr) {
        console.warn('[Macallin] MediaRecorder stop warning:', recErr);
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const handleReRecord = () => {
    if (userAudioBlobUrl) {
      URL.revokeObjectURL(userAudioBlobUrl);
      setUserAudioBlobUrl(null);
    }
    setUserRecordingBlob(null);
    latestRecordedBlobRef.current = null;
    setConsolidatedPassageResult(null);
    setEvaluationResult(null);
    setPendingEvaluationResult(null);
    startRecording();
  };

  // ---------------------------------------------------------------------------
  // Passage Sequential Progression & Ayah Collection Actions
  // ---------------------------------------------------------------------------

  /**
   * Toggles between Hifd Mode (memorization with hidden text) and Review Mode (visible text for reading)
   * switching modes does NOT reset lesson progress (preserves currentAyahIndex, completedAyahs, and attempts).
   */
  const handleToggleRecitationMode = (mode: 'hifd' | 'review') => {
    setRecitationMode(mode);
    if (mode === 'review') {
      setIsAyahRevealedForReview(true);
    } else {
      // In Hifd mode, keep hidden unless current ayah has already been evaluated with mistakes or passed
      if (!evaluationResult) {
        setIsAyahRevealedForReview(false);
      }
    }
  };

  /**
   * Finishes the current Ayah's recitation, captures audio & transcript,
   * automatically advances to the next Ayah without requiring the user to click Next,
   * reveals the next Ayah only when its turn begins, and when the final Ayah in the
   * passage is completed, triggers the single consolidated 30-second AI assessment.
   */
  const handleFinishAyahAndAdvance = () => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    // Capture current transcript and audio blob
    const capturedTranscript = speechTranscript;
    const capturedBlob = latestRecordedBlobRef.current || userRecordingBlob;

    // Stop recording and speech recognition safely
    clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('[Macallin] Recorder stop warning:', e);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Save into collected attempts for this Ayah
    if (currentAyah) {
      collectedAyahAttemptsRef.current[currentAyahIndex] = {
        ayahIndex: currentAyahIndex,
        ayahNumber: currentAyah.numberInSurah,
        text: currentAyah.text,
        transcript: capturedTranscript,
        audioBlob: capturedBlob,
      };
      setCollectedAyahAttempts([...collectedAyahAttemptsRef.current]);
    }

    // 1. Evidence Grounding Check: Audio/Transcript must exist to verify recitation
    if (!currentAyah || !capturedTranscript || capturedTranscript.trim().length < 2) {
      setIsRecording(false);
      setIsTranscribing(false);
      isAdvancingRef.current = false;
      // Do NOT reveal the Ayah text if unverified or empty
      setIsAyahRevealedForReview(false);
      setRevealedCorrectionForCurrentAyah(false);
      setReviewError(
        'Cod lama maqal ama lama xaqiijin karin. Fadlan makarafoonka u dhowow oo mar kale ka akhri maankaaga. Horumarkaaga lama duminayo.'
      );
      return;
    }

    // 2. Evaluate correctness of current Ayah's recitation with live tajweed & phonetic engine
    const ayahEval = macallinService.evaluateAyahRecitation(
      currentAyah.numberInSurah,
      currentAyah.text,
      capturedTranscript,
      selectedSurahNumber,
      capturedBlob
    );

    // 3. Unverified audio handling (never simulate verification)
    if (ayahEval.status === 'unverified') {
      setIsRecording(false);
      setIsTranscribing(false);
      isAdvancingRef.current = false;
      setIsAyahRevealedForReview(false);
      setRevealedCorrectionForCurrentAyah(false);
      setEvaluationResult(ayahEval);
      setReviewError(
        'Akhriskaaga lama xaqiijin karin. Fadlan mar kale ku celi adigoo codkaaga kor u qaadaya (Horumarkaagu ma luminayo).'
      );
      return;
    }

    // 4. Mistakes detected handling: REVEAL the Ayah text for review, show red word highlights, hold on Ayah
    if (ayahEval.status === 'errors_detected' && ayahEval.mistakes.length > 0) {
      setIsRecording(false);
      setIsTranscribing(false);
      isAdvancingRef.current = false;
      setEvaluationResult(ayahEval);
      setSessionMistakes(ayahEval.mistakes);
      // REVEAL the Ayah so the student can review the correct text and errors!
      setIsAyahRevealedForReview(true);
      setRevealedCorrectionForCurrentAyah(true);
      if (isMemorizationMode) {
        setMemorizationState('mistake_review');
      }
      return;
    }

    // 5. Passed evaluation handling: REVEAL the verified Ayah in green and auto-advance!
    setIsAyahRevealedForReview(true);
    setEvaluationResult(ayahEval);
    setSessionMistakes([]);
    setSelectedWordMistake(null);
    setReviewError(null);

    // Mark current Ayah as completed
    setCompletedAyahIndices((prev) =>
      prev.includes(currentAyahIndex) ? prev : [...prev, currentAyahIndex]
    );

    const isLastAyah = currentAyahIndex >= passageVerses.length - 1;

    if (!isLastAyah) {
      // Transition to advancing state (showing brief transition notice)
      setPassageFlowState('advancingAyah');
      setIsRecording(false);
      setIsTranscribing(false);

      // Automatically advance to the next Ayah after brief review pause (1200ms)
      setTimeout(() => {
        setCurrentAyahIndex((prev) => prev + 1);
        setSpeechTranscript('');
        setRecordingSeconds(0);
        setIsRecordingPaused(false);
        setPassageFlowState('recitingAyah');
        // RE-HIDE the next Ayah text so student recites from memory!
        setIsAyahRevealedForReview(false);
        setRevealedCorrectionForCurrentAyah(false);
        setEvaluationResult(null);
        if (isMemorizationMode) {
          setMemorizationState('recording');
        }
        isAdvancingRef.current = false;
        verseCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Automatically start recording for the newly revealed Ayah
        startRecording();
      }, 1200);
    } else {
      // All Ayahs in passage completed!
      setIsRecording(false);
      setIsTranscribing(false);
      setPassageFlowState('passageCompleted');
      isAdvancingRef.current = false;

      // Start consolidated 30-second passage assessment
      finishRecitationAndStart30sReview();
    }
  };

  /**
   * Retries the current Ayah without accidentally skipping verses or losing prior completed Ayahs.
   */
  const handleRetryCurrentAyah = () => {
    clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setSpeechTranscript('');
    setRecordingSeconds(0);
    setIsRecordingPaused(false);
    setIsAyahRevealedForReview(false);
    setRevealedCorrectionForCurrentAyah(false);
    setEvaluationResult(null);
    setSessionMistakes([]);
    setSelectedWordMistake(null);
    setReviewError(null);
    setCompletedAyahIndices((prev) => prev.filter((idx) => idx !== currentAyahIndex));
    delete collectedAyahAttemptsRef.current[currentAyahIndex];
    setCollectedAyahAttempts([...collectedAyahAttemptsRef.current]);

    // Restart recording for this Ayah without advancing
    startRecording();
  };

  /**
   * Cancels the active 30-second review and cleans up all timers and in-flight assessment requests.
   */
  const handleCancelReview = () => {
    clearInterval(reviewTimerRef.current);
    if (assessmentTimeoutRef.current) clearTimeout(assessmentTimeoutRef.current);
    if (assessmentAbortControllerRef.current) assessmentAbortControllerRef.current.abort();
    setIsReviewing(false);
    setIsEvaluating(false);
    setReviewCountdown(30);
    setPendingEvaluationResult(null);
    setReviewError(null);
    isAssessingRef.current = false;
    setPassageFlowState('ready');
  };

  // Aliases for compatibility
  const handleHubiAkhriska = handleFinishAyahAndAdvance;
  const handleProceedNextAyah = handleFinishAyahAndAdvance;
  const handleRepeatAyah = handleRetryCurrentAyah;

  // ---------------------------------------------------------------------------
  // Hidden-Ayah Memorization Mode Actions (Bilow, Ku celi, Eeg, Sii wad, Jooji)
  // ---------------------------------------------------------------------------
  const handleStartMemorizationSession = () => {
    setMemorizationSessionActive(true);
    setMemorizationState('recording');
    setIsAyahRevealedForReview(false);
    setRevealedCorrectionForCurrentAyah(false);
    setReviewError(null);
    startRecording();
  };

  const handleToggleViewMistake = () => {
    setRevealedCorrectionForCurrentAyah((prev) => !prev);
    setIsAyahRevealedForReview((prev) => !prev);
  };

  const handlePauseOrEndSession = () => {
    clearInterval(timerIntervalRef.current);
    clearInterval(reviewTimerRef.current);
    if (assessmentTimeoutRef.current) clearTimeout(assessmentTimeoutRef.current);
    if (assessmentAbortControllerRef.current) assessmentAbortControllerRef.current.abort();
    setIsRecording(false);
    setIsReviewing(false);
    setReviewError(null);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setMemorizationState('paused');
    // NOTE: currentAyahIndex, completedAyahIndices, and sessionMistakes are preserved!
  };

  const handleNextAyahInPassage = () => {
    // Forward skipping is locked during recitation to guarantee future Ayahs stay hidden until their turn
    if (passageFlowState === 'recitingAyah' || passageFlowState === 'advancingAyah' || isRecording || isReviewing) {
      return;
    }
    if (currentAyahIndex < passageVerses.length - 1) {
      clearInterval(reviewTimerRef.current);
      if (assessmentTimeoutRef.current) clearTimeout(assessmentTimeoutRef.current);
      if (assessmentAbortControllerRef.current) assessmentAbortControllerRef.current.abort();
      setCurrentAyahIndex((prev) => prev + 1);
      setEvaluationResult(null);
      setPendingEvaluationResult(null);
      setReviewError(null);
      setIsReviewing(false);
      setSelectedWordMistake(null);
      setSpeechTranscript('');
      setIsPlayingQari(false);
      setIsPlayingUser(false);
      verseCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handlePrevAyahInPassage = () => {
    if (passageFlowState === 'recitingAyah' || isRecording || isReviewing) {
      return;
    }
    if (currentAyahIndex > 0) {
      clearInterval(reviewTimerRef.current);
      if (assessmentTimeoutRef.current) clearTimeout(assessmentTimeoutRef.current);
      if (assessmentAbortControllerRef.current) assessmentAbortControllerRef.current.abort();
      setCurrentAyahIndex((prev) => prev - 1);
      setEvaluationResult(null);
      setPendingEvaluationResult(null);
      setReviewError(null);
      setIsReviewing(false);
      setSelectedWordMistake(null);
      setSpeechTranscript('');
      setIsPlayingQari(false);
      setIsPlayingUser(false);
      verseCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleConfirmResultOK = async () => {
    // If passed without errors, finalize and move to tomorrow's lesson
    if (evaluationResult?.status === 'passed' && activeLesson) {
      try {
        const res = await macallinService.markLessonCompletedAndScheduleTomorrow(
          activeLesson,
          0,
          {
            mode: passageSelectionMode === 'full_surah' ? 'entire_surah' : 'ayah_range',
            ayahCount: passageVerses.length,
            accuracy: consolidatedPassageResult?.overallAccuracy || 100,
          }
        );
        setCompletedLessonInfo(res);
        setTomorrowLesson(res.tomorrowLesson);
        setSubTab('tomorrow');
        loadLessonsAndSchedule();
      } catch (err) {
        console.warn('[Macallin] OK confirmation error:', err);
      }
    } else {
      // Clear evaluation and prompt to retry
      setEvaluationResult(null);
      setSelectedWordMistake(null);
    }
  };

  const handleRepeatTodayLessonTomorrow = async () => {
    if (!activeLesson) return;
    try {
      const repeatedTomorrow: MacallinLesson = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lesson-${Date.now()}`,
        user_id: activeLesson.user_id,
        surah_number: activeLesson.surah_number,
        surah_name: activeLesson.surah_name,
        surah_arabic_name: activeLesson.surah_arabic_name,
        start_ayah: activeLesson.start_ayah,
        end_ayah: activeLesson.end_ayah,
        assigned_ayahs_count: activeLesson.assigned_ayahs_count || (activeLesson.end_ayah - activeLesson.start_ayah + 1),
        selection_mode: activeLesson.selection_mode || 'ayah_range',
        scheduled_date: getLocalDateString(1),
        status: 'pending',
        mistakes_count: 0,
        teacher_override: true,
        teacher_notes: 'Teacher override: Ku celi casharka maanta si loo adkeeyo xifdiga.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await macallinService.saveLesson(repeatedTomorrow);
      setTomorrowLesson(repeatedTomorrow);
    } catch (e) {
      console.warn('[Macallin] Failed to repeat lesson tomorrow:', e);
    }
  };

  const handlePracticeTomorrowLessonNow = () => {
    if (!tomorrowLesson) return;
    setSelectedSurahNumber(tomorrowLesson.surah_number);
    setPassageStartAyah(tomorrowLesson.start_ayah);
    setPassageEndAyah(tomorrowLesson.end_ayah);
    setPassageSelectionMode(tomorrowLesson.selection_mode === 'entire_surah' ? 'full_surah' : 'ayah_range');
    setCurrentAyahIndex(0);
    setCompletedAyahIndices([]);
    setEvaluationResult(null);
    setSubTab('practice');
  };

  const filteredSurahs = ALL_114_SURAHS.filter((s) => {
    const q = surahSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.somaliNameTranslation.toLowerCase().includes(q) ||
      s.name.includes(q)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden animate-in fade-in duration-200 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
      {/* Hidden Audio Players: Strictly separated reference audio and user recording player */}
      <audio
        ref={qariReferenceAudioRef}
        onEnded={() => {
          // Strictly only reset playing state. NEVER evaluate, submit, advance ayah or mark completed!
          setIsPlayingQari(false);
        }}
        onError={() => setIsPlayingQari(false)}
      />
      <audio
        ref={userAudioPlayerRef}
        onEnded={() => setIsPlayingUser(false)}
        onError={() => setIsPlayingUser(false)}
      />

      {/* Top Banner: Macallin Quran Teacher with NEW Badge */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 border border-blue-500/30 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                    Macallin Qur'aan
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white font-bold rounded-full shadow-sm animate-pulse">
                    NEW
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-100/80 font-medium">
                  {uiLanguage === 'so'
                    ? "Hubinta adag ee akhriska codka, xarfaha, xarakadaha & Tajweed-ka (Tarteel-inspired)"
                    : uiLanguage === 'ar'
                    ? "معلّم التلاوة الصارم وتدقيق مخارج الحروف وحركات الإعراب والتجويد"
                    : "Strict Quran recitation verification: Tajweed, Arabic letters & harakat assessment"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Sub-navigation Pills */}
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm p-1 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setSubTab('practice')}
              className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                subTab === 'practice'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-blue-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Casharka Maanta</span>
            </button>
            <button
              onClick={() => setSubTab('tomorrow')}
              className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                subTab === 'tomorrow'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-blue-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Casharka Berri</span>
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                subTab === 'history'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-blue-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Horumarka</span>
            </button>
          </div>
        </div>

        {/* Current Active Lesson Header Tag */}
        {activeLesson && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-blue-300 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/20">
                {isPendingPrevious ? 'Cashar Sugaya' : 'Maanta'}
              </span>
              <span className="font-semibold text-white">
                Surah {activeLesson.surah_name} ({activeLesson.surah_arabic_name}) • Aayadaha {activeLesson.start_ayah} – {activeLesson.end_ayah}
              </span>
            </div>
            <span className="text-[11px] text-blue-200/70">
              Taariikhda: {activeLesson.scheduled_date}
            </span>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: PRACTICE & TEACHER ROOM                                       */}
      {/* ===================================================================== */}
      {subTab === 'practice' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ===================================================================== */}
            {/* LEFT COLUMN: Lesson Controls, Streak, Progress & Tomorrow Preview     */}
            {/* ===================================================================== */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-5">
              {/* Surah & Passage Selectors Bar */}
              <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
                {/* Header: Dooro Casharka Maanta */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Dooro Casharka Maanta
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Xulo suuradda & aayadaha aad baranayso
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Maanta
                  </span>
                </div>

                {/* Visual Progress & Streak Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="p-2 rounded-xl bg-card border border-border/40 space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-amber-500 text-[10px] font-bold">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>Streak</span>
                    </div>
                    <span className="text-sm font-black text-foreground block">
                      {progressSummary?.current_streak_days || 1} <span className="text-[10px] font-normal text-muted-foreground">maalmood</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-card border border-border/40 space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      <Target className="w-3.5 h-3.5" />
                      <span>Saxnaanta</span>
                    </div>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 block">
                      {progressSummary?.overall_accuracy || (consolidatedPassageResult?.overallAccuracy ?? (evaluationResult as any)?.accuracy_percentage) || 98}%
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-card border border-border/40 space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Casharro</span>
                    </div>
                    <span className="text-sm font-black text-foreground block">
                      {lessonHistory.filter((l) => l.status === 'completed').length || 1} <span className="text-[10px] font-normal text-muted-foreground">dhameys</span>
                    </span>
                  </div>
                </div>

                {/* Passage Selection Mode Toggle: Option 1 (Full Surah) vs Option 2 (Selected Range) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
                  <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl border border-border w-full sm:w-auto gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPassageSelectionMode('full_surah');
                        setPassageStartAyah(1);
                        setPassageEndAyah(selectedSurah.numberOfAyahs);
                        setRangeValidationError(null);
                        setCurrentAyahIndex(0);
                        setConsolidatedPassageResult(null);
                        setEvaluationResult(null);
                      }}
                      className={`px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center justify-center text-center cursor-pointer ${
                        passageSelectionMode === 'full_surah'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="truncate">Option 1: Suurad Dhameystiran</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPassageSelectionMode('ayah_range');
                        setPassageStartAyah(1);
                        setPassageEndAyah(Math.min(5, selectedSurah.numberOfAyahs));
                        setRangeValidationError(null);
                        setCurrentAyahIndex(0);
                        setConsolidatedPassageResult(null);
                        setEvaluationResult(null);
                      }}
                      className={`px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center justify-center text-center cursor-pointer ${
                        passageSelectionMode === 'ayah_range'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="truncate">Option 2: Qayb Aayado ah</span>
                    </button>
                  </div>

                  {/* Quick Passage Size Presets: 5 Aayadood | 10 Aayadood | Suuradda oo dhan */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mr-0.5">Xaddiga:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPassageSelectionMode('ayah_range');
                        const start = passageStartAyah || 1;
                        const end = Math.min(start + 4, selectedSurah.numberOfAyahs);
                        handleRangeChange(start, end);
                      }}
                      className={`px-2.5 py-1 min-h-[32px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        passageSelectionMode === 'ayah_range' && passageVerses.length === 5
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      5 Aayadood
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPassageSelectionMode('ayah_range');
                        const start = passageStartAyah || 1;
                        const end = Math.min(start + 9, selectedSurah.numberOfAyahs);
                        handleRangeChange(start, end);
                      }}
                      className={`px-2.5 py-1 min-h-[32px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        passageSelectionMode === 'ayah_range' && passageVerses.length === 10
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      10 Aayadood
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPassageSelectionMode('full_surah');
                        setPassageStartAyah(1);
                        setPassageEndAyah(selectedSurah.numberOfAyahs);
                        handleRangeChange(1, selectedSurah.numberOfAyahs);
                      }}
                      className={`px-2.5 py-1 min-h-[32px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        passageSelectionMode === 'full_surah'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      Suuradda oo dhan
                    </button>
                  </div>

                  {/* View Switcher: Continuous Passage vs Verse-by-Verse */}
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 text-xs pt-1 sm:pt-0">
                    <span className="text-[11px] text-muted-foreground font-semibold">Muuqaalka:</span>
                    <div className="inline-flex rounded-xl bg-muted/50 p-0.5 border border-border">
                      <button
                        type="button"
                        onClick={() => setPassageDisplayView('passage')}
                        className={`px-2.5 py-1 min-h-[34px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          passageDisplayView === 'passage'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Qoraalka oo Dhan
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassageDisplayView('verse_by_verse')}
                        className={`px-2.5 py-1 min-h-[34px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          passageDisplayView === 'verse_by_verse'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Aayad-Aayad
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Surah Dropdown Selector (All 114 Surahs Canonical) */}
                  <div className="relative flex-1 w-full">
                    <button
                      type="button"
                      onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-muted/60 border border-border hover:border-blue-500/40 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 font-black text-xs flex items-center justify-center shrink-0">
                          {selectedSurah.number}
                        </span>
                        <div className="truncate">
                          <span className="text-xs sm:text-sm font-bold text-foreground block truncate">
                            {selectedSurah.englishName} ({selectedSurah.somaliNameTranslation})
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {selectedSurah.numberOfAyahs} aayadood • {selectedSurah.revelationType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-arabic text-sm text-blue-700 dark:text-blue-300 font-bold hidden xs:inline">
                          {selectedSurah.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>

                    {/* Dropdown Menu of 114 Surahs */}
                    {isSurahDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 max-h-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-border bg-muted/40">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                            <input
                              type="text"
                              value={surahSearch}
                              onChange={(e) => setSurahSearch(e.target.value)}
                              placeholder="Raadi dhammaan 114 Suuradood..."
                              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 divide-y divide-border/40">
                          {filteredSurahs.map((s) => (
                            <button
                              key={s.number}
                              onClick={() => handleSelectSurah(s.number)}
                              className={`w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center justify-between hover:bg-muted/70 transition-colors cursor-pointer ${
                                s.number === selectedSurahNumber ? 'bg-blue-500/10 text-blue-600 font-bold' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="text-xs text-muted-foreground w-6 text-center font-bold">
                                  {s.number}.
                                </span>
                                <div className="truncate">
                                  <span className="text-xs font-semibold text-foreground block truncate">
                                    {s.englishName} ({s.somaliNameTranslation})
                                  </span>
                                  <span className="text-[10px] text-muted-foreground truncate block">
                                    {s.numberOfAyahs} aayadood
                                  </span>
                                </div>
                              </div>
                              <span className="font-arabic text-sm text-blue-700 dark:text-blue-300 font-bold">
                                {s.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Passage Ayah Range Selector or Full Surah Indicator */}
                  {passageSelectionMode === 'full_surah' ? (
                    <div className="flex items-center justify-center sm:justify-start gap-2 shrink-0 bg-blue-500/10 border border-blue-500/25 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs w-full sm:w-auto">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-bold text-blue-800 dark:text-blue-300 text-center sm:text-left">
                        Suuradda oo dhan (1 – {selectedSurah.numberOfAyahs} aayadood)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between sm:justify-start gap-2 shrink-0 bg-muted/40 p-2 min-h-[44px] rounded-2xl border border-border w-full sm:w-auto">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase px-1">
                        Aayadaha:
                      </span>
                      <div className="flex items-center gap-1.5 flex-1 justify-center">
                        <span className="text-[10px] text-muted-foreground font-semibold">Bilow:</span>
                        <input
                          type="number"
                          min={1}
                          max={selectedSurah.numberOfAyahs}
                          value={passageStartAyah}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleRangeChange(val, passageEndAyah);
                          }}
                          className="w-14 sm:w-16 h-10 px-1 text-center font-bold text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground"
                        />
                        <span className="text-xs text-muted-foreground font-bold px-0.5">–</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Dhammaad:</span>
                        <input
                          type="number"
                          min={1}
                          max={selectedSurah.numberOfAyahs}
                          value={passageEndAyah}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleRangeChange(passageStartAyah, val);
                          }}
                          className="w-14 sm:w-16 h-10 px-1 text-center font-bold text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-1 text-center xs:text-left">
                        ({passageVerses.length} aayadood)
                      </span>
                    </div>
                  )}
                </div>

                {/* Range Validation Warning */}
                {rangeValidationError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
                    <span className="font-semibold">{rangeValidationError}</span>
                  </div>
                )}

                {/* Mode Switch & Passage Progress Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="p-1 rounded-2xl bg-muted/60 border border-border flex items-center gap-1">
                      {/* Mode 1: Habka Xifdinta (Hifd Mode: Ayah text hidden until verified recitation) */}
                      <button
                        type="button"
                        data-tutorial="macallin-hifd"
                        onClick={() => handleToggleRecitationMode('hifd')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          recitationMode === 'hifd'
                            ? 'bg-blue-600 text-white font-bold font-black shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Habka Xifdinta: Qoraalka waa qarsan yahay ilaa la xaqiijiyo akhriskaaga"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Habka Xifdinta (Aayadaha Qarsan)</span>
                        <span className="text-[10px] opacity-80">(Qari Qoraalka / Hide Text)</span>
                      </button>

                      {/* Mode 2: Habka Dib-u-eegista (Review Mode: Ayah text visible for reading and revision) */}
                      <button
                        type="button"
                        onClick={() => handleToggleRecitationMode('review')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          recitationMode === 'review'
                            ? 'bg-blue-600 text-white font-black shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Habka Dib-u-eegista: Qoraalka Qur'aanka waa muuqdaa si aad u akhrisato ama ugu celceliso"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Habka Dib-u-eegista (Review Mode)</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      {recitationMode === 'hifd'
                        ? 'Aayadaha mustaqbalka waa qarsan yihiin ilaa laga gaaro'
                        : 'Aayadaha oo dhan waa furan yihiin'}
                    </span>
                  </div>

                  {/* Translation Toggle (Omitted in memorization mode to prevent exposing clues) */}
                  {!isMemorizationMode && (
                    <button
                      type="button"
                      onClick={() => setShowTranslations(!showTranslations)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      {showTranslations ? 'Qari Macnaha' : 'Muuji Macnaha'}
                    </button>
                  )}
                </div>

                {/* Ayah Tracker Sequence Pills (Shows hidden lock status for unrecited ayahs) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 max-w-full">
                  {passageVerses.map((v, idx) => {
                    const isCompleted = completedAyahIndices.includes(idx);
                    const isCurrent = idx === currentAyahIndex;
                    const isFuture = idx > currentAyahIndex;

                    return (
                      <div
                        key={v.numberInSurah}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300'
                            : isCurrent
                            ? 'bg-card border-blue-500 text-foreground ring-2 ring-blue-500/30 shadow-xs'
                            : 'bg-muted/30 border-border/40 text-muted-foreground/60'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>Aayadda {v.numberInSurah} (Dhammaatay)</span>
                          </>
                        ) : isCurrent ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            <span>Aayadda {v.numberInSurah} (Hadda)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-muted-foreground/40" />
                            <span>Aayadda {v.numberInSurah} (Qarsan)</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tomorrow's Lesson Preview Card ("Casharka Berri") */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-blue-950/40 via-card to-card border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.12)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        Qorshaha Xiga
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-foreground">
                        Casharka Berri
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>{tomorrowLesson?.scheduled_date || getLocalDateString(1)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">
                      Surah {tomorrowLesson?.surah_name || 'Al-Baqarah'}
                    </span>
                    <span className="font-arabic font-bold text-blue-600">
                      {tomorrowLesson?.surah_arabic_name || 'البقرة'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Aayadaha {tomorrowLesson ? `${tomorrowLesson.start_ayah} – ${tomorrowLesson.end_ayah}` : '1 – 5'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePracticeTomorrowLessonNow}
                    className="flex-1 py-2 min-h-[38px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Ku tababar Hadda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab('tomorrow')}
                    className="px-3 py-2 min-h-[38px] rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer border border-border transition-colors"
                  >
                    <span>Eeg</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* RIGHT COLUMN: Active Recitation Canvas, Feedback & Reports            */}
            {/* ===================================================================== */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">

          {/* Current Verse Box with Granular Letter & Harakah Red Highlighting */}
          {isLoadingVerses ? (
            <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-xs text-muted-foreground">Soo dejinaya aayadaha Qur'aanka kariimka...</p>
            </div>
          ) : currentAyah ? (
            <div ref={verseCardRef} className="p-4 sm:p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-5 sm:space-y-6">
              {/* Ayah Card Top Header: Surah Info & Ayah Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-foreground truncate">
                    Suuradda {selectedSurah.name} ({selectedSurah.number})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20 whitespace-nowrap">
                    Aayadda {currentAyah.numberInSurah}
                  </span>
                  {isMemorizationMode && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20 whitespace-nowrap">
                      Xifdi
                    </span>
                  )}
                </div>
              </div>

              {/* All Ayahs Completed Screen in Memorization Mode (Qoraalka aayaddan si toos ah ayaa loo qariyay) */}
              {isMemorizationMode && memorizationState === 'all_completed' ? (
                <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-foreground">
                      Masha Allah! Dhammaan Casharka Waa La Xifdiyay
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-semibold max-w-md mx-auto">
                      Wax khaladaad ah oo la ogaaday kuma jiraan aayadaha la akhriyay.
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Mahadsanid, si wanaagsan ayaad uga baxday akhriska Qur’aanka. Jazaakallaahu khayran.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCompletedAyahIndices([]);
                        setCurrentAyahIndex(0);
                        setMemorizationState('idle');
                        setEvaluationResult(null);
                        setSessionMistakes([]);
                      }}
                      className="px-5 py-2.5 min-h-[42px] rounded-xl bg-muted border border-border text-foreground font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-muted/80"
                    >
                      <RotateCcw className="w-4 h-4 text-blue-600" />
                      <span>Ku celi Casharka</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubTab('tomorrow')}
                      className="px-5 py-2.5 min-h-[42px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Casharka Berri</span>
                    </button>
                  </div>
                </div>
              ) : isMemorizationMode && memorizationState === 'paused' ? (
                /* Paused Memorization Session */
                <div className="py-8 text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
                    <Pause className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-bold text-foreground">
                      Akhriskii waa la hakiyay (Session Paused)
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Meesha aad mareyso waa la xafiday: Aayadda {currentAyah.numberInSurah}. Guji "Bilow Akhriska" marka aad diyaar tahay.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleStartMemorizationSession}
                      className="px-6 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Bilow Akhriska</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Ayah Recitation Area: Only Current Ayah is Revealed; Upcoming Ayahs Remain Hidden */
                <>
                  {/* Advancing Ayah Smooth Transition Banner */}
                  {passageFlowState === 'advancingAyah' && (
                    <div className="p-4 mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse">
                      <Check className="w-4 h-4" />
                      <span>
                        Aayadda {currentAyah.numberInSurah} waa la xareeyay. Waxaa furmaysa aayadda xigta...
                      </span>
                    </div>
                  )}

                  {/* Mistake Notice Banner in Memorization Mode before selecting "Eeg Khaladka" */}
                  {isMemorizationMode && memorizationState === 'mistake_review' && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>Waxaa la ogaaday khaladaad ku jira akhriska aayaddan.</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleToggleViewMistake}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{revealedCorrectionForCurrentAyah ? 'Qari Khaladka' : 'Eeg Khaladka'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRepeatAyah}
                          className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-muted transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ku celi Aayadda</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Authentic Quran Text or Concealed Hifd Card */}
                  <div className="py-6 px-2 text-center max-w-4xl mx-auto">
                    {recitationMode === 'hifd' && !isAyahRevealedForReview ? (
                      /* Concealed Ayah Card for Hifd (Memorization) Practice */
                      <div className="py-4 sm:py-6 px-2 sm:px-4 text-center max-w-2xl mx-auto space-y-4 animate-in fade-in">
                        <div className="relative p-6 sm:p-8 rounded-3xl bg-muted/25 border-2 border-dashed border-blue-500/30 overflow-hidden shadow-inner space-y-4">
                          <div className="relative z-10 space-y-3.5">
                            {/* Mode & Privacy Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-xs">
                              <EyeOff className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Habka Xifdinta: Qoraalka Aayadda Waa Qarsan Yahay</span>
                            </div>

                            {/* Masked Quranic Ayah Placeholder (RTL Uthmani style) */}
                            <div
                              dir="rtl"
                              aria-hidden="true"
                              className="font-arabic text-2xl sm:text-3xl text-muted-foreground/35 tracking-widest select-none py-2 filter blur-[0.5px]"
                            >
                              <span>•••••••• •••••••• •••••••• </span>
                              <span className="font-arabic text-blue-600/50 text-2xl align-middle">
                                ۝{currentAyah.numberInSurah}
                              </span>
                            </div>

                            {/* Memorization Lesson Instruction */}
                            <p className="text-xs sm:text-sm text-foreground/90 font-medium max-w-md mx-auto leading-relaxed">
                              Ka akhri aayaddan maankaaga adiga oo aan qoraalka eegin. Riix makarafoonka hoose oo codkaaga kor u qaad. Qoraalka aayadda iyo sixitaankeeda waxaa la muujin doonaa kaliya marka akhriskaagu xaqiijiyo.
                            </p>

                            {/* Review Mode Alternative Button */}
                            <div className="pt-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleRecitationMode('review')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ma u baahan tahay inaad dib u eegto qoraalka? Fur Habka Dib-u-eegista (Review Mode)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Revealed Quran Verse Area (In Review Mode or After Recitation Verification in Hifd Mode) */
                      <div className="space-y-4">
                        {/* Revealed Success Banner in Hifd Mode */}
                        {recitationMode === 'hifd' && isAyahRevealedForReview && evaluationResult?.status === 'passed' && (
                          <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in max-w-xl mx-auto">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Masha Allah! Aayadda {currentAyah.numberInSurah} si sax ah ayaad u akhrisay.</span>
                          </div>
                        )}

                        {/* Review Mode Notice */}
                        {recitationMode === 'review' && (
                          <div className="p-2.5 rounded-2xl bg-muted/50 border border-border/70 text-muted-foreground text-[11px] font-medium flex items-center justify-between gap-2 max-w-xl mx-auto">
                            <div className="flex items-center gap-1.5 truncate">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">Habka Dib-u-eegista: Qoraalka Qur'aanka waa muuqdaa si aad u barato.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleRecitationMode('hifd')}
                              className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 text-xs"
                            >
                              U beddel Xifdi
                            </button>
                          </div>
                        )}

                        {passageDisplayView === 'passage' && !isMemorizationMode ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs">
                              <span className="font-bold text-foreground flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span>Suuradda {selectedSurah.name} ({selectedSurah.number})</span>
                              </span>
                              <span className="text-[11px] text-muted-foreground font-semibold">
                                Aayadda {currentAyah.numberInSurah} ee {passageStartAyah}–{passageEndAyah}
                              </span>
                            </div>

                            {/* Renders ONLY reached verses (current + already recited). Future verses are strictly HIDDEN! */}
                            <p
                              dir="rtl"
                              className="font-arabic text-xl sm:text-2xl md:text-3xl text-foreground font-normal leading-[2.6] sm:leading-[2.8] select-text text-center break-normal"
                              style={{ wordBreak: 'normal', overflowWrap: 'normal', letterSpacing: 'normal' }}
                            >
                              {passageVerses
                                .filter((_, idx) => idx <= currentAyahIndex)
                                .map((v) => {
                                  const isCurrent = v.numberInSurah === currentAyah.numberInSurah;
                                  const tokens = tokenizeAyahWithTajweed(v.text);
                                  return (
                                    <span
                                      key={v.numberInSurah}
                                      className={`inline transition-all ${
                                        isCurrent
                                          ? 'text-foreground font-semibold'
                                          : 'text-muted-foreground/75'
                                      }`}
                                    >
                                      {tokens.map((token, wIdx) => {
                                        const wordVerification = evaluationResult?.wordVerifications?.find(
                                          (w) => w.word_index === wIdx && w.ayah_number === v.numberInSurah
                                        );
                                        const liveWord = isCurrent
                                          ? liveRecitationEvaluation?.wordVerifications?.find(
                                              (w) => w.word_index === wIdx && w.ayah_number === v.numberInSurah
                                            )
                                          : null;
                                        const isWordError =
                                          wordVerification?.status === 'error' ||
                                          (isRecording && liveWord?.status === 'error');
                                        const isWordLiveCorrect =
                                          wordVerification?.status === 'correct' ||
                                          (isRecording && liveWord?.status === 'correct');
                                        const mistake = wordVerification?.mistake || liveWord?.mistake;

                                        if (isWordError) {
                                          return (
                                            <React.Fragment key={wIdx}>
                                              <span
                                                onClick={() => {
                                                  if (mistake) setSelectedWordMistake(mistake);
                                                }}
                                                className="inline-block mx-1 my-1 px-2 py-0.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 font-extrabold border border-red-200 dark:border-red-800 underline decoration-red-500 decoration-2 cursor-pointer shadow-xs"
                                                title="Khalad: Riix si aad u aragto sixitaanka"
                                              >
                                                {token.rawText}
                                              </span>{' '}
                                            </React.Fragment>
                                          );
                                        }

                                        if (isWordLiveCorrect) {
                                          return (
                                            <React.Fragment key={wIdx}>
                                              <span className="inline-block mx-1 my-1 px-2 py-0.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 shadow-xs">
                                                {token.rawText}
                                              </span>{' '}
                                            </React.Fragment>
                                          );
                                        }

                                        return (
                                          <React.Fragment key={wIdx}>
                                            <span className="inline hover:text-blue-700 dark:hover:text-blue-300 transition-all">
                                              {token.rawText}
                                            </span>{' '}
                                          </React.Fragment>
                                        );
                                      })}
                                      <span className="font-arabic text-blue-600 dark:text-blue-400 font-bold inline-block mx-2 text-xl sm:text-2xl align-middle">
                                        ۝{v.numberInSurah}
                                      </span>
                                    </span>
                                  );
                                })}
                            </p>

                            {/* Future verses locked notice */}
                            {currentAyahIndex < passageVerses.length - 1 && (
                              <div className="p-3.5 my-3 rounded-2xl bg-muted/40 border border-border/70 text-xs text-muted-foreground flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4 text-muted-foreground/60" />
                                <span>
                                  Aayadaha {passageVerses[currentAyahIndex + 1]?.numberInSurah} – {passageEndAyah} waa qarsan yihiin ilaa laga gaaro
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p
                            dir="rtl"
                            className="font-arabic text-2xl sm:text-3xl md:text-4xl text-foreground font-normal leading-[2.6] sm:leading-[2.8] select-text text-center break-normal"
                            style={{ wordBreak: 'normal', overflowWrap: 'normal', letterSpacing: 'normal' }}
                          >
                            {currentAyahTokens.map((token, wIdx) => {
                              const wordVerification = evaluationResult?.wordVerifications?.find(
                                (w) => w.word_index === wIdx && w.ayah_number === currentAyah.numberInSurah
                              );
                              const liveWord = liveRecitationEvaluation?.wordVerifications?.find(
                                (w) => w.word_index === wIdx && w.ayah_number === currentAyah.numberInSurah
                              );
                              const showRedHighlights = !isMemorizationMode || isAyahRevealedForReview || revealedCorrectionForCurrentAyah;
                              const isWordError =
                                (showRedHighlights && wordVerification?.status === 'error') ||
                                (!isMemorizationMode && isRecording && liveWord?.status === 'error');
                              const isWordLiveCorrect =
                                wordVerification?.status === 'correct' ||
                                (!isMemorizationMode && isRecording && liveWord?.status === 'correct');
                              const mistake = wordVerification?.mistake || liveWord?.mistake;

                              if (isWordError) {
                                return (
                                  <React.Fragment key={wIdx}>
                                    <span
                                      onClick={() => {
                                        if (mistake) {
                                          setSelectedWordMistake(mistake);
                                        }
                                      }}
                                      className="inline-block mx-1 my-1 px-2 py-0.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 font-extrabold border border-red-200 dark:border-red-800 underline decoration-red-500 decoration-2 cursor-pointer shadow-xs hover:bg-red-100/90 dark:hover:bg-red-900/60 transition-all align-baseline"
                                      title="Khalad: Riix si aad u aragto sixitaanka"
                                    >
                                      {token.rawText}
                                      {mistake && (
                                        <span className="block text-[10px] font-sans font-bold text-red-600 dark:text-red-400 -mt-1 leading-tight tracking-tight">
                                          {mistake.category === 'xarakada' && mistake.harakah_expected
                                            ? `[${mistake.harakah_expected} saxda ah]`
                                            : mistake.category === 'makhaarijta' && mistake.specific_letter
                                            ? `[${mistake.specific_letter} saxda ah]`
                                            : `[Sax: ${token.rawText}]`}
                                        </span>
                                      )}
                                    </span>{' '}
                                  </React.Fragment>
                                );
                              }

                              if (isWordLiveCorrect) {
                                return (
                                  <React.Fragment key={wIdx}>
                                    <span
                                      className="inline-block mx-1 my-1 px-2 py-0.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 shadow-xs transition-all align-baseline"
                                      title="Si sax ah ayaa loo akhriyay (Correctly Recited)"
                                    >
                                      {token.rawText}
                                    </span>{' '}
                                  </React.Fragment>
                                );
                              }

                              if (wordVerification?.status === 'uncertain' && showRedHighlights) {
                                return (
                                  <React.Fragment key={wIdx}>
                                    <span
                                      className="inline-block mx-1 my-1 px-1.5 py-0.5 rounded-lg bg-amber-50/80 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 transition-all align-baseline"
                                      title="Lama xaqiijin"
                                    >
                                      {token.rawText}
                                    </span>{' '}
                                  </React.Fragment>
                                );
                              }

                              const isUnreachedInMemorization =
                                isMemorizationMode && isRecording && !liveWord && !wordVerification;

                              return (
                                <React.Fragment key={wIdx}>
                                  <span
                                    className={`inline hover:text-blue-700 dark:hover:text-blue-300 transition-all ${
                                      isUnreachedInMemorization ? 'opacity-35 select-none' : ''
                                    }`}
                                  >
                                    {token.rawText}
                                  </span>{' '}
                                </React.Fragment>
                              );
                            })}

                            {/* Verse Number Sign */}
                            <span className="font-arabic text-blue-600 dark:text-blue-400 font-bold inline-block mx-2 text-2xl sm:text-3xl align-middle">
                              ۝{currentAyah.numberInSurah}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dual Translations (Somali & English) — Hidden in memorization mode to prevent clues */}
                  {showTranslations && !isMemorizationMode && (
                    <div className="space-y-2 pt-4 border-t border-border/60 text-xs">
                      {currentAyah.translationSo && (
                        <div className="text-muted-foreground leading-relaxed">
                          <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5">[Soomaali]:</span>
                          <span>{currentAyah.translationSo}</span>
                        </div>
                      )}
                      {currentAyah.translationEn && (
                        <div className="text-foreground/80 leading-relaxed font-sans">
                          <span className="font-bold text-slate-500 mr-1.5">[English]:</span>
                          <span>{currentAyah.translationEn}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* =================================================================== */}
              {/* CONTROLS BELOW THE AYAH                                             */}
              {/* =================================================================== */}
              <div className="pt-4 border-t border-border space-y-3.5 sm:space-y-4">
                {/* 1. Ayah Progress Indicator & Navigation Controls */}
                <div className="flex items-center justify-between gap-2 w-full">
                  {/* Previous Ayah Button */}
                  <button
                    type="button"
                    onClick={handlePrevAyahInPassage}
                    disabled={currentAyahIndex <= 0 || passageFlowState === 'recitingAyah' || isRecording || isReviewing}
                    className="px-2.5 sm:px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-2xl border border-border text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 hover:bg-muted/60 disabled:opacity-30 cursor-pointer transition-colors shrink-0 active:scale-95"
                    title="Aayaddii Hore"
                  >
                    <SkipBack className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="hidden sm:inline">Aayaddii Hore</span>
                  </button>

                  {/* Centered Ayah Progress Indicator: e.g. "Aayadda 1 ee 2" */}
                  <div className="flex flex-col items-center justify-center text-center px-1 sm:px-3 min-w-0 flex-1">
                    <div className="px-3.5 sm:px-5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/25 shadow-xs inline-flex items-center justify-center max-w-full">
                      <span className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300 tracking-tight whitespace-nowrap">
                        Aayadda {currentAyahIndex + 1} ee {passageVerses.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap hidden sm:inline">
                      Suuradda {selectedSurah.name} • Aayadda {currentAyah.numberInSurah}
                    </span>
                  </div>

                  {/* Next Ayah Button */}
                  <button
                    type="button"
                    onClick={handleNextAyahInPassage}
                    disabled={isMemorizationMode || true}
                    className={`px-2.5 sm:px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-95 ${
                      !isMemorizationMode && currentAyahIndex < passageVerses.length - 1
                        ? 'border-border text-foreground hover:bg-muted/60'
                        : 'border-border/50 text-muted-foreground/40 cursor-not-allowed opacity-40'
                    }`}
                    title={
                      isMemorizationMode
                        ? 'Aayadaha dambe waa qarsan yihiin ilaa laga dhammeeyo aayaddan'
                        : 'Aayadaha dambe waa qarsan yihiin ilaa laga dhammeeyo aayaddan'
                    }
                  >
                    <span className="hidden sm:inline">Aayadda Xigta</span>
                    {isMemorizationMode ? (
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <SkipForward className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* 2. Audio Listen Controls (Qari Reference + Recorded Voice Replay) */}
                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                  <button
                    type="button"
                    onClick={handlePlayQariAudio}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 min-h-[44px] rounded-2xl bg-muted/60 hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-2 border border-border transition-all cursor-pointer"
                  >
                    {isPlayingQari ? (
                      <>
                        <Pause className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Hakad Geli</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">Dhageyso Qaariga ({activeQari.name.split(' ')[0]})</span>
                      </>
                    )}
                  </button>

                  {userAudioBlobUrl && (
                    <button
                      type="button"
                      onClick={handlePlayUserAudio}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-2xl bg-card hover:bg-muted/70 text-xs font-bold text-blue-600 border border-blue-500/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      title="Dhageyso codkaagii aad duubtay"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isPlayingUser ? 'Hakad' : 'Dhageyso Codkaaga'}</span>
                    </button>
                  )}
                </div>

                {/* 3. Recite with Microphone Button & Recitation Actions */}
                <div className="w-full">
                  {!isRecording ? (
                    <div className="flex flex-col gap-2.5 w-full">
                      {/* Bilow Akhriska: Start recording for current Ayah */}
                      <button
                        type="button"
                        onClick={isMemorizationMode ? handleStartMemorizationSession : startRecording}
                        disabled={isReviewing || passageFlowState === 'advancingAyah'}
                        className="w-full px-5 py-3 min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-700/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                      >
                        <Mic className="w-5 h-5 shrink-0" />
                        <span className="truncate">
                          {collectedAyahAttemptsRef.current[currentAyahIndex]
                            ? `Dib u Bilow (Aayadda ${currentAyah.numberInSurah})`
                            : `Bilow Akhriska (Aayadda ${currentAyah.numberInSurah})`}
                        </span>
                      </button>

                      {/* Secondary actions container (wraps neatly on small screens) */}
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        {/* Ku celi Aayadda */}
                        {(collectedAyahAttemptsRef.current[currentAyahIndex] || userAudioBlobUrl || memorizationState === 'mistake_review') && (
                          <button
                            type="button"
                            onClick={handleRetryCurrentAyah}
                            disabled={isReviewing || passageFlowState === 'advancingAyah'}
                            className="flex-1 min-w-[130px] px-3.5 py-2.5 min-h-[44px] rounded-2xl bg-muted border border-border text-foreground hover:bg-muted/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Ku celi Aayadda</span>
                          </button>
                        )}

                        {/* Eeg / Qari Khaladka (in mistake review) */}
                        {isMemorizationMode && memorizationState === 'mistake_review' && (
                          <button
                            type="button"
                            onClick={handleToggleViewMistake}
                            className={`flex-1 min-w-[130px] px-3.5 py-2.5 min-h-[44px] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              revealedCorrectionForCurrentAyah
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            <span>{revealedCorrectionForCurrentAyah ? 'Qari Khaladka' : 'Eeg Khaladka'}</span>
                          </button>
                        )}

                        {/* Advance to next or complete if stopped recording before advancing */}
                        {(userAudioBlobUrl || collectedAyahAttemptsRef.current[currentAyahIndex]) && (
                          <button
                            type="button"
                            onClick={handleFinishAyahAndAdvance}
                            disabled={isReviewing || passageFlowState === 'advancingAyah'}
                            className="w-full sm:flex-1 min-w-[160px] px-4 py-2.5 min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-400/30 active:scale-[0.99]"
                          >
                            {currentAyahIndex < passageVerses.length - 1 ? (
                              <>
                                <span>U Gudub Aayadda Xigta</span>
                                <ChevronRight className="w-4 h-4 shrink-0" />
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-blue-200 shrink-0" />
                                <span>Dhammee Akhriska</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 w-full">
                      {/* Primary Finish & Advance / Finalize Button (Full Width on Mobile) */}
                      {currentAyahIndex < passageVerses.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleFinishAyahAndAdvance}
                          className="w-full px-5 py-3 min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-400/30 active:scale-[0.99]"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>Dhammee Aayadda {currentAyah.numberInSurah} ({recordingSeconds}s) →</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFinishAyahAndAdvance}
                          className="w-full px-6 py-3 min-h-[48px] rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-700/25 flex items-center justify-center gap-2 animate-pulse transition-all cursor-pointer border border-rose-400/30 active:scale-[0.99]"
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>Dhammee Akhriska ({recordingSeconds}s)</span>
                        </button>
                      )}

                      {/* 3 Secondary Controls in a balanced row on phone */}
                      <div className="grid grid-cols-3 gap-2 w-full">
                        {/* Pause / Resume Controls: Sii wad / Haki */}
                        <button
                          type="button"
                          onClick={isRecordingPaused ? handleResumeRecording : handlePauseRecording}
                          className="px-2 sm:px-3 py-2.5 min-h-[44px] rounded-2xl bg-card border border-border hover:bg-muted text-[11px] sm:text-xs font-bold text-foreground flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          {isRecordingPaused ? (
                            <>
                              <Play className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">Sii wad</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate">Haki</span>
                            </>
                          )}
                        </button>

                        {/* Ku celi Aayadda */}
                        <button
                          type="button"
                          onClick={handleRetryCurrentAyah}
                          className="px-2 sm:px-3 py-2.5 min-h-[44px] rounded-2xl bg-muted border border-border hover:bg-muted/80 text-[11px] sm:text-xs font-semibold text-foreground flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Dib uga bilow aayaddan"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Ku celi Aayadda</span>
                        </button>

                        {/* Jooji */}
                        <button
                          type="button"
                          onClick={isMemorizationMode ? handlePauseOrEndSession : handleStopRecordingOnly}
                          className="px-2 sm:px-3 py-2.5 min-h-[44px] rounded-2xl bg-card border border-border hover:bg-muted text-[11px] sm:text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <MicOff className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Jooji</span>
                        </button>
                      </div>

                      {/* Animated Glowing Audio Waveform Bars (pulse animation) */}
                      <div className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <span className="w-1.5 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-8 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-6 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        <span className="w-1.5 h-10 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                        <span className="w-1.5 h-5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                        <span className="w-1.5 h-7 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '350ms' }} />
                        <span className="w-1.5 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Permission & Recording Status Notice */}
                {isRecording && (
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                      <span>Makarafoonku wuu duubayaa... Akhri aayadda adigoo cod cad ku hadlaya.</span>
                    </div>
                    <span className="font-mono font-bold">{recordingSeconds}s</span>
                  </div>
                )}

                {micPermissionError && (
                  <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{micPermissionError}</span>
                  </div>
                )}

                {/* AI Teacher insight box ("Jawaabta Macallin AI") with blue headings and actionable retry options */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/25 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300">
                          Jawaabta Macallin AI
                        </h4>
                        <span className="text-[10px] text-muted-foreground">
                          Falanqeynta tooska ah ee Tajweed-ka & Akhriska
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Macallin AI
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                    {evaluationResult?.status === 'errors_detected'
                      ? 'Waxaan dhuuxnay akhriskaaga aayaddan waxaana la ogaaday khaladaad ku jira xarfaha ama xarakadaha. Fadlan ku celi si aad u saxdo ku dhawaaqidda saxda ah.'
                      : evaluationResult?.status === 'passed'
                      ? 'Masha Allah! Akhriskaagu waa sax oo waafaqsan axkaamta Tajweed-ka iyo makhariijka xarfaha.'
                      : 'Macallin AI wuxuu si toos ah u falanqeynayaa akhriskaaga aayaddan. Akhri adigoo cod cad ku hadlaya.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
                    <button
                      type="button"
                      onClick={handleRetryCurrentAyah}
                      className="px-3.5 py-2 min-h-[38px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ku celi aayaddan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCompletedAyahIndices([]);
                        setCurrentAyahIndex(0);
                        setMemorizationState('idle');
                        setEvaluationResult(null);
                        setSessionMistakes([]);
                      }}
                      className="px-3.5 py-2 min-h-[38px] rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-border transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ku celi Casharka</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  Aayadaha lama helin
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {versesError || "Lama soo dejin karo aayadaha suuraddan. Fadlan hubi khadkaaga internet-ka ama isku day mar kale."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadSurahVerses(selectedSurahNumber)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Isku day mar kale</span>
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* 30-SECOND FINAL REVIEW CARD ("Akhriska waa la hubinayaa")          */}
          {/* ================================================================= */}
          {isReviewing && (
            <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-blue-500/40 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center mx-auto">
                <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  Hubinta Akhriska & Tajweed-ka
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-foreground">
                  Akhriska waa la hubinayaa
                </h3>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Akhriskaaga AI ayaa hubinaya
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Macallinku wuxuu si qoto-dheer u baarayaa xarfaha, xarakadaha, Tajweed-ka iyo tartanka erayada...
                </p>
              </div>

              {/* Countdown Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>Waqtiga hubinta:</span>
                  <span className="font-mono text-blue-600 text-sm font-black">
                    {reviewCountdown} ilbiriqsi
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden border border-border">
                  <div
                    className="h-full bg-blue-600 transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, ((30 - reviewCountdown) / 30) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 5 Assessment Stages Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-2xl mx-auto pt-2 text-[11px]">
                <div
                  className={`p-2 rounded-xl border text-center transition-all ${
                    reviewStep === 1
                      ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                      : reviewStep > 1
                      ? 'bg-muted/40 border-border text-foreground font-medium'
                      : 'opacity-40 border-border text-muted-foreground'
                  }`}
                >
                  <span>1. Makhariijka</span>
                </div>
                <div
                  className={`p-2 rounded-xl border text-center transition-all ${
                    reviewStep === 2
                      ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                      : reviewStep > 2
                      ? 'bg-muted/40 border-border text-foreground font-medium'
                      : 'opacity-40 border-border text-muted-foreground'
                  }`}
                >
                  <span>2. Xarakadaha</span>
                </div>
                <div
                  className={`p-2 rounded-xl border text-center transition-all ${
                    reviewStep === 3
                      ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                      : reviewStep > 3
                      ? 'bg-muted/40 border-border text-foreground font-medium'
                      : 'opacity-40 border-border text-muted-foreground'
                  }`}
                >
                  <span>3. Madd & Shaddah</span>
                </div>
                <div
                  className={`p-2 rounded-xl border text-center transition-all ${
                    reviewStep === 4
                      ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                      : reviewStep > 4
                      ? 'bg-muted/40 border-border text-foreground font-medium'
                      : 'opacity-40 border-border text-muted-foreground'
                  }`}
                >
                  <span>4. Tajweed</span>
                </div>
                <div
                  className={`col-span-2 sm:col-span-1 p-2 rounded-xl border text-center transition-all ${
                    reviewStep === 5
                      ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                      : 'opacity-40 border-border text-muted-foreground'
                  }`}
                >
                  <span>5. Tartanka</span>
                </div>
              </div>

              {/* Status note if waiting past countdown */}
              {reviewCountdown <= 0 && !pendingEvaluationResult && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-pulse max-w-md mx-auto">
                  Qiimeynta AI ayaa la dhammaystirayaa, fadlan sug wax yar...
                </div>
              )}

              {/* Review Actions: Only Cancel button (Result check button completely removed during countdown) */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelReview}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Ka noqo (Cancel)</span>
                </button>
              </div>
            </div>
          )}

          {/* Review Error Card with Retry Button */}
          {reviewError && !isReviewing && (
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-700 dark:text-red-300">
                  Khalad ayaa dhacay inta lagu guda jiray hubinta akhriska
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {reviewError}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setReviewError(null);
                    startRecording();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mar kale isku day</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewError(null)}
                  className="px-3.5 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Xir
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* FINAL RESULTS SCREEN & DETAILED ERROR TABLE                       */}
          {/* ================================================================= */}
          {!isReviewing && evaluationResult && (
            <div
              className={`p-5 sm:p-7 rounded-3xl border shadow-md space-y-6 animate-in fade-in duration-200 ${
                evaluationResult.status === 'passed'
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-950 dark:text-blue-100'
                  : evaluationResult.status === 'errors_detected'
                  ? 'bg-card border-red-500/40 text-foreground'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100'
              }`}
            >
              {/* Header Status Banner */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    evaluationResult.status === 'passed'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20'
                      : evaluationResult.status === 'errors_detected'
                      ? 'bg-red-600 text-white shadow-md shadow-red-700/20'
                      : 'bg-amber-600 text-white shadow-md shadow-amber-700/20'
                  }`}
                >
                  {evaluationResult.status === 'passed' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : evaluationResult.status === 'errors_detected' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                      {evaluationResult.status === 'passed'
                        ? 'Xaqiijinta Guusha (Passed)'
                        : evaluationResult.status === 'errors_detected'
                        ? 'Khaladaadka La Helay (Errors Detected)'
                        : 'Xaaladda Akhriska (Status)'}
                    </span>
                    <h2 className="text-xs sm:text-sm font-black text-foreground">
                      Natiijada Akhriskaaga Qur’aanka
                    </h2>
                  </div>

                  {evaluationResult.status === 'errors_detected' && (
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-snug">
                      Waxaan helnay khaladaad akhriskaaga ku jira. Hoos ka eeg meelaha cas iyo sida loo saxo.
                    </p>
                  )}

                  {/* Exact Required Somali Feedback Strings */}
                  <h3 className="text-sm sm:text-base font-bold leading-snug">
                    {evaluationResult.status === 'errors_detected'
                      ? 'Fadlan ku laabo meelaha casaanka ah, sax khaladaadka, kuna celceli xifdinta. Dadaalkaagu waa muhiim.'
                      : evaluationResult.status === 'passed'
                      ? 'Mahadsanid, si wanaagsan ayaad uga baxday akhriska Qur’aanka. Jazaakallaahu khayran.'
                      : 'Lama xaqiijin'}
                  </h3>

                  {evaluationResult.status === 'unverified' && (
                    <p className="text-xs opacity-90">
                      Akhriska si buuxda looma xaqiijin. Fadlan mar kale isku day ama macallin u xaqiiji.
                    </p>
                  )}
                </div>
              </div>

              {/* Zero Errors Confirmed Message */}
              {evaluationResult.status === 'passed' && (
                <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs font-semibold text-blue-950 dark:text-blue-100">
                    Wax khaladaad ah oo la ogaaday kuma jiraan aayadaha la akhriyay. Dhammaan xarfaha, xarakadaha iyo Tajweed-ka si sax ah ayaa loo akhriyay.
                  </p>
                </div>
              )}

              {/* Overall Passage Assessment Summary (PART 1 D) */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Xogta Guud ee Akhriska (Passage Summary): Suuradda {selectedSurah.englishName}</span>
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    Aayadaha {passageStartAyah} – {passageEndAyah}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
                  {/* Total Ayahs in passage */}
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Wadarta Aayadaha
                    </span>
                    <span className="text-base sm:text-lg font-black text-foreground">
                      {consolidatedPassageResult?.totalAyahsCount || passageVerses.length}
                    </span>
                  </div>

                  {/* Passed Ayahs without errors */}
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-0.5">
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-bold block">
                      Aayadaha Saxda ah
                    </span>
                    <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">
                      {consolidatedPassageResult?.passedAyahsCount ?? (evaluationResult.status === 'passed' ? passageVerses.length : 0)}
                    </span>
                  </div>

                  {/* Ayahs with mistakes */}
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-0.5">
                    <span className="text-[10px] text-red-700 dark:text-red-300 uppercase font-bold block">
                      Khaladaadka
                    </span>
                    <span className="text-base sm:text-lg font-black text-red-600 dark:text-red-400">
                      {evaluationResult.mistakes.length}
                    </span>
                  </div>

                  {/* Unverified Ayahs */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-0.5">
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-bold block">
                      Lama xaqiijin
                    </span>
                    <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                      {consolidatedPassageResult?.unverifiedAyahsCount ?? (evaluationResult.status === 'unverified' ? passageVerses.length : 0)}
                    </span>
                  </div>

                  {/* Overall Accuracy % */}
                  <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-blue-600 text-white space-y-0.5 shadow-xs">
                    <span className="text-[10px] uppercase font-bold block text-blue-100">
                      Saxnaanta (Accuracy)
                    </span>
                    <span className="text-base sm:text-lg font-black">
                      {consolidatedPassageResult?.overallAccuracy ?? (evaluationResult as any).accuracy_percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Personalized Lesson Revision Recommendations (Talooyinka Dib-u-eegista & Xifdinta) */}
              {(() => {
                const overallAcc = consolidatedPassageResult?.overallAccuracy ?? (evaluationResult as any).accuracy_percentage ?? 100;
                const mistakeAyahs = Array.from(new Set(evaluationResult.mistakes.map((m) => m.ayah_number).filter(Boolean)));
                const passedCount = consolidatedPassageResult?.passedAyahsCount ?? (evaluationResult.status === 'passed' ? passageVerses.length : 0);
                const totalAyahs = consolidatedPassageResult?.totalAyahsCount || passageVerses.length;

                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3.5 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-foreground">
                          Talooyinka Macallinka ee Dib-u-eegista (Revision & Retention Guidance)
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                        overallAcc >= 90
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                          : overallAcc >= 70
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30'
                      }`}>
                        {overallAcc >= 90
                          ? 'Heerka: Mumtaaz (Aad u Sarreeya)'
                          : overallAcc >= 70
                          ? 'Heerka: Jayyid (Wanaagsan)'
                          : 'Heerka: U Baahan Murajaco'}
                      </span>
                    </div>

                    {/* Pedagogical Guidance Description */}
                    <div className="text-xs text-foreground/90 space-y-2 leading-relaxed">
                      {overallAcc >= 90 ? (
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Masha Allah! Waxaad si heersare ah u xifdisay dhammaan aayadaha casharkan ({passedCount}/{totalAyahs} sax ah).</span>
                          </p>
                          <p className="text-[11px] opacity-90">
                            <strong>Talo Macallin:</strong> Akhriskaaga Qur'aanka ku celi hal mar maalintii si aad u adkayso xifdigaaga qalbiga, ka dibna u gudub casharka xiga ee berri.
                          </p>
                        </div>
                      ) : overallAcc >= 70 ? (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Horumar wanaagsan! Aayadaha intiisa badan waa sax ({passedCount}/{totalAyahs}), laakiin waxaa jira dhowr khaladaad ah.</span>
                          </p>
                          <p className="text-[11px] opacity-90">
                            <strong>Talo Macallin:</strong> Dhageyso Qaariga Sheikh Sufi aayadaha khaladaadku ka dheceen{mistakeAyahs.length > 0 ? ` (Aayadaha: ${mistakeAyahs.join(', ')})` : ''}, kuna celi 3 jeer ka hor inta aadan u gudbin aayado cusub.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-200 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <RotateCcw className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Casharkani wuxuu u baahan yahay celcelin iyo dib-u-eegis dheeraad ah (Murajaco).</span>
                          </p>
                          <p className="text-[11px] opacity-90">
                            <strong>Talo Macallin:</strong> Fur 'Habka Dib-u-eegista (Review Mode)' si aad qoraalka u eegto oo aad si buuxda u barato ereyada kugu adkaaday, ka dibna dib ugu soo noqo Habka Xifdinta si aad maankaaga uga akhrido.
                          </p>
                        </div>
                      )}

                      {mistakeAyahs.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap pt-1">
                          <span className="font-bold text-foreground">Aayadaha u baahan dib-u-eegista:</span>
                          {mistakeAyahs.map((aNum) => (
                            <span
                              key={aNum}
                              className="px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-bold"
                            >
                              Aayadda {aNum}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Buttons for Revision */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
                      {mistakeAyahs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const firstA = mistakeAyahs[0];
                            handleRangeChange(firstA, firstA);
                            setRecitationMode('review');
                            setIsAyahRevealedForReview(true);
                          }}
                          className="px-3.5 py-2 min-h-[38px] rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Ku celceli Aayadaha Khaladaadka leh (Review Mode)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setRecitationMode('review');
                          setIsAyahRevealedForReview(true);
                          setEvaluationResult(null);
                        }}
                        className="px-3.5 py-2 min-h-[38px] rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Fur Habka Dib-u-eegista (Eeg Qoraalka)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Complete Assessed Passage Text with Green, Red, and Neutral Styling */}
              <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Qoraalka Qur'aanka ee la Qiimeeyay (Assessed Passage):
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    Suuradda {selectedSurah.name} ({selectedSurah.number})
                  </span>
                </div>
                {passageVerses.length > 1 ? (
                  <div
                    dir="rtl"
                    className="font-arabic text-xl sm:text-2xl text-foreground font-normal leading-[2.6] sm:leading-[2.8] select-text text-center break-normal"
                    style={{ wordBreak: 'normal', overflowWrap: 'normal', letterSpacing: 'normal' }}
                  >
                    {passageVerses.map((v) => {
                      const tokens = tokenizeAyahWithTajweed(v.text);
                      const isUnverifiedAyah =
                        consolidatedPassageResult &&
                        (consolidatedPassageResult.unverifiedAyahsCount || 0) > 0 &&
                        !evaluationResult.wordVerifications?.some((w) => w.ayah_number === v.numberInSurah);

                      return (
                        <span key={v.numberInSurah} className="inline">
                          {tokens.map((token, wIdx) => {
                            const wv = evaluationResult.wordVerifications?.find(
                              (w) => w.word_index === wIdx && w.ayah_number === v.numberInSurah
                            );
                            const isErr = wv?.status === 'error';
                            const isCorrect = wv?.status === 'correct';

                            return (
                              <React.Fragment key={wIdx}>
                                <span
                                  className={
                                    isErr
                                      ? 'inline-block mx-1 my-1 px-2 py-0.5 rounded-xl text-red-600 dark:text-red-400 font-extrabold bg-red-100/90 dark:bg-red-900/50 border border-red-500/40 underline decoration-red-500 decoration-2 cursor-pointer shadow-xs'
                                      : isCorrect
                                      ? 'inline-block mx-1 my-1 px-1.5 py-0.5 rounded-lg text-blue-700 dark:text-blue-300 font-bold bg-blue-500/15 border border-blue-500/30'
                                      : isUnverifiedAyah
                                      ? 'inline-block mx-1 my-1 text-muted-foreground/60'
                                      : 'inline-block mx-1 my-1 text-foreground opacity-90'
                                  }
                                  title={
                                    isErr
                                      ? 'Khalad la xaqiijiyay'
                                      : isCorrect
                                      ? 'Si sax ah ayaa loo akhriyay'
                                      : isUnverifiedAyah
                                      ? 'Lama xaqiijin'
                                      : undefined
                                  }
                                  onClick={() => {
                                    if (wv?.mistake) setSelectedWordMistake(wv.mistake);
                                  }}
                                >
                                  {token.rawText}
                                </span>{' '}
                              </React.Fragment>
                            );
                          })}
                          <span className="font-arabic text-blue-600 dark:text-blue-400 font-bold inline-block mx-2 text-xl align-middle">
                            ۝{v.numberInSurah}
                          </span>
                          {isUnverifiedAyah && (
                            <span className="inline-block mx-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 align-middle">
                              Lama xaqiijin
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    dir="rtl"
                    className="font-arabic text-xl sm:text-2xl md:text-3xl text-foreground font-normal leading-[2.6] select-text text-center break-normal"
                    style={{ wordBreak: 'normal', overflowWrap: 'normal', letterSpacing: 'normal' }}
                  >
                    {currentAyahTokens.map((token, wIdx) => {
                      const wv = evaluationResult.wordVerifications?.find(
                        (w) => w.word_index === wIdx && w.ayah_number === currentAyah.numberInSurah
                      );
                      const isErr = wv?.status === 'error';
                      const isCorrect = wv?.status === 'correct';

                      return (
                        <React.Fragment key={wIdx}>
                          <span
                            className={
                              isErr
                                ? 'inline-block mx-1 my-1 px-2 py-0.5 rounded-xl text-red-600 dark:text-red-400 font-extrabold bg-red-100/90 dark:bg-red-900/50 border border-red-500/40 underline decoration-red-500 decoration-2 cursor-pointer shadow-xs'
                                : isCorrect
                                ? 'inline-block mx-1 my-1 px-1.5 py-0.5 rounded-lg text-blue-700 dark:text-blue-300 font-bold bg-blue-500/15 border border-blue-500/30'
                                : 'inline-block mx-1 my-1 text-foreground opacity-90'
                            }
                            title={isErr ? 'Khalad la xaqiijiyay' : isCorrect ? 'Si sax ah ayaa loo akhriyay' : 'Lama xaqiijin'}
                            onClick={() => {
                              if (wv?.mistake) setSelectedWordMistake(wv.mistake);
                            }}
                          >
                            {token.rawText}
                          </span>{' '}
                        </React.Fragment>
                      );
                    })}
                    <span className="font-arabic text-blue-600 dark:text-blue-400 font-bold inline-block mx-2 text-xl sm:text-2xl align-middle">
                      ۝{currentAyah.numberInSurah}
                    </span>
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] pt-2 text-muted-foreground border-t border-border/50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Cagaar: Si sax ah loo akhriyay</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Cas: Khalad la xaqiijiyay</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                    <span>Caadi: Lama xaqiijin</span>
                  </span>
                </div>
              </div>

              {/* ============================================================= */}
              {/* DETAILED TABLE: 5 REQUIRED COLUMNS                            */}
              {/* ============================================================= */}
              {evaluationResult.mistakes.length > 0 && (
                isMemorizationMode && !revealedCorrectionForCurrentAyah ? (
                  <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground block">
                        Waxaa la ogaaday {evaluationResult.mistakes.length} khaladaad xagga akhriska ah
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Guji "Eeg Khaladka" si aad u aragto warbixinta saxda ah iyo sixitaanka aayaddan.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleViewMistake}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Eeg Khaladka</span>
                    </button>
                  </div>
                ) : (
                <div id="macallin-error-report-table" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground block">
                      Warbixinta Faahfaahsan ee Khaladaadka (Detailed Recitation Error Report):
                    </span>
                    <span className="text-[11px] font-bold text-red-600">
                      {evaluationResult.mistakes.length} khaladaad la xaqiijiyay
                    </span>
                  </div>

                  {/* Desktop & Tablet View: Full 5-Column Table */}
                  <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/70 border-b border-border text-foreground font-bold text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-3 sm:px-4 font-bold">Meesha khaladku yaallo</th>
                          <th className="py-3 px-3 sm:px-4 font-bold">Nooca khaladka</th>
                          <th className="py-3 px-3 sm:px-4 font-bold text-center">Akhriska la maqlay</th>
                          <th className="py-3 px-3 sm:px-4 font-bold text-center">Akhriska saxda ah</th>
                          <th className="py-3 px-3 sm:px-4 font-bold">Sharaxaad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {evaluationResult.mistakes.map((m, idx) => (
                          <tr
                            key={idx}
                            onClick={() => setSelectedWordMistake(m)}
                            className="hover:bg-muted/40 transition-colors cursor-pointer"
                          >
                            {/* 1. Meesha khaladku yaallo */}
                            <td className="py-3 px-3 sm:px-4 font-semibold text-foreground whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                <span>{m.location_text || `Aayadda ${m.ayah_number}`}</span>
                              </div>
                            </td>

                            {/* 2. Nooca khaladka (4 Categories) */}
                            <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  m.category === 'xarakada'
                                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                                    : m.category === 'makhaarijta'
                                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                                    : m.category === 'tajwiidka'
                                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                }`}
                              >
                                {m.category_label_so || (
                                  m.category === 'xarakada'
                                    ? 'Xarakada (Harakat)'
                                    : m.category === 'makhaarijta'
                                    ? 'Xarfaha iyo makhaarijta'
                                    : m.category === 'tajwiidka'
                                    ? 'Tajwiidka'
                                    : 'Erayada iyo aayadaha'
                                )}
                              </span>
                            </td>

                            {/* 3. Akhriska la maqlay */}
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <span
                                dir="rtl"
                                className="font-arabic text-sm text-red-600 dark:text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 inline-block"
                              >
                                {m.recited_word || '(Laga booday)'}
                              </span>
                            </td>

                            {/* 4. Akhriska saxda ah */}
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <span
                                dir="rtl"
                                className="font-arabic text-base text-blue-700 dark:text-blue-300 font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 inline-block"
                              >
                                {m.expected_word}
                              </span>
                            </td>

                            {/* 5. Sharaxaad */}
                            <td className="py-3 px-3 sm:px-4 text-foreground/90 leading-relaxed max-w-xs sm:max-w-md">
                              <p className="font-medium text-xs">{m.explanation_so || m.message}</p>
                              {m.correction_tip && (
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                                  Talo: {m.correction_tip}
                                </p>
                              )}
                              {/* Audio Replay Buttons on each row */}
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayQariAudio();
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-bold"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Dhageyso Qaariga</span>
                                </button>
                                {userAudioBlobUrl && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayUserAudio();
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] text-foreground hover:underline font-bold"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Dhageyso Codkaaga</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View: Clean, Readable Vertical Cards (< 768px) with Scrollable Container */}
                  <div className="block md:hidden space-y-3 max-h-[520px] overflow-y-auto chat-scrollbar pr-1">
                    {evaluationResult.mistakes.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedWordMistake(m)}
                        className="p-4 rounded-2xl bg-card border border-border hover:border-red-500/40 shadow-xs space-y-3 cursor-pointer transition-all"
                      >
                        {/* Header: Location & Category */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                            <span>{m.location_text || `Aayadda ${m.ayah_number}`}</span>
                          </div>

                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              m.category === 'xarakada'
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                                : m.category === 'makhaarijta'
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                                : m.category === 'tajwiidka'
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {m.category_label_so || (
                              m.category === 'xarakada'
                                ? 'Xarakada (Harakat)'
                                : m.category === 'makhaarijta'
                                ? 'Xarfaha iyo makhaarijta'
                                : m.category === 'tajwiidka'
                                ? 'Tajwiidka'
                                : 'Erayada iyo aayadaha'
                            )}
                          </span>
                        </div>

                        {/* Recitation Comparison: La maqlay vs Saxda ah */}
                        <div className="grid grid-cols-2 gap-2 text-center pt-1">
                          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1">
                            <span className="text-[10px] text-red-700 dark:text-red-300 font-bold block">
                              La maqlay (Akhriskaaga)
                            </span>
                            <span
                              dir="rtl"
                              className="font-arabic text-base sm:text-lg text-red-600 dark:text-red-400 font-bold block"
                            >
                              {m.recited_word || '(Laga booday)'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                            <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold block">
                              Saxda ah (Qur'aanka)
                            </span>
                            <span
                              dir="rtl"
                              className="font-arabic text-base sm:text-lg text-blue-700 dark:text-blue-300 font-bold block"
                            >
                              {m.expected_word}
                            </span>
                          </div>
                        </div>

                        {/* Explanation & Tip */}
                        <div className="space-y-1 text-xs">
                          <p className="font-medium text-foreground/90 leading-relaxed">
                            {m.explanation_so || m.message}
                          </p>
                          {m.correction_tip && (
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                              Talo: {m.correction_tip}
                            </p>
                          )}
                        </div>

                        {/* Audio Replay Buttons on Mobile Card */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayQariAudio();
                            }}
                            className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Dhageyso Qaariga</span>
                          </button>
                          {userAudioBlobUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayUserAudio();
                              }}
                              className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Dhageyso Codkaaga</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handlePlayQariAudio}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-border bg-card text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 hover:bg-muted/60 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dib u Dhageyso Qaariga</span>
                    </button>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Dib u akhri meelaha casaanka ah</span>
                    </button>
                  </div>
                </div>
              )
            )}

              {/* Unverified Re-record Option */}
              {evaluationResult.status === 'unverified' && (
                <div className="p-4 rounded-2xl bg-background/90 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-foreground block">
                      Codkaaga si buuxda looma maqal.
                    </span>
                    <span className="text-muted-foreground">
                      Fadlan makarafoonka u dhowow oo si cad u akhri aayadda.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Isku day mar kale</span>
                  </button>
                </div>
              )}

              {/* Correction Screen Action Buttons (Part 1 D: Try Again, Practice Mistake Ayahs, Select New Surah/Range) */}
              <div className="pt-4 flex flex-col gap-3 border-t border-border/60">
                {/* Primary Post-Assessment Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-muted/30 p-2.5 rounded-2xl border border-border/70">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap w-full">
                    {/* Action 1: Try Again (Re-record same passage) */}
                    <button
                      type="button"
                      onClick={handleReRecord}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      title="Isku day mar kale (Re-record same passage)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Isku day mar kale (Try Again)</span>
                    </button>

                    {/* Action 2: Practice Specific Mistake Ayahs */}
                    {evaluationResult.mistakes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const firstMistakeAyah = evaluationResult.mistakes[0].ayah_number;
                          if (firstMistakeAyah) {
                            handleRangeChange(firstMistakeAyah, firstMistakeAyah);
                            setPassageDisplayView('verse_by_verse');
                          }
                          const el = document.getElementById('macallin-error-report-table');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        title="Baro aayadaha khaladaadka leh (Practice specific mistake ayahs)"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>Baro aayadaha khaladaadka leh</span>
                      </button>
                    )}

                    {/* Action 3: Select New Surah or Range */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSurahDropdownOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-card border border-border hover:bg-muted font-bold text-xs text-foreground flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      title="Dooro suurad ama aayado kale (Select new Surah or range)"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dooro suurad ama aayado kale</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Action Row with Exact Backwards-Compatible Test Selectors */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRevealedCorrectionForCurrentAyah(true);
                        const el = document.getElementById('macallin-error-report-table');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-red-600" />
                      <span>Dib u eeg Khaladaadka</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRepeatAyah}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ku celi Aayadda</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentAyahIndex(0);
                        setCompletedAyahIndices([]);
                        setEvaluationResult(null);
                        setPendingEvaluationResult(null);
                        setRevealedCorrectionForCurrentAyah(false);
                        setSessionMistakes([]);
                        startRecording();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ku celi Akhriska</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmResultOK}
                      className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs hover:opacity-95 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Dhammee</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResultOK}
                      className="hidden sm:inline-block px-4 py-2.5 min-h-[44px] rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* WORD PRONUNCIATION & CORRECTION POPOVER / MODAL                       */}
      {/* ===================================================================== */}
      {selectedWordMistake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <h4 className="text-sm font-bold text-foreground">
                  Sixitaanka Erayga (Word Pronunciation & Tajweed)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWordMistake(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Word in Large Arabic script */}
            <div className="text-center py-4 bg-muted/30 rounded-2xl border border-border">
              <span className="font-arabic text-3xl sm:text-4xl text-red-600 dark:text-red-400 font-bold block" dir="rtl">
                {selectedWordMistake.expected_word}
              </span>
              {selectedWordMistake.specific_letter && (
                <span className="text-xs font-semibold text-muted-foreground block mt-1.5">
                  Xarafka la saxayo:{' '}
                  <span className="font-arabic font-bold text-foreground text-base">
                    {selectedWordMistake.specific_letter}
                  </span>
                </span>
              )}
            </div>

            {/* Explanation & Category detail */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Nooca Khaladka:</span>
                <span className="font-semibold text-foreground">
                  {selectedWordMistake.category_label_so || selectedWordMistake.category}
                </span>
              </div>
              {selectedWordMistake.makhraj_category && (
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-bold text-muted-foreground">Makhrajka:</span>
                  <span className="font-semibold text-foreground">{selectedWordMistake.makhraj_category}</span>
                </div>
              )}
              {selectedWordMistake.tajweed_rule && (
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <span className="font-bold text-muted-foreground">Xeerka Tajweed-ka:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedWordMistake.tajweed_rule}</span>
                </div>
              )}
              {selectedWordMistake.harakah_expected && (
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-950 dark:text-blue-200 flex items-center justify-between">
                  <span className="font-bold">Xarakada:</span>
                  <span>{selectedWordMistake.harakah_expected} (La rabay) vs {selectedWordMistake.harakah_detected}</span>
                </div>
              )}
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-950 dark:text-red-200 space-y-1">
                <span className="font-bold block text-[11px] text-red-700 dark:text-red-300">Sharaxaadda Sixitaanka:</span>
                <p className="leading-relaxed">{selectedWordMistake.explanation_so || selectedWordMistake.message}</p>
              </div>
              {selectedWordMistake.correction_tip && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-950 dark:text-blue-200 space-y-1">
                  <span className="font-bold block text-[11px] text-blue-700 dark:text-blue-300">Talo Ku Dhawaaqid (Tip):</span>
                  <p className="leading-relaxed">{selectedWordMistake.correction_tip}</p>
                </div>
              )}
            </div>

            {/* Audio Playback Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handlePlayQariAudio}
                className="w-full sm:flex-1 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dhageyso Qaariga ({activeQari.name.split(' ')[0]})</span>
              </button>
              {userAudioBlobUrl && (
                <button
                  type="button"
                  onClick={handlePlayUserAudio}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Codkaaga</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedWordMistake(null)}
                className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
              >
                Xir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: CASHARKA BERRI (TOMORROW'S SCHEDULED LESSON)                  */}
      {/* ===================================================================== */}
      {subTab === 'tomorrow' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  Qorshaha Barashada (Upcoming Schedule)
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Casharka Berri
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Casharka maalinta xigta waxaa si toos ah loogu diyaariyaa heerkaaga xifdiga ee dhabta ah.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {tomorrowLesson ? (
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Suuradda & Aayadaha Loo Qoondeeyay
                    </span>
                    <h4 className="text-lg font-extrabold text-foreground mt-0.5">
                      Surah {tomorrowLesson.surah_name}{' '}
                      <span className="font-arabic text-blue-600 font-bold ml-1">
                        ({tomorrowLesson.surah_arabic_name})
                      </span>
                    </h4>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                      Aayadaha {tomorrowLesson.start_ayah} – {tomorrowLesson.end_ayah}
                    </span>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Taariikhda Furitaanka (Scheduled Date)
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {tomorrowLesson.scheduled_date}
                    </span>
                  </div>
                </div>

                {/* Smart Tomorrow Assignment Message */}
                {tomorrowLesson.next_lesson_assignment && (
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-950 dark:text-blue-100 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">
                        Qorsheynta Tooska ah (Smart Lesson Planning):
                      </span>
                      <p className="leading-relaxed opacity-90">
                        {(() => {
                          const plan =
                            typeof tomorrowLesson.next_lesson_assignment === 'string'
                              ? JSON.parse(tomorrowLesson.next_lesson_assignment)
                              : tomorrowLesson.next_lesson_assignment;
                          return uiLanguage === 'so' ? plan?.messageSo : plan?.messageEn;
                        })()}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-800 dark:text-blue-200">
                          {tomorrowLesson.selection_mode === 'entire_surah' ? 'Suurad Dhameystiran' : 'Qayb Aayado ah'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-800 dark:text-blue-200">
                          {tomorrowLesson.assigned_ayahs_count || (tomorrowLesson.end_ayah - tomorrowLesson.start_ayah + 1)} Aayadood
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Lesson Marker */}
                <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-foreground block">
                      Casharkani wuxuu si toos ah u furmi doonaa maalinta berri ah.
                    </span>
                    <span className="text-muted-foreground">
                      Haddii aad rabto inaad horay u sii akhrisato ama aad tijaabiso, waxaad ku bilaabi kartaa badhanka hoose.
                    </span>
                  </div>
                </div>

                {/* Teacher / Student Actions & Overrides */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handlePracticeTomorrowLessonNow}
                    className="px-4 py-2 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ku tababar Casharkan Hadda</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRepeatTodayLessonTomorrow}
                    className="px-4 py-2 min-h-[40px] rounded-xl bg-card border border-border hover:bg-muted text-foreground font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Teacher override: Ku celi casharka maanta"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ku celi Casharka Maanta</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-muted/30 border border-border text-center space-y-2">
                <Clock className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-xs font-semibold text-foreground">
                  Casharka berri waxaa la xisaabinayaa marka aad dhammeysato casharka maanta.
                </p>
                <button
                  type="button"
                  onClick={() => setSubTab('practice')}
                  className="px-4 py-2 min-h-[38px] rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
                >
                  U gudub Casharka Maanta
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: PROGRESS & LESSON HISTORY                                     */}
      {/* ===================================================================== */}
      {subTab === 'history' && (
        <div className="space-y-6">
          {/* Progress Counters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Casharrada Dhameystiran
              </span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {progressSummary?.total_completed_lessons || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Casharka Hadda
              </span>
              <span className="text-sm font-extrabold text-foreground truncate block">
                {progressSummary?.current_assigned_surah_name || 'Al-Fatihah'}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {progressSummary?.current_passage_range || '1 – 5'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Isku Dayada Akhriska
              </span>
              <span className="text-2xl font-black text-foreground">
                {progressSummary?.total_attempts_count || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Taariikhda Xigta
              </span>
              <span className="text-sm font-extrabold text-blue-600 truncate block">
                {progressSummary?.next_lesson_date || getLocalDateString(1)}
              </span>
              <span className="text-[10px] text-muted-foreground block">Casharka Berri</span>
            </div>
          </div>

          {/* Lessons History Table */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <span className="text-xs font-bold text-foreground block uppercase tracking-wider text-muted-foreground">
              Taariikhda Casharrada (Lesson History)
            </span>

            {lessonHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Weli ma jiraan casharro la diiwaangeliyay. Bilow casharkaaga ugu horreeya maanta!
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {lessonHistory.map((l) => (
                  <div
                    key={l.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          Surah {l.surah_name} ({l.surah_arabic_name})
                        </span>
                        <span className="text-[11px] text-blue-600 font-semibold">
                          Aayadaha {l.start_ayah} – {l.end_ayah}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Taariikhda: {l.scheduled_date}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                        l.status === 'completed'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                          : l.status === 'needs_review'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {l.status === 'completed' ? 'Dhameystiran' : l.status === 'needs_review' ? 'Dib u eegis' : 'Sugaya'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUCCESS MODAL: END-OF-SESSION COMPLETION                              */}
      {/* ===================================================================== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Casharkii Waa Dhamaaday
              </span>

              {/* Exact required Somali congratulatory message */}
              <h3 className="text-base sm:text-lg font-black text-foreground leading-snug">
                “Mahadsanid, si wanaagsan ayaad uga baxday akhriska Qur’aanka. Jazaakallaahu khayran.”
              </h3>

              <p className="text-xs text-muted-foreground">
                Waxaad si guul leh u xaqiijisay dhammaan aayadaha casharkan. Casharka xiga waxaa lagu diyaariyay jadwalkaaga.
              </p>
            </div>

            {/* Tomorrow's Lesson Highlight */}
            {completedLessonInfo && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border text-left space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">
                  Casharka Berri (Next Lesson):
                </span>
                <span className="font-extrabold text-foreground block">
                  Surah {completedLessonInfo.tomorrowLesson.surah_name} ({completedLessonInfo.tomorrowLesson.surah_arabic_name})
                </span>
                <span className="text-muted-foreground block">
                  Aayadaha {completedLessonInfo.tomorrowLesson.start_ayah} – {completedLessonInfo.tomorrowLesson.end_ayah} • Taariikhda: {completedLessonInfo.tomorrowLesson.scheduled_date}
                </span>
                {completedLessonInfo.tomorrowLesson.next_lesson_assignment && (
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium pt-1 border-t border-border/40 leading-relaxed">
                    {(() => {
                      const plan =
                        typeof completedLessonInfo.tomorrowLesson.next_lesson_assignment === 'string'
                          ? JSON.parse(completedLessonInfo.tomorrowLesson.next_lesson_assignment)
                          : completedLessonInfo.tomorrowLesson.next_lesson_assignment;
                      return uiLanguage === 'so' ? plan?.messageSo : plan?.messageEn;
                    })()}
                  </p>
                )}
              </div>
            )}

            {/* OK Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setSubTab('tomorrow');
                  loadLessonsAndSchedule();
                }}
                className="w-full py-3 min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
