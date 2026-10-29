export type UserRole = 'user' | 'admin' | 'moderator';

export type PlanSlug = 'free' | 'pro' | 'premium';

export function normalizePlanSlug(val: unknown): PlanSlug {
  if (!val || typeof val !== 'string') return 'free';
  const s = val.trim().toLowerCase();
  if (s === 'premium' || s.includes('premium') || s === 'alim' || s.includes('alim')) return 'premium';
  if (s === 'pro' || s.includes('pro') || s === 'talib' || s.includes('talib')) return 'pro';
  return 'free';
}

export function getPlanLabel(val: unknown): string {
  const slug = normalizePlanSlug(val);
  if (slug === 'premium') return 'Premium';
  if (slug === 'pro') return 'Pro';
  return 'Free';
}

export function normalizeSubscriptionStatus(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  return val.trim().toLowerCase();
}

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sent' | 'generating' | 'completed' | 'failed';

export type ReportCategory = 'inaccurate_quran' | 'unverified_hadith' | 'inappropriate_fiqh' | 'misleading_translation' | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  phone_number?: string;
  phone_country_code?: string;
  preferred_language: 'en' | 'so' | 'ar';
  default_response_language: 'auto' | 'en' | 'so' | 'ar';
  theme: 'light' | 'dark' | 'system';
  accent_color?: 'blue' | 'emerald' | 'teal' | 'cyan' | 'indigo' | 'amber' | 'rose';
  interface_density?: 'comfortable' | 'compact' | 'spacious';
  font_size?: 'small' | 'medium' | 'large';
  reduced_motion?: boolean;
  high_contrast?: boolean;
  learning_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_style?: 'explanation' | 'qa' | 'revision';
  preferred_school?: 'all' | 'shafii' | 'hanafi' | 'maliki' | 'hanbali';
  answer_length?: 'concise' | 'balanced' | 'detailed';
  explanation_style?: 'simple' | 'advanced';
  show_references?: boolean;
  notifications_enabled?: boolean;
  reminder_schedule?: 'fajr' | 'morning' | 'evening';
  reminder_timezone?: string;
  settings?: Record<string, any>;
  role: UserRole;
  plan?: PlanSlug;
  quran_plan?: 'free' | 'trial' | 'pro' | 'premium' | 'expired';
  plan_activated_at?: string;
  plan_expires_at?: string;
  started_at?: string;
  expires_at?: string;
  billing_interval?: 'monthly' | 'yearly' | 'annual' | string;
  quran_trial_started_at?: string;
  quran_trial_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  is_pinned: boolean;
  is_archived: boolean;
  topic?: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  id: string;
  type: 'quran' | 'hadith' | 'scholarly' | 'tafsir';
  reference: string; // e.g. "Surah Al-Baqarah (2:183)" or "Sahih al-Bukhari 1"
  arabic_text?: string;
  translation?: string;
  source?: string; // e.g. "Ibn Kathir", "Sahih al-Bukhari"
  verified: boolean; // true if verified against known Islamic dataset
  url?: string; // Clickable primary source URL e.g. https://quran.com/2/183
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  arabic_text?: string;
  language?: 'en' | 'so' | 'ar';
  status: MessageStatus;
  feedback?: 'helpful' | 'unhelpful' | null;
  citations?: Citation[];
  error_message?: string;
  created_at: string;
  /** True when Google Search grounding was used to generate this response */
  webSearchUsed?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: PlanSlug;
  description: string;
  price_amount: number; // in cents or whole units
  currency: string;
  billing_interval: 'month' | 'year';
  message_limit: number; // daily limit
  max_tokens: number;
  is_active: boolean;
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id?: string;
  plan: PlanSlug | string | Plan;
  billing_interval?: 'monthly' | 'yearly' | 'annual' | string;
  price_amount?: number;
  currency?: string;
  provider?: 'stripe' | 'development' | 'manual' | string;
  provider_subscription_id?: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'expired' | string;
  request_id?: string;
  quran_access?: boolean;
  current_period_start: string;
  current_period_end: string;
  started_at?: string;
  expires_at?: string;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  conversation_id: string;
  request_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  status: 'success' | 'error';
  created_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  conversation_id?: string;
  message_id?: string;
  title: string;
  content: string;
  topic: string; // 'Quran' | 'Hadith' | 'Fiqh' | 'Duas' | 'History' | 'General'
  folder?: string; // Custom Folder Name or ID
  tags: string[];
  created_at: string;
}

