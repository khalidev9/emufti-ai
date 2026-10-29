import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  durationMs?: number;
}

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}

const COLORS = [
  '#2563EB', // Royal Blue
  '#3B82F6', // Blue 500
  '#F59E0B', // Amber 500 (Gold)
  '#10B981', // Emerald 500
  '#8B5CF6', // Purple 500
  '#EC4899', // Pink 500
  '#F43F5E', // Rose 500
];

export const QuizConfetti: React.FC<ConfettiProps> = ({
  active,
  onComplete,
  durationMs = 2400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to full window
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();

    // Spawn 80 particles
    const particles: Particle[] = [];
    const count = 80;
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 6;
      particles.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY + (Math.random() - 0.5) * 60,
        w: Math.random() * 8 + 6,
        h: Math.random() * 12 + 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // Slight initial upward push
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star',
      });
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.vx *= 0.985; // Air drag
        p.rotation += p.vRot;
        p.opacity = Math.max(0, 1 - progress * 1.2);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(Math.cos(((18 + s * 72) * Math.PI) / 180) * (p.w / 1.5), -Math.sin(((18 + s * 72) * Math.PI) / 180) * (p.w / 1.5));
            ctx.lineTo(Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.w / 3), -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.w / 3));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, durationMs, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};
