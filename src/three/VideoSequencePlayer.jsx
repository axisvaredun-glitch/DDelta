import { useEffect, useRef, useState, useCallback } from 'react';
import { useMotionValueEvent } from 'framer-motion';

export function VideoSequencePlayer({ progress, isActive }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef(new Array(988).fill(null));
  const [loadedPercent, setLoadedPercent] = useState(0);
  const TOTAL_FRAMES = 988;
  const frameBase = `${import.meta.env.BASE_URL}models/video-sequence/mountain-flight/`;

  const drawFrame = useCallback((val) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(val * TOTAL_FRAMES)));
    const img = imagesRef.current[frameIndex];
    
    if (!img || !img.complete) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  useMotionValueEvent(progress, "change", (val) => {
    if (isActive) drawFrame(val);
  });

  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    
    const loadBatch = async (start, end) => {
       const promises = [];
       for(let i = start; i <= end; i++) {
          if(isCancelled) break;
          promises.push(new Promise((resolve) => {
             const img = new Image();
             
             // Pastikan path ini udah sesuai sama struktur folder terakhir lu
             img.src = `${frameBase}${i}.jpg`;
             
             img.onload = () => {
                imagesRef.current[i - 1] = img;
                loadedCount++;
                resolve();
             };
             img.onerror = resolve; 
          }));
       }
       await Promise.all(promises);
       if (!isCancelled) setLoadedPercent(Math.round((loadedCount / TOTAL_FRAMES) * 100));
    };

    const initPreload = async () => {
       for (let i = 1; i <= TOTAL_FRAMES; i += 50) {
          if (isCancelled) break;
          await loadBatch(i, Math.min(i + 49, TOTAL_FRAMES));
       }
    };
    initPreload();

    return () => { isCancelled = true; };
  }, []);

  useEffect(() => {
    const resize = () => {
       const canvas = canvasRef.current;
       if (!canvas) return;
       canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
       canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
       drawFrame(progress.get());
    };
    window.addEventListener('resize', resize);
    resize(); 
    return () => window.removeEventListener('resize', resize);
  }, [drawFrame, progress]);

  return (
    <div 
      className="fixed inset-0 z-20 pointer-events-none bg-[#06152B]"
      // TOMBOL NUKLIR: Gak pakai opacity-opacityan. Aktif = block, Gak aktif = lenyap dari layar.
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {loadedPercent < 100 && isActive && (
        <div className="absolute bottom-8 right-8 font-sans text-[0.65rem] tracking-[0.3em] text-white/50">
          BUFFERING REALITY {loadedPercent}%
        </div>
      )}
    </div>
  );
}