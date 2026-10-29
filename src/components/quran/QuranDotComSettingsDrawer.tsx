import React, { useState } from 'react';
import {
  X,
  Minus,
  Plus,
  RotateCcw,
  Check,
  Search,
  Headphones,
  Play,
  Pause,
  BookOpen,
  Volume2,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import {
  QuranDotComTranslation,
  QuranDotComReciter,
  VERIFIED_QDC_RECITERS,
} from '../../lib/quranDotComService';
import { QuranReadingThemeMode } from './QuranThemeSwitcher';

type SettingsTab = 'arabic' | 'translation' | 'wbw_more';

interface QuranDotComSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Font sizes
  arabicFontSize: number; // in rem, e.g. 1.5 to 3.5
  onChangeArabicFontSize: (size: number) => void;
  translationFontSize: number; // in rem, e.g. 0.85 to 1.5
  onChangeTranslationFontSize: (size: number) => void;
  // Word by word
  showWordByWordTranslation: boolean;
  onToggleWordByWordTranslation: () => void;
  showWordByWordTransliteration: boolean;
  onToggleWordByWordTransliteration: () => void;
  // Reciter
  selectedReciterId: number;
  onSelectReciter: (reciter: QuranDotComReciter) => void;
  availableReciters?: QuranDotComReciter[];
  // Translation
  selectedTranslationId: number;
  onSelectTranslation: (translation: QuranDotComTranslation) => void;
  availableTranslations: QuranDotComTranslation[];
  // Theme (especially for mobile)
  currentTheme: QuranReadingThemeMode;
  onSelectTheme: (theme: QuranReadingThemeMode) => void;
  // Reset
  onResetSettings: () => void;
}

