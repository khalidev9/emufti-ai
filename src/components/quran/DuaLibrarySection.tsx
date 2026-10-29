import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Repeat,
  Heart,
  GraduationCap,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Clock,
  ChevronRight,
  Sliders,
  X,
} from 'lucide-react';
import { DuaItem, DuaPhraseBreakdown } from '../../types/database';
import { AUTHENTIC_DUAS } from '../../data/duasData';
import { useChat } from '../../context/ChatContext';

interface DuaLibrarySectionProps {
  onAskEMufti?: (prompt: string) => void;
}

export const DuaLibrarySection: React.FC<DuaLibrarySectionProps> = ({ onAskEMufti }) => {
  const navigate = useNavigate();
  const { createNewChat } = useChat();

  // Mode: 'browse' (reading/searching list) vs 'learn' (interactive teaching / lana bari karo)
  const [activeMode, setActiveMode] = useState<'browse' | 'learn'>('browse');

  // Browsing state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingDuaId, setPlayingDuaId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('emufti_saved_duas');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Learning Mode State ("Lana Bari Karo")
  const [learningDua, setLearningDua] = useState<DuaItem>(AUTHENTIC_DUAS[0]);
  const [learningStep, setLearningStep] = useState<'phrases' | 'practice' | 'quiz' | 'wisdom'>('phrases');
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [learningSpeed, setLearningSpeed] = useState<number>(0.8);
  const [repetitionCount, setRepetitionCount] = useState<number>(0);
  const [targetRepetitions, setTargetRepetitions] = useState<number>(learningDua.recommended_repetitions || 3);
  const [isLoopingAudio, setIsLoopingAudio] = useState<boolean>(false);
  const [hideArabicInQuiz, setHideArabicInQuiz] = useState<boolean>(false);
  const [hideTranslationInQuiz, setHideTranslationInQuiz] = useState<boolean>(false);
  const [quizSelfScore, setQuizSelfScore] = useState<'memorized' | 'practicing' | null>(null);

  // Dedicated Audio Recitation Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeAudioDua, setActiveAudioDua] = useState<DuaItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.85);
  const [isAudioLooping, setIsAudioLooping] = useState<boolean>(false);
  const [audioEngineType, setAudioEngineType] = useState<'qari' | 'voice'>('voice');

  const categories = [
    { id: 'all', label: 'All Duas', labelSo: 'Dhammaan Ducooyinka', count: AUTHENTIC_DUAS.length },
    { id: 'morning_evening', label: 'Morning & Evening', labelSo: 'Subax & Galab (Adkaar)', count: AUTHENTIC_DUAS.filter(d => d.category === 'morning_evening').length },
    { id: 'quranic', label: 'Quranic Supplications', labelSo: "Ducooyinka Qur'aanka", count: AUTHENTIC_DUAS.filter(d => d.category === 'quranic').length },
    { id: 'prophetic', label: 'Prophetic Duas', labelSo: 'Sunnada Nabiga ﷺ', count: AUTHENTIC_DUAS.filter(d => d.category === 'prophetic').length },
    { id: 'prayer_forgiveness', label: 'Prayer & Forgiveness', labelSo: 'Salaadda & Dambi Dhaafka', count: AUTHENTIC_DUAS.filter(d => d.category === 'prayer_forgiveness').length },
    { id: 'travel_daily', label: 'Daily Life & Travel', labelSo: 'Nolosha & Safarka', count: AUTHENTIC_DUAS.filter(d => d.category === 'travel_daily').length },
  ];

  const formatAudioTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    setIsPlayingAudio(false);
    setPlayingDuaId(null);
  };

  // Stop audio and speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  // Update target when learning dua changes
  useEffect(() => {
    setTargetRepetitions(learningDua.recommended_repetitions || 3);
    setRepetitionCount(0);
    setActivePhraseIndex(0);
    setQuizSelfScore(null);
  }, [learningDua]);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('emufti_saved_duas', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleCopy = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic_text}\n\n${dua.translation_so || dua.translation_en}\n\nSource: ${dua.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fallbackToSpeech = (dua: DuaItem, speed: number, loop: boolean) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setAudioEngineType('voice');

    // Estimate duration for progress bar: ~1.8 seconds per 10 characters / speed
    const charCount = dua.arabic_text.length;
    const estDuration = Math.max(4, Math.round((charCount * 0.16) / speed));
    setAudioDuration(estDuration);
    setAudioCurrentTime(0);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(dua.arabic_text);
    utterance.lang = 'ar-SA';
    utterance.rate = speed;

    const startTime = Date.now();
    if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    speechTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setAudioCurrentTime(Math.min(estDuration, elapsed));
    }, 200);

    utterance.onend = () => {
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      if (loop) {
        setAudioCurrentTime(0);
        fallbackToSpeech(dua, speed, loop);
      } else {
        setIsPlayingAudio(false);
        setPlayingDuaId(null);
        setAudioCurrentTime(0);
      }
    };

    utterance.onerror = () => {
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      setIsPlayingAudio(false);
      setPlayingDuaId(null);
    };

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const playDuaAudio = (dua: DuaItem, speed = playbackSpeed, loop = isAudioLooping) => {
    stopAllAudio();
    setActiveAudioDua(dua);
    setPlayingDuaId(dua.arabic_text);
    setAudioCurrentTime(0);

    if (dua.audio_url && audioRef.current) {
      setAudioEngineType('qari');
      audioRef.current.src = dua.audio_url;
      audioRef.current.playbackRate = speed;
      audioRef.current.loop = loop;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch((err) => {
          console.warn('HTML5 audio failed, falling back to voice synthesis:', err);
          fallbackToSpeech(dua, speed, loop);
        });
      return;
    }

    fallbackToSpeech(dua, speed, loop);
  };

  const getDuaAudioLabel = (dua: DuaItem) => {
    if (dua.category === 'quranic') return "Qur'an (Sh. Mishary Alafasy)";
    if (dua.category === 'morning_evening') return 'Adhkar (Hisn al-Muslim)';
    if (dua.category === 'prophetic') return 'Sunnah Recitation';
    if (dua.category === 'prayer_forgiveness') return 'Salah Recitation';
    return 'Authentic Recitation';
  };

  const handleToggleDuaAudio = (dua: DuaItem) => {
    if (activeAudioDua?.id === dua.id && isPlayingAudio) {
      if (audioRef.current && activeAudioDua.audio_url) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      setIsPlayingAudio(false);
      setPlayingDuaId(null);
      return;
    }

    playDuaAudio(dua, playbackSpeed, isAudioLooping);
  };

  const handlePlayAudio = (text: string, rate: number = 0.85, onComplete?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = rate;

    utterance.onend = () => {
      setPlayingDuaId(null);
      onComplete?.();
    };
    utterance.onerror = () => {
      setPlayingDuaId(null);
      onComplete?.();
    };

    setPlayingDuaId(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleFullDuaAudio = (dua: DuaItem) => {
    handleToggleDuaAudio(dua);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (activeAudioDua && isPlayingAudio && !activeAudioDua.audio_url) {
      playDuaAudio(activeAudioDua, speed, isAudioLooping);
    }
  };

  const handleLoopToggle = () => {
    const nextLoop = !isAudioLooping;
    setIsAudioLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const handleSeek = (newSeconds: number) => {
    setAudioCurrentTime(newSeconds);
    if (audioRef.current && activeAudioDua?.audio_url) {
      audioRef.current.currentTime = newSeconds;
    }
  };

  const handleReplayCurrent = () => {
    if (activeAudioDua) {
      playDuaAudio(activeAudioDua, playbackSpeed, isAudioLooping);
    }
  };

  // Switch directly into interactive learning mode for a specific Dua
  const startLearningDua = (dua: DuaItem) => {
    setLearningDua(dua);
    setActiveMode('learn');
    setLearningStep('phrases');
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Dynamic phrase segmenter for any Dua
  const getDuaPhrases = (dua: DuaItem): DuaPhraseBreakdown[] => {
    if (dua.phrases && dua.phrases.length > 0) {
      return dua.phrases;
    }

    // Dynamic fallback segmentation by Arabic commas or punctuation
    const rawSegments = dua.arabic_text
      .split(/(?<=[،؛۝\.])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawSegments.length <= 1) {
      return [
        {
          arabic: dua.arabic_text,
          transliteration: dua.transliteration,
          translationSo: dua.translation_so,
          translationEn: dua.translation_en,
        },
      ];
    }

    return rawSegments.map((seg, idx) => ({
      arabic: seg,
      transliteration: `Qaybta ${idx + 1}`,
      translationSo: `Ereyada qaybta ${idx + 1}aad ee ducada`,
      translationEn: `Segment ${idx + 1}`,
    }));
  };

  const currentPhrases = useMemo(() => getDuaPhrases(learningDua), [learningDua]);

  const handleNextPhrase = () => {
    if (activePhraseIndex < currentPhrases.length - 1) {
      setActivePhraseIndex((prev) => prev + 1);
    }
  };

  const handlePrevPhrase = () => {
    if (activePhraseIndex > 0) {
      setActivePhraseIndex((prev) => prev - 1);
    }
  };

  const handlePlayCurrentPhrase = () => {
    const phrase = currentPhrases[activePhraseIndex];
    if (phrase) {
      handlePlayAudio(phrase.arabic, learningSpeed);
    }
  };

  const handleAskEMuftiForDua = async (dua: DuaItem) => {
    const prompt = `[Baro Ducadan: ${dua.title}]
Qoraalka Carabiga: ${dua.arabic_text}
Ku-dhawaaqa: ${dua.transliteration || 'Lama cayimin'}
Fasiraadda Soomaaliga: ${dua.translation_so}
Tixraaca: ${dua.reference}

Fadlan i bar oo si qoto dheer iigu sharax ducadan sugan:
1. Xigmadda iyo macnaha ballaaran ee ku jira
2. Fadliga iyo ajirka laga helo akhriskeeda
3. Goorta iyo xaaladaha ugu habboon ee la aqriyo
4. Tilmaamo ku saabsan ku-dhawaaqa saxda ah iyo sida loo xifdiyo.`;

    if (onAskEMufti) {
      onAskEMufti(prompt);
      return;
    }

    try {
      await createNewChat(prompt, `Baro Ducada: ${dua.title}`);
      navigate('/chat');
    } catch {
      navigate('/chat');
    }
  };

  const filteredDuas = useMemo(() => {
    return AUTHENTIC_DUAS.filter((dua) => {
      const matchesCategory = selectedCategory === 'all' || dua.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        dua.title.toLowerCase().includes(q) ||
        dua.arabic_text.includes(q) ||
        (dua.translation_so && dua.translation_so.toLowerCase().includes(q)) ||
        (dua.translation_en && dua.translation_en.toLowerCase().includes(q)) ||
        dua.reference.toLowerCase().includes(q) ||
        (dua.transliteration && dua.transliteration.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Hidden audio element for authentic recitations */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setAudioCurrentTime(audioRef.current.currentTime);
            setAudioDuration(audioRef.current.duration || 0);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          if (isAudioLooping && activeAudioDua) {
            playDuaAudio(activeAudioDua, playbackSpeed, true);
          } else {
            setIsPlayingAudio(false);
            setPlayingDuaId(null);
            setAudioCurrentTime(0);
          }
        }}
        onError={() => {
          if (activeAudioDua) {
            fallbackToSpeech(activeAudioDua, playbackSpeed, isAudioLooping);
          } else {
            setIsPlayingAudio(false);
            setPlayingDuaId(null);
          }
        }}
      />
      {/* Hero Header Card with Dual Mode Navigation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Kutubta Ducooyinka Sugan & Habka Barashada (Lana Bari Karo)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Maktabadda & Habka Barashada Ducooyinka Sugan
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            Akhriso ducooyinka saxda ah ee Qur’aanka iyo Sunnada Nabiga ﷺ, dhagayso akhriskooda, ama gal qaybta gaarka ah ee <strong>Lana Bari Karo</strong> si aad eray-eray ugu barato, ugu celceliso, oo aad u xifdiso.
          </p>

          {/* Dual View Mode Navigation Pill Switcher */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveMode('browse')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'browse'
                  ? 'bg-white text-blue-900 shadow-md scale-102'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Akhriska & Baaritaanka ({AUTHENTIC_DUAS.length} Duco)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('learn')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'learn'
                  ? 'bg-emerald-500 text-white shadow-md scale-102 ring-2 ring-emerald-300'
                  : 'bg-emerald-600/30 text-white hover:bg-emerald-600/40 border border-emerald-400/40'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>Habka Barashada & Xifdinta (Lana Bari Karo)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/30 text-[10px] text-emerald-100 font-mono">
                Interactive
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: INTERACTIVE LEARNING & TEACHING MODE ("LANA BARI KARO")      */}
      {/* ===================================================================== */}
      {activeMode === 'learn' && (
        <div className="space-y-6">
          {/* Learning Controls & Active Dua Picker */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Dooro Ducada Aad Baranayso
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  {learningDua.title}
                </h2>
              </div>

              {/* Dua Dropdown Selector */}
              <div className="w-full md:w-80">
                <label htmlFor="learning-dua-select" className="sr-only">
                  Dooro Ducada
                </label>
                <select
                  id="learning-dua-select"
                  value={learningDua.id}
                  onChange={(e) => {
                    const found = AUTHENTIC_DUAS.find((d) => d.id === e.target.value);
                    if (found) setLearningDua(found);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {AUTHENTIC_DUAS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.category.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Learning Sub-Tabs: 1. Phrases -> 2. Repetition & Speed -> 3. Quiz Memory -> 4. Wisdom & AI */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setLearningStep('phrases')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  learningStep === 'phrases'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>1. Baro Eray-Eray ({currentPhrases.length} Qaybood)</span>
              </button>

              <button
                type="button"
                onClick={() => setLearningStep('practice')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  learningStep === 'practice'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>2. Ku Celceli & Xifdi (Trainer)</span>
              </button>

              <button
                type="button"
                onClick={() => setLearningStep('quiz')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  learningStep === 'quiz'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>3. Tijaabi Xifdigaaga (Test Recall)</span>
              </button>

              <button
                type="button"
                onClick={() => setLearningStep('wisdom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  learningStep === 'wisdom'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>4. Fasiraadda & Xigmadda AI</span>
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: PHRASE-BY-PHRASE BREAKDOWN */}
          {learningStep === 'phrases' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
              {/* Step indicator header */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-muted-foreground">
                  Qaybta {activePhraseIndex + 1} ee {currentPhrases.length}
                </span>
                <div className="flex items-center gap-1">
                  {currentPhrases.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhraseIndex(i)}
                      className={`w-6 h-2 rounded-full transition-all cursor-pointer ${
                        activePhraseIndex === i
                          ? 'bg-blue-600 w-8'
                          : i < activePhraseIndex
                          ? 'bg-emerald-500'
                          : 'bg-muted'
                      }`}
                      title={`U gudub qaybta ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Active Phrase Big Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-center space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Dhawaaqa & Qoraalka Carabiga ee Qaybtan
                </span>

                <p
                  dir="rtl"
                  className="font-arabic text-2xl sm:text-4xl text-foreground font-bold leading-relaxed py-2"
                >
                  {currentPhrases[activePhraseIndex]?.arabic}
                </p>

                {currentPhrases[activePhraseIndex]?.transliteration && (
                  <p className="text-sm sm:text-base text-muted-foreground italic max-w-xl mx-auto">
                    "{currentPhrases[activePhraseIndex].transliteration}"
                  </p>
                )}

                <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/30 max-w-xl mx-auto">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block mb-1">
                    Macnaha Erayada ee Af-Soomaaliga:
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                    {currentPhrases[activePhraseIndex]?.translationSo || learningDua.translation_so}
                  </p>
                </div>
              </div>

              {/* Phrase Controls: Audio & Prev/Next */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handlePlayCurrentPhrase}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Dhagayso Qaybtan (Audio)</span>
                  </button>

                  {/* Speed toggle */}
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setLearningSpeed(0.75)}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        learningSpeed <= 0.8 ? 'bg-white dark:bg-card text-blue-600 shadow-2xs font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      0.75x (Tartib)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLearningSpeed(1.0)}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        learningSpeed >= 0.9 ? 'bg-white dark:bg-card text-blue-600 shadow-2xs font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      1.0x (Caadi)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handlePrevPhrase}
                    disabled={activePhraseIndex === 0}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl border border-border text-xs font-bold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Qaybtii Hore</span>
                  </button>

                  {activePhraseIndex < currentPhrases.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextPhrase}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <span>Qaybta Xigta</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setLearningStep('practice')}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <span>U Gudub Ku-celcelinta →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: REPETITION TRAINER & SPEED CONTROLLER */}
          {learningStep === 'practice' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
              <div className="space-y-1 text-center max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Xarunta Ku-celcelinta & Xifdinta
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Akhriso oo Ku Celceli Ducada
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dooro inta jeer ee aad rabto inaad akhriso, ka dib taabo batoonka tirinta mar kasta oo aad akhriso.
                </p>
              </div>

              {/* Complete Arabic Text Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-right space-y-3">
                <p dir="rtl" className="font-arabic text-2xl sm:text-3xl text-foreground font-bold leading-loose">
                  {learningDua.arabic_text}
                </p>
                <div className="text-left pt-2 border-t border-blue-200/60 dark:border-blue-900/40 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                    Fasiraadda:
                  </span>
                  <p className="text-xs sm:text-sm text-foreground/90 font-medium">
                    {learningDua.translation_so}
                  </p>
                </div>
              </div>

              {/* Interactive Target Selector & Clicker */}
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/80 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Repetition Target Selector */}
                <div className="space-y-2 text-center md:text-left w-full md:w-auto">
                  <span className="text-xs font-bold text-muted-foreground block">
                    Dooro Hadafka Tirada:
                  </span>
                  <div className="flex items-center justify-center md:justify-start gap-1.5">
                    {[1, 3, 7, 33, 100].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTargetRepetitions(t);
                          setRepetitionCount(0);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          targetRepetitions === t
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {t}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center / Right: Big Tally Clicker */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setRepetitionCount((prev) => prev + 1)}
                    className="w-full sm:w-auto px-8 py-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>Taabo Tirada: {repetitionCount} / {targetRepetitions}</span>
                    <Repeat className="w-5 h-5 animate-pulse" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepetitionCount(0)}
                    className="p-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                    title="Dib u bilaab tirada"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Congratulation Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Horumarka Xifdinta & Akhriska:</span>
                  <span className={repetitionCount >= targetRepetitions ? 'text-emerald-600' : 'text-blue-600'}>
                    {Math.min(100, Math.round((repetitionCount / targetRepetitions) * 100))}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      repetitionCount >= targetRepetitions
                        ? 'bg-emerald-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, (repetitionCount / targetRepetitions) * 100)}%` }}
                  />
                </div>

                {repetitionCount >= targetRepetitions && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Masha’Allah! Waxaad gaartay hadafkii akhriska {targetRepetitions} jeer. Hadda u gudub qaybta tijaabada xifdigaaga.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: RECALL & MEMORIZATION TEST ("TIJAABI XIFDIGAAGA") */}
          {learningStep === 'quiz' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
              <div className="space-y-1 text-center max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Tijaabi Xifdigaaga (Recall Quiz)
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Xasuusnow Ducada Adigoon Eegin
                </h3>
                <p className="text-xs text-muted-foreground">
                  Qari qoraalka Carabiga ama fasiraadda si aad u tijaabiso in aad madaxa ka xafidday.
                </p>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setHideArabicInQuiz((prev) => !prev)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    hideArabicInQuiz
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-muted/50 text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {hideArabicInQuiz ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{hideArabicInQuiz ? 'Carabigu Waa Qiran Yahay' : 'Qari Qoraalka Carabiga'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHideTranslationInQuiz((prev) => !prev)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    hideTranslationInQuiz
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-muted/50 text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {hideTranslationInQuiz ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{hideTranslationInQuiz ? 'Fasiraaddu Waa Qiran Tahay' : 'Qari Fasiraadda'}</span>
                </button>
              </div>

              {/* Quiz Display Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-center space-y-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                  Qoraalka Ducada:
                </span>

                <div
                  dir="rtl"
                  className={`font-arabic text-2xl sm:text-3xl text-foreground font-bold leading-loose transition-all duration-300 py-3 ${
                    hideArabicInQuiz ? 'blur-md select-none opacity-40' : 'blur-none opacity-100'
                  }`}
                >
                  {learningDua.arabic_text}
                </div>

                {hideArabicInQuiz && (
                  <p className="text-xs text-blue-600 font-bold animate-pulse">
                    (Akhriso adigoo xasuusanaya, ka dib taabo batoonka kore si aad u hubiso)
                  </p>
                )}

                <div
                  className={`pt-3 border-t border-blue-200/60 dark:border-blue-900/40 transition-all duration-300 ${
                    hideTranslationInQuiz ? 'blur-md select-none opacity-30' : 'blur-none opacity-100'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold text-foreground max-w-xl mx-auto">
                    {learningDua.translation_so}
                  </p>
                </div>
              </div>

              {/* Self-Rating Assessment */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border/80 text-center space-y-3">
                <span className="text-xs font-bold text-muted-foreground block">
                  Sidee tahay xifdintaadu ducadan?
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuizSelfScore('memorized')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      quizSelfScore === 'memorized'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600/25 border border-emerald-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Alxamdullilah, Waan Xifdiyay! ✓</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizSelfScore('practicing')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      quizSelfScore === 'practicing'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-amber-600/15 text-amber-800 dark:text-amber-300 hover:bg-amber-600/25 border border-amber-500/30'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Weli Waan Ku Celcelinayaa ↺</span>
                  </button>
                </div>

                {quizSelfScore === 'memorized' && (
                  <p className="text-xs font-bold text-emerald-600">
                    Hambalyo! Ducadan waxaad ku dartay liiska waxyaabaha aad xifdisay.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: WISDOM, VIRTUES & ASK EMUFTI AI */}
          {learningStep === 'wisdom' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Fadliga, Xigmadda & Tixraaca
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Fasiraadda Qoto-dheer ee {learningDua.title}
                </h3>
              </div>

              {/* Metadata Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                    Tixraaca Saxiixa Ah
                  </span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-bold text-foreground">{learningDua.reference}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                    Goorta La Aqriyo (Occasion)
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {learningDua.whenToRecite || 'Xilli kasta oo aad baryayso Allah (SWT)'}
                    </span>
                  </div>
                </div>
              </div>

              {learningDua.significance && (
                <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-1.5">
                  <span className="text-xs font-bold text-foreground block">
                    ★ Fadliga & Xigmadda Ducadan:
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {learningDua.significance}
                  </p>
                </div>
              )}

              {/* Ask EMufti AI Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-bold">
                    Ma rabtaa in EMufti AI kuu sharxo ducadan si faahfaahsan?
                  </h4>
                  <p className="text-xs text-blue-100 max-w-xl">
                    Weydii falanqayn qotodheer oo ku saabsan naxwaha, xikmadaha culimada, iyo sida ugu habboon ee qalbiga loogu dareemo ducadan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAskEMuftiForDua(learningDua)}
                  className="px-5 py-3 rounded-2xl bg-white text-blue-900 font-extrabold text-xs hover:bg-blue-50 shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Weydii EMufti AI →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: READING & BROWSING LIST (LIBRARY VIEW)                       */}
      {/* ===================================================================== */}
      {activeMode === 'browse' && (
        <div className="space-y-6">
          {/* Category Pills & Search Bar */}
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raadi duco magaceeda, macnaheeda, ama tixraaceeda..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{cat.labelSo}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duas Grid */}
          <div className="space-y-4">
            {filteredDuas.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold text-foreground">
                  Lama helin wax duco ah oo ku habboon baaritaankaaga.
                </p>
                <p className="text-xs text-muted-foreground">
                  Isku day inaad bedesho erayga aad baaraysay ama dooro qayb kale.
                </p>
              </div>
            ) : (
              filteredDuas.map((dua) => {
                const isBookmarked = bookmarkedIds.has(dua.id);
                const isThisDuaPlaying = (activeAudioDua?.id === dua.id || playingDuaId === dua.arabic_text) && isPlayingAudio;
                const isPlaying = isThisDuaPlaying;
                const isCopied = copiedId === dua.id;

                return (
                  <div
                    key={dua.id}
                    className="p-5 sm:p-6 rounded-3xl bg-card border border-border hover:border-blue-400/50 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    {/* Header: Title, Category, Action Controls */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25">
                            {dua.category.replace('_', ' ')}
                          </span>
                          {dua.recommended_repetitions && dua.recommended_repetitions > 1 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                              <Repeat className="w-2.5 h-2.5" />
                              <span>{dua.recommended_repetitions}x la aqriyo</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                          {dua.title}
                        </h3>
                      </div>

                      {/* Top Action Buttons: Learn, Audio, Bookmark, Copy */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Interactive Learning Mode Shortcut */}
                        <button
                          type="button"
                          onClick={() => startLearningDua(dua)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          title="Geli habka barashada & xifdinta"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Lana Bari Karo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleFullDuaAudio(dua)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isPlaying
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={isPlaying ? 'Hakad gal' : 'Dhagayso akhriska'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(dua.id)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isBookmarked
                              ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={isBookmarked ? 'Ka saar kaydka' : 'Ku dar kaydka'}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 fill-blue-600 text-blue-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(dua)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                          title="Nuqul ka qaado"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text Card */}
                    <div
                      dir="rtl"
                      className="p-4 sm:p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-right select-text"
                    >
                      <p className="font-arabic text-xl sm:text-2xl md:text-3xl leading-loose text-foreground font-bold">
                        {dua.arabic_text}
                      </p>
                    </div>

                    {/* Dedicated Audio Recitation Player Strip */}
                    <div
                      className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                        isThisDuaPlaying
                          ? 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/40 shadow-xs ring-1 ring-blue-500/30'
                          : 'bg-muted/40 border-border/80 hover:border-blue-300 dark:hover:border-blue-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Play/Pause Button & Engine Badge */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleDuaAudio(dua)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all ${
                              isThisDuaPlaying
                                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/40'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title={isThisDuaPlaying ? 'Jooji / Hakad gal' : 'Dhagayso Codka'}
                          >
                            {isThisDuaPlaying ? (
                              <>
                                <Pause className="w-4 h-4" />
                                <span>Hakad (Pause)</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current" />
                                <span>Dhagayso Codka (Play Audio)</span>
                              </>
                            )}
                          </button>

                          {/* Animated equalizer waves */}
                          {isThisDuaPlaying && (
                            <div className="flex items-end gap-0.5 h-4 px-1" title="Codka wuu socdaa">
                              <span className="w-1 rounded-full bg-blue-600 animate-bounce h-3 [animation-delay:-0.3s]" />
                              <span className="w-1 rounded-full bg-blue-600 animate-bounce h-4 [animation-delay:-0.15s]" />
                              <span className="w-1 rounded-full bg-blue-600 animate-bounce h-2.5 [animation-delay:-0.4s]" />
                              <span className="w-1 rounded-full bg-blue-600 animate-bounce h-3.5" />
                            </div>
                          )}

                          {/* Source Badge */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-card border border-border text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{getDuaAudioLabel(dua)}</span>
                          </span>
                        </div>

                        {/* Speed Controls & Loop Toggle */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={handleLoopToggle}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                              isAudioLooping && isThisDuaPlaying
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-card border-border text-muted-foreground hover:text-foreground'
                            }`}
                            title={isAudioLooping ? 'Ku-celcelinta waa furan tahay (Loop On)' : 'Daar Ku-celcelinta (Loop Off)'}
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Loop</span>
                          </button>

                          {/* Speed Selector */}
                          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 text-[11px] font-bold">
                            {[0.75, 1.0, 1.25].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleSpeedChange(s)}
                                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                  playbackSpeed === s
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Clean Modern Scrubber & Time Tracker */}
                      <div className="pt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span>{isThisDuaPlaying ? formatAudioTime(audioCurrentTime) : '0:00'}</span>
                          <span>{isThisDuaPlaying && audioDuration > 0 ? formatAudioTime(audioDuration) : '--:--'}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={isThisDuaPlaying && audioDuration > 0 ? audioDuration : 100}
                          step={0.1}
                          value={isThisDuaPlaying ? audioCurrentTime : 0}
                          onChange={(e) => {
                            if (!isThisDuaPlaying) {
                              handleToggleDuaAudio(dua);
                            }
                            handleSeek(parseFloat(e.target.value));
                          }}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all"
                          title="Taabo ama jiid si aad u socodsiiso"
                        />
                      </div>
                    </div>

                    {/* Transliteration */}
                    {dua.transliteration && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Ku-dhawaaqa (Transliteration)
                        </span>
                        <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                          "{dua.transliteration}"
                        </p>
                      </div>
                    )}

                    {/* Somali Translation */}
                    {dua.translation_so && (
                      <div className="space-y-0.5 pt-1">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                          Fasiraadda Af-Soomaaliga
                        </span>
                        <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                          {dua.translation_so}
                        </p>
                      </div>
                    )}

                    {/* Footer: Authentic Reference, Virtue & Ask AI */}
                    <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          Tixraaca: <strong className="text-foreground">{dua.reference}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {dua.significance && (
                          <span className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
                            ★ {dua.significance}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAskEMuftiForDua(dua)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Weydii EMufti AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Floating Audio Recitation Mini-Player Dock */}
      {activeAudioDua && isPlayingAudio && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-card/95 backdrop-blur-md border-2 border-blue-500/60 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => handleToggleDuaAudio(activeAudioDua)}
                className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-all"
                title={isPlayingAudio ? 'Hakad gal' : 'Daar'}
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">
                    {getDuaAudioLabel(activeAudioDua)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground truncate">
                  {activeAudioDua.title}
                </h4>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleReplayCurrent}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                title="Dib uga bilow (Replay)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={stopAllAudio}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                title="Xir (Close)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
