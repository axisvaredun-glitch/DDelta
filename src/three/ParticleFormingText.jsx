import { useEffect, useRef } from 'react';
import { useMotionValueEvent } from 'framer-motion';

export function ParticleFormingText({ 
  text, 
  font, 
  progress, 
  scatter = 200, 
  particleSize = 2.2,
  variant = 'dust', // 'dust' | 'plastic' | 'shatter'
  color = '#06152b' 
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !font) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dpr = window.devicePixelRatio || 1;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight; 
    
    if (parentWidth <= 0 || parentHeight <= 0) return;

    const buffer = Math.min(scatter, 300); 
    const width = parentWidth + (buffer * 2);
    const height = parentHeight + (buffer * 2); 

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    canvas.style.left = `-${buffer}px`;
    canvas.style.top = `-${buffer}px`;
    
    ctx.scale(dpr, dpr);

    ctx.font = font;
    ctx.fillStyle = '#000000'; // Selalu hitam untuk deteksi alpha
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const particles = [];
      const step = 3; 
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const alphaIndex = (y * canvas.width + x) * 4 + 3;
          if (imageData[alphaIndex] > 40) {
            
            let ox, oy, shapeA, shapeB, shapeC;

            // ==========================================
            // PHYSICS ENGINE SWITCH
            // ==========================================
            if (variant === 'plastic') {
              // Liquid Viscosity: Dripping dari udara (Y negatif) dengan cluster horizontal ketat
              ox = (Math.random() - 0.5) * (scatter * 0.4);
              oy = -(Math.random() * scatter + 80);
            
            } else if (variant === 'shatter') {
              // Radial Explosion: Meledak memancar dari tengah kanvas
              const dx = x - cx;
              const dy = y - cy;
              const angle = Math.atan2(dy, dx);
              const force = scatter * (Math.random() * 1.5 + 0.5);
              
              ox = (Math.cos(angle) * force) / dpr;
              oy = (Math.sin(angle) * force) / dpr;

              // Pre-kalkulasi bentuk geometri pecahan kaca (Shards) agar render super ringan
              const length = particleSize * (Math.random() * 5 + 2);
              const w = particleSize * 0.9;
              shapeA = [Math.cos(angle) * length, Math.sin(angle) * length];
              shapeB = [Math.cos(angle + 1.57) * w, Math.sin(angle + 1.57) * w];
              shapeC = [Math.cos(angle - 1.57) * w, Math.sin(angle - 1.57) * w];
            
            } else {
              // Default Dust: Noise berantakan acak
              ox = (Math.random() - 0.5) * scatter;
              oy = (Math.random() - 0.5) * scatter;
            }

            particles.push({
              targetX: x / dpr,
              targetY: y / dpr,
              offsetX: ox,
              offsetY: oy,
              shapeA, shapeB, shapeC
            });
          }
        }
      }
      
      particlesRef.current = particles;
      ctx.clearRect(0, 0, width, height); 
    } catch (err) {
      console.error("Canvas read error:", err);
    }
  }, [text, font, scatter, variant, particleSize]);

  useMotionValueEvent(progress, 'change', (val) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    if (particlesRef.current.length === 0) return;

    // Setel kurva tarikan fisika yang berbeda untuk tiap tipe partikel
    const ease = variant === 'plastic' 
      ? 1 - Math.pow(1 - val, 5) // Cairan membanting/snapping lebih cepat
      : variant === 'shatter'
      ? 1 - Math.pow(1 - val, 3) // Pecahan melayang linear
      : 1 - Math.pow(1 - val, 4); // Normal dust

    ctx.fillStyle = color;
    ctx.beginPath();
    
    const particles = particlesRef.current;

    // ==========================================
    // RENDER ENGINE
    // ==========================================
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const currentX = p.targetX + (p.offsetX * (1 - ease));
      const currentY = p.targetY + (p.offsetY * (1 - ease));

      if (variant === 'plastic') {
        // Lingkaran memusat agar pinggirannya meleleh halus saat difilter
        ctx.moveTo(currentX, currentY);
        ctx.arc(currentX, currentY, particleSize * 1.6, 0, Math.PI * 2);
      } else if (variant === 'shatter') {
        // Geometri kaca tajam (ditarik dari pre-kalkulasi trigonometri di atas)
        ctx.moveTo(currentX + p.shapeA[0], currentY + p.shapeA[1]);
        ctx.lineTo(currentX + p.shapeB[0], currentY + p.shapeB[1]);
        ctx.lineTo(currentX + p.shapeC[0], currentY + p.shapeC[1]);
      } else {
        // Dust kotak standar
        ctx.rect(currentX, currentY, particleSize, particleSize);
      }
    }
    
    ctx.globalAlpha = val;
    ctx.fill();
  });

  return (
    <canvas 
      ref={canvasRef} 
      style={{ imageRendering: 'pixelated' }} 
      className="absolute z-10 pointer-events-none" 
    />
  );
}