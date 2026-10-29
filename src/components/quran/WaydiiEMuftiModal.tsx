import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Scroll,
  HelpCircle,
  X,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  Crown,
  LogIn,
} from 'lucide-react';
import { Surah, Ayah, WaydiiEMuftiStatus } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { quranService } from '../../lib/quranService';

export type WaydiiCategory = 'sababun_nuzuul' | 'tafsiir' | 'faahfaahin' | 'other';

interface WaydiiEMuftiModalProps {
  isOpen: boolean;
  onClose: () => void;
  surah: Surah | null;
  ayah: Ayah | null;
  uiLanguage?: 'en' | 'so' | 'ar';
}

interface CategoryOption {
  id: WaydiiCategory;
  titleSo: string;
  titleEn: string;
  titleAr: string;
  descSo: string;
  descEn: string;
  descAr: string;
  icon: React.ComponentType<{ className?: string }>;
  templateSo: string;
  templateEn: string;
  templateAr: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'sababun_nuzuul',
    titleSo: '1. Sababun Nuzuul',
    titleEn: '1. Asbab al-Nuzul (Occasion of Revelation)',
    titleAr: '١. أسباب النزول',
    descSo: 'Sababta ay aayaddani ku soo degtay iyo duruufihii taariikheed ee la xiriiray.',
    descEn: 'Reported circumstances and historical context of revelation from verified sources.',
    descAr: 'السياق التاريخي وسبب نزول الآية الكريمة من المصادر الموثوقة.',
    icon: Scroll,
    templateSo: 'Fadlan ii sharax sababta ay ku soo degtay aayaddan (Sababun Nuzuul) adigoo soo xiganaya ilo diini ah oo la aamini karo.',
    templateEn: 'Explain the reported circumstances of revelation (Sabab al-Nuzul) of this Ayah and provide reliable sources.',
    templateAr: 'يرجى بيان سبب نزول هذه الآية الكريمة وسياقها التاريخي مع ذكر المصادر المعتمدة.',
  },
  {
    id: 'tafsiir',
    titleSo: '2. Tafsiir',
    titleEn: '2. Scholarly Tafsir & Meaning',
    titleAr: '٢. التفسير المعتمد',
    descSo: 'Macnaha guud ee aayadda iyo fahamka culumada tafsiirka ee la aqoonsan yahay.',
    descEn: 'Scholarly explanation and commentary citing recognized classical & modern books of Tafsir.',
    descAr: 'بيان معاني الآية بالاعتماد على كتب التفسير المعتمدة وعزو الأقوال لأصحابها.',
    icon: BookOpen,
    templateSo: 'Fadlan ii sharax tafsiirka sugan ee aayaddan, macnaha guud, iyo aragtida culumada tafsiirka ee la aqoonsan yahay.',
    templateEn: 'Explain this Ayah using reliable Tafsir sources and identify the scholars or books cited.',
    templateAr: 'يرجى تفسير هذه الآية الكريمة بالاعتماد على أمهات كتب التفسير مع عزو الأقوال إلى أصحابها.',
  },
  {
    id: 'faahfaahin',
    titleSo: '3. Faahfaahin & Duruus',
    titleEn: '3. Detailed Vocabulary & Lessons',
    titleAr: '٣. بيان المفردات والدروس المستفادة',
    descSo: 'Burburinta erayada muhiimka ah, xikmadda aayadda, iyo duruusta nololeed.',
    descEn: 'Detailed linguistic explanation of key words, spiritual wisdom, and practical life lessons.',
    descAr: 'شرح مفصل لمفردات الآية، ودلالاتها اللغوية، والدروس العملية المستفادة منها.',
    icon: Sparkles,
    templateSo: 'Fadlan faahfaahin dheeraad ah iga sii aayaddan: erayada muhiimka ah, macnahooda luqadeed, iyo duruusta laga baran karo.',
    templateEn: 'Give a detailed explanation of this Ayah, including key words, context, and lessons.',
    templateAr: 'يرجى تقديم شرح مفصل لمفردات هذه الآية الكريمة، ولطائفها اللغوية، والدروس العملية المستفادة منها.',
  },
  {
    id: 'other',
    titleSo: "4. Su'aal Kale (Custom)",
    titleEn: '4. Other / Custom Question',
    titleAr: '٤. سؤال آخر مخصص',
    descSo: 'Waydii su’aal gaar ah oo aad adigu leedahay oo ku saabsan aayaddan.',
    descEn: 'Type your own specific Islamic question explicitly tied to this Ayah.',
    descAr: 'اكتب سؤالك الخاص المتعلق بهذه الآية الكريمة مباشرة.',
    icon: MessageSquare,
    templateSo: '',
    templateEn: '',
    templateAr: '',
  },
];

