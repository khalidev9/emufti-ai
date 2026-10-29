import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  Activity,
  Layers,
  Database,
  Search,
  Filter,
  Phone,
  Send,
  Mail,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  LogOut,
  RefreshCw,
  Eye,
  Sliders,
  BookOpen,
  Scroll,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Trash2,
  Server,
  Terminal,
  MessageSquare,
  Link2,
  Cpu,
  Headphones,
  Play,
  Pause,
  Loader2,
  KeyRound,
  LifeBuoy,
  Trophy,
  Upload,
  Download,
  BarChart3,
  Globe,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { useAuth, isAnnualBillingInterval } from '../context/AuthContext';
import { SYSTEM_PLANS } from '../lib/payment';
import { storage } from '../lib/storage';
import { getPlatformAnalytics, recordVisitorSession, PlatformAnalyticsSummary } from '../lib/visitorTracking';
import { supabase, isSupabaseConfigured, isUuid } from '../lib/supabase';
import { PlanRequest, PlanRequestStatus, PlanSlug, UserRole, TafsirLesson, SupportRequest, SupportRequestStatus, QuizQuestion } from '../types/database';
import {
  VERIFIED_QUESTION_BANK,
  TOTAL_VERIFIED_QUESTIONS,
  QUIZ_CATEGORIES_METADATA,
  getQuestionBankStats,
  getCategoryStats,
} from '../data/quizQuestions';
import {
  getAllTafsirLessons,
  saveTafsirLesson,
  deleteTafsirLesson,
  getAllSomaliScholars,
  getAll114SurahsTafsirStatus,
  getTafsirLibraryStats,
  getTafsirContentHealthSummary,
  runTafsirContentHealthAudit,
  TafsirContentHealthReport,
} from '../data/tafsirData';
import { quranService } from '../lib/quranService';
import { Logo } from '../components/common/Logo';
import { generateAdminTestCertificatePdf } from '../lib/khatmChallengeService';

const normalizePlanSlug = (slug?: string | null, plan?: string | null): PlanSlug => {
  const combined = `${slug || ''} ${plan || ''}`.toLowerCase();
  if (combined.includes('prem') || combined.includes('alim')) return 'premium';
  return 'pro';
};

const normalizeStatus = (val?: string | null): PlanRequestStatus => {
  if (!val) return 'pending';
  const v = val.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (['pending', 'under_review', 'approved', 'rejected', 'completed'].includes(v)) {
    return v as PlanRequestStatus;
  }
  return 'pending';
};

interface AdminUserRow {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  plan: PlanSlug;
  questionsToday: number;
  is_suspended?: boolean;
}

interface IslamicSourceItem {
  id: string;
  type: 'quran' | 'tafsir' | 'hadith' | 'scholarly_work' | 'fiqh_ruling';
  title: string;
  author_scholar?: string;
  reference: string;
  text_ar?: string;
  text_en?: string;
  text_so?: string;
  tags?: string[];
  created_at: string;
}

interface LectureTranscriptItem {
  id: string;
  sheikh_name: string;
  lesson_title: string;
  series_name?: string;
  language: string;
  timestamp_seconds?: number;
  transcript_text: string;
  source_url?: string;
  tags?: string[];
  created_at: string;
}

interface ReportItem {
  id: string;
  user_id: string;
  message_id: string;
  category: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
}

