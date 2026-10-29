import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, MicOff, Send, Square } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../lib/storage';

interface MessageComposerProps {
  onSendMessage: (prompt: string, contextPrompt?: string) => void;
  isKeyboardOpen?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export type PromptCategory = 'all' | 'tafsir' | 'hadith' | 'fiqh' | 'dua';

export interface QuickPromptItem {
  id: string;
  category: 'tafsir' | 'hadith' | 'fiqh' | 'dua';
  categoryLabel: string;
  icon: string;
  title: string;
  prompt: string;
  contextPrompt?: string;
}

export const CATEGORIZED_PROMPT_CHIPS: QuickPromptItem[] = [
  // 1. Tafsir
  {
    id: 't1',
    category: 'tafsir',
    categoryLabel: 'Tafsir',
    icon: '📖',
    title: 'Tafsiirka Suurat Al-Mulk',
    prompt: "Tafsiirka Suurat Al-Mulk: maxay tahay dulucdeeda guud iyo faa'iidada ay u leedahay qabriga?",
    contextPrompt: "Tafsiirka Suurat Al-Mulk (Suuradda 67-aad ee Quraanka Kariimka ah, 30 aayadood). Fadlan bixi tafsiir faahfaahsan oo sax ah oo ku saabsan:\n1. Magacyada suuradda (Al-Mulk, Tabaarak, Al-Maani'ah, Al-Munjiyah).\n2. Dulucda guud iyo awoodda Alle ee koonka lagu arko.\n3. Xadiisyada sugan ee ka hadlay fadligeeda iyo sida ay qofka uga badbaadiso cadaabka qabriga (Sahih at-Tirmidhi 2891, Abu Dawud 1400).\n4. Dulucda aayadaha ugu muhiimsan (1-2 iyo 14) iyo casharrada nolosha laga baranayo.",
  },
  {
    id: 't2',
    category: 'tafsir',
    categoryLabel: 'Tafsir',
    icon: '📖',
    title: 'Fasiraadda Aayat Al-Kursi',
    prompt: 'Fasiraadda Aayat Al-Kursi (Al-Baqarah 255) iyo sharraxaadda magacyada Ilaahay ee ku jira.',
    contextPrompt: 'Fasiraadda Aayat Al-Kursi (Suuradda Al-Baqarah 2:255). Fadlan bixi sharaxaad qoto dheer oo ku saabsan:\n1. Sababta ay u tahay aayadda ugu weyn uguna sharafta badan Quraanka (Sahih Muslim 810).\n2. Sharraxaadda magacyada iyo sifooyinka Alle ee ku xusan (Al-Xayy, Al-Qayyuum, Al-Caliyy, Al-Cadhiim).\n3. Macnaha Kursiga iyo farqiga u dhexeeya Kursiga iyo Carshiga.\n4. Fadliga weyn ee akhriskeeda salaad kasta oo faral ah ka dib iyo ka hor hurdada.',
  },
  {
    id: 't3',
    category: 'tafsir',
    categoryLabel: 'Tafsir',
    icon: '📖',
    title: 'Sababta Suurat Al-Ikhlas',
    prompt: 'Maxay tahay sababta soo degitaanka Suuratul Ikhlaas iyo sababta ay ugu dhiganto saddex meelood hal meel Quraanka?',
    contextPrompt: 'Suuratul Ikhlaas (Suuradda 112). Fadlan bixi faahfaahin cilmiyeysan oo ku saabsan:\n1. Sababta soo degitaanka (Asbaab an-Nuzuul) markii mushrikiintu Nabiga ﷺ weydiiyeen nasabka Eebbe (Tirmidhi 3364).\n2. Sharraxaadda ereyada Towxiidka ah: Al-Axad iyo As-Samad.\n3. Sababta ay ugu dhiganto saddex meelood hal meel Quraanka Kariimka ah (Sahih al-Bukhari 5015) marka loo eego qaybaha mawduucyada Quraanka (Towxiid, Axkaam, iyo Qisooyin).\n4. Fadliga akhriska iyo ku celcelinta suuraddan.',
  },
  // 2. Hadith
  {
    id: 'h1',
    category: 'hadith',
    categoryLabel: 'Hadith',
    icon: '📜',
    title: 'Xadiiska 1-aad Nawawi',
    prompt: "Sharaxaad ku saabsan xadiiska koowaad ee 40-ka Nawawi (Innamal A'maalu Bin-Niyyaat).",
    contextPrompt: "Sharaxaad ku saabsan xadiiska koowaad ee 40-ka Nawawi ee uu wariyay Amiirkii Mu'miniinta Cumar ibn al-Khadhaab (Sahih al-Bukhari 1, Sahih Muslim 1907):\n1. Matn-ka xadiiska oo Carabi iyo Soomaali ah ('Innamal A'maalu Bin-Niyyaat...').\n2. Sababta uu u yahay saddex meelood hal meel Islaamka sida ay culimadu (Imaam Shaafici iyo Bukhaari) sheegeen.\n3. Labada shardi ee lagama maarmaanka u ah aqbalitaanka camal kasta (Ikhlaas iyo Ittibaa').\n4. Doorka Niyadda ee kala soocidda caadada iyo cibaadada iyo casharrada ficiliga ah.",
  },
  {
    id: 'h2',
    category: 'hadith',
    categoryLabel: 'Hadith',
    icon: '📜',
    title: 'Daryeelka Waalidiinta',
    prompt: 'Xadiis sugan oo ku saabsan xurmada, daryeelka iyo wanaag-u-falka waalidiinta.',
    contextPrompt: 'Xadiisyada iyo axkaamta sugan ee ku saabsan xurmada iyo daryeelka waalidiinta (Birr al-Walidayn):\n1. Aayadaha Quraanka ee xurmada waalidiinta (Surah Al-Isra 17:23-24).\n2. Xadiiskii Abuu Hureyrah: Yaa ugu mudan wehelnimadayda wanaagsan? Hooyadaa, hooyadaa, hooyadaa, kaddibna aabbahaa (Sahih al-Bukhari 5971, Sahih Muslim 2548).\n3. Xadiiskii Jaahimah: Ku dhegnow hooyadaa, waayo Jannadu waxay ku hoos jirtaa labadeeda lugood (Sunan an-Nasa\'i 3104).\n4. Khatarta dambiga caasinimada waalidiinta (\'Uquuq al-Walidayn) iyo sida loogu samafalo noolal iyo dhimashoba.',
  },
  {
    id: 'h3',
    category: 'hadith',
    categoryLabel: 'Hadith',
    icon: '📜',
    title: 'Akhlaaqda & Naxariista',
    prompt: 'Xadiis ku saabsan naxariista iyo akhlaaqda suubban ee qofka Muslimka ah looga baahan yahay.',
    contextPrompt: 'Xadiisyada sugan ee ku saabsan akhlaaqda suubban iyo naxariista diinta Islaamka:\n1. Ujeeddada soo diritaanka Nabiga ﷺ: Waxaa la ii soo diray uun inaan dhammeystiro akhlaaqda wanaagsan (Al-Muwatta 1614, Al-Bayhaqi).\n2. Miisaanka akhlaaqda Maalinta Qiyaamaha iyo qofka ugu jecel Nabiga ﷺ (Jami\' at-Tirmidhi 2018).\n3. Xadiiska naxariista guud: Kuwa naxariista waxaa u naxariista Eebaha Naxariistaha ah; u naxariista kuwa dhulka jooga si uu idiinku naxariisto Kan samada jooga (Jami\' at-Tirmidhi 1924).\n4. Tusaalooyinka ficiliga ah ee nolosha maalinlaha ah.',
  },
  // 3. Fiqh
  {
    id: 'f1',
    category: 'fiqh',
    categoryLabel: 'Fiqh',
    icon: '⚖️',
    title: 'Shuruudaha Salaadda',
    prompt: 'Maxay yihiin shuruudaha, tiirarka iyo waajibaadka salaadda ee qofka looga baahan yahay?',
    contextPrompt: 'Axkaamta buuxda ee Salaadda: Shuruudaha, Tiirarka iyo Waajibaadka:\n1. 9-ka Shardi ee saxnimada salaadda (Islaamnimo, Caqli, Tamyiis, Daahirnimo ka timaadda xadaska, Daahirinta najaasada, Asturidda cawrada, Gelitaanka waqtiga, U jeedka qiblada, iyo Niyadda).\n2. 14-ka Tiir (Arkaan) ee haddii mid laga tago aysan salaaddu ansaxayn (Takbiirta hore, Faatixada, Rukuuca, Ictidaalka, Sujuudda, iwm).\n3. 8-da Waajib ee lagu kabi karo Sujuudda Sahwiga haddii la illoobo.\n4. Farqiga fiqhiga ee u dhexeeya madhabaha.',
  },
  {
    id: 'f2',
    category: 'fiqh',
    categoryLabel: 'Fiqh',
    icon: '⚖️',
    title: 'Xisaabinta Zakada',
    prompt: 'Sidee loo xisaabiyaa Zakada hantida iyo lacagta kaydsan, immisa ayuuna yahay nisaabku?',
    contextPrompt: 'Hannaanka xisaabinta Zakada hantida, lacagta kaydsan iyo dahabka:\n1. Qawaaniinta Nisaabka (85 garaam oo dahab saafi ah ama 595 garaam oo qalin ah, iyo u dhigmaheeda lacageed maanta).\n2. Shardiyeenta Sanad-wareegga (Xawlka qamariga ah ee 354 maalmood).\n3. Qaaciddada saxda ah ee xisaabinta: (Wadarta hantida kaydsan) × 2.5% (ama loo qaybiyo 40).\n4. Dadka xaqa u leh zakada sida ku xusan Surah At-Tawbah 9:60 iyo waxyaabaha aan zakadu ku waajibin.',
  },
  {
    id: 'f3',
    category: 'fiqh',
    categoryLabel: 'Fiqh',
    icon: '⚖️',
    title: 'Waxyaabaha Soonka Jebiya',
    prompt: 'Maxay yihiin waxyaabaha buriya ama jebiya soonka ee qofka sooman u baahan yahay inuu ka digtoonaado?',
    contextPrompt: 'Waxyaabaha buriya ama jebiya soonka (Mufaddiraat as-Sawm) ee qofka sooman:\n1. Waxyaabaha jebiya ee qadaada keliya waajibiya (Cunto ama cabbis ku talagal ah, Matag ku talagal ah, Dhiigga dheddignimada ee xaydka ama nifaaska, Cirbadaha nafaqada leh ee dhuunta ama xididka mara).\n2. Waxyaabaha jebiya ee waajibiya Qadaada iyo Kafaarada culus (Galmada maalintii Ramadaanka oo leh kafaaro: xorayn addoon, ama soonka labo bilood oo isku xigta, ama quudinta 60 miskiin).\n3. Waxyaabaha AAN jebin soonka ee dadku isku khaldaan (Ilowshada, dhibicda indhaha, cadayga, qubeyska, dhiig-qaadista baaritaanka).',
  },
  // 4. Dua
  {
    id: 'd1',
    category: 'dua',
    categoryLabel: 'Dua',
    icon: '🤲',
    title: 'Ducooyinka Adkaarta',
    prompt: 'Ducooyinka subaxda iyo fiidka (Adkaar) ee Rasuulka ﷺ ka sugnaaday iyo fadligooda.',
    contextPrompt: 'Ducooyinka Adkaarta Subaxda iyo Fiidka ee Sunnada Nabiga ﷺ ka sugnaaday:\n1. Waqtiyada shareecada u jideysay akhrinta adkaarta subaxda iyo galabta.\n2. Aayadaha iyo Suuradaha adkaarta (Aayat al-Kursi iyo saddexda Qul oo min 3 jeer la akhriyo).\n3. Ducooyinka nabawiga ah ee xafidaadda (\'Bismillaahilladii laa yadurru ma\'asmihii...\', \'A\'uudu bikalimaatillaahit taammaat...\', \'Asbaxnaa wa asbaxal mulku lillaahi...\').\n4. Fadliga weyn iyo badbaadada ay u leeyihiin qofka Muslimka ah.',
  },
  {
    id: 'd2',
    category: 'dua',
    categoryLabel: 'Dua',
    icon: '🤲',
    title: 'Ducada Murugada & Welwelka',
    prompt: 'Maxay tahay ducada ugu habboon ee la akhristo marka uu qofku dareemo murugo, walwal ama diiqad?',
    contextPrompt: 'Ducooyinka sugan ee lagula tacaalo murugada, welwelka, walbahaarka iyo diiqadda:\n1. Ducadii Nebi Yoonis ee caloosha kalluunka: \'Laa ilaaha illaa Anta Subxaanaka inni kuntu minad-daalimiin\' (Surah Al-Anbiya 21:87, Tirmidhi 3505).\n2. Ducada murugada iyo deynta: \'Allaahumma inni a\'uudu bika minal hammi wal-xazan, wal-\'ajzi wal-kasal, wal-buxli wal-jubn, wa dal\'id-dayni wa ghalabatir-rijaal\' (Sahih al-Bukhari 2893).\n3. Ducada Al-Karb (Dhibaatada weyn): \'Laa ilaaha illallaahul Cadhiimul Xaliim...\' (Sahih al-Bukhari 6345).\n4. Dabeecadda iyo tallaabooyinka ruuxiga ah ee qofka qalbigu ugu degayo.',
  },
  {
    id: 'd3',
    category: 'dua',
    categoryLabel: 'Dua',
    icon: '🤲',
    title: 'Sayyidul Istiqfaar',
    prompt: 'Waa maxay Sayyidul Istiqfaar (Duco dambi dhaaf), sideese loo akhriyaa macnaheeduna yahay?',
    contextPrompt: 'Sayyidul Istiqfaar (Ducooyinka Dambi-dhaafka Madaxdooda) ee Nabiga ﷺ ka sugnaaday (Sahih al-Bukhari 6306):\n1. Qoraalka saxda ah ee ducada oo Carabi iyo farta codka ah (transliteration).\n2. Turjumaadda macnaha qoto dheer ee Soomaaliga ah ee qirashada addoonnimada, nimcada Alle, iyo qirashada dambiga.\n3. Fadliga weyn ee xadiisku sheegay (in qofkii subaxdii ama fiidkii akhriya isagoo aaminsan uu gelayo Jannada hadduu dhinto).\n4. Sida loogu dhaqmo nolosha maalinlaha ah.',
  },
];

export const QUICK_SUGGESTIONS = [
  "Faa'iidada Quraanka kale?",
  "Sidee ku xifdi karaa?",
  "Aayado ku saabsan sabarka",
  "Shuruudaha weysada",
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  isKeyboardOpen = false,
  onFocus,
  onBlur,
}) => {
  const { isGenerating, stopGeneration, targetLanguage } = useChat();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const PROMPT_CATEGORIES: { id: PromptCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'tafsir', label: 'Tafsir', icon: '📖' },
    { id: 'hadith', label: 'Hadith', icon: '📜' },
    { id: 'fiqh', label: 'Fiqh', icon: '⚖️' },
    { id: 'dua', label: 'Dua', icon: '🤲' },
  ];

  const activePromptChips = React.useMemo(() => {
    if (selectedCategory === 'all') return CATEGORIZED_PROMPT_CHIPS;
    return CATEGORIZED_PROMPT_CHIPS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Codka lama taageerayo biraawsarkan (Speech recognition is not supported in this browser).');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        targetLanguage === 'ar'
          ? 'ar-SA'
          : targetLanguage === 'so'
          ? 'so-SO'
          : 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Voice recognition error:', err);
      setIsRecording(false);
    }
  };

  const handleSubmit = async (
    e?: React.FormEvent | React.MouseEvent,
    overrideText?: string,
    contextPrompt?: string
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textToSend = (overrideText || prompt).trim();
    if (!textToSend || isGenerating || isSubmitting) return;

    setIsSubmitting(true);
    const previousPrompt = textToSend;
    setPrompt('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await Promise.resolve(onSendMessage(previousPrompt, contextPrompt));
    } catch (error) {
      setPrompt(previousPrompt);
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing) return;
      const enterToSend = storage.getSettings(user?.id || 'seeker_user')?.enter_to_send ?? true;
      if (enterToSend) {
        if (!e.shiftKey) {
          e.preventDefault();
          if (!isGenerating && !isSubmitting && prompt.trim()) {
            handleSubmit(e);
          }
        }
      } else {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (!isGenerating && !isSubmitting && prompt.trim()) {
            handleSubmit(e);
          }
        }
      }
    }
  };

  const canSend = prompt.trim().length > 0 && !isSubmitting && !isGenerating;

  return (
    <div className="w-full bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 px-3 sm:px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5 transition-all duration-200">
      <div className="max-w-3xl mx-auto w-full space-y-2.5">
        {/* ================================================================= */}
        {/* 1. CATEGORIZED QUICK PROMPT CHIPS (Tafsir, Hadith, Fiqh, Dua)     */}
        {/* ================================================================= */}
        {!isKeyboardOpen && (
          <div className="space-y-1.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
              {PROMPT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-[11px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Prompt Chips matching Active Category */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5">
              {activePromptChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleSubmit(undefined, chip.prompt, chip.contextPrompt)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 group"
                  title={chip.prompt}
                >
                  <span className="text-[11px]">{chip.icon}</span>
                  <span className="truncate max-w-[220px]">{chip.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. PROMPT INPUT BOX (ChatGPT-Style Sleek Floating Card)           */}
        {/* ================================================================= */}
        <div className="relative flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md focus-within:shadow-xl focus-within:shadow-blue-500/10 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 px-3 py-2 gap-2 transition-all duration-300">
          {/* Attachment / Options (+) Button */}
          <button
            type="button"
            onClick={() => {
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Attach / Quick Options"
            aria-label="Attach / Options"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Voice Microphone Icon with pulse */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-4 ring-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isRecording ? 'Stop voice recording' : 'Record question with microphone'}
            aria-label="Voice input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Multiline auto-growing Textarea ("Weydii EMufti AI...") */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            rows={1}
            placeholder={isGenerating ? t('composer.generating', 'Generating response...') : 'Weydii EMufti AI...'}
            aria-label="Ask EMufti AI"
            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-xs sm:text-sm text-slate-900 dark:text-slate-100 resize-none min-h-[36px] max-h-36 py-2 px-1 leading-relaxed placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium"
          />

          {/* Circular/Pill Gradient Send Button */}
          <div className="shrink-0">
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center shadow-md cursor-pointer"
                title={t('composer.stop', 'Stop generation')}
                aria-label={t('composer.stop', 'Stop generation')}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!prompt.trim() || isSubmitting}
                onClick={() => handleSubmit()}
                className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded-2xl transition-all flex items-center justify-center shadow-sm active:scale-95 ${
                  canSend
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-105 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
                title="Send"
                aria-label="Send"
              >
                <Send className="w-4 h-4 text-white -mr-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. CENTERED MUTED DISCLAIMER TEXT                                 */}
        {/* ================================================================= */}
        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 font-medium mt-1 px-2 select-none">
          EMufti AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};
