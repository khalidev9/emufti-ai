import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Conversation, Message, Citation, ReportCategory, PlanSlug, normalizePlanSlug } from '../types/database';
import { useAuth } from './AuthContext';
import { storage } from '../lib/storage';
import { generateIslamicResponse, detectQueryLanguage } from '../lib/gemini';
import { extractCitations, truncate } from '../lib/utils';
import { supabase, isSupabaseConfigured, isUuid } from '../lib/supabase';
import { trackFeatureUsage } from '../lib/visitorTracking';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isGenerating: boolean;
  targetLanguage: 'auto' | 'en' | 'so' | 'ar';
  setTargetLanguage: (lang: 'auto' | 'en' | 'so' | 'ar') => void;
  selectedCitation: Citation | null;
  isReferencePanelOpen: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredConversations: Conversation[];
  isQuotaModalOpen: boolean;
  setIsQuotaModalOpen: (open: boolean) => void;
  userPlan: PlanSlug;
  dailyUsage: { count: number; date: string };
  dailyLimit: number;
  createNewChat: (initialPrompt?: string, topic?: string, overrideLanguage?: 'auto' | 'en' | 'so' | 'ar', contextPrompt?: string) => Promise<string>;
  selectConversation: (id: string) => void;
  sendMessage: (prompt: string, overrideLanguage?: 'auto' | 'en' | 'so' | 'ar', contextPrompt?: string) => Promise<void>;
  regenerateMessage: (messageId?: string) => Promise<void>;
  stopGeneration: () => void;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  pinConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  saveToKnowledge: (message: Message, topic?: string) => Promise<void>;
  submitFeedback: (messageId: string, rating: 'helpful' | 'unhelpful') => Promise<void>;
  reportMessage: (messageId: string, category: ReportCategory, description: string) => Promise<void>;
  openReference: (citation: Citation) => void;
  closeReference: () => void;
  toggleReferencePanel: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let isConversationsTableAvailable = true;
