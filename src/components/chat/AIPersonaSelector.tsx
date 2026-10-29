import React, { useState } from 'react';
import { Sparkles, BookOpen, Scale, Compass, Heart, Check, ChevronDown } from 'lucide-react';
import { storage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';

export interface AIPersona {
  id: 'mufti' | 'tafsir' | 'fiqh' | 'youth' | 'spiritual';
  titleSomali: string;
  titleEnglish: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AI_PERSONAS: AIPersona[] = [
  {
    id: 'mufti',
    titleSomali: 'Mufti Guud (General Scholar)',
    titleEnglish: 'Sunnah & Scholarly Consensus',
    desc: 'Balanced rulings adhering to authentic Quran, Sunnah, and recognized consensus.',
    icon: Sparkles,
  },
  {
    id: 'tafsir',
    titleSomali: 'Khabiirka Tafsiirka (Tafsir Expert)',
    titleEnglish: 'Quranic Exegesis & Revelation Context',
    desc: 'Deep verse analysis, Asbab al-Nuzul (revelation contexts), and classical commentaries.',
    icon: BookOpen,
  },
  {
    id: 'fiqh',
    titleSomali: 'Khabiirka Fiqhiga (Fiqh Specialist)',
    titleEnglish: 'Comparative Juristic Methodologies',
    desc: 'Systematic Usul al-Fiqh derivations and comparative viewpoints of the four Madhhabs.',
    icon: Scale,
  },
  {
    id: 'youth',
    titleSomali: 'Dhalinyarada (Youth & New Muslim Mentor)',
    titleEnglish: 'Accessible & Compassionate Guide',
    desc: 'Gentle, foundational explanations tailored for new seekers and youth.',
    icon: Compass,
  },
  {
    id: 'spiritual',
    titleSomali: 'Qalbiga & Tazkiyah (Spiritual Counselor)',
    titleEnglish: 'Purification of Heart & Duas',
    desc: 'Heart medicine, overcoming hardships through patience, Adhkar, and prophetic supplications.',
    icon: Heart,
  },
];

interface AIPersonaSelectorProps {
  currentPersona?: string;
  onSelectPersona?: (personaId: string) => void;
  compact?: boolean;
}

export const AIPersonaSelector: React.FC<AIPersonaSelectorProps> = ({
  currentPersona,
  onSelectPersona,
  compact = false,
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'seeker_user';

  const [selectedId, setSelectedId] = useState<string>(() => {
    return (
      currentPersona ||
      localStorage.getItem('emufti_ai_persona') ||
      storage.getSettings(userId).ai_persona ||
      'mufti'
    );
  });
  const [isOpen, setIsOpen] = useState(false);

  const activePersona = AI_PERSONAS.find((p) => p.id === selectedId) || AI_PERSONAS[0];
  const ActiveIcon = activePersona.icon;

  const handleSelect = (id: 'mufti' | 'tafsir' | 'fiqh' | 'youth' | 'spiritual') => {
    setSelectedId(id);
    localStorage.setItem('emufti_ai_persona', id);
    const curr = storage.getSettings(userId);
    storage.saveSettings(userId, { ...curr, ai_persona: id });
    onSelectPersona?.(id);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          title="Select AI Persona"
        >
          <ActiveIcon className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[110px] sm:max-w-none">{activePersona.titleSomali.split('(')[0]}</span>
          <ChevronDown className="w-3 h-3 text-blue-600" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-40 space-y-1 animate-in fade-in">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-1 block">
              Dooro Habka AI Muftiga (AI Persona):
            </span>
            {AI_PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="block font-bold">{p.titleSomali}</span>
                    <span className="text-[10px] text-slate-600 font-medium block leading-tight">{p.titleEnglish}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Habka AI Muftiga (AI Persona Mode)</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Personalized
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {AI_PERSONAS.map((p) => {
          const Icon = p.icon;
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-800'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-slate-200'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate">{p.titleSomali}</span>
                <span className="text-[10px] text-slate-600 font-medium block leading-tight mt-0.5">{p.desc}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
