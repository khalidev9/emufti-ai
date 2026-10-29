import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Sparkles,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  FileText,
  Headphones,
  ExternalLink,
} from 'lucide-react';
import { Ayah, Surah } from '../../types/database';
import { SOMALI_SCHOLARS_TAFSIR } from '../../data/tafsirData';

interface StudyTafsirViewProps {
  surahAyahs: Ayah[];
  currentSurah?: Surah;
  activeAyahNumber: number;
  isPlaying: boolean;
  onPlayAyah: (ayahNumber: number) => void;
  onToggleBookmark: (ayah: Ayah) => void;
  isBookmarked: (ayah: Ayah) => boolean;
  onAskEMufti: (ayah: Ayah) => void;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  showSomaliTranslation: boolean;
  showEnglishTranslation: boolean;
  readingTheme: 'light' | 'sepia' | 'dark';
}

export const StudyTafsirView: React.FC<StudyTafsirViewProps> = ({
  surahAyahs,
  currentSurah,
  activeAyahNumber,
  isPlaying,
  onPlayAyah,
  onToggleBookmark,
  isBookmarked,
  onAskEMufti,
  fontSize,
  showSomaliTranslation,
  showEnglishTranslation,
  readingTheme,
}) => {
  const [expandedTafsirAyahs, setExpandedTafsirAyahs] = useState<Record<number, boolean>>({});
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);
  const [playingTafsirAudioId, setPlayingTafsirAudioId] = useState<string | null>(null);
  const [tafsirAudio, setTafsirAudio] = useState<HTMLAudioElement | null>(null);

  const toggleTafsir = (ayahNum: number) => {
    setExpandedTafsirAyahs((prev) => ({
      ...prev,
      [ayahNum]: !prev[ayahNum],
    }));
  };

  const handleCopy = (ayah: Ayah) => {
    const text = `${ayah.text}\n\n[Somali Translation]: ${ayah.translationSo || ''}\n\n[English Translation]: ${ayah.translationEn || ''}\n\n[Surah ${currentSurah?.englishName} (${currentSurah?.number}:${ayah.numberInSurah})]`;
    navigator.clipboard.writeText(text);
    setCopiedAyahNum(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNum(null), 2000);
  };

  const handlePlayTafsirAudio = (lessonId: string, audioUrl: string) => {
    if (playingTafsirAudioId === lessonId) {
      tafsirAudio?.pause();
      setPlayingTafsirAudioId(null);
    } else {
      if (tafsirAudio) tafsirAudio.pause();
      const a = new Audio(audioUrl);
      setTafsirAudio(a);
      setPlayingTafsirAudioId(lessonId);
      a.play().catch(() => setPlayingTafsirAudioId(null));
      a.onended = () => setPlayingTafsirAudioId(null);
    }
  };

  // Find authentic Somali scholar commentary matching surah & ayah
  const getScholarTafsirForAyah = (surahNum: number, ayahNum: number) => {
    const results: any[] = [];
    for (const scholar of SOMALI_SCHOLARS_TAFSIR) {
      for (const lesson of scholar.lessons) {
        if (
          lesson.surahNumber === surahNum &&
          ayahNum >= lesson.ayahStart &&
          ayahNum <= lesson.ayahEnd
        ) {
          results.push({
            scholarName: scholar.scholarName,
            somaliName: scholar.somaliName,
            ...lesson,
          });
        }
      }
    }
    return results;
  };

  // Theme styling
  const cardThemeClass =
    readingTheme === 'sepia'
      ? 'bg-[#FBF7EE] border-[#E8DFD0]'
      : readingTheme === 'dark'
      ? 'bg-[#1a1a1a] border-stone-800'
      : 'bg-white border-stone-200/90';

  const arabicTextSizeClass =
    fontSize === 'sm'
      ? 'text-xl sm:text-2xl leading-[2.6]'
      : fontSize === 'md'
      ? 'text-2xl sm:text-3xl leading-[2.8]'
      : fontSize === 'lg'
      ? 'text-3xl sm:text-4xl leading-[3.0]'
      : 'text-4xl sm:text-5xl leading-[3.3]';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* View Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Qaabka Akhriska & Daraasadda (Study & Tafsiir Mode)
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Aayadaha oo xambaarsan Tarjumada Af-Soomaaliga, English, & Tafsiirka Culimada
            </p>
          </div>
        </div>
      </div>

      {/* Verses Study Cards */}
      <div className="space-y-4">
        {surahAyahs.map((ayah) => {
          const isActive = activeAyahNumber === ayah.numberInSurah;
          const isTafsirOpen = Boolean(expandedTafsirAyahs[ayah.numberInSurah]);
          const scholarLessons = currentSurah
            ? getScholarTafsirForAyah(currentSurah.number, ayah.numberInSurah)
            : [];

          return (
            <div
              key={ayah.numberInSurah}
              className={`p-5 rounded-3xl border transition-all duration-200 space-y-4 shadow-xs ${cardThemeClass} ${
                isActive && isPlaying
                  ? 'ring-2 ring-emerald-500/50 border-emerald-500'
                  : ''
              }`}
            >
              {/* Card Header: Ayah badge and quick toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-current/10">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {ayah.numberInSurah}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {currentSurah?.englishName} ({currentSurah?.number}:{ayah.numberInSurah})
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Juzz {ayah.juz || 1} • Bogga {ayah.page || 1}
                    </span>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onPlayAyah(ayah.numberInSurah)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    title="Play Ayah audio"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(ayah)}
                    className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-muted-foreground transition-colors"
                    title="Bookmark"
                  >
                    {isBookmarked(ayah) ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(ayah)}
                    className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-muted-foreground transition-colors"
                    title="Copy Ayah with translations"
                  >
                    {copiedAyahNum === ayah.numberInSurah ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onAskEMufti(ayah)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
                    title="Weydii EMufti ku saabsan Aayaddan"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Weydii EMufti</span>
                  </button>
                </div>
              </div>

              {/* Arabic Quranic Scripture */}
              <div className="text-right py-2" dir="rtl">
                <p className={`font-arabic text-foreground font-normal tracking-wide select-text ${arabicTextSizeClass}`}>
                  {ayah.text}{' '}
                  <span className="font-arabic text-emerald-600 dark:text-emerald-400 font-bold inline-block mx-1">
                    ۝{ayah.numberInSurah}
                  </span>
                </p>
              </div>

              {/* Verified Translations Stack */}
              <div className="space-y-3 pt-2">
                {/* Somali Translation (Mahmud Muhammad Abduh) */}
                {showSomaliTranslation && ayah.translationSo && (
                  <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/60 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <BookOpen className="w-3 h-3" />
                      <span>Tarjumada Af-Soomaaliga (Sh. Maxamuud M. Cabdux)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                      “{ayah.translationSo}”
                    </p>
                  </div>
                )}

                {/* English Translation (Sahih International) */}
                {showEnglishTranslation && ayah.translationEn && (
                  <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/60 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <BookOpen className="w-3 h-3" />
                      <span>English Translation (Saheeh International)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                      "{ayah.translationEn}"
                    </p>
                  </div>
                )}
              </div>

              {/* Scholarly Tafsiir Commentary Expandable Panel */}
              <div className="pt-2 border-t border-current/10">
                <button
                  type="button"
                  onClick={() => toggleTafsir(ayah.numberInSurah)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      Tafsiirka Culimada Soomaaliyeed ee Aayaddan ({scholarLessons.length} {scholarLessons.length === 1 ? 'Cashar' : 'Casharro'})
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      Not Available
                    </span>
                  </div>
                  {isTafsirOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isTafsirOpen && (
                  <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3 animate-in fade-in duration-150">
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-medium text-center">
                      Qaybta Tafsiirka Culimada Soomaaliyeed xilligan lama heli karo (Not Available). Waxaa ku socda dib-u-habeyn iyo hubin xogeed.
                    </div>
                    {scholarLessons.length === 0 ? (
                      <p className="text-xs text-slate-800 dark:text-slate-200 italic">
                        Tafsiirka gaarka ah ee aayaddan waxaa laga heli karaa qaybta buuxda ee "Somali Tafsiir" ee culimada (Sheikh Mustafe, Sheikh Cumar Faaruuq).
                      </p>
                    ) : (
                      scholarLessons.map((lesson) => (
                        <div key={lesson.id} className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-stone-200 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                {lesson.somaliName || lesson.scholarName}
                              </span>
                              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium block">
                                {lesson.titleSo}
                              </span>
                            </div>
                            {lesson.audioUrl && (
                              <button
                                type="button"
                                onClick={() => handlePlayTafsirAudio(lesson.id, lesson.audioUrl)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                                  playingTafsirAudioId === lesson.id
                                    ? 'bg-emerald-600 text-white animate-pulse'
                                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                                }`}
                              >
                                {playingTafsirAudioId === lesson.id ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5" />
                                    <span>Jooji</span>
                                  </>
                                ) : (
                                  <>
                                    <Headphones className="w-3.5 h-3.5" />
                                    <span>Dhageyso ({lesson.duration || 'Tafsiir'})</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {lesson.transcriptSo && (
                            <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-stone-100 dark:border-white/5">
                              {lesson.transcriptSo}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
