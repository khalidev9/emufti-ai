import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Plus,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { QuranReadingPlan, QuranPlannerLog } from '../../types/database';
import { quranService } from '../../lib/quranService';

interface QuranPlannerProps {
  userId?: string;
  uiLanguage: 'en' | 'so' | 'ar';
}

export const QuranPlanner: React.FC<QuranPlannerProps> = ({ userId, uiLanguage }) => {
  // Plan state
  const [plan, setPlan] = useState<QuranReadingPlan | null>(null);
  const [logs, setLogs] = useState<QuranPlannerLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form parameters
  const [mushafTotalPages, setMushafTotalPages] = useState<number>(604);
  const [dailyTargetPages, setDailyTargetPages] = useState<number>(20.0);
  const [planMode, setPlanMode] = useState<'pages_per_day' | 'target_days'>('pages_per_day');
  const [targetDaysInput, setTargetDaysInput] = useState<number>(31);
  const [pagesReadInput, setPagesReadInput] = useState<number>(0);

  // Daily log modal/input
  const [pagesCompletedToday, setPagesCompletedToday] = useState<number>(20);
  const [logNotes, setLogNotes] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load existing plan & logs
  useEffect(() => {
    loadPlan();
  }, [userId]);

  const loadPlan = async () => {
    setIsLoading(true);
    try {
      const existing = await quranService.getReadingPlan(userId);
      const existingLogs = await quranService.getPlannerLogs(userId);

      if (existing) {
        setPlan(existing);
        setMushafTotalPages(existing.mushaf_total_pages);
        setDailyTargetPages(existing.daily_target_pages);
        setTargetDaysInput(existing.target_days);
        setPagesReadInput(existing.pages_read);
        setPagesCompletedToday(Math.round(existing.daily_target_pages));
      } else {
        // Initial default 604 pages, 20 pages/day plan
        setMushafTotalPages(604);
        setDailyTargetPages(20.0);
        setTargetDaysInput(31);
      }
      setLogs(existingLogs);
    } catch (e) {
      console.error('Failed to load reading plan:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Math duration calculation: ceil((totalPages - pagesRead) / dailyTarget)
  const currentTotal = mushafTotalPages || 604;
  const currentRead = plan ? plan.pages_read : pagesReadInput;
  const currentRemaining = Math.max(0, currentTotal - currentRead);

  const calculateDaysForDailyPages = (daily: number, total: number = currentTotal) => {
    if (daily <= 0) return 0;
    return Math.ceil(total / daily);
  };

  const calculateRemainingDays = (daily: number = dailyTargetPages) => {
    if (daily <= 0) return 0;
    return Math.ceil(currentRemaining / daily);
  };

  const getEstimatedEndDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleApplyPreset = (daily: number) => {
    setDailyTargetPages(daily);
    setPlanMode('pages_per_day');
    const days = Math.ceil(currentTotal / daily);
    setTargetDaysInput(days);
    setPagesCompletedToday(Math.round(daily));
  };

  const handleTargetDaysChange = (days: number) => {
    const validDays = Math.max(1, days);
    setTargetDaysInput(validDays);
    const calculatedDaily = Math.round((currentTotal / validDays) * 10) / 10;
    setDailyTargetPages(calculatedDaily);
    setPagesCompletedToday(Math.round(calculatedDaily));
  };

  const handleSavePlan = async () => {
    const remainingDays = calculateRemainingDays(dailyTargetPages);
    const estDate = getEstimatedEndDate(remainingDays);

    const saved = await quranService.saveReadingPlan({
      user_id: userId,
      plan_type: planMode,
      mushaf_total_pages: currentTotal,
      mushaf_edition:
        currentTotal === 604
          ? 'Madinah Mushaf (604 pages)'
          : currentTotal === 600
          ? 'Simplified Baseline (600 pages)'
          : `Custom Mushaf (${currentTotal} pages)`,
      daily_target_pages: dailyTargetPages,
      target_days: targetDaysInput,
      pages_read: currentRead,
      current_page: currentRead,
      status: 'active',
      estimated_end_date: estDate,
      last_read_date: new Date().toISOString().split('T')[0],
    });

    setPlan(saved);
    setIsEditing(false);
    showNotice(uiLanguage === 'so' ? 'Qorshaha si guul leh baa loo kaydiyay!' : 'Reading plan saved successfully!');
  };

  const handleTogglePause = async () => {
    if (!plan) return;
    const newStatus = plan.status === 'active' ? 'paused' : 'active';
    const updated = await quranService.saveReadingPlan({
      ...plan,
      status: newStatus,
    });
    setPlan(updated);
  };

  const handleMarkTodayComplete = async () => {
    const pagesToAdd = Number(pagesCompletedToday) || 1;
    const newPagesRead = Math.min(currentTotal, (plan?.pages_read || 0) + pagesToAdd);
    const todayStr = new Date().toISOString().split('T')[0];

    // Log the day's achievement
    await quranService.logDailyReading({
      user_id: userId || 'guest',
      plan_id: plan?.id,
      log_date: todayStr,
      pages_completed: pagesToAdd,
      notes: logNotes || undefined,
    });

    // Update the reading plan
    const remainingDays = Math.ceil((currentTotal - newPagesRead) / (plan?.daily_target_pages || 20));
    const estDate = getEstimatedEndDate(remainingDays);

    const updatedPlan = await quranService.saveReadingPlan({
      ...(plan || {}),
      user_id: userId,
      pages_read: newPagesRead,
      current_page: newPagesRead,
      last_read_date: todayStr,
      estimated_end_date: estDate,
      status: newPagesRead >= currentTotal ? 'completed' : 'active',
    });

    setPlan(updatedPlan);
    setLogNotes('');

    // Refresh logs
    const refreshedLogs = await quranService.getPlannerLogs(userId);
    setLogs(refreshedLogs);

    showNotice(
      uiLanguage === 'so'
        ? `Masha Allah! Waxaad maanta akhriday ${pagesToAdd} bog.`
        : `Masha\'Allah! Logged ${pagesToAdd} pages completed today.`
    );
  };

  const showNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const percentage = Math.min(100, Math.round((currentRead / currentTotal) * 1000) / 10);
  const remainingDays = calculateRemainingDays(plan?.daily_target_pages || dailyTargetPages);

  // Calculate day number in plan
  const planDayNum = plan?.start_date
    ? Math.max(1, Math.floor((new Date().getTime() - new Date(plan.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header and Baseline Info Banner */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-foreground">
                {uiLanguage === 'so'
                  ? 'Qorshaha Khatimka Qur’aanka (Khatmah Planner)'
                  : uiLanguage === 'ar'
                  ? 'مخطط ختم القرآن الكريم وجدول القراءة اليومية'
                  : 'Quran Reading & Completion Planner'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {uiLanguage === 'so'
                ? 'Deji yoolka aad ku dhammaynayso Qur\'aanka (maalin kasta ama tiro maalmo ah), lana soco horumarkaaga maalinlaha ah.'
                : uiLanguage === 'ar'
                ? 'حدد هدف ختم القرآن بالصفحات اليومية أو بعدد الأيام، وتتبع إنجازك اليومي مع إعادة الحساب التلقائي.'
                : 'Plan your Quran completion target (pages/day or total days) and track daily progress with automated rescheduling.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-semibold text-foreground flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Baseline: {currentTotal} pages</span>
            </span>
          </div>
        </div>

        {/* Success toast */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Baseline Selection & Example Presets Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {uiLanguage === 'so' ? 'Dooro Qorshayaasha Diyaarka Ah' : 'Recommended Example Plans'}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Baseline: {currentTotal} pages. Estimates round up to the next full day (ceil = total / daily).
            </p>
          </div>

          {/* Baseline Switcher: 604 vs 600 vs Custom */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setMushafTotalPages(604)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                mushafTotalPages === 604
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Madinah (604 p.)
            </button>
            <button
              type="button"
              onClick={() => setMushafTotalPages(600)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                mushafTotalPages === 600
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Standard (600 p.)
            </button>
          </div>
        </div>

        {/* 4 Preset Cards with exact requested values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Preset 1: 20 pages/day */}
          <div
            onClick={() => handleApplyPreset(20)}
            className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
              dailyTargetPages === 20
                ? 'bg-emerald-600/10 border-emerald-500 shadow-xs'
                : 'bg-muted/30 border-border/60 hover:bg-muted/60'
            }`}
          >
            <span className="text-sm font-bold text-foreground block">20 pages/day</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
              {mushafTotalPages === 604 ? '31 days (~30–31)' : '30 days'}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">~1 Juz per day</span>
          </div>

          {/* Preset 2: 10 pages/day */}
          <div
            onClick={() => handleApplyPreset(10)}
            className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
              dailyTargetPages === 10
                ? 'bg-emerald-600/10 border-emerald-500 shadow-xs'
                : 'bg-muted/30 border-border/60 hover:bg-muted/60'
            }`}
          >
            <span className="text-sm font-bold text-foreground block">10 pages/day</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
              {mushafTotalPages === 604 ? '61 days' : '60 days'}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">~2 months (1/2 Juz)</span>
          </div>

          {/* Preset 3: 5 pages/day */}
          <div
            onClick={() => handleApplyPreset(5)}
            className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
              dailyTargetPages === 5
                ? 'bg-emerald-600/10 border-emerald-500 shadow-xs'
                : 'bg-muted/30 border-border/60 hover:bg-muted/60'
            }`}
          >
            <span className="text-sm font-bold text-foreground block">5 pages/day</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
              {mushafTotalPages === 604 ? '121 days' : '120 days'}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">~4 months (1/4 Juz)</span>
          </div>

          {/* Preset 4: 2.5 pages/day */}
          <div
            onClick={() => handleApplyPreset(2.5)}
            className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
              dailyTargetPages === 2.5
                ? 'bg-emerald-600/10 border-emerald-500 shadow-xs'
                : 'bg-muted/30 border-border/60 hover:bg-muted/60'
            }`}
          >
            <span className="text-sm font-bold text-foreground block">2.5 pages/day</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
              {mushafTotalPages === 604 ? '242 days' : '240 days'}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">~8 months (Gentle)</span>
          </div>
        </div>
      </div>

      {/* Plan Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Metrics & Progress Bar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Progress Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {uiLanguage === 'so' ? 'Xaaladda Qorshaha' : 'Plan Status'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-foreground">
                    {plan?.status === 'completed'
                      ? 'Khatmah Completed!'
                      : plan?.status === 'paused'
                      ? 'Plan Paused'
                      : 'Active Reading Plan'}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      plan?.status === 'completed'
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                        : plan?.status === 'paused'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {plan?.status?.toUpperCase() || 'NEW'}
                  </span>
                </div>
              </div>

              {/* Pause / Resume / Edit Controls */}
              <div className="flex items-center gap-2">
                {plan && (
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium flex items-center gap-1 transition-all"
                    title={plan.status === 'active' ? 'Pause plan' : 'Resume plan'}
                  >
                    {plan.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Plan'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">{currentRead} pages read</span>
                <span className="text-emerald-600 dark:text-emerald-400">{percentage}% completed</span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-3 overflow-hidden p-0.5 border border-border/60">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Start: Page 1</span>
                <span>Remaining: {currentRemaining} pages</span>
                <span>Total: {currentTotal} pages</span>
              </div>
            </div>

            {/* 4 Key Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Daily Target</span>
                <span className="text-base font-bold text-foreground mt-0.5 block">{dailyTargetPages} p./day</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Days Remaining</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  ~{remainingDays} days
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Est. Completion</span>
                <span className="text-xs font-bold text-foreground mt-1 block truncate">
                  {plan?.estimated_end_date || getEstimatedEndDate(remainingDays)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Day of Plan</span>
                <span className="text-base font-bold text-foreground mt-0.5 block">Day {planDayNum}</span>
              </div>
            </div>

            {/* Edit Plan Drawer */}
            {isEditing && (
              <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/80 space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Update Plan Target & Pages Read
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Total Pages in Mushaf
                    </label>
                    <input
                      type="number"
                      value={mushafTotalPages}
                      onChange={(e) => setMushafTotalPages(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Pages Read So Far
                    </label>
                    <input
                      type="number"
                      value={currentRead}
                      onChange={(e) => setPagesReadInput(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Daily Target (pages/day)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={dailyTargetPages}
                      onChange={(e) => setDailyTargetPages(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSavePlan}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Save & Recalculate Schedule
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Daily Reading Checklist Log */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {uiLanguage === 'so' ? 'Diiwaanka Akhriska Maalinlaha ah (Recent Reading Logs)' : 'Recent Reading Logs'}
            </h4>

            <div className="space-y-2">
              {logs.slice(0, 7).map((log) => (
                <div
                  key={log.id || log.log_date}
                  className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {log.log_date} • {log.pages_completed} pages completed
                      </p>
                      {log.notes && <p className="text-[11px] text-muted-foreground">{log.notes}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-500/10">
                    Done
                  </span>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No daily logs recorded yet. Use the action button on the right to mark your daily reading complete!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Daily Checklist Action Card */}
        <div className="space-y-6">
          <div className="bg-card border border-emerald-500/30 rounded-2xl p-5 shadow-xs bg-emerald-500/5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600 text-white">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-foreground">
                {uiLanguage === 'so' ? 'Diiwaangeli Akhriska Maanta' : 'Log Today\'s Reading'}
              </h4>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {uiLanguage === 'so'
                ? 'Geli tirada bogagga aad maanta akhriday si jadwalkaagu si toos ah isugu habeeyo.'
                : 'Mark how many pages you read today. If you missed a day, your schedule automatically updates based on your actual progress.'}
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Pages Read Today
                </label>
                <input
                  type="number"
                  min="1"
                  max="604"
                  value={pagesCompletedToday}
                  onChange={(e) => setPagesCompletedToday(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:ring-1 focus:ring-emerald-500 text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Optional Reflection / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Completed Juz 1 with tafsir..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:ring-1 focus:ring-emerald-500 text-foreground"
                />
              </div>

              <button
                type="button"
                onClick={handleMarkTodayComplete}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{uiLanguage === 'so' ? 'Xaqiiji Akhriska Maanta' : 'Mark Daily Reading Complete'}</span>
              </button>
            </div>
          </div>

          {/* Transparent Scheduling Explainer */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>How the Schedule Calculates</span>
            </div>
            <p className="leading-relaxed">
              Duration is calculated as <code className="text-foreground">ceil(pages remaining / daily target)</code>.
              Days missed are never marked automatically—the remaining duration adjusts to your real reading pace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
