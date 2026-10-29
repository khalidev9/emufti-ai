import React, { useEffect, useRef, useState } from 'react';
import { Mic, Activity } from 'lucide-react';

interface LiveAudioVisualizerProps {
  isListening: boolean;
  stream: MediaStream | null;
  label?: string;
  theme?: 'blue' | 'emerald';
}

export const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps> = ({
  isListening,
  stream,
  label = 'Codkaaga waa la dhageysanayaa...',
  theme = 'blue',
}) => {
  const [volumeBars, setVolumeBars] = useState<number[]>([15, 20, 30, 20, 15, 25, 40, 25, 15, 20, 30, 20, 15]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!isListening) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
        audioContextRef.current = null;
      }
      setVolumeBars([12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]);
      return;
    }

    if (stream && stream.active) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.6;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateBars = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Sample 13 frequency points evenly
          const barsCount = 13;
          const step = Math.max(1, Math.floor(dataArray.length / barsCount));
          const newBars: number[] = [];

          for (let i = 0; i < barsCount; i++) {
            const raw = dataArray[i * step] || 0;
            // Map 0-255 to percentage 12-100%
            const pct = Math.min(100, Math.max(14, Math.round((raw / 255) * 100)));
            newBars.push(pct);
          }

          setVolumeBars(newBars);
          animationFrameRef.current = requestAnimationFrame(updateBars);
        };

        updateBars();
      } catch (e) {
        console.warn('[LiveAudioVisualizer] Web Audio setup fallback:', e);
        // Fallback simulation if AudioContext is blocked
        const interval = setInterval(() => {
          setVolumeBars((prev) =>
            prev.map(() => Math.floor(Math.random() * 65) + 20)
          );
        }, 120);
        return () => clearInterval(interval);
      }
    } else {
      // Stream not provided but isListening is true: fallback pulsing bars
      const interval = setInterval(() => {
        setVolumeBars((prev) =>
          prev.map(() => Math.floor(Math.random() * 60) + 25)
        );
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [isListening, stream]);

  if (!isListening) return null;

  const barColor =
    theme === 'emerald'
      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 dark:from-emerald-500 dark:to-teal-300'
      : 'bg-gradient-to-t from-blue-600 to-cyan-400 dark:from-blue-500 dark:to-cyan-300';

  const badgeColor =
    theme === 'emerald'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';

  return (
    <div className="w-full max-w-md mx-auto my-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between w-full px-1">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <Mic className="w-3.5 h-3.5 shrink-0" />
          <span className="tracking-wide uppercase text-[10px]">WAA LA DHAGEYSANAYAA</span>
        </div>

        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span className="hidden sm:inline">Mic Active</span>
        </span>
      </div>

      {/* Visualizer Waveform Flex Bars */}
      <div className="flex items-end justify-center gap-1.5 h-12 w-full px-4 py-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
        {volumeBars.map((pct, idx) => (
          <div
            key={idx}
            className={`w-2 rounded-full transition-all duration-75 ${barColor} shadow-2xs`}
            style={{
              height: `${pct}%`,
              opacity: Math.max(0.4, pct / 100),
            }}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center truncate max-w-full">
        {label}
      </p>
    </div>
  );
};
