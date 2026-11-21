import { useEffect, useRef } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import {
  buildTextParticles,
  easeFormation,
  particleAlpha,
} from '../lib/sampleTextParticles.js';

const COLORS = {
  ink: 'rgba(6, 21, 43, 0.92)',
  accent: 'rgba(37, 185, 232, 0.35)',
};

export function ParticleFormingText({
  text,
  font,
  maxWidth = 920,
  progress,
  className = '',
  scatter = 120,
  particleSize = 2.1,
}) {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const layoutRef = useRef(null);
  const rafRef = useRef(0);

  useMotionValueEvent(progress, 'change', (value) => {
    progressRef.current = value;
  });

  useEffect(() => {
    progressRef.current = progress.get?.() ?? 0;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    layoutRef.current = buildTextParticles(text, { font, maxWidth, scatter, pad: scatter });

    const ctx = canvas.getContext('2d');
    const { points, width, height } = layoutRef.current;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (time) => {
      const form = easeFormation(particleAlpha(progressRef.current));
      const scatterAmt = 1 - form;
      const w = width;
      const h = height;

      ctx.clearRect(0, 0, w, h);

      if (form <= 0.001 && scatterAmt >= 0.99) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const cx = w * 0.5;
      const cy = h * 0.5;

      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        const wobble =
          form > 0.85
            ? Math.sin(time * 0.002 + p.seed) * (1 - form) * 2
            : Math.sin(time * 0.003 + p.seed) * scatterAmt * 4;

        const px = cx + p.x + p.sx * scatterAmt + wobble;
        const py = cy + p.y + p.sy * scatterAmt + wobble * 0.6;

        const r = particleSize * (0.45 + form * 0.55);
        ctx.beginPath();
        ctx.fillStyle = form > 0.5 ? COLORS.ink : COLORS.accent;
        ctx.globalAlpha = 0.25 + form * 0.75;
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, font, maxWidth, scatter, particleSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`block max-w-full ${className}`}
      role="img"
      aria-label={text}
    />
  );
}