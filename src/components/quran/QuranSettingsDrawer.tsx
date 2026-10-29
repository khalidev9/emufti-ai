import React from 'react';
import {
  X,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  Volume2,
  Check,
} from 'lucide-react';
import { QariReciter } from '../../types/database';

export type QuranReadingDesignMode = 'mushaf' | 'ayah' | 'study';
export type QuranReadingTheme = 'light' | 'sepia' | 'dark';
export type QuranFontSizeOption = 'sm' | 'md' | 'lg' | 'xl';

interface QuranSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  readingDesignMode: QuranReadingDesignMode;
  onSelectReadingDesignMode: (mode: QuranReadingDesignMode) => void;
  readingTheme: QuranReadingTheme;
  onSelectReadingTheme: (theme: QuranReadingTheme) => void;
  fontSize: QuranFontSizeOption;
  onSelectFontSize: (size: QuranFontSizeOption) => void;
  showSomaliTranslation: boolean;
  onToggleSomaliTranslation: () => void;
  showEnglishTranslation: boolean;
  onToggleEnglishTranslation: () => void;
  reciters: QariReciter[];
  selectedReciter: QariReciter;
  onSelectReciter: (reciter: QariReciter) => void;
  playbackSpeed: number;
  onSelectPlaybackSpeed: (speed: number) => void;
  autoScrollWithAudio: boolean;
  onToggleAutoScroll: () => void;
}

