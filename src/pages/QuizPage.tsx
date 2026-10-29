import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Trophy,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  FileText,
  Scroll,
  Moon,
  HeartHandshake,
  Landmark,
  History,
  Users,
  Heart,
  Sun,
  Languages,
  Zap,
  BarChart3,
  ListChecks,
  Check,
  AlertCircle,
  Brain,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Flame,
  TrendingUp,
  Eye,
  Target,
} from 'lucide-react';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { UserAvatar } from '../components/common/UserAvatar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getQuizQuestions,
  generateAskEMuftiHint,
  TOTAL_VERIFIED_QUESTIONS,
  getCategoryStats,
  getQuestionBankStats,
  QUIZ_CATEGORIES_METADATA,
  VERIFIED_QUESTION_BANK,
} from '../data/quizQuestions';
import type { QuizCategory, QuizDifficulty, QuizOption, ShuffledQuizQuestion, QuizMode } from '../types/database';
import { QuizConfetti } from '../components/quiz/QuizConfetti';
import { QuizLeaderboard } from '../components/quiz/QuizLeaderboard';

export type ActiveQuizTab = 'play' | 'leaderboard' | 'daily' | 'dashboard' | 'mistakes' | 'bookmarks';
export type QuizExperienceMode = 'practice' | 'exam';

export interface QuizPageProps {
  defaultTab?: ActiveQuizTab;
}

