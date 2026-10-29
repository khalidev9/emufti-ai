import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Lock,
  Compass,
  FileText,
  ExternalLink,
  PhoneCall,
  Clock,
  RotateCcw,
  Send,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Inbox,
  User,
  Mail,
  Phone,
  LifeBuoy,
  Bell,
  XCircle,
  Loader2,
  Calendar,
  AlertTriangle,
  Mic,
} from 'lucide-react';
import { OFFICIAL_WHATSAPP_LINK, OFFICIAL_WHATSAPP_NUMBER } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage } from '../lib/storage';
import { SupportRequest, SupportRequestStatus } from '../types/database';
import { Logo } from '../components/common/Logo';
import { Footer } from '../components/layout/Footer';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_DATA: FAQItem[] = [
  // 1. Getting Started & Onboarding
  {
    id: 'gs-1',
    category: 'Getting Started',
    question: 'What is EMufti AI and what is its purpose?',
    answer:
      'EMufti AI is a specialized Islamic educational AI assistant built to make scripture and classical jurisprudence accessible. It provides citation-grounded answers in Somali, Arabic, and English based on the Holy Quran, authentic Hadith collections (Sahih al-Bukhari, Sahih Muslim, Sunan collections), and recognized Sunni schools of thought (Hanafi, Maliki, Shafi\'i, Hanbali). It is designed for educational research and daily worship clarification.',
    tags: ['onboarding', 'purpose', 'intro', 'overview'],
  },
  {
    id: 'gs-2',
    category: 'Getting Started',
    question: 'How do I start asking questions in Somali, English, or Arabic?',
    answer:
      'You can type your question in Somali, Arabic, English, or any supported language directly in the chat composer at /chat. The AI automatically detects your language and replies in the same language. If you switch languages mid-conversation, the assistant dynamically adapts immediately.',
    tags: ['language', 'somali', 'arabic', 'english', 'chat'],
  },
  {
    id: 'gs-3',
    category: 'Getting Started',
    question: 'Do I need an account to use EMufti AI?',
    answer:
      'You can explore the landing page and review Quran chapters without signing in. To ask AI questions and save your conversation history, a free account is required. Sign-up only takes 30 seconds with an email and password.',
    tags: ['account', 'login', 'signup', 'free'],
  },

  // 2. Asking Questions & Islamic Citations
  {
    id: 'qa-1',
    category: 'Islamic Q&A',
    question: 'How does EMufti AI ground its answers in Quran and Hadith?',
    answer:
      'Every answer is generated using strict Islamic prompt engineering and retrieval-augmented verification. When Quranic verses are cited, they include the Surah name and Ayah number (e.g. Surah Al-Baqarah 2:183) alongside authentic Arabic text. For Hadith, citations state the primary collection and narrator (e.g. Sahih al-Bukhari, Sahih Muslim).',
    tags: ['citations', 'quran', 'hadith', 'accuracy', 'references'],
  },
  {
    id: 'qa-2',
    category: 'Islamic Q&A',
    question: 'Does EMufti AI issue binding fatwas (religious legal decrees)?',
    answer:
      'No. Issuing binding fatwas requires living juristic authority, personalized contextual interrogation, and certified Muftis. EMufti AI presents comparative classical rulings and explains the evidence (adilla) across the four recognized Madhhabs so you can understand the established scholarly consensus and differences (ikhtilaf).',
    tags: ['fatwa', 'ruling', 'madhhab', 'scholars'],
  },
  {
    id: 'qa-3',
    category: 'Islamic Q&A',
    question: 'How do I report an inaccurate verse translation or Hadith reference?',
    answer:
      'Under any assistant response in the chat, click the flag icon (Report). You can categorize the issue (e.g., inaccurate translation, unverified hadith, fiqh nuance) and provide feedback. Our scholarly review team routinely inspects reported entries to maintain rigorous religious integrity.',
    tags: ['report', 'feedback', 'accuracy', 'correction'],
  },

  // 3. Pro & Premium Plans & Benefits
  {
    id: 'sub-1',
    category: 'Subscriptions',
    question: 'What are the question limits for Free, Pro, and Premium plans?',
    answer:
      '• Free Seeker: 5 questions every 24 hours (concise educational answers), standard response speed, 2-day full Quran Free Trial.\n• Talib al-Ilm (Pro): 150 questions per day, 4,000 token context depth, unlimited Quran reading and 50 audio reciters, priority response speed.\n• Alim Research (Premium): 1,000 questions per day, 8,000 token context depth, full Somali scholars Tafsir audio, formatted study sheets export, and Ramadan peak priority.',
    tags: ['limits', 'pro', 'premium', 'pricing', 'features'],
  },
  {
    id: 'sub-2',
    category: 'Subscriptions',
    question: 'Can I downgrade to the Free plan while my Pro or Premium plan is active?',
    answer:
      'No. If you have an active Pro or Premium subscription, you cannot switch back to Free until your active paid billing cycle expires. Your paid entitlements remain fully active and guaranteed until your period end date. When the subscription expires, your account will safely return to the Free tier automatically.',
    tags: ['downgrade', 'free', 'cancellation', 'expiry', 'period'],
  },
  {
    id: 'sub-3',
    category: 'Subscriptions',
    question: 'How do I request a Pro or Premium plan?',
    answer:
      'Visit the /pricing page and click "Request Pro" or "Request Premium". Fill out your details (name, email, WhatsApp, or Telegram). You will immediately receive a unique tracking/claim code (format: REQ-EMUFTI-XXXXXX). Save this code to track your request approval.',
    tags: ['request', 'plan', 'pricing', 'code', 'subscribe'],
  },

  // 4. Claim Offer & Tracking Codes
  {
    id: 'claim-1',
    category: 'Claim Offer',
    question: 'How does the Plan Approval and Claim Offer system work?',
    answer:
      '1. Submit a plan request on the Pricing page and receive your tracking code.\n2. Complete manual verification or donation via WhatsApp.\n3. An administrator verifies and approves your request.\n4. Go to /track, enter your code, and click "Verify & Claim". Your Pro or Premium plan activates instantly!',
    tags: ['claim', 'tracking', 'code', 'activation', 'instant'],
  },
  {
    id: 'claim-2',
    category: 'Claim Offer',
    question: 'Where can I find my tracking code if I lost it?',
    answer:
      'If you were signed in when submitting your request, visit /track and click "View my recent requests". Alternatively, contact our verified WhatsApp support with your registered email address, and our team will retrieve your tracking code.',
    tags: ['lost code', 'retrieve', 'support', 'tracking'],
  },

  // 5. Quran & Somali Tafsir Library
  {
    id: 'quran-1',
    category: 'Quran & Tafsir',
    question: 'What features are included in the Quran & Somali Tafsir Library?',
    answer:
      '• Complete 114 Surahs with verified Uthmani script and dual English/Somali translations.\n• High quality recitations from 50 world-renowned Qaris with playback speed control.\n• Authentic Somali audio Tafsir lessons from prominent Somali scholars (Sheikh Mustafe Xaaji Ismaaciil, Sheikh Cumar Faaruuq, Sheikh Nuur Cali Jamac).\n• Verse bookmarks, search, and personal reading notes.',
    tags: ['quran', 'tafsir', 'somali', 'audio', 'surah', 'reciters'],
  },
  {
    id: 'quran-2',
    category: 'Quran & Tafsir',
    question: 'What is the 2-Day Quran Free Trial?',
    answer:
      'Every newly registered user automatically receives a complimentary 2-day Quran Trial with 5 free browsing sessions to test all 114 Surahs and audio recitations before upgrading to Talib al-Ilm (Pro).',
    tags: ['trial', 'free trial', 'quran access', 'trial sessions'],
  },

  // 6. Security & Privacy
  {
    id: 'sec-1',
    category: 'Privacy',
    question: 'Are my conversations private and confidential?',
    answer:
      'Yes. Your conversation history is tied to your encrypted user ID. We never sell your personal data or share private question logs with external advertisers. You can clear your conversation history at any time from Settings.',
    tags: ['privacy', 'security', 'encryption', 'data'],
  },

  // 7. Support & Direct Contact
  {
    id: 'sup-1',
    category: 'Support',
    question: 'How quickly does the support team reply to support requests?',
    answer:
      'Our dedicated Islamic student care and administrative team reviews submitted requests round the clock. Most support requests submitted via this Help Center are answered within a few hours. You can view all admin replies directly in the "My Support Requests" tab.',
    tags: ['support', 'reply', 'speed', 'ticket', 'hours'],
  },
  {
    id: 'sup-2',
    category: 'Support',
    question: 'How do I contact the EMufti AI support team?',
    answer:
      'You can submit an official support request directly through the Help Center form on this page. Our verified support team reviews inquiries and replies directly to your account. You can also reach our official WhatsApp contact shown in the footer (+974 6678 2031).',
    tags: ['support', 'contact', 'help', 'ticket'],
  },
];

