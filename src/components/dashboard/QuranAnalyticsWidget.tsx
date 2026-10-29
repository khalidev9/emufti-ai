// ==============================================================================
// EMUFTI AI — Advanced Quran Reading Analytics & Statistics Widget
// Real-time tracking for Total Pages Read, Juzz Read, Ayahs Read, and Hasanaat Earned
// Timeframe filters: Daily, Weekly, Monthly, and Yearly with dynamic calculations.
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Award,
  Sparkles,
  Calendar,
  TrendingUp,
  Layers,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import {
  AnalyticsTimeframe,
  QuranAnalyticsSummary,
  getAnalyticsSummary,
  recordReadingLog,
} from '../../lib/quranAnalyticsService';

interface QuranAnalyticsWidgetProps {
  userId?: string;
  className?: string;
}

export const QuranAnalyticsWidget: React.FC<QuranAnalyticsWidgetProps> = ({
  userId = 'guest_user',
  className = '',
}) => {
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('daily');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [quickLogMessage, setQuickLogMessage] = useState<string | null>(null);

  // Compute analytics based on timeframe and refresh state
  const summary: QuranAnalyticsSummary = useMemo(() => {
    return getAnalyticsSummary(userId, timeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, timeframe, refreshTrigger]);

  const handleQuickLog = (pages: number) => {
    recordReadingLog(userId, pages, undefined, 'manual_log');
    setRefreshTrigger((prev) => prev + 1);
    setQuickLogMessage(`+${pages} Bog la diiwaangeliyay! (${(pages * 6000).toLocaleString()} Hasanaat)`);
    setTimeout(() => {
      setQuickLogMessage(null);
    }, 3000);
  };

  const timeframeTabs: { key: AnalyticsTimeframe; label: string; somaliLabel: string }[] = [
    { key: 'daily', label: 'Daily', somaliLabel: 'Maanta' },
    { key: 'weekly', label: 'Weekly', somaliLabel: 'Toddobaadkan' },
    { key: 'monthly', label: 'Monthly', somaliLabel: 'Bishan' },
    { key: 'yearly', label: 'Yearly', somaliLabel: 'Sannadkan' },
  ];

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5 hover:border-blue-200 transition-all ${className}`}
    >
      {/* Header with Title and Timeframe Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Xogta & Tirakoobka Akhriska Qur'aanka
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Dhaqdhaqaaqaaga akhris ee tooska ah: Bogag, Juzz, Aayado iyo Xasanaadka aad heshay
          </p>
        </div>

        {/* Timeframe Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 self-start sm:self-auto text-xs font-semibold">
          {timeframeTabs.map((t) => {
            const isActive = timeframe === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTimeframe(t.key)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{t.somaliLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Core Quran Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Pages Read */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-white border border-blue-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Bogagga La Akhriyay</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary.pagesRead.toLocaleString()}{' '}
              <span className="text-xs font-bold text-slate-500 font-sans">Bog</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              Bartilmaameedka: {summary.targetPages.toLocaleString()} Bog
            </p>
          </div>
        </div>

        {/* Metric 2: Juzz Read */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Juzz La Dhameeyay</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary.juzzRead}{' '}
              <span className="text-xs font-bold text-slate-500 font-sans">Juz / 30</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {(summary.juzzRead >= 1 ? `${summary.juzzRead} Juzz buuxa` : 'Ku guda jira Juzz 1aad')}
            </p>
          </div>
        </div>

        {/* Metric 3: Ayahs Read */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/80 to-white border border-cyan-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">Aayado La Akhriyay</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-100/80 text-cyan-700 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary.ayahsRead.toLocaleString()}{' '}
              <span className="text-xs font-bold text-slate-500 font-sans">Aayadood</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              Khatmka guud: 6,236 Aayadood
            </p>
          </div>
        </div>

        {/* Metric 4: Hasanaat Earned */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border border-amber-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Xasanaad La Kasbaday</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              +{summary.hasanaatEarned.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              1 Xaraf = 10 Xasano (Xadiis Sahiix)
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Toward Timeframe Goal */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Bartilmaameedka {timeframeTabs.find((t) => t.key === timeframe)?.somaliLabel}:{' '}
              <strong className="text-slate-900">
                {summary.pagesRead} / {summary.targetPages} Bog
              </strong>
            </span>
          </span>
          <span className="font-bold text-blue-600 font-mono">{summary.completionPercent}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(3, summary.completionPercent))}%` }}
          />
        </div>

        {/* Quick Log Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">Diiwaangeli akhris degdeg ah:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickLog(1)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold hover:text-blue-600 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3 h-3 text-blue-600" />
              <span>+1 Bog</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLog(4)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3 h-3 text-blue-600" />
              <span>+4 Bog (Kalfadhi Salaadeed)</span>
            </button>
          </div>
        </div>

        {quickLogMessage && (
          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{quickLogMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
