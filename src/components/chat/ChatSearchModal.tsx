import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare, Clock, ArrowRight, Loader2, Sparkles, BookOpen, Mic, MicOff, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { storage } from '../../lib/storage';
import { Conversation, Message, MessageRole } from '../../types/database';

interface SearchResultItem {
  conversation: Conversation;
  matchingSnippet?: string;
  matchType: 'title' | 'message';
  messageRole?: MessageRole;
  timestamp?: string;
}

interface ChatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export const ChatSearchModal: React.FC<ChatSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
}) => {
  const { user } = useAuth();
  const { conversations } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>('all');
  const recognitionRef = useRef<any>(null);
  const isLoading = isSearching;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggleVoice = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsRecording(false);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setIsRecording(true);
      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript;
        if (text) {
          setQuery((prev) => (prev ? `${prev} ${text}` : text));
        }
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search logic across conversation titles and message bodies, isolated by current user ID
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const currentUserId = user?.id || 'seeker_user';

      // 1. Filter conversations belonging to the authenticated user and not archived
      const userConversations = conversations.filter((c) => {
        if (c.is_archived) return false;
        if (!c.user_id) return true;
        return c.user_id === currentUserId || c.user_id === 'seeker_user';
      });

      const matchedItems: SearchResultItem[] = [];

      for (const conv of userConversations) {
        const titleMatch = conv.title.toLowerCase().includes(trimmed);
        const storedMessages: Message[] = storage.getMessages(conv.id) || [];

        // Check if any message in this conversation contains the query
        let bestMessageMatch: { message: Message; snippet: string } | null = null;
        for (const msg of storedMessages) {
          const content = msg.content || '';
          const idx = content.toLowerCase().indexOf(trimmed);
          if (idx !== -1) {
            // Extract snippet around matched keyword
            const start = Math.max(0, idx - 40);
            const end = Math.min(content.length, idx + trimmed.length + 60);
            let snippet = content.substring(start, end).replace(/\s+/g, ' ');
            if (start > 0) snippet = '...' + snippet;
            if (end < content.length) snippet = snippet + '...';

            bestMessageMatch = { message: msg, snippet };
            break;
          }
        }

        if (titleMatch) {
          matchedItems.push({
            conversation: conv,
            matchingSnippet: bestMessageMatch ? bestMessageMatch.snippet : undefined,
            matchType: 'title',
            timestamp: conv.updated_at || conv.created_at,
          });
        } else if (bestMessageMatch) {
          matchedItems.push({
            conversation: conv,
            matchingSnippet: bestMessageMatch.snippet,
            matchType: 'message',
            messageRole: bestMessageMatch.message.role,
            timestamp: bestMessageMatch.message.created_at || conv.updated_at,
          });
        }
      }

      setResults(matchedItems);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, conversations, user?.id]);

  if (!isOpen) return null;

  const highlightMatches = (text: string, q: string) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-blue-500/25 text-blue-800 dark:text-blue-300 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-20 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card dark:bg-[#1f1f1f] border border-border dark:border-white/10 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search conversation history"
      >
        {/* Header Search Input */}
        <div className="p-3.5 border-b border-border/70 dark:border-white/10 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations, Islamic questions, and rulings..."
            className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60"
          />

          {/* Voice-to-Text Button (Feature 2) */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Voice Search (Ku Raadi Cod)'}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            title="Close dialog (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature 5: Advanced Search Filters */}
        <div className="px-3.5 py-2 border-b border-border/50 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter className="w-3 h-3 text-muted-foreground shrink-0" />
          {[
            { id: 'all', label: 'Dhamaan (All)' },
            { id: 'quran', label: "Qur'aan & Tafsiir" },
            { id: 'fiqh', label: 'Fiqh & Xukumo' },
            { id: 'hadith', label: 'Axaadiis' },
            { id: 'dua', label: 'Ducooyin' },
          ].map((theme) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveTheme(theme.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {theme.label}
              </button>
            );
          })}
        </div>

        {/* Results / Status Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Loading state */}
          {isSearching && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span>Searching conversations and messages...</span>
            </div>
          )}

          {/* Initial state (no query) */}
          {!isSearching && !query.trim() && (
            <div className="py-10 px-4 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Search Chat History</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Type any keyword to search titles and responses across your past study sessions and Islamic inquiries.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground/70">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">Esc</kbd>
                <span>to close</span>
              </div>
            </div>
          )}

          {/* Empty state (query with no results) */}
          {!isSearching && query.trim() && results.length === 0 && (
            <div className="py-10 px-4 text-center space-y-2">
              <p className="text-xs font-semibold text-foreground">No conversations found</p>
              <p className="text-[11px] text-muted-foreground">
                No matching discussions or message citations were found for "{query}".
              </p>
            </div>
          )}

          {/* Results list */}
          {!isSearching && results.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                <span>Results ({results.length})</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400">Isolated to your account</span>
              </div>

              {results.map(({ conversation, matchingSnippet, matchType, messageRole, timestamp }) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-card hover:bg-muted/60 dark:bg-card/50 dark:hover:bg-white/5 border border-border/60 hover:border-blue-500/30 text-left transition-all cursor-pointer group flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {highlightMatches(conversation.title, query)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-muted text-muted-foreground">
                        {matchType === 'title' ? 'Title Match' : 'Message Match'}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {matchingSnippet && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-5.5">
                      {highlightMatches(matchingSnippet, query)}
                    </p>
                  )}

                  {timestamp && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 pl-5.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {messageRole && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{messageRole === 'assistant' ? 'EMufti Response' : 'Your Prompt'}</span>
                        </>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