let isMessagesTableAvailable = true;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, activePlan } = useAuth();
  const userId = user?.id || 'guest_user';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<'auto' | 'en' | 'so' | 'ar'>('auto');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isReferencePanelOpen, setIsReferencePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

  // Authoritative user plan resolved from AuthContext single source of truth
  const userPlan: PlanSlug = activePlan || normalizePlanSlug(profile?.plan) || storage.getUserActivePlan(userId);
  const planLimits: Record<PlanSlug, number> = {
    free: 5,
    pro: 150,
    premium: 1000,
  };
  const dailyLimit = planLimits[userPlan] || 5;
  const [dailyUsage, setDailyUsage] = useState(() => storage.getDailyUsage(userId));

  useEffect(() => {
    setDailyUsage(storage.getDailyUsage(userId));
  }, [userId]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef(false);
  const isUserStopRef = useRef(false);

  useEffect(() => {
    async function loadConversations() {
      if (isSupabaseConfigured && user?.id && isUuid(user.id) && isConversationsTableAvailable) {
        try {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('conversations')) {
              isConversationsTableAvailable = false;
              console.info('[ChatContext] conversations table is not yet created in Supabase. Using local storage.');
            }
          } else if (data) {
            setConversations(data as Conversation[]);
            return;
          }
        } catch {}
      }
      const local = storage.getConversations(userId);
      setConversations(local);
    }
    loadConversations();
  }, [userId, user]);

  const activeConvId = activeConversation?.id;

  // Load messages whenever active conversation ID changes, protecting in-flight generation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    // Do NOT wipe or reload messages while generation is active in this conversation
    if (isGeneratingRef.current) {
      return;
    }

    async function loadMessages() {
      if (!activeConvId) return;
      // Critical: Do not overwrite messages while actively generating in the active conversation
      if (isGeneratingRef.current) return;
      if (isSupabaseConfigured && user?.id && isUuid(user.id) && isUuid(activeConvId) && isMessagesTableAvailable) {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', activeConvId)
            .order('created_at', { ascending: true });
          if (error) {
            if (error.code === 'PGRST205' || error.message?.includes('messages')) {
              isMessagesTableAvailable = false;
              console.info('[ChatContext] messages table is not yet created in Supabase. Using local storage.');
            }
          } else if (data && data.length > 0) {
            setMessages(data as Message[]);
            storage.saveMessages(activeConvId, data as Message[]);
            return;
          }
        } catch {}
      }
      const local = storage.getMessages(activeConvId);
      setMessages(local);
    }
    loadMessages();
  }, [activeConvId, user?.id]);

  const selectConversation = (id: string) => {
    let found = conversations.find((c) => c.id === id);
    if (!found) {
      const localConvs = storage.getConversations(userId);
      found = localConvs.find((c) => c.id === id);
    }
    if (found) {
      setActiveConversation(found);
    } else {
      setActiveConversation({
        id,
        user_id: userId,
        title: 'New Chat',
        is_pinned: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const createNewChat = async (
    initialPrompt?: string,
    topic?: string,
    overrideLanguage?: 'auto' | 'en' | 'so' | 'ar',
    contextPrompt?: string
  ): Promise<string> => {
    const newId = crypto.randomUUID();
    const title = initialPrompt ? truncate(initialPrompt, 36) : 'New Chat';
    const now = new Date().toISOString();

    const newConversation: Conversation = {
      id: newId,
      user_id: userId,
      title,
      is_pinned: false,
      is_archived: false,
      topic,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && user?.id && isUuid(user.id) && isConversationsTableAvailable) {
      try {
        await supabase.from('conversations').insert({
          id: newId,
          user_id: user.id,
          title,
          is_pinned: false,
          is_archived: false,
          topic,
        });
      } catch {}
    }

    const updated = [newConversation, ...conversations];
    setConversations(updated);
    storage.saveConversations(userId, updated);
    setActiveConversation(newConversation);
    setMessages([]);

    if (initialPrompt) {
      await sendMessageWithConversation(newConversation, initialPrompt, overrideLanguage, contextPrompt);
    }
    return newId;
  };

  // Helper to execute assistant generation with real-time streaming chunks
  const generateAssistantReply = async (
    conversation: Conversation,
    userPrompt: string,
    historyWithUser: Message[],
    overrideLang?: 'auto' | 'en' | 'so' | 'ar',
    contextPrompt?: string
  ) => {
    const detectedLang = detectQueryLanguage(userPrompt.trim());
    const chosenLang = overrideLang && overrideLang !== 'auto'
      ? overrideLang
      : targetLanguage !== 'auto'
      ? targetLanguage
      : detectedLang;
    const aiMsgId = crypto.randomUUID();

    const aiPlaceholder: Message = {
      id: aiMsgId,
      conversation_id: conversation.id,
      user_id: userId,
      role: 'assistant',
      content: '',
      language: chosenLang,
      status: 'generating',
      created_at: new Date().toISOString(),
    };

    setMessages([...historyWithUser, aiPlaceholder]);
    setIsGenerating(true);
    isGeneratingRef.current = true;
    isUserStopRef.current = false;
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current && isGeneratingRef.current) {
        abortControllerRef.current.abort();
      }
    }, 180000);

    try {
      const userSettings = storage.getSettings(userId);
      const schoolPreference = userSettings.preferred_school || 'all';
      const isPaidPlan = userPlan === 'pro' || userPlan === 'premium';
      const result = await generateIslamicResponse({
        conversationId: conversation.id,
        prompt: userPrompt.trim(),
        contextPrompt,
        messages: historyWithUser,
        targetLanguage: chosenLang,
        answerLength: isPaidPlan ? 'balanced' : 'concise',
        schoolPreference,
        signal: abortControllerRef.current.signal,
        onChunk: (_chunk, fullText) => {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === aiMsgId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = {
                ...prev[idx],
                content: fullText,
                language: chosenLang,
                status: 'generating',
              };
              return updated;
            }
            return [
              ...prev,
              {
                id: aiMsgId,
                conversation_id: conversation.id,
                user_id: userId,
                role: 'assistant',
                content: fullText,
                language: chosenLang,
                status: 'generating',
                created_at: new Date().toISOString(),
              },
            ];
          });
        },
      });

      clearTimeout(timeoutId);

      const extractedCitations = extractCitations(result.content);

      const completedAiMessage: Message = {
        id: aiMsgId,
        conversation_id: conversation.id,
        user_id: userId,
        role: 'assistant',
        content: result.content,
        language: chosenLang,
        status: 'completed',
        citations: extractedCitations,
        webSearchUsed: (result as any).webSourcesUsed === true,
        created_at: new Date().toISOString(),
      };

      const finalMessages = [...historyWithUser, completedAiMessage];
      setMessages(finalMessages);
      storage.saveMessages(conversation.id, finalMessages);
      storage.incrementDailyUsage(userId);
      setDailyUsage(storage.getDailyUsage(userId));

      if (isSupabaseConfigured && user?.id && isUuid(user.id) && isUuid(conversation.id) && isMessagesTableAvailable) {
        try {
          await supabase.from('messages').insert({
            id: aiMsgId,
            conversation_id: conversation.id,
            user_id: user.id,
            role: 'assistant',
            content: result.content,
            status: 'completed',
            citations: extractedCitations,
          });
          if (isConversationsTableAvailable) {
            await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation.id);
          }
        } catch (dbErr) {
          console.warn('[ChatContext] AI message insert into Supabase failed:', dbErr);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Only mark as user-stopped if the user explicitly clicked the Stop Generation button
      if (isUserStopRef.current) {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === aiMsgId);
          const currentContent = idx >= 0 ? prev[idx].content : '';
          const stoppedAiMessage: Message = {
            id: aiMsgId,
            conversation_id: conversation.id,
            user_id: userId,
            role: 'assistant',
            content: currentContent ? `${currentContent}\n\n*(Generation stopped)*` : '*(Generation stopped)*',
            status: 'completed',
            created_at: new Date().toISOString(),
          };
          const updated = idx >= 0 ? [...prev] : [...prev, stoppedAiMessage];
          if (idx >= 0) updated[idx] = stoppedAiMessage;
          storage.saveMessages(conversation.id, updated);
          return updated;
        });
        return;
      }

      let userFriendlyError = err.message || 'A network error occurred while generating response.';
      if (err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('aborted')) {
        userFriendlyError = chosenLang === 'ar'
          ? 'انتهت مهلة إعداد الإجابة. يرجى الضغط على "إعادة المحاولة / Retry" أدناه.'
          : chosenLang === 'so'
          ? 'Waqtigii loogu talagalay diyaarinta jawaabta ayaa dhacay. Fadlan riix badhanka "Isku day mar kale / Retry" ee hoose.'
          : 'Generation timed out while preparing your response. Please click "Isku day mar kale / Retry" below.';
      } else if (err.message?.includes('429') || err.message?.includes('Rate limit') || err.message?.includes('quota')) {
        userFriendlyError = chosenLang === 'ar'
          ? 'النظام يشهد ضغطاً عالياً حالياً (429 Rate Limit). يرجى الانتظار قليلاً ثم الضغط على "إعادة المحاولة / Retry".'
          : chosenLang === 'so'
          ? 'Adeeggu hadda wuu mashquulsan yahay codsiyada oo batay awgood (429 Rate Limit). Fadlan dib u tijaabi daqiiqad ka dib adigoo riixaya "Isku day mar kale / Retry".'
          : 'Service is experiencing high demand (429 Rate Limit). Please wait a moment and click "Isku day mar kale / Retry".';
      } else if (err.message?.includes('503') || err.message?.includes('unavailable')) {
        userFriendlyError = chosenLang === 'ar'
          ? 'خدمة توليد الإجابة غير متاحة مؤقتاً (503 Service Unavailable). يرجى الضغط على "إعادة المحاولة / Retry".'
          : chosenLang === 'so'
          ? 'Adeegga diyaarinta jawaabaha hadda wuu mashquulsan yahay (503 Service Unavailable). Fadlan riix badhanka "Isku day mar kale / Retry".'
          : 'The educational response service is temporarily unavailable (503). Please click "Isku day mar kale / Retry".';
      } else if (
        /([a-zA-Z0-9_]+Error:|at\s+[a-zA-Z0-9_./\\]+|https?:\/\/|{[\s\S]*}|Failed to fetch|NetworkError|fetch failed)/i.test(err.message || '')
      ) {
        userFriendlyError = chosenLang === 'ar'
          ? 'تعذر إتمام معالجة الطلب في الوقت الحالي. يرجى الضغط على "إعادة المحاولة / Retry" أو زيارة مركز المساعدة.'
          : chosenLang === 'so'
          ? 'Codsiga lama dhammaystiri karin hadda cilad farsamo awgeed. Fadlan riix "Isku day mar kale / Retry" ama booqo Xarunta Caawinta.'
          : 'An unexpected issue occurred while processing your inquiry. Please click "Isku day mar kale / Retry" below or visit the Help Center.';
      }

      const failedContent = chosenLang === 'ar'
        ? 'نعتذر، حدث تعذر أثناء معالجة استفساركم الشرعي. يرجى المحاولة مرة أخرى.'
        : chosenLang === 'so'
        ? 'Waan ka xunnahay, khalad ayaa ku yimid socodsiinta weydiintaada diiniga ah. Fadlan isku day mar kale.'
        : 'I apologize, an error occurred while processing your Islamic inquiry. Please try again.';

      const failedAiMessage: Message = {
        id: aiMsgId,
        conversation_id: conversation.id,
        user_id: userId,
        role: 'assistant',
        content: failedContent,
        language: chosenLang,
        status: 'failed',
        error_message: userFriendlyError,
        created_at: new Date().toISOString(),
      };

      const finalMessages = [...historyWithUser, failedAiMessage];
      setMessages(finalMessages);
      storage.saveMessages(conversation.id, finalMessages);
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      isUserStopRef.current = false;
      abortControllerRef.current = null;
    }
  };

  const sendMessageWithConversation = async (
    conversation: Conversation,
    prompt: string,
    overrideLang?: 'auto' | 'en' | 'so' | 'ar',
    contextPrompt?: string
  ) => {
    if (!prompt.trim() || isGenerating) return;

    const isPaidPlan = userPlan === 'pro' || userPlan === 'premium';
    const currentUsage = storage.getDailyUsage(userId);
    if (!isPaidPlan && currentUsage.count >= dailyLimit) {
      setIsQuotaModalOpen(true);
      return;
    }

    if (isSupabaseConfigured && user?.id && isUuid(user.id)) {
      try {
        const { data: usageCheck } = await supabase.rpc('check_and_record_ai_usage', {
          p_user_id: user.id,
          p_is_paid: isPaidPlan,
          p_model: 'gemini-1.5-flash',
        });
        if (usageCheck && usageCheck.allowed === false) {
          setIsQuotaModalOpen(true);
          return;
        }
      } catch (rpcErr) {
        console.warn('[ChatContext] Server usage check fallback to client limit:', rpcErr);
      }
    }

    const now = new Date().toISOString();
    const userMsgId = crypto.randomUUID();
    const userMsgLang = detectQueryLanguage(prompt.trim());

    const userMessage: Message = {
      id: userMsgId,
      conversation_id: conversation.id,
      user_id: userId,
      role: 'user',
      content: prompt.trim(),
      language: userMsgLang,
      status: 'completed',
      created_at: now,
    };

    const currentMessages = storage.getMessages(conversation.id);
    const updatedMessagesWithUser = [...currentMessages, userMessage];
    setMessages(updatedMessagesWithUser);
    storage.saveMessages(conversation.id, updatedMessagesWithUser);
    trackFeatureUsage('ai-fatwa');

    // Persist user message to Supabase IMMEDIATELY before starting generation
    if (isSupabaseConfigured && user?.id && isUuid(user.id) && isUuid(conversation.id) && isMessagesTableAvailable) {
      try {
        await supabase.from('messages').insert({
          id: userMsgId,
          conversation_id: conversation.id,
          user_id: user.id,
          role: 'user',
          content: prompt.trim(),
          status: 'completed',
        });
      } catch (err) {
        console.warn('Initial user message insert to Supabase deferred:', err);
      }
    }

    if (currentMessages.length === 0 && (conversation.title === 'New Chat' || conversation.title === 'New Islamic Inquiry')) {
      const generatedTitle = truncate(prompt.trim(), 40);
      const updatedConv = { ...conversation, title: generatedTitle, updated_at: now };
      setActiveConversation(updatedConv);
      const newConvs = conversations.map((c) => (c.id === conversation.id ? updatedConv : c));
      setConversations(newConvs);
      storage.saveConversations(userId, newConvs);

      if (isSupabaseConfigured && user && isUuid(conversation.id) && isConversationsTableAvailable) {
        supabase.from('conversations').update({ title: generatedTitle }).eq('id', conversation.id);
      }
    }

    await generateAssistantReply(conversation, prompt.trim(), updatedMessagesWithUser, overrideLang, contextPrompt);
  };

  const sendMessage = async (prompt: string, overrideLang?: 'auto' | 'en' | 'so' | 'ar', contextPrompt?: string) => {
    let target = activeConversation;
    if (!target) {
      await createNewChat(prompt, undefined, overrideLang, contextPrompt);
      return;
    }
    await sendMessageWithConversation(target, prompt, overrideLang, contextPrompt);
  };

  const regenerateMessage = async (messageId?: string) => {
    if (!activeConversation || isGenerating) return;

    let targetIdx = -1;
    if (messageId) {
      targetIdx = messages.findIndex((m) => m.id === messageId);
    }

    let userIndex = -1;
    if (targetIdx !== -1) {
      // Find the user prompt right before or leading up to this message
      for (let i = targetIdx; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userIndex = i;
          break;
        }
      }
    }

    if (userIndex === -1) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userIndex = i;
          break;
        }
      }
    }

    if (userIndex === -1) return;

    const userPrompt = messages[userIndex].content;
    // Truncate history to retain everything up to and including this user prompt
    const truncatedHistory = messages.slice(0, userIndex + 1);
    setMessages(truncatedHistory);
    storage.saveMessages(activeConversation.id, truncatedHistory);

    // Re-run assistant generation with the exact user prompt
    await generateAssistantReply(activeConversation, userPrompt, truncatedHistory);
  };

  const stopGeneration = () => {
    isUserStopRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('user_stop');
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle.trim(), updated_at: new Date().toISOString() } : c
    );
    setConversations(updated);
    storage.saveConversations(userId, updated);
    if (activeConversation?.id === id) {
      setActiveConversation({ ...activeConversation, title: newTitle.trim() });
    }
    if (isSupabaseConfigured && isUuid(id) && isConversationsTableAvailable) {
      supabase.from('conversations').update({ title: newTitle.trim() }).eq('id', id);
    }
  };

  const deleteConversation = async (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    storage.saveConversations(userId, updated);
    storage.deleteMessages(id);
    if (activeConversation?.id === id) {
      setActiveConversation(updated[0] || null);
    }
    if (isSupabaseConfigured && isUuid(id) && isConversationsTableAvailable) {
      supabase.from('conversations').delete().eq('id', id);
    }
  };

  const pinConversation = async (id: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, is_pinned: !c.is_pinned } : c
    );
    setConversations(updated);
    storage.saveConversations(userId, updated);
    if (isSupabaseConfigured && isUuid(id) && isConversationsTableAvailable) {
      const conv = updated.find((c) => c.id === id);
      if (conv) {
        supabase.from('conversations').update({ is_pinned: conv.is_pinned }).eq('id', id);
      }
    }
  };

  const archiveConversation = async (id: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, is_archived: !c.is_archived } : c
    );
    setConversations(updated);
    storage.saveConversations(userId, updated);
    if (isSupabaseConfigured && isUuid(id) && isConversationsTableAvailable) {
      const conv = updated.find((c) => c.id === id);
      if (conv) {
        supabase.from('conversations').update({ is_archived: conv.is_archived }).eq('id', id);
      }
    }
  };

  const saveToKnowledge = async (message: Message, topic = 'General') => {
    const item = {
      id: crypto.randomUUID(),
      user_id: userId,
      conversation_id: message.conversation_id,
      message_id: message.id,
      title: truncate(message.content, 48),
      content: message.content,
      topic,
      tags: [topic],
      created_at: new Date().toISOString(),
    };
    const current = storage.getSavedItems(userId);
    storage.saveSavedItems(userId, [item, ...current]);
    if (isSupabaseConfigured && user) {
      supabase.from('saved_items').insert(item);
    }
  };

  const submitFeedback = async (messageId: string, rating: 'helpful' | 'unhelpful') => {
    const updatedMessages = messages.map((m) =>
      m.id === messageId ? { ...m, feedback: rating } : m
    );
    setMessages(updatedMessages);
    if (activeConversation) {
      storage.saveMessages(activeConversation.id, updatedMessages);
    }
    if (isSupabaseConfigured && user) {
      supabase.from('response_feedback').insert({
        user_id: user.id,
        message_id: messageId,
        rating,
      });
    }
  };

  const reportMessage = async (messageId: string, category: ReportCategory, description: string) => {
    const newReport = {
      id: crypto.randomUUID(),
      user_id: userId,
      message_id: messageId,
      category,
      description,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };
    storage.saveReport(newReport);
    if (isSupabaseConfigured && user) {
      supabase.from('reports').insert(newReport);
    }
  };

  const openReference = (citation: Citation) => {
    const isPaid = userPlan === 'pro' || userPlan === 'premium';
    if (!isPaid) return;
    setSelectedCitation(citation);
    setIsReferencePanelOpen(true);
  };

  const closeReference = () => {
    setSelectedCitation(null);
    setIsReferencePanelOpen(false);
  };

  const toggleReferencePanel = () => {
    const isPaid = userPlan === 'pro' || userPlan === 'premium';
    if (!isPaid) return;
    setIsReferencePanelOpen(!isReferencePanelOpen);
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return !c.is_archived;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q);
  });

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isGenerating,
        targetLanguage,
        setTargetLanguage,
        selectedCitation,
        isReferencePanelOpen,
        searchQuery,
        setSearchQuery,
        filteredConversations,
        isQuotaModalOpen,
        setIsQuotaModalOpen,
        userPlan,
        dailyUsage,
        dailyLimit,
        createNewChat,
        selectConversation,
        sendMessage,
        regenerateMessage,
        stopGeneration,
        renameConversation,
        deleteConversation,
        pinConversation,
        archiveConversation,
        saveToKnowledge,
        submitFeedback,
        reportMessage,
        openReference,
        closeReference,
        toggleReferencePanel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
