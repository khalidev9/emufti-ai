import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  X,
  Layers,
  ArrowRight,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ALL_30_JUZ } from '../../data/juzMetadata';
import { JuzInfo } from '../../types/database';

interface JuzFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJuzNumber?: number;
  onSelectJuz: (juz: JuzInfo) => void;
}

export const JuzFinderModal: React.FC<JuzFinderModalProps> = ({
  isOpen,
  onClose,
  selectedJuzNumber = 1,
  onSelectJuz,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return ALL_30_JUZ;
    const q = searchQuery.toLowerCase();
    return ALL_30_JUZ.filter(
      (j) =>
        j.number.toString().includes(q) ||
        j.nameArabic.includes(q) ||
        j.nameSomali.toLowerCase().includes(q) ||
        j.nameEnglish.toLowerCase().includes(q) ||
        j.startSurahName.toLowerCase().includes(q) ||
        j.startSurahArabic.includes(q) ||
        j.endSurahName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Raadi Jizzka Qur’aanka (30 Juz Finder)
              </h3>
              <p className="text-xs text-slate-500">
                Dooro mid ka mid ah 30-ka jizz ee Qur’aanka Kariimka ah
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Xir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raadi lambar, magac Carabi ama Soomaali (tusaale: 30, Amma, Sayaquul)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Juz Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredJuz.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Lama helin jizz u dhigma raadintaada.</p>
            </div>
          ) : (
            filteredJuz.map((juz) => {
              const isSelected = selectedJuzNumber === juz.number;

              return (
                <div
                  key={juz.number}
                  onClick={() => {
                    onSelectJuz(juz);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Juz Number Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl font-bold font-mono text-sm flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700'
                      }`}
                    >
                      {juz.number}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-arabic text-sm font-bold text-slate-900">
                          {juz.nameArabic}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-blue-600 text-white font-mono">
                            Hadda
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 block truncate">
                        {juz.nameSomali}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        Bilaabashada: <strong>{juz.startSurahName}</strong> (Aayadda {juz.startAyah})
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-600'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>Wadarta: <strong>30 Jizz</strong> (604 Bog ee Madinah Mushaf)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Xir
          </button>
        </div>
      </div>
    </div>
  );
};
