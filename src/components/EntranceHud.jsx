import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { publishProgress, readSequenceProgress, scrollStore } from '../three/scrollStore.js';

// ==========================================
// 1. TEKS UNTUK INTRO PERTAMA
// ==========================================
const INTRO_LEFT = {
  kicker: 'Loading',
  title: 'Animus',
  body: "A web with various animation and style transition. A cure for ADHD, rival of dullness, and Sheogorath's beloved peasant",
};
const INTRO_RIGHT = {
  kicker: 'Mang Sinting',
  title: 'Representing',
  body: 'motion design-driven Website',
};

// ==========================================
// 2. TEKS UNTUK LOADING SCREEN PERTAMA (Fase 3)
// ==========================================
const LOADING_LEFT = {
  kicker: 'Phase 3',
  title: 'Deep Dive',
  body: 'Entering the seamless straight path. No looking back, just moving forward.',
};
const LOADING_RIGHT = {
  kicker: 'Stay Tuned',
  title: 'Steady',
  body: 'Loading the next dimension seamlessly without breaking the immersion.',
};

// ==========================================
// 3. TEKS UNTUK LOADING SCREEN KEDUA (Fase 5) 
// -> SILAKAN LU EDIT SENDIRI TEKSNYA DI SINI
// ==========================================
const LOADING2_LEFT = {
  kicker: 'Phase 5',
  title: 'Terbang setinggi langit hanya untuk jatuh lebih sakit.',
  body: 'Ambatuvasi',
};
const LOADING2_RIGHT = {
  kicker: 'Almost There',
  title: 'Animus Database loading . . .',
  body: 'Reference from Assassin`s creed, The Matrix, and other sources. Animus is a web with various animation and style transition.',
};

function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function band(progress, enter0, enter1, exit0, exit1) {
  const enter = THREE.MathUtils.smoothstep(progress, enter0, enter1);
  const exit = 1 - THREE.MathUtils.smoothstep(progress, exit0, exit1);
  return clamp01(enter * exit);
}

export function EntranceHud(props) {
  const currentMode = props.mode || props.canvasMode || 'intro';

  const edgeRef = useRef(null);
  const flightRef = useRef(null);
  const washRef = useRef(null);
  const introRef = useRef(null);
  const shown = useRef(0);
  const intro = useRef(1);
  const modeRef = useRef(currentMode);

  // PEMILIHAN TEKS OTOMATIS BERDASARKAN MODE
  let textLeft = INTRO_LEFT;
  let textRight = INTRO_RIGHT;
  if (currentMode === 'loading') {
    textLeft = LOADING_LEFT;
    textRight = LOADING_RIGHT;
  } else if (currentMode === 'loading2') {
    textLeft = LOADING2_LEFT;
    textRight = LOADING2_RIGHT;
  }

  useEffect(() => {
    modeRef.current = currentMode;
    if (currentMode === 'loading' || currentMode === 'loading2') {
      intro.current = 0;
      if (introRef.current) introRef.current.style.opacity = '0';
      if (washRef.current) washRef.current.style.opacity = '0';
    }
  }, [currentMode]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const apply = (now) => {
      const active = modeRef.current;

      if (active === 'intro') {
        publishProgress(readSequenceProgress());
      }

      const step = Math.min((now - last) / 1000, 0.05);
      last = now;
      shown.current = THREE.MathUtils.damp(shown.current, scrollStore.progress, 4, step);
      const progress = shown.current;

      if (active === 'intro') {
        intro.current = THREE.MathUtils.damp(intro.current, 0, progress > 0.02 ? 4.5 : 1.35, step);
      } else {
        intro.current = 0;
      }

      const edge = edgeRef.current;
      const flight = flightRef.current;

      // JALUR LOADING (Berlaku untuk Loading 1 maupun Loading 2)
      if (active === 'loading' || active === 'loading2') {
        if (edge) {
          const amount = band(progress, 0.12, 0.28, 0.45, 0.58);
          const fromTop = (1 - THREE.MathUtils.smoothstep(progress, 0.12, 0.28)) * -10;
          edge.style.opacity = String(amount);
          edge.style.transform = `translate3d(0, ${fromTop}vh, 0)`;
        }
        if (flight) {
          const amount = band(progress, 0.42, 0.58, 0.78, 0.92);
          const fromBottom = (1 - THREE.MathUtils.smoothstep(progress, 0.42, 0.58)) * 10;
          flight.style.opacity = String(amount);
          flight.style.transform = `translate3d(0, ${fromBottom}vh, 0)`;
          flight.style.filter = `blur(${(1 - amount) * 6}px)`;
        }
      } else {
        // JALUR INTRO
        if (edge) {
          const amount = band(progress, 0.2, 0.28, 0.32, 0.4);
          const slide = (1 - THREE.MathUtils.smoothstep(progress, 0.2, 0.28)) * -16;
          edge.style.opacity = String(amount);
          edge.style.transform = `translate3d(${slide}vw, 0, 0)`;
        }
        if (flight) {
          const amount = band(progress, 0.48, 0.56, 0.8, 0.88);
          const rise = (1 - THREE.MathUtils.smoothstep(progress, 0.48, 0.56)) * 8;
          flight.style.opacity = String(amount);
          flight.style.transform = `translate3d(0, ${rise}vh, 0)`;
          flight.style.filter = `blur(${(1 - amount) * 8}px)`;
        }
      }

      const wash = washRef.current;
      if (wash) {
        wash.style.opacity =
          (active === 'loading' || active === 'loading2')
            ? '0'
            : String(THREE.MathUtils.smoothstep(progress, 0.9, 0.96));
      }

      const flash = introRef.current;
      if (flash) flash.style.opacity = String(intro.current);
    };

    const loop = (now) => {
      apply(now);
      frame = requestAnimationFrame(loop);
    };

    apply(performance.now());
    const onScrollOrResize = () => apply(performance.now());
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <div
        ref={introRef}
        className="pointer-events-none fixed inset-0 z-40 bg-[#eafbff] opacity-100"
        aria-hidden
      />

      <article ref={edgeRef} className="absolute left-[8vw] top-[20vh] max-w-md opacity-0">
        <p className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-accent">
          {textLeft.kicker}
        </p>
        <h2 className="font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ink md:text-6xl">
          {textLeft.title}
        </h2>
        <p className="mt-5 text-base font-light leading-relaxed text-muted/85 md:text-lg">
          {textLeft.body}
        </p>
      </article>

      <article ref={flightRef} className="absolute right-[8vw] top-[30vh] max-w-lg text-right opacity-0">
        <p className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-accent">
          {textRight.kicker}
        </p>
        <h2 className="font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ink md:text-6xl">
          {textRight.title}
        </h2>
        <p className="mt-5 text-base font-light leading-relaxed text-muted/85 md:text-lg">
          {textRight.body}
        </p>
      </article>

      <div
        ref={washRef}
        className="absolute inset-0 opacity-0"
        style={{ background: 'radial-gradient(circle at 50% 42%, #ffffff 0%, #eafbff 36%, #8beaff 70%, #25b9e8 100%)' }}
      />
    </div>
  );
}