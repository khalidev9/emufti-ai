import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ReferencePanel } from '../components/layout/ReferencePanel';
import { WelcomeScreen } from '../components/chat/WelcomeScreen';
import { ChatMessage } from '../components/chat/ChatMessage';
import { MessageComposer } from '../components/chat/MessageComposer';
import { ShareModal, ReportModal } from '../components/chat/Modals';
import { QuotaModal } from '../components/chat/QuotaModal';
import { PlanActivationBanner } from '../components/chat/PlanActivationBanner';
import { RamadanOfferBanner, isRamadanBannerScheduledVisible } from '../components/chat/RamadanOfferBanner';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { ConversationHistoryDrawer } from '../components/chat/ConversationHistoryDrawer';
import { useChat } from '../context/ChatContext';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const promptParam = searchParams.get('prompt');
  const navigate = useNavigate();
  const {
    conversations,
    activeConversation,
    selectConversation,
    createNewChat,
    messages,
    sendMessage,
    isQuotaModalOpen,
    setIsQuotaModalOpen,
    userPlan,
    dailyUsage,
    dailyLimit,
    setTargetLanguage,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isConversationHistoryOpen, setIsConversationHistoryOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const handledPromptRef = useRef<string | null>(null);

  // Monitor window.visualViewport for mobile virtual keyboards (Samsung, iPhone, Android)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const updateHeight = () => {
      if (window.visualViewport) {
        const vHeight = window.visualViewport.height;
        setViewportHeight(vHeight);
        const isKb = vHeight < window.innerHeight * 0.85;
        setIsKeyboardOpen(isKb || isInputFocused);
        if (isNearBottomRef.current) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    window.visualViewport.addEventListener('resize', updateHeight);
    window.visualViewport.addEventListener('scroll', updateHeight);
    updateHeight();

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('scroll', updateHeight);
    };
  }, [isInputFocused]);

  // Auto-submit prompt from URL query parameter (e.g. from "Waydii EMufti" Ayah action)
  useEffect(() => {
    if (promptParam && promptParam !== handledPromptRef.current) {
      handledPromptRef.current = promptParam;
      setSearchParams({}, { replace: true });
      if (!activeConversation) {
        createNewChat(promptParam).then((newId) => {
          navigate(`/chat/${newId}`, { replace: true });
        });
      } else {
        sendMessage(promptParam);
      }
    }
  }, [promptParam, activeConversation, createNewChat, sendMessage, navigate, setSearchParams]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // User is considered near bottom if within 120px of scroll height
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  };

  // Sync route param with active conversation
  useEffect(() => {
    if (conversationId) {
      if (activeConversation?.id !== conversationId) {
        selectConversation(conversationId);
      }
    } else if (activeConversation) {
      navigate(`/chat/${activeConversation.id}`, { replace: true });
    }
  }, [conversationId, activeConversation?.id, conversations.length, selectConversation, navigate]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Smart auto scroll to bottom without interrupting user reading previous messages
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  const handleSelectSuggestedPrompt = async (
    prompt: string,
    targetLanguage?: 'auto' | 'en' | 'so' | 'ar',
    contextPrompt?: string
  ) => {
    isNearBottomRef.current = true;
    setTimeout(() => scrollToBottom('auto'), 50);
    if (targetLanguage && targetLanguage !== 'auto') {
      setTargetLanguage(targetLanguage);
    }
    if (!activeConversation) {
      const newId = await createNewChat(prompt, undefined, targetLanguage, contextPrompt);
      navigate(`/chat/${newId}`);
    } else {
      await sendMessage(prompt, targetLanguage, contextPrompt);
    }
  };

  return (
    <div
      className="flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden w-full max-w-full overflow-x-hidden box-border relative"
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
    >
      {/* Collapsible ChatGPT-style Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace (smoothly transitions between sidebar open and closed) */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out bg-slate-50 w-full max-w-full overflow-x-hidden box-border ${
          isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        {/* ChatGPT Style Clean Header */}
        <Header
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenConversationHistory={() => setIsConversationHistoryOpen(true)}
        />

        {/* Center Container + Right Quran Reader / Reference Panel */}
        <div className="flex-1 flex overflow-hidden relative min-h-0 bg-white dark:bg-slate-950 w-full max-w-full overflow-x-hidden box-border">
          {/* Main Messages & Composer Column */}
          <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0 relative bg-white dark:bg-slate-950 w-full max-w-full overflow-x-hidden box-border">
            {/* Scrollable Conversation Content Area */}
            <main
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden chat-scrollbar overscroll-contain bg-white dark:bg-slate-950 w-full max-w-full box-border"
            >
              {/* Ramadan Bundle Rotating Banner & Activation Notice */}
              <div className="max-w-3xl w-full mx-auto px-3 sm:px-4 pt-2">
                <PlanActivationBanner />
                {isRamadanBannerScheduledVisible() && <RamadanOfferBanner />}
              </div>

              {/* Conversation Messages or Welcome Screen */}
              {messages.length === 0 ? (
                <WelcomeScreen onSelectPrompt={handleSelectSuggestedPrompt} />
              ) : (
                <div className="flex-1 max-w-3xl w-full mx-auto px-2.5 sm:px-4 py-3 sm:py-4 space-y-3.5 sm:space-y-4 pb-36 sm:pb-44">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onOpenReportModal={(id) => setReportMessageId(id)}
                      onOpenShareModal={() => setIsShareModalOpen(true)}
                    />
                  ))}
                  {/* Dedicated scroll clearance spacer so messages are never hidden behind the input bar */}
                  <div ref={messagesEndRef} className="h-24 sm:h-32 shrink-0 pointer-events-none" />
                </div>
              )}
            </main>

            {/* ChatGPT Style Docked Composer: sits directly below messages with solid backdrop, NEVER overlaps messages */}
            <div
              className={`shrink-0 z-20 sticky bottom-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 transition-all duration-150 ${
                !isKeyboardOpen
                  ? 'pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-3'
                  : 'pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]'
              }`}
            >
              <MessageComposer
                onSendMessage={(prompt, contextPrompt) => {
                  isNearBottomRef.current = true;
                  setTimeout(() => scrollToBottom('auto'), 50);
                  sendMessage(prompt, undefined, contextPrompt);
                }}
                isKeyboardOpen={isKeyboardOpen}
                onFocus={() => {
                  setIsInputFocused(true);
                  setIsKeyboardOpen(true);
                }}
                onBlur={() => {
                  setIsInputFocused(false);
                  setTimeout(() => {
                    if (typeof window !== 'undefined' && window.visualViewport) {
                      setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.85);
                    } else {
                      setIsKeyboardOpen(false);
                    }
                  }, 150);
                }}
              />
            </div>
          </div>

          {/* Optional Right Islamic Reference Inspector */}
          <ReferencePanel />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar: visible only on phones when virtual keyboard is closed */}
      <BottomNavigation isHidden={isKeyboardOpen} />

      {/* Conversation History Drawer (Clock icon inside Chat header) */}
      <ConversationHistoryDrawer
        isOpen={isConversationHistoryOpen}
        onClose={() => setIsConversationHistoryOpen(false)}
      />

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <ReportModal
        isOpen={Boolean(reportMessageId)}
        messageId={reportMessageId}
        onClose={() => setReportMessageId(null)}
      />

      <QuotaModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        currentPlan={userPlan}
        currentUsage={dailyUsage.count}
        dailyLimit={dailyLimit}
        resetsAt={(dailyUsage as any).resetsAt}
      />
    </div>
  );
};
