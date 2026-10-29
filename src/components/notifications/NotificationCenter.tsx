import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Sparkles,
  Trophy,
  BookOpen,
  ShieldCheck,
  X,
  ExternalLink,
  Clock,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserNotification } from '../../types/database';

interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'feature' | 'quiz' | 'quran';
  link?: string;
  linkText?: string;
  created_at: string;
  is_read?: boolean;
}

const DEFAULT_BROADCASTS: BroadcastNotification[] = [
  {
    id: 'broadcast-quiz-2000',
    title: 'EMufti Quiz: 2,000 Su’aalood oo Cusub!',
    message: 'Nidaamka tartan cilmiyeedka E-Mufti AI oo leh 2,000 su’aalood, lifelines (50/50, Weydii EMufti), iyo Leaderboard ayaa diyaar ah.',
    type: 'quiz',
    link: '/quiz',
    linkText: 'Bilow Imtixaanka',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 'broadcast-quran-reciters',
    title: '50 Qaari & Tafsiirka Culimada Soomaaliyeed',
    message: 'Mushafka Madinah hadda wuxuu leeyahay 50 codad oo Qaariyaal caalami ah, tafsiir cod iyo qoraal ah (Sheikh Mustafe, Sheikh Cumar Faaruuq), iyo Subcis.',
    type: 'quran',
    link: '/quran',
    linkText: 'Fur Qur’aanka',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'broadcast-ai-gemini',
    title: 'Muuqaalka Cusub ee EMufti AI (Gemini Design)',
    message: 'Waxaan casriyeynay foomka wada-hadalka iyo ka jawaabista cilmiga diinta si dhakhso ah oo tixraacyo sugan wata.',
    type: 'feature',
    link: '/chat',
    linkText: 'Weydii Su’aal',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

const LOCAL_READ_NOTIFS_KEY = 'emufti_read_broadcast_notifs';

export const NotificationCenter: React.FC = () => {
  const { user, notifications: dbNotifications, markNotificationAsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [readBroadcastIds, setReadBroadcastIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_READ_NOTIFS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Combine broadcast updates with user-specific notifications
  const allNotifications = useMemo(() => {
    const broadcastsFormatted: UserNotification[] = DEFAULT_BROADCASTS.map((b) => ({
      id: b.id,
      user_id: user?.id || 'broadcast',
      title: b.title,
      message: b.message,
      type: 'system',
      is_read: readBroadcastIds.includes(b.id),
      created_at: b.created_at,
      metadata: {
        link: b.link,
        linkText: b.linkText,
        badgeType: b.type,
      },
    }));

    // Deduplicate against dbNotifications
    const combined = [...dbNotifications];
    for (const b of broadcastsFormatted) {
      if (!combined.some((n) => n.id === b.id)) {
        combined.push(b);
      }
    }

    return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [dbNotifications, readBroadcastIds, user?.id]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.is_read).length;
  }, [allNotifications]);

  const displayedNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return allNotifications.filter((n) => !n.is_read);
    }
    return allNotifications;
  }, [allNotifications, activeTab]);

  const handleMarkAsRead = (id: string) => {
    if (id.startsWith('broadcast-')) {
      if (!readBroadcastIds.includes(id)) {
        const next = [...readBroadcastIds, id];
        setReadBroadcastIds(next);
        try {
          localStorage.setItem(LOCAL_READ_NOTIFS_KEY, JSON.stringify(next));
        } catch {}
      }
    } else {
      markNotificationAsRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    // Mark broadcasts as read
    const allBroadcastIds = DEFAULT_BROADCASTS.map((b) => b.id);
    const merged = Array.from(new Set([...readBroadcastIds, ...allBroadcastIds]));
    setReadBroadcastIds(merged);
    try {
      localStorage.setItem(LOCAL_READ_NOTIFS_KEY, JSON.stringify(merged));
    } catch {}

    // Mark DB notifications as read
    for (const n of dbNotifications) {
      if (!n.is_read) {
        markNotificationAsRead(n.id);
      }
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Hadda';
      if (diffMins < 60) return `${diffMins}d kahor`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}s kahor`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} maalmood kahor`;
    } catch {
      return '';
    }
  };

  const renderBadgeIcon = (notif: UserNotification) => {
    const badgeType = notif.metadata?.badgeType || notif.type;
    if (badgeType === 'quiz') {
      return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (badgeType === 'quran') {
      return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (badgeType === 'plan_activation') {
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl transition-all cursor-pointer ${
          isOpen
            ? 'bg-blue-50 text-blue-600'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Ogeysiisyada (Notifications)"
        aria-label="Notification Center"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-slate-600 hover:text-slate-900" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notification Center Panel with React Portal to prevent clipping */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-4 sm:pt-16 sm:pr-8 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          >
            <div
              ref={panelRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Ogeysiisyada</h3>
                    <span className="text-[10px] text-slate-500">
                      {unreadCount > 0 ? `${unreadCount} cusub` : 'Wax cusub ma jiraan'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-100/60 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Dhammaan calaamadee sidii la akhriyay"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Akhrin wadaag</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                    title="Xidh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-3 pt-2 pb-1.5 border-b border-slate-100 flex items-center gap-1.5 bg-white">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dhammaan ({allNotifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'unread'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cusub ({unreadCount})
                </button>
              </div>

              {/* List Content */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 bg-white">
                {displayedNotifications.length === 0 ? (
                  <div className="py-10 px-4 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Ogeysiis cusub ma jiro</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dhammaan wararka iyo ogeysiisyadaadu waa kuwo la akhriyay.
                    </p>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => {
                    const isRead = Boolean(notif.is_read);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-3.5 transition-colors cursor-pointer text-left relative flex items-start gap-3 hover:bg-slate-50 ${
                          !isRead ? 'bg-blue-50/40' : 'bg-white'
                        }`}
                      >
                        {/* Badge Icon */}
                        <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                          {renderBadgeIcon(notif)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs ${!isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'} truncate`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>

                          {/* Optional Action Link */}
                          {notif.metadata?.link && (
                            <div className="mt-2">
                              <Link
                                to={notif.metadata.link}
                                onClick={() => {
                                  handleMarkAsRead(notif.id);
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <span>{notif.metadata.linkText || 'Faahfaahin'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Unread Blue Dot */}
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                <span className="text-[10px] text-slate-400">
                  EMufti AI • Ogeysiisyada Cilmiyeed & Qorshayaasha
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
