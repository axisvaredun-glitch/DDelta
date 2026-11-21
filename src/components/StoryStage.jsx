import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring, motion } from 'framer-motion';
import { SceneCanvas } from '../three/SceneCanvas.jsx';
import { EntranceHud } from './EntranceHud.jsx';
import { publishProgress, readSequenceProgress } from '../three/scrollStore.js';
import { EditorialSequence } from '../three/EditorialSequence.jsx';
import { VideoSequencePlayer } from '../three/VideoSequencePlayer.jsx';

export function StoryStage() {
  const sequenceRef = useRef(null);

  const [canvasMode, setCanvasMode] = useState('intro');
  const modeRef = useRef('intro');

  const rawFlashOpacity = useMotionValue(0);
  const smoothFlashbang = useSpring(rawFlashOpacity, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const rawVideoProgress = useMotionValue(0);
  const smoothVideoProgress = useSpring(rawVideoProgress, {
    stiffness: 450,
    damping: 32,
    mass: 0.6,
    restDelta: 0.0001,
  });

  useEffect(() => {
    const update = () => {
      const introProgress = readSequenceProgress(sequenceRef.current);
      const vh = window.innerHeight;
      const scrollVH = window.scrollY / vh;

      // 1. UPDATE FASE LOGIKA
      let newMode = 'intro';
      if (scrollVH < 3.9) {
        newMode = 'intro';
      } else if (scrollVH >= 3.9 && scrollVH < 8.8) {
        newMode = 'hidden';
      } else if (scrollVH >= 8.8 && scrollVH < 11.8) {
        newMode = 'loading';
      } else if (scrollVH >= 11.8 && scrollVH < 17.2) {
        newMode = 'video';
      } else {
        newMode = 'loading2';
      }

      if (modeRef.current !== newMode) {
        modeRef.current = newMode;
        setCanvasMode(newMode);
      }

      // 2. DISTRIBUSI PROGRESS
      if (newMode === 'intro') {
        publishProgress(introProgress);
      } else if (newMode === 'loading') {
        const loadingProgress = Math.max(0, Math.min(1, (scrollVH - 8.8) / 3));
        publishProgress(loadingProgress);
      } else if (newMode === 'loading2') {
        const loading2Progress = Math.max(0, Math.min(1, (scrollVH - 17.2) / 3));
        publishProgress(loading2Progress);
      }

      rawVideoProgress.set(Math.max(0, Math.min(1, (scrollVH - 11.8) / 5.2)));

      // 3. KALKULASI CAHAYA PUTIH
      let flash = 0;

      if (scrollVH >= 2.8 && scrollVH <= 4.2) {
        if (scrollVH < 3.0) flash = (scrollVH - 2.8) / 0.2;
        else if (scrollVH <= 4.0) flash = 1;
        else flash = 1 - (scrollVH - 4.0) / 0.2;
      } else if (scrollVH >= 6.8 && scrollVH <= 9.2) {
        if (scrollVH < 7.0) flash = (scrollVH - 6.8) / 0.2;
        else if (scrollVH <= 9.0) flash = 1;
        else flash = 1 - (scrollVH - 9.0) / 0.2;
      } else if (scrollVH >= 10.8 && scrollVH <= 12.2) {
        if (scrollVH < 11.0) flash = (scrollVH - 10.8) / 0.2;
        else if (scrollVH <= 12.0) flash = 1;
        else flash = 1 - (scrollVH - 12.0) / 0.2;
      } else if (scrollVH >= 17.0 && scrollVH <= 17.6) {
        if (scrollVH < 17.2) flash = (scrollVH - 17.0) / 0.2;
        else if (scrollVH <= 17.4) flash = 1;
        else flash = 1 - (scrollVH - 17.4) / 0.2;
      }

      rawFlashOpacity.set(flash);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [rawFlashOpacity, rawVideoProgress]);

  return (
    <div className="relative bg-board text-ink">
      {/* Kirim mode asli ke SceneCanvas agar loading2 punya gerakan terbang miring 320 deg */}
      <SceneCanvas mode={canvasMode} />
      <EntranceHud mode={canvasMode} />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 mx-auto flex max-w-6xl items-end justify-between px-5 pb-8 pt-6 md:px-8 md:pt-10">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted/80">DDelta</p>
        <p className="text-[0.7rem] uppercase tracking-[0.14em] text-accent/90">Animus simulation</p>
      </header>

      <VideoSequencePlayer
        progress={smoothVideoProgress}
        isActive={canvasMode === 'video'}
      />

      <div ref={sequenceRef} id="entrance-sequence" className="h-[400vh] w-full" aria-hidden />

      <div className="relative z-30 h-[500vh] w-full">
        <EditorialSequence phase={canvasMode === 'hidden' ? 2 : 1} />
      </div>

      <div className="h-[300vh] w-full" />
      <div className="h-[600vh] w-full" />
      <div className="h-[300vh] w-full" />

      <motion.div
        style={{ opacity: smoothFlashbang }}
        className="pointer-events-none fixed inset-0 z-[9999] bg-white"
        aria-hidden
      />
    </div>
  );
}