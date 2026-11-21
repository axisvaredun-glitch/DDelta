import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ParticleFormingText } from './ParticleFormingText.jsx';

function useMeasuredFont(ref, fallback) {
  const [font, setFont] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const apply = () => {
      const cs = getComputedStyle(el);
      setFont(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [ref]);
  return font;
}

export function EditorialSequence({ phase }) {
  const sectionRef = useRef(null);
  
  // Refs Quote 1
  const q1Line1Ref = useRef(null);
  const q1Line2Ref = useRef(null);
  
  // Refs Quote 2 
  const q2L1Ref = useRef(null);
  const q2L2Ref = useRef(null);
  const q2L3Ref = useRef(null);
  const q2L4Ref = useRef(null); 
  
  // Refs Quote 3
  const q3Line1Ref = useRef(null);
  const q3Line2Ref = useRef(null);
  const q3Line3Ref = useRef(null);
  
  // Fonts
  const fontQ1L1 = useMeasuredFont(q1Line1Ref, '300 2rem Fraunces, Georgia, serif');
  const fontQ1L2 = useMeasuredFont(q1Line2Ref, 'italic 600 3rem Fraunces, Georgia, serif');
  
  // REVISI DETAIL 1: Ukuran font diperbesar jadi 3rem (sebelumnya 2.5rem)
  const fontQ2 = useMeasuredFont(q2L1Ref, '500 3rem Inter, sans-serif');
  const fontQ2Author = useMeasuredFont(q2L4Ref, '700 1.5rem Inter, sans-serif');

  const fontQ3L1 = useMeasuredFont(q3Line1Ref, 'italic 400 3.5rem Fraunces, Georgia, serif');
  const fontQ3L2 = useMeasuredFont(q3Line2Ref, 'italic 400 3.5rem Fraunces, Georgia, serif');
  const fontQ3L3 = useMeasuredFont(q3Line3Ref, '300 1.25rem Inter, sans-serif');

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"] 
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });
  
  // ==========================================
  // KOREOGRAFI TIMELINE
  // ==========================================

  const formQ1L1 = useTransform(smoothProgress, [0.02, 0.10, 0.18, 0.25], [0, 1, 1, 0]);
  const formQ1L2 = useTransform(smoothProgress, [0.06, 0.12, 0.18, 0.25], [0, 1, 1, 0]);
  const yQ1 = useTransform(smoothProgress, [0.02, 0.10], [40, 0]);

  const formQ2L1 = useTransform(smoothProgress, [0.30, 0.38, 0.50, 0.58], [0, 1, 1, 0]);
  const formQ2L2 = useTransform(smoothProgress, [0.32, 0.40, 0.50, 0.58], [0, 1, 1, 0]);
  const formQ2L3 = useTransform(smoothProgress, [0.34, 0.42, 0.50, 0.58], [0, 1, 1, 0]);
  const formQ2L4 = useTransform(smoothProgress, [0.36, 0.44, 0.50, 0.58], [0, 1, 1, 0]);
  const yQ2 = useTransform(smoothProgress, [0.30, 0.38], [40, 0]);

  const formQ3L1 = useTransform(smoothProgress, [0.60, 0.68, 0.78, 0.86], [0, 1, 1, 0]);
  const formQ3L2 = useTransform(smoothProgress, [0.63, 0.71, 0.78, 0.86], [0, 1, 1, 0]);
  const formQ3L3 = useTransform(smoothProgress, [0.66, 0.74, 0.78, 0.86], [0, 1, 1, 0]);
  const yQ3 = useTransform(smoothProgress, [0.60, 0.68], [40, 0]);
  
  const blindingLightOpacity = useTransform(smoothProgress, [0.85, 0.95], [0, 1]);

  return (
    <motion.section 
      ref={sectionRef} 
      className="relative w-full h-[500vh] bg-transparent"
    >
      <svg className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="gooey-plastic">
            {/* REVISI DETAIL 2: Blur dan Alpha diketatkan agar huruf tidak terlalu 'chubby' */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -4" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#f9f8f6] px-6 md:px-24">
        
        {/* ========================================= */}
        {/* QUOTE 1 (DUST SCATTER) */}
        {/* ========================================= */}
        <div className="absolute flex w-full max-w-5xl flex-col items-center justify-center text-center pointer-events-none">
          <motion.div style={{ y: yQ1 }} className="relative w-full text-center">
            <h2 ref={q1Line1Ref} className="font-serif text-[clamp(2rem,4vw,4rem)] font-light opacity-0">
              If the World is the answer,
            </h2>
            <div className="absolute inset-0">
              <ParticleFormingText text="If the World is the answer," font={fontQ1L1} progress={formQ1L1} scatter={1000} particleSize={2.2} variant="dust" color="#06152b" />
            </div>
          </motion.div>

          <motion.div style={{ y: yQ1 }} className="mt-2 relative w-full text-center">
            <h2 ref={q1Line2Ref} className="font-serif text-[clamp(3rem,6vw,6.5rem)] italic opacity-0">
              what is the Question?
            </h2>
            <div className="absolute inset-0">
              <ParticleFormingText text="what is the Question?" font={fontQ1L2} progress={formQ1L2} scatter={1200} particleSize={2.4} variant="dust" color="#06152b" />
            </div>
          </motion.div>
        </div>

        {/* ========================================= */}
        {/* QUOTE 2 (DOSTOEVSKY - CYAN PLASTIC LIQUID) */}
        {/* ========================================= */}
        <div className="absolute flex w-full max-w-5xl flex-col items-center justify-center text-center pointer-events-none">
          <motion.div 
            style={{ y: yQ2, filter: 'url(#gooey-plastic)' }} 
            className="relative w-full flex flex-col items-center justify-center text-center drop-shadow-[0_4px_8px_rgba(37,185,232,0.6)]"
          >
            
            <motion.div className="relative w-full text-center">
              {/* REVISI DETAIL 3: CSS Teks diperbesar mengikuti font */}
              <h2 ref={q2L1Ref} className="font-sans text-[clamp(1.5rem,4vw,3rem)] font-medium opacity-0">
                "The mystery of human existence
              </h2>
              <div className="absolute inset-0">
                {/* REVISI DETAIL 4: Ukuran partikel diturunkan dari 2.0 jadi 1.2 */}
                <ParticleFormingText text="&quot;The mystery of human existence" font={fontQ2} progress={formQ2L1} scatter={600} particleSize={1.2} variant="plastic" color="#25B9E8" />
              </div>
            </motion.div>

            <motion.div className="relative w-full text-center mt-1">
              <h2 ref={q2L2Ref} className="font-sans text-[clamp(1.5rem,4vw,3rem)] font-medium opacity-0">
                lies not in just staying alive,
              </h2>
              <div className="absolute inset-0">
                <ParticleFormingText text="lies not in just staying alive," font={fontQ2} progress={formQ2L2} scatter={600} particleSize={1.2} variant="plastic" color="#25B9E8" />
              </div>
            </motion.div>

            <motion.div className="relative w-full text-center mt-1">
              <h2 ref={q2L3Ref} className="font-sans text-[clamp(1.5rem,4vw,3rem)] font-medium opacity-0">
                but in finding something to live for."
              </h2>
              <div className="absolute inset-0">
                <ParticleFormingText text="but in finding something to live for.&quot;" font={fontQ2} progress={formQ2L3} scatter={600} particleSize={1.2} variant="plastic" color="#25B9E8" />
              </div>
            </motion.div>

            <motion.div className="relative w-full text-center mt-6">
              <h2 ref={q2L4Ref} className="font-sans text-2xl font-bold opacity-0">
                — FYODOR DOSTOEVSKY
              </h2>
              <div className="absolute inset-0">
                {/* REVISI DETAIL 4: Ukuran partikel author diturunkan dari 1.8 jadi 1.0 */}
                <ParticleFormingText text="— FYODOR DOSTOEVSKY" font={fontQ2Author} progress={formQ2L4} scatter={500} particleSize={1.0} variant="plastic" color="#06152B" />
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* ========================================= */}
        {/* QUOTE 3 (ANAÏS NIN - RADIAL SHARDS) */}
        {/* ========================================= */}
        <div className="absolute flex w-full max-w-5xl flex-col items-center justify-center text-center pointer-events-none">
          <motion.div style={{ y: yQ3 }} className="relative w-full text-center">
            <h2 ref={q3Line1Ref} className="font-serif text-[clamp(1.8rem,4vw,3.5rem)] italic opacity-0">
              "We don't see things as they are,
            </h2>
            <div className="absolute inset-0">
              <ParticleFormingText text="&quot;We don't see things as they are," font={fontQ3L1} progress={formQ3L1} scatter={1500} particleSize={2.0} variant="shatter" color="#1a1a1a" />
            </div>
          </motion.div>

          <motion.div style={{ y: yQ3 }} className="mt-2 relative w-full text-center">
            <h2 ref={q3Line2Ref} className="font-serif text-[clamp(1.8rem,4vw,3.5rem)] italic opacity-0">
              we see them as we are."
            </h2>
            <div className="absolute inset-0">
              <ParticleFormingText text="we see them as we are.&quot;" font={fontQ3L2} progress={formQ3L2} scatter={1500} particleSize={2.0} variant="shatter" color="#1a1a1a" />
            </div>
          </motion.div>

          <motion.div style={{ y: yQ3 }} className="mt-6 relative w-full text-center">
            <h2 ref={q3Line3Ref} className="font-sans text-xl font-light tracking-[0.2em] opacity-0">
              — ANAÏS NIN
            </h2>
            <div className="absolute inset-0">
              <ParticleFormingText text="— ANAÏS NIN" font={fontQ3L3} progress={formQ3L3} scatter={1000} particleSize={1.5} variant="shatter" color="#1a1a1a" />
            </div>
          </motion.div>
        </div>

        {/* ========================================= */}
        {/* INTERNAL BLINDING LIGHT */}
        {/* ========================================= */}
        <motion.div 
          style={{ opacity: blindingLightOpacity }} 
          className="pointer-events-none absolute inset-0 z-50 bg-white" 
        />

      </div>
    </motion.section>
  );
}