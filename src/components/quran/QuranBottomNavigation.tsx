import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Mic,
  LayoutGrid,
  MoreHorizontal,
  X,
  Scroll,
  Headphones,
  Heart,
  RotateCcw,
  Bookmark,
  Calendar,
  Compass,
  MessageSquare,
  Trophy,
  Settings,
  HelpCircle,
} from 'lucide-react';

export type QuranNavTab =
  | 'quran'
  | 'subcis'
  | '50qaris'
  | 'tafsir'
  | 'planner'
  | 'finder'
  | 'duas'
  | 'tasbeeh'
  | 'bookmarks';

interface QuranBottomNavigationProps {
  activeTab: QuranNavTab;
  onSelectTab: (tab: QuranNavTab) => void;
  uiLanguage?: 'en' | 'so' | 'ar';
}

export const QuranBottomNavigation: React.FC<QuranBottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  uiLanguage = 'so',
}) => {
  const [isOtherDrawerOpen, setIsOtherDrawerOpen] = useState(false);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  // Group secondary tabs under "Other"
  const isOtherActive = [
    'tafsir',
    'duas',
    'tasbeeh',
    'bookmarks',
    'planner',
    'finder',
  ].includes(activeTab);

  const getReadLabel = () => {
    if (uiLanguage === 'ar') return 'قراءة';
    if (uiLanguage === 'so') return 'Akhris';
    return 'Read';
  };

  const getQariLabel = () => {
    if (uiLanguage === 'ar') return 'القرّاء';
    if (uiLanguage === 'so') return 'Qaari';
    return 'Reciters';
  };

  const getSubcisLabel = () => {
    if (uiLanguage === 'ar') return 'تسميع';
    return 'Subcis';
  };

  const getOtherLabel = () => {
    if (uiLanguage === 'ar') return 'أخرى';
    if (uiLanguage === 'so') return 'Kala Duwan';
    return 'Other';
  };

  const getMoreLabel = () => {
    if (uiLanguage === 'ar') return 'المزيد';
    if (uiLanguage === 'so') return 'Dheeraad';
    return 'More';
  };

  // 1. Read, 2. Subcis, 3. Qaari, 4. Other, 5. More
  const QURAN_PRIMARY_ITEMS = [
    {
      id: 'quran' as const,
      label: getReadLabel(),
      icon: BookOpen,
      isActive: activeTab === 'quran',
      onClick: () => {
        onSelectTab('quran');
        setIsOtherDrawerOpen(false);
        setIsMoreDrawerOpen(false);
      },
    },
    {
      id: 'subcis' as const,
      label: getSubcisLabel(),
      icon: Mic,
      isActive: activeTab === 'subcis',
      badge: 'NEW',
      onClick: () => {
        onSelectTab('subcis');
        setIsOtherDrawerOpen(false);
        setIsMoreDrawerOpen(false);
      },
    },
    {
      id: '50qaris' as const,
      label: getQariLabel(),
      icon: Headphones,
      isActive: activeTab === '50qaris',
      onClick: () => {
        onSelectTab('50qaris');
        setIsOtherDrawerOpen(false);
        setIsMoreDrawerOpen(false);
      },
    },
    {
      id: 'other' as const,
      label: getOtherLabel(),
      icon: LayoutGrid,
      isActive: isOtherActive,
      onClick: () => {
        setIsOtherDrawerOpen(true);
        setIsMoreDrawerOpen(false);
      },
    },
    {
      id: 'more' as const,
      label: getMoreLabel(),
      icon: MoreHorizontal,
      isActive: false,
      onClick: () => {
        setIsMoreDrawerOpen(true);
        setIsOtherDrawerOpen(false);
      },
    },
  ];

  // Secondary Quran Modules for "Other" Drawer
  const OTHER_QURAN_TOOLS: Array<{
    id: QuranNavTab;
    titleSo: string;
    titleEn: string;
    titleAr: string;
    descSo: string;
    descEn: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
  }> = [
    {
      id: 'tafsir',
      titleSo: 'Somali Tafsiir',
      titleEn: 'Somali Tafsir',
      titleAr: 'التفسير الصومالي',
      descSo: 'Tafsiirka Sheikh Mustafe & Culimada',
      descEn: 'Scholarly Tafsir (Sheikh Mustafe, Sheikh Omar Farooq)',
      icon: Scroll,
      colorClass: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      id: '50qaris',
      titleSo: 'Qaari',
      titleEn: 'Qaari',
      titleAr: 'القرّاء',
      descSo: 'Qurxinta codadka quraanka iyo quraaga',
      descEn: 'All 114 Surahs for verified reciters',
      icon: Headphones,
      colorClass: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      id: 'duas',
      titleSo: 'Ducooyinka & Adhkaarta',
      titleEn: 'Dua & Supplications',
      titleAr: 'الأدعية المأثورة',
      descSo: 'Ducooyinka Nabiga (NNKH) iyo Quraanka',
      descEn: 'Quranic and authentic prophetic supplications',
      icon: Heart,
      colorClass: 'bg-rose-500/10 text-rose-600',
    },
    {
      id: 'tasbeeh',
      titleSo: 'Tasbiix Digital ah',
      titleEn: 'Digital Tasbeeh',
      titleAr: 'تسبيح وذكر',
      descSo: 'Tirokoobka dikriga iyo tasbiixda',
      descEn: 'Digital counter with authentic adhkar',
      icon: RotateCcw,
      colorClass: 'bg-amber-500/10 text-amber-600',
    },
    {
      id: 'bookmarks',
      titleSo: 'Aayadaha Keydsan',
      titleEn: 'Saved Content',
      titleAr: 'العلامات المحفوظة',
      descSo: 'Calaamadaha & taariikhdaada akhriska',
      descEn: 'Bookmarked verses and saved reading history',
      icon: Bookmark,
      colorClass: 'bg-purple-500/10 text-purple-600',
    },
    {
      id: 'finder',
      titleSo: 'Raadi Meeshaad Joogto',
      titleEn: 'Progress Index',
      titleAr: 'مؤشر التقدم',
      descSo: 'Juz, Xisbi, Rubac iyo bogagga',
      descEn: 'Locate verse, juz, hizb, and rub',
      icon: Compass,
      colorClass: 'bg-cyan-500/10 text-cyan-600',
    },
    {
      id: 'planner',
      titleSo: 'Qorshaha Khatimka',
      titleEn: 'Khatm Planner',
      titleAr: 'مخطط الختمة',
      descSo: 'Bartilmaameedyada khatimka Quraanka',
      descEn: 'Daily targets and Khatm completion plan',
      icon: Calendar,
      colorClass: 'bg-teal-500/10 text-teal-600',
    },
  ];

  return (
    <>
      {/* Fixed Quran Mobile Bottom Navigation Bar (Persistent 5 Destinations: Read, Macallin, Subcis, Other, More) */}
      <nav
        aria-label="Quran Section Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-lg shadow-black/10 px-1 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] select-none"
        style={{ direction: 'ltr' }}
      >
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto items-center">
          {QURAN_PRIMARY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center h-full py-1 min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer relative ${
                  item.isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      item.isActive
                        ? 'bg-emerald-500/15 scale-105'
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 px-1 py-0 text-[7px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 dark:text-white rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] tracking-tight mt-0.5 font-medium truncate max-w-[62px]">
                  {item.label}
                </span>

                {item.isActive && (
                  <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Slide-Up Drawer for "Other" Quran Tools */}
      {isOtherDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsOtherDrawerOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-card border-t border-border rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 z-10 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">
                  {uiLanguage === 'so'
                    ? "Adeegyada Kale ee Qur'aanka"
                    : uiLanguage === 'ar'
                    ? 'أدوات وأقسام القرآن الكريم'
                    : 'Other Quran Tools & Features'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOtherDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of Other Quran Tools */}
            <div className="grid grid-cols-2 gap-2.5">
              {OTHER_QURAN_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isSelected = activeTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(tool.id);
                      setIsOtherDrawerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 relative cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'bg-muted/40 border-border/80 hover:bg-muted text-foreground'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : tool.colorClass
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {uiLanguage === 'so'
                          ? tool.titleSo
                          : uiLanguage === 'ar'
                          ? tool.titleAr
                          : tool.titleEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {uiLanguage === 'so' ? tool.descSo : tool.descEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Slide-Up Drawer for "More" (App Learning Hub & Global Navigation) */}
      {isMoreDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMoreDrawerOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-card border-t border-border rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 z-10 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Islamic Learning Workspace
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick App Destinations Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/dashboard"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Dashboard</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Overview & Progress</span>
                </div>
              </Link>

              <Link
                to="/chat"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">AI Mufti Chat</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Islamic Inquiries</span>
                </div>
              </Link>

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
                  <span className="text-[10px] text-muted-foreground block truncate">Preferences</span>
                </div>
              </Link>

              <Link
                to="/help"
                onClick={() => setIsMoreDrawerOpen(false)}
                className="col-span-2 p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Help Center & Support</span>
                  <span className="text-[10px] text-muted-foreground block truncate">Scholarly tickets & FAQ</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
