import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  Headphones,
  Compass,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  HelpCircle,
  Check,
  Layers,
  Settings,
  Sliders,
  Volume2,
  EyeOff,
} from 'lucide-react';

export interface OnboardingTourStep {
  id: string;
  targetSelector: string;
  fallbackSelector?: string;
  badge: {
    en: string;
    so: string;
    ar: string;
  };
  title: {
    en: string;
    so: string;
    ar: string;
  };
  description: {
    en: string;
    so: string;
    ar: string;
  };
}

export const QURAN_ONBOARDING_TOUR_STEPS: OnboardingTourStep[] = [
  {
    id: 'brand-header',
    targetSelector: '[data-tour="brand-header"]',
    fallbackSelector: 'header .flex.items-center.gap-3',
    badge: {
      en: 'STEP 1 OF 10',
      so: 'TALLAABADA 1 EE 10',
      ar: 'الخطوة ١ من ١٠',
    },
    title: {
      en: 'EMufti AI Quran Center',
      so: 'EMufti AI Xarunta Qur\'aanka',
      ar: 'مركز القرآن الكريم في EMufti AI',
    },
    description: {
      en: 'Welcome to EMufti AI Quran Center. Access the complete digital Holy Quran, verified audio recitations, Somali scholar translations, and AI-powered Islamic assistance.',
      so: 'Ku soo dhawoow Xarunta Qur\'aanka ee EMufti AI. Ka hel dhammaan 114-ka suuradood, codadka quraanka ee saxda ah, tafsiirrada culumada Soomaaliyeed, iyo caawiyaha diiniga ah ee AI.',
      ar: 'مرحباً بكم في مركز القرآن الكريم في EMufti AI. تصفح المصحف الشريف بالكامل، واستمع لتلاوات خاشعة، واطلع على التفاسير الموثوقة.',
    },
  },
  {
    id: 'surah-selector',
    targetSelector: '[data-tour="surah-selector"]',
    fallbackSelector: '[data-tutorial="surah-selector"]',
    badge: {
      en: 'STEP 2 OF 10',
      so: 'TALLAABADA 2 EE 10',
      ar: 'الخطوة ٢ من ١٠',
    },
    title: {
      en: 'Surah & Ayah Navigation',
      so: 'Doorashada Suuradda & Aayadaha',
      ar: 'اختيار السورة والتنقل بين الآيات',
    },
    description: {
      en: 'How to select a Surah and navigate between Ayahs: Quickly switch between all 114 Surahs or search instantly by name, number, or translation to jump directly to any verse.',
      so: 'Sida loo doorto suurad loona dhex maro aayadaha: Si degdeg ah u kala dooro dhammaan 114-ka suuradood ama ku raadi magaca, lambarka, ama aayadda aad rabto.',
      ar: 'كيفية اختيار السورة والتنقل بين الآيات: انتقل بسرعة بين سور القرآن الـ 114 أو ابحث بالاسم والرقم للانتقال لأي آية مباشرة.',
    },
  },
  {
    id: 'view-toggle',
    targetSelector: '[data-tour="view-toggle"]',
    fallbackSelector: '.sticky .bg-slate-100',
    badge: {
      en: 'STEP 3 OF 10',
      so: 'TALLAABADA 3 EE 10',
      ar: 'الخطوة ٣ من ١٠',
    },
    title: {
      en: 'Verse by Verse vs Reading Mode',
      so: 'Aayad-Aayad & Akhriska Mushafka',
      ar: 'وضع الآية بآية وقراءة المصحف',
    },
    description: {
      en: 'How to switch reading views: Toggle effortlessly between Verse-by-Verse study mode with Somali translations and continuous traditional Madinah Mushaf reading flow.',
      so: 'Sida loo beddelo habka akhriska: Si fudud ugu kala beddel qaabka aayad-aayad ee sharraxaadda leh iyo akhriska tooska ah ee bog-bog ee Mushafka Madiina.',
      ar: 'التبديل بين أوضاع القراءة: تنقل بسلاسة بين وضع الآية بآية مع الترجمات، وقراءة المصحف الشريف بصفحاته المعتمدة.',
    },
  },
  {
    id: 'quran-search',
    targetSelector: '[data-tour="quran-search"]',
    fallbackSelector: 'input[placeholder*="Search the Quran"]',
    badge: {
      en: 'STEP 4 OF 10',
      so: 'TALLAABADA 4 EE 10',
      ar: 'الخطوة ٤ من ١٠',
    },
    title: {
      en: 'Quran Explorer & Smart Search',
      so: 'Raadinta Quraanka & Suuradaha',
      ar: 'محرك بحث القرآن الكريم',
    },
    description: {
      en: 'Instant search across all surahs and verses: Search the entire Holy Quran by Surah name, Ayah number (e.g. 2:255), keywords, or topics with voice search support.',
      so: 'Raadinta degdegga ah ee suuradaha iyo aayadaha: Ku raadi qoraal ama cod adigoo gelinaya magaca suuradda, lambarka aayadda, ama erayo muhiim ah.',
      ar: 'البحث الفوري في السور والآيات: ابحث في كامل المصحف الشريف باسم السورة، رقم الآية، أو بالكلمات والموضوعات مع ميزة البحث الصوتي.',
    },
  },
  {
    id: 'continue-reading',
    targetSelector: '[data-tour="continue-reading"]',
    fallbackSelector: '[data-tour="continue-reading"], [data-testid="continue-reading-card"]',
    badge: {
      en: 'STEP 5 OF 10',
      so: 'TALLAABADA 5 EE 10',
      ar: 'الخطوة ٥ من ١٠',
    },
    title: {
      en: 'Continue Reading / My Quran',
      so: 'Sii Wad Akhriska / Quraankayga',
      ar: 'متابعة القراءة / قرآني',
    },
    description: {
      en: 'Quick resume of last read position: Pick up right where you left off with one tap, showing your last recited Surah, Ayah number, and Mushaf page.',
      so: 'Sida degdegga ah ee dib loogu bilaabo akhriska: Hal gujin ku billow meeshii kuugu dambaysay, adigoo arkaya suuradda, aayadda, iyo boga aad mareysay.',
      ar: 'استئناف القراءة من آخر موضع: واصل قراءتك بضغطة زر واحدة من حيث توقفت، مع إظهار السورة والآية ورقم الصفحة بدقة.',
    },
  },
  {
    id: 'surah-actions',
    targetSelector: '[data-tour="surah-actions"]',
    fallbackSelector: 'button[aria-label*="Listen"], [data-tour="surah-actions"] button, [data-testid="surah-listen-button"]',
    badge: {
      en: 'STEP 6 OF 10',
      so: 'TALLAABADA 6 EE 10',
      ar: 'الخطوة ٦ من ١٠',
    },
    title: {
      en: 'Listen & Surah Revelation Info',
      so: 'Dhageyso & Xogta Suuradda',
      ar: 'الاستماع ومعلومات السورة',
    },
    description: {
      en: 'Audio recitation and Surah details: Play the complete Surah audio seamlessly with your chosen reciter, and tap "Info" to read revelation background, themes, and virtues.',
      so: 'Dhageysiga codka iyo xogta suuradda: Dhageyso suuradda oo dhan adigoo isticmaalaya qaariga aad jeceshahay, gujina "Info" si aad u barato taariikhda iyo dulucda suuradda.',
      ar: 'تلاوة السورة ومعلومات النزول: استمع لتلاوة السورة كاملة بصوت القارئ المفضل، واضغط "معلومات" لمعرفة أسباب النزول ومقاصد السورة.',
    },
  },
  {
    id: 'verse-actions',
    targetSelector: '[data-tour="verse-actions"]',
    fallbackSelector: 'button[title*="Weydii EMufti"], [data-tour="verse-actions"] button, [data-testid="ask-emufti-verse-button"]',
    badge: {
      en: 'STEP 7 OF 10',
      so: 'TALLAABADA 7 EE 10',
      ar: 'الخطوة ٧ من ١٠',
    },
    title: {
      en: 'Verse Study Tools & Weydii EMufti',
      so: 'Qalabka Aayadda & Weydii EMufti',
      ar: 'أدوات تدبر الآية واسأل EMufti',
    },
    description: {
      en: 'Accessing study tools and AI answers: View authentic Somali Tafsiir (Sheikh Mustafe, Sh. Cumar Faaruuq), audio lessons, reflections, and ask EMufti AI any question about any verse.',
      so: 'Qalabka barashada iyo su\'aalaha AI-da: Eeg tafsiirka culumada Soomaaliyeed, casharro maqal ah, oo weydii EMufti AI su\'aal kasta oo ku saabsan aayaddan.',
      ar: 'أدوات دراسة وتدبر الآية: اطلع على التفاسير والدروس الصوتية، واسأل الذكاء الاصطناعي EMufti AI عن معاني وأحكام هذه الآية مباشرة.',
    },
  },
  {
    id: 'audio-player',
    targetSelector: '[data-tour="audio-player"]',
    fallbackSelector: '[data-tour="reciter-selector"]',
    badge: {
      en: 'STEP 8 OF 10',
      so: 'TALLAABADA 8 EE 10',
      ar: 'الخطوة ٨ من ١٠',
    },
    title: {
      en: 'Reciter Selector & Audio Controls',
      so: 'Dooro Qaari & Qalabka Codka',
      ar: 'اختيار القارئ والتحكم بالصوت',
    },
    description: {
      en: 'Switching Qaris and managing audio: Select from 50+ master Qurra (including Sh. Cabdirashiid Cali Suufi, Al-Husary, Alafasy), change speed, and loop verses for memorization.',
      so: 'Xulashada qaariga iyo maamulka codka: Dooro in ka badan 50 qaari oo caan ah (sida Sh. Cabdirashiid Cali Suufi iyo Xusari), kordhi ama yaree xawaaraha codka.',
      ar: 'تغيير القراء والتحكم في الصوت: اختر من بين أكثر من 50 قارئاً معتمداً، وتحكم بسرعة التلاوة، وكرر الآيات لتسهيل الحفظ.',
    },
  },
  {
    id: 'theme-switcher',
    targetSelector: '[data-tour="theme-switcher"]',
    fallbackSelector: 'button[title*="Reading Settings"]',
    badge: {
      en: 'STEP 9 OF 10',
      so: 'TALLAABADA 9 EE 10',
      ar: 'الخطوة ٩ من ١٠',
    },
    title: {
      en: 'Theme Switcher & Reading Settings',
      so: 'Doorashada Muuqaalka (Settings)',
      ar: 'مظهر المصحف وإعدادات القراءة',
    },
    description: {
      en: 'Appearance and typography customization: Switch between Light (White), Sepia (Ivory), and Night Dark reading themes, and adjust Arabic font sizes for optimal comfort.',
      so: 'Muuqaalka iyo cabbirka farta: Dooro habka Caddaan, Sepia (huruud diirran), ama Madow, adigoo cabbirka farta Carabiga ku habeynaya sida aad jeceshahay.',
      ar: 'تخصيص المظهر والخط: اختر بين مظهر القراءة الأبيض، أو الورقي (Sepia)، أو الليلي الداكن، مع إمكانية تكبير وتصغير الخط العربي.',
    },
  },
  {
    id: 'bottom-nav',
    targetSelector: '[data-tour="bottom-nav"]',
    fallbackSelector: 'nav[aria-label="Mobile Navigation"]',
    badge: {
      en: 'STEP 10 OF 10',
      so: 'TALLAABADA 10 EE 10',
      ar: 'الخطوة ١٠ من ١٠',
    },
    title: {
      en: 'Bottom Navigation & App Sections',
      so: 'Dhex-marida Qaybaha Hoose',
      ar: 'شريط التنقل السفلي',
    },
    description: {
      en: 'Switching between Chat, Quran, and Saved bookmarks: Easily navigate between Home, AI Chat, Quran Center, your saved Bookmarks, Tasbeeh counter, and Profile settings.',
      so: 'U kala gudubka qaybaha barnaamijka: Si fudud ugu kala gudub Hoyga, Wadahadalka AI, Qur\'aanka, Calaamadaha kuu keydsan, iyo Tasbiixa.',
      ar: 'التنقل السلس بين أقسام التطبيق: انتقل بسهولة بين الصفحة الرئيسية، محادثة الذكاء الاصطناعي، مركز القرآن، المحفوظات، والسبحة الرقمية.',
    },
  },
];

