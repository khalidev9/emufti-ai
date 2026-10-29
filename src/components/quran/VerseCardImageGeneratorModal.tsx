import React, { useRef, useState } from 'react';
import { X, Download, Copy, Check, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface VerseCardImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  translationLanguage?: string;
}

export const VerseCardImageGeneratorModal: React.FC<VerseCardImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  surahName,
  surahNumber,
  ayahNumber,
  arabicText,
  translationText,
  translationLanguage = 'Somali',
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const generateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1080;

    // Gradient Background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#0f172a'); // slate-900
    gradient.addColorStop(0.5, '#1e293b'); // slate-800
    gradient.addColorStop(1, '#1e3a8a'); // blue-900
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative Borders
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1000);

    ctx.strokeStyle = '#60a5fa33';
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, 970, 970);

    // Header: Surah & Ayah
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${surahName} (${surahNumber}:${ayahNumber})`, 540, 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillText('THE HOLY QURAN · QUR\'AANKA KARIIMKA AH', 540, 175);

    // Divider
    ctx.strokeStyle = '#3b82f644';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(340, 210);
    ctx.lineTo(740, 210);
    ctx.stroke();

    // Arabic Ayah
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Traditional Arabic", "Amiri", "Scheherazade New", serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    // Word wrap helper for Arabic
    const words = arabicText.split(' ');
    let line = '';
    let y = 340;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 900 && n > 0) {
        ctx.fillText(line.trim(), 540, y);
        line = words[n] + ' ';
        y += 85;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 540, y);

    // Translation Divider
    y += 70;
    ctx.direction = 'ltr';
    ctx.strokeStyle = '#3b82f644';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(400, y);
    ctx.lineTo(680, y);
    ctx.stroke();
    y += 50;

    // Translation Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '30px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    const transWords = translationText.split(' ');
    let transLine = '';
    for (let n = 0; n < transWords.length; n++) {
      const testLine = transLine + transWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 880 && n > 0) {
        ctx.fillText(transLine.trim(), 540, y);
        transLine = transWords[n] + ' ';
        y += 45;
      } else {
        transLine = testLine;
      }
    }
    ctx.fillText(transLine.trim(), 540, y);

    // Footer Branding: EMufti AI
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillText('EMufti AI · Islamic Intelligence & Holy Quran', 540, 990);

    return canvas;
  };

  const handleDownload = () => {
    setDownloading(true);
    const canvas = generateCanvas();
    if (!canvas) {
      setDownloading(false);
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `EMufti_Verse_${surahNumber}_${ayahNumber}.png`;
    link.href = dataUrl;
    link.click();
    setDownloading(false);
  };

  const handleCopyImage = async () => {
    const canvas = generateCanvas();
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch {
      // Fallback: copy text
      navigator.clipboard.writeText(`${arabicText}\n\n${translationText}\n— ${surahName} (${surahNumber}:${ayahNumber}) via EMufti AI`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Kaadhka Aayadda (Shareable Verse Card)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Live Preview Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-blue-500/30 text-center space-y-4 shadow-xl">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
              {surahName} ({surahNumber}:{ayahNumber})
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">
              THE HOLY QURAN
            </span>
          </div>

          <p className="text-xl sm:text-2xl font-bold font-serif leading-relaxed text-white select-all" dir="rtl">
            « {arabicText} »
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic border-t border-slate-800 pt-3">
            "{translationText}"
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-blue-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>EMufti AI · Islamic Intelligence</span>
          </div>
        </div>

        {/* Hidden Canvas for High-Resolution Export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopyImage}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-blue-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'La koobiyey!' : 'Koobiyeey Sawirka'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Soo degaya...' : 'Soo Dejiso PNG (1080x1080)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