export interface SavedFolder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  itemCount?: number;
  created_at: string;
}

export interface ResponseFeedback {
  id: string;
  user_id: string;
  message_id: string;
  rating: 'helpful' | 'unhelpful';
  comment?: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  message_id: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  admin_email?: string;
  action: string;
  target_type: 'user' | 'plan' | 'report' | 'system' | 'model';
  target_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'sign_in'
  | 'sign_out'
  | 'password_change'
  | 'session_revoked'
  | 'profile_update'
  | 'avatar_update'
  | 'avatar_remove'
  | 'other';

export interface UserSecurityEvent {
  id: string;
  user_id: string;
  event_type: SecurityEventType | string;
  device_info?: string;
  description?: string;
  ip_address?: string;
  ip_approx_city?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  preferred_language: 'en' | 'so' | 'ar';
  default_response_language: 'auto' | 'en' | 'so' | 'ar';
  theme: 'light' | 'dark' | 'system';
  accent_color?: 'blue' | 'emerald' | 'teal' | 'cyan' | 'indigo' | 'amber' | 'rose';
  interface_density?: 'comfortable' | 'compact' | 'spacious';
  font_size: 'small' | 'medium' | 'large';
  enter_to_send: boolean;
  answer_length: 'concise' | 'balanced' | 'detailed';
  explanation_depth?: 'simple' | 'scholarly';
  explanation_style: 'simple' | 'advanced';
  preferred_school: 'all' | 'shafii' | 'hanafi' | 'maliki' | 'hanbali';
  learning_level: 'beginner' | 'intermediate' | 'advanced';
  learning_style: 'explanation' | 'qa' | 'revision';
  save_history: boolean;
  export_format: 'json' | 'text';
  include_timestamps_in_copy: boolean;
  account_security_notifications: boolean;
  learning_reminders: boolean;
  reminder_schedule: 'fajr' | 'morning' | 'evening';
  reminder_timezone: string;
  email_notifications: boolean;
  product_updates: boolean;
  chat_density?: 'comfortable' | 'compact' | 'spacious';
  reduced_motion?: boolean;
  high_contrast?: boolean;
  show_references?: boolean;
  audio_playback_speed?: number;
  autoplay_recitation?: boolean;
  continuous_recitation?: boolean;
  notification_sound?: boolean;
  tts_language?: 'auto' | 'so' | 'en' | 'ar';
  ai_persona?: 'mufti' | 'tafsir' | 'fiqh' | 'youth' | 'spiritual';
  tajweed_rules_enabled?: boolean;
  quran_font_size?: number;
}

export type PlanRequestStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'claimed'
  | 'completed'
  | 'rejected'
  | 'expired';

export type PlanActivationState =
  | 'active'
  | 'awaiting_registration'
  | 'payment_pending'
  | 'under_review'
  | 'pending'
  | 'activation_failed'
  | 'rejected'
  | 'approved'
  | 'claimed'
  | 'expired';

export interface PlanRequest {
  id: string;
  reference_id: string; // e.g. REQ-EMUFTI-XXXXXX
  user_id?: string;
  full_name: string;
  email: string;
  whatsapp?: string;
  telegram?: string;
  plan?: PlanSlug;
  plan_slug: PlanSlug;
  billing_interval?: 'monthly' | 'yearly' | 'annual' | string;
  duration?: string; // e.g. '1 month', '1 year'
  price_amount?: number;
  currency?: string;
  message?: string;
  status: PlanRequestStatus;
  payment_verified: boolean;
  has_registered_account?: boolean;
  is_active?: boolean;
  activation_state?: PlanActivationState;
  admin_notes?: string;
  approved_at?: string;
  approved_by?: string;
  offer_expires_at?: string;
  claimed_at?: string;
  subscription_id?: string;
  can_claim?: boolean;
  is_owner?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'plan_activation' | 'system' | 'reminder';
  metadata?: {
    request_id?: string;
    reference_id?: string;
    plan?: string;
    quran_plan?: string;
    billing_interval?: string;
    start_date?: string;
    expires_at?: string;
    price_amount?: number;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Quran, Audio Reciters, Duas, Tasbeeh & Trial Interfaces
// =============================================================================

export interface Surah {
  number: number;
  name: string; // Arabic name e.g. الفاتحة
  englishName: string; // e.g. Al-Faatiha
  englishNameTranslation: string; // e.g. The Opening
  somaliNameTranslation: string; // e.g. Furitaanka
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  page?: number;
}

export interface Ayah {
  number: number; // Global verse index (1..6236)
  numberInSurah: number; // 1..N in current surah
  text: string; // Arabic Uthmani text
  translationEn?: string; // English translation (Saheeh Intl)
  translationSo?: string; // Somali translation (Abduh)
  audioUrl?: string; // Audio file URL
  page?: number;
  juz?: number;
  hizbQuarter?: number;
}

export interface QariReciter {
  id: string;
  name: string;
  arabicName: string;
  country: string; // e.g. 'Somalia', 'Saudi Arabia', 'Egypt', 'Kuwait', 'Sudan', 'Yemen', 'Morocco', 'UAE'
  style: string; // e.g. 'Murattal', 'Mujawwad', 'Hafs', 'Soosi', 'Khalaf'
  verseBaseUrl?: string; // EveryAyah CDN format: {baseUrl}/{paddedSurah}{paddedVerse}.mp3 (if verse-by-verse available)
  surahBaseUrl?: string; // mp3quran server/CDN: {surahBaseUrl}/{paddedSurah}.mp3
  portraitUrl?: string;
  bio?: string;
  hasVerseAudio: boolean; // true if EveryAyah verse audio is available for Mode A / Subcis
  surahTotal?: number; // total surahs available (e.g. 114)
}

export interface QuranReadingPlan {
  id: string;
  user_id: string;
  plan_type: 'pages_per_day' | 'target_days';
  mushaf_total_pages: number; // default 604
  mushaf_edition: string; // e.g. "Madinah Mushaf (604 pages)"
  daily_target_pages: number; // e.g. 20, 10, 5, 2.5
  target_days: number;
  current_page: number;
  pages_read: number;
  status: 'active' | 'paused' | 'completed';
  start_date: string;
  estimated_end_date?: string;
  last_read_date?: string;
  created_at: string;
  updated_at: string;
}

export interface QuranPlannerLog {
  id?: string;
  user_id: string;
  plan_id?: string;
  log_date: string; // YYYY-MM-DD
  pages_completed: number;
  start_page?: number;
  end_page?: number;
  notes?: string;
  created_at?: string;
}

export interface JuzInfo {
  number: number; // 1..30
  nameArabic: string; // e.g. "الجزء الأول"
  nameEnglish: string; // e.g. "Juz 1"
  nameSomali: string; // e.g. "Juz-ka 1aad"
  startSurah: number;
  startSurahName: string;
  startSurahArabic: string;
  startAyah: number;
  endSurah: number;
  endSurahName: string;
  endSurahArabic: string;
  endAyah: number;
  startPage: number;
  endPage: number;
  totalPages: number;
  startHizb: number;
  endHizb: number;
}

export type SurahTafsirCoverageStatus = 'complete' | 'in_progress' | 'not_available';

export interface SurahTafsirSummary {
  surahNumber: number;
  nameArabic: string;
  englishName: string;
  somaliNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  status: SurahTafsirCoverageStatus;
  verifiedLessonsCount: number;
  scholarsAvailable: string[];
  hasAudio: boolean;
  hasText: boolean;
}

export interface SomaliScholarTafsir {
  id: string;
  scholarName: string;
  scholarArabic: string;
  somaliName: string;
  country: string;
  descriptionEn: string;
  descriptionSo: string;
  portraitUrl?: string;
  sourceAttribution: string;
  externalLink?: string;
  isVerified?: boolean;
  isPublished?: boolean;
  availableSurahsCount?: number;
  lessons: TafsirLesson[];
}

export interface TafsirLesson {
  id: string;
  scholarId?: string;
  scholarName?: string;
  scholarSomaliName?: string;
  surahNumber: number;
  surahName: string;
  surahNameArabic?: string;
  ayahStart?: number;
  ayahEnd?: number;
  ayahRange?: string; // e.g. "1-7" or "1-40"
  titleSo: string;
  titleEn: string;
  audioUrl?: string;
  videoUrl?: string;
  transcriptSo?: string;
  transcriptEn?: string;
  duration?: string;
  durationSeconds?: number;
  sourceAttribution: string;
  sourceUrl?: string;
  verificationStatus?: 'verified' | 'pending_review' | 'unverified';
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserTafsirProgress {
  userId: string;
  lessonId: string;
  surahNumber: number;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastPlayedAt: string;
}

export interface QuranBookmark {
  id?: string;
  user_id?: string;
  surah_number: number;
  verse_number: number;
  surah_name: string;
  verse_text_preview?: string;
  note?: string;
  created_at?: string;
}

export interface QuranReadingProgress {
  id?: string;
  user_id: string;
  surah_number?: number;
  verse_number?: number;
  page_number?: number;
  last_surah: number;
  last_verse: number;
  last_page?: number;
  surah_name?: string;
  updated_at: string;
}

export interface TasbeehLog {
  user_id: string;
  dhikr_id: string;
  dhikr_name: string;
  count: number;
  target: number;
  total_completed_cycles: number;
  updated_at: string;
}

export interface DuaPhraseBreakdown {
  arabic: string;
  transliteration?: string;
  translationSo?: string;
  translationEn?: string;
}

export interface DuaItem {
  id: string;
  title: string;
  category: 'morning_evening' | 'quranic' | 'prophetic' | 'prayer_forgiveness' | 'travel_daily';
  arabic_text: string;
  transliteration?: string;
  translation_en: string;
  translation_so: string;
  reference: string;
  audio_url?: string;
  recommended_repetitions?: number;
  significance?: string;
  whenToRecite?: string;
  phrases?: DuaPhraseBreakdown[];
}

export interface TasbeehPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_so: string;
  default_target: number;
  hadith_reference?: string;
}

export interface QuranAccessStatus {
  authenticated: boolean;
  user_id?: string;
  is_paid_member: boolean;
  plan: PlanSlug;
  quran_plan?: string;
  trial_days_total?: number;
  trial_started_at?: string;
  trial_expires_at?: string;
  seconds_remaining?: number;
  trial_uses_total: number;
  trial_uses_consumed: number;
  trial_uses_remaining: number;
  has_trial_access: boolean;
  trial_exhausted: boolean;
  session_active_today?: boolean;
  unlimited?: boolean;
  message?: string;
}

export interface WaydiiEMuftiStatus {
  authenticated: boolean;
  user_id?: string;
  is_paid: boolean;
  plan: PlanSlug | 'guest';
  unlimited: boolean;
  allowed: boolean;
  uses_consumed: number;
  uses_remaining: number;
  total_allowed: number;
  message?: string;
  error?: string;
}

export interface WaydiiRecordResult {
  success: boolean;
  allowed: boolean;
  is_paid?: boolean;
  unlimited?: boolean;
  uses_consumed?: number;
  uses_remaining?: number;
  total_allowed?: number;
  error?: string;
}

export type SupportRequestStatus = 'submitted' | 'in_review' | 'replied' | 'closed';

export interface SupportRequest {
  id: string;
  reference_id: string;
  user_id?: string | null;
  guest_access_token?: string | null;
  full_name: string;
  email: string;
  phone: string;
  subject?: string;
  category?: 'account_access' | 'billing_subscription' | 'quran_features' | 'general' | string;
  description: string;
  status: SupportRequestStatus;
  admin_reply?: string | null;
  admin_id?: string | null;
  admin_notes?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// EMufti Islamic Quiz Interfaces
// =============================================================================

export type QuizCategory =
  | 'all'
  | 'quran'
  | 'tafsir'
  | 'hadith'
  | 'aqeedah'
  | 'fiqh'
  | 'purification_prayer'
  | 'fasting_ramadan'
  | 'zakat_charity'
  | 'hajj_umrah'
  | 'seerah'
  | 'history_companions'
  | 'adhkar_duas_manners'
  | 'ethics_daily_life'
  | 'arabic_terminology'
  | 'general'
  // Legacy aliases
  | 'history'
  | 'akhlaaq'
  | 'manners';

export type QuizDifficulty =
  | 'all'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'easy'
  | 'medium'
  | 'hard';

export type QuizMode =
  | 'quick'
  | 'standard'
  | 'challenge'
  | 'category'
  | 'practice'
  | 'timed'
  | 'review'
  | 'daily'
  | 'bookmarks'
  | 'exam';

export interface QuizCategoryMeta {
  id: QuizCategory;
  name_en: string;
  name_so: string;
  name_ar: string;
  description_en: string;
  description_so: string;
  iconName: string;
  questionCount?: number;
}

export interface QuizOption {
  id: string; // Stable option identifier, e.g. "opt_1", "opt_2", "opt_3", "opt_4"
  text_en: string;
  text_so: string;
  text_ar: string;
}

export interface QuizQuestion {
  id: string;
  question_id: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  question_en: string;
  question_so: string;
  question_ar: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption] | QuizOption[]; // Exactly 4 structured options
  correct_option_id: string; // References stable QuizOption.id
  // Compatibility properties
  options_en?: [string, string, string, string];
  options_so?: [string, string, string, string];
  options_ar?: [string, string, string, string];
  correct_index?: number;
  explanation_en?: string;
  explanation_so?: string;
  explanation_ar?: string;
  source_citation: string;
  review_status?: 'verified' | 'pending_review' | 'rejected' | 'reviewed' | 'draft';
  is_verified: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface ShuffledQuizQuestion extends QuizQuestion {
  shuffled_options: QuizOption[];
  displayed_correct_index: number;
}

export interface QuizAttempt {
  id: string;
  user_id?: string;
  category: string;
  difficulty: string;
  total_questions: number;
  score: number;
  is_timed: boolean;
  time_limit_seconds: number;
  extra_time_seconds: number;
  lifeline_50_50_used: boolean;
  lifeline_2time_used: boolean;
  lifeline_ask_emufti_used: boolean;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  user_id?: string;
  question_id: string;
  selected_index: number;
  selected_option_id?: string;
  is_correct: boolean;
  created_at: string;
}

export interface QuizBookmark {
  id: string;
  user_id: string;
  question_id: string;
  category?: string;
  created_at: string;
}

export interface QuizUserMistake {
  id: string;
  user_id: string;
  question_id: string;
  category: string;
  difficulty: string;
  selected_option_id?: string | null;
  correct_option_id: string;
  times_incorrect: number;
  is_resolved: boolean;
  last_attempted_at: string;
}

export interface QuizDailyStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_active_days: number;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Method 2: Automatic Payment Types
// -----------------------------------------------------------------------------
export type PaymentMethod = 'manual' | 'mobile_money' | 'card';
export type MobileProvider = 'eVC Plus' | 'Sahal' | 'ZAAD';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';

export interface PaymentTransaction {
  id: string;
  reference_id: string;
  user_id?: string | null;
  plan_slug: PlanSlug;
  billing_interval: 'monthly' | 'annual' | string;
  payment_method: PaymentMethod;
  payment_option?: string;
  mobile_operator?: string;
  mobile_provider?: MobileProvider;
  masked_identifier?: string;
  card_brand?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failure_reason?: string;
  provider_tx_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Quran Recitation Teacher (Macallin) Types
// -----------------------------------------------------------------------------
export type MacallinLessonStatus = 'pending' | 'in_progress' | 'completed' | 'needs_review';
export type MacallinSelectionMode = 'entire_surah' | 'ayah_range' | 'custom_quantity';

export interface NextLessonPlan {
  surah_number: number;
  surah_name: string;
  surah_arabic_name?: string;
  start_ayah: number;
  end_ayah: number;
  assigned_ayahs_count: number;
  selection_mode: MacallinSelectionMode;
  scheduled_date: string; // YYYY-MM-DD
  messageSo?: string;
  messageEn?: string;
}

export interface MacallinLesson {
  id: string;
  user_id: string;
  surah_number: number;
  surah_name: string;
  surah_arabic_name?: string;
  start_ayah: number;
  end_ayah: number;
  assigned_ayahs_count?: number;
  selection_mode?: MacallinSelectionMode;
  scheduled_date: string; // YYYY-MM-DD
  status: MacallinLessonStatus;
  mistakes_count: number;
  accuracy_percentage?: number;
  next_lesson_assignment?: NextLessonPlan | null;
  teacher_override?: boolean;
  teacher_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type MacallinErrorCategory =
  | 'xarakada'      // Xarakada (Harakat)
  | 'makhaarijta'   // Xarfaha iyo makhaarijta
  | 'tajwiidka'     // Tajwiidka
  | 'erayada';      // Erayada iyo aayadaha

export type MacallinMistakeType =
  | 'missing_word'
  | 'mismatched_word'
  | 'extra_word'
  | 'letter_substitution'
  | 'harakah_error'
  | 'tajweed_violation'
  | 'makhraj_error'
  | 'unverified';

export interface MacallinLetterSegment {
  char: string;
  diacritics: string;
  isError: boolean;
  errorCategory?: MacallinErrorCategory;
  errorType?: MacallinMistakeType;
  expectedHarakah?: string;
  detectedHarakah?: string;
  expectedLetter?: string;
  detectedLetter?: string;
  mistake?: MacallinMistake;
}

export interface MacallinMistake {
  id?: string;
  surah_number?: number;
  ayah_number: number;
  word_index?: number;
  char_index?: number;
  location_text?: string;
  category?: MacallinErrorCategory;
  category_label_so?: string;
  categoryLabelSo?: string;
  type: MacallinMistakeType;
  expected_word?: string;
  expectedText?: string;
  recited_word?: string;
  detectedText?: string;
  specific_letter?: string;
  makhraj_category?: string;
  tajweed_rule?: string;
  harakah_expected?: string;
  harakah_detected?: string;
  highlight_target?: 'word' | 'letter' | 'harakah';
  highlight_index?: number;
  message?: string;
  explanation_so?: string;
  correction_note_so?: string;
  correctionNoteSo?: string;
  correction_tip?: string;
  confidence?: number;
}

export interface MacallinWordVerification {
  word_index: number;
  ayah_number: number;
  raw_text: string;
  normalized_text: string;
  status: 'correct' | 'error' | 'uncertain' | 'pending';
  mistake?: MacallinMistake;
  specific_letter_error?: string;
  letter_segments?: MacallinLetterSegment[];
  wordIndex?: number;
  rawText?: string;
  normalizedText?: string;
  errorType?: string | null;
}

export interface MacallinAttempt {
  id: string;
  user_id: string;
  lesson_id?: string;
  surah_number: number;
  ayah_number: number;
  transcript?: string;
  expected_text?: string;
  accuracy_status: 'passed' | 'errors_detected' | 'unverified';
  mistakes: MacallinMistake[];
  evaluated_at: string;
}

export interface MacallinProgressSummary {
  total_completed_lessons: number;
  current_assigned_surah: number;
  current_assigned_surah_name: string;
  current_passage_range: string;
  next_lesson_date: string;
  total_attempts_count: number;
  confirmed_mistakes_count: number;
  has_pending_review: boolean;
}