// Backward-compatible step definitions and aliases for existing tests
export type TutorialTab =
  | 'quran'
  | 'macallin'
  | '50qaris'
  | 'subcis'
  | 'tafsir'
  | 'planner'
  | 'finder'
  | 'duas'
  | 'tasbeeh'
  | 'bookmarks';

export interface TutorialStepItem {
  id: string;
  targetSelector: string;
  targetTab?: TutorialTab;
  icon: React.ElementType;
  titleSo: string;
  titleEn: string;
  titleAr: string;
  descSo: string;
  descEn: string;
  descAr: string;
  hintSo?: string;
  hintEn?: string;
}

export const QURAN_TUTORIAL_STEPS: TutorialStepItem[] = [
  {
    id: 'quran-reading',
    targetSelector: '[data-tour="brand-header"]',
    targetTab: 'quran',
    icon: BookOpen,
    titleSo: "1. Akhriska Qur'aanka (Quran Reading)",
    titleEn: '1. Quran Reading (Mushaf)',
    titleAr: '١. قراءة القرآن الكريم',
    descSo:
      "Sida loo furo oo loo akhriyo Qur'aanka Kariimka: Halkaan waxaad ka akhrisan kartaa dhammaan 114-ka Suuradood oo leh qoraalka saxda ah ee Cusmaaniyiinta, tarjumaadda af-Soomaaliga iyo Ingiriiska, iyo akhriska aayad-aayad.",
    descEn:
      'How to open and read the Holy Quran: Read all 114 canonical Surahs of the Holy Quran with authentic Uthmani script, Somali and English translations, and verse-by-verse recitation.',
    descAr:
      'طريقة فتح وقراءة القرآن الكريم: اقرأ جميع سور القرآن الـ 114 بالرسم العثماني الموثق مع الترجمة والتلاوة الصوتية لكل آية.',
    hintSo: 'Guji si aad u furto oo u akhrisato aayadaha suuradda aad rabto.',
    hintEn: 'Click to open and read verses of your chosen Surah.',
  },
  {
    id: 'surah-selector',
    targetSelector: '[data-tour="surah-selector"]',
    targetTab: 'quran',
    icon: Search,
    titleSo: '2. Doorashada Suuradda (Surah Selection)',
    titleEn: '2. Surah & Ayah Navigation',
    titleAr: '٢. اختيار السورة والتنقل بين الآيات',
    descSo:
      'Sida loo doorto suurad loona dhex maro aayadaha: Isticmaal liiskan degdegga ah ama raadinta si aad toos ugu tagto suuradda aad rabto (1 ilaa 114) oo aad ugu dhex socoto aayadaha.',
    descEn:
      'How to select a Surah and navigate between Ayahs: Quickly switch between all 114 Surahs or search instantly by name, number, or translation to jump directly to any verse.',
    descAr:
      'طريقة اختيار السورة والتنقل بين الآيات: ابحث بسهولة بالاسم أو الرقم وتنقل بسلاسة بين الآيات.',
    hintSo: 'Tusaale: qor "Al-Baqarah" ama "2" si aad toos ugu tagto.',
    hintEn: 'Type "Baqarah" or "2" to jump directly.',
  },
  {
    id: 'qaari-catalog',
    targetSelector: '[data-tour="audio-player"]',
    targetTab: '50qaris',
    icon: Headphones,
    titleSo: '3. Xulashada Qaariga (Qaari & Audio Playback)',
    titleEn: '3. Qaari Reciter & Audio Playback',
    titleAr: '٣. اختيار القارئ والتلاوة الصوتية',
    descSo:
      "Sida loo doorto Qaari loona dhageysto codadka Qur'aanka: Ka dooro in ka badan 50 qari oo caan ah oo ay ku jiraan Sh. Cabdirashiid Cali Suufi, Minshaawi, iyo Xusari.",
    descEn:
      'How to choose a reciter and play Quran audio: Select from 50+ verified master reciters including Sheikh Abdul Rashid Ali Sufi, Al-Minshawi, and Al-Husary across all 114 Surahs.',
    descAr:
      'طريقة اختيار القارئ وتشغيل الصوت: اختر من بين أكثر من 50 قارئاً معتمداً واستمع لتلاوات نقية.',
    hintSo: 'Waxaad kala dooran kartaa qaari kasta iyo suurad kasta.',
    hintEn: 'Select any reciter and play continuously.',
  },
  {
    id: 'subcis-practice',
    targetSelector: '[data-tour="view-toggle"]',
    targetTab: 'subcis',
    icon: Compass,
    titleSo: '4. Subcis (Alternating Recitation)',
    titleEn: '4. Subcis Alternating Recitation',
    titleAr: '٤. تكرار السرد والمدارسة',
    descSo: 'Sida loo barto Subciska: Dhageyso qaariga, akhri aayadaha ku xiga, kuna horumari akhriskaaga.',
    descEn: 'Master your recitation by alternating verses turn-by-turn with world-renowned Qurra.',
    descAr: 'تدرب على الحفظ بالتناوب آية بآية مع كبار القراء.',
  },
  {
    id: 'macallin-teacher',
    targetSelector: '[data-tour="verse-actions"]',
    targetTab: 'macallin',
    icon: Sparkles,
    titleSo: "5. Macallin Qur'aan (Recitation Verification)",
    titleEn: '5. Macallin AI Teacher Verification',
    titleAr: '٥. المعلم التفاعلي للقرآن',
    descSo: 'Sida AI-du kuugu saxdo akhriskaaga: Codkaaga duub, AI-duna waxay ku siinaysaa saxid aayadeed.',
    descEn: 'Recite verses into your microphone to receive word-by-word error detection and feedback.',
    descAr: 'سجل تلاوتك وتعرف على الأخطاء التجويدية فورياً بمساعدة الذكاء الاصطناعي.',
  },
  {
    id: 'macallin-hifd',
    targetSelector: '[data-tutorial="macallin-hifd"]',
    targetTab: 'macallin',
    icon: EyeOff,
    titleSo: '6. Habka Xifdinta (Hifd Mode)',
    titleEn: '6. Memorization & Hifd Mode',
    titleAr: '٦. وضع الحفظ والتسميع',
    descSo: 'Habka qarinta aayadaha: Qari qoraalka aayadda si aad xusuustaada uga akhriso.',
    descEn: 'Hides verse text automatically so you can test your memory and recitation accuracy.',
    descAr: 'إخفاء نص الآيات لاختبار حفظك عن ظهر قلب مع التحقق الفوري.',
  },
  {
    id: 'tafsir-library',
    targetSelector: '[data-tour="verse-actions"]',
    targetTab: 'tafsir',
    icon: BookOpen,
    titleSo: '7. Maktabadda Tafsiirka (15 Juz Tafsir Library)',
    titleEn: '7. 15-Juz Somali Tafsir Library',
    titleAr: '٧. مكتبة التفسير الصومالية',
    descSo: 'Dhageyso tafsiirka culumada Soomaaliyeed ee caanka ah sida Sh. Mustafe iyo Sh. Cumar Faaruuq.',
    descEn: 'Stream authentic Somali audio Tafsiir by esteemed scholars across the Holy Quran.',
    descAr: 'استمع إلى دروس التفسير الصومالية الموثوقة لكبار العلماء.',
  },
  {
    id: 'progress-finder',
    targetSelector: '[data-tour="continue-reading"]',
    targetTab: 'finder',
    icon: Compass,
    titleSo: '8. Helitaanka Meeshaada (Quran Progress Finder)',
    titleEn: '8. Quran Progress Finder',
    titleAr: '٨. محدد التقدم والموضع',
    descSo: 'U hel meeshaada akhriska si fudud adigoo isticmaalaya bogga, juska, ama xisbiga.',
    descEn: 'Calculate and track your Quran completion milestones across Pages, Juz, and Hizb.',
    descAr: 'احسب وتتبع تقدمك في الختمة عبر الأجزاء والأحزاب والصفحات.',
  },
  {
    id: 'duas-tasbeeh',
    targetSelector: '[data-tour="bottom-nav"]',
    targetTab: 'duas',
    icon: Bookmark,
    titleSo: '9. Ducooyinka & Tasbiixa (Duas & Digital Tasbeeh)',
    titleEn: '9. Duas Catalog & Tactile Tasbeeh',
    titleAr: '٩. حصن المسلم والسبحة الإلكترونية',
    descSo: 'Akhriso ducooyinka saxiixa ah oo isticmaal tasbiixa elektaroonigga ah.',
    descEn: 'Access authentic supplications from Hisn al-Muslim and a digital Tasbeeh counter.',
    descAr: 'تصفح الأدعية الصحيحة من حصن المسلم وسبّح بعداد إلكتروني تفاعلي.',
  },
  {
    id: 'bookmarks-save',
    targetSelector: '[data-tour="bottom-nav"]',
    targetTab: 'bookmarks',
    icon: Bookmark,
    titleSo: '10. Calaamadaha & Keydsanayaasha (Save & Bookmarks)',
    titleEn: '10. Saved Bookmarks & History',
    titleAr: '١٠. العلامات المرجعية والمحفوظات',
    descSo: 'Meeshii kuugu dambeysay ee aad akhrisay iyo aayadaha aad calaamadeysatay.',
    descEn: 'Access your bookmarked verses, reading history, and saved lesson recitations.',
    descAr: 'علاماتك المرجعية وآخر موضع قرأته وتسجيلاتك محفوظة هنا للوصول السريع.',
  },
];