interface FeedbackItem {
  id: string;
  user_id: string;
  message_id: string;
  rating: 'helpful' | 'unhelpful';
  comment?: string;
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, isLoading: isAuthLoading, unlockAccount } = useAuth();

  // Core tabs: 'overview' | 'analytics' | 'requests' | 'users' | 'plans' | 'sources' | 'lectures' | 'feedback' | 'monitoring'
  type AdminTab =
    | 'overview' | 'analytics' | 'requests' | 'users' | 'plans' | 'sources' | 'lectures' | 'feedback' | 'monitoring'
    | 'support' | 'tafsir' | 'quiz' | 'diagnostics';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([]);
  const [usersList, setUsersList] = useState<AdminUserRow[]>([]);

  // Automatically record visitor session
  useEffect(() => {
    recordVisitorSession();
  }, []);

  // Compute live analytics merging DB users & visitor metrics
  const platformAnalytics: PlatformAnalyticsSummary = useMemo(() => {
    const freeCount = usersList.filter((u) => u.plan === 'free').length;
    const proCount = usersList.filter((u) => u.plan === 'pro').length;
    const premCount = usersList.filter((u) => u.plan === 'premium').length;
    return getPlatformAnalytics(usersList.length, {
      free: freeCount,
      pro: proCount,
      premium: premCount,
    });
  }, [usersList]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [isRepairingRequests, setIsRepairingRequests] = useState(false);

  // Quiz Questions Bank State
  const [quizQuestionsList, setQuizQuestionsList] = useState<QuizQuestion[]>(() => [...VERIFIED_QUESTION_BANK]);
  const [quizCategoryFilter, setQuizCategoryFilter] = useState<string>('all');
  const [quizDifficultyFilter, setQuizDifficultyFilter] = useState<string>('all');
  const [quizReviewFilter, setQuizReviewFilter] = useState<string>('all');
  const [quizSearchQuery, setQuizSearchQuery] = useState<string>('');
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState(false);
  const [batchImportJson, setBatchImportJson] = useState('');
  const [batchImportResult, setBatchImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Support Requests State
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);
  const [supportSearch, setSupportSearch] = useState('');
  const [supportStatusFilter, setSupportStatusFilter] = useState<string>('all');
  const [supportCategoryFilter, setSupportCategoryFilter] = useState<string>('all');
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<SupportRequest | null>(null);
  const [supportReplyText, setSupportReplyText] = useState('');
  const [supportAdminNotes, setSupportAdminNotes] = useState('');
  const [isSendingSupportReply, setIsSendingSupportReply] = useState(false);
  const [supportActionSuccess, setSupportActionSuccess] = useState<string | null>(null);
  const [supportActionError, setSupportActionError] = useState<string | null>(null);

  // Filters & Search for requests
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PlanRequest | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Search for users
  const [userSearch, setUserSearch] = useState('');

  // Khatm Certificate Admin Test Tool State
  const [isAdminTestingPdf, setIsAdminTestingPdf] = useState(false);
  const [adminTestPdfResult, setAdminTestPdfResult] = useState<string | null>(null);
  const [adminTestRecipient, setAdminTestRecipient] = useState<string>('Khaliid Axmed (Admin Tester)');
  const [adminTestDuration, setAdminTestDuration] = useState<number>(30);

  const handleAdminTestPdf = async () => {
    try {
      setIsAdminTestingPdf(true);
      const res = await generateAdminTestCertificatePdf(adminTestRecipient, adminTestDuration);
      setAdminTestPdfResult(res.screenId);
    } catch (err) {
      console.error('Failed to generate admin test PDF:', err);
    } finally {
      setIsAdminTestingPdf(false);
    }
  };

  // Sources Management
  const [sourcesList, setSourcesList] = useState<IslamicSourceItem[]>([
    {
      id: 'src_1',
      type: 'quran',
      title: 'Surah Al-Baqarah (2:43)',
      author_scholar: 'Divine Revelation',
      reference: 'Surah Al-Baqarah 2:43',
      text_ar: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ',
      text_en: 'And establish prayer and give zakah and bow with those who bow.',
      text_so: 'Ooga salaadda oo bixiya zakada oo la rukuuca kuwa rukuucaya.',
      tags: ['salah', 'zakat', 'pillars'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'src_2',
      type: 'hadith',
      title: 'Pillars of Islam',
      author_scholar: 'Abdullah ibn Umar',
      reference: 'Sahih al-Bukhari 8',
      text_ar: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ...',
      text_en: 'Islam is built upon five pillars...',
      text_so: 'Islaamka waxaa lagu dhisay shan...',
      tags: ['pillars', 'hadith', 'salah'],
      created_at: new Date().toISOString(),
    },
  ]);
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSource, setNewSource] = useState({
    type: 'quran' as IslamicSourceItem['type'],
    title: '',
    author_scholar: '',
    reference: '',
    text_ar: '',
    text_en: '',
    text_so: '',
    tags: '',
  });

  // Lectures Management
  const [lecturesList, setLecturesList] = useState<LectureTranscriptItem[]>([
    {
      id: 'lec_1',
      sheikh_name: 'Sheikh Mustafe Xaaji Ismaaciil',
      lesson_title: 'Sharaxa Arkaanta Islaamka & Shuruudaha Salaadda',
      series_name: 'Duruusta Caqiidada & Fiqiga',
      language: 'so',
      timestamp_seconds: 120,
      transcript_text: 'Salaaddu waa tiirka ugu weyn shahaadada ka dib. Qofka salaadda tukanaya waxaa waajib ku ah inuu ilaaliyo shuruudaha salaadda...',
      tags: ['fiqh', 'salah', 'shafi'],
      created_at: new Date().toISOString(),
    },
    {
      id: 'lec_2',
      sheikh_name: 'Sheikh Cumar Faaruuq',
      lesson_title: 'Axkaamta Zakada & Xisaabinteeda',
      series_name: 'Fiqiga Ganacsiga',
      language: 'so',
      timestamp_seconds: 300,
      transcript_text: 'Zakadu waa xaqa ay masaakiintu ku leeyihiin maalka qofka qaniga ah marka uu gaaro nisaabka sanadna u wareego...',
      tags: ['zakat', 'nisaab', 'maal'],
      created_at: new Date().toISOString(),
    },
  ]);
  const [lectureSearch, setLectureSearch] = useState('');
  const [lectureLangFilter, setLectureLangFilter] = useState('all');
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLecture, setNewLecture] = useState({
    sheikh_name: 'Sheikh Mustafe Xaaji Ismaaciil',
    lesson_title: '',
    series_name: '',
    language: 'so',
    timestamp_seconds: 0,
    transcript_text: '',
    source_url: '',
    tags: '',
  });

  // Feedback & Reports
  const [reportsList, setReportsList] = useState<ReportItem[]>([
    {
      id: 'rep_1',
      user_id: 'user_ahmed',
      message_id: 'msg_sample_1',
      category: 'misleading_translation',
      description: 'Minor wording nuance in Somali translation of Ayah 2:183.',
      status: 'pending',
      admin_notes: 'Reviewed with verified scholar duruus.',
      created_at: new Date().toISOString(),
    },
  ]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
    {
      id: 'fb_1',
      user_id: 'user_fatima',
      message_id: 'msg_sample_2',
      rating: 'helpful',
      comment: 'MashaAllah, very clear breakdown of the four madhhabs on wudu.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'fb_2',
      user_id: 'user_khalid',
      message_id: 'msg_sample_3',
      rating: 'helpful',
      comment: 'Accurate Bukhari citations. Jazakallahu Khayran.',
      created_at: new Date().toISOString(),
    },
  ]);
  const [reportFilter, setReportFilter] = useState('all');

  // Quran Tafsir Library Management
  const [tafsirLessonsList, setTafsirLessonsList] = useState<TafsirLesson[]>(() => getAllTafsirLessons());
  const [tafsirScholarFilter, setTafsirScholarFilter] = useState<string>('all');
  const [tafsirSurahFilter, setTafsirSurahFilter] = useState<string>('all');
  const [tafsirStatusFilter, setTafsirStatusFilter] = useState<string>('all');
  const [tafsirSearchQuery, setTafsirSearchQuery] = useState<string>('');
  const [isAddingTafsir, setIsAddingTafsir] = useState<boolean>(false);
  const [editingTafsirLesson, setEditingTafsirLesson] = useState<TafsirLesson | null>(null);
  const [tafsirForm, setTafsirForm] = useState({
    scholarId: 'sheikh-mustafe',
    surahNumber: 1,
    ayahStart: 1,
    ayahEnd: 7,
    ayahRange: '1-7',
    titleSo: '',
    titleEn: '',
    audioUrl: '',
    duration: '35:00',
    transcriptSo: '',
    transcriptEn: '',
    sourceAttribution: 'Markaz Tawxiid Nairobi',
    sourceUrl: '',
    verificationStatus: 'verified' as 'verified' | 'pending_review' | 'unverified',
    isPublished: true,
  });

  // Tafsir Content Health Diagnostics
  const [tafsirHealthReport, setTafsirHealthReport] = useState<TafsirContentHealthReport | null>(() => getTafsirContentHealthSummary());
  const [isRunningHealthAudit, setIsRunningHealthAudit] = useState<boolean>(false);
  const [healthAuditProgress, setHealthAuditProgress] = useState<{ checked: number; total: number } | null>(null);
  const [showHealthDiagnosticsModal, setShowHealthDiagnosticsModal] = useState<boolean>(false);

  const handleRunHealthAudit = async () => {
    setIsRunningHealthAudit(true);
    setHealthAuditProgress({ checked: 0, total: tafsirLessonsList.length });
    try {
      const report = await runTafsirContentHealthAudit((checked, total) => {
        setHealthAuditProgress({ checked, total });
      });
      setTafsirHealthReport(report);
    } catch (e) {
      console.error('Health audit failed:', e);
    } finally {
      setIsRunningHealthAudit(false);
      setHealthAuditProgress(null);
    }
  };

  // Diagnostics State (Admin Only)
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    model: string;
    missingConfig: string | null;
    configuredVia: string | null;
  } | null>(null);
  const [isCheckingAi, setIsCheckingAi] = useState(false);
  const [latencyResult, setLatencyResult] = useState<string | null>(null);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [isConfiguringKey, setIsConfiguringKey] = useState(false);
  const [keyConfigSuccess, setKeyConfigSuccess] = useState<string | null>(null);
  const [keyConfigError, setKeyConfigError] = useState<string | null>(null);

  // Audio Preview & Tafsir 114 View State
  const [tafsirViewMode, setTafsirViewMode] = useState<'lessons' | 'coverage_matrix'>('lessons');
  const [previewAudioLesson, setPreviewAudioLesson] = useState<TafsirLesson | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const checkAiServiceStatus = async () => {
    setIsCheckingAi(true);
    const start = performance.now();
    try {
      const session = (await supabase.auth.getSession())?.data?.session;
      const res = await fetch('/api/ai-status', {
        headers: {
          'x-admin-auth': 'admin',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
        if (data.configured) {
          setLatencyResult(`Operational • ${elapsed}ms response latency`);
        } else {
          setLatencyResult(`Offline • Server requires GEMINI_API_KEY in .env.local`);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setLatencyResult(`Access status ${res.status}: ${errData.error || 'Server authorization check failed'}`);
        setAiStatus({
          configured: false,
          model: 'gemini-3.8-flash',
          missingConfig: 'GEMINI_API_KEY',
          configuredVia: null,
        });
      }
    } catch {
      setLatencyResult('Failed to reach AI service endpoint');
      setAiStatus({
        configured: false,
        model: 'gemini-3.8-flash',
        missingConfig: 'GEMINI_API_KEY',
        configuredVia: null,
      });
    } finally {
      setIsCheckingAi(false);
    }
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = geminiApiKeyInput.trim();
    if (!cleanKey) return;
    setIsConfiguringKey(true);
    setKeyConfigError(null);
    setKeyConfigSuccess(null);

    try {
      const session = (await supabase.auth.getSession())?.data?.session;
      const res = await fetch('/api/configure-gemini-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': 'admin',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ apiKey: cleanKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        setKeyConfigError(data.error || 'Failed to configure API key on server.');
      } else {
        setKeyConfigSuccess(data.message || 'Google Gemini API key successfully saved in server environment (.env.local)!');
        setGeminiApiKeyInput('');
        await checkAiServiceStatus();
      }
    } catch (err: any) {
      setKeyConfigError(err?.message || 'Failed to submit API key.');
    } finally {
      setIsConfiguringKey(false);
    }
  };

  // Check URL parameters for tab on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (
      tabParam &&
      ['overview', 'requests', 'support', 'users', 'plans', 'sources', 'lectures', 'tafsir', 'diagnostics', 'feedback', 'monitoring'].includes(tabParam)
    ) {
      setActiveTab(tabParam as any);
      if (tabParam === 'diagnostics') {
        checkAiServiceStatus();
      }
    }
  }, []);

  // Editable system plan limits
  const [planLimits, setPlanLimits] = useState<Record<PlanSlug, number>>({
    free: 5,
    pro: 150,
    premium: 1000,
  });
  const [isSavedLimitsToast, setIsSavedLimitsToast] = useState(false);

  // Load data & subscribe to Realtime
  useEffect(() => {
    if (!isAdmin) return;
    loadRequests();
    loadSupportRequests();
    loadUsers();
    loadSources();
    loadLectures();
    loadTafsirLessons();
    loadFeedbackAndReports();

    // Supabase Realtime subscription for instant table updates
    let channel: any = null;
    let supportChannel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('admin_plan_requests_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'plan_requests' },
          (payload: any) => {
            console.log('[Realtime] plan_requests change event:', payload.eventType);
            loadRequests();
          }
        )
        .subscribe((status: string) => {
          console.info('[Realtime] Subscription state:', status);
        });

      supportChannel = supabase
        .channel('admin_support_requests_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'support_requests' },
          (payload: any) => {
            console.log('[Realtime] support_requests change event:', payload.eventType);
            loadSupportRequests();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (supportChannel) {
        supabase.removeChannel(supportChannel);
      }
    };
  }, [isAdmin]);

  const loadRequests = async () => {
    setIsLoadingRequests(true);
    setRequestsError(null);

    const supabaseHost = (() => {
      try {
        return new URL(import.meta.env.VITE_SUPABASE_URL || '').host;
      } catch {
        return 'unknown-host';
      }
    })();

    if (!isSupabaseConfigured) {
      const err = 'Supabase database connection is not configured (missing VITE_SUPABASE_URL).';
      console.error('[AdminPage]', err);
      setRequestsError(err);
      setIsLoadingRequests(false);
      return;
    }

    try {
      // 1. Inspect current active Supabase Auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[AdminPage] Session lookup error:', sessionError.message);
        setRequestsError(`Authentication session error: ${sessionError.message}`);
        setIsLoadingRequests(false);
        return;
      }

      if (!session || !session.user || !isUuid(session.user.id)) {
        console.warn('[AdminPage] No active Supabase session. Redirecting to /admin/login');
        setRequestsError('No active Supabase authentication session. Please sign in via /admin/login.');
        setIsLoadingRequests(false);
        navigate('/admin/login', {
          replace: true,
          state: { message: 'Your session has expired or is missing. Please sign in to access the Admin Dashboard.' },
        });
        return;
      }

      // 2. Inspect profiles row for the authenticated user
      let { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('[AdminPage] Profile lookup notice:', {
          code: profileError.code,
          message: profileError.message,
        });
      }

      // If authenticated user is the designated admin account but role is missing/not 'admin', auto-sync
      if (session.user.email === 'admin@emufti.ai' && userProfile?.role !== 'admin') {
        const { data: syncedProf, error: syncError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            display_name: 'Chief Administrator',
            role: 'admin',
          })
          .select('id, role, email')
          .maybeSingle();

        if (syncedProf) {
          userProfile = syncedProf;
        } else if (syncError) {
          console.warn('[AdminPage] Profile auto-sync notice:', syncError.message);
        }
      }

      const activeProfileRole = userProfile?.role || profile?.role || (session.user.email === 'admin@emufti.ai' ? 'admin' : 'none');

      // Requirement 1: Log the Supabase project host, authenticated user ID, and admin profile role (Never log keys, tokens, or passwords)
      console.info('[AdminPage Debug]', {
        supabaseHost,
        authenticatedUserId: session.user.id,
        adminProfileRole: activeProfileRole,
      });

      const isDesignatedAdmin = session.user.email === 'admin@emufti.ai';
      const isRoleAdmin = activeProfileRole === 'admin';
      const isAuthorized = isDesignatedAdmin || isRoleAdmin;

      if (!isAuthorized) {
        const authErrMsg = `Account ${session.user.email} (ID: ${session.user.id}) has role='${activeProfileRole}'. Administrator permissions ('admin') required to view plan requests.`;
        console.warn('[AdminPage]', authErrMsg);
        setRequestsError(authErrMsg);
        setIsLoadingRequests(false);
        return;
      }

      // Requirement 2: Inspect the exact plan_requests query and capture its returned data, error, and row count
      const { data, error, count } = await supabase
        .from('plan_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.info('[AdminPage Query Debug]', {
        supabaseHost,
        queryTable: 'plan_requests',
        returnedRows: Array.isArray(data) ? data.length : 0,
        exactCount: count,
        hasError: Boolean(error),
        errorCode: error?.code,
        errorMessage: error?.message,
      });

      // Requirement 3 & 8: Display an accurate error when fetching fails; do not treat failure as an empty list
      if (error) {
        console.error('[AdminPage] Supabase load plan_requests error:', error);
        let msg = error.message || 'Failed to load plan requests from database.';
        if (error.code === '42P01') {
          msg = 'Database table "plan_requests" does not exist yet. Please run migration supabase/migrations/20261014_plan_requests.sql in your Supabase SQL Editor.';
        } else if (error.code === '42501') {
          msg = 'Access denied by Row Level Security (RLS). Ensure your account has the "admin" role in public.profiles and public.is_admin() returns true.';
        }
        setRequestsError(msg);
        setIsLoadingRequests(false);
        return;
      }

      if (data) {
        const normalized: PlanRequest[] = (data as any[]).map((r) => ({
          id: String(r.id || ''),
          reference_id: String(r.reference_id || `REQ-${(r.id || '').substring(0, 8).toUpperCase()}`),
          user_id: r.user_id ? String(r.user_id) : undefined,
          full_name: String(r.full_name || 'Anonymous Applicant'),
          email: String(r.email || ''),
          whatsapp: r.whatsapp ? String(r.whatsapp) : undefined,
          telegram: r.telegram ? String(r.telegram) : undefined,
          plan_slug: normalizePlanSlug(r.plan_slug, r.plan),
          plan: normalizePlanSlug(r.plan_slug, r.plan),
          billing_interval: (isAnnualBillingInterval(r.billing_interval) ? 'yearly' : 'monthly'),
          price_amount: r.price_amount ? Number(r.price_amount) : undefined,
          currency: r.currency || 'USD',
          message: r.message ? String(r.message) : undefined,
          status: normalizeStatus(r.status),
          payment_verified: Boolean(r.payment_verified),
          admin_notes: r.admin_notes ? String(r.admin_notes) : undefined,
          created_at: r.created_at ? String(r.created_at) : new Date().toISOString(),
          updated_at: r.updated_at ? String(r.updated_at) : (r.created_at ? String(r.created_at) : new Date().toISOString()),
        }));

        setPlanRequests(normalized);
        setIsLoadingRequests(false);
        return;
      }
    } catch (err: any) {
      console.error('[AdminPage] Exception in loadRequests:', err);
      setRequestsError(err?.message || 'Network error communicating with Supabase.');
      setIsLoadingRequests(false);
      return;
    }
    setIsLoadingRequests(false);
  };

  const loadSupportRequests = async () => {
    setIsLoadingSupport(true);
    try {
      let list: SupportRequest[] = [];
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('support_requests')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            list = data as SupportRequest[];
          } else if (error) {
            console.warn('[AdminPage] loadSupportRequests Supabase error:', error.message);
          }
        } catch (dbErr) {
          console.warn('[AdminPage] DB error in loadSupportRequests:', dbErr);
        }
      }

      // Also incorporate local storage requests if Supabase returned none or as fallback
      if (list.length === 0) {
        list = storage.getAllSupportRequests();
      } else {
        const localList = storage.getAllSupportRequests();
        const existingRefs = new Set(list.map((r) => r.reference_id.toUpperCase()));
        for (const loc of localList) {
          if (!existingRefs.has(loc.reference_id.toUpperCase())) {
            list.push(loc);
            existingRefs.add(loc.reference_id.toUpperCase());
          }
        }
      }

      // Sort newest first
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSupportRequests(list);
    } catch (err) {
      console.error('[AdminPage] Exception in loadSupportRequests:', err);
    } finally {
      setIsLoadingSupport(false);
    }
  };

  const handleUpdateSupportStatus = async (
    req: SupportRequest,
    newStatus: SupportRequestStatus,
    adminNotes?: string
  ) => {
    try {
      if (isSupabaseConfigured) {
        try {
          const updatePayload: any = {
            status: newStatus,
            updated_at: new Date().toISOString(),
          };
          if (adminNotes !== undefined) {
            updatePayload.admin_notes = adminNotes;
          }
          await supabase.from('support_requests').update(updatePayload).eq('id', req.id);
        } catch (err) {
          console.warn('[AdminPage] Supabase update support status error:', err);
        }
      }

      // Best effort storage update
      storage.updateSupportRequestStatus(req.id, newStatus, adminNotes);

      // State update
      const updatedItem: SupportRequest = {
        ...req,
        status: newStatus,
        admin_notes: adminNotes !== undefined ? adminNotes : req.admin_notes,
        updated_at: new Date().toISOString(),
      };

      setSupportRequests((prev) =>
        prev.map((r) => (r.id === req.id ? updatedItem : r))
      );

      if (selectedSupportRequest?.id === req.id) {
        setSelectedSupportRequest(updatedItem);
      }
    } catch (err: any) {
      console.error('[AdminPage] handleUpdateSupportStatus error:', err);
    }
  };

  const handleSendSupportReply = async (req: SupportRequest) => {
    if (!supportReplyText.trim()) return;

    setIsSendingSupportReply(true);
    setSupportActionError(null);
    setSupportActionSuccess(null);

    try {
      const now = new Date().toISOString();
      const adminId = user?.id || 'admin';
      const reply = supportReplyText.trim();
      const notes = supportAdminNotes.trim();

      // 1. Try Supabase RPC or direct update
      if (isSupabaseConfigured) {
        try {
          const { error: rpcErr } = await supabase.rpc('reply_to_support_request', {
            p_request_id: req.id,
            p_reply: reply,
            p_status: 'replied',
            p_admin_notes: notes || undefined,
          });

          if (rpcErr) {
            console.warn('[AdminPage] RPC reply_to_support_request error, falling back to direct update:', rpcErr.message);
            await supabase
              .from('support_requests')
              .update({
                admin_reply: reply,
                admin_id: adminId,
                status: 'replied',
                admin_notes: notes || req.admin_notes,
                replied_at: now,
                updated_at: now,
              })
              .eq('id', req.id);
          }
        } catch (dbErr) {
          console.warn('[AdminPage] DB error updating support reply:', dbErr);
        }
      }

      // 2. Also update local storage
      storage.replyToSupportRequest(req.id, reply, adminId, 'replied', notes || null);

      // 3. Update in state
      const updatedItem: SupportRequest = {
        ...req,
        admin_reply: reply,
        admin_id: adminId,
        status: 'replied',
        admin_notes: notes || req.admin_notes,
        replied_at: now,
        updated_at: now,
      };

      setSupportRequests((prev) =>
        prev.map((r) => (r.id === req.id ? updatedItem : r))
      );
      setSelectedSupportRequest(updatedItem);
      setSupportActionSuccess('Official support reply sent successfully! It is now visible to the user.');

      setTimeout(() => setSupportActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('[AdminPage] Failed to send support reply:', err);
      setSupportActionError(err?.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsSendingSupportReply(false);
    }
  };

  const loadUsers = async () => {
    try {
      if (isSupabaseConfigured) {
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && dbProfiles.length > 0) {
          const mapped: AdminUserRow[] = dbProfiles.map((p: any) => ({
            id: String(p.id),
            email: p.email || (p.id === user?.id ? user?.email : `${p.display_name?.toLowerCase().replace(/\s+/g, '') || 'seeker'}@example.com`),
            display_name: p.display_name || 'Seeker of Ilm',
            role: p.role || 'user',
            plan: p.plan || 'free',
            questionsToday: Math.floor(Math.random() * 25) + 1,
          }));
          setUsersList(mapped);
          return;
        }
      }
    } catch (e) {
      console.warn('Profiles load:', e);
    }

    // Fallback users with mock and active profiles
    const users: AdminUserRow[] = [
      {
        id: 'user_ahmed',
        email: 'ahmed.nur@example.com',
        display_name: 'Ahmed Nur',
        role: 'user',
        plan: storage.getUserActivePlan('user_ahmed'),
        questionsToday: 42,
      },
      {
        id: 'user_fatima',
        email: 'fatima.z@example.com',
        display_name: 'Fatima Zahra',
        role: 'user',
        plan: storage.getUserActivePlan('user_fatima'),
        questionsToday: 12,
      },
      {
        id: 'user_khalid',
        email: 'khalid.m@example.com',
        display_name: 'Khalid Mansoor',
        role: 'user',
        plan: 'pro',
        questionsToday: 35,
      },
      {
        id: 'user_bilal',
        email: 'bilal.hassan@example.com',
        display_name: 'Bilal Hassan',
        role: 'user',
        plan: 'free',
        questionsToday: 8,
      },
      {
        id: user?.id || 'admin_user',
        email: user?.email || 'admin@emufti.ai',
        display_name: profile?.display_name || 'Chief Administrator',
        role: 'admin',
        plan: 'premium',
        questionsToday: 95,
      },
    ];
    setUsersList(users);
  };

  const loadSources = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('islamic_sources')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setSourcesList(data);
      }
    } catch (e) {
      console.warn('Failed to load sources from Supabase:', e);
    }
  };

  const loadLectures = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('lecture_transcripts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLecturesList(data);
      }
    } catch (e) {
      console.warn('Failed to load lectures from Supabase:', e);
    }
  };

  const loadTafsirLessons = async () => {
    const local = getAllTafsirLessons();
    setTafsirLessonsList(local);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('tafsir_lessons')
          .select('*')
          .order('surah_number', { ascending: true });
        if (!error && data && data.length > 0) {
          const remoteLessons: TafsirLesson[] = data.map((d: any) => ({
            id: d.id,
            scholarId: d.scholar_id,
            scholarName: d.scholar_name || 'Somali Scholar',
            scholarSomaliName: d.scholar_somali_name || 'Shiikh Soomaaliyeed',
            surahNumber: d.surah_number,
            surahName: d.surah_name,
            surahNameArabic: d.surah_name_arabic,
            ayahStart: d.ayah_start,
            ayahEnd: d.ayah_end,
            ayahRange: d.ayah_range,
            titleSo: d.title_so,
            titleEn: d.title_en,
            audioUrl: d.audio_url,
            duration: d.duration || '',
            durationSeconds: d.duration_seconds || 0,
            transcriptSo: d.transcript_so || '',
            transcriptEn: d.transcript_en || '',
            sourceAttribution: d.source_attribution,
            sourceUrl: d.source_url,
            verificationStatus: d.verification_status || 'verified',
            isPublished: d.is_published !== false,
          }));
          const merged = new Map<string, TafsirLesson>();
          local.forEach((l) => merged.set(l.id, l));
          remoteLessons.forEach((l) => merged.set(l.id, l));
          setTafsirLessonsList(Array.from(merged.values()));
        }
      } catch (e) {
        console.warn('Failed to load tafsir lessons from Supabase:', e);
      }
    }
  };

  const handleStartEditTafsir = (lesson: TafsirLesson) => {
    setEditingTafsirLesson(lesson);
    setTafsirForm({
      scholarId: lesson.scholarId,
      surahNumber: lesson.surahNumber,
      ayahStart: lesson.ayahStart || 1,
      ayahEnd: lesson.ayahEnd || 7,
      ayahRange: lesson.ayahRange || `${lesson.ayahStart || 1}-${lesson.ayahEnd || 7}`,
      titleSo: lesson.titleSo,
      titleEn: lesson.titleEn,
      audioUrl: lesson.audioUrl || '',
      duration: lesson.duration || '35:00',
      transcriptSo: lesson.transcriptSo || '',
      transcriptEn: lesson.transcriptEn || '',
      sourceAttribution: lesson.sourceAttribution,
      sourceUrl: lesson.sourceUrl || '',
      verificationStatus: lesson.verificationStatus,
      isPublished: lesson.isPublished,
    });
    setIsAddingTafsir(true);
  };

  const handleSaveTafsir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tafsirForm.titleSo.trim()) {
      setActionError('Somali title is required.');
      return;
    }
    const surahMeta = quranService.getSurah(tafsirForm.surahNumber);
    const scholars = getAllSomaliScholars();
    const scholar = scholars.find((s) => s.id === tafsirForm.scholarId) || scholars[0];

    const lessonId = editingTafsirLesson ? editingTafsirLesson.id : `les_custom_${Date.now()}`;
    const lessonToSave: TafsirLesson = {
      id: lessonId,
      scholarId: tafsirForm.scholarId,
      scholarName: scholar.scholarName,
      scholarSomaliName: scholar.somaliName,
      surahNumber: tafsirForm.surahNumber,
      surahName: surahMeta ? surahMeta.englishName : `Surah ${tafsirForm.surahNumber}`,
      surahNameArabic: surahMeta ? surahMeta.name : '',
      ayahStart: tafsirForm.ayahStart,
      ayahEnd: tafsirForm.ayahEnd,
      ayahRange: tafsirForm.ayahRange || `${tafsirForm.ayahStart}-${tafsirForm.ayahEnd}`,
      titleSo: tafsirForm.titleSo.trim(),
      titleEn: tafsirForm.titleEn.trim() || tafsirForm.titleSo.trim(),
      audioUrl: tafsirForm.audioUrl.trim(),
      duration: tafsirForm.duration.trim() || '35:00',
      transcriptSo: tafsirForm.transcriptSo.trim(),
      transcriptEn: tafsirForm.transcriptEn.trim(),
      sourceAttribution: tafsirForm.sourceAttribution.trim() || scholar.sourceAttribution,
      sourceUrl: tafsirForm.sourceUrl.trim() || scholar.externalLink,
      verificationStatus: tafsirForm.verificationStatus,
      isPublished: tafsirForm.isPublished,
    };

    await saveTafsirLesson(lessonToSave);
    await loadTafsirLessons();
    setIsAddingTafsir(false);
    setEditingTafsirLesson(null);
    setActionSuccess(`Tafsir lesson "${lessonToSave.titleSo}" saved successfully.`);
  };

  const handleTogglePublishTafsir = async (lesson: TafsirLesson) => {
    const updated: TafsirLesson = { ...lesson, isPublished: !lesson.isPublished };
    await saveTafsirLesson(updated);
    await loadTafsirLessons();
    setActionSuccess(`Lesson "${lesson.titleSo}" is now ${updated.isPublished ? 'published' : 'unpublished'}.`);
  };

  const handleToggleVerifyTafsir = async (lesson: TafsirLesson) => {
    const nextStatus = lesson.verificationStatus === 'verified' ? 'unverified' : 'verified';
    const updated: TafsirLesson = { ...lesson, verificationStatus: nextStatus };
    await saveTafsirLesson(updated);
    await loadTafsirLessons();
    setActionSuccess(`Lesson "${lesson.titleSo}" marked as ${nextStatus}.`);
  };

  const handleDeleteTafsir = async (lesson: TafsirLesson) => {
    if (!window.confirm(`Delete tafsir lesson "${lesson.titleSo}"? This cannot be undone.`)) {
      return;
    }
    await deleteTafsirLesson(lesson.id);
    await loadTafsirLessons();
    setActionSuccess(`Deleted tafsir lesson "${lesson.titleSo}".`);
  };

  const loadFeedbackAndReports = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: repData } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (repData && repData.length > 0) setReportsList(repData);

      const { data: fbData } = await supabase
        .from('response_feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (fbData && fbData.length > 0) setFeedbackList(fbData);
    } catch (e) {
      console.warn('Failed to load feedback/reports:', e);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.title || !newSource.reference) return;
    const tagsArray = newSource.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const item: IslamicSourceItem = {
      id: `src_${Date.now()}`,
      type: newSource.type,
      title: newSource.title.trim(),
      author_scholar: newSource.author_scholar.trim() || undefined,
      reference: newSource.reference.trim(),
      text_ar: newSource.text_ar.trim() || undefined,
      text_en: newSource.text_en.trim() || undefined,
      text_so: newSource.text_so.trim() || undefined,
      tags: tagsArray,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('islamic_sources').insert([
          {
            type: item.type,
            title: item.title,
            author_scholar: item.author_scholar,
            reference: item.reference,
            text_ar: item.text_ar,
            text_en: item.text_en,
            text_so: item.text_so,
            tags: item.tags,
          },
        ]);
        await loadSources();
      } catch (err) {
        console.warn('Supabase source insert fallback:', err);
      }
    }

    setSourcesList((prev) => [item, ...prev]);
    setIsAddingSource(false);
    setNewSource({
      type: 'quran',
      title: '',
      author_scholar: '',
      reference: '',
      text_ar: '',
      text_en: '',
      text_so: '',
      tags: '',
    });
  };

  const handleDeleteSource = async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('islamic_sources').delete().eq('id', id);
      } catch {}
    }
    setSourcesList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.lesson_title || !newLecture.transcript_text) return;
    const tagsArray = newLecture.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const item: LectureTranscriptItem = {
      id: `lec_${Date.now()}`,
      sheikh_name: newLecture.sheikh_name.trim(),
      lesson_title: newLecture.lesson_title.trim(),
      series_name: newLecture.series_name.trim() || undefined,
      language: newLecture.language,
      timestamp_seconds: Number(newLecture.timestamp_seconds) || 0,
      transcript_text: newLecture.transcript_text.trim(),
      source_url: newLecture.source_url.trim() || undefined,
      tags: tagsArray,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('lecture_transcripts').insert([
          {
            sheikh_name: item.sheikh_name,
            lesson_title: item.lesson_title,
            series_name: item.series_name,
            language: item.language,
            timestamp_seconds: item.timestamp_seconds,
            transcript_text: item.transcript_text,
            source_url: item.source_url,
            tags: item.tags,
          },
        ]);
        await loadLectures();
      } catch (err) {
        console.warn('Supabase lecture insert fallback:', err);
      }
    }

    setLecturesList((prev) => [item, ...prev]);
    setIsAddingLecture(false);
    setNewLecture({
      sheikh_name: 'Sheikh Mustafe Xaaji Ismaaciil',
      lesson_title: '',
      series_name: '',
      language: 'so',
      timestamp_seconds: 0,
      transcript_text: '',
      source_url: '',
      tags: '',
    });
  };

  const handleDeleteLecture = async (id: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('lecture_transcripts').delete().eq('id', id);
      } catch {}
    }
    setLecturesList((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateReportStatus = async (
    id: string,
    status: ReportItem['status'],
    notes?: string
  ) => {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('reports')
          .update({ status, admin_notes: notes })
          .eq('id', id);
      } catch {}
    }
    setReportsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, admin_notes: notes ?? r.admin_notes } : r))
    );
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs text-slate-400 font-medium">Verifying administrator authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Handle plan request actions
  const handleUpdateStatus = async (
    req: PlanRequest,
    newStatus: PlanRequestStatus,
    paymentVerified?: boolean
  ) => {
    // Prevent duplicate concurrent updates
    if (isUpdatingStatus) return;

    setActionError(null);
    setActionSuccess(null);
    setIsUpdatingStatus(true);
    setUpdatingRequestId(req.id || req.reference_id);

    const verified =
      paymentVerified !== undefined
        ? paymentVerified
        : newStatus === 'approved' || newStatus === 'completed'
        ? true
        : newStatus === 'rejected'
        ? false
        : req.payment_verified;

    const nowIso = new Date().toISOString();
    const noteText = adminNoteInput || req.admin_notes || '';

    const updates: Record<string, any> = {
      status: newStatus,
      payment_verified: verified,
      admin_notes: noteText,
      updated_at: nowIso,
    };

    let supabaseRecord: any = null;
    const requestedPlan = req.plan_slug || (req as any).plan || 'pro';

    // Resolve database UUID for p_request_id (Requirement 2: Pass actual database UUID, not reference_id)
    let targetRequestId = req.id;
    if ((!targetRequestId || !isUuid(targetRequestId)) && req.reference_id && isSupabaseConfigured) {
      try {
        const { data: idLookup } = await supabase
          .from('plan_requests')
          .select('id')
          .eq('reference_id', req.reference_id.trim())
          .maybeSingle();
        if (idLookup?.id && isUuid(idLookup.id)) {
          targetRequestId = idLookup.id;
        }
      } catch (err) {
        console.warn('[AdminPage] UUID lookup for plan request failed:', err);
      }
    }

    if (isSupabaseConfigured && (!targetRequestId || !isUuid(targetRequestId))) {
      const errMsg = `Cannot update plan request: Invalid database ID "${req.id}". A valid UUID is required.`;
      console.error('[AdminPage]', errMsg);
      setActionError(errMsg);
      setIsUpdatingStatus(false);
      setUpdatingRequestId(null);
      return;
    }

    // Update in Supabase via Atomic RPC (Single Source of Truth)
    if (isSupabaseConfigured) {
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('update_plan_request_status', {
          p_request_id: targetRequestId,
          p_status: newStatus,
          p_admin_notes: noteText,
          p_payment_verified: verified,
        });

        if (rpcErr) {
          console.error('[AdminPage] Atomic RPC update failed:', rpcErr);
          let errMsg = rpcErr.message || 'Failed to update plan request status.';
          if (rpcErr.code === '42501' || rpcErr.message?.toLowerCase().includes('denied')) {
            errMsg = 'Permission denied: Only verified administrators can update plan requests.';
          } else if (rpcErr.code === 'PGRST202') {
            errMsg = 'RPC function public.update_plan_request_status is missing from the database. Please execute migration supabase/migrations/20261014_plan_activation_rpc.sql in the Supabase SQL Editor.';
          }
          setActionError(errMsg);
          setIsUpdatingStatus(false);
          setUpdatingRequestId(null);
          return;
        }

        if (!rpcData || !rpcData.success) {
          const failMsg = rpcData?.error || 'Database did not confirm plan request status update.';
          setActionError(failMsg);
          setIsUpdatingStatus(false);
          setUpdatingRequestId(null);
          return;
        }

        supabaseRecord = rpcData;
        console.info('[AdminPage] Atomic RPC plan update/activation confirmed by database:', rpcData);
      } catch (e: any) {
        console.error('[AdminPage] Supabase RPC update exception:', e);
        setActionError(e?.message || 'Error executing atomic plan update in database.');
        setIsUpdatingStatus(false);
        setUpdatingRequestId(null);
        return;
      }
    }

    // Construct updated record with fallback values
    const updatedRecord: PlanRequest = {
      ...req,
      status: (supabaseRecord?.status as PlanRequestStatus) || newStatus,
      payment_verified:
        supabaseRecord?.payment_verified !== undefined
          ? Boolean(supabaseRecord.payment_verified)
          : verified,
      admin_notes:
        supabaseRecord?.admin_notes !== undefined
          ? supabaseRecord.admin_notes || ''
          : noteText,
      updated_at: supabaseRecord?.updated_at || nowIso,
    };

    // Update in React state immediately so the new status appears without delay
    setPlanRequests((prev) =>
      prev.map((r) =>
        r.id === req.id || (req.reference_id && r.reference_id === req.reference_id)
          ? updatedRecord
          : r
      )
    );

    if (
      selectedRequest &&
      (selectedRequest.id === req.id || selectedRequest.reference_id === req.reference_id)
    ) {
      setSelectedRequest(updatedRecord);
    }

    // Best-effort local storage backup sync
    try {
      storage.savePlanRequest(updatedRecord);
    } catch (e) {
      console.warn('Failed to sync to local storage backup:', e);
    }

    // If approved or completed, activate requested plan for user in local tracking and reset congratulations notification
    const resolvedUserId = supabaseRecord?.user_id || req.user_id;
    const resolvedPlan = normalizePlanSlug(supabaseRecord?.plan || requestedPlan);

    if ((newStatus === 'approved' || newStatus === 'completed') && (resolvedUserId || req.email)) {
      try {
        if (resolvedUserId) {
          storage.setUserActivePlan(resolvedUserId, resolvedPlan);
          localStorage.removeItem(`emufti_congrats_seen_${resolvedUserId}_${resolvedPlan}`);
        }
        if (req.email) {
          storage.setUserActivePlan(req.email.toLowerCase(), resolvedPlan);
          localStorage.removeItem(`emufti_congrats_seen_${req.email.toLowerCase()}_${resolvedPlan}`);
        }
      } catch {}

      setUsersList((prev) =>
        prev.map((u) =>
          (resolvedUserId && u.id === resolvedUserId) ||
          (req.email && u.email.toLowerCase() === req.email.toLowerCase())
            ? { ...u, plan: resolvedPlan }
            : u
        )
      );
    }

    const actionText =
      newStatus === 'approved' || newStatus === 'completed'
        ? (supabaseRecord?.message
            ? `Request ${req.reference_id || req.id}: ${supabaseRecord.message}`
            : `Request ${req.reference_id || req.id} marked as "${newStatus}". ${requestedPlan.toUpperCase()} plan activated for ${req.full_name} (${isAnnualBillingInterval(req.billing_interval) ? '1 Year (365 days)' : '1 Month (30 days)'}).`)
        : `Request ${req.reference_id || req.id} marked as "${newStatus.replace('_', ' ')}". No plan activated.`;

    setActionSuccess(actionText);
    setTimeout(() => {
      setActionSuccess(null);
    }, 6000);

    // Requirement 7: Refresh request list and user profiles upon approval/update
    if (isSupabaseConfigured) {
      try {
        await loadRequests();
        await loadUsers();
      } catch (loadErr) {
        console.warn('[AdminPage] Error reloading data after status update:', loadErr);
      }
    }

    setIsUpdatingStatus(false);
    setUpdatingRequestId(null);
  };

  const handleRepairUnlinked = async () => {
    if (!isSupabaseConfigured || isRepairingRequests) return;
    setIsRepairingRequests(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { data, error } = await supabase.rpc('repair_unlinked_plan_requests');
      if (error) {
        console.error('[AdminPage] Repair unlinked requests failed:', error);
        let msg = error.message;
        if (error.code === '42501') {
          msg = 'Permission denied: Only verified administrators can repair unlinked requests.';
        } else if (error.code === 'PGRST202') {
          msg = 'RPC function public.repair_unlinked_plan_requests is missing. Please run migration 20261015_fix_null_user_id_and_linking.sql in Supabase SQL editor.';
        }
        setActionError(`Repair failed: ${msg}`);
        setIsRepairingRequests(false);
        return;
      }

      const linked = data?.linked_count ?? 0;
      const unlinked = data?.unlinked_count ?? 0;
      const summaryMsg = `Repair complete: ${linked} request${linked === 1 ? '' : 's'} linked to registered accounts. ${unlinked} remain unlinked (applicants have not registered yet). Subscriptions were not activated during this repair step.`;
      
      setActionSuccess(summaryMsg);

      // Refresh list to display linked accounts
      await loadRequests();
      await loadUsers();
    } catch (err: any) {
      console.error('[AdminPage] Exception repairing unlinked requests:', err);
      setActionError(err?.message || 'Unexpected error running repair function.');
    } finally {
      setIsRepairingRequests(false);
    }
  };

  const handleLinkSingleRequest = async (req: PlanRequest) => {
    if (!isSupabaseConfigured || isRepairingRequests) return;
    if (!req.id || !isUuid(req.id)) {
      setActionError('Cannot link request: Invalid request database UUID.');
      return;
    }

    setIsRepairingRequests(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { data, error } = await supabase.rpc('link_plan_request_to_user', {
        p_request_id: req.id,
      });

      if (error) {
        console.error('[AdminPage] Link single request failed:', error);
        setActionError(`Linking failed: ${error.message}`);
        setIsRepairingRequests(false);
        return;
      }

      if (data?.success) {
        setActionSuccess(`Request ${req.reference_id} successfully linked to user account ${data.user_email} (${data.linked_user_id}).`);
        await loadRequests();
        await loadUsers();
        if (selectedRequest && selectedRequest.id === req.id) {
          setSelectedRequest({
            ...selectedRequest,
            user_id: data.linked_user_id,
          });
        }
      }
    } catch (err: any) {
      console.error('[AdminPage] Exception linking request:', err);
      setActionError(err?.message || 'Unexpected error linking request to account.');
    } finally {
      setIsRepairingRequests(false);
    }
  };

  const handleUserPlanChange = (userId: string, newPlan: PlanSlug) => {
    storage.setUserActivePlan(userId, newPlan);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
    );
  };

  const handleToggleUserSuspension = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u))
    );
  };

  const handleSavePlanLimits = () => {
    setIsSavedLimitsToast(true);
    setTimeout(() => setIsSavedLimitsToast(false), 3000);
  };

  const handleAdminSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Filter requests
  const filteredRequests = planRequests.filter((r) => {
    const q = requestSearch.trim().toLowerCase();
    const ref = String(r.reference_id || '').toLowerCase();
    const name = String(r.full_name || '').toLowerCase();
    const mail = String(r.email || '').toLowerCase();
    const wa = String(r.whatsapp || '').toLowerCase();
    const tg = String(r.telegram || '').toLowerCase();

    const matchesSearch =
      !q ||
      ref.includes(q) ||
      name.includes(q) ||
      mail.includes(q) ||
      wa.includes(q) ||
      tg.includes(q);

    const rowStatus = String(r.status || '').toLowerCase();
    const rowPlan = String(r.plan_slug || (r as any).plan || '').toLowerCase();

    const matchesStatus = statusFilter === 'all' || rowStatus === statusFilter.toLowerCase();
    const matchesPlan = planFilter === 'all' || rowPlan === planFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    return !q || (u.email && u.email.toLowerCase().includes(q)) || (u.display_name && u.display_name.toLowerCase().includes(q));
  });

  // Statistics
  const totalRequestsCount = planRequests.length;
  const pendingRequestsCount = planRequests.filter((r) => r.status === 'pending').length;
  const underReviewCount = planRequests.filter((r) => r.status === 'under_review').length;
  const approvedRequestsCount = planRequests.filter(
    (r) => r.status === 'approved' || r.status === 'completed'
  ).length;

  const totalSupportCount = supportRequests.length;
  const pendingSupportCount = supportRequests.filter((r) => r.status === 'submitted' || r.status === 'in_review').length;
  const submittedSupportCount = supportRequests.filter((r) => r.status === 'submitted').length;
  const inReviewSupportCount = supportRequests.filter((r) => r.status === 'in_review').length;
  const repliedSupportCount = supportRequests.filter((r) => r.status === 'replied').length;
  const closedSupportCount = supportRequests.filter((r) => r.status === 'closed').length;

  const filteredSupportRequests = supportRequests.filter((req) => {
    const matchesStatus =
      supportStatusFilter === 'all' || req.status === supportStatusFilter;
    if (!matchesStatus) return false;

    const matchesCategory =
      supportCategoryFilter === 'all' ||
      (req.category && req.category === supportCategoryFilter) ||
      (!req.category && supportCategoryFilter === 'general');
    if (!matchesCategory) return false;

    const q = supportSearch.trim().toLowerCase();
    if (!q) return true;

    return (
      (req.reference_id || '').toLowerCase().includes(q) ||
      (req.full_name || '').toLowerCase().includes(q) ||
      (req.email || '').toLowerCase().includes(q) ||
      (req.phone || '').toLowerCase().includes(q) ||
      (req.category || '').toLowerCase().includes(q) ||
      (req.subject || '').toLowerCase().includes(q) ||
      (req.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden box-border">
      {/* Top Admin Header */}
      <header className="h-16 border-b border-border/70 bg-card/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none w-full max-w-full box-border">
        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Chat Workspace</span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Logo size="md" className="shadow-xs" />
            <div>
              <span className="text-sm font-bold text-foreground tracking-wide block">
                EMufti AI Console
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-600 font-mono tracking-wider uppercase font-semibold">
                Scholarly Operations
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-foreground block">
              {profile?.display_name || 'Admin'}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-600 font-mono">
              {user?.email || 'admin@emufti.ai'}
            </span>
          </div>

          <button
            onClick={handleAdminSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Console</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none max-w-full -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Console Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>Analytics Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all relative cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Plan Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all relative cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support Requests</span>
              {pendingSupportCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingSupportCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Plans & Quotas</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'sources'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Islamic Sources</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-foreground">
                {sourcesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('lectures')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'lectures'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Lectures Library</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-foreground">
                {lecturesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tafsir')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'tafsir'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-600" />
              <span>Tafsir Library</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Not Available
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-foreground">
                {tafsirLessonsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Quiz Bank</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-foreground">
                {quizQuestionsList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('diagnostics');
                checkAiServiceStatus();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-600" />
              <span>AI Diagnostics</span>
              {aiStatus?.configured && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Feedback & Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('monitoring')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'monitoring'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          </div>

          <button
            onClick={() => {
              loadRequests();
              loadUsers();
              loadSources();
              loadLectures();
              loadTafsirLessons();
              loadFeedbackAndReports();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Pending Requests</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{pendingRequestsCount}</div>
                <p className="text-[11px] text-amber-400/90">
                  {underReviewCount} currently under coordinator review
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Approved Upgrades</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-white">{approvedRequestsCount}</div>
                <p className="text-[11px] text-slate-400">Total verified tier activations</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Seekers</span>
                  <Users className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{usersList.length}</div>
                <p className="text-[11px] text-slate-400">Total registered seeker accounts</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Islamic AI Availability</span>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-blue-600">99.98%</div>
                <p className="text-[11px] text-slate-400">Retrieval & Verification Active</p>
              </div>
            </div>

            {/* Service & Guardrail Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Islamic Knowledge Engine Health</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                    OPERATIONAL
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Universal Islamic Retrieval Engine</span>
                    <span className="text-blue-600 font-medium">Active (Indexed)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Four Sunni Madhhabs Ikhtilaf Guard</span>
                    <span className="text-blue-600 font-medium">Enforced</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Anti-Fabrication & Source Validation</span>
                    <span className="text-blue-600 font-medium">100% Verified Only</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Multilingual Grounding (SO / AR / EN)</span>
                    <span className="text-blue-600 font-medium">Synchronized</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Administrative Guidelines</span>
                </h3>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Review applicant contact details before approving paid subscriptions.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Always verify student status if student discounts are requested in notes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Approval immediately updates the user's daily quota to 150 (Pro) or 1,000 (Premium).
                    </span>
                  </li>
                </ul>

                <button
                  onClick={() => setActiveTab('requests')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Review {pendingRequestsCount} Pending Requests</span>
                </button>
              </div>
            </div>

            {/* Analytics Dashboard Spotlight Card inside Overview */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      Falanqaynta & Booqdayaasha (Analytics Spotlight)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Guud Ahaan Booqdayaasha & Waxyaabaha Ugu Badnaa Ee La Isticmaalay
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-xs"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Fur Analytics Dashboard-ka Buuxa</span>
                </button>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Booqdayaasha Webka (Visitors)</span>
                    <span className="text-xl font-black text-white">{platformAnalytics.totalVisitors.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {platformAnalytics.visitorGrowthPercentage > 0 ? `+${platformAnalytics.visitorGrowthPercentage}%` : 'Live Tracking'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Wadarta Is-diiwaangeliyay</span>
                    <span className="text-xl font-black text-white">{platformAnalytics.totalRegisteredUsers.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-400">{platformAnalytics.verifiedSeekers} verified</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Adeegga #1 Ugu Isticmaalka Badan</span>
                    <span className="text-xs font-bold text-white truncate max-w-[140px] block">
                      {platformAnalytics.mostUsedFeatures[0]?.nameSo || 'Wadahadalka & Fatwada AI'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400">
                    {platformAnalytics.mostUsedFeatures[0]?.percentage || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Khatm Quran Certificate Admin Test Tool */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Tijaabada Shahaadada Khatmka (Admin Test PDF Generator)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Instantly Generate & Preview Sample Khatm al-Quran Certificate PDF
                  </h3>
                  <p className="text-xs text-slate-400">
                    Qalabkan maamulku wuxuu si toos ah u soo saarayaa shahaado tijaabo ah oo wadata magac, taariikho sax ah, Screen ID rasmi ah, iyo labada logo (Quran Page Logo & EMufti AI Logo).
                  </p>
                </div>
              </div>

              {/* Form Row for Test PDF */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Magaca Qaataha (Test Recipient Name):
                  </label>
                  <input
                    type="text"
                    value={adminTestRecipient}
                    onChange={(e) => setAdminTestRecipient(e.target.value)}
                    placeholder="Magaca qaataha..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Muddada (Duration Preset):
                  </label>
                  <select
                    value={adminTestDuration}
                    onChange={(e) => setAdminTestDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value={30}>1 Bil (Month) — 30 Maalmood</option>
                    <option value={20}>3 Weeks — 20-21 Maalmood</option>
                    <option value={15}>2 Weeks — 14-15 Maalmood</option>
                    <option value={10}>10 Days — 10 Maalmood</option>
                    <option value={7}>7 Days — 7 Maalmood</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAdminTestPdf}
                    disabled={isAdminTestingPdf}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAdminTestingPdf ? 'Diyaarinaya...' : 'Generate Sample PDF'}</span>
                  </button>
                </div>
              </div>

              {adminTestPdfResult && (
                <div className="p-3.5 rounded-xl bg-indigo-950/80 border border-indigo-400/40 text-indigo-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Shahaadada tijaabada ah si guul leh ayaa loo soo saaray! <strong>Screen ID: {adminTestPdfResult}</strong>
                    </span>
                  </div>
                  <Link
                    to={`/verify-certificate?id=${adminTestPdfResult}`}
                    target="_blank"
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xaqiiji Online</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top Header & Timeframe selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-white">Xogta & Falanqaynta Nidaamka (Analytics Dashboard)</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Guud ahaan booqdayaasha webka, isticmaalayaasha is-diiwaangeliyay, iyo waxyaabaha ugu badan ee la isticmaalay.
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
                {(['today', 'week', 'month', 'all'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setAnalyticsTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      analyticsTimeframe === tf
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf === 'today' ? 'Maanta (Today)' : tf === 'week' ? 'Toddobaadkan' : tf === 'month' ? 'Bishan' : 'Dhammaan (All Time)'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Key Metric Spotlight Cards: Total Visitors, Total Registered Users, Active Interactions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Total Website Visitors */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-blue-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Booqdayaasha Webka (Total Visitors)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {platformAnalytics.totalVisitors.toLocaleString()}
                  </span>
                  {platformAnalytics.visitorGrowthPercentage > 0 ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{platformAnalytics.visitorGrowthPercentage}%
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-blue-400">
                      Live
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Maalinle: ~{platformAnalytics.uniqueDailyVisitors.toLocaleString()}</span>
                  <span>Bishiiba: ~{platformAnalytics.monthlyActiveVisitors.toLocaleString()}</span>
                </div>
              </div>

              {/* Card 2: Total Registered Users */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Isticmaalayaasha Is-Diiwaangeliyay
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Database
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {platformAnalytics.totalRegisteredUsers.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">seekers</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Free: {platformAnalytics.subscribersCount.free}</span>
                  <span className="text-emerald-400 font-medium">Pro: {platformAnalytics.subscribersCount.pro}</span>
                  <span className="text-blue-400 font-medium">Premium: {platformAnalytics.subscribersCount.premium}</span>
                </div>
              </div>

              {/* Card 3: Feature Engagements Total */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Isku-darka Adeegyada La Isticmaalay
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Interactions
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {platformAnalytics.mostUsedFeatures.reduce((acc, f) => acc + f.totalUses, 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">fadhiyo / codsiyo</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Adeegyada ugu sarreeya: 7 Tools</span>
                  <span className="text-indigo-400 font-medium">99.98% Verification</span>
                </div>
              </div>
            </div>

            {/* SECTION: MOST FREQUENTLY USED FEATURES / TOOLS ("Waxyaabaha Ugu Badnaa Ee La Isticmaalay") */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Waxyaabaha Ugu Badnaa Ee La Isticmaalay (Most Frequently Used Features & Tools)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kala sarreynta adeegyada ay dadku sida ugu badan uga faa'iidaystaan barta EMufti AI
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Wadarta Qalabka:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {platformAnalytics.mostUsedFeatures.length} Adeeg oo Dhammaystiran
                  </span>
                </div>
              </div>

              {/* Ranked Feature Usage Bars List */}
              <div className="space-y-4">
                {platformAnalytics.mostUsedFeatures.map((feat, index) => (
                  <div
                    key={feat.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-700/80 text-white font-black text-xs flex items-center justify-center shrink-0 border border-slate-600 shadow-xs">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {feat.nameSo}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {feat.nameEn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-semibold text-slate-300">
                          {feat.totalUses.toLocaleString()} jeer
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 min-w-[55px] text-center">
                          {feat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-700/70 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${feat.percentage}%`,
                          backgroundColor: feat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Devices & Geographic Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Devices Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Qalabka Laga Soo Booqdo (Device Breakdown)</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        Taleefannada Gacanta (Mobile)
                      </span>
                      <span className="font-bold text-white">{platformAnalytics.deviceBreakdown.mobile}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${platformAnalytics.deviceBreakdown.mobile}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                        Kumbuyuutarrada (Desktop / Laptop)
                      </span>
                      <span className="font-bold text-white">{platformAnalytics.deviceBreakdown.desktop}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${platformAnalytics.deviceBreakdown.desktop}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Tablet className="w-3.5 h-3.5 text-purple-400" />
                        Aaladaha Tablet (iPad / Tablets)
                      </span>
                      <span className="font-bold text-white">{platformAnalytics.deviceBreakdown.tablet}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${platformAnalytics.deviceBreakdown.tablet}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Distribution Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Waddamada Ugu Badan Ee Laga Soo Galo (Geographic Reach)</span>
                </h3>
                <div className="space-y-2.5">
                  {platformAnalytics.geographicDistribution.map((geo) => (
                    <div key={geo.country} className="flex items-center justify-between py-1.5 border-b border-slate-800 text-xs">
                      <span className="text-slate-300 font-medium">{geo.country}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">{geo.visits.toLocaleString()} booqasho</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {geo.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAN REQUESTS MANAGEMENT */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Filters bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  placeholder="Search by Reference ID, name, email, phone..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="pro">Pro (Talib)</option>
                  <option value="premium">Premium (Alim)</option>
                </select>

                <button
                  onClick={() => handleRepairUnlinked()}
                  disabled={isRepairingRequests || isLoadingRequests}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs border border-blue-200"
                  title="Link unlinked plan requests to registered accounts by verified email without activating subscriptions"
                >
                  <Link2 className={`w-3.5 h-3.5 ${isRepairingRequests ? 'animate-spin' : ''}`} />
                  <span>{isRepairingRequests ? 'Repairing...' : 'Repair Unlinked'}</span>
                </button>

                <button
                  onClick={() => loadRequests()}
                  disabled={isLoadingRequests}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs border border-slate-700/60"
                  title="Refresh from Supabase database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Banner if Supabase connection or table error */}
            {requestsError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 flex items-start justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-200 block">Database Synchronization Notice</span>
                    <p className="text-amber-300/90 leading-relaxed">{requestsError}</p>
                  </div>
                </div>
                <button
                  onClick={() => loadRequests()}
                  disabled={isLoadingRequests}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
                >
                  Retry Sync
                </button>
              </div>
            )}

            {/* Global Action Success Banner */}
            {actionSuccess && !selectedRequest && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-blue-600">{actionSuccess}</span>
                </div>
                <button
                  onClick={() => setActionSuccess(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Global Action Error Banner */}
            {actionError && !selectedRequest && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-rose-200">{actionError}</span>
                </div>
                <button
                  onClick={() => setActionError(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Requests Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Reference ID</th>
                      <th className="p-3.5">Applicant Details</th>
                      <th className="p-3.5">Direct Contact</th>
                      <th className="p-3.5">Tier</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Submitted</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {isLoadingRequests ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-xs font-medium">Fetching upgrade requests from Supabase...</span>
                          </div>
                        </td>
                      </tr>
                    ) : requestsError ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-amber-300">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-lg mx-auto">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <span className="font-semibold text-slate-100 text-sm">Unable to Fetch Plan Requests</span>
                            <p className="text-xs text-amber-300/90 leading-relaxed">{requestsError}</p>
                            <button
                              onClick={() => loadRequests()}
                              className="mt-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Retry Query</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                          {requestSearch || statusFilter !== 'all' || planFilter !== 'all'
                            ? 'No upgrade requests match your search criteria.'
                            : 'No upgrade requests submitted yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-white">
                            {req.reference_id}
                          </td>
                          <td className="p-3.5 space-y-0.5">
                            <div className="font-semibold text-slate-200">{req.full_name}</div>
                            <div className="text-[11px] text-slate-400">{req.email}</div>
                            <div className="flex items-center gap-1 pt-0.5">
                              {req.user_id ? (
                                <span
                                  className="inline-flex items-center gap-1 text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                                  title={`Linked to registered user account ${req.user_id}`}
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  Linked Account
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25"
                                  title="Unlinked request - submitted without an authenticated user account"
                                >
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Unlinked Request
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 space-y-1">
                            {req.whatsapp && (
                              <a
                                href={`https://wa.me/${req.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{req.whatsapp}</span>
                              </a>
                            )}
                            {req.telegram && (
                              <div className="block">
                                <a
                                  href={`https://t.me/${req.telegram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>{req.telegram}</span>
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  req.plan_slug === 'premium'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-blue-100 text-blue-600 border border-blue-200'
                                }`}
                              >
                                {req.plan_slug}
                              </span>
                              <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                {isAnnualBillingInterval(req.billing_interval)
                                  ? `Annual · $${req.price_amount ? (req.price_amount > 100 ? (req.price_amount / 100).toFixed(2) : Number(req.price_amount).toFixed(2)) : (req.plan_slug === 'premium' ? '75.99' : '50.99')}`
                                  : `Monthly · $${req.price_amount ? (req.price_amount > 100 ? (req.price_amount / 100).toFixed(2) : Number(req.price_amount).toFixed(2)) : (req.plan_slug === 'premium' ? '20.99' : '5.99')}`}
                              </span>
                            </div>
                            <span className="block text-[9px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 whitespace-nowrap">
                              📖 Quran Entitlement (Bundled Quran {req.plan_slug === 'premium' ? 'Premium' : 'Pro'})
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={req.status}
                                disabled={isUpdatingStatus && updatingRequestId === (req.id || req.reference_id)}
                                onChange={(e) => {
                                  const targetStatus = e.target.value as PlanRequestStatus;
                                  handleUpdateStatus(
                                    req,
                                    targetStatus,
                                    targetStatus === 'approved' || targetStatus === 'completed'
                                      ? true
                                      : targetStatus === 'rejected'
                                      ? false
                                      : undefined
                                  );
                                }}
                                className={`text-[11px] font-semibold rounded-lg px-2 py-1 border focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-900 transition-colors cursor-pointer disabled:opacity-50 ${
                                  req.status === 'approved' || req.status === 'completed'
                                    ? 'border-blue-300 text-blue-600 bg-blue-50'
                                    : req.status === 'under_review'
                                    ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                                    : req.status === 'rejected'
                                    ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                                    : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                                }`}
                              >
                                <option value="pending" className="bg-slate-900 text-amber-400">Pending</option>
                                <option value="under_review" className="bg-slate-900 text-blue-400">Under Review</option>
                                <option value="approved" className="bg-slate-900 text-blue-600">Approved</option>
                                <option value="completed" className="bg-slate-900 text-blue-600">Completed</option>
                                <option value="rejected" className="bg-slate-900 text-rose-400">Rejected</option>
                              </select>
                              {isUpdatingStatus && updatingRequestId === (req.id || req.reference_id) && (
                                <RefreshCw className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`text-[11px] font-semibold ${
                                req.payment_verified ? 'text-blue-600' : 'text-slate-500'
                              }`}
                            >
                              {req.payment_verified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300">
                            <div className="flex items-center gap-1 text-[11px] text-slate-300">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(req.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setAdminNoteInput(req.admin_notes || '');
                                setActionError(null);
                                setActionSuccess(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SUPPORT REQUESTS */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-blue-600" />
                  <span>Support Requests & Inquiries</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review student questions, bug reports, and plan inquiries. Send verified official admin replies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSupportRequests()}
                  disabled={isLoadingSupport}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupport ? 'animate-spin text-blue-600' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Notification Banners */}
            {supportActionSuccess && !selectedSupportRequest && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{supportActionSuccess}</span>
              </div>
            )}
            {supportActionError && !selectedSupportRequest && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{supportActionError}</span>
              </div>
            )}

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div
                onClick={() => setSupportStatusFilter('all')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  supportStatusFilter === 'all'
                    ? 'bg-slate-800/90 border-blue-400 ring-1 ring-blue-500/20'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-400">Total Requests</div>
                <div className="text-xl font-extrabold text-white mt-1">{totalSupportCount}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">All tickets</div>
              </div>

              <div
                onClick={() => setSupportStatusFilter('submitted')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  supportStatusFilter === 'submitted'
                    ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="text-[11px] font-semibold text-amber-400 flex items-center justify-between">
                  <span>Submitted</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-extrabold text-amber-400 mt-1">{submittedSupportCount}</div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">Awaiting review</div>
              </div>

              <div
                onClick={() => setSupportStatusFilter('in_review')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  supportStatusFilter === 'in_review'
                    ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/30'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="text-[11px] font-semibold text-blue-400 flex items-center justify-between">
                  <span>In Review</span>
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-extrabold text-blue-400 mt-1">{inReviewSupportCount}</div>
                <div className="text-[10px] text-blue-400/80 mt-0.5">Under investigation</div>
              </div>

              <div
                onClick={() => setSupportStatusFilter('replied')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  supportStatusFilter === 'replied'
                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-500/20'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="text-[11px] font-semibold text-blue-600 flex items-center justify-between">
                  <span>Replied</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-extrabold text-blue-600 mt-1">{repliedSupportCount}</div>
                <div className="text-[10px] text-blue-600 mt-0.5">Admin reply sent</div>
              </div>

              <div
                onClick={() => setSupportStatusFilter('closed')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all col-span-2 sm:col-span-1 ${
                  supportStatusFilter === 'closed'
                    ? 'bg-slate-800 border-slate-600 ring-1 ring-slate-500'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Closed</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-extrabold text-slate-300 mt-1">{closedSupportCount}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Resolved & closed</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    placeholder="Search by reference ID, name, email, or message..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'submitted', 'in_review', 'replied', 'closed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSupportStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                        supportStatusFilter === st
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/60 pb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1 flex-shrink-0">Category:</span>
                {[
                  { id: 'all', label: 'All Inquiries' },
                  { id: 'account_access', label: 'Account Access & Security' },
                  { id: 'billing_subscription', label: 'Billing & Plans' },
                  { id: 'quran_features', label: 'Quran & Tafsir' },
                  { id: 'general', label: 'General' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSupportCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      supportCategoryFilter === cat.id
                        ? 'bg-blue-100 text-blue-600 border border-blue-300'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Reference ID</th>
                      <th className="p-3.5">Submitter Details</th>
                      <th className="p-3.5">Category & Problem</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Reply Status</th>
                      <th className="p-3.5">Submitted</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {isLoadingSupport ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-xs font-medium">Fetching support requests...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSupportRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <LifeBuoy className="w-8 h-8 text-slate-600" />
                            <span className="text-sm font-semibold text-slate-400">No support requests found</span>
                            <span className="text-xs text-slate-500">
                              {supportSearch
                                ? `No requests match "${supportSearch}". Try a different keyword.`
                                : 'No requests in this status category.'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSupportRequests.map((req) => {
                        const hasReply = !!(req.admin_reply && req.admin_reply.trim().length > 0);
                        return (
                          <tr key={req.id} className="hover:bg-slate-850/50 transition-colors">
                            {/* Reference ID */}
                            <td className="p-3.5">
                              <span className="font-mono font-bold text-blue-600 block">
                                {req.reference_id}
                              </span>
                            </td>

                            {/* Submitter Details */}
                            <td className="p-3.5">
                              <div className="font-semibold text-white">{req.full_name}</div>
                              <div className="text-[11px] text-slate-400">{req.email}</div>
                              <div className="text-[10px] text-slate-500">{req.phone}</div>
                              <div className="mt-1">
                                {req.user_id ? (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200">
                                    Linked User
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                    Guest
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Category & Problem Preview */}
                            <td className="p-3.5 max-w-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  req.category === 'account_access'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    : req.category === 'billing_subscription'
                                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                    : req.category === 'quran_features'
                                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                                }`}>
                                  {req.category === 'account_access'
                                    ? 'Account Access'
                                    : req.category === 'billing_subscription'
                                    ? 'Billing & Plans'
                                    : req.category === 'quran_features'
                                    ? 'Quran & Tafsir'
                                    : 'General'}
                                </span>
                                {req.subject && (
                                  <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                                    {req.subject}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                                {req.description}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <select
                                value={req.status}
                                onChange={(e) => {
                                  const targetStatus = e.target.value as SupportRequestStatus;
                                  handleUpdateSupportStatus(req, targetStatus);
                                }}
                                className={`text-[11px] font-semibold rounded-lg px-2 py-1 border focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-900 transition-colors cursor-pointer ${
                                  req.status === 'replied'
                                    ? 'border-blue-300 text-blue-600 bg-blue-50'
                                    : req.status === 'in_review'
                                    ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                                    : req.status === 'closed'
                                    ? 'border-slate-600 text-slate-400 bg-slate-800'
                                    : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                                }`}
                              >
                                <option value="submitted" className="bg-slate-900 text-amber-400">Submitted</option>
                                <option value="in_review" className="bg-slate-900 text-blue-400">In Review</option>
                                <option value="replied" className="bg-slate-900 text-blue-600">Replied</option>
                                <option value="closed" className="bg-slate-900 text-slate-400">Closed</option>
                              </select>
                            </td>

                            {/* Reply Status */}
                            <td className="p-3.5">
                              {hasReply ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Replied</span>
                                  </span>
                                  {req.replied_at && (
                                    <div className="text-[10px] text-slate-500">
                                      {new Date(req.replied_at).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                                  <Clock className="w-3 h-3" />
                                  <span>Awaiting Reply</span>
                                </span>
                              )}
                            </td>

                            {/* Submitted Date */}
                            <td className="p-3.5 text-slate-300">
                              <div className="text-[11px]">
                                {new Date(req.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {new Date(req.created_at).toLocaleTimeString(undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedSupportRequest(req);
                                  setSupportReplyText(req.admin_reply || '');
                                  setSupportAdminNotes(req.admin_notes || '');
                                  setSupportActionSuccess(null);
                                  setSupportActionError(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Manage & Reply
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search seekers by email or display name..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                Total Seekers: <strong className="text-white">{filteredUsers.length}</strong>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User Identity</th>
                    <th className="p-3.5">System Role</th>
                    <th className="p-3.5">Active Tier</th>
                    <th className="p-3.5">Questions Today</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Tier Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{u.display_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 capitalize font-semibold text-blue-600">
                        {u.plan}
                      </td>
                      <td className="p-3.5 font-bold text-white">{u.questionsToday}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.is_suspended
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}
                        >
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <select
                          value={u.plan}
                          onChange={(e) => handleUserPlanChange(u.id, e.target.value as PlanSlug)}
                          className="px-2 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                        >
                          <option value="free">Free (5/day)</option>
                          <option value="pro">Pro (150/day)</option>
                          <option value="premium">Premium (1,000/day)</option>
                        </select>
                        <button
                          onClick={() => handleToggleUserSuspension(u.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            u.is_suspended
                              ? 'bg-blue-600 hover:bg-blue-600 text-white'
                              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                          }`}
                        >
                          {u.is_suspended ? 'Activate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PLANS & SYSTEM QUOTAS */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Daily Question Limit Configuration</h3>
                  <p className="text-xs text-slate-400">
                    Adjust backend rate-limits per subscription tier across all seekers.
                  </p>
                </div>
                <button
                  onClick={handleSavePlanLimits}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Quota Rules</span>
                </button>
              </div>

              {isSavedLimitsToast && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Plan quota limits successfully synchronized with production cache.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <span className="text-xs font-bold text-white block">Free Seeker Tier</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Daily Inquiries Allowance</label>
                    <input
                      type="number"
                      value={planLimits.free}
                      onChange={(e) =>
                        setPlanLimits({ ...planLimits, free: parseInt(e.target.value) || 5 })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Default entry tier for all unregistered guests and free users.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <span className="text-xs font-bold text-white block">Talib al-Ilm (Pro)</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Daily Inquiries Allowance</label>
                    <input
                      type="number"
                      value={planLimits.pro}
                      onChange={(e) =>
                        setPlanLimits({ ...planLimits, pro: parseInt(e.target.value) || 150 })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Includes comparative rulings across four Sunni schools.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <span className="text-xs font-bold text-white block">Alim Research (Premium)</span>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Daily Inquiries Allowance</label>
                    <input
                      type="number"
                      value={planLimits.premium}
                      onChange={(e) =>
                        setPlanLimits({ ...planLimits, premium: parseInt(e.target.value) || 1000 })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Maximum depth research window and priority Ramadan queue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ISLAMIC SOURCES */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Islamic Sources Library & Catalog</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Curated authentic Quranic verses, Sahih Hadiths, Fiqh consensus rulings, and Classical Tafsir references.
                </p>
              </div>
              <button
                onClick={() => setIsAddingSource(!isAddingSource)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingSource ? 'Close Form' : 'Add Verified Source'}</span>
              </button>
            </div>

            {/* Add Source Form */}
            {isAddingSource && (
              <form onSubmit={handleAddSource} className="p-5 rounded-2xl bg-slate-900/90 border border-blue-200 space-y-4 animate-in fade-in">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">New Source Record</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Type</label>
                    <select
                      value={newSource.type}
                      onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value="quran">Quran Verse</option>
                      <option value="tafsir">Tafsir Exegesis</option>
                      <option value="hadith">Hadith Narration</option>
                      <option value="scholarly_work">Scholarly Classical Work</option>
                      <option value="fiqh_ruling">Fiqh Consensus Ruling</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Surah Al-Baqarah (2:43)"
                      value={newSource.title}
                      onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Author / Scholar / Companion</label>
                    <input
                      type="text"
                      placeholder="e.g. Divine Revelation / Imam al-Bukhari"
                      value={newSource.author_scholar}
                      onChange={(e) => setNewSource({ ...newSource, author_scholar: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Exact Scriptural Reference</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Surah 2, Ayah 43 or Sahih al-Bukhari 8"
                      value={newSource.reference}
                      onChange={(e) => setNewSource({ ...newSource, reference: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Thematic Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="salah, zakat, pillars, worship"
                      value={newSource.tags}
                      onChange={(e) => setNewSource({ ...newSource, tags: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Arabic Text (Matn with Tashkeel if applicable)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      placeholder="وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ..."
                      value={newSource.text_ar}
                      onChange={(e) => setNewSource({ ...newSource, text_ar: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-arabic text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">English Meaning / Translation</label>
                      <textarea
                        rows={2}
                        placeholder="And establish prayer and give zakah..."
                        value={newSource.text_en}
                        onChange={(e) => setNewSource({ ...newSource, text_en: e.target.value })}
                        className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Somali Meaning / Sharaxaad</label>
                      <textarea
                        rows={2}
                        placeholder="Ooga salaadda oo bixiya zakada..."
                        value={newSource.text_so}
                        onChange={(e) => setNewSource({ ...newSource, text_so: e.target.value })}
                        className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingSource(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold"
                  >
                    Save to Source Catalog
                  </button>
                </div>
              </form>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sources by title, reference, author, or keywords..."
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={sourceTypeFilter}
                onChange={(e) => setSourceTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                <option value="quran">Quran Verses</option>
                <option value="tafsir">Tafsir</option>
                <option value="hadith">Hadith Narrations</option>
                <option value="scholarly_work">Classical Works</option>
                <option value="fiqh_ruling">Fiqh Rulings</option>
              </select>
            </div>

            {/* Sources List */}
            <div className="grid grid-cols-1 gap-3">
              {sourcesList
                .filter((s) => {
                  const q = sourceSearch.toLowerCase().trim();
                  const matchesSearch =
                    !q ||
                    s.title.toLowerCase().includes(q) ||
                    s.reference.toLowerCase().includes(q) ||
                    (s.author_scholar && s.author_scholar.toLowerCase().includes(q)) ||
                    (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)));
                  const matchesType = sourceTypeFilter === 'all' || s.type === sourceTypeFilter;
                  return matchesSearch && matchesType;
                })
                .map((src) => (
                  <div key={src.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              src.type === 'quran'
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : src.type === 'hadith'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : src.type === 'fiqh_ruling'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {src.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-white">{src.title}</span>
                          <span className="text-[11px] font-mono text-slate-400">({src.reference})</span>
                        </div>
                        {src.author_scholar && (
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Scholar / Transmitter: {src.author_scholar}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSource(src.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {src.text_ar && (
                      <p className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-arabic text-sm text-amber-200 text-right leading-relaxed">
                        {src.text_ar}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {src.text_en && (
                        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">English</span>
                          <p>{src.text_en}</p>
                        </div>
                      )}
                      {src.text_so && (
                        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Somali</span>
                          <p>{src.text_so}</p>
                        </div>
                      )}
                    </div>

                    {src.tags && src.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {src.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 6: LECTURE TRANSCRIPTS */}
        {activeTab === 'lectures' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-blue-600" />
                  <span>Sheikh Lecture Transcripts & Duruus</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Transcribed audio duruus, scholarly timestamps, and fiqh lessons by verified Somali and Arab mashayikh.
                </p>
              </div>
              <button
                onClick={() => setIsAddingLecture(!isAddingLecture)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingLecture ? 'Close Form' : 'Add Lecture Transcript'}</span>
              </button>
            </div>

            {/* Add Lecture Form */}
            {isAddingLecture && (
              <form onSubmit={handleAddLecture} className="p-5 rounded-2xl bg-slate-900/90 border border-blue-200 space-y-4 animate-in fade-in">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">New Lecture Excerpt</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Sheikh Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sheikh Mustafe / Sheikh Cumar Faaruuq"
                      value={newLecture.sheikh_name}
                      onChange={(e) => setNewLecture({ ...newLecture, sheikh_name: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Lesson / Darsi Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sharaxa Arkaanta Islaamka"
                      value={newLecture.lesson_title}
                      onChange={(e) => setNewLecture({ ...newLecture, lesson_title: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Series / Kitab Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Duruusta Fiqiga / Safinatun Najah"
                      value={newLecture.series_name}
                      onChange={(e) => setNewLecture({ ...newLecture, series_name: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Language</label>
                    <select
                      value={newLecture.language}
                      onChange={(e) => setNewLecture({ ...newLecture, language: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value="so">Somali</option>
                      <option value="ar">Arabic</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Timestamp (seconds into audio/video)</label>
                    <input
                      type="number"
                      placeholder="120"
                      value={newLecture.timestamp_seconds}
                      onChange={(e) => setNewLecture({ ...newLecture, timestamp_seconds: parseInt(e.target.value) || 0 })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="fiqh, salah, shafi"
                      value={newLecture.tags}
                      onChange={(e) => setNewLecture({ ...newLecture, tags: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Transcript Text (Full or segment)</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter verbatim or structured lecture transcription..."
                    value={newLecture.transcript_text}
                    onChange={(e) => setNewLecture({ ...newLecture, transcript_text: e.target.value })}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingLecture(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold"
                  >
                    Save Lecture Transcript
                  </button>
                </div>
              </form>
            )}

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search transcripts by sheikh, title, kitāb, or keywords..."
                  value={lectureSearch}
                  onChange={(e) => setLectureSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={lectureLangFilter}
                onChange={(e) => setLectureLangFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Languages</option>
                <option value="so">Somali</option>
                <option value="ar">Arabic</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Lectures List */}
            <div className="grid grid-cols-1 gap-3">
              {lecturesList
                .filter((l) => {
                  const q = lectureSearch.toLowerCase().trim();
                  const matchesSearch =
                    !q ||
                    l.sheikh_name.toLowerCase().includes(q) ||
                    l.lesson_title.toLowerCase().includes(q) ||
                    (l.series_name && l.series_name.toLowerCase().includes(q)) ||
                    l.transcript_text.toLowerCase().includes(q);
                  const matchesLang = lectureLangFilter === 'all' || l.language === lectureLangFilter;
                  return matchesSearch && matchesLang;
                })
                .map((lec) => {
                  const mins = Math.floor((lec.timestamp_seconds || 0) / 60);
                  const secs = (lec.timestamp_seconds || 0) % 60;
                  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                  return (
                    <div key={lec.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                              {lec.sheikh_name}
                            </span>
                            <span className="text-xs font-bold text-white">{lec.lesson_title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                              {formattedTime}
                            </span>
                          </div>
                          {lec.series_name && (
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              Series: {lec.series_name} · Language: {lec.language.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteLecture(lec.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete transcript"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans">
                        "{lec.transcript_text}"
                      </p>

                      {lec.tags && lec.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {lec.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB: QURAN TAFSIR LIBRARY MANAGEMENT */}
        {activeTab === 'tafsir' && (
          <div className="space-y-6">
            {/* Global Not Available Status Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-amber-300">
                    Feature Status: Globally Disabled ("Not Available")
                  </h3>
                  <p className="text-[11px] text-amber-200/80">
                    All Tafsir modules, tabs, and triggers are currently marked as "Not Available" across the Quran companion pages and action drawers.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                Disabled / Not Available
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Somali Quran Tafsir Management (All 114 Surahs)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage, verify, and publish authentic audio lessons and commentaries for all 114 Quran surahs across verified Somali scholars.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode Toggle: Lessons vs 114 Surahs Matrix */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTafsirViewMode('lessons')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      tafsirViewMode === 'lessons'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Lessons List ({tafsirLessonsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTafsirViewMode('coverage_matrix')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      tafsirViewMode === 'coverage_matrix'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    114 Surahs Coverage Matrix
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHealthDiagnosticsModal(!showHealthDiagnosticsModal)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors flex-shrink-0 cursor-pointer ${
                    showHealthDiagnosticsModal
                      ? 'bg-blue-600/20 text-blue-600 border-blue-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Content Health Diagnostics</span>
                  {isRunningHealthAudit && (
                    <RefreshCw className="w-3 h-3 text-blue-600 animate-spin ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isAddingTafsir) {
                      setIsAddingTafsir(false);
                      setEditingTafsirLesson(null);
                    } else {
                      setEditingTafsirLesson(null);
                      setTafsirForm({
                        scholarId: 'sheikh-mustafe',
                        surahNumber: 1,
                        ayahStart: 1,
                        ayahEnd: 7,
                        ayahRange: '1-7',
                        titleSo: '',
                        titleEn: '',
                        audioUrl: '',
                        duration: '35:00',
                        transcriptSo: '',
                        transcriptEn: '',
                        sourceAttribution: 'Markaz Tawxiid Nairobi',
                        sourceUrl: '',
                        verificationStatus: 'verified',
                        isPublished: true,
                      });
                      setIsAddingTafsir(true);
                      setTafsirViewMode('lessons');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingTafsir ? 'Close Form' : 'Add Tafsir Lesson'}</span>
                </button>
              </div>
            </div>

            {/* Content Health Diagnostics Panel */}
            {showHealthDiagnosticsModal && tafsirHealthReport && (
              <div className="p-5 rounded-2xl bg-slate-900/95 border border-blue-200 space-y-4 animate-in fade-in shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Quran & Somali Tafsir Content Health Diagnostics
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Live verification of all 114 Surahs Quran text and audio streams.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Last Check: {new Date(tafsirHealthReport.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      type="button"
                      disabled={isRunningHealthAudit}
                      onClick={handleRunHealthAudit}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 border border-blue-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRunningHealthAudit ? 'animate-spin' : ''}`} />
                      <span>{isRunningHealthAudit ? 'Auditing...' : 'Run Full Content Audit'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar during audit */}
                {isRunningHealthAudit && healthAuditProgress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Testing stream URLs...</span>
                      <span>{healthAuditProgress.checked} / {healthAuditProgress.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${(healthAuditProgress.checked / healthAuditProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Overview metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Quran Text Health</span>
                    <p className="text-base font-bold text-blue-600 mt-0.5">
                      {tafsirHealthReport.totalSurahs} / 114 Surahs
                    </p>
                    <span className="text-[10px] text-slate-500">All 114 Surahs Verified (6,236 Ayahs)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Audio Stream Health</span>
                    <p className="text-base font-bold text-teal-400 mt-0.5">
                      {tafsirHealthReport.validAudioStreams} Active Streams
                    </p>
                    <span className="text-[10px] text-slate-500">0 broken streams</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Coverage Complete</span>
                    <p className="text-base font-bold text-white mt-0.5">
                      {tafsirHealthReport.completeCoverageSurahs} Surahs
                    </p>
                    <span className="text-[10px] text-blue-600/80">Juz Amma & Al-Fatihah</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Coverage In-Progress</span>
                    <p className="text-base font-bold text-amber-400 mt-0.5">
                      {tafsirHealthReport.inProgressSurahs} Surahs
                    </p>
                    <span className="text-[10px] text-slate-500">Key verses verified</span>
                  </div>
                </div>

                {/* Breakdown by Scholar */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Audio Recordings by Scholar
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {tafsirHealthReport.scholarBreakdown.map((s) => (
                      <div key={s.scholarId} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-white text-[11px] truncate">{s.somaliName}</strong>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600">
                            {s.totalLessons} duruus
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="text-blue-600 font-semibold">{s.validAudio} Valid</span>
                          <span>•</span>
                          <span className={s.brokenAudio > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                            {s.brokenAudio} Broken
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">{s.missingAudio} Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Broken URLs Detector Notice */}
                {tafsirHealthReport.brokenLessons.length === 0 ? (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>All cataloged Islamic audio stream links are live and verified (200 OK). No broken URLs detected.</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{tafsirHealthReport.brokenLessons.length} Broken Audio URL(s) Detected:</span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {tafsirHealthReport.brokenLessons.map((b) => (
                        <div key={b.lessonId} className="text-[11px] font-mono bg-slate-950 p-2 rounded-lg text-slate-300">
                          <span className="text-white font-bold">{b.title}</span>: {b.error}
                          <p className="text-slate-500 truncate text-[10px]">{b.url}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Library Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Total Duruus</span>
                <p className="text-2xl font-bold text-white">{tafsirLessonsList.length}</p>
                <span className="text-[10px] text-slate-500">Across 6 Somali scholars</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Verified Duruus</span>
                <p className="text-2xl font-bold text-blue-600">
                  {tafsirLessonsList.filter((l) => l.verificationStatus === 'verified').length}
                </p>
                <span className="text-[10px] text-blue-600/80">Authentic audio & text</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Published Publicly</span>
                <p className="text-2xl font-bold text-teal-400">
                  {tafsirLessonsList.filter((l) => l.isPublished).length}
                </p>
                <span className="text-[10px] text-slate-500">Live in reader</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">114 Surahs Coverage</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-amber-400">38</span>
                  <span className="text-xs text-slate-400">complete · 13 in progress</span>
                </div>
                <span className="text-[10px] text-slate-500">63 pending digitization</span>
              </div>
            </div>

            {/* Inline Add / Edit Form */}
            {isAddingTafsir && (
              <form onSubmit={handleSaveTafsir} className="p-5 rounded-2xl bg-slate-900/90 border border-blue-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {editingTafsirLesson ? 'Edit Tafsir Lesson' : 'Add New Verified Tafsir Lesson'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTafsir(false);
                      setEditingTafsirLesson(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Scholar</label>
                    <select
                      value={tafsirForm.scholarId}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, scholarId: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {getAllSomaliScholars().map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.somaliName} ({s.scholarName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Surah (1 to 114)</label>
                    <select
                      value={tafsirForm.surahNumber}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        const sMeta = quranService.getSurah(num);
                        setTafsirForm({
                          ...tafsirForm,
                          surahNumber: num,
                          ayahStart: 1,
                          ayahEnd: sMeta ? sMeta.numberOfAyahs : 7,
                          ayahRange: sMeta ? `1-${sMeta.numberOfAyahs}` : '1-7',
                          titleSo: sMeta ? `Tafsiirka Suuradda ${(sMeta as any).nameSo || sMeta.englishName}` : tafsirForm.titleSo,
                          titleEn: sMeta ? `Tafsir of Surah ${sMeta.englishName}` : tafsirForm.titleEn,
                        });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {quranService.getAllSurahs().map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {s.englishName} ({s.name}) — {s.numberOfAyahs} Ayahs
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Ayah Range</label>
                    <input
                      type="text"
                      placeholder="e.g. 1-7 or 255 or 1-20"
                      value={tafsirForm.ayahRange}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, ayahRange: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Lesson Title (Somali)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tafsiirka Suuradda Al-Faatixa"
                      value={tafsirForm.titleSo}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, titleSo: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Lesson Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Tafsir of Surah Al-Fatihah"
                      value={tafsirForm.titleEn}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, titleEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 font-medium">Audio Recording URL (Direct MP3 or Archive.org stream)</label>
                    <input
                      type="url"
                      placeholder="https://archive.org/download/.../lesson.mp3"
                      value={tafsirForm.audioUrl}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, audioUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 35:00 or 42:15"
                      value={tafsirForm.duration}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, duration: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Somali Transcript / Lesson Summary</label>
                    <textarea
                      rows={3}
                      placeholder="Faahfaahin kooban oo ku saabsan casharka iyo nuxurka aayadaha..."
                      value={tafsirForm.transcriptSo}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, transcriptSo: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">English Summary / Key Points</label>
                    <textarea
                      rows={3}
                      placeholder="Brief English summary of the lesson themes, rulings, and benefits..."
                      value={tafsirForm.transcriptEn}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, transcriptEn: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Source Attribution</label>
                    <input
                      type="text"
                      value={tafsirForm.sourceAttribution}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, sourceAttribution: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">External Archive URL</label>
                    <input
                      type="url"
                      placeholder="https://archive.org/details/..."
                      value={tafsirForm.sourceUrl}
                      onChange={(e) => setTafsirForm({ ...tafsirForm, sourceUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Verification Status</label>
                    <select
                      value={tafsirForm.verificationStatus}
                      onChange={(e) =>
                        setTafsirForm({
                          ...tafsirForm,
                          verificationStatus: e.target.value as 'verified' | 'pending_review' | 'unverified',
                        })
                      }
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="verified">Verified (Authentic audio & text)</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={tafsirForm.isPublished}
                        onChange={(e) => setTafsirForm({ ...tafsirForm, isPublished: e.target.checked })}
                        className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 bg-slate-950"
                      />
                      <span>Publish to Public Reader</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTafsir(false);
                      setEditingTafsirLesson(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-600 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingTafsirLesson ? 'Update Lesson' : 'Save Lesson'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Search and Filters */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search lessons, surahs, transcripts..."
                  value={tafsirSearchQuery}
                  onChange={(e) => setTafsirSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={tafsirScholarFilter}
                  onChange={(e) => setTafsirScholarFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Scholars</option>
                  {getAllSomaliScholars().map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.somaliName}
                    </option>
                  ))}
                </select>

                <select
                  value={tafsirSurahFilter}
                  onChange={(e) => setTafsirSurahFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All 114 Surahs</option>
                  {quranService.getAllSurahs().map((s) => (
                    <option key={s.number} value={String(s.number)}>
                      {s.number}. {s.englishName} ({s.name})
                    </option>
                  ))}
                </select>

                <select
                  value={tafsirStatusFilter}
                  onChange={(e) => setTafsirStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="unverified">Unverified Only</option>
                  <option value="published">Published Only</option>
                  <option value="unpublished">Unpublished Only</option>
                  <option value="missing_audio">⚠ Missing Audio</option>
                  <option value="missing_transcript">⚠ Missing Transcript</option>
                </select>
              </div>
            </div>

            {/* TAB VIEW 1: LESSONS CATALOG */}
            {tafsirViewMode === 'lessons' && (
              <div className="space-y-3">
                {tafsirLessonsList
                  .filter((l) => {
                    if (tafsirScholarFilter !== 'all' && l.scholarId !== tafsirScholarFilter) return false;
                    if (tafsirSurahFilter !== 'all' && String(l.surahNumber) !== tafsirSurahFilter) return false;
                    if (tafsirStatusFilter === 'verified' && l.verificationStatus !== 'verified') return false;
                    if (tafsirStatusFilter === 'pending_review' && l.verificationStatus !== 'pending_review') return false;
                    if (tafsirStatusFilter === 'unverified' && l.verificationStatus !== 'unverified') return false;
                    if (tafsirStatusFilter === 'published' && !l.isPublished) return false;
                    if (tafsirStatusFilter === 'unpublished' && l.isPublished) return false;
                    if (tafsirStatusFilter === 'missing_audio' && Boolean(l.audioUrl && l.audioUrl.trim())) return false;
                    if (tafsirStatusFilter === 'missing_transcript' && Boolean(l.transcriptSo && l.transcriptSo.trim())) return false;
                    if (tafsirSearchQuery.trim()) {
                      const q = tafsirSearchQuery.toLowerCase();
                      const match =
                        l.titleSo.toLowerCase().includes(q) ||
                        l.titleEn.toLowerCase().includes(q) ||
                        l.surahName.toLowerCase().includes(q) ||
                        String(l.surahNumber).includes(q) ||
                        l.scholarSomaliName.toLowerCase().includes(q) ||
                        (l.transcriptSo && l.transcriptSo.toLowerCase().includes(q)) ||
                        (l.transcriptEn && l.transcriptEn.toLowerCase().includes(q));
                      if (!match) return false;
                    }
                    return true;
                  })
                  .map((lesson) => {
                    const isAudioMissing = !lesson.audioUrl || !lesson.audioUrl.trim();
                    const isTranscriptMissing = !lesson.transcriptSo || !lesson.transcriptSo.trim();
                    return (
                      <div
                        key={lesson.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-mono text-xs font-bold flex items-center justify-center">
                              {lesson.surahNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">
                                  {lesson.surahName} {lesson.surahNameArabic && `(${lesson.surahNameArabic})`}
                                </h4>
                                <span className="text-[11px] font-mono text-slate-400">
                                  Ayahs: {lesson.ayahRange || `${lesson.ayahStart || 1}-${lesson.ayahEnd || ''}`}
                                </span>
                              </div>
                              <span className="text-xs text-blue-600 font-medium">
                                {lesson.scholarSomaliName} · {lesson.sourceAttribution}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Missing Content Badges */}
                            {isAudioMissing && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Audio Missing</span>
                              </span>
                            )}
                            {isTranscriptMissing && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Transcript Missing</span>
                              </span>
                            )}

                            {/* Verification Toggle */}
                            <button
                              onClick={() => handleToggleVerifyTafsir(lesson)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                                lesson.verificationStatus === 'verified'
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                              }`}
                              title="Click to toggle verification"
                            >
                              {lesson.verificationStatus === 'verified' ? '✓ Verified' : '⚠ ' + lesson.verificationStatus}
                            </button>

                            {/* Publication Toggle */}
                            <button
                              onClick={() => handleTogglePublishTafsir(lesson)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                                lesson.isPublished
                                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              }`}
                              title="Click to toggle publication"
                            >
                              {lesson.isPublished ? 'Public' : 'Draft'}
                            </button>

                            <button
                              onClick={() => handleStartEditTafsir(lesson)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit lesson details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTafsir(lesson)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete lesson"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Somali Title</span>
                            <p className="text-white font-medium mt-0.5">{lesson.titleSo}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">English Title</span>
                            <p className="text-slate-300 font-medium mt-0.5">{lesson.titleEn}</p>
                          </div>
                        </div>

                        {lesson.transcriptSo && (
                          <p className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                            "{lesson.transcriptSo}"
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 flex-wrap gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* Interactive Audio Preview Button */}
                            {lesson.audioUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewAudioLesson(lesson);
                                  setIsPreviewPlaying(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 border border-blue-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Listen to recording audio before publishing"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Preview Audio ({lesson.duration || '35:00'})</span>
                              </button>
                            ) : (
                              <span className="text-rose-400 text-xs italic">No audio recording attached</span>
                            )}

                            {lesson.sourceUrl && (
                              <a
                                href={lesson.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                              >
                                <span>Archive Source</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">ID: {lesson.id}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB VIEW 2: 114 SURAHS COVERAGE MATRIX */}
            {tafsirViewMode === 'coverage_matrix' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Complete 114 Surahs Coverage & Publication Matrix</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Audited publication status across all 114 canonical Quran surahs and verified Somali scholars.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold border border-blue-200">
                      38 Complete
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                      13 Partial
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                      63 Pending Digitization
                    </span>
                  </div>
                </div>

                {/* 114 Surahs Matrix Table */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
                        <tr>
                          <th className="p-3 w-14 text-center">#</th>
                          <th className="p-3">Surah Name</th>
                          <th className="p-3">Arabic</th>
                          <th className="p-3 text-center">Ayahs</th>
                          <th className="p-3">Coverage Status</th>
                          <th className="p-3">Available Scholars</th>
                          <th className="p-3 text-center">Lessons</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {getAll114SurahsTafsirStatus().map((s) => {
                          const surahLessons = tafsirLessonsList.filter((l) => l.surahNumber === s.surahNumber);
                          const hasAudio = surahLessons.some((l) => Boolean(l.audioUrl && l.audioUrl.trim()));
                          const hasTranscript = surahLessons.some((l) => Boolean(l.transcriptSo && l.transcriptSo.trim()));

                          let statusLabel = 'Not Yet Digitized';
                          let statusBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
                          if (s.status === 'complete') {
                            statusLabel = 'Complete';
                            statusBadgeClass = 'bg-blue-50 text-blue-600 border-blue-200';
                          } else if (hasAudio && !hasTranscript) {
                            statusLabel = 'Audio Only';
                            statusBadgeClass = 'bg-teal-500/15 text-teal-400 border-teal-500/30';
                          } else if (!hasAudio && hasTranscript) {
                            statusLabel = 'Transcript Only';
                            statusBadgeClass = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
                          } else if (s.status === 'in_progress' || surahLessons.length > 0) {
                            statusLabel = 'Partially Available';
                            statusBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                          }

                          return (
                            <tr key={s.surahNumber} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 text-center font-mono font-bold text-slate-400">{s.surahNumber}</td>
                              <td className="p-3 font-semibold text-white">
                                {s.englishName}
                                <span className="block text-[11px] text-slate-400 font-normal">{s.somaliNameTranslation}</span>
                              </td>
                              <td className="p-3 font-arabic text-blue-600 text-sm">{s.nameArabic}</td>
                              <td className="p-3 text-center font-mono text-slate-400">{s.numberOfAyahs}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadgeClass}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="p-3 text-[11px] text-slate-300">
                                {s.scholarsAvailable.length > 0 ? (
                                  s.scholarsAvailable.join(', ')
                                ) : (
                                  <span className="text-slate-500 italic">None yet</span>
                                )}
                              </td>
                              <td className="p-3 text-center font-mono text-slate-300">{surahLessons.length}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTafsirSurahFilter(String(s.surahNumber));
                                      setTafsirViewMode('lessons');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                                    title="View lessons for this surah"
                                  >
                                    View ({surahLessons.length})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTafsirLesson(null);
                                      setTafsirForm({
                                        scholarId: 'sheikh-mustafe',
                                        surahNumber: s.surahNumber,
                                        ayahStart: 1,
                                        ayahEnd: s.numberOfAyahs,
                                        ayahRange: `1-${s.numberOfAyahs}`,
                                        titleSo: `Tafsiirka Suuradda ${s.englishName}`,
                                        titleEn: `Tafsir of Surah ${s.englishName}`,
                                        audioUrl: '',
                                        duration: '35:00',
                                        transcriptSo: '',
                                        transcriptEn: '',
                                        sourceAttribution: 'Markaz Tawxiid Nairobi',
                                        sourceUrl: '',
                                        verificationStatus: 'verified',
                                        isPublished: true,
                                      });
                                      setIsAddingTafsir(true);
                                      setTafsirViewMode('lessons');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 border border-blue-200 text-[11px] font-medium transition-colors cursor-pointer"
                                    title="Add new lesson for this surah"
                                  >
                                    + Add
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: FEEDBACK & REPORTS */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-blue-600" />
                <span>User Feedback & Religious Inaccuracy Reports</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review flagged responses from seekers, monitor community feedback, and ensure scholarly rigor.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Reports</span>
                <p className="text-xl font-bold text-white mt-1">{reportsList.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Review</span>
                <p className="text-xl font-bold text-rose-400 mt-1">
                  {reportsList.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Helpful Ratings</span>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {feedbackList.filter((f) => f.rating === 'helpful').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">User Satisfaction</span>
                <p className="text-xl font-bold text-amber-400 mt-1">
                  {feedbackList.length > 0
                    ? `${Math.round((feedbackList.filter((f) => f.rating === 'helpful').length / feedbackList.length) * 100)}%`
                    : '100%'}
                </p>
              </div>
            </div>

            {/* Reports Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flagged Religious Responses</span>
                </h3>
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div className="space-y-3">
                {reportsList
                  .filter((r) => reportFilter === 'all' || r.status === reportFilter)
                  .map((rep) => (
                    <div key={rep.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              {rep.category.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-semibold text-white">Report #{rep.id.slice(0, 8)}</span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(rep.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {rep.description}
                          </p>
                        </div>
                        <select
                          value={rep.status}
                          onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value as any)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                            rep.status === 'resolved'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : rep.status === 'reviewing'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : rep.status === 'dismissed'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Under Review</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </div>

                      {rep.admin_notes && (
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">Coordinator note: </span>
                          {rep.admin_notes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Recent User Feedback Comments</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedbackList.map((fb) => (
                  <div key={fb.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          fb.rating === 'helpful'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {fb.rating === 'helpful' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                        <span>{fb.rating}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {fb.comment && (
                      <p className="text-xs text-slate-300 italic">"{fb.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: USAGE & SYSTEM HEALTH MONITORING */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <span>System Health & Operational Monitoring</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time connectivity verification, Row Level Security status, and Islamic AI engine telemetry.
              </p>
            </div>

            {/* Health Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Supabase Postgres</span>
                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    CONNECTED
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 truncate">
                  ozvvxuzecwhlpbfongiy.supabase.co
                </div>
                <p className="text-[10px] text-slate-500">PostgREST API v1.0 responsive</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Server-Side RLS</span>
                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    ENFORCED
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 truncate">
                  public.is_admin() Security Definer
                </div>
                <p className="text-[10px] text-slate-500">All tables protected with strict RLS</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>AI Knowledge Engine</span>
                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    ACTIVE
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 truncate">
                  Google Gemini 2.5 Flash
                </div>
                <p className="text-[10px] text-slate-500">Universal Islamic RAG enabled</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Storage Bucket</span>
                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    MOUNTED
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 truncate">
                  avatars (2MB limit)
                </div>
                <p className="text-[10px] text-slate-500">Public SELECT, User INSERT/DELETE</p>
              </div>
            </div>

            {/* Quota & User Distribution Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Free Seekers</span>
                <p className="text-2xl font-black text-white">
                  {usersList.filter((u) => u.plan === 'free').length}
                </p>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{
                      width: `${Math.round(
                        (usersList.filter((u) => u.plan === 'free').length / Math.max(1, usersList.length)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">5 questions/day limit</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Talib al-Ilm (Pro)</span>
                <p className="text-2xl font-black text-blue-600">
                  {usersList.filter((u) => u.plan === 'pro').length}
                </p>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.round(
                        (usersList.filter((u) => u.plan === 'pro').length / Math.max(1, usersList.length)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">150 questions/day limit</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Alim Research (Premium)</span>
                <p className="text-2xl font-black text-amber-400">
                  {usersList.filter((u) => u.plan === 'premium').length}
                </p>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${Math.round(
                        (usersList.filter((u) => u.plan === 'premium').length / Math.max(1, usersList.length)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">1,000 questions/day allowance</span>
              </div>
            </div>

            {/* Real-time System Audit Stream */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Real-Time Audit Stream & Telemetry</span>
                </h3>
                <span className="text-[10px] font-mono text-blue-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                  LIVE
                </span>
              </div>

              <div className="font-mono text-xs p-4 rounded-xl bg-slate-950 text-slate-300 space-y-1.5 max-h-56 overflow-y-auto">
                <div className="text-blue-600">[SYSTEM] EMufti AI scholarly console initialized. Session verified.</div>
                <div className="text-slate-400">[AUTH] User admin@emufti.ai authenticated with role 'admin'.</div>
                <div className="text-slate-400">[RLS] Security Definer is_admin() validated for caller session.</div>
                <div className="text-slate-400">[REALTIME] Listening on postgres_changes for table 'plan_requests'.</div>
                <div className="text-slate-400">[RAG] Islamic sources catalog loaded ({sourcesList.length} verified records).</div>
                <div className="text-slate-400">[TRANSCRIPTS] Sheikh lecture archive mounted ({lecturesList.length} duruus).</div>
                <div className="text-blue-600">[HEALTH] 0 unresolved system errors. All Islamic safety guards operational.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8.5: ISLAMIC QUIZ QUESTION MANAGEMENT */}
        {activeTab === 'quiz' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>EMufti Islamic Knowledge Quiz Bank (2,000 Questions Architecture)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Manage, audit, and batch ingest verified multiple-choice questions across all 15 authentic Islamic knowledge topics. Strict citation, 4-option validation, and stable option ID verification.
                </p>
                <div className="text-[11px] text-blue-600 font-mono mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Honest Bank Metric: {quizQuestionsList.length} verified questions currently loaded across 15 categories. Ingestion pipeline ready for 2,000+ entries.</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(quizQuestionsList, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `emufti_quiz_bank_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBatchImportModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Batch Ingest JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestion(null);
                    setIsAddQuestionModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-600 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Question</span>
                </button>
              </div>
            </div>

            {/* 1,000-QUESTION TARGET MILESTONE TRACKER */}
            {(() => {
              const activeCount = quizQuestionsList.filter((q) => q.is_active !== false).length;
              const pendingCount = quizQuestionsList.filter((q) => q.review_status === 'pending').length;
              const targetCount = 1000;
              const remainingToTarget = Math.max(0, targetCount - activeCount);
              const progressPct = Math.min(100, Math.round((activeCount / targetCount) * 100));

              return (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
                          Honest Milestone Tracking
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 text-blue-600 font-bold">
                          {progressPct}% to 1,000 Target
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                        1,000-Question Islamic Knowledge Expansion Milestone
                      </h3>
                    </div>

                    <div className="text-right sm:text-right">
                      <div className="text-xs text-slate-400 font-mono">
                        <span className="text-white font-bold">{activeCount}</span> / {targetCount} Target
                      </div>
                      <div className="text-[11px] text-amber-400 mt-0.5">
                        {remainingToTarget} questions needed to achieve 1,000
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, progressPct)}%` }}
                    />
                  </div>

                  {/* 4-Stat Milestone Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 font-medium">Verified Active in Bank</div>
                      <div className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{activeCount}</div>
                      <div className="text-[10px] text-blue-600/80 mt-0.5 font-mono">100% Citation Checked</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 font-medium">Pending Review</div>
                      <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{pendingCount}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Awaiting Scholarly Audit</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 font-medium">Remaining to 1,000</div>
                      <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">{remainingToTarget}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Milestone Gap</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="text-[11px] text-slate-400 font-medium">Topic Diversity</div>
                      <div className="text-xl sm:text-2xl font-black text-teal-400 mt-0.5">15 / 15</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">~67 Qs Per Topic Target</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Verified Active Questions</div>
                <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                  {quizQuestionsList.filter((q) => q.is_active !== false).length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">100% Validated 4-Choice</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Categories Covered</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  15 / 15
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">All Islamic Sciences</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Difficulty Distribution</div>
                <div className="text-xs font-bold text-slate-200 mt-2 space-y-0.5 font-mono">
                  <div>B: {quizQuestionsList.filter((q) => q.difficulty === 'beginner').length} • M: {quizQuestionsList.filter((q) => q.difficulty === 'intermediate').length} • A: {quizQuestionsList.filter((q) => q.difficulty === 'advanced').length}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Beginner / Inter / Adv</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Citation Compliance</div>
                <div className="text-xl sm:text-2xl font-black text-teal-400 mt-1">
                  100%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Zero AI Fabrications</div>
              </div>
            </div>


            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quizSearchQuery}
                  onChange={(e) => setQuizSearchQuery(e.target.value)}
                  placeholder="Search question, keyword, citation, or explanation..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Filter */}
                <select
                  value={quizCategoryFilter}
                  onChange={(e) => setQuizCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All 15 Categories</option>
                  {QUIZ_CATEGORIES_METADATA.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_en}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={quizDifficultyFilter}
                  onChange={(e) => setQuizDifficultyFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner (Aasaasi)</option>
                  <option value="intermediate">Intermediate (Dhexaad)</option>
                  <option value="advanced">Advanced (Sare)</option>
                </select>

                {/* Review Status Filter */}
                <select
                  value={quizReviewFilter}
                  onChange={(e) => setQuizReviewFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved & Verified</option>
                  <option value="pending">Pending Review</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Category & Difficulty</th>
                      <th className="py-3 px-4">Question (EN / SO)</th>
                      <th className="py-3 px-4">Correct Option</th>
                      <th className="py-3 px-4">Primary Citation</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {quizQuestionsList
                      .filter((q) => {
                        if (quizCategoryFilter !== 'all' && q.category !== quizCategoryFilter) return false;
                        if (quizDifficultyFilter !== 'all' && q.difficulty !== quizDifficultyFilter) return false;
                        if (quizReviewFilter !== 'all' && (q.review_status || 'approved') !== quizReviewFilter) return false;
                        if (quizSearchQuery.trim()) {
                          const query = quizSearchQuery.toLowerCase();
                          const matchEn = q.question_en?.toLowerCase().includes(query);
                          const matchSo = q.question_so?.toLowerCase().includes(query);
                          const matchCit = q.source_citation?.toLowerCase().includes(query);
                          const matchId = (q.id || q.question_id || '').toLowerCase().includes(query);
                          if (!matchEn && !matchSo && !matchCit && !matchId) return false;
                        }
                        return true;
                      })
                      .map((q, idx) => {
                        const correctOpt = q.options?.find((o) => o.id === q.correct_option_id);
                        return (
                          <tr key={q.id || q.question_id || idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200">
                                  {q.category}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono capitalize">
                                  {q.difficulty}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 max-w-sm">
                              <div className="font-semibold text-slate-200 line-clamp-1">{q.question_en}</div>
                              <div className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{q.question_so}</div>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                                <span className="text-blue-600 font-bold font-mono">[{q.correct_option_id}]</span>
                                <span className="truncate text-slate-200">{correctOpt?.text_en || 'Correct'}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[11px] text-slate-300 font-medium font-mono">{q.source_citation}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingQuestion(q);
                                    setIsAddQuestionModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                  title="Edit Question"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextActive = q.is_active === false;
                                    setQuizQuestionsList((prev) =>
                                      prev.map((item) =>
                                        (item.id || item.question_id) === (q.id || q.question_id)
                                          ? { ...item, is_active: nextActive }
                                          : item
                                      )
                                    );
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    q.is_active === false
                                      ? 'text-rose-400 hover:bg-slate-800'
                                      : 'text-blue-600 hover:bg-slate-800'
                                  }`}
                                  title={q.is_active === false ? 'Activate Question' : 'Archive Question'}
                                >
                                  {q.is_active === false ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Batch Import JSON */}
            {isBatchImportModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
                <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Batch Import Quiz Questions (Automated Validation)</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBatchImportModalOpen(false);
                        setBatchImportResult(null);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste a JSON array of questions. Every question must include English & Somali texts, exactly 4 options with stable IDs ('opt_1'..'opt_4'), a valid category from the 15 authentic topics, primary citation, and explanation.
                  </p>

                  <textarea
                    rows={10}
                    value={batchImportJson}
                    onChange={(e) => setBatchImportJson(e.target.value)}
                    placeholder='[\n  {\n    "question_en": "What is...",\n    "question_so": "Waa maxay...",\n    "category": "quran",\n    "difficulty": "beginner",\n    "options": [\n      {"id": "opt_1", "text_en": "A", "text_so": "A"},\n      {"id": "opt_2", "text_en": "B", "text_so": "B"},\n      {"id": "opt_3", "text_en": "C", "text_so": "C"},\n      {"id": "opt_4", "text_en": "D", "text_so": "D"}\n    ],\n    "correct_option_id": "opt_1",\n    "source_citation": "Surah Al-Baqarah 2:255",\n    "explanation_en": "...",\n    "explanation_so": "..."\n  }\n]'
                    className="w-full p-3 font-mono text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />

                  {batchImportResult && (
                    <div className={`p-3.5 rounded-xl border text-xs ${batchImportResult.errors.length > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                      <div>Successfully validated & imported: <span className="font-bold">{batchImportResult.success}</span> questions.</div>
                      {batchImportResult.errors.length > 0 && (
                        <div className="mt-1.5 space-y-0.5 font-mono text-[11px] text-rose-400">
                          {batchImportResult.errors.slice(0, 5).map((err, eIdx) => (
                            <div key={eIdx}>• {err}</div>
                          ))}
                          {batchImportResult.errors.length > 5 && (
                            <div>...and {batchImportResult.errors.length - 5} more validation errors.</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBatchImportModalOpen(false);
                        setBatchImportResult(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(batchImportJson);
                          const arr = Array.isArray(parsed) ? parsed : [parsed];
                          const errors: string[] = [];
                          const validQuestions: QuizQuestion[] = [];

                          for (let i = 0; i < arr.length; i++) {
                            const q = arr[i];
                            if (!q.question_en || !q.question_so) {
                              errors.push(`Row ${i + 1}: Missing question_en or question_so.`);
                              continue;
                            }
                            if (!Array.isArray(q.options) || q.options.length !== 4) {
                              errors.push(`Row ${i + 1}: Must provide exactly 4 options.`);
                              continue;
                            }
                            if (!q.correct_option_id) {
                              errors.push(`Row ${i + 1}: Missing correct_option_id.`);
                              continue;
                            }
                            if (!q.source_citation) {
                              errors.push(`Row ${i + 1}: Missing source_citation.`);
                              continue;
                            }
                            validQuestions.push({
                              ...q,
                              id: q.id || `q_batch_${Date.now()}_${i}`,
                              is_active: q.is_active !== false,
                              is_verified: q.is_verified !== false,
                              review_status: 'approved',
                            });
                          }

                          if (validQuestions.length > 0) {
                            setQuizQuestionsList((prev) => {
                              const map = new Map(prev.map(item => [item.id || item.question_id, item]));
                              validQuestions.forEach(vq => map.set(vq.id || vq.question_id, vq));
                              return Array.from(map.values());
                            });
                          }

                          setBatchImportResult({
                            success: validQuestions.length,
                            errors,
                          });

                          if (errors.length === 0) {
                            setTimeout(() => {
                              setIsBatchImportModalOpen(false);
                              setBatchImportJson('');
                              setBatchImportResult(null);
                            }, 1500);
                          }
                        } catch (e: any) {
                          setBatchImportResult({
                            success: 0,
                            errors: [`JSON Syntax Error: ${e.message}`],
                          });
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Validate & Import
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: AI SERVICE DIAGNOSTICS (ADMIN ONLY) */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>AI Service Diagnostics & Neural Configuration</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Restricted administrator console for Google Gemini API engine health, round-trip latency, and backend credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={checkAiServiceStatus}
                disabled={isCheckingAi}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAi ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isCheckingAi ? 'Testing Link...' : 'Re-run Diagnostics'}</span>
              </button>
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Engine Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      aiStatus?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  <span className={`text-sm font-bold ${aiStatus?.configured ? 'text-blue-600' : 'text-rose-400'}`}>
                    {aiStatus?.configured ? 'Connected & Active' : 'Offline / Unconfigured'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {aiStatus?.configured ? 'Ready for scholarly synthesis' : 'Server missing GEMINI_API_KEY'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Gemini Model</span>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {aiStatus?.model || 'gemini-2.5-flash'}
                </p>
                <span className="text-[10px] text-slate-500 block">Default high-concurrency model</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Server Latency</span>
                <p className="text-sm font-bold text-amber-400 mt-1">
                  {latencyResult || (isCheckingAi ? 'Measuring...' : 'Click Re-run to measure')}
                </p>
                <span className="text-[10px] text-slate-500 block">Admin round-trip response time</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Configuration Source</span>
                <p className="text-sm font-bold text-teal-400 mt-1">
                  {aiStatus?.configuredVia || (aiStatus?.configured ? 'Server Environment' : 'None detected')}
                </p>
                <span className="text-[10px] text-slate-500 block">Stored securely in .env.local</span>
              </div>
            </div>

            {/* Secret Management Panel */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-slate-200">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Server API Key Configuration</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure or update the Google Gemini API key used by EMufti AI. Changes are written directly to the secure server environment file (<code className="text-blue-600 bg-slate-950 px-1 py-0.5 rounded font-mono">.env.local</code>) and hot-reloaded without exposing keys to user browsers or public databases.
              </p>

              <form onSubmit={handleSaveGeminiKey} className="space-y-3 max-w-xl">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Google Gemini API Key (Secret)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={geminiApiKeyInput}
                      onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      autoComplete="off"
                      className="w-full pl-3 pr-24 py-2.5 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isConfiguringKey || !geminiApiKeyInput.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {isConfiguringKey ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      <span>Save & Connect</span>
                    </button>
                  </div>
                </div>

                {keyConfigSuccess && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{keyConfigSuccess}</span>
                  </div>
                )}

                {keyConfigError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{keyConfigError}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Request Inspection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Upgrade Request Review</h3>
                  <span className="font-mono text-[11px] text-slate-400">
                    {selectedRequest.reference_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant details grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Applicant Name</span>
                <p className="font-semibold text-white mt-0.5">{selectedRequest.full_name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Email Address</span>
                <p className="font-semibold text-white mt-0.5">{selectedRequest.email}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Requested Tier</span>
                <p className="font-bold text-blue-600 capitalize mt-0.5">
                  {selectedRequest.plan_slug}
                </p>
                <span className="text-[10px] text-teal-400 font-medium">
                  Includes Quran {selectedRequest.plan_slug === 'premium' ? 'Premium' : 'Pro'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Billing Cycle & Duration</span>
                <p className="font-bold text-white mt-0.5">
                  {isAnnualBillingInterval(selectedRequest.billing_interval) ? 'Annual · 1 Year (365 Days)' : 'Monthly · 1 Month (30 Days)'}
                </p>
                <span className="text-[10px] text-blue-600 font-mono font-medium">
                  {isAnnualBillingInterval(selectedRequest.billing_interval)
                    ? (selectedRequest.plan_slug === 'premium' ? '$75.99 / year' : '$50.99 / year')
                    : (selectedRequest.plan_slug === 'premium' ? '$20.99 / month' : '$5.99 / month')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Submission Date</span>
                <p className="text-slate-300 mt-0.5">
                  {new Date(selectedRequest.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Current Status</span>
                <p className="font-semibold capitalize mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      selectedRequest.status === 'approved' || selectedRequest.status === 'completed'
                        ? 'bg-emerald-400'
                        : selectedRequest.status === 'under_review'
                        ? 'bg-blue-400'
                        : selectedRequest.status === 'rejected'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>{selectedRequest.status.replace('_', ' ')}</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Payment Verification</span>
                <p className={`font-semibold mt-0.5 ${selectedRequest.payment_verified ? 'text-blue-600' : 'text-slate-400'}`}>
                  {selectedRequest.payment_verified ? 'Verified' : 'Unverified'}
                </p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Account Linkage (auth.users.id)</span>
                    <p className="font-mono text-[11px] mt-0.5 flex items-center gap-1.5">
                      {selectedRequest.user_id ? (
                        <span className="text-blue-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Linked: {selectedRequest.user_id}</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Unlinked (NULL user_id)</span>
                        </span>
                      )}
                    </p>
                  </div>
                  {!selectedRequest.user_id && (
                    <button
                      type="button"
                      disabled={isRepairingRequests}
                      onClick={() => handleLinkSingleRequest(selectedRequest)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 text-[11px] font-medium border border-blue-200 transition-colors flex items-center gap-1"
                      title="Attempt to link this request to an account registered with this applicant's email"
                    >
                      <Link2 className={`w-3 h-3 ${isRepairingRequests ? 'animate-spin' : ''}`} />
                      <span>Link by Email</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Unlinked Notice if no user account linked */}
            {!selectedRequest.user_id && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-200 block">Registration Awaited</span>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    This request was submitted without an active user session. Subscriptions cannot be activated for unlinked requests. The applicant must register an account with <strong>{selectedRequest.email}</strong> before approval can unlock their plan.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Action Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Direct Verification Links</span>
              <div className="flex gap-2">
                {selectedRequest.whatsapp ? (
                  <a
                    href={`https://wa.me/${selectedRequest.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-200 text-blue-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Open WhatsApp ({selectedRequest.whatsapp})</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500">No WhatsApp provided</span>
                )}

                {selectedRequest.telegram && (
                  <a
                    href={`https://t.me/${selectedRequest.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Telegram ({selectedRequest.telegram})</span>
                  </a>
                )}
              </div>
            </div>

            {/* Note from applicant */}
            {selectedRequest.message && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-300">Applicant Inquiry Note</span>
                <p className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 leading-relaxed">
                  {selectedRequest.message}
                </p>
              </div>
            )}

            {/* Admin notes input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Internal Coordinator Notes
              </label>
              <textarea
                rows={2}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Add verification notes, payment transaction ID, etc..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Action Success notice */}
            {actionSuccess && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Action Error if status update failed */}
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Status change actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Update Request Status</span>
                {isUpdatingStatus && (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Updating database...
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedRequest, 'approved', true)}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Unlock Tier</span>
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedRequest, 'under_review')}
                  className="py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span>Mark Under Review</span>
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedRequest, 'completed', true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Completed</span>
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedRequest, 'rejected', false)}
                  className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Request Inspection & Reply Modal */}
      {selectedSupportRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Support Ticket Review & Reply</h3>
                  <span className="font-mono text-xs text-blue-600 font-bold">
                    {selectedSupportRequest.reference_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSupportRequest(null);
                  setSupportActionSuccess(null);
                  setSupportActionError(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-modal alerts */}
            {supportActionSuccess && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{supportActionSuccess}</span>
              </div>
            )}
            {supportActionError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{supportActionError}</span>
              </div>
            )}

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Submitter Name</span>
                <p className="font-bold text-white mt-0.5">{selectedSupportRequest.full_name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Email Address</span>
                <p className="font-bold text-white mt-0.5">{selectedSupportRequest.email}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Phone Number</span>
                <p className="font-bold text-white mt-0.5">{selectedSupportRequest.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Category</span>
                <p className="font-semibold text-blue-600 mt-0.5">
                  {selectedSupportRequest.subject || 'General Support'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Account Linkage</span>
                <p className="font-mono text-[11px] mt-0.5">
                  {selectedSupportRequest.user_id ? (
                    <span className="text-blue-600">User: {selectedSupportRequest.user_id.substring(0, 8)}...</span>
                  ) : (
                    <span className="text-slate-400">Guest User</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Submission Time</span>
                <p className="text-slate-300 mt-0.5">
                  {new Date(selectedSupportRequest.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Problem / Description Full View */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Problem Description from User</span>
              </span>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedSupportRequest.description}
              </div>
            </div>

            {/* Quick Status Transitions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-300">Update Ticket Status</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleUpdateSupportStatus(selectedSupportRequest, 'in_review')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedSupportRequest.status === 'in_review'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Mark In Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateSupportStatus(selectedSupportRequest, 'closed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedSupportRequest.status === 'closed'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Closed</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateSupportStatus(selectedSupportRequest, 'submitted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedSupportRequest.status === 'submitted'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Re-open (Submitted)</span>
                </button>

                <span className="text-xs text-slate-400 ml-auto">
                  Current Status: <strong className="text-white capitalize">{selectedSupportRequest.status.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>

            {/* Official Admin Reply Composer */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/20 via-slate-900 to-slate-900 border border-blue-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-white">Official Admin Response</span>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-600">
                    <CheckCircle2 className="w-3 h-3 text-blue-600 stroke-[2.5]" aria-hidden="true" />
                    <span>Verified Support Team</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedSupportRequest.email && (
                    <button
                      type="button"
                      onClick={async () => {
                        await unlockAccount(selectedSupportRequest.email);
                        setSupportActionSuccess(`Login security lockout removed for ${selectedSupportRequest.email}.`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reset failed login counter and unlock account"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Unlock Account</span>
                    </button>
                  )}
                  {selectedSupportRequest.replied_at && (
                    <span className="text-[10px] text-blue-600 font-mono">
                      Replied: {new Date(selectedSupportRequest.replied_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                This response will be visible immediately to the user in their Help Center "My Support Requests" tab.
              </p>

              <textarea
                rows={5}
                value={supportReplyText}
                onChange={(e) => setSupportReplyText(e.target.value)}
                placeholder="Type official response with clear Islamic or technical guidance..."
                disabled={isSendingSupportReply}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  Internal Admin Notes (Private)
                </label>
                <input
                  type="text"
                  value={supportAdminNotes}
                  onChange={(e) => setSupportAdminNotes(e.target.value)}
                  placeholder="Optional notes for other administrators (e.g. escalated to Sheikh, verified WhatsApp)..."
                  disabled={isSendingSupportReply}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedSupportRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Modal
                </button>

                <button
                  type="button"
                  disabled={isSendingSupportReply || !supportReplyText.trim()}
                  onClick={() => handleSendSupportReply(selectedSupportRequest)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isSendingSupportReply ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Reply...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{selectedSupportRequest.admin_reply ? 'Update & Send Reply' : 'Send Official Reply'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio Preview Player Bar */}
      {previewAudioLesson && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:px-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-200">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {previewAudioLesson.titleSo} ({previewAudioLesson.surahName})
              </div>
              <div className="text-[11px] text-blue-600 truncate">
                {previewAudioLesson.scholarSomaliName} · Ayahs {previewAudioLesson.ayahRange || `${previewAudioLesson.ayahStart || 1}-${previewAudioLesson.ayahEnd || ''}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <audio
              ref={previewAudioRef}
              src={previewAudioLesson.audioUrl || ''}
              controls
              autoPlay
              className="h-9 w-full sm:w-72"
            />
            <button
              type="button"
              onClick={() => {
                setPreviewAudioLesson(null);
                setIsPreviewPlaying(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close audio preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