export const WaydiiEMuftiModal: React.FC<WaydiiEMuftiModalProps> = ({
  isOpen,
  onClose,
  surah,
  ayah,
  uiLanguage = 'so',
}) => {
  const navigate = useNavigate();
  const { user, profile, activePlan, isAdmin } = useAuth();
  const effectivePlan = activePlan || profile?.plan || 'free';
  const isPaid = effectivePlan === 'pro' || effectivePlan === 'premium' || isAdmin;

  const [selectedCategory, setSelectedCategory] = useState<WaydiiCategory>('tafsiir');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [usageStatus, setUsageStatus] = useState<WaydiiEMuftiStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch server-enforced usage status on modal open
  // Opening and closing without submission consumes ZERO uses
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingStatus(true);
    setSubmitError(null);

    quranService
      .getWaydiiEMuftiStatus(user?.id, effectivePlan)
      .then((status) => {
        if (isMounted) {
          setUsageStatus(status);
          setIsLoadingStatus(false);
        }
      })
      .catch((err) => {
        console.warn('[WaydiiEMuftiModal] Failed to fetch usage status:', err);
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id, effectivePlan]);

  // Update question template when category changes
  useEffect(() => {
    const cat = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory);
    if (cat && cat.id !== 'other') {
      const template =
        uiLanguage === 'so' ? cat.templateSo : uiLanguage === 'ar' ? cat.templateAr : cat.templateEn;
      setCustomQuestion(template);
    } else if (selectedCategory === 'other') {
      setCustomQuestion('');
    }
  }, [selectedCategory, uiLanguage]);

  if (!isOpen || !surah || !ayah) return null;

  const currentCatObj = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory) || CATEGORY_OPTIONS[1];
  const isFreePlanExhausted = Boolean(usageStatus && !usageStatus.allowed && !isPaid);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (isFreePlanExhausted) {
      setSubmitError(
        "Waxa aad dhammaysatay 2-dii su'aalood ee bilaashka ahaa ee Waydii EMufti. Fadlan u cusboonaysii Pro ama Premium si aad u hesho su'aalo aan xadidnayn."
      );
      return;
    }

    const categoryTitle =
      uiLanguage === 'so'
        ? currentCatObj.titleSo
        : uiLanguage === 'ar'
        ? currentCatObj.titleAr
        : currentCatObj.titleEn;

    const queryText = customQuestion.trim() || currentCatObj.templateEn || currentCatObj.templateSo;

    // Construct precise, citation-grounded prompt carrying Surah and Ayah context
    const fullPrompt =
      `[Surah ${surah.englishName} (${surah.number}:${ayah.numberInSurah}) • ${surah.name}]\n` +
      `Ayah Text: "${ayah.text}"\n` +
      `Category: ${categoryTitle}\n\n` +
      `Inquiry: ${queryText}`;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Record usage atomically on the server before proceeding
      const result = await quranService.recordWaydiiEMuftiUsage(
        surah.number,
        ayah.numberInSurah,
        selectedCategory,
        customQuestion.trim(),
        user.id,
        effectivePlan
      );

      if (!result.allowed) {
        setIsSubmitting(false);
        setSubmitError(
          result.error ||
            "Waxa aad dhammaysatay 2-dii su'aalood ee bilaashka ahaa ee Waydii EMufti. Fadlan u cusboonaysii Pro ama Premium."
        );
        setUsageStatus((prev) =>
          prev ? { ...prev, allowed: false, uses_remaining: 0, uses_consumed: 2 } : null
        );
        return;
      }

      setIsSubmitting(false);
      onClose();

      // Navigate to /chat with the prompt and explicit identifiers
      navigate(
        `/chat?prompt=${encodeURIComponent(fullPrompt)}&surah=${surah.number}&ayah=${ayah.numberInSurah}&cat=${selectedCategory}`
      );
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err?.message || "Khalad ayaa dhacay. Fadlan mar kale isku day.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waydii-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-card border border-border sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between shrink-0 bg-muted/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="waydii-modal-title" className="text-sm sm:text-base font-extrabold text-foreground truncate">
                  Waydii EMufti AI
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Aayadda {ayah.numberInSurah}
                </span>

                {/* Plan Allowance Indicator Badge */}
                {isPaid ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Pro • Su'aalo aan Xadidnayn</span>
                  </span>
                ) : usageStatus ? (
                  usageStatus.allowed ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                      <span>Bilaash: {usageStatus.uses_remaining}/2 ayaa kuu haray</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-500" />
                      <span>Bilaash: 0/2 (Xadkii wuu dhammaaday)</span>
                    </span>
                  )
                ) : null}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Surah {surah.englishName} ({surah.number}) • {surah.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Xir (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Unauthenticated User Warning */}
          {!user && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <LogIn className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-bold text-foreground">Gal koontadaada si aad u isticmaasho Waydii EMufti</h4>
                <p className="text-[11px] text-muted-foreground">
                  Fadlan gal koontadaada ama iska diiwaangeli si aad 2 su'aalood oo bilaash ah u hesho.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/login');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Gal Koontada (Login)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Free Plan Exhausted Upgrade Callout */}
          {isFreePlanExhausted && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-foreground">
                    Waxa aad dhammaysatay 2-dii su'aalood ee bilaashka ahaa ee "Waydii EMufti"
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Qorshaha Bilaashka ah wuxuu leeyahay 2 su'aalood oo keliya. Si aad u hesho su'aalo aan xadidnayn oo aad aayad kasta ugu waydiiso Sababun Nuzuul, Tafsiir, iyo Fiqh, fadlan u cusboonaysii qorshaha Pro ama Premium.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/pricing');
                  }}
                  className="px-4 py-2 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>U cusboonaysii Pro / Premium</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Submission Error Banner */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Selected Quran Ayah Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                Aayadda La Doortay
              </span>
              <span className="font-mono text-[11px]">
                {surah.englishName} {surah.number}:{ayah.numberInSurah}
              </span>
            </div>

            {/* Authentic Uthmani Arabic Script */}
            <div className="text-right py-1">
              <p
                dir="rtl"
                className="font-arabic text-xl sm:text-2xl text-foreground font-normal leading-[2.4] select-text text-right"
              >
                {ayah.text}{' '}
                <span className="font-arabic text-emerald-600 dark:text-emerald-400 font-bold inline-block mx-1">
                  ۝{ayah.numberInSurah}
                </span>
              </p>
            </div>

            {ayah.translation_so && (
              <p className="text-xs text-muted-foreground border-t border-emerald-500/15 pt-2 italic leading-relaxed">
                "{ayah.translation_so}"
              </p>
            )}
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Dooro Nooca Su'aashaada:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const title =
                  uiLanguage === 'so' ? cat.titleSo : uiLanguage === 'ar' ? cat.titleAr : cat.titleEn;
                const desc =
                  uiLanguage === 'so' ? cat.descSo : uiLanguage === 'ar' ? cat.descAr : cat.descEn;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-foreground ring-2 ring-emerald-500/30 shadow-xs'
                        : 'bg-card border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-foreground block leading-tight">
                        {title}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block leading-relaxed line-clamp-2">
                        {desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Inquiry Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="waydii-question-input" className="font-bold text-foreground">
                {selectedCategory === 'other'
                  ? "Qor Su'aashaada Gaarka ah:"
                  : "Dulucda Su'aasha (Waad wax ka beddeli kartaa):"}
              </label>
              <span className="text-[10px] text-muted-foreground">
                Aayadda {ayah.numberInSurah} waa ku lifaaqan tahay
              </span>
            </div>

            <textarea
              id="waydii-question-input"
              rows={3}
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              disabled={isFreePlanExhausted}
              placeholder={
                selectedCategory === 'other'
                  ? "Tusaale: Waa maxay xukunka fiqiga ah ee laga qaato aayaddan marka loo eego afarta mad-hab?"
                  : "Qor ama wax ka beddel su'aashaada..."
              }
              className="w-full p-3 rounded-2xl bg-muted/40 border border-border focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm text-foreground leading-relaxed resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Sourced Islamic Accuracy Guarantee */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              EMufti AI waxay jawaabteeda ku dhisaysaa Quraanka, Sunnada sugan, iyo tafsiirrada culumada waaweyn. Haddii aysan jirin sabab nuzuul oo sugan, si daacad ah ayaa laguu ogeysiin doonaa.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/80 flex items-center justify-between gap-2.5 bg-muted/30 shrink-0">
          <div className="text-[11px] text-muted-foreground">
            {!isPaid && usageStatus && (
              <span>
                Haraaga: <strong className="text-foreground">{usageStatus.uses_remaining}/2</strong> su'aalood
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Ka noqo
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={
                isFreePlanExhausted ||
                isSubmitting ||
                (selectedCategory === 'other' && !customQuestion.trim())
              }
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Xaqiijinaya...</span>
                </>
              ) : isFreePlanExhausted ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Xadkii waa Buuxsamay</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Waydii EMufti</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