interface QuranPageTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  uiLanguage?: 'en' | 'so' | 'ar';
  onSelectTab?: (tab: TutorialTab) => void;
  activeTab?: TutorialTab;
}

/**
 * Safely executes document.querySelector without throwing SyntaxError on invalid/unsupported selectors
 */
export function safeQuerySelector(selector?: string | null): HTMLElement | null {
  if (!selector || typeof selector !== 'string' || typeof document === 'undefined') return null;
  try {
    return document.querySelector(selector) as HTMLElement | null;
  } catch {
    return null;
  }
}

/**
 * Cross-browser, robust target element resolver for Quran tour steps.
 * 1. Queries standard CSS targetSelector safely.
 * 2. Queries standard CSS fallbackSelector safely.
 * 3. Uses pure JavaScript DOM traversal to inspect textContent and accessible attributes
 *    without relying on invalid/jQuery pseudo-selectors like :contains().
 */
export function resolveTourTargetElement(step: OnboardingTourStep): HTMLElement | null {
  if (!step || typeof document === 'undefined') return null;

  // 1. Primary targetSelector query
  let el = safeQuerySelector(step.targetSelector);
  if (el) return el;

  // 2. Fallback selector query
  if (step.fallbackSelector) {
    el = safeQuerySelector(step.fallbackSelector);
    if (el) return el;
  }

  // 3. Robust JavaScript DOM traversal fallback
  if (step.id === 'surah-actions') {
    const buttons = Array.from(document.querySelectorAll('button'));
    const listenBtn = buttons.find((btn) => {
      const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
      const title = (btn.getAttribute('title') || '').toLowerCase();
      const text = btn.textContent || '';
      return (
        aria.includes('listen') ||
        title.includes('listen') ||
        text.includes('Listen') ||
        btn.getAttribute('data-testid') === 'surah-listen-button' ||
        btn.getAttribute('data-tour') === 'surah-listen-button'
      );
    });
    if (listenBtn) return listenBtn as HTMLElement;
  }

  if (step.id === 'continue-reading') {
    const divs = Array.from(document.querySelectorAll('div'));
    const card = divs.find((d) => {
      const text = d.textContent || '';
      return (
        d.getAttribute('data-tour') === 'continue-reading' ||
        d.getAttribute('data-testid') === 'continue-reading-card' ||
        (text.includes('Continue Reading') && d.classList.contains('p-4'))
      );
    });
    if (card) return card as HTMLElement;
  }

  if (step.id === 'verse-actions') {
    const buttons = Array.from(document.querySelectorAll('button'));
    const askBtn = buttons.find((btn) => {
      const text = btn.textContent || '';
      const title = btn.getAttribute('title') || '';
      return (
        text.includes('Weydii EMufti') ||
        title.includes('Weydii EMufti') ||
        btn.getAttribute('data-testid') === 'ask-emufti-verse-button'
      );
    });
    if (askBtn) return askBtn as HTMLElement;
  }

  return null;
}