const CATEGORIES = [
  'All',
  'Getting Started',
  'Islamic Q&A',
  'Subscriptions',
  'Claim Offer',
  'Quran & Tafsir',
  'Privacy',
  'Support',
];

const SUBJECT_OPTIONS = [
  'General Support',
  'Account & Sign In',
  'Plan Upgrade & Subscription',
  'Claim Offer / Tracking Code',
  'Quran & Somali Tafsir Audio',
  'Citation & Inaccuracy Report',
  'Billing & Payment Verification',
  'Other Inquiry',
];

export type SupportCategoryKey =
  | 'general'
  | 'account_access'
  | 'billing_subscription'
  | 'quran_features';

export const SUPPORT_CATEGORIES: { key: SupportCategoryKey; label: string; defaultSubject: string }[] = [
  { key: 'general', label: 'General Inquiry & Student Guidance', defaultSubject: 'General Support' },
  { key: 'account_access', label: 'Account Access & Security Lockout Assistance', defaultSubject: 'Account Security & Lockout Assistance' },
  { key: 'billing_subscription', label: 'Billing, Payment & Plan Upgrades', defaultSubject: 'Plan Upgrade & Subscription' },
  { key: 'quran_features', label: 'Quran Recitations & Somali Tafsir Audio', defaultSubject: 'Quran & Somali Tafsir Audio' },
];