export const QuranSettingsDrawer: React.FC<QuranSettingsDrawerProps> = ({
  isOpen,
  onClose,
  readingDesignMode,
  onSelectReadingDesignMode,
  readingTheme,
  onSelectReadingTheme,
  fontSize,
  onSelectFontSize,
  showSomaliTranslation,
  onToggleSomaliTranslation,
  showEnglishTranslation,
  onToggleEnglishTranslation,
  reciters,
  selectedReciter,
  onSelectReciter,
  playbackSpeed,
  onSelectPlaybackSpeed,
  autoScrollWithAudio,
  onToggleAutoScroll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#181818] h-full shadow-2xl flex flex-col z-10 border-l border-stone-200/80 dark:border-white/10 animate-in slide-in-from-right duration-200 select-none">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Habaynta Akhriska (Reading Settings)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Style, Theme, Font, and Playback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 chat-scrollbar">
          {/* Section 1: Qaabka Akhriska (Reading Design Mode) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Qaabka Akhriska (Reading Design):
            </label>
            <div className="grid grid-cols-1 gap-2">
              {/* Mode 1: Mushaf Page */}
              <button
                type="button"
                onClick={() => onSelectReadingDesignMode('mushaf')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  readingDesignMode === 'mushaf'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-stone-200 dark:border-white/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Mushaf Page View</span>
                    {readingDesignMode === 'mushaf' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Bog-bog sida Musxafka daabacan (Medina Mushaf 604 pages)
                  </p>
                </div>
              </button>

              {/* Mode 2: Ayah-by-Ayah */}
              <button
                type="button"
                onClick={() => onSelectReadingDesignMode('ayah')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  readingDesignMode === 'ayah'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-stone-200 dark:border-white/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Ayah-by-Ayah View</span>
                    {readingDesignMode === 'ayah' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Aayad-aayad kaarar xarrago leh leh (Default recommended)
                  </p>
                </div>
              </button>

              {/* Mode 3: Translation and Study */}
              <button
                type="button"
                onClick={() => onSelectReadingDesignMode('study')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  readingDesignMode === 'study'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-stone-200 dark:border-white/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Translation & Study View</span>
                    {readingDesignMode === 'study' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Quraanka + Tarjumada + Tafsiirka Culimada (Sh. Mustafe, Sh. Cumar Faaruuq)
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Reading Theme (Light, Sepia, Dark) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Muuqaalka Akhriska (Reading Theme):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSelectReadingTheme('light')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  readingTheme === 'light'
                    ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-stone-100 border border-stone-300 mx-auto mb-1 flex items-center justify-center">
                  <Sun className="w-3 h-3 text-amber-500" />
                </div>
                <span className="text-[11px] font-bold block">Cad (Light)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectReadingTheme('sepia')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  readingTheme === 'sepia'
                    ? 'bg-[#FBF7EE] border-amber-600 text-amber-900 shadow-xs ring-2 ring-amber-500/30'
                    : 'bg-[#FBF7EE] border-amber-200 text-amber-800 hover:border-amber-400'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#EFE8D6] border border-amber-300 mx-auto mb-1 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                </div>
                <span className="text-[11px] font-bold block">Warqad (Sepia)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectReadingTheme('dark')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  readingTheme === 'dark'
                    ? 'bg-[#181818] border-emerald-500 text-white shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-[#1c1c1c] border-stone-700 text-stone-300 hover:border-stone-600'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-stone-800 border border-stone-600 mx-auto mb-1 flex items-center justify-center">
                  <Moon className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold block">Madow (Dark)</span>
              </button>
            </div>
          </div>

          {/* Section 3: Dooro cabbirka (Font Size Selector) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Dooro cabbirka:
              </label>
              <span className="text-[11px] font-semibold text-emerald-600">
                {fontSize === 'sm' ? 'Yar' : fontSize === 'md' ? 'Caadi' : fontSize === 'lg' ? 'Weyn' : 'Aad u weyn'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                onClick={() => onSelectFontSize('sm')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fontSize === 'sm'
                    ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-foreground'
                }`}
              >
                Yar
              </button>
              <button
                type="button"
                onClick={() => onSelectFontSize('md')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fontSize === 'md'
                    ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-foreground'
                }`}
              >
                Caadi
              </button>
              <button
                type="button"
                onClick={() => onSelectFontSize('lg')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fontSize === 'lg'
                    ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-foreground'
                }`}
              >
                Weyn
              </button>
              <button
                type="button"
                onClick={() => onSelectFontSize('xl')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  fontSize === 'xl'
                    ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-foreground'
                }`}
              >
                Aad u weyn
              </button>
            </div>
          </div>

          {/* Section 4: Translations Toggle */}
          <div className="space-y-2 pt-2 border-t border-stone-200/70 dark:border-white/5">
            <label className="text-xs font-bold text-foreground block">
              Tarjumadaha (Translations):
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200/70 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Tarjumada Af-Soomaaliga
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Shiikh Maxamuud Maxamed Cabdux
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={showSomaliTranslation}
                  onChange={onToggleSomaliTranslation}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200/70 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    English Translation
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Saheeh International
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={showEnglishTranslation}
                  onChange={onToggleEnglishTranslation}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Section 5: Reciter & Audio Playback Settings */}
          <div className="space-y-2 pt-2 border-t border-stone-200/70 dark:border-white/5">
            <label className="text-xs font-bold text-foreground block">
              Codka & Qaariga (Reciter & Audio):
            </label>
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-muted-foreground block mb-1">
                  Qaariga Hadda Doortan:
                </span>
                <select
                  value={selectedReciter.id}
                  onChange={(e) => {
                    const r = reciters.find((x) => x.id === e.target.value);
                    if (r) onSelectReciter(r);
                  }}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border-0 text-foreground focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {reciters.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name} ({q.arabicName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Playback speed */}
              <div>
                <span className="text-[11px] text-muted-foreground block mb-1">
                  Xawaaraha Codka (Speed):
                </span>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-center">
                  {[0.75, 1.0, 1.25, 1.5].map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => onSelectPlaybackSpeed(sp)}
                      className={`py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        playbackSpeed === sp
                          ? 'bg-white dark:bg-stone-900 text-emerald-600 shadow-xs font-bold'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Scroll toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200/70 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Raac Aayadda Akhrinaysa
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Auto-scroll active verse during audio playback
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoScrollWithAudio}
                  onChange={onToggleAutoScroll}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