export const QuranPageTutorial: React.FC<QuranPageTutorialProps> = ({
  isOpen,
  onClose,
  uiLanguage = 'en',
  onSelectTab,
  activeTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Reset to first step whenever tour opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const step = QURAN_ONBOARDING_TOUR_STEPS[currentStepIndex];

  // Helper to persist tour completion
  const handleFinish = useCallback(() => {
    try {
      localStorage.setItem('hasCompletedTour', 'true');
      localStorage.setItem('emufti_quran_tutorial_completed', 'true');
      localStorage.setItem('emufti_quran_barbaraa_completed', 'true');
    } catch {}
    onClose();
  }, [onClose]);

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem('hasCompletedTour', 'true');
      localStorage.setItem('emufti_quran_tutorial_completed', 'true');
      localStorage.setItem('emufti_quran_barbaraa_completed', 'true');
    } catch {}
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < QURAN_ONBOARDING_TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStepIndex, handleFinish]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  // Locate and scroll to active target element
  useEffect(() => {
    if (!isOpen || !step) return;

    const updateRect = () => {
      const el = resolveTourTargetElement(step);

      if (el) {
        const r = el.getBoundingClientRect();
        setTargetRect(r);
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } catch {}
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer1 = setTimeout(updateRect, 120);
    const timer2 = setTimeout(updateRect, 300);

    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, currentStepIndex, step]);

  if (!isOpen || !step) return null;

  const isLastStep = currentStepIndex === QURAN_ONBOARDING_TOUR_STEPS.length - 1;
  const langKey = uiLanguage === 'so' ? 'so' : uiLanguage === 'ar' ? 'ar' : 'en';

  const badgeText = step.badge[langKey] || step.badge.en;
  const titleText = step.title[langKey] || step.title.en;
  const descText = step.description[langKey] || step.description.en;

  const skipLabel = uiLanguage === 'so' ? 'Ka bood' : uiLanguage === 'ar' ? 'تخطي' : 'Skip';
  const prevLabel = uiLanguage === 'so' ? '< Hore' : uiLanguage === 'ar' ? '< السابق' : 'Prev';
  const nextLabel = isLastStep
    ? uiLanguage === 'so'
      ? 'Dhammee ✓'
      : uiLanguage === 'ar'
      ? 'إنهاء ✓'
      : 'Finish ✓'
    : uiLanguage === 'so'
    ? 'Xiga >'
    : uiLanguage === 'ar'
    ? 'التالي >'
    : 'Next >';

  // Desktop Card Positioning calculation
  const pad = 8;
  const hasTarget = targetRect && targetRect.width > 0 && targetRect.height > 0;

  let desktopCardStyle: React.CSSProperties = {};
  if (hasTarget && targetRect) {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const placeBelow = spaceBelow > 260;
    const topPos = placeBelow
      ? Math.min(window.innerHeight - 280, targetRect.bottom + 16)
      : Math.max(16, targetRect.top - 260);

    // Clamp horizontal placement within screen boundaries
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const leftPos = Math.max(16, Math.min(targetCenterX - 180, window.innerWidth - 380));

    desktopCardStyle = {
      position: 'fixed',
      top: `${topPos}px`,
      left: `${leftPos}px`,
      zIndex: 60,
    };
  } else {
    desktopCardStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 60,
    };
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-200">
      {/* 1. SPOTLIGHT & BACKDROP OVERLAY: Dim entire screen with dark translucent backdrop while target stays sharply cutout */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto bg-black/70 backdrop-blur-xs z-50"
        style={{ backgroundColor: 'transparent' }}
        onClick={handleNext}
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            {/* White reveals the dark translucent backdrop */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout creates transparent spotlight hole over target */}
            {hasTarget && targetRect && (
              <rect
                x={targetRect.left - pad}
                y={targetRect.top - pad}
                width={targetRect.width + pad * 2}
                height={targetRect.height + pad * 2}
                rx={14}
                ry={14}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* Target Element Glowing Animated Ring: ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] rounded-xl animate-pulse */}
      {hasTarget && targetRect && (
        <>
          <div
            className="fixed pointer-events-none rounded-xl ring-4 ring-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] animate-pulse"
            style={{
              top: `${targetRect.top - pad}px`,
              left: `${targetRect.left - pad}px`,
              width: `${targetRect.width + pad * 2}px`,
              height: `${targetRect.height + pad * 2}px`,
              zIndex: 55,
            }}
          />
          {/* Dual High-Contrast Neon Framing Ring */}
          <div
            className="fixed pointer-events-none rounded-xl border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            style={{
              top: `${targetRect.top - pad - 2}px`,
              left: `${targetRect.left - pad - 2}px`,
              width: `${targetRect.width + (pad + 2) * 2}px`,
              height: `${targetRect.height + (pad + 2) * 2}px`,
              zIndex: 56,
            }}
          />
          {/* Directional Beacon Badge */}
          <div
            className="fixed pointer-events-none z-57 transition-all duration-300 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xl shadow-blue-500/50 ring-2 ring-white/60 animate-bounce"
            style={{
              top: `${Math.max(10, targetRect.top - pad - 30)}px`,
              left: `${Math.max(12, targetRect.left + targetRect.width / 2 - 58)}px`,
            }}
          >
            <Sparkles className="w-3 h-3 text-cyan-200" />
            <span>HAGAAHAN EEG • LOOK HERE</span>
          </div>
        </>
      )}

      {/* 2. FLOATING STEP EXPLANATION CARD (Desktop Floating & Mobile Docked) */}
      {/* Desktop floating near active element */}
      <div
        dir={uiLanguage === 'ar' ? 'rtl' : 'ltr'}
        className="hidden md:block pointer-events-auto"
        style={desktopCardStyle}
      >
        {/* Dynamic Interactive Pointer Arrow (Helper Arrow) */}
        {hasTarget && targetRect && (
          <div
            className={`absolute pointer-events-none z-60 flex items-center justify-center transition-all duration-300 ${
              (window.innerHeight - targetRect.bottom > 260)
                ? '-top-3 left-10 animate-bounce'
                : '-bottom-3 left-10 animate-bounce'
            }`}
          >
            <div
              className={`filter drop-shadow-[0_0_10px_rgba(37,99,235,0.9)] ${
                (window.innerHeight - targetRect.bottom > 260) ? 'rotate-180' : ''
              }`}
            >
              <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                <path d="M12 0L24 14H0L12 0Z" className="fill-blue-500" />
              </svg>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden bg-slate-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl max-w-sm text-white z-50 space-y-4 ring-4 ring-blue-500/10">
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              style={{ width: `${((currentStepIndex + 1) / QURAN_ONBOARDING_TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Header Row: Badge, Step Counter, Bold Title, and Close Button */}
          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-400/30 inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-300 shrink-0" />
                  BARBARAA • {badgeText}
                </span>
                <span className="text-[10px] font-bold text-cyan-200 bg-blue-900/60 px-2 py-0.5 rounded-md border border-blue-700/60 font-mono">
                  {currentStepIndex + 1} / {QURAN_ONBOARDING_TOUR_STEPS.length}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-2 leading-snug">
                {titleText}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Close Tour"
              aria-label="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Body: Clear instructional text */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {descText}
            </p>
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {QURAN_ONBOARDING_TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-blue-500 ring-2 ring-blue-400/40 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                    : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                title={`Go to step ${idx + 1}`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer Actions: Skip (left) and Prev / Next > (right, styled with prominent blue fill) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-2.5 hover:bg-slate-800 rounded-xl"
            >
              {skipLabel}
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{prevLabel}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4.5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>{nextLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card: Centered above bottom navigation bar - WHITE & BLUE THEME */}
      <div
        dir={uiLanguage === 'ar' ? 'rtl' : 'ltr'}
        className="md:hidden fixed bottom-4 left-3 right-3 mx-auto max-w-sm pointer-events-auto z-60"
      >
        <div className="relative overflow-hidden bg-white text-slate-900 border-2 border-blue-600 rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(37,99,235,0.25)] space-y-3 ring-4 ring-blue-500/10">
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              style={{ width: `${((currentStepIndex + 1) / QURAN_ONBOARDING_TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Header Row: Badge, Step Counter, Bold Title, and Close Button */}
          <div className="flex items-start justify-between gap-3 pt-0.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                  {badgeText}
                </span>
                <span className="text-[10px] font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200 font-mono">
                  {currentStepIndex + 1} / {QURAN_ONBOARDING_TOUR_STEPS.length}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1.5 leading-snug">
                {titleText}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Close Tour"
              aria-label="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Body */}
          <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 max-h-28 overflow-y-auto">
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {descText}
            </p>
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 py-0.5">
            {QURAN_ONBOARDING_TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-5 bg-blue-600 ring-1 ring-blue-400/40 shadow-[0_0_6px_rgba(37,99,235,0.6)]'
                    : 'w-1.5 bg-blue-200'
                }`}
                title={`Go to step ${idx + 1}`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1 px-2 hover:bg-slate-100 rounded-lg"
            >
              {skipLabel}
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{prevLabel}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>{nextLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
