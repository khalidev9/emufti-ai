import React from 'react';
import {
  X,
  BookOpen,
  Scroll,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  BookmarkCheck,
  Compass,
  FileText,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

export const ReferencePanel: React.FC = () => {
  const {
    isReferencePanelOpen,
    closeReference,
    selectedCitation,
    messages,
    openReference,
  } = useChat();
  const { isPaidPlan } = useAuth();

  if (!isReferencePanelOpen || !isPaidPlan) return null;

  const allCitations = messages.flatMap((m) => m.citations || []);

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        onClick={closeReference}
        aria-hidden="true"
      />

      {/* Main Slide-over Panel (Seamless Light & Dark Mode) */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 max-w-[92vw] lg:static lg:z-20 lg:w-96 lg:max-w-none border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col h-full shadow-2xl lg:shadow-none overflow-hidden transition-all duration-300 animate-in slide-in-from-right duration-200 select-none box-border"
        aria-label="Islamic References and Sources"
      >
        {/* =============================================================== */}
        {/* 1. ELEGANT HEADER: Brand Emblem, Title, Subtitle, Close Button  */}
        {/* =============================================================== */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
                Islamic References & Sources
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                Verified Quran, Hadith & Scholarly Corpus
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeReference}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close references panel"
            aria-label="Close references panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =============================================================== */}
        {/* 2. SCROLLABLE REFERENCES CONTENT                                */}
        {/* =============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
          {/* Active Selected Citation Card Spotlight */}
          {selectedCitation ? (
            <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-blue-50/50 dark:from-slate-800/90 dark:via-slate-850 dark:to-slate-800/60 border border-blue-200 dark:border-blue-900/60 p-4 space-y-3 shadow-xs">
              {/* Top Verified Header & Type Tag */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedCitation.type === 'quran' ? (
                    <>
                      <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Quranic Ayah</span>
                    </>
                  ) : (
                    <>
                      <Scroll className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Hadith Citation</span>
                    </>
                  )}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Source</span>
                </span>
              </div>

              {/* Reference Title */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {selectedCitation.reference}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Primary Source: {selectedCitation.source || 'Classical Islamic Corpus'}
                </span>
              </div>

              {/* Arabic Scripture in Authentic Traditional Calligraphic Styling */}
              {selectedCitation.arabic_text && (
                <div
                  dir="rtl"
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700/80 shadow-2xs"
                >
                  <p className="font-arabic text-slate-900 dark:text-slate-50 text-base sm:text-lg leading-loose text-center">
                    « {selectedCitation.arabic_text} »
                  </p>
                </div>
              )}

              {/* Translation Text */}
              {selectedCitation.translation && (
                <blockquote className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border-l-4 border-l-blue-600 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{selectedCitation.translation}"
                </blockquote>
              )}

              {/* External Source Link Button */}
              {selectedCitation.url && (
                <a
                  href={selectedCitation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xs"
                >
                  <span>Open Primary Islamic Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-slate-800/40 border border-blue-200/60 dark:border-slate-800 text-center space-y-1.5">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto opacity-80" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                No Scripture Highlighted
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Click any citation pill inside an AI response or select from the list below to inspect verified commentary.
              </p>
            </div>
          )}

          {/* Active Citations In This Conversation List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Conversation Citations ({allCitations.length})</span>
              </h4>
            </div>

            {allCitations.length > 0 ? (
              <div className="space-y-2">
                {allCitations.map((cite, idx) => {
                  const isCurrent = selectedCitation?.id === cite.id || selectedCitation?.reference === cite.reference;
                  return (
                    <button
                      key={`${cite.id || idx}-${idx}`}
                      type="button"
                      onClick={() => openReference(cite)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 shadow-xs ring-2 ring-blue-500/15'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {cite.type === 'quran' ? (
                            <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          ) : (
                            <Scroll className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {cite.reference}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {cite.source || 'Authentic Islamic Corpus'}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 uppercase tracking-wider">
                        {cite.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                  No scriptural citations have been queried in this conversation yet.
                </p>
              </div>
            )}
          </div>

          {/* Quick Scholarly Glossary & Methodology Guide */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Scholarly Terminology Guide</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Ikhtilāf (الاختلاف):
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Legitimate interpretative differences among the four recognized Sunni schools (Hanafi, Maliki, Shafi'i, Hanbali) representing mercy and intellectual depth.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Hadith Authentication Gradings:
                </span>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-0.5 font-medium">
                  <p>• <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Ṣaḥīḥ (صحيح):</strong> Authentic, rigorous unbroken chain of trustworthy narrators.</p>
                  <p>• <strong className="text-blue-700 dark:text-blue-400 font-bold">Ḥasan (حسن):</strong> Sound, reliable narration meeting authoritative standard.</p>
                  <p>• <strong className="text-amber-700 dark:text-amber-400 font-bold">Ḍa'īf (ضعيف):</strong> Weak chain; not utilized as primary proof in core rulings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