export const QuranDotComSettingsDrawer: React.FC<QuranDotComSettingsDrawerProps> = ({
  isOpen,
  onClose,
  arabicFontSize,
  onChangeArabicFontSize,
  translationFontSize,
  onChangeTranslationFontSize,
  showWordByWordTranslation,
  onToggleWordByWordTranslation,
  showWordByWordTransliteration,
  onToggleWordByWordTransliteration,
  selectedReciterId,
  onSelectReciter,
  availableReciters = VERIFIED_QDC_RECITERS,
  selectedTranslationId,
  onSelectTranslation,
  availableTranslations,
  currentTheme,
  onSelectTheme,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('arabic');
  const [reciterSearch, setReciterSearch] = useState('');
  const [translationSearch, setTranslationSearch] = useState('');
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentReciter =
    availableReciters.find((r) => r.id === selectedReciterId) ||
    availableReciters.find((r) => r.id === 12) || // Al-Husary default
    availableReciters[0];

  const currentTranslation =
    availableTranslations.find((t) => t.id === selectedTranslationId) ||
    availableTranslations[0];

  const handlePreviewReciter = (reciterId: number) => {
    if (playingPreviewId === reciterId) {
      previewAudio?.pause();
      setPlayingPreviewId(null);
    } else {
      if (previewAudio) previewAudio.pause();
      // Verified audio preview
      let sampleUrl = `https://download.quranicaudio.com/qdc/khalil_al_husary/${reciterId === 12 ? 'muallim' : 'murattal'}/1.mp3`;
      if (reciterId === 7) sampleUrl = 'https://server8.mp3quran.net/afs/001.mp3';
      else if (reciterId === 2) sampleUrl = 'https://server7.mp3quran.net/basit/001.mp3';

      const audio = new Audio(sampleUrl);
      setPreviewAudio(audio);
      setPlayingPreviewId(reciterId);
      audio.play().catch(() => setPlayingPreviewId(null));
      audio.onended = () => setPlayingPreviewId(null);
    }
  };

  const filteredReciters = availableReciters.filter((r) => {
    const q = reciterSearch.toLowerCase().trim();
    if (!q) return true;
    return r.reciter_name.toLowerCase().includes(q) || (r.style && r.style.toLowerCase().includes(q));
  });

  const filteredTranslations = availableTranslations.filter((t) => {
    const q = translationSearch.toLowerCase().trim();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.author_name.toLowerCase().includes(q) || t.language_name.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full sm:max-w-md bg-white dark:bg-stone-900 border-l border-slate-200 dark:border-stone-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Reading Settings
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-stone-400">
                Customize typography, translations & reciters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 bg-slate-50/80 dark:bg-stone-950/60 border-b border-slate-100 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Live Preview
          </span>
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-stone-800 shadow-2xs space-y-2">
            <p
              className="font-arabic text-right text-slate-900 dark:text-white select-none leading-relaxed"
              dir="rtl"
              style={{ fontSize: `${arabicFontSize}rem` }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ <span className="text-blue-600 text-sm">۝١</span>
            </p>
            <p
              className="text-slate-600 dark:text-stone-300 leading-snug"
              style={{ fontSize: `${translationFontSize}rem` }}
            >
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </p>
          </div>
        </div>

        {/* 3 Main Tabs */}
        <div className="flex items-center border-b border-slate-100 dark:border-stone-800 px-4 pt-2 gap-2 bg-white dark:bg-stone-900">
          <button
            type="button"
            onClick={() => setActiveTab('arabic')}
            className={`pb-2.5 px-2 text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'arabic'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-stone-400 hover:text-slate-800'
            }`}
          >
            Arabic
            {activeTab === 'arabic' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('translation')}
            className={`pb-2.5 px-2 text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'translation'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-stone-400 hover:text-slate-800'
            }`}
          >
            Translation
            {activeTab === 'translation' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wbw_more')}
            className={`pb-2.5 px-2 text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'wbw_more'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-stone-400 hover:text-slate-800'
            }`}
          >
            Word by Word & More
            {activeTab === 'wbw_more' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* TAB 1: ARABIC */}
          {activeTab === 'arabic' && (
            <div className="space-y-6">
              {/* Arabic Font Size Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    Arabic Font Size
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round(arabicFontSize * 16)}px ({arabicFontSize.toFixed(1)}rem)
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-stone-800/80 p-2 rounded-2xl border border-slate-200/80 dark:border-stone-700/80">
                  <button
                    type="button"
                    onClick={() => onChangeArabicFontSize(Math.max(1.2, arabicFontSize - 0.2))}
                    disabled={arabicFontSize <= 1.2}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-stone-700 text-slate-700 dark:text-white shadow-2xs flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease Arabic font size"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {arabicFontSize.toFixed(1)}x
                  </span>

                  <button
                    type="button"
                    onClick={() => onChangeArabicFontSize(Math.min(3.5, arabicFontSize + 0.2))}
                    disabled={arabicFontSize >= 3.5}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-stone-700 text-slate-700 dark:text-white shadow-2xs flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    aria-label="Increase Arabic font size"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Theme Selector for Mobile */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-stone-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  Reading Theme
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(['light', 'sepia', 'dark', 'auto'] as QuranReadingThemeMode[]).map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => onSelectTheme(th)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between capitalize transition-all cursor-pointer ${
                        currentTheme === th
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold'
                          : 'border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {th === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        {th === 'sepia' && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                        {th === 'dark' && <Moon className="w-3.5 h-3.5 text-blue-400" />}
                        {th === 'auto' && <Monitor className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{th}</span>
                      </span>
                      {currentTheme === th && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSLATION */}
          {activeTab === 'translation' && (
            <div className="space-y-6">
              {/* Translation Font Size Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    Translation Font Size
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round(translationFontSize * 16)}px
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-stone-800/80 p-2 rounded-2xl border border-slate-200/80 dark:border-stone-700/80">
                  <button
                    type="button"
                    onClick={() => onChangeTranslationFontSize(Math.max(0.75, translationFontSize - 0.1))}
                    disabled={translationFontSize <= 0.75}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-stone-700 text-slate-700 dark:text-white shadow-2xs flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {translationFontSize.toFixed(2)}rem
                  </span>

                  <button
                    type="button"
                    onClick={() => onChangeTranslationFontSize(Math.min(1.5, translationFontSize + 0.1))}
                    disabled={translationFontSize >= 1.5}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-stone-700 text-slate-700 dark:text-white shadow-2xs flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Translation Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    Select Translation
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {filteredTranslations.length} available
                  </span>
                </div>

                {/* Translation Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={translationSearch}
                    onChange={(e) => setTranslationSearch(e.target.value)}
                    placeholder="Search translations by author, language..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Translations List */}
                <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-stone-800/80 pr-1">
                  {filteredTranslations.map((tr) => {
                    const isSelected = tr.id === selectedTranslationId;
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => onSelectTranslation(tr)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900'
                            : 'hover:bg-slate-50 dark:hover:bg-stone-800 text-slate-800 dark:text-stone-200'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{tr.name}</span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {tr.author_name} • {tr.language_name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORD BY WORD & MORE */}
          {activeTab === 'wbw_more' && (
            <div className="space-y-6">
              {/* Word by word toggles */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  Interactive Word-by-Word
                </span>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200/80 dark:border-stone-700">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                      Word Translation
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Show English meaning on word hover/tap
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleWordByWordTranslation}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      showWordByWordTranslation ? 'bg-blue-600' : 'bg-slate-300 dark:bg-stone-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform transform shadow-xs ${
                        showWordByWordTranslation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-stone-800/60 border border-slate-200/80 dark:border-stone-700">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                      Word Transliteration
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Show phonetic pronunciation on hover
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleWordByWordTransliteration}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      showWordByWordTransliteration ? 'bg-blue-600' : 'bg-slate-300 dark:bg-stone-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform transform shadow-xs ${
                        showWordByWordTransliteration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Reciter Selection Card & Search */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    Quran Reciter (Qari)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Default: Al-Husary
                  </span>
                </div>

                {/* Selected Reciter Card */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
                        {currentReciter.reciter_name}
                      </span>
                      <span className="text-[10px] text-blue-700 dark:text-blue-400">
                        {currentReciter.style || 'Verified Qari'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePreviewReciter(currentReciter.id)}
                    className="p-2 rounded-xl bg-white dark:bg-stone-800 text-blue-600 hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer"
                    title="Preview Audio"
                  >
                    {playingPreviewId === currentReciter.id ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>
                </div>

                {/* Reciter Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={reciterSearch}
                    onChange={(e) => setReciterSearch(e.target.value)}
                    placeholder="Search reciter name..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Reciters List */}
                <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-stone-800/80 pr-1">
                  {filteredReciters.map((rec) => {
                    const isSelected = rec.id === selectedReciterId;
                    return (
                      <div
                        key={rec.id}
                        className={`p-2 rounded-xl flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectReciter(rec)}
                          className="flex-1 text-left flex items-center gap-2 cursor-pointer"
                        >
                          <span className="text-xs text-slate-800 dark:text-stone-200 block truncate">
                            {rec.reciter_name} {rec.style && `(${rec.style})`}
                          </span>
                        </button>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePreviewReciter(rec.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Preview reciter audio"
                          >
                            {playingPreviewId === rec.id ? (
                              <Pause className="w-3 h-3 text-blue-600" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                          </button>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-stone-800 bg-slate-50/70 dark:bg-stone-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset text settings</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
