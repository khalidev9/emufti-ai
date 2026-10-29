import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  BookOpen,
  Mic,
  Trophy,
  MoreHorizontal,
  Bookmark,
  Scroll,
  Settings,
  HelpCircle,
  X,
  TrendingUp,
  User,
  CreditCard,
  LogOut,
  GraduationCap,
  Heart,
  RotateCcw,
  Sparkles,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SubscriptionBadge } from '../common/SubscriptionBadge';

export interface BottomNavigationProps {
  isHidden?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ isHidden = false }) => {
  const location = useLocation();
  const { user, profile, activePlan, signOut } = useAuth();
  const { language, t } = useLanguage();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  if (isHidden) return null;

  const currentPath = location.pathname;

  const getHomeLabel = () => {
    if (language === 'so') return 'Hoy';
    if (language === 'ar') return 'الرئيسية';
    return t('nav.home', 'Home');
  };

  const getChatLabel = () => {
    if (language === 'so') return 'Wadahadal';
    if (language === 'ar') return 'المحادثة';
    return t('nav.chat_short', 'Chat');
  };

  const getQuranLabel = () => {
    if (language === 'so') return "Qur'aan";
    if (language === 'ar') return 'القرآن';
    return t('nav.quran_short', 'Quran');
  };

  const getProfileLabel = () => {
    if (language === 'so') return 'Xisaabta';
    if (language === 'ar') return 'الملف';
    return t('nav.profile_short', 'Profile');
  };

  const getMoreLabel = () => {
    if (language === 'so') return 'Dheeraad';
    if (language === 'ar') return 'المزيد';
    return t('nav.more', 'More');
  };

  // Primary Touch Destinations: Home, Chat, Quran Center, Saved, Profile
  const PRIMARY_TABS = [
    {
      to: '/dashboard',
      label: getHomeLabel(),
      icon: Home,
      isActive: currentPath === '/' || currentPath === '/dashboard',
    },
    {
      to: '/chat',
      label: getChatLabel(),
      icon: MessageSquare,
      isActive: currentPath.startsWith('/chat'),
    },
    {
      to: '/quran',
      label: getQuranLabel(),
      icon: BookOpen,
      isActive: currentPath.startsWith('/quran'),
    },
    {
      to: '/saved',
      label: 'Saved',
      icon: Bookmark,
      isActive: currentPath.startsWith('/saved'),
    },
    {
      to: user ? '/profile' : '/settings',
      label: getProfileLabel(),
      icon: User,
      isActive: currentPath === '/profile' || currentPath.startsWith('/settings') || currentPath === '/billing',
    },
  ];

  return (
    <>
      {/* Bottom Floating / Fixed Mobile Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#121212] border-t border-stone-200/80 dark:border-white/10 px-2 pt-1.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] shadow-xs select-none"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex-1 flex flex-col items-center justify-center py-0.5 min-h-[48px] rounded-xl transition-colors cursor-pointer ${
                  tab.isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${tab.isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                </div>
                <span className="text-[11px] tracking-tight mt-0.5 truncate max-w-[64px]">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Slide-up "More" Bottom Sheet Drawer */}
      {isMoreDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMoreDrawerOpen(false)}
          />

          {/* Sheet Container */}
          <div className="relative bg-card border-t border-border rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 z-10 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Islamic Learning Hub
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Close drawer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hub Sections Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 0. Islamic Quiz & Leaderboard */}
              <Link
                to="/quiz"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-3 cursor-pointer col-span-2 sm:col-span-1"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">EMufti Quiz & Leaderboard</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block truncate">Tartanka & Kaalmaha</span>
                </div>
              </Link>

              {/* 1. Subcis Recitation */}
              <Link
                to="/quran?tab=subcis"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Subcis</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Alternating Recitation</span>
                </div>
              </Link>

              {/* 2. 50 Reciters */}
              <Link
                to="/quran?tab=50qaris"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">50 Reciters</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Global Qurra</span>
                </div>
              </Link>

              {/* 3. AI Chat */}
              <Link
                to="/chat"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">AI Chat</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Inquire Shariah</span>
                </div>
              </Link>

              {/* 4. Pricing Plans */}
              <Link
                to="/pricing"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Plans</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Upgrade Access</span>
                </div>
              </Link>

              {/* 5. Support */}
              <Link
                to="/help"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Help Center</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Guides & FAQ</span>
                </div>
              </Link>

              {/* 6. Bookmarks / Saved Proofs */}
              <Link
                to="/saved"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Saved Items</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Bookmarks & Fatawa</span>
                </div>
              </Link>

              {/* 7. Progress & Activity */}
              <Link
                to="/learning"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Progress</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Activity Records</span>
                </div>
              </Link>

              {/* 8. User Profile */}
              <Link
                to="/profile"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Profile</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Account Details</span>
                </div>
              </Link>

              {/* 9. Settings */}
              <Link
                to="/settings"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Settings</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Preferences & App</span>
                </div>
              </Link>

              {/* 10. Plans & Quotas */}
              <Link
                to="/pricing"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Plans</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Upgrade Quota</span>
                </div>
              </Link>
            </div>

            {/* Profile Bar / Sign Out or Sign In */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {(profile?.display_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {profile?.display_name || user.email?.split('@')[0]}
                      </span>
                      <div className="mt-0.5">
                        <SubscriptionBadge plan={activePlan} size="xs" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      signOut();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Guest Explorer</span>
                  <Link
                    to="/login"
                    onClick={() => setIsMoreDrawerOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
