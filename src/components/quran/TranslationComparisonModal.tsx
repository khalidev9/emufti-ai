import React, { useState } from 'react';
import { X, Copy, Check, BookOpen, Globe, Sparkles } from 'lucide-react';

interface TranslationComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  somaliText: string;
  englishText: string;
}

export const TranslationComparisonModal: React.FC<TranslationComparisonModalProps> = ({
  isOpen,
  onClose,
  surahName,
  surahNumber,
  ayahNumber,
  arabicText,
  somaliText,
  englishText,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Isbarbardhigga Turjumaadaha (Translation Comparison)
              </h3>
              <span className="text-xs text-blue-600 font-semibold block">
                {surahName} · Ayah {ayahNumber} ({surahNumber}:{ayahNumber})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Original Arabic Scripture Card */}
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Qur'aanka Kariimka (Original Uthmani Arabic)
            </span>
            <button
              type="button"
              onClick={() => handleCopy('ar', arabicText)}
              className="p-1 rounded-lg text-slate-500 hover:bg-blue-100 hover:text-blue-700 text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Arabic text"
            >
              {copiedKey === 'ar' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-right text-slate-900 leading-relaxed select-all" dir="rtl">
            {arabicText}
          </p>
        </div>

        {/* 2. Somali Translation (Sheikh Mahmud Abdi) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Turjumada Soomaaliga (Sheikh Maxamuud Cabdi)
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('so', somaliText)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Somali translation"
            >
              {copiedKey === 'so' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            {somaliText || 'Turjumaadda aayaddan dib ayaa loo cusbooneysiinayaa.'}
          </p>
        </div>

        {/* 3. English Translation (Sahih International) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                English Translation (Sahih International)
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('en', englishText)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 text-xs flex items-center gap-1 cursor-pointer"
              title="Copy English translation"
            >
              {copiedKey === 'en' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
            "{englishText || 'Translation pending synchronization.'}"
          </p>
        </div>

        {/* Scholarly Consensus Note */}
        <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 flex items-center gap-2 text-[11px] text-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Turjumaadaha waxaa loo xaqiijiyay si waafaqsan fahamka saxaabada iyo culimada ehlusunnada.</span>
        </div>
      </div>
    </div>
  );
};