export const QuizPage: React.FC<QuizPageProps> = ({ defaultTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();

  // Navigation layout state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Active top-level tab (directly opens leaderboard if /leaderboard or ?tab=leaderboard)
  const [activeTab, setActiveTab] = useState<ActiveQuizTab>(() => {
    if (defaultTab) return defaultTab;
    const urlTab = searchParams.get('tab');
    if (urlTab === 'leaderboard' || location.pathname.includes('/leaderboard')) {
      return 'leaderboard';
    }
    if (urlTab && ['play', 'leaderboard', 'daily', 'dashboard', 'mistakes', 'bookmarks'].includes(urlTab)) {
      return urlTab as ActiveQuizTab;
    }
    return 'play';
  });

  // Sync tab with URL updates
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab === 'leaderboard' || location.pathname.includes('/leaderboard')) {
      setActiveTab('leaderboard');
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, location.pathname, defaultTab]);

  const [experienceMode, setExperienceMode] = useState<QuizExperienceMode>('practice');

  // Configuration state
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [quizMode, setQuizMode] = useState<QuizMode>('quick');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('all');
  const [isTimedMode, setIsTimedMode] = useState<boolean>(true);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimitPerQuestion, setTimeLimitPerQuestion] = useState<number>(90);

  // Active quiz state
  const [questions, setQuestions] = useState<ShuffledQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      question: ShuffledQuizQuestion;
      selectedOptionId: string | null;
      selectedIndex: number;
      isCorrect: boolean;
    }>
  >([]);
  const [score, setScore] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);

  // Lifelines state: 50/50 usable up to 2 times, Weydii EMufti usable 1 time per session
  const [lifeline5050Count, setLifeline5050Count] = useState<number>(2);
  const [lifeline2TimeUsed, setLifeline2TimeUsed] = useState<boolean>(false);
  const [lifelineAskEMuftiCount, setLifelineAskEMuftiCount] = useState<number>(1);
  const [hiddenOptionIds, setHiddenOptionIds] = useState<string[]>([]);
  const [askEMuftiModalContent, setAskEMuftiModalContent] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const lifeline5050Used = lifeline5050Count <= 0;
  const lifelineAskEMuftiUsed = lifelineAskEMuftiCount <= 0;

  // Timer state: 90 seconds countdown per question
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Supabase attempt ID
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Bookmarks State
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Set<string>>(new Set());

  // Mistakes State (questions user answered incorrectly in past)
  const [userMistakes, setUserMistakes] = useState<
    Array<{
      question_id: string;
      category: string;
      difficulty: string;
      selected_option_id?: string;
      correct_option_id: string;
      times_incorrect: number;
      is_resolved: boolean;
      last_attempted_at: string;
    }>
  >([]);

  // Daily Streak State
  const [studyStreak, setStudyStreak] = useState<{
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    lastActivityDate: string;
  }>({
    currentStreak: 1,
    longestStreak: 1,
    totalActiveDays: 1,
    lastActivityDate: new Date().toISOString().slice(0, 10),
  });

  // User Stats (Persisted from Supabase or localStorage)
  const [userStats, setUserStats] = useState<{
    totalQuizzes: number;
    totalQuestions: number;
    totalCorrect: number;
    points: number;
  }>({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    points: 0,
  });

  const isRtl = language === 'ar';
  const categoryStats = useMemo(() => getCategoryStats(), []);
  const bankStats = useMemo(() => getQuestionBankStats(), []);

  // Today's date string and deterministic seed
  const todayDateString = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todaySeed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < todayDateString.length; i++) {
      hash = (hash << 5) - hash + todayDateString.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }, [todayDateString]);

  // Load progress stats, bookmarks, mistakes, and streaks
  useEffect(() => {
    const loadUserData = async () => {
      // 1. Load from Supabase if configured & authenticated
      if (isSupabaseConfigured && user?.id) {
        try {
          // Progress stats
          const { data: progressData } = await supabase
            .from('quiz_user_progress')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (progressData) {
            setUserStats({
              totalQuizzes: progressData.total_quizzes_played || 0,
              totalQuestions: progressData.total_questions_answered || 0,
              totalCorrect: progressData.total_correct_answers || 0,
              points: progressData.points || 0,
            });
          }

          // Bookmarks
          const { data: bmData } = await supabase
            .from('quiz_bookmarks')
            .select('question_id')
            .eq('user_id', user.id);

          if (bmData) {
            setBookmarkedQuestionIds(new Set(bmData.map((b) => b.question_id)));
          }

          // Mistakes
          const { data: mistakesData } = await supabase
            .from('quiz_user_mistakes')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_resolved', false);

          if (mistakesData) {
            setUserMistakes(mistakesData);
          }

          // Streaks
          const { data: streakData } = await supabase
            .from('quiz_daily_streaks')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (streakData) {
            setStudyStreak({
              currentStreak: streakData.current_streak || 1,
              longestStreak: streakData.longest_streak || 1,
              totalActiveDays: streakData.total_active_days || 1,
              lastActivityDate: streakData.last_activity_date || todayDateString,
            });
          }
          return;
        } catch (err) {
          console.warn('Could not load user quiz data from Supabase:', err);
        }
      }

      // Guest fallback to localStorage
      try {
        const rawProgress = localStorage.getItem('emufti_quiz_progress');
        if (rawProgress) setUserStats(JSON.parse(rawProgress));

        const rawBookmarks = localStorage.getItem('emufti_quiz_bookmarks');
        if (rawBookmarks) setBookmarkedQuestionIds(new Set(JSON.parse(rawBookmarks)));

        const rawMistakes = localStorage.getItem('emufti_quiz_mistakes');
        if (rawMistakes) setUserMistakes(JSON.parse(rawMistakes));

        const rawStreak = localStorage.getItem('emufti_quiz_streak');
        if (rawStreak) setStudyStreak(JSON.parse(rawStreak));
      } catch {}
    };

    loadUserData();
  }, [user?.id, todayDateString]);

  // Handle Mode Selection preset adjustments
  const handleSelectMode = (mode: QuizMode) => {
    setQuizMode(mode);
    switch (mode) {
      case 'quick':
        setQuestionCount(10);
        setIsTimedMode(true);
        setTimeLimitPerQuestion(45);
        break;
      case 'standard':
        setQuestionCount(20);
        setIsTimedMode(true);
        setTimeLimitPerQuestion(60);
        break;
      case 'challenge':
        setQuestionCount(Math.min(50, TOTAL_VERIFIED_QUESTIONS));
        setIsTimedMode(true);
        setTimeLimitPerQuestion(45);
        break;
      case 'category':
        setQuestionCount(10);
        setIsTimedMode(true);
        setTimeLimitPerQuestion(60);
        if (selectedCategory === 'all') {
          setSelectedCategory('quran');
        }
        break;
      case 'practice':
        setQuestionCount(15);
        setIsTimedMode(false);
        setTimeLimitPerQuestion(0);
        break;
      case 'timed':
        setQuestionCount(10);
        setIsTimedMode(true);
        setTimeLimitPerQuestion(30);
        break;
      case 'review':
        setQuestionCount(10);
        setIsTimedMode(false);
        setTimeLimitPerQuestion(0);
        break;
      case 'daily':
        setQuestionCount(10);
        setIsTimedMode(true);
        setTimeLimitPerQuestion(45);
        break;
      case 'bookmarks':
        setQuestionCount(Math.max(5, bookmarkedQuestionIds.size));
        setIsTimedMode(false);
        setTimeLimitPerQuestion(0);
        break;
      case 'exam':
        setQuestionCount(20);
        setIsTimedMode(true);
        setTimeLimitPerQuestion(60);
        setExperienceMode('exam');
        break;
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (questionId: string, category: string) => {
    const isCurrentlyBookmarked = bookmarkedQuestionIds.has(questionId);
    const nextSet = new Set(bookmarkedQuestionIds);

    if (isCurrentlyBookmarked) {
      nextSet.delete(questionId);
    } else {
      nextSet.add(questionId);
    }
    setBookmarkedQuestionIds(nextSet);

    // Save to localStorage
    try {
      localStorage.setItem('emufti_quiz_bookmarks', JSON.stringify(Array.from(nextSet)));
    } catch {}

    // Save to Supabase if authenticated
    if (isSupabaseConfigured && user?.id) {
      try {
        if (isCurrentlyBookmarked) {
          await supabase
            .from('quiz_bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('question_id', questionId);
        } else {
          await supabase
            .from('quiz_bookmarks')
            .upsert({
              user_id: user.id,
              question_id: questionId,
              category,
            });
        }
      } catch (err) {
        console.warn('Failed to sync bookmark with Supabase:', err);
      }
    }
  };

  // Record a question mistake
  const recordMistake = async (
    q: ShuffledQuizQuestion,
    selectedOptId: string | null
  ) => {
    const mistakeEntry = {
      question_id: q.id || q.question_id,
      category: q.category,
      difficulty: q.difficulty,
      selected_option_id: selectedOptId || undefined,
      correct_option_id: q.correct_option_id,
      times_incorrect: 1,
      is_resolved: false,
      last_attempted_at: new Date().toISOString(),
    };

    setUserMistakes((prev) => {
      const existingIdx = prev.findIndex((m) => m.question_id === mistakeEntry.question_id);
      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          times_incorrect: updated[existingIdx].times_incorrect + 1,
          last_attempted_at: new Date().toISOString(),
          is_resolved: false,
        };
      } else {
        updated = [mistakeEntry, ...prev];
      }
      try {
        localStorage.setItem('emufti_quiz_mistakes', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('quiz_user_mistakes')
          .upsert({
            user_id: user.id,
            question_id: mistakeEntry.question_id,
            category: mistakeEntry.category,
            difficulty: mistakeEntry.difficulty,
            selected_option_id: selectedOptId,
            correct_option_id: mistakeEntry.correct_option_id,
            times_incorrect: 1,
            is_resolved: false,
            last_attempted_at: new Date().toISOString(),
          }, { onConflict: 'user_id,question_id' });
      } catch (err) {
        console.warn('Could not record mistake to Supabase:', err);
      }
    }
  };

  // Resolve a mistake when answered correctly in review mode
  const resolveMistake = async (questionId: string) => {
    setUserMistakes((prev) => {
      const updated = prev.filter((m) => m.question_id !== questionId);
      try {
        localStorage.setItem('emufti_quiz_mistakes', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('quiz_user_mistakes')
          .update({ is_resolved: true })
          .eq('user_id', user.id)
          .eq('question_id', questionId);
      } catch (err) {
        console.warn('Could not resolve mistake in Supabase:', err);
      }
    }
  };

  // Timer control
  useEffect(() => {
    if (gameState === 'playing' && isTimedMode && !isAnswerSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, isTimedMode, isAnswerSubmitted]);

  const handleTimeExpired = () => {
    if (!isAnswerSubmitted) {
      setSelectedOptionId(null);
      setIsAnswerSubmitted(true);
      const currentQ = questions[currentIndex];
      recordMistake(currentQ, null);

      setUserAnswers((prev) => [
        ...prev,
        {
          question: currentQ,
          selectedOptionId: null,
          selectedIndex: -1,
          isCorrect: false,
        },
      ]);
    }
  };

  // Start standard quiz or with custom questions
  const startQuiz = async (overrideQuestions?: ShuffledQuizQuestion[], customMode?: QuizMode) => {
    let quizQuestionsList: ShuffledQuizQuestion[] = [];

    if (customMode) {
      setQuizMode(customMode);
    }

    if (overrideQuestions && overrideQuestions.length > 0) {
      quizQuestionsList = overrideQuestions;
    } else {
      quizQuestionsList = getQuizQuestions({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        count: questionCount,
        seed: Date.now(),
      });
    }

    if (quizQuestionsList.length === 0) {
      quizQuestionsList = getQuizQuestions({
        category: 'all',
        difficulty: 'all',
        count: questionCount,
        seed: Date.now(),
      });
    }

    setQuestions(quizQuestionsList);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setScore(0);
    setLifeline5050Count(2);
    setLifeline2TimeUsed(false);
    setLifelineAskEMuftiCount(1);
    setHiddenOptionIds([]);
    setAskEMuftiModalContent(null);
    setShowConfetti(false);
    setTimeLeft(isTimedMode ? timeLimitPerQuestion : 0);
    setSessionStartTime(Date.now());
    setGameState('playing');

    // Create Supabase Attempt record if authenticated
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: user.id,
            category: selectedCategory,
            difficulty: selectedDifficulty,
            total_questions: quizQuestionsList.length,
            score: 0,
            is_timed: isTimedMode,
            time_limit_seconds: isTimedMode ? timeLimitPerQuestion : 0,
            status: 'in_progress',
          })
          .select('id')
          .single();

        if (!error && data?.id) {
          setAttemptId(data.id);
        }
      } catch (err) {
        console.warn('Could not record quiz attempt to Supabase:', err);
      }
    }
  };

  // Launch Daily Quiz
  const handleStartDailyQuiz = () => {
    const dailyQuestions = getQuizQuestions({
      category: 'all',
      difficulty: 'all',
      count: 10,
      seed: todaySeed,
    });
    setQuizMode('daily');
    setIsTimedMode(true);
    setTimeLimitPerQuestion(45);
    startQuiz(dailyQuestions, 'daily');
  };

  // Launch Mistake Review Session
  const handleStartMistakesPractice = () => {
    const mistakeIds = new Set(userMistakes.map((m) => m.question_id));
    const mistakePool = VERIFIED_QUESTION_BANK.filter((q) =>
      mistakeIds.has(q.id) || mistakeIds.has(q.question_id)
    );

    if (mistakePool.length === 0) return;

    const formatted = mistakePool.map((q) => ({
      ...q,
      options: [...q.options] as [QuizOption, QuizOption, QuizOption, QuizOption],
      shuffled_options: [...q.options],
      displayed_correct_index: q.options.findIndex((o) => o.id === q.correct_option_id),
      options_en: q.options.map((o) => o.text_en) as [string, string, string, string],
      options_so: q.options.map((o) => o.text_so) as [string, string, string, string],
      options_ar: q.options.map((o) => o.text_ar) as [string, string, string, string],
      correct_index: q.options.findIndex((o) => o.id === q.correct_option_id),
    }));

    setQuizMode('review');
    setIsTimedMode(false);
    startQuiz(formatted, 'review');
  };

  // Launch Bookmarks Practice Session
  const handleStartBookmarksPractice = () => {
    const bookmarkPool = VERIFIED_QUESTION_BANK.filter((q) =>
      bookmarkedQuestionIds.has(q.id) || bookmarkedQuestionIds.has(q.question_id)
    );

    if (bookmarkPool.length === 0) return;

    const formatted = bookmarkPool.map((q) => ({
      ...q,
      options: [...q.options] as [QuizOption, QuizOption, QuizOption, QuizOption],
      shuffled_options: [...q.options],
      displayed_correct_index: q.options.findIndex((o) => o.id === q.correct_option_id),
      options_en: q.options.map((o) => o.text_en) as [string, string, string, string],
      options_so: q.options.map((o) => o.text_so) as [string, string, string, string],
      options_ar: q.options.map((o) => o.text_ar) as [string, string, string, string],
      correct_index: q.options.findIndex((o) => o.id === q.correct_option_id),
    }));

    setQuizMode('bookmarks');
    setIsTimedMode(false);
    startQuiz(formatted, 'bookmarks');
  };

  // Launch Retry of Missed Questions from the current session
  const handleRetryIncorrect = () => {
    const wrongAnswers = userAnswers.filter((a) => !a.isCorrect);
    if (wrongAnswers.length === 0) return;

    const retryQuestions = wrongAnswers.map((a) => a.question);
    setQuizMode('review');
    setIsTimedMode(false);
    startQuiz(retryQuestions, 'review');
  };

  // ---------------------------------------------------------------------------
  // Lifeline Actions (Practice Mode)
  // ---------------------------------------------------------------------------
  const handleUse5050 = () => {
    if (lifeline5050Count <= 0 || isAnswerSubmitted || experienceMode === 'exam') return;
    const currentQ = questions[currentIndex];
    const displayOpts = currentQ.shuffled_options || currentQ.options;

    const incorrectOptions = displayOpts.filter(
      (opt) => opt.id !== currentQ.correct_option_id
    );

    const shuffledWrong = [...incorrectOptions].sort(() => 0.5 - Math.random());
    const toEliminate = shuffledWrong.slice(0, 2).map((opt) => opt.id);

    setHiddenOptionIds(toEliminate);
    setLifeline5050Count((prev) => Math.max(0, prev - 1));
  };

  const handleUse2Time = () => {
    if (lifeline2TimeUsed || !isTimedMode || isAnswerSubmitted || experienceMode === 'exam') return;
    setTimeLeft((prev) => prev + 120);
    setLifeline2TimeUsed(true);
  };

  const handleUseAskEMufti = () => {
    if (lifelineAskEMuftiCount <= 0 || isAnswerSubmitted || experienceMode === 'exam') return;
    const currentQ = questions[currentIndex];
    const hint = generateAskEMuftiHint(currentQ, language);
    setAskEMuftiModalContent(hint);
    setLifelineAskEMuftiCount((prev) => Math.max(0, prev - 1));
  };

  // ---------------------------------------------------------------------------
  // Answer Handling with Stable Option IDs
  // ---------------------------------------------------------------------------
  const handleSelectOption = (option: QuizOption, index: number) => {
    if (hiddenOptionIds.includes(option.id)) return;
    
    // In Exam Mode, allow re-selecting or changing answer before clicking Next
    if (experienceMode === 'exam') {
      setSelectedOptionId(option.id);
      return;
    }

    // In Practice Mode: Immediate submission & feedback
    if (isAnswerSubmitted) return;
    setSelectedOptionId(option.id);
    setIsAnswerSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentIndex];
    const isCorrect = option.id === currentQ.correct_option_id;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setShowConfetti(true);
      if (quizMode === 'review') {
        resolveMistake(currentQ.id || currentQ.question_id);
      }
    } else {
      recordMistake(currentQ, option.id);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        selectedOptionId: option.id,
        selectedIndex: index,
        isCorrect,
      },
    ]);

    // Save answer to Supabase if authenticated
    if (isSupabaseConfigured && user?.id && attemptId) {
      supabase
        .from('quiz_answers')
        .insert({
          attempt_id: attemptId,
          user_id: user.id,
          question_id: currentQ.question_id || currentQ.id,
          selected_index: index,
          selected_option_id: option.id,
          is_correct: isCorrect,
        })
        .then(() => {});
    }
  };

  // Next Question handling
  const handleNextQuestion = () => {
    // If in Exam Mode, commit the current question's answer before moving on
    if (experienceMode === 'exam') {
      const currentQ = questions[currentIndex];
      const isCorrect = selectedOptionId === currentQ.correct_option_id;
      if (isCorrect) {
        setScore((prev) => prev + 1);
      } else {
        recordMistake(currentQ, selectedOptionId);
      }

      setUserAnswers((prev) => [
        ...prev,
        {
          question: currentQ,
          selectedOptionId,
          selectedIndex: currentQ.options.findIndex((o) => o.id === selectedOptionId),
          isCorrect,
        },
      ]);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setHiddenOptionIds([]);
      setShowConfetti(false);
      setTimeLeft(isTimedMode ? timeLimitPerQuestion : 0);
    } else {
      finishQuiz();
    }
  };

  // Complete Quiz Attempt
  const finishQuiz = async () => {
    setGameState('results');
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = Math.round((Date.now() - sessionStartTime) / 1000);
    setSessionElapsedSeconds(elapsed);

    const finalScore = score;
    const totalQ = questions.length;
    const pointsEarned = finalScore * 10;
    if (finalScore >= totalQ * 0.6) {
      setShowConfetti(true);
    }

    // Update Local Stats
    setUserStats((prev) => {
      const next = {
        totalQuizzes: prev.totalQuizzes + 1,
        totalQuestions: prev.totalQuestions + totalQ,
        totalCorrect: prev.totalCorrect + finalScore,
        points: prev.points + pointsEarned,
      };
      try {
        localStorage.setItem('emufti_quiz_progress', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Update Daily Streak if Daily Quiz was completed
    if (quizMode === 'daily') {
      setStudyStreak((prev) => {
        const next = {
          currentStreak: prev.currentStreak + 1,
          longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
          totalActiveDays: prev.totalActiveDays + 1,
          lastActivityDate: todayDateString,
        };
        try {
          localStorage.setItem('emufti_quiz_streak', JSON.stringify(next));
        } catch {}
        return next;
      });

      if (isSupabaseConfigured && user?.id) {
        try {
          await supabase.rpc('record_quiz_daily_activity', { p_user_id: user.id });
        } catch (err) {
          console.warn('Could not record daily streak to Supabase:', err);
        }
      }
    }

    // Update Supabase Attempt and Progress if authenticated
    if (isSupabaseConfigured && user?.id) {
      try {
        if (attemptId) {
          await supabase.rpc('complete_quiz_attempt', {
            p_attempt_id: attemptId,
            p_score: finalScore,
            p_lifeline_50_50: lifeline5050Used,
            p_lifeline_2time: lifeline2TimeUsed,
            p_lifeline_ask_emufti: lifelineAskEMuftiUsed,
          });
        }

        await supabase.rpc('record_user_quiz_session', {
          p_user_id: user.id,
          p_category: selectedCategory,
          p_difficulty: selectedDifficulty,
          p_total_questions: totalQ,
          p_correct_answers: finalScore,
          p_points_earned: pointsEarned,
          p_time_spent_seconds: elapsed,
        });
      } catch (err) {
        console.warn('Could not record quiz completion to Supabase:', err);
      }
    }
  };

  const currentQ = questions[currentIndex];
  const displayOptions = currentQ ? currentQ.shuffled_options || currentQ.options : [];

  // Helper translations
  const getQuestionText = (q: ShuffledQuizQuestion) => {
    if (language === 'so') return q.question_so || q.question_en;
    if (language === 'ar') return q.question_ar || q.question_en;
    return q.question_en;
  };

  const getOptionText = (opt: QuizOption) => {
    if (language === 'so') return opt.text_so || opt.text_en;
    if (language === 'ar') return opt.text_ar || opt.text_en;
    return opt.text_en;
  };

  const getQuestionExplanation = (q: ShuffledQuizQuestion) => {
    if (language === 'so') return q.explanation_so || q.explanation_en;
    if (language === 'ar') return q.explanation_ar || q.explanation_en;
    return q.explanation_en;
  };

  // Helper to get Category Name
  const getCategoryLocalizedName = (catId: string) => {
    if (catId === 'all') return t('quiz.category_all', 'All Categories');
    const meta = QUIZ_CATEGORIES_METADATA.find((m) => m.id === catId);
    if (!meta) return catId;
    if (language === 'so') return meta.name_so;
    if (language === 'ar') return meta.name_ar;
    return meta.name_en;
  };

  // Helper Icon Component
  const renderCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'Scroll':
        return <Scroll className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Moon':
        return <Moon className={className} />;
      case 'HeartHandshake':
        return <HeartHandshake className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'History':
        return <History className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Sun':
        return <Sun className={className} />;
      case 'Languages':
        return <Languages className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  // Quiz Modes List
  const QUIZ_MODES: Array<{
    id: QuizMode;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
  }> = [
    {
      id: 'quick',
      label: t('quiz.mode_quick', 'Quick Quiz'),
      description: '10 questions • Fast-paced 45s timer',
      icon: Zap,
      badge: 'Popular',
    },
    {
      id: 'standard',
      label: t('quiz.mode_standard', 'Standard Quiz'),
      description: '20 questions • Standard 60s timer',
      icon: ListChecks,
      badge: 'Standard',
    },
    {
      id: 'challenge',
      label: t('quiz.mode_challenge', 'Challenge Quiz'),
      description: `${Math.min(50, TOTAL_VERIFIED_QUESTIONS)} questions • Comprehensive Islamic test`,
      icon: Trophy,
      badge: 'Master',
    },
    {
      id: 'category',
      label: t('quiz.mode_category', 'Category Quiz'),
      description: 'Focused test on a single Islamic science',
      icon: BookOpen,
      badge: 'Targeted',
    },
    {
      id: 'practice',
      label: t('quiz.mode_practice', 'Full Practice'),
      description: 'Untimed • Study with instant scholarly explanations',
      icon: Brain,
      badge: 'Study',
    },
    {
      id: 'timed',
      label: t('quiz.mode_timed', 'Timed Challenge'),
      description: 'Strict 30s per question countdown',
      icon: Clock,
      badge: 'Speed',
    },
    {
      id: 'review',
      label: t('quiz.mode_review', 'Review Mode'),
      description: 'Revisit difficult questions & citations',
      icon: RotateCcw,
      badge: 'Mastery',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans w-full max-w-full overflow-x-hidden box-border">
      {/* Main Full-Width Immersive Canvas (No Chat Sidebar and No Chat Top Header Clutter) */}
      <main className="w-full max-w-6xl mx-auto p-3 sm:p-6 lg:p-8 pb-20 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Minimal inline utility navigation strip */}
        <div className="flex items-center justify-between pb-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs hover:bg-muted"
            title="Ku noqo Hoyga (Back to Home)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ku noqo Hoyga (Back to Home)</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/quran"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              Holy Quran
            </Link>
            <Link
              to="/chat"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              AI Chat
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="w-full space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* 1. SETUP / CONFIGURATION SCREEN */}
            {/* ---------------------------------------------------------------- */}
            {gameState === 'setup' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Banner (Hidden on Leaderboard to remove extra clutter & streak counters) */}
                {activeTab !== 'leaderboard' && (
                  <div className="relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-amber-500/10 border border-blue-500/30 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-800 dark:text-blue-300 text-xs font-black tracking-widest uppercase font-mono">
                          <Trophy className="w-3.5 h-3.5" />
                          {t('quiz.title', 'EMUFTI ISLAMIC QUIZ')}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                          {t('quiz.hero_heading', 'Test & Deepen Your Islamic Knowledge')}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                          {t(
                            'quiz.subtitle',
                            'Master authentic topics from the Quran, Hadith, Seerah, Fiqh, and Islamic History. Strictly verified citations with zero AI fabrications.'
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center bg-card/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-border shadow-xs">
                          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                            {TOTAL_VERIFIED_QUESTIONS}
                          </div>
                          <div className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                            {t('quiz.verified_bank_count', 'Verified Questions')}
                          </div>
                        </div>

                        <div className="text-center bg-card/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-border shadow-xs flex flex-col items-center justify-center">
                          <div className="flex items-center gap-1 text-2xl sm:text-3xl font-black text-amber-500">
                            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                            <span>{studyStreak.currentStreak}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                            Day Streak
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NAVIGATION TABS BAR (Play, Leaderboard, Daily Quiz, Dashboard, Mistakes, Bookmarks) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-border/80 w-full max-w-full flex-nowrap whitespace-nowrap">
                  {[
                    { id: 'play', label: 'Play Quiz', icon: Zap, count: null },
                    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, badge: 'Top', count: null },
                    { id: 'daily', label: 'Daily Islamic Quiz', icon: Calendar, badge: 'Today', count: null },
                    { id: 'dashboard', label: 'Learning Dashboard', icon: BarChart3, count: null },
                    { id: 'mistakes', label: 'Mistake Review', icon: RotateCcw, count: userMistakes.length },
                    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarkedQuestionIds.size },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as ActiveQuizTab)}
                        className={`flex-shrink-0 shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.count !== null && tab.count > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                              isActive ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                        {tab.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] uppercase font-mono ${
                              isActive ? 'bg-amber-400 text-slate-900 font-black' : 'bg-amber-500/20 text-amber-600'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT: 1. PLAY / STANDARD QUIZ SETUP */}
                {activeTab === 'play' && (
                  <div className="space-y-6">
                    {/* Experience Mode Toggle: Practice vs Exam */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-blue-600" />
                          <span>Experience Mode</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Practice with instant feedback & scholarly hints, or simulate a formal exam.
                        </p>
                      </div>

                      <div className="inline-flex p-1 bg-muted rounded-2xl border border-border shrink-0">
                        <button
                          type="button"
                          onClick={() => setExperienceMode('practice')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
                            experienceMode === 'practice'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Brain className="w-3.5 h-3.5" />
                          <span>Practice Mode</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExperienceMode('exam')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
                            experienceMode === 'exam'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Exam Mode</span>
                        </button>
                      </div>
                    </div>

                    {/* Quiz Mode Selection (7 Modes) */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span>Choose Quiz Mode</span>
                        </h2>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          7 Specialized Practice Modes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {QUIZ_MODES.map((m) => {
                          const Icon = m.icon;
                          const isSelected = quizMode === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleSelectMode(m.id)}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer min-h-[48px] ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/30 font-semibold'
                                  : 'border-border/70 hover:border-border hover:bg-muted/40 text-foreground'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                                      isSelected ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold">{m.label}</span>
                                </div>
                                <span
                                  className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                                    isSelected
                                      ? 'bg-blue-600/20 text-blue-700 dark:text-blue-300 font-bold'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {m.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1 pl-9">
                                {m.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Selection (15 Authentic Topics) */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>Select Knowledge Category</span>
                        </h2>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          15 Authentic Islamic Sciences
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('all')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer min-h-[48px] ${
                            selectedCategory === 'all'
                              ? 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/30'
                              : 'border-border/70 hover:border-border hover:bg-muted/40 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                selectedCategory === 'all'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Trophy className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-xs font-bold truncate">
                              {t('quiz.category_all', 'All Categories')}
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground pl-8">
                            {TOTAL_VERIFIED_QUESTIONS} verified questions
                          </div>
                        </button>

                        {QUIZ_CATEGORIES_METADATA.map((cat) => {
                          const isSelected = selectedCategory === cat.id;
                          const count = categoryStats[cat.id] || 0;
                          const catName =
                            language === 'so'
                              ? cat.name_so
                              : language === 'ar'
                              ? cat.name_ar
                              : cat.name_en;

                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id as QuizCategory)}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer min-h-[48px] ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/30'
                                  : 'border-border/70 hover:border-border hover:bg-muted/40 text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                                </div>
                                <div className="text-xs font-bold truncate" title={catName}>
                                  {catName}
                                </div>
                              </div>
                              <div className="text-[10px] text-muted-foreground pl-8">
                                {count} questions
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Difficulty & Timer Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Difficulty Levels */}
                      <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                          <span>Difficulty Level</span>
                          <span className="text-[10px] text-blue-600 font-mono">Strict Separation</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'all', label: t('quiz.difficulty_all', 'All Levels'), count: bankStats.total },
                            {
                              id: 'beginner',
                              label: t('quiz.difficulty_beginner', 'Beginner (Aasaasi)'),
                              count: bankStats.byDifficulty.beginner,
                            },
                            {
                              id: 'intermediate',
                              label: t('quiz.difficulty_intermediate', 'Intermediate (Dhexaad)'),
                              count: bankStats.byDifficulty.intermediate,
                            },
                            {
                              id: 'advanced',
                              label: t('quiz.difficulty_advanced', 'Advanced (Sare)'),
                              count: bankStats.byDifficulty.advanced,
                            },
                          ].map((diff) => (
                            <button
                              key={diff.id}
                              type="button"
                              onClick={() => setSelectedDifficulty(diff.id as QuizDifficulty)}
                              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer min-h-[44px] ${
                                selectedDifficulty === diff.id
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-500/30'
                                  : 'border-border/60 hover:bg-muted/40 text-foreground'
                              }`}
                            >
                              <div className="text-xs truncate">{diff.label}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {diff.count} questions
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mode & Timing */}
                      <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Timer & Pressure
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIsTimedMode(true)}
                            className={`p-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                              isTimedMode
                                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold'
                                : 'border-border/60 hover:bg-muted/40 text-foreground'
                            }`}
                          >
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{t('quiz.mode_timed', 'Timed Challenge')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsTimedMode(false)}
                            className={`p-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                              !isTimedMode
                                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold'
                                : 'border-border/60 hover:bg-muted/40 text-foreground'
                            }`}
                          >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>{t('quiz.mode_casual', 'Untimed Practice')}</span>
                          </button>
                        </div>

                        {isTimedMode && (
                          <div className="flex items-center justify-between text-xs pt-1 px-1">
                            <span className="text-muted-foreground">Countdown per Question:</span>
                            <div className="flex gap-1.5">
                              {[30, 45, 60, 90].map((sec) => (
                                <button
                                  key={sec}
                                  type="button"
                                  onClick={() => setTimeLimitPerQuestion(sec)}
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    timeLimitPerQuestion === sec
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {sec}s
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Number of Questions Selector & Start Button */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-xs font-bold text-foreground">Questions per Round:</span>
                        <div className="flex gap-1.5">
                          {[5, 10, 15, 20].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setQuestionCount(num)}
                              className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                                questionCount === num
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-muted text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => startQuiz()}
                        className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{t('quiz.start_quiz', 'Start Quiz')}</span>
                        <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Real-time Leaderboard & Active Streak Spotlight on Play screen */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              <Trophy className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Kaalmaha Dadku Ku Kala Jiraan (Real-time Leaderboard)
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-foreground">
                            Tartanka Cilmiga & Kaalmaha Ugu Sarreeya
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('leaderboard')}
                          className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                        >
                          <span>Eeg Dhammaan Kaalmaha (Full Leaderboard)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Top 3 Live Seekers Podium Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              1🥇
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground truncate block">
                                Sh. Cabdiraxmaan Al-Hafidh
                              </span>
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">
                                19,850 dhibcood • 99.4%
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 shrink-0">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            <span>42d</span>
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-200/40 dark:bg-slate-800/40 border border-border flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              2🥈
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground truncate block">
                                Faadumo Nuur Jaamac
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold block">
                                17,400 dhibcood • 98.6%
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 shrink-0">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            <span>31d</span>
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-700/10 border border-amber-700/20 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              3🥉
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground truncate block">
                                Khalid Bin Walid
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold block">
                                15,920 dhibcood • 97.9%
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 shrink-0">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            <span>24d</span>
                          </span>
                        </div>
                      </div>

                      {/* Active User Streak Status Banner */}
                      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                          <span>
                            Xiriirkaaga Maalmaha (Active Streak): <strong>{studyStreak.currentStreak} Maalmood oo xiriir ah</strong> (Ugu fiican: {studyStreak.longestStreak} maalmood)
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ Maalin kasta oo aad tartanto xiriirku wuu kordhayaa!
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: 2. LEADERBOARD */}
                {activeTab === 'leaderboard' && (
                  <QuizLeaderboard
                    currentUserStats={userStats}
                    currentStreak={studyStreak.currentStreak}
                    currentUsername={profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You'}
                    currentUserAvatar={profile?.avatar_url || user?.user_metadata?.avatar_url}
                    onStartQuiz={() => {
                      setActiveTab('play');
                      startQuiz();
                    }}
                  />
                )}

                {/* TAB CONTENT: 3. DAILY ISLAMIC QUIZ */}
                {activeTab === 'daily' && (
                  <div className="space-y-6">
                    <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-foreground mt-2">
                            Today's Islamic Knowledge Quiz
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                            10 deterministic questions drawn from across all authentic Islamic sciences. Take it daily to build your continuous study streak!
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-500">
                              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                              <span>{studyStreak.currentStreak}</span>
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                              Current Streak
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>✓ 10 curated questions refreshed every 24 hours at midnight</div>
                          <div>✓ Consistent across all users worldwide for daily knowledge circles</div>
                        </div>

                        <button
                          type="button"
                          onClick={handleStartDailyQuiz}
                          className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Start Today's Daily Quiz</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: 3. LEARNING DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Overall Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                        <div className="text-xs text-muted-foreground font-semibold">Total Quizzes</div>
                        <div className="text-2xl font-black text-foreground mt-1">{userStats.totalQuizzes}</div>
                        <div className="text-[10px] text-blue-600 mt-0.5 font-mono">Sessions Completed</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                        <div className="text-xs text-muted-foreground font-semibold">Questions Answered</div>
                        <div className="text-2xl font-black text-blue-600 mt-1">{userStats.totalQuestions}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">Total Questions</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                        <div className="text-xs text-muted-foreground font-semibold">Overall Accuracy</div>
                        <div className="text-2xl font-black text-teal-600 mt-1">
                          {userStats.totalQuestions > 0
                            ? `${Math.round((userStats.totalCorrect / userStats.totalQuestions) * 100)}%`
                            : '0%'}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          {userStats.totalCorrect} Correct Answers
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                        <div className="text-xs text-muted-foreground font-semibold">Study Streak</div>
                        <div className="flex items-center gap-1 text-2xl font-black text-amber-500 mt-1">
                          <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                          <span>{studyStreak.currentStreak} Days</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          Best: {studyStreak.longestStreak} days
                        </div>
                      </div>
                    </div>

                    {/* Category Mastery Progress */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span>Category Mastery & Bank Depth</span>
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono">15 Islamic Sciences</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {QUIZ_CATEGORIES_METADATA.map((cat) => {
                          const count = categoryStats[cat.id] || 0;
                          const catName =
                            language === 'so'
                              ? cat.name_so
                              : language === 'ar'
                              ? cat.name_ar
                              : cat.name_en;

                          return (
                            <div key={cat.id} className="p-3 rounded-2xl border border-border/70 bg-muted/20 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                                    {renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                                  </div>
                                  <span className="text-xs font-bold truncate">{catName}</span>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-blue-600">
                                  {count} Qs
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(15, count * 10))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: 4. MISTAKE REVIEW */}
                {activeTab === 'mistakes' && (
                  <div className="space-y-6">
                    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-amber-500" />
                          <span>Mistake Review (Dib-u-eegidda Khaladaadka)</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Questions you answered incorrectly in past sessions. Practice them until you achieve 100% mastery!
                        </p>
                      </div>

                      {userMistakes.length > 0 && (
                        <button
                          type="button"
                          onClick={handleStartMistakesPractice}
                          className="px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Practice All Mistakes ({userMistakes.length})</span>
                        </button>
                      )}
                    </div>

                    {userMistakes.length === 0 ? (
                      <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto" />
                        <h4 className="text-sm font-bold text-foreground">No Unresolved Mistakes!</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Masha'Allah! You have no unresolved mistakes recorded. Keep challenging yourself in new categories!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userMistakes.map((m, idx) => {
                          const q = VERIFIED_QUESTION_BANK.find((x) => x.id === m.question_id || x.question_id === m.question_id);
                          if (!q) return null;
                          const correctOpt = q.options.find((o) => o.id === q.correct_option_id);

                          return (
                            <div key={idx} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-foreground">
                                  {language === 'so' ? q.question_so : language === 'ar' ? q.question_ar : q.question_en}
                                </span>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 font-bold shrink-0">
                                  Missed {m.times_incorrect}x
                                </span>
                              </div>

                              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Correct Answer: {correctOpt ? (language === 'so' ? correctOpt.text_so : correctOpt.text_en) : ''}
                              </div>

                              <div className="text-[11px] text-muted-foreground font-mono">
                                Proof: {q.source_citation}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: 5. BOOKMARKS */}
                {activeTab === 'bookmarks' && (
                  <div className="space-y-6">
                    <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-blue-600" />
                          <span>Saved Bookmarks (Su'aalaha La Xafiday)</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Questions you saved for deep reflection, memorization, and revision.
                        </p>
                      </div>

                      {bookmarkedQuestionIds.size > 0 && (
                        <button
                          type="button"
                          onClick={handleStartBookmarksPractice}
                          className="px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Practice Bookmarks ({bookmarkedQuestionIds.size})</span>
                        </button>
                      )}
                    </div>

                    {bookmarkedQuestionIds.size === 0 ? (
                      <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-3">
                        <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                        <h4 className="text-sm font-bold text-foreground">No Bookmarks Saved Yet</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Click the bookmark icon on any question card during a quiz to save it here for convenient study!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Array.from(bookmarkedQuestionIds).map((bId) => {
                          const q = VERIFIED_QUESTION_BANK.find((x) => x.id === bId || x.question_id === bId);
                          if (!q) return null;
                          const correctOpt = q.options.find((o) => o.id === q.correct_option_id);

                          return (
                            <div key={bId} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-foreground">
                                  {language === 'so' ? q.question_so : language === 'ar' ? q.question_ar : q.question_en}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleBookmark(bId, q.category)}
                                  className="text-blue-600 hover:text-rose-500 p-1 cursor-pointer"
                                  title="Remove Bookmark"
                                >
                                  <BookmarkCheck className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Answer: {correctOpt ? (language === 'so' ? correctOpt.text_so : correctOpt.text_en) : ''}
                              </div>

                              <div className="text-[11px] text-muted-foreground">
                                Proof: <span className="font-semibold text-foreground">{q.source_citation}</span>
                              </div>

                              <p className="text-[11px] text-muted-foreground p-2 rounded-xl bg-muted/30 border border-border/50">
                                {language === 'so' ? q.explanation_so : q.explanation_en}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 2. ACTIVE QUIZ PLAYING SCREEN */}
            {/* ---------------------------------------------------------------- */}
            {gameState === 'playing' && currentQ && (
              <div className="space-y-4 animate-fade-in">
                {/* Header: Progress, Category, Lifelines & Bookmark */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Progress Info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300">
                        {t('quiz.question', 'Question')} {currentIndex + 1} / {questions.length}
                      </span>
                      <span className="text-xs font-bold uppercase text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                        {getCategoryLocalizedName(currentQ.category)}
                      </span>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400">
                        {currentQ.difficulty}
                      </span>
                      {experienceMode === 'exam' && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black">
                          Exam Mode
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(currentQ.id || currentQ.question_id, currentQ.category)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                          bookmarkedQuestionIds.has(currentQ.id || currentQ.question_id)
                            ? 'bg-blue-500/15 text-blue-600 border-blue-500/40'
                            : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                        }`}
                        title="Bookmark question"
                      >
                        {bookmarkedQuestionIds.has(currentQ.id || currentQ.question_id) ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      {/* Timer (if timed) */}
                      {isTimedMode && (
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tabular-nums transition-colors ${
                            timeLeft <= 10
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 animate-pulse'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeLeft}s</span>
                        </div>
                      )}

                      {/* Score (Practice Mode Only) */}
                      {experienceMode === 'practice' && (
                        <div className="text-xs font-black text-muted-foreground">
                          {t('quiz.score', 'Score')}:{' '}
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{score}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  {/* 3 LIFELINES TOOLBAR (Practice Mode Only) */}
                  {experienceMode === 'practice' && (
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Lifelines:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1. 50/50 Lifeline (usable up to 2 times per session) */}
                        <button
                          type="button"
                          onClick={handleUse5050}
                          disabled={lifeline5050Count <= 0 || isAnswerSubmitted}
                          className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            lifeline5050Count <= 0
                              ? 'bg-muted text-muted-foreground/50 opacity-60 cursor-not-allowed line-through'
                              : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25 ring-1 ring-blue-500/30'
                          }`}
                          title="Eliminate two incorrect answers (Usable up to 2 times)"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>50/50</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            lifeline5050Count <= 0 ? 'bg-muted text-muted-foreground' : 'bg-blue-600 text-white font-bold'
                          }`}>
                            {lifeline5050Count}/2
                          </span>
                        </button>

                        {/* 2. 2 Time Lifeline */}
                        {isTimedMode && (
                          <button
                            type="button"
                            onClick={handleUse2Time}
                            disabled={lifeline2TimeUsed || isAnswerSubmitted}
                            className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              lifeline2TimeUsed
                                ? 'bg-muted text-muted-foreground/50 opacity-60 cursor-not-allowed line-through'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 ring-1 ring-amber-500/30'
                            }`}
                            title="Add 2 minutes to the countdown timer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>+2 Time</span>
                            {lifeline2TimeUsed && (
                              <span className="text-[9px] uppercase font-mono">({t('quiz.used', 'Used')})</span>
                            )}
                          </button>
                        )}

                        {/* 3. Weydii EMufti Lifeline (usable 1 time per session) */}
                        <button
                          type="button"
                          onClick={handleUseAskEMufti}
                          disabled={lifelineAskEMuftiCount <= 0 || isAnswerSubmitted}
                          className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            lifelineAskEMuftiCount <= 0
                              ? 'bg-muted text-muted-foreground/50 opacity-60 cursor-not-allowed line-through'
                              : 'bg-teal-500/15 text-teal-700 dark:text-teal-300 hover:bg-teal-500/25 ring-1 ring-teal-500/30'
                          }`}
                          title="Get scholarly guidance from EMufti AI (Usable 1 time)"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Weydii EMufti</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                            lifelineAskEMuftiCount <= 0 ? 'bg-muted text-muted-foreground' : 'bg-teal-600 text-white font-bold'
                          }`}>
                            {lifelineAskEMuftiCount}/1
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Card */}
                <div className="p-5 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
                  {/* Arabic block if present */}
                  {currentQ.question_ar && (
                    <div
                      className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-right text-base sm:text-lg font-amiri text-foreground"
                      dir="rtl"
                    >
                      {currentQ.question_ar}
                    </div>
                  )}

                  <h2 className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">
                    {getQuestionText(currentQ)}
                  </h2>

                  {/* 4 Shuffled Answer Options with A, B, C, D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayOptions.map((opt, idx) => {
                      const isHidden = hiddenOptionIds.includes(opt.id);
                      const isSelected = selectedOptionId === opt.id;
                      const isCorrect = opt.id === currentQ.correct_option_id;

                      let btnStyle =
                        'border-border/80 hover:border-blue-500 hover:bg-blue-500/5 text-foreground';

                      if (experienceMode === 'exam') {
                        // Exam Mode styling: Highlight selection neutrally without revealing correctness
                        if (isSelected) {
                          btnStyle =
                            'border-blue-500 bg-blue-500/15 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500 font-bold';
                        }
                      } else if (isAnswerSubmitted) {
                        // Practice Mode styling: Immediate correct/incorrect feedback
                        if (isCorrect) {
                          btnStyle =
                            'border-blue-500 bg-blue-500/20 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500 font-bold';
                        } else if (isSelected) {
                          btnStyle =
                            'border-rose-500 bg-rose-500/20 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500 font-bold';
                        } else {
                          btnStyle = 'border-border/40 opacity-50 text-muted-foreground';
                        }
                      }

                      if (isHidden) {
                        return (
                          <div
                            key={opt.id}
                            className="p-4 rounded-2xl border border-dashed border-border/40 bg-muted/20 opacity-30 cursor-not-allowed text-xs text-muted-foreground flex items-center justify-center font-mono min-h-[52px]"
                          >
                            [ 50/50 Eliminated ]
                          </div>
                        );
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={experienceMode === 'practice' && isAnswerSubmitted}
                          onClick={() => handleSelectOption(opt, idx)}
                          className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer min-h-[52px] ${btnStyle}`}
                        >
                          <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-black shrink-0">
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span className="text-xs sm:text-sm font-medium mt-0.5 leading-snug">
                            {getOptionText(opt)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Exam Mode: Bottom Action Bar */}
                  {experienceMode === 'exam' && (
                    <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                      <span className="text-xs text-muted-foreground">
                        {selectedOptionId ? 'Answer recorded' : 'Select an answer to proceed'}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        disabled={!selectedOptionId}
                        className={`px-6 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                          selectedOptionId
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        <span>
                          {currentIndex + 1 < questions.length
                            ? t('common.next', 'Next Question')
                            : 'Submit Exam'}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}

                  {/* Practice Mode: Post-Answer Explanation Card */}
                  {experienceMode === 'practice' && isAnswerSubmitted && (
                    <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {selectedOptionId === currentQ.correct_option_id ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                              <CheckCircle2 className="w-4 h-4" />
                              Correct Answer!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                              <XCircle className="w-4 h-4" />
                              Incorrect Answer
                            </span>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-card px-2.5 py-1 rounded-full border border-border">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{currentQ.source_citation}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {getQuestionExplanation(currentQ)}
                      </p>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span>
                            {currentIndex + 1 < questions.length
                              ? t('common.next', 'Next Question')
                              : t('quiz.completed_title', 'View Results')}
                          </span>
                          <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* 3. RESULTS & REVIEW SCREEN */}
            {/* ---------------------------------------------------------------- */}
            {gameState === 'results' && (
              <div className="space-y-6 animate-fade-in">
                {/* Result Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <h2 className="text-2xl font-black text-foreground">
                    {score / questions.length >= 0.8
                      ? "Masha'Allah! Mumtaaz!"
                      : score / questions.length >= 0.5
                      ? 'Alhamdulillah! Good Knowledge!'
                      : 'Alhamdulillah! Keep Learning!'}
                  </h2>

                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    You answered {score} out of {questions.length} questions correctly (
                    {Math.round((score / questions.length) * 100)}%). Every step in seeking authentic
                    Islamic knowledge is rewarded!
                  </p>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-lg mx-auto">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border text-center">
                      <div className="text-base font-black text-blue-600 dark:text-blue-400">
                        {score} / {questions.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                        Score
                      </div>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border border-border text-center">
                      <div className="text-base font-black text-foreground">
                        {Math.round((score / questions.length) * 100)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                        Accuracy
                      </div>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border border-border text-center">
                      <div className="text-base font-black text-amber-600 dark:text-amber-400">
                        +{score * 10}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                        Points
                      </div>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border border-border text-center">
                      <div className="text-base font-black text-foreground">
                        {sessionElapsedSeconds > 0 ? `${sessionElapsedSeconds}s` : '--'}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                        Time Spent
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
                    {userAnswers.some((a) => !a.isCorrect) && (
                      <button
                        type="button"
                        onClick={handleRetryIncorrect}
                        className="px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>
                          Retry Incorrect ({userAnswers.filter((a) => !a.isCorrect).length})
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => startQuiz()}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t('quiz.play_again', 'Play Again')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGameState('setup')}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <span>Back to Hub</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/chat')}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <span>{t('quiz.return_chat', 'Return to Chat')}</span>
                    </button>
                  </div>
                </div>

                {/* Detailed Answer Review */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Review Your Answers & Sources</span>
                  </h3>

                  <div className="space-y-4">
                    {userAnswers.map((item, idx) => {
                      const displayOpts = item.question.shuffled_options || item.question.options;
                      const selectedOpt = displayOpts.find((o) => o.id === item.selectedOptionId);
                      const correctOpt = displayOpts.find(
                        (o) => o.id === item.question.correct_option_id
                      );
                      const isBookmarked = bookmarkedQuestionIds.has(item.question.id || item.question.question_id);

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border ${
                            item.isCorrect
                              ? 'border-blue-500/40 bg-blue-500/5'
                              : 'border-rose-500/40 bg-rose-500/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-xs sm:text-sm font-bold text-foreground">
                              {idx + 1}. {getQuestionText(item.question)}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleBookmark(item.question.id || item.question.question_id, item.question.category)}
                                className={`p-1 rounded-lg border transition-all cursor-pointer ${
                                  isBookmarked
                                    ? 'bg-blue-500/20 text-blue-600 border-blue-500/40'
                                    : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                                }`}
                                title="Bookmark this question"
                              >
                                {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                              </button>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  item.isCorrect
                                    ? 'bg-blue-500/20 text-blue-800 dark:text-blue-300'
                                    : 'bg-rose-500/20 text-rose-800 dark:text-rose-300'
                                }`}
                              >
                                {item.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs space-y-1">
                            <div className="text-muted-foreground">
                              Your answer:{' '}
                              <span
                                className={
                                  item.isCorrect
                                    ? 'text-blue-600 font-bold'
                                    : 'text-rose-600 font-bold'
                                }
                              >
                                {selectedOpt ? getOptionText(selectedOpt) : 'None / Time Expired'}
                              </span>
                            </div>
                            {!item.isCorrect && correctOpt && (
                              <div className="text-blue-600 dark:text-blue-400 font-medium">
                                Correct answer: {getOptionText(correctOpt)}
                              </div>
                            )}
                            <div className="text-[11px] text-muted-foreground pt-1">
                              Reference:{' '}
                              <span className="font-semibold text-foreground">
                                {item.question.source_citation}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground pt-0.5 leading-relaxed bg-background/50 p-2 rounded-lg border border-border/50">
                              <span className="font-semibold text-foreground">Explanation: </span>
                              {getQuestionExplanation(item.question)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        {gameState !== 'playing' && activeTab !== 'leaderboard' && <BottomNavigation />}

      {/* Ask EMufti Modal */}
      {askEMuftiModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {t('quiz.lifeline_ask', 'Ask EMufti')} — Scholarly Guidance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAskEMuftiModalContent(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed">
              {askEMuftiModalContent}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAskEMuftiModalContent(null)}
                className="px-5 py-2 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Confetti Particle System */}
      <QuizConfetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};
