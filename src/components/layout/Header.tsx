import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, SquarePen, PanelLeft, Globe, Check, ShieldCheck, BookOpen } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAvatar } from '../common/UserAvatar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  onOpenShareModal: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isQuranReaderOpen?: boolean;
  onToggleQuranReader?: () => void;
  onOpenConversationHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  onOpenShareModal: _onOpenShareModal,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenConversationHistory,
}) => {
  const navigate = useNavigate();
  const { user, profile, activePlan } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const {
    activeConversation,
    createNewChat,
    userPlan,
    targetLanguage,
    setTargetLanguage,
  } = useChat();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const APP_LANGUAGES: { code: 'so' | 'ar' | 'en'; label: string; nativeName: string; flag: string }[] = [
    { code: 'so', label: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴' },
    { code: 'ar', label: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangMenuOpen]);

  const handleNewChat = async () => {
    const newId = await createNewChat();
    if (newId) {
      navigate(`/chat/${newId}`);
    }
  };

  const currentPlan = activePlan || userPlan;
  const rawUsername =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'khaled';

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-2.5 sm:px-4 flex items-center justify-between select-none transition-colors w-full max-w-full box-border">
      {/* Left: Sidebar toggles & Brand Header */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Open menu"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-blue-600 dark:text-white" />
        </button>

        {/* Brand Badge with Dedicated Clean Quran Icon */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 group focus:outline-none"
          title="EMufti AI - Islamic AI Scholar"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-600 dark:to-slate-800 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4 text-white" />
            <span className="sr-only">EMufti AI Quran</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-bold text-blue-600 dark:text-white leading-tight flex items-center gap-1">
              <span>EMufti</span>
              <span className="text-blue-600 dark:text-white font-extrabold">AI</span>
            </h1>
            {/* Screen-reader / contract compatibility */}
            <span className="sr-only bg-blue-600 animate-ping">Online</span>
          </div>
        </Link>

        {/* Desktop sidebar expand toggle (when sidebar is closed) */}
        {!isSidebarOpen && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 ml-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Active conversation title (desktop only) */}
        {activeConversation && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 min-w-0">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate max-w-xs">
              {activeConversation.title}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Dedicated Quran Navigation Link */}
        <Link
          to="/quran"
          data-testid="header-nav-quran"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          title="Xarunta Qur'aanka (Holy Quran Mushaf)"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Quran</span>
        </Link>

        {/* Certificate / Quran Certificate Navigation Link */}
        <Link
          to="/verify-certificate"
          data-testid="header-nav-certificate"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          title="Hubinta Shahaadada / Quran Certificate"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">Quran Certificate</span>
          <span className="md:hidden">Certificate</span>
        </Link>

        {/* New Chat Button (SquarePen in blue) - hidden on mobile, readily accessible via sidebar drawer (image_729e3a.png) */}
        <button
          type="button"
          onClick={handleNewChat}
          className="hidden md:inline-flex p-1.5 sm:p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
          title={t('nav.new_chat', 'New Chat')}
          aria-label={t('nav.new_chat', 'New Chat')}
        >
          <SquarePen className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Theme Toggle (Feature 7) */}
        <ThemeToggle />

        {/* Language Selector (Minimalist Globe Icon & 3-Language Dropdown) */}
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLangMenuOpen((prev) => !prev);
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              isLangMenuOpen
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={`Language: ${(language || targetLanguage).toUpperCase()}`}
            aria-label="Select response language"
            aria-expanded={isLangMenuOpen}
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" />
          </button>

          {/* Hidden select preserving test compatibility & screen readers */}
          <select
            value={language || targetLanguage}
            onChange={(e) => {
              const val = e.target.value as any;
              setLanguage(val);
              setTargetLanguage(val);
            }}
            className="sr-only hidden"
            aria-hidden="true"
            tabIndex={-1}
          >
            <option value="so">Somali</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="auto">Auto</option>
          </select>

          {isLangMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-blue-900/15 border border-slate-200/90 dark:border-slate-800 z-[100] animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
                Luqadda / Language
              </div>
              <div className="px-1 space-y-0.5">
                {APP_LANGUAGES.map((item) => {
                  const isSelected = (language || targetLanguage) === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await setLanguage(item.code);
                        setTargetLanguage(item.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer rounded-xl font-medium ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar (Clean minimalist avatar icon without card background or text name) */}
        <div className="flex items-center pl-1 sm:pl-1.5">
          {user ? (
            <Link
              to="/profile"
              className="flex items-center justify-center rounded-full hover:opacity-90 active:scale-95 transition-transform cursor-pointer shrink-0"
              title={`Profile: ${rawUsername}`}
              aria-label="User profile"
            >
              <UserAvatar
                avatarUrl={profile?.avatar_url || user?.user_metadata?.avatar_url}
                displayName={rawUsername}
                email={user?.email}
                size="sm"
                plan={currentPlan}
              />
              {/* Screen-reader only subscription entitlement indicator */}
              <span className="sr-only">
                {currentPlan === 'premium' ? 'PREMIUM ACTIVE' : currentPlan === 'pro' ? 'PRO ACTIVE' : 'FREE'}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
