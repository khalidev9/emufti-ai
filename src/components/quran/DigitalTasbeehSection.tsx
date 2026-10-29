import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Target,
  Trophy,
  Plus,
  Play,
  Pause,
} from 'lucide-react';
import { TASBEEH_PRESETS } from '../../data/tasbeehData';
import { TasbeehPreset } from '../../types/database';

export const DigitalTasbeehSection: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<TasbeehPreset>(TASBEEH_PRESETS[0]);
  const [count, setCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emufti_tasbeeh_count');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [target, setTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emufti_tasbeeh_target');
      return saved ? parseInt(saved, 10) || 33 : 33;
    } catch {
      return 33;
    }
  });
  const [roundsCompleted, setRoundsCompleted] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emufti_tasbeeh_rounds');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>('');
  const [isCustomTargetOpen, setIsCustomTargetOpen] = useState<boolean>(false);

  // Audio Context for click beep sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = (isTargetReached = false) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        if (isTargetReached) {
          osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1174, audioCtxRef.current.currentTime + 0.15);
          gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.25);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.25);
        } else {
          osc.frequency.setValueAtTime(520, audioCtxRef.current.currentTime);
          gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.08);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.08);
        }
      }
    } catch {}
  };

  const triggerVibration = (pattern: number[] = [35]) => {
    if (!vibrateEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {}
  };

  // Keyboard navigation: Spacebar increments counter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        handleIncrement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('emufti_tasbeeh_count', count.toString());
      localStorage.setItem('emufti_tasbeeh_target', target.toString());
      localStorage.setItem('emufti_tasbeeh_rounds', roundsCompleted.toString());
    } catch {}
  }, [count, target, roundsCompleted]);

  const handleIncrement = () => {
    const next = count + 1;
    if (next >= target) {
      setCount(0);
      setRoundsCompleted((prev) => prev + 1);
      playClickSound(true);
      triggerVibration([70, 50, 70]);
    } else {
      setCount(next);
      playClickSound(false);
      triggerVibration([30]);
    }
  };

  const handleSelectPreset = (preset: TasbeehPreset) => {
    setSelectedPreset(preset);
    setTarget(preset.default_target || 33);
  };

  const handleReset = () => {
    setCount(0);
    setRoundsCompleted(0);
    setShowResetConfirm(false);
  };

  const handleApplyCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val) && val > 0 && val <= 100000) {
      setTarget(val);
      setIsCustomTargetOpen(false);
      setCustomTargetInput('');
    }
  };

  const progressPercent = Math.min(100, Math.round((count / target) * 100));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20 mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>Tasbeex Dijitaal ah (Digital Dhikr Counter)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Xusuusta Alle (Adkaar & Tasbeex)
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-md mx-auto">
          Qabo tasbeexda maalinlaha ah, dooro tirada aad beegsanayso, oo la soco wareegyada aad dhammaystirtay.
        </p>
      </div>

      {/* Preset Adhkar Selector */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Dooro Dikriga (Select Dhikr Preset)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TASBEEH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedPreset.id === preset.id
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="font-arabic text-base sm:text-lg text-slate-900 font-bold mb-1">
                {preset.arabic}
              </div>
              <div className="text-xs font-bold text-slate-800 truncate">
                {preset.transliteration}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {preset.translation_so}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Counter Sphere Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-6">
        {/* Active Dhikr Display */}
        <div className="space-y-1">
          <div className="font-arabic text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 leading-relaxed">
            {selectedPreset.arabic}
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-800">
            {selectedPreset.transliteration}
          </div>
          <div className="text-xs text-slate-500">
            {selectedPreset.translation_so}
          </div>
          {selectedPreset.hadith_reference && (
            <div className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200/80 inline-block px-3 py-1 rounded-full font-medium mt-2">
              {selectedPreset.hadith_reference}
            </div>
          )}
        </div>

        {/* Big Tap Button / Counter Sphere */}
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleIncrement}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none border-4 border-blue-200/50 group focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            title="Guji ama riix Spacebar si aad u tiriso"
          >
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight group-hover:scale-105 transition-transform">
              {count}
            </span>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">
              Guji / Tap
            </span>
            <span className="text-[11px] text-blue-200 font-mono">
              Beegsiga: {target}
            </span>
          </button>
          <span className="text-[11px] text-slate-400 mt-3 hidden sm:block">
            Talo: Waxaad sidoo kale isticmaali kartaa furaha <strong>Spacebar</strong> ee keyboard-ka.
          </span>
        </div>

        {/* Progress Bar & Target Display */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Dhammaystirka</span>
            <span className="font-mono text-blue-600">{count} / {target} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Target Buttons (33, 99, 100, Custom) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>Tirada Beegsiga:</span>
          </span>
          {[33, 99, 100].map((tVal) => (
            <button
              key={tVal}
              onClick={() => setTarget(tVal)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                target === tVal && !isCustomTargetOpen
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tVal}
            </button>
          ))}
          <button
            onClick={() => setIsCustomTargetOpen(!isCustomTargetOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isCustomTargetOpen || ![33, 99, 100].includes(target)
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tiro Kale... {![33, 99, 100].includes(target) ? `(${target})` : ''}
          </button>
        </div>

        {/* Custom Target Form Popover */}
        {isCustomTargetOpen && (
          <form onSubmit={handleApplyCustomTarget} className="max-w-xs mx-auto flex items-center gap-2 pt-1 animate-in fade-in">
            <input
              type="number"
              min={1}
              max={100000}
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(e.target.value)}
              placeholder="Geli tirada (tusaale: 500)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Dhig
            </button>
          </form>
        )}

        {/* Stats & Control Bar: Rounds, Sound, Vibration, Reset */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Rounds Completed */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-medium text-slate-600">
              Wareegyada: <strong className="text-slate-900 font-bold">{roundsCompleted}</strong>
            </span>
          </div>

          {/* Sound & Vibration Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={soundEnabled ? 'Codka waa shidan yahay' : 'Codka waa damisan yahay'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                vibrateEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={vibrateEnabled ? 'Gariirka waa shidan yahay (Mobile)' : 'Gariirka waa damisan yahay'}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
              title="Dib u bilaab tirada"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Ma hubtaa inaad dib u bilaabayso tirada?</span>
            </div>
            <p className="text-xs text-rose-700">
              Tirada hadda ({count}) iyo wareegyada dhammaystiran ({roundsCompleted}) waxaa dib looga bilaabi doonaa 0.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Iska daa
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Haa, Dib u billow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