export const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  // Active Main Tab: 'submit' | 'faqs' | 'my_requests'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'faqs' | 'submit' | 'my_requests'>(() => {
    if (tabParam === 'faqs') return 'faqs';
    if (tabParam === 'my_requests' || tabParam === 'requests') return 'my_requests';
    return 'submit';
  });

  // Sync tab with URL
  const switchTab = (tab: 'faqs' | 'submit' | 'my_requests') => {
    setActiveTab(tab);
    setSearchParams(tab === 'submit' ? {} : { tab });
  };

  // ----------------------------------------------------
  // FAQ Search & Accordion State
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>('gs-1');

  const filteredFAQs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_DATA.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ----------------------------------------------------
  // Support Request Form State & Validation
  // ----------------------------------------------------
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<SupportCategoryKey>('general');
  const [subject, setSubject] = useState('General Support');
  const [description, setDescription] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    description?: string;
    confirmation?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Successful submission result
  const [submittedResult, setSubmittedResult] = useState<{
    referenceId: string;
    guestAccessToken?: string;
    timestamp: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pre-populate user details if authenticated or if redirected from lockout
  useEffect(() => {
    if (user) {
      if (!email && user.email) setEmail(user.email);
      if (!fullName) {
        const name = profile?.display_name || user.user_metadata?.full_name || '';
        if (name) setFullName(name);
      }
    }

    const reason = searchParams.get('reason');
    const emailParam = searchParams.get('email');
    if (reason === 'lockout') {
      setActiveTab('submit');
      setCategory('account_access');
      if (emailParam) {
        setEmail(emailParam);
      }
      setSubject('Account Security & Lockout Assistance');
      setDescription(
        'My account has been temporarily locked for security reasons after consecutive incorrect password attempts. Please assist in verifying my identity and unlocking my account.'
      );
    }
  }, [user, profile, searchParams]);

  // Validate form
  const validateForm = () => {
    const errors: { fullName?: string; email?: string; phone?: string; description?: string; confirmation?: string } = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      errors.fullName = 'Full Name is required.';
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Please enter a valid full name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = 'Email Address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!trimmedPhone) {
      errors.phone = 'Phone Number is required.';
    } else if (trimmedPhone.replace(/[^0-9]/g, '').length < 6) {
      errors.phone = 'Please enter a valid phone number with country/area code.';
    }

    if (!trimmedDesc) {
      errors.description = 'Problem / Description is required.';
    } else if (trimmedDesc.length < 10) {
      errors.description = 'Please describe your problem in at least 10 characters.';
    }

    if (!isConfirmed) {
      errors.confirmation = 'Please confirm that this account belongs to you and that the information provided is accurate.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const trimmedName = fullName.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPhone = phone.trim();
      const trimmedDesc = description.trim();
      const trimmedSubject = subject.trim() || 'General Support';

      // Generate reference ID and guest access token (if guest)
      const refId = storage.generateSupportReferenceId();
      const guestToken = !user?.id ? storage.generateGuestAccessToken() : null;

      // 1. Submit directly to Supabase database
      if (isSupabaseConfigured) {
        let insertPayload: Record<string, any> = {
          reference_id: refId,
          user_id: user?.id || null,
          guest_access_token: guestToken,
          full_name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          subject: trimmedSubject,
          category,
          description: trimmedDesc,
          status: 'submitted',
        };

        // Standard insert without chained select() so anonymous guests without SELECT RLS can insert safely
        let insertRes = await supabase.from('support_requests').insert(insertPayload);

        // If category is not in schema cache, embed category into description and retry cleanly
        if (insertRes.error && (insertRes.error.message?.includes('category') || insertRes.error.message?.includes('schema cache'))) {
          console.warn('[HelpCenterPage] category column missing in remote schema cache, retrying with embedded category in description:', insertRes.error.message);
          const formattedDesc = category && category !== 'general' && (category as string) !== 'other'
            ? `[Category: ${category}]\n\n${trimmedDesc}`
            : trimmedDesc;
          const retryPayload = {
            reference_id: refId,
            user_id: user?.id || null,
            guest_access_token: guestToken,
            full_name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            subject: trimmedSubject,
            description: formattedDesc,
            status: 'submitted',
          };
          insertRes = await supabase.from('support_requests').insert(retryPayload);
        }

        if (insertRes.error) {
          console.error('Supabase support_requests insert error:', insertRes.error);
          let userMsg = insertRes.error.message || 'Failed to save support request to database.';
          if (insertRes.error.code === '42501' || insertRes.error.message?.includes('policy')) {
            userMsg = 'Permission denied by Row Level Security policy. Please verify your contact details.';
          }
          // Do not falsely report success or clear form; allow user to retry
          throw new Error(userMsg);
        }
      }

      // 2. Also save to local storage history with verified database reference ID
      const localResult = storage.saveSupportRequest({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        description: trimmedDesc,
        subject: trimmedSubject,
        category,
        userId: user?.id || null,
      });

      if (localResult?.request) {
        localResult.request.reference_id = refId;
        if (guestToken) {
          localResult.request.guest_access_token = guestToken;
          storage.saveGuestSupportToken(refId, guestToken);
        }
      }

      // 3. Set confirmation display state only after confirmed persistence
      setSubmittedResult({
        referenceId: refId,
        guestAccessToken: guestToken || undefined,
        timestamp: new Date().toISOString(),
      });

      // 4. Reset form fields (keeping name/email for authenticated users)
      if (!user) {
        setFullName('');
        setEmail('');
      }
      setPhone('');
      setDescription('');
      setIsConfirmed(false);
      setFormErrors({});

      // 5. Trigger reload of user's requests
      loadMyRequests();
    } catch (err: any) {
      console.error('Failed to submit support request:', err);
      // Preserve form values and display clear actionable error
      setSubmitError(err?.message || 'Failed to submit support request. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(ref);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // ----------------------------------------------------
  // "My Support Requests" State & Loading
  // ----------------------------------------------------
  const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Track read requests to show unread reply indicators
  const [readReplyIds, setReadReplyIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('emufti_read_support_replies');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const markReplyAsRead = useCallback((requestId: string) => {
    setReadReplyIds((prev) => {
      if (prev.includes(requestId)) return prev;
      const updated = [...prev, requestId];
      try {
        localStorage.setItem('emufti_read_support_replies', JSON.stringify(updated));
      } catch {
        // Ignore quota/private mode
      }
      return updated;
    });
  }, []);

  // Manual guest lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [manualLookupResult, setManualLookupResult] = useState<SupportRequest | null>(null);

  const loadMyRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    setRequestsError(null);

    try {
      let combined: SupportRequest[] = [];

      // 1. If user is logged in, try fetching from Supabase
      if (user?.id && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('support_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            combined = data;
          }
        } catch (dbErr) {
          console.warn('Failed to fetch user requests from Supabase:', dbErr);
        }
      }

      // 2. Fetch local requests (covers guest tokens and local fallback)
      const localList = storage.getSupportRequests(user?.id || null);

      // Merge avoiding duplicates (prefer Supabase data when available)
      const existingIds = new Set(combined.map((r) => r.reference_id.toUpperCase()));
      for (const loc of localList) {
        if (!existingIds.has(loc.reference_id.toUpperCase())) {
          combined.push(loc);
          existingIds.add(loc.reference_id.toUpperCase());
        }
      }

      // Sort newest first
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMyRequests(combined);
    } catch (err: any) {
      console.error('Error loading my support requests:', err);
      setRequestsError('Unable to load support requests. Please try refreshing.');
    } finally {
      setIsLoadingRequests(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMyRequests();
  }, [loadMyRequests]);

  // Handle manual lookup for guest codes
  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupCode.trim().toUpperCase();
    if (!clean) return;

    setIsLookingUp(true);
    setLookupError(null);
    setManualLookupResult(null);

    try {
      let found: SupportRequest | null = null;

      // 1. Try local storage lookup
      found = storage.getSupportRequestByReference(clean);

      // 2. If not found locally and Supabase configured, try RPC or query
      if (!found && isSupabaseConfigured) {
        const guestTokens = storage.getGuestSupportTokens();
        const token = guestTokens[clean] || '';

        if (token) {
          const { data, error } = await supabase.rpc('get_guest_support_request', {
            p_reference_id: clean,
            p_access_token: token,
          });
          if (!error && data) {
            found = data as SupportRequest;
          }
        } else {
          // If no token stored locally, call get_guest_support_request with email or authenticated session
          const { data, error } = await supabase.rpc('get_guest_support_request', {
            p_reference_id: clean,
            p_access_token: null,
            p_email: email ? email.trim().toLowerCase() : null,
          });

          if (!error && data) {
            found = data as SupportRequest;
          }
        }
      }

      if (found) {
        setManualLookupResult(found);
        // Also add to myRequests list if not present
        setMyRequests((prev) => {
          if (prev.some((r) => r.reference_id.toUpperCase() === clean)) return prev;
          return [found!, ...prev];
        });
      } else {
        setLookupError(`No support request found with reference ID "${clean}". Please verify the code.`);
      }
    } catch (err: any) {
      setLookupError(err?.message || 'Failed to search for request. Please check your reference code.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Calculate unread replies
  const unreadCount = useMemo(() => {
    return myRequests.filter((r) => {
      const hasReply = r.status === 'replied' || (r.admin_reply && r.admin_reply.trim().length > 0);
      return hasReply && !readReplyIds.includes(r.id);
    }).length;
  }, [myRequests, readReplyIds]);

  // Status badge helper
  const getStatusBadge = (status: SupportRequestStatus, hasReply: boolean, isUnread: boolean) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Submitted • Awaiting Review</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>In Review • Under Investigation</span>
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Replied • Admin Response</span>
            {isUnread && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                NEW
              </span>
            )}
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Check className="w-3.5 h-3.5" />
            <span>Closed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            <span>{status}</span>
          </span>
        );
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden box-border">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2 sm:px-8 sm:h-16 w-full max-w-full box-border sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-30 shadow-2xs">
        <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100 shrink-0"
            title={t('common.back')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('common.back')}</span>
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <Logo size="sm" />
            <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 truncate">
              EMufti <span className="text-blue-600">AI</span> Help Center
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-end sm:justify-start gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            to="/features"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 hidden md:inline transition-colors"
          >
            Features Overview
          </Link>
          <Link
            to="/pricing"
            className="text-xs font-semibold text-blue-600 hover:underline hidden sm:inline"
          >
            View Plans
          </Link>
          <Link
            to="/chat"
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs text-center shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:hidden" />
            <span>{t('common.return_to_chat')}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 animate-float-slow" />
            <span>Islamic Research & Student Support Center</span>
          </div>
          <h1 className="text-2xl min-[360px]:text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How can our scholarly team assist you?
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Browse verified documentation, ask questions, or submit a support request. Our team reviews and responds to all inquiries promptly.
          </p>

          {/* Primary Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
            <button
              onClick={() => {
                switchTab('submit');
                setSubmittedResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{t('help.submit_tab', 'Submit a Request')}</span>
            </button>

            <button
              onClick={() => switchTab('faqs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse FAQs & Guides</span>
            </button>

            <button
              onClick={() => switchTab('my_requests')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
                activeTab === 'my_requests'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>{t('help.my_requests', 'My Support Inquiries')}</span>
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {unreadCount} New
                </span>
              ) : myRequests.length > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                  {myRequests.length}
                </span>
              ) : null}
            </button>
          </div>
        </div>


        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: FAQS & GUIDES                                               */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="max-w-xl mx-auto relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help by question, keyword (e.g. Tafsir, Pro, Claim, Account)..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQs Accordion */}
            <div className="space-y-3">
              {filteredFAQs.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 space-y-2 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">No matching articles found</p>
                  <p className="text-xs">
                    Try searching for different keywords or submit a support request directly to our team.
                  </p>
                  <button
                    onClick={() => switchTab('submit')}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Submit Support Request
                  </button>
                </div>
              ) : (
                filteredFAQs.map((faq) => {
                  const isOpen = expandedId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all shadow-sm"
                    >
                      <button
                        onClick={() => toggleExpand(faq.id)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                            {faq.category}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="text-slate-400 flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-5 sm:px-5 text-xs text-slate-700 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: SUBMIT SUPPORT REQUEST                                      */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'submit' && (
          <div className="space-y-6">
            {submittedResult ? (
              /* Confirmation Display After Successful Submission */
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blue-200 shadow-sm space-y-6 animate-in fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Support Request Sent Successfully
                    </h2>
                    {/* Exact required confirmation message */}
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                      Your support request has been sent successfully. Our support team will review your request and respond as soon as possible, usually within a few hours.
                    </p>
                  </div>
                </div>

                {/* Reference Code Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Your Support Reference Number
                      </span>
                      <span className="text-lg sm:text-2xl font-mono font-extrabold text-blue-600 tracking-wider">
                        {submittedResult.referenceId}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyReference(submittedResult.referenceId)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                    <strong className="text-slate-900">How to check your response:</strong> You can view updates and scholarly replies directly in the <strong className="text-blue-600 font-semibold">“My Support Requests”</strong> section of this Help Center at any time. For guest submissions on this device, your ticket is securely remembered automatically.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap pt-2">
                  <button
                    onClick={() => switchTab('my_requests')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Inbox className="w-4 h-4" />
                    <span>View My Support Requests</span>
                  </button>

                  <button
                    onClick={() => {
                      setSubmittedResult(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              /* Support Request Form */
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                    <LifeBuoy className="w-4 h-4" />
                    <span>Direct Scholarly & Technical Help</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Submit a Support Request
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Please provide detailed information about your inquiry. Our support team will review and reply within a few hours.
                  </p>
                </div>

                {/* Auth indicator */}
                {user ? (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2.5">
                    <User className="w-4 h-4 flex-shrink-0 text-blue-600" />
                    <span>
                      Signed in as <strong className="font-semibold text-slate-900">{user.email}</strong>. This request will be linked to your account.
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span>
                      Submitting as a guest. You will receive a unique tracking reference code to check our reply in the Help Center.
                    </span>
                  </div>
                )}

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Account Lockout Notice */}
                {(category === 'account_access' || searchParams.get('reason') === 'lockout') && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Account Security Lockout Recovery</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If your account was temporarily locked after multiple unsuccessful password attempts, submit this recovery request. Our verified support team will inspect your credentials and reset your security lockout promptly.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {/* Grid: Full Name & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('auth.full_name')} <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: undefined }));
                        }}
                        placeholder="e.g. Ahmed Mohamed"
                        disabled={isSubmitting}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                          formErrors.fullName ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-[11px] text-rose-500 font-medium">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('auth.email')} <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="e.g. ahmed@example.com"
                        disabled={isSubmitting}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                          formErrors.email ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-rose-500 font-medium">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Grid: Phone Number & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('auth.phone')} <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="e.g. +252 61 1234567"
                        disabled={isSubmitting}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                          formErrors.phone ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] text-rose-500 font-medium">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Inquiry Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('help.category')} <span className="text-rose-500">*</span></span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const newCat = e.target.value as SupportCategoryKey;
                          setCategory(newCat);
                          const matching = SUPPORT_CATEGORIES.find((c) => c.key === newCat);
                          if (matching) {
                            setSubject(matching.defaultSubject);
                          }
                        }}
                        disabled={isSubmitting}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
                      >
                        {SUPPORT_CATEGORIES.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Problem / Description Multiline Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('help.message')} <span className="text-rose-500">*</span></span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {description.trim().length} characters
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: undefined }));
                      }}
                      placeholder="Please explain the issue or question in detail. Mention any error messages, surah names, or relevant context..."
                      disabled={isSubmitting}
                      className={`w-full p-3.5 rounded-xl bg-white border text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 leading-relaxed transition-colors ${
                        formErrors.description ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-[11px] text-rose-500 font-medium">{formErrors.description}</p>
                    )}
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => {
                          setIsConfirmed(e.target.checked);
                          if (formErrors.confirmation) setFormErrors((prev) => ({ ...prev, confirmation: undefined }));
                        }}
                        className="w-4 h-4 text-blue-600 rounded mt-0.5 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 font-medium leading-relaxed">
                        I confirm that this account belongs to me and that the information provided is accurate.
                      </span>
                    </label>
                    {formErrors.confirmation && (
                      <p className="text-[11px] text-rose-500 font-medium">{formErrors.confirmation}</p>
                    )}
                  </div>

                  {/* Submit Button & In-flight Protection */}
                  <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-[11px] text-slate-500">
                      All inquiries are treated with strict confidentiality under our privacy guidelines.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{t('help.submit_btn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quick FAQ Reference below the form so answers are immediately accessible on initial page load */}
            {!submittedResult && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Frequently Asked Questions (Instant Answers)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchTab('faqs')}
                    className="text-xs font-semibold text-blue-600 hover:underline text-left cursor-pointer"
                  >
                    Browse All {FAQ_DATA.length} Full Guides & FAQs →
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Before submitting, check these quick answers to common questions about accounts, subscriptions, and verified Islamic inquiries:
                </p>

                <div className="space-y-2 pt-1">
                  {FAQ_DATA.slice(0, 5).map((faq) => {
                    const isOpen = expandedId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-border/80 overflow-hidden bg-muted/20 hover:border-border transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpand(faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {faq.question}
                          </span>
                          <span className="text-muted-foreground shrink-0">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 sm:px-5 text-xs text-foreground/90 whitespace-pre-line leading-relaxed border-t border-border/50 pt-3 bg-muted/10">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: MY SUPPORT REQUESTS                                         */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'my_requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  My Support Requests
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  View past requests, review official admin replies, and track resolution status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadMyRequests()}
                  disabled={isLoadingRequests}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 text-slate-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => switchTab('submit')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>New Request</span>
                </button>
              </div>
            </div>

            {/* Quick Guest Reference Code Lookup */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <form onSubmit={handleManualLookup} className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="Find ticket by Reference Code (e.g. SR-EMUFTI-XXXXXX)..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase font-mono placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLookingUp || !lookupCode.trim()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                >
                  {isLookingUp ? 'Searching...' : 'Search Ticket'}
                </button>
              </form>

              {lookupError && (
                <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{lookupError}</span>
                </p>
              )}
            </div>

            {/* Requests List */}
            {isLoadingRequests ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-500">Loading your support requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No support requests found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You have not submitted any support inquiries yet. Whenever you submit a request, you can monitor its progress and view official admin responses right here.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => switchTab('submit')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Submit Your First Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((req) => {
                  const hasReply = !!(req.admin_reply && req.admin_reply.trim().length > 0);
                  const isUnread = hasReply && !readReplyIds.includes(req.id);

                  return (
                    <div
                      key={req.id}
                      onClick={() => {
                        if (hasReply) markReplyAsRead(req.id);
                      }}
                      className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all shadow-sm space-y-4 ${
                        isUnread
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Header: Reference & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {req.reference_id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyReference(req.reference_id);
                            }}
                            title="Copy Reference Code"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-semibold text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-500">
                            {req.subject || 'General Support'}
                          </span>
                        </div>

                        <div>
                          {getStatusBadge(req.status, hasReply, isUnread)}
                        </div>
                      </div>

                      {/* Submitter Problem / Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Problem Description</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Submitted: {formatTimestamp(req.created_at)}</span>
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          {req.description}
                        </div>
                      </div>

                      {/* Official Admin Reply (When present) */}
                      {hasReply ? (
                        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-slate-900">
                                EMufti Support Team
                              </span>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-[10px] font-bold text-blue-800">
                                <CheckCircle2 className="w-3 h-3 text-blue-600 stroke-[2.5]" aria-hidden="true" />
                                <span>Verified Support Team</span>
                              </div>
                            </div>

                            {req.replied_at && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(req.replied_at)}</span>
                              </span>
                            )}
                          </div>

                          <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed pl-8">
                            {req.admin_reply}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 flex items-center gap-2 pl-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Our support team is reviewing your ticket. Replies appear here immediately.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quick Links Grid */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/track"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition-all group space-y-1.5"
          >
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <Search className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Track & Claim Offer</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Enter your tracking code to verify approval and activate Pro or Premium.
            </p>
          </Link>

          <Link
            to="/quran?tab=subcis"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition-all group space-y-1.5"
          >
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <Mic className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Subcis Recitation</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive alternating Quran recitation with verified Qurra and error analysis.
            </p>
          </Link>

          <Link
            to="/features"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition-all group space-y-1.5"
          >
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Features Directory</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Review full platform capabilities and verified scholarly tools.
            </p>
          </Link>
        </div>
      </main>

      {/* Comprehensive Global Footer */}
      <Footer />
    </div>
  );
};

export default HelpCenterPage;
