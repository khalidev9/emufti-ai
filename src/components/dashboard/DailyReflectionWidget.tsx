import React, { useState } from 'react';
import { BookOpen, Scroll, Heart, Copy, Check, Volume2, VolumeX, Share2, Sparkles } from 'lucide-react';

interface DailyReflection {
  type: 'ayah' | 'hadith' | 'dua';
  title: string;
  arabic: string;
  english: string;
  somali: string;
  source: string;
  context: string;
}

const DAILY_REFLECTIONS: Record<'ayah' | 'hadith' | 'dua', DailyReflection> = {
  ayah: {
    type: 'ayah',
    title: 'Aayadda Maanta (Verse of the Day)',
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    english: "And say: 'My Lord, increase me in knowledge.'",
    somali: "Oo waxaad dhahdaa: 'Eebbow ii kordhi cilmi.'",
    source: 'Surah Taha (20:114)',
    context: 'The divine command revealed to Prophet Muhammad ﷺ to continuously seek an increase in beneficial sacred knowledge.',
  },
  hadith: {
    type: 'hadith',
    title: 'Xadiiska Maanta (Hadith of the Day)',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    english: 'Whoever treads a path seeking knowledge, Allah makes easy for him a path to Paradise.',
    somali: 'Qofkii qaada waddo uu cilmi ku raadinayo, Eebbe wuxuu u fududaynayaa waddada Jannada.',
    source: 'Sahih Muslim 2699 · Narrated by Abu Hurairah (RA)',
    context: 'Authentic prophetic glad tidings for every sincere seeker traversing the path of sacred Islamic learning.',
  },
  dua: {
    type: 'dua',
    title: 'Ducada Maanta (Prophetic Dua of the Day)',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً',
    english: 'O Allah, I ask You for beneficial knowledge, good provision, and acceptable deeds.',
    somali: 'Ilaahayow, waxaan ku weydiisanayaa cilmi waxtar leh, risiq xalaal ah oo wanaagsan, iyo camal la aqbalo.',
    source: 'Sunan Ibn Majah 925 · Graded Sahih by Al-Albani',
    context: 'The cherished daily supplication of the Messenger of Allah ﷺ recited after concluding the Fajr prayer.',
  },
};

export const DailyReflectionWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ayah' | 'hadith' | 'dua'>('ayah');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const reflection = DAILY_REFLECTIONS[activeTab];

  const handleCopy = () => {
    const text = `${reflection.arabic}\n\nSomali: ${reflection.somali}\nEnglish: ${reflection.english}\nSource: ${reflection.source}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(reflection.arabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-blue-200 transition-all">
      {/* Header and Category Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Dhiirigelinta Maanta (Daily Islamic Wisdom)
          </h2>
        </div>

        {/* Tab Pills */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          {[
            { id: 'ayah', label: "Aayad (Verse)", icon: BookOpen },
            { id: 'hadith', label: 'Xadiis (Hadith)', icon: Scroll },
            { id: 'dua', label: 'Duco (Dua)', icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (isSpeaking && typeof window !== 'undefined') {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 border border-blue-100/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
            {reflection.title}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {reflection.source}
          </span>
        </div>

        {/* Arabic Calligraphy Scripture */}
        <p className="text-xl sm:text-2xl font-bold text-slate-900 text-right leading-relaxed font-serif pt-1 select-all" dir="rtl">
          « {reflection.arabic} »
        </p>

        {/* Somali & English Meanings */}
        <div className="space-y-1.5 pt-1 text-xs sm:text-sm border-t border-slate-200/60">
          <p className="text-slate-800 font-medium">
            <strong className="text-blue-700">Somali:</strong> {reflection.somali}
          </p>
          <p className="text-slate-600">
            <strong className="text-slate-700">English:</strong> {reflection.english}
          </p>
        </div>

        {/* Scholarly Context */}
        <p className="text-[11px] text-slate-500 italic bg-white/70 p-2.5 rounded-xl border border-slate-200/50">
          💡 {reflection.context}
        </p>
      </div>

      {/* Action Footer: Copy, Audio TTS, Source Link */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'La koobiyey!' : 'Koobiyeey (Copy)'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-blue-600 text-white font-bold animate-pulse'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Jooji Codka' : 'Dhageyso (Audio)'}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Source: {reflection.source}
        </span>
      </div>
    </div>
  );
};
