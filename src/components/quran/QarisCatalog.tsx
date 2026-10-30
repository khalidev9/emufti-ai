import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Play,
  Pause,
  Volume2,
  Globe,
  Award,
  Check,
  Headphones,
  Music,
  ExternalLink,
  Filter,
  AlertCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { QariReciter } from '../../types/database';
import { ALL_50_QARIS, getAvailableCountries, searchQaris } from '../../data/qarisData';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { quranService } from '../../lib/quranService';
import {
  getReciterAvatarUrl,
  getReciterInitials,
  RECITER_REMOTE_FALLBACKS,
} from '../../data/reciterAvatars';

interface QarisCatalogProps {
  selectedReciter: QariReciter;
  onSelectReciter: (qari: QariReciter, surahNumber?: number) => void;
  uiLanguage?: 'en' | 'so' | 'ar';
  currentSurahNumber?: number;
}

export const QarisCatalog: React.FC<QarisCatalogProps> = ({
  selectedReciter,
  onSelectReciter,
  uiLanguage = 'so',
  currentSurahNumber = 1,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  // Surah selector state mapped per Qari (defaults to currentSurahNumber)
  const [selectedSurahByQari, setSelectedSurahByQari] = useState<Record<string, number>>({});

  // Active playback state
  const [playingQariId, setPlayingQariId] = useState<string | null>(null);
  const [playingSurahNumber, setPlayingSurahNumber] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioErrors, setAudioErrors] = useState<Record<string, string | null>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const candidatesRef = useRef<{
    qari: QariReciter;
    surahNum: number;
    urls: string[];
    index: number;
  } | null>(null);

  const countries = getAvailableCountries();
  const filteredQaris = searchQaris(searchQuery, selectedCountry);

  const getQariSurahNumber = (qariId: string): number => {
    return selectedSurahByQari[qariId] || currentSurahNumber || 1;
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playCandidateAtIndex = (index: number) => {
    const session = candidatesRef.current;
    if (!session || !audioRef.current) return;

    if (index >= session.urls.length) {
      console.warn('[QarisCatalog] All audio candidates failed for:', session.qari.name, 'Surah:', session.surahNum);
      setAudioErrors((prev) => ({
        ...prev,
        [session.qari.id]: `Duubista suuraddan weli lama hayo (Recording unavailable for Surah ${session.surahNum}).`,
      }));
      setIsPlaying(false);
      setAudioLoading(false);
      return;
    }

    session.index = index;
    const url = session.urls[index];
    setAudioLoading(true);
    setAudioErrors((prev) => ({ ...prev, [session.qari.id]: null }));

    try {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioLoading(false);
        })
        .catch((err) => {
          console.warn(`[QarisCatalog] Candidate ${index} playback error (${url}):`, err);
          playCandidateAtIndex(index + 1);
        });
    } catch (err) {
      console.warn(`[QarisCatalog] Candidate ${index} setup error:`, err);
      playCandidateAtIndex(index + 1);
    }
  };

  const handleSurahChange = (qari: QariReciter, newSurahNumber: number) => {
    setSelectedSurahByQari((prev) => ({
      ...prev,
      [qari.id]: newSurahNumber,
    }));

    // Clear previous error for this Qari
    setAudioErrors((prev) => ({ ...prev, [qari.id]: null }));

    // If this Qari was actively playing, switch playback immediately to the new surah
    if (playingQariId === qari.id && isPlaying) {
      playQariSurah(qari, newSurahNumber);
    }
  };

  const playQariSurah = (qari: QariReciter, surahNum: number) => {
    const candidates = quranService.getSurahAudioCandidates(qari, surahNum);

    if (!candidates || candidates.length === 0) {
      setAudioErrors((prev) => ({
        ...prev,
        [qari.id]: `Audio recording currently unavailable for Surah ${surahNum}.`,
      }));
      setIsPlaying(false);
      setAudioLoading(false);
      return;
    }

    setPlayingQariId(qari.id);
    setPlayingSurahNumber(surahNum);
    candidatesRef.current = {
      qari,
      surahNum,
      urls: candidates,
      index: 0,
    };

    playCandidateAtIndex(0);
  };

  const handleTogglePlay = (qari: QariReciter) => {
    const surahNum = getQariSurahNumber(qari.id);

    // If already playing this exact Qari and Surah, pause it
    if (playingQariId === qari.id && playingSurahNumber === surahNum && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    // If already loaded on this exact Qari and Surah but paused, resume playback
    if (
      playingQariId === qari.id &&
      playingSurahNumber === surahNum &&
      !isPlaying &&
      audioRef.current &&
      audioRef.current.src
    ) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioLoading(false);
        })
        .catch(() => {
          playQariSurah(qari, surahNum);
        });
      return;
    }

    // Otherwise start playing
    playQariSurah(qari, surahNum);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime || 0);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = () => {
    const session = candidatesRef.current;
    if (session && session.index + 1 < session.urls.length) {
      console.warn(
        `[QarisCatalog] Audio error on candidate ${session.index}. Cascading to candidate ${session.index + 1}`
      );
      playCandidateAtIndex(session.index + 1);
      return;
    }

    if (playingQariId) {
      const surahNum = playingSurahNumber || 1;
      setAudioErrors((prev) => ({
        ...prev,
        [playingQariId]: `Duubista suuraddan weli lama hayo (Audio recording unavailable for Surah ${surahNum}).`,
      }));
    }
    setIsPlaying(false);
    setAudioLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Hidden audio element for reciter playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />

      {/* Header and Filter Controls */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Headphones className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                {uiLanguage === 'so'
                  ? 'Qaariyiinta Caan Ka Ah (Verified Reciters)'
                  : uiLanguage === 'ar'
                  ? 'القرّاء المعتمدون للقرآن الكريم'
                  : 'Verified Quran Reciters (Qaari Catalog)'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {uiLanguage === 'so'
                ? 'Dhageyso dhamaan 114-ka suuradood ee Qur\'aanka Kariimka oo ay akhrinayaan qaariyiinta caanka ah (oo ay ku jiraan culimada Soomaaliyeed sida Sheikh Cabdirashiid Suufi). Dooro suurad kasta si toos ah.'
                : uiLanguage === 'ar'
                ? 'استمع إلى تلاوات خاشعة لجميع سور القرآن الكريم الـ ١١٤ بصوت القرّاء المعتمدين. اختر السورة واستمع مباشرة.'
                : 'Listen to all 114 Surahs from authentic world Qurra (including Somali heritage masters like Sheikh Abdul Rashid Ali Sufi). Select any surah from 1 to 114 per reciter.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-600/25 shadow-xs">
              {filteredQaris.length} {uiLanguage === 'so' ? 'Qaari' : 'Reciters'}
            </span>
          </div>
        </div>

        {/* Search & Country Filter Bars */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border/60">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                uiLanguage === 'so'
                  ? 'Raadi magaca qariga (tusaale: Cabdirashiid Suufi, Alafasy, Al-Husary)...'
                  : uiLanguage === 'ar'
                  ? 'ابحث باسم القارئ (مثل: عبد الرشيد صوفي، العفاسي، الحصري)...'
                  : 'Search by reciter name or country (e.g. Abdur-Rashid Sufi, Alafasy)...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-blue-500 text-foreground"
            />
          </div>

          <div className="relative sm:w-64">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-blue-500 text-foreground cursor-pointer appearance-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'All'
                    ? uiLanguage === 'so'
                      ? 'Dhammaan Waddamada (All Countries)'
                      : 'All Countries (Global)'
                    : c}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Strict Vertical Single-Column List of 50 Reciters for Desktop and Mobile */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-full">
        {filteredQaris.map((qari) => {
          const isSelectedQari = selectedReciter.id === qari.id;
          const currentSurah = getQariSurahNumber(qari.id);
          const isCurrentlyPlaying = playingQariId === qari.id && isPlaying;
          const isLoadingThis = playingQariId === qari.id && audioLoading;
          const qariError = audioErrors[qari.id];
          const isSomali = qari.country.toLowerCase().includes('somalia');
          const surahMeta = ALL_114_SURAHS.find((s) => s.number === currentSurah) || ALL_114_SURAHS[0];

          return (
            <div
              key={qari.id}
              className={`rounded-2xl p-4 sm:p-5 transition-all border flex flex-col space-y-4 w-full max-w-full ${
                isSelectedQari
                  ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/80 shadow-sm ring-1 ring-blue-500/20'
                  : 'bg-card border-border hover:border-blue-500/40 hover:shadow-xs shadow-2xs'
              }`}
            >
              {/* Block 1: Reciter Identity, Avatar, Names, Badges, and Description Text */}
              <div className="flex items-start gap-3.5 sm:gap-4 w-full">
                {/* Reciter Portrait Photo / Styled Avatar */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0 mt-0.5">
                  <img
                    src={getReciterAvatarUrl(qari.id, qari.portraitUrl)}
                    alt={qari.name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      const remoteFallback = RECITER_REMOTE_FALLBACKS[qari.id];
                      if (remoteFallback && target.src !== remoteFallback) {
                        target.src = remoteFallback;
                      } else if (!target.src.endsWith('/default-reciter-avatar.png')) {
                        target.src = '/default-reciter-avatar.png';
                      } else {
                        target.style.display = 'none';
                        const fallbackEl = target.nextElementSibling as HTMLElement;
                        if (fallbackEl) fallbackEl.style.display = 'flex';
                      }
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 transition-all duration-200 ${
                      isSelectedQari
                        ? 'ring-blue-600 shadow-md scale-105'
                        : 'ring-blue-400/30 hover:ring-blue-500/50 shadow-xs'
                    }`}
                    loading="lazy"
                  />
                  <div
                    style={{ display: 'none' }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-2xs ${
                      isSelectedQari
                        ? 'bg-blue-600 text-white'
                        : isSomali
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-600/25'
                    }`}
                    title={qari.name}
                  >
                    {getReciterInitials(qari.name)}
                  </div>
                  {isSomali && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs"
                      title="Somalia 🇸🇴"
                    >
                      🇸🇴
                    </span>
                  )}
                </div>

                {/* Identity, Badges, and Description Text */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {qari.name}
                    </h3>
                    <span
                      className="text-xs sm:text-sm font-arabic text-blue-700 dark:text-blue-400 font-bold"
                      dir="rtl"
                    >
                      {qari.arabicName}
                    </span>
                  </div>

                  {/* Origin, Style, Somali Heritage & 114 Surahs Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border/60">
                      <Globe className="w-2.5 h-2.5 text-blue-600" />
                      <span>{qari.country}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground border border-border/40">
                      {qari.style}
                    </span>

                    {isSomali && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                        ★ Somali Heritage
                      </span>
                    )}

                    {qari.hasVerseAudio && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Verse Audio
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      114 Surahs
                    </span>

                    {isSelectedQari && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                        ✓ {uiLanguage === 'so' ? 'Qariga Hadda Doortan' : 'Current Active'}
                      </span>
                    )}
                  </div>

                  {/* Description / Bio Text */}
                  {qari.bio && (
                    <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {qari.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Block 2: Surah Dropdown Selector sitting completely below description, spanning full width */}
              <div className="w-full space-y-1.5 pt-2 border-t border-border/50">
                <label
                  htmlFor={`qari-surah-select-${qari.id}`}
                  className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{uiLanguage === 'so' ? 'Dooro Suuradda aad rabto inaad dhageysato:' : 'Select Surah to Listen:'}</span>
                </label>
                <select
                  id={`qari-surah-select-${qari.id}`}
                  value={currentSurah}
                  onChange={(e) => handleSurahChange(qari, parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/60 border border-border text-xs sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  {ALL_114_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.englishName} ({s.name}) — {s.numberOfAyahs} Aayadood
                    </option>
                  ))}
                </select>
              </div>

              {/* Block 3: Action Buttons sitting completely below dropdown, spanning full width */}
              <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-1">
                {/* Play / Pause Surah Button */}
                <button
                  type="button"
                  onClick={() => handleTogglePlay(qari)}
                  disabled={isLoadingThis}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    isCurrentlyPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                  title={isCurrentlyPlaying ? 'Hakki Maqalka' : 'Daar Maqalka Surah'}
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buffering...</span>
                    </>
                  ) : isCurrentlyPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Hakki Codka ({currentSurah}. {surahMeta.englishName})</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Dhageyso Suuradda ({currentSurah}. {surahMeta.englishName})</span>
                    </>
                  )}
                </button>

                {/* Primary Action Button: Select Reciter */}
                <button
                  type="button"
                  onClick={() => onSelectReciter(qari, currentSurah)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelectedQari
                      ? 'bg-blue-600 text-white shadow-2xs ring-1 ring-blue-400'
                      : 'bg-muted/70 hover:bg-blue-600 text-foreground hover:text-white border border-border hover:border-blue-600'
                  }`}
                  title="Make this your active reciter for Quran reading"
                >
                  {isSelectedQari ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{uiLanguage === 'so' ? 'Qariga La Doortay (Active)' : 'Active Reciter'}</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>{uiLanguage === 'so' ? 'Dooro Qarigan (Select Reciter)' : 'Select Reciter'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Playback Progress Bar (Shown when this Qari is playing) */}
              {isCurrentlyPlaying && (
                <div className="space-y-1.5 pt-2 border-t border-border/40 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-sans font-semibold">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Playing Surah {currentSurah}: {surahMeta.englishName} ({surahMeta.name})
                    </span>
                    <span>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              )}

              {/* Error Banner if audio file is unavailable */}
              {qariError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{qariError}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredQaris.length === 0 && (
        <div className="p-12 text-center bg-card border border-border/80 rounded-3xl text-muted-foreground space-y-3">
          <Headphones className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">
            No reciters found matching "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCountry('All');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
