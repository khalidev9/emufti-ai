import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MacallinTeacher } from '../components/quran/MacallinTeacher';
import { ALL_50_QARIS } from '../data/qarisData';
import { QariReciter } from '../types/database';
import { BottomNavigation } from '../components/layout/BottomNavigation';

export const MacallinPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [selectedQari, setSelectedQari] = useState<QariReciter>(ALL_50_QARIS[0]);

  const uiLang = (language === 'so' || language === 'ar' || language === 'en') ? language : 'so';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-20 lg:pb-8">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              M
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                Macallin <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Quran Recitation, Tajweed & Hifd Teacher
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/chat"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Assistant</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        <MacallinTeacher
          userId={user?.id}
          uiLanguage={uiLang}
          selectedQari={selectedQari}
          onChangeQari={setSelectedQari}
          onNavigateToSurah={(sNum) => {
            console.log('Selected Surah:', sNum);
          }}
        />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MacallinPage;
