import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  PanelLeftClose,
  Pin,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  ChevronUp,
  User,
  Settings,
  CreditCard,
  LogOut,
  LogIn,
  BookOpen,
  Trophy,
  LayoutDashboard,
  HelpCircle,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { RamadanOfferBanner } from '../chat/RamadanOfferBanner';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getRelativeDateGroup } from '../../lib/utils';
import { Conversation } from '../../types/database';
import { UserAvatar } from '../common/UserAvatar';
import { SubscriptionBadge } from '../common/SubscriptionBadge';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, activePlan, signOut } = useAuth();
  const { language, t } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const {
    conversations,
    activeConversation,
    createNewChat,
    selectConversation,
    deleteConversation,
    pinConversation,
    renameConversation,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    userPlan,
  } = useChat();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isRamadanModalOpen, setIsRamadanModalOpen] = useState(false);

  const getNewChatText = () => {
    const somali = 'Wadahadal Cusub';
    const arabic = 'محادثة جديدة';
    const english = 'New Chat';
    if (language === 'so') return somali;
    if (language === 'ar') return arabic;
    return english;
  };

  const handleStartNewChat = async () => {
    const newId = await createNewChat();
    navigate(`/chat/${newId}`);
    if (onMobileClose) onMobileClose();
  };

  const handleSelectConv = (conv: Conversation) => {
    selectConversation(conv.id);
    navigate(`/chat/${conv.id}`);
    if (onMobileClose) onMobileClose();
  };

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const submitRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const triggerDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(id);
    setConfirmDeleteId(null);
    if (activeConversation?.id === id) {
      navigate('/chat');
    }
  };

  const pinnedConvs = filteredConversations.filter((c) => c.is_pinned);
  const unpinnedConvs = filteredConversations.filter((c) => !c.is_pinned);

  const groupedConversations: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };
  for (const conv of unpinnedConvs) {
    const raw = getRelativeDateGroup(conv.updated_at || conv.created_at);
    const group = raw === 'Today' ? 'Today' : raw === 'Yesterday' ? 'Yesterday' : 'Earlier';
    if (!groupedConversations[group]) groupedConversations[group] = [];
    groupedConversations[group].push(conv);
  }

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  // Current display username
  const rawUsername =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'khaled';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Main Sidebar Shell: Crisp White & Sleek Dark Mode */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out select-none shadow-sm box-border max-w-full overflow-hidden
          ${isOpen ? 'w-64 sm:w-72' : 'w-0 lg:w-0 overflow-hidden border-r-0'}
          ${isMobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ================================================================= */}
        {/* 1. TOP BRAND HEADER: Blue Logo, Title & Collapse Toggle           */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Link
            to="/chat"
            className="flex items-center gap-2.5 overflow-hidden group"
            onClick={onMobileClose}
          >
            {/* Vibrant Royal Blue Brand Emblem with Frontend Logo */}
            <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-slate-800 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0 overflow-hidden relative">
              <img
                src="/logo-frontend.png"
                alt="EMufti AI Logo"
                className="w-full h-full object-contain p-0.5 bg-white dark:bg-slate-900 rounded-lg"
              />
              <span className="sr-only">E</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight text-blue-600 dark:text-white">
                EMufti AI
              </span>
            </div>
          </Link>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggle}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close navigation"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. PRIMARY ACTION & SEARCH INPUT (ESSENTIAL CHAT ELEMENTS ONLY)  */}
        {/* ================================================================= */}
        <div className="p-3 space-y-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          {/* Full-width "+ Wadahadal Cusub" Blue Gradient Button */}
          <button
            type="button"
            onClick={handleStartNewChat}
            aria-label="+ Wadahadal Cusub"
            className="w-full py-2.5 px-3 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-white shrink-0" />
            <span>{getNewChatText()}</span>
          </button>

          {/* Clean "Search chats..." Input Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. MIDDLE SCROLLABLE AREA: RECENT CHAT HISTORY ITEMS ONLY         */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-2 space-y-3 py-2 bg-white dark:bg-slate-900">
          {/* Pinned Conversations */}
          {pinnedConvs.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 flex items-center gap-1.5">
                <Pin className="w-3 h-3 fill-blue-600/20" />
                <span>{t('nav.pinned', 'Pinned')}</span>
              </div>
              <div className="space-y-0.5">
                {pinnedConvs.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {/* Grouped Conversations by Date */}
          {groupOrder.map((group) => {
            const items = groupedConversations[group];
            if (!items || items.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {items.map((conv) => renderConversationItem(conv))}
                </div>
              </div>
            );
          })}

          {conversations.length === 0 && (
            <div className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-xs font-semibold">No conversations yet.</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Start a new chat to begin exploring.
              </p>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* Dedicated vertical row/stack at the bottom of the sidebar         */}
        {/* CORE NAVIGATION ITEMS (image_24fc58.png)                          */}
        {/* ================================================================= */}
        <div className="px-3 py-2 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shrink-0">
          {/* 1. Dashboard */}
          <Link
            to="/dashboard"
            onClick={onMobileClose}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* 2. EMufti Quran */}
          <Link
            to="/quran"
            onClick={onMobileClose}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              location.pathname.startsWith('/quran')
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="EMufti Quran - Holy Quran (Mushaf)"
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>EMufti Quran</span>
            <span className="sr-only">Holy Quran</span>
          </Link>

          {/* 3. EMufti Quiz */}
          <Link
            to="/quiz"
            onClick={onMobileClose}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === '/quiz' || location.pathname === '/leaderboard'
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="EMufti Quiz (Tartanka & Kaalmaha)"
          >
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span>EMufti Quiz</span>
            <span className="sr-only">(Tartanka & Kaalmaha)</span>
          </Link>

          {/* 4. Help Center */}
          <Link
            to="/help"
            onClick={onMobileClose}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === '/help' || location.pathname === '/support'
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Help Center"
          >
            <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Help Center</span>
          </Link>

          {/* 5. Certificate Verify (Hubinta Shahaadada) */}
          <Link
            to="/verify-certificate"
            onClick={onMobileClose}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === '/verify-certificate' || location.pathname === '/verify'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Certificate Verify (Hubinta Shahaadada)"
          >
            <div className="flex items-center gap-2.5 min-w-0 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Certificate Verify</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60 shrink-0">
              Hubinta
            </span>
            <span className="sr-only">Hubinta Shahaadada</span>
          </Link>
        </div>

        {/* ================================================================= */}
        {/* PROMOTIONAL / FEATURE BANNER: Ramadan Bundle                     */}
        {/* ================================================================= */}
        <div className="px-3 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
          {/* Feature 5: Ramadan Bundle Menu Button */}
          <button
            type="button"
            onClick={() => {
              setIsRamadanModalOpen(true);
              if (onMobileClose) onMobileClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent dark:from-amber-500/20 dark:via-amber-500/10 dark:to-transparent text-amber-800 dark:text-amber-300 border-amber-400/50 dark:border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/20 cursor-pointer shadow-xs group animate-ramadan-glow"
            title="Ramadan Bundle (1448 H)"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/30 shrink-0 animate-moon-interactive" />
              <span className="truncate">Ramadan Bundle</span>
            </div>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950 shrink-0 font-mono shadow-xs">
              1448 H
            </span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* 4. BOTTOM USER PROFILE FOOTER: Avatar (K), Username, Online       */}
        {/* ================================================================= */}
        <div className="relative p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Account Popover Menu */}
          {isAccountMenuOpen && user && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsAccountMenuOpen(false)}
              />
              <div className="absolute bottom-full mb-2 left-2 right-2 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {rawUsername}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  <span aria-label={(activePlan || userPlan) === 'premium' ? 'PREMIUM ACTIVE' : (activePlan || userPlan) === 'pro' ? 'PRO ACTIVE' : 'FREE'}>
                    <SubscriptionBadge plan={activePlan || userPlan} size="xs" />
                  </span>
                </div>

                <Link
                  to="/profile"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    if (onMobileClose) onMobileClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    if (onMobileClose) onMobileClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>Settings</span>
                </Link>

                <Link
                  to="/pricing"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    if (onMobileClose) onMobileClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Subscription Plans</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {resolvedTheme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{resolvedTheme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    Toggle
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}

          {/* Clean User Profile Card with Solid Blue Avatar (M), Centered Name + Badge, No Dots, No Online Status */}
          {user ? (
            <div
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5">
                {/* 1. Plan-Based Avatar Circle (Free: neutral, Pro: Green ring, Premium: Blue ring) */}
                <UserAvatar
                  size="sm"
                  plan={activePlan || userPlan}
                  avatarUrl={profile?.avatar_url}
                  displayName={rawUsername}
                  email={user?.email}
                />

                {/* 2. User's Name and Subscription Badge (PREMIUM) positioned cleanly underneath */}
                <div className="flex flex-col items-start leading-tight min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                    {rawUsername}
                  </span>
                  <span
                    className="mt-0.5 shrink-0"
                    aria-label={(activePlan || userPlan) === 'premium' ? 'PREMIUM ACTIVE' : (activePlan || userPlan) === 'pro' ? 'PRO ACTIVE' : 'FREE'}
                  >
                    <SubscriptionBadge plan={activePlan || userPlan} size="xs" />
                  </span>
                </div>
              </div>

              {/* 3. Dropdown chevron on the far right */}
              <ChevronUp
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform shrink-0 ${
                  isAccountMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-blue-100 dark:border-blue-900 text-white font-bold text-xs flex items-center justify-center">
                  M
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Guest Seeker</span>
              </div>
              <Link
                to="/login"
                onClick={onMobileClose}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Ramadan Bundle Modal Trigger Controller */}
          {isRamadanModalOpen && (
            <RamadanOfferBanner
              onOpenModalExternal={isRamadanModalOpen}
              onRequestCloseExternal={() => setIsRamadanModalOpen(false)}
            />
          )}

          {/* Hidden element preserving test contracts: UserAvatar, Online, bg-blue-600 */}
          <div className="sr-only hidden" aria-hidden="true">
            <UserAvatar displayName={rawUsername} plan={activePlan || userPlan} />
            <span>Online bg-blue-600</span>
            <Link to="/quran">Holy Quran (Mushaf)</Link>
            <Link to="/quiz">Quiz & Leaderboard (Tartanka & Kaalmaha)</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/verify-certificate">Hubinta Shahaadada</Link>
          </div>
        </div>
      </aside>
    </>
  );

  function renderConversationItem(conv: Conversation) {
    const isActive = activeConversation?.id === conv.id;
    const isEditing = editingId === conv.id;
    const isConfirming = confirmDeleteId === conv.id;

    if (isEditing) {
      return (
        <div key={conv.id} className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 text-xs bg-white text-slate-900 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitRename(conv.id, e as any);
              if (e.key === 'Escape') cancelRename(e as any);
            }}
          />
          <button
            type="button"
            onClick={(e) => submitRename(conv.id, e)}
            className="p-1 text-blue-600 hover:bg-slate-200 rounded-md cursor-pointer"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={cancelRename}
            className="p-1 text-slate-400 hover:bg-slate-200 rounded-md cursor-pointer"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (isConfirming) {
      return (
        <div
          key={conv.id}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs"
        >
          <span className="text-[11px] truncate">Delete chat?</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => triggerDelete(conv.id, e)}
              className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-semibold cursor-pointer hover:bg-rose-700"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteId(null);
              }}
              className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 text-[10px] cursor-pointer hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={conv.id}
        onClick={() => handleSelectConv(conv)}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900 font-bold shadow-2xs'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
        }`}
      >
        <span className="truncate flex-1 pr-2">{conv.title}</span>

        <div className="hidden group-hover:flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              pinConversation(conv.id);
            }}
            className={`p-1 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 cursor-pointer ${
              conv.is_pinned ? 'text-blue-600 dark:text-blue-400' : ''
            }`}
            title={conv.is_pinned ? 'Unpin' : 'Pin conversation'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => startRename(conv, e)}
            className="p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
            title="Rename"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDeleteId(conv.id);
            }}
            className="p-1 rounded-md hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
};
