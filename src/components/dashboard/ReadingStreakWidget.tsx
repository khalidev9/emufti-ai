import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { storage } from '../../lib/storage';

interface ReadingStreakWidgetProps {
  userId: string;
}

export const ReadingStreakWidget: React.FC<ReadingStreakWidgetProps> = ({ userId }) => {
  const [streakData, setStreakData] = useState(() => storage.getReadingStreak(userId));

  useEffect(() => {
    setStreakData(storage.getReadingStreak(userId));
  }, [userId]);

  const daysOfWeek = [
    { label: 'M', full: 'Mon' },
    { label: 'T', full: 'Tue' },
    { label: 'W', full: 'Wed' },
    { label: 'T', full: 'Thu' },
    { label: 'F', full: 'Fri' },
    { label: 'S', full: 'Sat' },
    { label: 'S', full: 'Sun' },
  ];

  const today = new Date().toISOString().split('T')[0];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6

  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3.5 hover:border-blue-200 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Xidhiidhka Akhriska (Reading Streak)</h2>
            <span className="text-[11px] text-slate-500 block">Daily Quran recitation habit tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-2xl text-amber-700 text-xs font-black">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span>{streakData.currentStreak} Days 🔥</span>
        </div>
      </div>

      {/* 7-Day Visual Progress Dots */}
      <div className="grid grid-cols-7 gap-2 pt-1">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === currentDayIndex;
          const isPast = idx < currentDayIndex;
          const isDone = isPast || (isToday && streakData.lastReadDate === today);

          return (
            <div key={day.full} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-bold ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                {day.label}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : isToday
                    ? 'bg-blue-50 border-2 border-dashed border-blue-400 text-blue-600 font-bold'
                    : 'bg-slate-100 text-slate-400'
                }`}
                title={`${day.full}: ${isDone ? 'Goal Complete' : 'Pending'}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-[10px]">{idx + 1}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Habit Metrics Footer */}
      <div className="pt-1 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
        <span className="flex items-center gap-1 text-[11px]">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          Best Record: <strong className="font-bold text-slate-800">{streakData.bestStreak} days</strong>
        </span>
        <span className="text-[11px] text-blue-600 font-semibold">
          15 mins/day target
        </span>
      </div>
    </div>
  );
};
