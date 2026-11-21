import { useEffect, useRef } from 'react';
import { buildTextParticles } from '../lib/sampleTextParticles.js';

const FALL_TIMES = [0, 0.35, 0.6, 0.75, 0.9, 1];
const FALL_Y_VH = [-150, 40, -20, 30, -10, 0];
const FALL_DURATION_MS = 1400;
const SHATTER_MS = 1100;

const PLASTIC = [
  '#25b9e8',
  '#030cff',
  '#06152b',
  '#8beaff',
  '#1266a3',
  '#eafbff',
];

function lerpKeyframes(t, times, values) {
  const clamped = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < times.length - 1 && clamped > times[i + 1]) i += 1;
  const t0 = times[i];
  const t1 = times[i + 1];
  const u = t1 === t0 ? 1 : (clamped - t0) / (t1 - t0);
  return values[i] + (values[i + 1] - values[i]) * u;
}

function initBurst(points) {
  return points.map((p) => {
    const angle = Math.atan2(p.y, p.x) + (Math.random() - 0.5) * 0.9;
    const speed = 90 + Math.random() * 220;
    return {
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 80,
      vy: Math.sin(angle) * speed - 40 - Math.random() * 120,
      spin: (Math.random() - 0.5) * 8,
      rot: Math.random() * Math.PI,
      chip: Math.random() > 0.45,
      color: PLASTIC[Math.floor(Math.random() * PLASTIC.length)],
    };
  });
}

export function ParticleYesDrop({ active, resetKey, font, className = '' }) {
  const canvasRef = useRef(null);
  const layoutRef = useRef(null);
  const burstRef = useRef(null);
  const phaseRef = useRef('idle');
  const fallStartRef = useRef(0);
  const shatterStartRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    layoutRef.current = buildTextParticles('Yes', {
      font,
      maxWidth: 640,
      step: 3,
      scatter: 40,
      pad: 24,
    });

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

    const draw = (now) => {
      const phase = phaseRef.current;
      const vh = window.innerHeight;
      const w = width;
      const h = height;
      const cx = w * 0.5;
      const cy = h * 0.5;

      ctx.clearRect(0, 0, w, h);

      let fallOffset = -vh * 1.5;
      let shatterT = 0;

      if (phase === 'falling' || phase === 'shatter' || phase === 'done') {
        const fallElapsed = Math.min(1, (now - fallStartRef.current) / FALL_DURATION_MS);
        fallOffset = (lerpKeyframes(fallElapsed, FALL_TIMES, FALL_Y_VH) / 100) * vh;
        if (fallElapsed >= 1 && phase === 'falling') {
          phaseRef.current = 'shatter';
          shatterStartRef.current = now;
          burstRef.current = initBurst(points);
        }
      }

      if (phase === 'shatter' || phase === 'done') {
        shatterT = Math.min(1, (now - shatterStartRef.current) / SHATTER_MS);
        if (shatterT >= 1) phaseRef.current = 'done';
      }

      const burst = burstRef.current;

      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        let px = cx + p.x;
        let py = cy + p.y + fallOffset;
        let alpha = 1;
        let size = 2.6;

        if ((phase === 'shatter' || phase === 'done') && burst) {
          const b = burst[i];
          const ease = 1 - (1 - shatterT) ** 2;
          px += b.vx * ease * 0.55 + Math.sin(now * 0.004 + p.seed) * shatterT * 6;
          py +=
            b.vy * ease * 0.55 +
            380 * ease * ease * 0.35 +
            Math.cos(now * 0.003 + p.seed) * shatterT * 4;
          alpha = 0.35 + (1 - shatterT * 0.25);
          size = b.chip ? 2.2 + Math.random() * 1.2 : 1.8;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(b.rot + b.spin * ease);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = b.color;
          if (b.chip) {
            ctx.fillRect(-size, -size * 0.55, size * 2, size * 1.1);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          continue;
        }

        if (phase === 'idle') continue;

        if (phase === 'falling') {
          ctx.beginPath();
          ctx.fillStyle = 'rgba(6, 21, 43, 0.94)';
          ctx.globalAlpha = 0.92;
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [font]);

  useEffect(() => {
    if (!active) {
      phaseRef.current = 'idle';
      burstRef.current = null;
      return;
    }
    phaseRef.current = 'falling';
    fallStartRef.current = performance.now();
    shatterStartRef.current = 0;
    burstRef.current = null;
  }, [active, resetKey]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      role="img"
      aria-label="Yes"
    />
  );
}