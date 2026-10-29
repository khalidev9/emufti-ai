import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Search,
  MessageSquare,
  Edit3,
  Trash2,
  Check,
  Clock,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useLanguage } from '../../context/LanguageContext';
import { getRelativeDateGroup } from '../../lib/utils';
import { Conversation } from '../../types/database';

interface ConversationHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationHistoryDrawer: React.FC<ConversationHistoryDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    conversations,
    activeConversation,
    createNewChat,
    selectConversation,
    deleteConversation,
    renameConversation,
    searchQuery,
    setSearchQuery,
    filteredConversations,
  } = useChat();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartNewChat = async () => {
    const newId = await createNewChat();
    navigate(`/chat/${newId}`);
    onClose();
  };

  const handleSelect = (convId: string) => {
    selectConversation(convId);
    navigate(`/chat/${convId}`);
    onClose();
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (convId: string, e: React.FormEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      await renameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(convId);
    setConfirmDeleteId(null);
  };

  // Group conversations by date
  const displayConversations = searchQuery.trim() ? filteredConversations : conversations;
  const grouped: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  displayConversations.forEach((conv) => {
    const group = getRelativeDateGroup(conv.updated_at || conv.created_at);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(conv);
  });

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel (Right side on mobile/desktop, compact and clean) */}
      <div className="relative ml-auto w-full max-w-sm sm:max-w-md bg-white dark:bg-[#181818] h-full shadow-2xl flex flex-col z-10 border-l border-stone-200/80 dark:border-white/10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('chat.history_title', 'Conversation History')}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3 border-b border-stone-100 dark:border-white/5">
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>{t('nav.new_chat', 'New Chat')}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chat.search_conversations', 'Search conversations...')}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-stone-100 dark:bg-stone-800/80 border-0 focus:ring-1 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 chat-scrollbar">
          {displayConversations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-blue-600" />
              <p className="text-xs font-medium">
                {searchQuery ? 'Wax wadahadal ah lama helin' : 'Wali ma jiro wadahadal hore'}
              </p>
              <p className="text-[11px] opacity-70">
                {searchQuery ? 'Isku day eray kale' : 'Guji "New Chat" si aad u bilowdo'}
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([groupTitle, convs]) => {
              if (convs.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    {groupTitle}
                  </h3>
                  <div className="space-y-0.5">
                    {convs.map((conv) => {
                      const isActive = activeConversation?.id === conv.id;
                      const isEditing = editingId === conv.id;

                      if (isEditing) {
                        return (
                          <form
                            key={conv.id}
                            onSubmit={(e) => handleSaveRename(conv.id, e)}
                            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800"
                          >
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              autoFocus
                              className="flex-1 text-xs bg-white dark:bg-stone-900 border border-blue-500 rounded px-2 py-1 text-foreground"
                            />
                            <button
                              type="button"
                              onClick={(e) => handleSaveRename(conv.id, e)}
                              className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                              className="p-1 rounded text-muted-foreground hover:bg-stone-200 dark:hover:bg-stone-700"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        );
                      }

                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelect(conv.id)}
                          className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold border border-blue-500/25'
                              : 'text-foreground/90 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                            <MessageSquare
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? 'text-blue-600' : 'text-muted-foreground'
                              }`}
                            />
                            <span className="truncate">{conv.title || 'Wadahadal'}</span>
                          </div>

                          {/* Action Buttons (Rename / Delete) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => handleStartRename(conv, e)}
                              className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-muted-foreground hover:text-foreground"
                              title="Rename"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {confirmDeleteId === conv.id ? (
                              <button
                                onClick={(e) => handleDelete(conv.id, e)}
                                className="p-1 rounded bg-rose-500 text-white hover:bg-rose-600 text-[10px] font-bold px-1.5"
                                title="Confirm Delete"
                              >
                                Delete
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(conv.id);
                                }}
                                className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
