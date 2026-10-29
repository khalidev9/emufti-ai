import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Award,
  Zap,
  Calculator,
  ChevronRight,
  TrendingUp,
  HeartHandshake,
} from 'lucide-react';
import { storage } from '../../lib/storage';

interface QuranHasanaatWidgetProps {
  userId?: string;
  className?: string;
}

// Quick Quran recitation presets
const PRESETS = [
  { label: 'Surah Al-Fatihah', ayahs: 7, letters: 143, hasanaat: 1430 },
  { label: 'Ayat al-Kursi', ayahs: 1, letters: 255, hasanaat: 2550 },
  { label: '1 Bog (1 Page)', ayahs: 15, letters: 1400, hasanaat: 14000 },
  { label: '1 Juzz (20 Bog)', ayahs: 175, letters: 25000, hasanaat: 250000 },
  { label: 'Khatmo Buuxda', ayahs: 6236, letters: 323015, hasanaat: 3230150 },
];

export const QuranHasanaatWidget: React.FC<QuranHasanaatWidgetProps> = ({
  userId = 'guest_user',
  className = '',
}) => {
  const [mode, setMode] = useState<'activity' | 'calculator'>('activity');
  const [customAyahs, setCustomAyahs] = useState<number>(7);

  // Retrieve user activity data from storage
  const readingProgress = useMemo(() => storage.getReadingProgress(userId), [userId]);
  const streak = useMemo(() => storage.getReadingStreak(userId), [userId]);

  // Estimate letters and hasanaat from user's reading activity
  // Average verse has ~65 letters
  const activityVerses = useMemo(() => {
    const fromProgress = readingProgress?.last_verse || 7;
    const fromSessions = (streak?.totalSessions || 1) * 8;
    return Math.max(7, fromProgress + fromSessions);
  }, [readingProgress, streak]);

  const activityLetters = useMemo(() => activityVerses * 65, [activityVerses]);
  const activityHasanaat = useMemo(() => activityLetters * 10, [activityLetters]);

  // Calculator custom reward
  const calcLetters = useMemo(() => customAyahs * 65, [customAyahs]);
  const calcHasanaat = useMemo(() => calcLetters * 10, [calcLetters]);

  const currentHasanaat = mode === 'activity' ? activityHasanaat : calcHasanaat;
  const currentLetters = mode === 'activity' ? activityLetters : calcLetters;
  const currentAyahsCount = mode === 'activity' ? activityVerses : customAyahs;

  return (
    <div
      className={`p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/50 border border-blue-200/80 shadow-xs space-y-5 transition-all ${className}`}
    >
      {/* Header with Reward Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Xisaabiyaha Xasanaadka (Hasanaat Calculator)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Xisaabi ajar-ka iyo xasanaadka aad ka helayso akhriska Qur'aanka Kariimka
            </p>
          </div>
        </div>

        {/* Polished Reward Badge */}
        <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black tracking-wide shadow-xs shadow-blue-500/20">
          <Award className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>1 Xaraf = 10 Xasano (Ajar)</span>
        </div>
      </div>

      {/* Tab Switcher: User Activity vs Interactive Calculator */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('activity')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === 'activity'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Horumarkaaga Akhriska</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('calculator')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === 'calculator'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Xisaabi Aayado</span>
        </button>
      </div>

      {/* Interactive Mode Controls */}
      {mode === 'calculator' && (
        <div className="space-y-3 p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">
              Dooro Qadarka aad akhriday (Quick Presets):
            </span>
            <span className="text-xs text-blue-600 font-semibold">
              {customAyahs} Aayadood
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setCustomAyahs(p.ayahs)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  customAyahs === p.ayahs
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={286}
              value={customAyahs}
              onChange={(e) => setCustomAyahs(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Main Reward Counter Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric 1: Total Hasanaat (Primary Highlight) */}
        <div className="md:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/20 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider">
              {mode === 'activity' ? 'Xasanaadka la helay' : 'Xasanaadka la filayo'}
            </span>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            +{currentHasanaat.toLocaleString()}
          </div>

          <p className="text-[11px] text-blue-100 leading-snug">
            {mode === 'activity'
              ? 'Xasanaad lagu xisaabiyay akhriskaagii hore.'
              : `Ajar-ka aad helayso markaad akhrido ${currentAyahsCount} aayadood.`}
          </p>
        </div>

        {/* Metric 2: Letters Read Breakdown */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Xarfaha la akhriyey</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-black text-slate-900">
            {currentLetters.toLocaleString()}
          </div>

          <div className="text-[11px] text-slate-500">
            Isku celcelis xaraf ee {currentAyahsCount} aayadood
          </div>
        </div>

        {/* Metric 3: Multiplier & Hadith Grounding */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Isku-dhufashada Ajar-ka</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              x10
            </div>
          </div>

          <div className="text-2xl font-black text-blue-600">
            10x Ajar
          </div>

          <div className="text-[11px] text-slate-500">
            Xasanad kasta waxaa loo labanlaabaa 10 jeer
          </div>
        </div>
      </div>

      {/* Authentic Hadith Grounding Callout */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="font-arabic text-sm sm:text-base font-bold text-slate-800 leading-relaxed" dir="rtl">
            «مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالحَسَنَةُ بِعَشْرِ أَمْثَالِهَا»
          </div>
          <p className="text-xs text-slate-600 italic">
            "Qofkii xaraf ka akhriya Kitaabka Alle wuxuu helayaa hal xasano, xasanadana waxaa lagu dhuftaa toban laabteed." — Nabiga ﷺ (Sunan al-Tirmidhi 2910)
          </p>
        </div>

        <Link
          to="/quran"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 shadow-xs shadow-blue-500/20"
        >
          <span>Akhri Qur'aanka</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
