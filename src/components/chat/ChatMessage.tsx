import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  AlertTriangle,
  Share2,
  BookOpen,
  Scroll,
  Sparkles,
  Loader2,
  ShieldCheck,
  ExternalLink,
  MoreHorizontal,
  Volume2,
  VolumeX,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { Message, Citation } from '../../types/database';
import { isArabic, isPredominantlyArabic, formatMessageTime } from '../../lib/utils';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../lib/storage';
import { Logo } from '../common/Logo';
import { UserAvatar } from '../common/UserAvatar';

interface ChatMessageProps {
  message: Message;
  onOpenReportModal: (messageId: string) => void;
  onOpenShareModal: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenReportModal,
  onOpenShareModal,
}) => {
  const { regenerateMessage, submitFeedback, saveToKnowledge, openReference, isGenerating } = useChat();
  const { user, profile, activePlan, isPaidPlan } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsLang, setTtsLang] = useState<'auto' | 'so' | 'ar' | 'en'>('auto');
  const [showTtsSelector, setShowTtsSelector] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[-*]\s+/g, '')
      .replace(/«|»|"/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleToggleSpeech = (chosenLang?: 'auto' | 'so' | 'ar' | 'en') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const langToUse = chosenLang || ttsLang;
    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(message.content);
    const utterance = new SpeechSynthesisUtterance(cleaned || message.content);

    let targetLocale = 'en-US';
    if (langToUse === 'ar' || (langToUse === 'auto' && (message.language === 'ar' || isArabic(cleaned)))) {
      targetLocale = 'ar-SA';
    } else if (langToUse === 'so' || (langToUse === 'auto' && message.language === 'so')) {
      targetLocale = 'so-SO';
    } else {
      targetLocale = 'en-US';
    }

    utterance.lang = targetLocale;
    utterance.rate = 1.0;

    // Pick best available voice for language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = targetLocale.split('-')[0];
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const isUser = message.role === 'user';
  const messageIsArabic = message.language === 'ar' || isPredominantlyArabic(message.content);

  const handleCopy = () => {
    // If the user has highlighted a specific passage or quotation, copy that; otherwise copy entire message
    const selection = typeof window !== 'undefined' ? window.getSelection()?.toString() : '';
    const textToCopy = selection && selection.trim().length > 0 ? selection.trim() : message.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await saveToKnowledge(message, 'General');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Markdown and Islamic Scriptural Text Formatter
  const renderFormattedContent = (content: string) => {
    if (!content || !content.trim()) return null;

    try {
      const lines = content.split('\n');
      const elements: React.ReactNode[] = [];
      let inTable = false;
      let tableRows: string[][] = [];

      const flushTable = (key: number) => {
        if (tableRows.length > 0) {
          const header = tableRows[0];
          const body = tableRows.slice(2); // row 1 is separator |---|
          elements.push(
            <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-border/80">
              <table className="min-w-full text-xs sm:text-sm text-left">
                <thead className="bg-muted/70 text-foreground font-semibold">
                  <tr>
                    {header.map((col, idx) => (
                      <th key={idx} className="px-3.5 py-2.5 border-b border-border">
                        {col.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-foreground/90">
                          {renderInlineFormatting(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableRows = [];
          inTable = false;
        }
      };

      lines.forEach((line, index) => {
        // Table row detection
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          inTable = true;
          const cols = line.split('|').slice(1, -1);
          tableRows.push(cols);
          return;
        } else if (inTable) {
          flushTable(index);
        }

        // Headings
        if (line.startsWith('### ')) {
          elements.push(
            <h3 key={index} className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-300 mt-5 mb-2 tracking-tight flex items-center gap-1.5">
              <span className="w-1 h-4 rounded-full bg-blue-600 inline-block shrink-0" />
              <span>{renderInlineFormatting(line.replace('### ', ''))}</span>
            </h3>
          );
        } else if (line.startsWith('#### ')) {
          elements.push(
            <h4 key={index} className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 mt-3.5 mb-1.5">
              {renderInlineFormatting(line.replace('#### ', ''))}
            </h4>
          );
        } else if (line.startsWith('> [!NOTE]') || line.startsWith('> [!IMPORTANT]')) {
          const isNote = line.includes('NOTE');
          elements.push(
            <div
              key={index}
              className={`my-3 p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                isNote
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-slate-100'
                  : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-slate-900 dark:text-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                {line.replace(/>\s*\[!(NOTE|IMPORTANT)\]\s*/, '')}
              </div>
            </div>
          );
        } else if (line.startsWith('> ')) {
          // Visually distinguish Quranic Verse, Hadith Citation, or Tafsiir
          const quoteText = line.replace('> ', '');
          const quoteIsArabic = isPredominantlyArabic(quoteText) || isArabic(quoteText);
          const lower = quoteText.toLowerCase();
          const isHadith = lower.includes('hadith') || lower.includes('xadiis') || lower.includes('bukhari') || lower.includes('muslim') || lower.includes('tirmidhi') || lower.includes('abu dawud') || lower.includes('rasuul') || lower.includes('ﷺ');
          const isTafsir = lower.includes('tafsir') || lower.includes('tafsiir') || lower.includes('ibn kathir') || lower.includes('qurtubi') || lower.includes('tabari') || lower.includes('sheikh') || lower.includes('umal') || lower.includes('dirir');

          if (isHadith) {
            elements.push(
              <blockquote
                key={index}
                dir={quoteIsArabic ? 'rtl' : 'ltr'}
                className="my-3.5 px-4 sm:px-5 py-3 rounded-2xl border-l-4 border-amber-500 bg-amber-50/80 dark:bg-amber-950/25 text-slate-900 dark:text-slate-100 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Scroll className="w-3.5 h-3.5" />
                  <span>Hadith Citation / Xadiis Sugan</span>
                </div>
                <div className={quoteIsArabic ? 'font-arabic text-right text-base sm:text-lg leading-loose text-amber-950 dark:text-amber-100' : 'text-xs sm:text-sm italic leading-relaxed'}>
                  {renderInlineFormatting(quoteText)}
                </div>
              </blockquote>
            );
          } else if (isTafsir) {
            elements.push(
              <blockquote
                key={index}
                dir={quoteIsArabic ? 'rtl' : 'ltr'}
                className="my-3.5 px-4 sm:px-5 py-3 rounded-2xl border-l-4 border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/25 text-slate-900 dark:text-slate-100 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tafsiir / Scholarly Commentary</span>
                </div>
                <div className={quoteIsArabic ? 'font-arabic text-right text-base sm:text-lg leading-loose text-indigo-950 dark:text-indigo-100' : 'text-xs sm:text-sm leading-relaxed'}>
                  {renderInlineFormatting(quoteText)}
                </div>
              </blockquote>
            );
          } else {
            // Quranic Verse Scripture Card (Modern sleek container)
            elements.push(
              <blockquote
                key={index}
                dir={quoteIsArabic ? 'rtl' : 'ltr'}
                className="my-3.5 p-4 sm:p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/25 border border-blue-200/70 dark:border-blue-900/50 text-slate-900 dark:text-slate-100 shadow-xs space-y-2.5 border-l-4 border-l-blue-600 transition-all"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Quranic Verse / Aayadda Qur'aanka</span>
                </div>
                <div className={quoteIsArabic ? 'font-arabic text-center text-lg sm:text-xl leading-loose text-slate-900 dark:text-slate-50 py-1' : 'text-xs sm:text-sm italic leading-relaxed'}>
                  {renderInlineFormatting(quoteText)}
                </div>
              </blockquote>
            );
          }
        } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          // Unordered List item
          elements.push(
            <li key={index} className="ml-4 list-disc text-xs sm:text-sm md:text-[15px] text-slate-800 dark:text-slate-200 my-1 leading-relaxed">
              {renderInlineFormatting(line.trim().substring(2))}
            </li>
          );
        } else if (/^\d+\.\s/.test(line.trim())) {
          // Numbered List / Section item (✦ 1. ...)
          const match = line.trim().match(/^(\d+)\.\s(.*)$/);
          elements.push(
            <div key={index} className="flex items-start gap-2 text-xs sm:text-sm md:text-[15px] text-slate-900 dark:text-white font-semibold my-2.5 leading-relaxed">
              <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">✦</span>
              <div className="flex-1 font-semibold">
                {match ? `${match[1]}. ` : ''}
                {renderInlineFormatting(match ? match[2] : line)}
              </div>
            </div>
          );
        } else if (line.trim() === '') {
          elements.push(<div key={index} className="h-2" />);
        } else {
          // Regular paragraph (with RTL Arabic detection)
          const lineIsArabic = messageIsArabic || isPredominantlyArabic(line);
          elements.push(
            <p
              key={index}
              dir={lineIsArabic ? 'rtl' : 'ltr'}
              className={`leading-relaxed ${
                lineIsArabic
                  ? 'font-arabic text-right text-base sm:text-lg leading-loose my-2 text-slate-900 dark:text-slate-50'
                  : 'text-xs sm:text-sm md:text-[15px] my-2 text-slate-800 dark:text-slate-200'
              }`}
            >
              {renderInlineFormatting(line)}
            </p>
          );
        }
      });

      if (inTable) {
        flushTable(lines.length);
      }

      if (elements.length === 0) {
        return (
          <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
            {content}
          </div>
        );
      }

      return elements;
    } catch (parseErr) {
      console.warn('[ChatMessage] Markdown parsing error, rendering fallback text:', parseErr);
      return (
        <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
          {content}
        </div>
      );
    }
  };

  // Helper for bold, italic, inline code, and clickable citation badges
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[Surah.*?\]|\[.*?al-Bukhari.*?\]|\[Sahih.*?\]|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-700 dark:text-slate-300">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-700 dark:text-blue-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Markdown link [title](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch && !part.startsWith('[Surah')) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline inline-flex items-center gap-0.5 mx-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        const citationText = part.slice(1, -1);
        const isQuran = citationText.toLowerCase().includes('surah');
        return (
          <button
            key={i}
            onClick={() =>
              openReference({
                id: `inline-${i}`,
                type: isQuran ? 'quran' : 'hadith',
                reference: citationText,
                source: isQuran ? 'Holy Quran' : 'Hadith Corpus',
                verified: true,
              })
            }
            className="inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium text-[11px] border border-blue-200 dark:border-blue-800 transition-colors"
            title="View verified reference"
          >
            {isQuran ? <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" /> : <Scroll className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
            <span>{citationText}</span>
          </button>
        );
      }
      return part;
    });
  };

  // Helper to detect if user message originates from a Quran Ayah consultation
  const quranAyahContext = isUser
    ? (() => {
        const match = message.content.match(/^\[Surah\s+([^()]+)\s*\((\d+):(\d+)\)\s*(?:•\s*([^\]]+))?\]/);
        if (!match) return null;
        return {
          surahName: match[1].trim(),
          surahNumber: parseInt(match[2], 10),
          ayahNumber: parseInt(match[3], 10),
          category: match[4]?.trim() || 'Waydii EMufti',
        };
      })()
    : null;

  // 1. User Message (ChatGPT style clean conversational bubble)
  if (isUser) {
    const userIsArabic = message.language === 'ar' || isPredominantlyArabic(message.content);
    return (
      <div className="w-full max-w-full overflow-x-hidden box-border py-2 flex flex-col items-end animate-in fade-in slide-in-from-bottom-1 duration-150">
        <div className={`flex items-start justify-end gap-2 max-w-full ${userIsArabic ? 'flex-row-reverse' : ''}`}>
          <div
            dir={userIsArabic ? 'rtl' : 'ltr'}
            className={`max-w-[88%] sm:max-w-[78%] bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-3xl rounded-br-md px-4.5 sm:px-5 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs ${
              userIsArabic ? 'font-arabic text-right text-base sm:text-lg leading-loose' : ''
            }`}
          >
            {quranAyahContext && (
              <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                  <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>
                    Surah {quranAyahContext.surahName} ({quranAyahContext.surahNumber}:{quranAyahContext.ayahNumber})
                  </span>
                  <span className="text-blue-400">•</span>
                  <span>{quranAyahContext.category}</span>
                </div>
              </div>
            )}
            {message.content}
            <div className={`flex items-center justify-end mt-1 text-[10px] text-slate-400 dark:text-slate-500 select-none ${userIsArabic ? 'text-left' : 'text-right'}`}>
              <span>{formatMessageTime(message.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Assistant Message (ChatGPT style clean conversational layout without harsh container box)
  return (
    <div className="w-full max-w-full overflow-x-hidden box-border py-3.5 group flex items-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-1 duration-200" dir={messageIsArabic ? 'rtl' : 'ltr'}>
      {/* Assistant Circular Blue Emblem on the left */}
      <div className="shrink-0 mt-0.5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-blue-500/20 select-none overflow-hidden p-0.5">
          <img
            src="/logo-frontend.png"
            alt="EMufti AI"
            className="w-full h-full object-contain bg-white rounded-full"
          />
          <span className="sr-only">E</span>
        </div>
      </div>

      {/* Main Assistant Body (Clean ChatGPT conversational flow without heavy card box) */}
      <div className="flex-1 min-w-0 space-y-3.5 pt-0.5">
        {/* State A: Generating response indicator */}
        {message.status === 'generating' && !message.content ? (
          <div className="py-2.5 space-y-2.5">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-xs shadow-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[12px] text-blue-900 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>
                  {t(
                    'chat.generating',
                    messageIsArabic
                      ? 'جارٍ البحث في المصادر الإسلامية...'
                      : message.language === 'so'
                      ? 'Waxaan baadhayaa ilo diini ah...'
                      : 'Searching Islamic sources...'
                  )}
                </span>
              </div>
            </div>
            <div className="h-1 w-44 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full animate-pulse" />
            </div>
          </div>
        ) : message.status === 'failed' ? (
          /* State B: Error Alert with interactive Retry button */
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-destructive" />
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">
                  {messageIsArabic ? 'تعذر إتمام الإجابة' : 'Codsiga lama dhammaystiri karin (Inquiry Error)'}
                </p>
                <p className="text-[11px] text-destructive leading-relaxed">
                  {message.error_message || (messageIsArabic ? 'الخدمة مشغولة حالياً، يرجى المحاولة مرة أخرى.' : 'Adeeggu hadda wuu mashquulsan yahay. Fadlan dib u tijaabi.')}
                </p>
              </div>
            </div>
            <button
              disabled={isGenerating}
              onClick={() => regenerateMessage(message.id)}
              className="px-3 py-1.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Isku day mar kale / Retry"
              aria-label="Retry failed request"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              <span>{isGenerating ? (messageIsArabic ? 'جاري الإعادة...' : 'Dib u tijaabinaya...') : (messageIsArabic ? 'إعادة المحاولة' : 'Isku day mar kale / Retry')}</span>
            </button>
          </div>
        ) : !message.content?.trim() && message.status !== 'generating' ? (
          /* State C-Empty: No content received fallback UI with Retry button */
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {messageIsArabic
                  ? 'لم يتم استلام نص الإجابة بشكل صحيح. يرجى الضغط على زر إعادة المحاولة أدناه.'
                  : message.language === 'so'
                  ? 'Jawaabta si buuxda looma helin. Fadlan riix badhanka "Isku day mar kale / Retry" ee hoose.'
                  : 'No response text received. Please click the Retry button below to regenerate.'}
              </span>
            </div>
            <button
              disabled={isGenerating}
              onClick={() => regenerateMessage(message.id)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              <span>{isGenerating ? (messageIsArabic ? 'جاري الإعادة...' : 'Dib u tijaabinaya...') : (messageIsArabic ? 'إعادة المحاولة' : 'Isku day mar kale / Retry')}</span>
            </button>
          </div>
        ) : (
          /* State C: Formatted Markdown Answer (Flows cleanly on canvas) */
          <div className={`prose max-w-none text-slate-800 dark:text-slate-100 leading-relaxed text-sm sm:text-base ${messageIsArabic ? 'font-arabic text-right leading-loose' : ''}`}>
            {renderFormattedContent(message.content)}
            {message.status === 'generating' && (
              <span className="inline-flex items-center ml-1 align-baseline">
                <span className="inline-block w-2 h-4 rounded-xs bg-blue-600 animate-pulse shadow-xs shadow-blue-500/50" />
              </span>
            )}
          </div>
        )}

        {/* Cited Sources Row: Exclusive to Pro and Premium plans, conforming to user show_references preference */}
        {isPaidPlan && (storage.getSettings(user?.id || 'seeker_user')?.show_references ?? true) && message.citations && message.citations.length > 0 && (
          <div className={`pt-2 flex flex-wrap items-center gap-1.5 ${messageIsArabic ? 'justify-end' : ''}`}>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {messageIsArabic ? 'المصادر المستشهد بها:' : 'Cited Sources:'}
            </span>
            {message.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => openReference(c)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-medium transition-colors cursor-pointer"
                title="Click to view reference details"
              >
                {c.type === 'quran' ? <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" /> : <Scroll className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                <span>{c.reference}</span>
              </button>
            ))}
            {message.webSearchUsed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Web Search Verified</span>
              </span>
            )}
          </div>
        )}

        {/* Web Search indicator for users who don't have citations or are on standard plan */}
        {message.webSearchUsed && (!message.citations || message.citations.length === 0 || !isPaidPlan) && (
          <div className={`pt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 ${messageIsArabic ? 'justify-end' : ''}`}>
            <Globe className="w-3 h-3" />
            <span className="font-medium">
              {messageIsArabic ? 'تم التحقق بالبحث عبر الويب' : message.language === 'so' ? 'Waxaa lagu xaqiijiyay raadinta web-ka' : 'Verified via automated web search'}
            </span>
          </div>
        )}

        {/* Action Bar (ChatGPT-style subtle toolbar below response) */}
        {message.status === 'completed' && (
          <div className="pt-2 mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 select-none">
            {/* Left: Copy, Listen, Regenerate, ThumbsUp, ThumbsDown */}
            <div className={`flex items-center gap-0.5 sm:gap-1 ${messageIsArabic ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy answer"
                aria-label="Copy answer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  onClick={() => handleToggleSpeech()}
                  className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 ${
                    isSpeaking ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={isSpeaking ? 'Stop listening' : 'Listen to answer (TTS)'}
                  aria-label={isSpeaking ? 'Stop listening' : 'Listen to answer'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="flex items-center gap-0.5 ml-0.5" aria-hidden="true">
                        <span className="w-0.5 h-2 bg-blue-600 animate-pulse" />
                        <span className="w-0.5 h-3 bg-blue-600 animate-pulse delay-75" />
                        <span className="w-0.5 h-1.5 bg-blue-600 animate-pulse delay-150" />
                      </span>
                    </>
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTtsSelector(!showTtsSelector)}
                  className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
                  title="Select voice language"
                  aria-label="Select voice language"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {showTtsSelector && (
                  <div className="absolute bottom-full left-0 mb-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1 z-30 text-xs space-y-0.5 animate-in fade-in">
                    {[
                      { id: 'auto', label: 'Auto Detect' },
                      { id: 'so', label: 'Somali (Soomaali)' },
                      { id: 'ar', label: 'Arabic (العربية)' },
                      { id: 'en', label: 'English (US)' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setTtsLang(l.id as any);
                          setShowTtsSelector(false);
                          if (isSpeaking) {
                            handleToggleSpeech(l.id as any);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between cursor-pointer ${
                          ttsLang === l.id ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{l.label}</span>
                        {ttsLang === l.id && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isGenerating}
                onClick={() => regenerateMessage(message.id)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-40"
                title="Regenerate answer"
                aria-label="Regenerate answer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => submitFeedback(message.id, 'helpful')}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  message.feedback === 'helpful' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Helpful answer"
                aria-label="Helpful answer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => submitFeedback(message.id, 'unhelpful')}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  message.feedback === 'unhelpful' ? 'text-destructive font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Not helpful"
                aria-label="Not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Bookmark and Timestamp */}
            <div className={`flex items-center gap-2 ${messageIsArabic ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={handleSave}
                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  saved ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Save bookmark"
                aria-label="Save bookmark"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] text-slate-400 dark:text-slate-500 select-none">
                {formatMessageTime(message.created_at)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

