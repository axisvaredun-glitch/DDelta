import { useEffect, useRef } from 'react';
import { scrollStore } from '../three/scrollStore.js'; 

export function DnaHologram2D() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    let animationFrameId;
    let phase = 0;

    const width = 300;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    const centerY = height / 2;
    const centerX = width / 2;
    const radius = 60;
    const rungs = 40;
    const ySpacing = 16; 

    // PALET BARU: Cyan yang lebih terang & Aksen Emas Animus
    const colorCyan = '#00e5ff'; // Cyan super terang
    const colorGold = '#FFC48A'; // Aksen hangat agar kontras dengan lantai biru

    const render = () => {
      const progress = scrollStore.progress;
      
      if (container) {
        // Opacity dasar dinaikkan dari 0.8 menjadi 1.0 (Penuh)
        let currentOpacity = 1.0; 
        
        if (progress >= 0.90) {
          const fadeProgress = (progress - 0.90) / 0.06; 
          const fadeMultiplier = Math.max(0, 1 - fadeProgress); 
          currentOpacity = 1.0 * fadeMultiplier; // Memudar sinkron dengan cahaya
        }

        container.style.opacity = currentOpacity.toString();
      }

      ctx.clearRect(0, 0, width, height);
      phase += 0.025; 

      const points = [];

      for (let i = 0; i < rungs; i++) {
        const y = centerY - ((rungs * ySpacing) / 2) + (i * ySpacing);
        const angle = phase + (i * 0.25); 

        const x1 = centerX + Math.sin(angle) * radius;
        const z1 = Math.cos(angle); 
        
        const x2 = centerX + Math.sin(angle + Math.PI) * radius;
        const z2 = Math.cos(angle + Math.PI);

        // Garis penghubung dinaikkan opacity-nya agar lebih terlihat
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        const lineAlpha = 0.35 + ((z1 + z2 + 2) / 4) * 0.25; 
        // Warna garis menggunakan cyan terang
        ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Strand 1: Cyan Terang
        points.push({ x: x1, y: y, z: z1, color: colorCyan });
        // Strand 2: Aksen Emas (Memecah warna biru pada lantai)
        points.push({ x: x2, y: y, z: z2, color: colorGold });
      }

      points.sort((a, b) => a.z - b.z);

      points.forEach((p) => {
        const scale = 1 + p.z * 0.3;
        // Alpha dot dipertajam
        const alpha = 0.5 + ((p.z + 1) / 2) * 0.5; 

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * scale, 0, Math.PI * 2);
        
        // Glow dipertajam (dari 8 menjadi 12)
        ctx.shadowBlur = p.z > 0 ? 12 : 0;
        ctx.shadowColor = p.color;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0; 
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none fixed right-0 top-1/2 -translate-y-1/2 h-[70vh] w-1/4 flex items-center justify-center z-10"
    >
      <canvas 
        ref={canvasRef} 
        // Menambahkan properti css filter untuk memperkuat warna di atas mix-blend
        className="h-full w-full object-contain mix-blend-screen drop-shadow-lg brightness-110"
      />
    </div>
  );
}