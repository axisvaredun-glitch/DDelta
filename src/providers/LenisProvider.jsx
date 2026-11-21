import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };

    const loop = (time) => {
      onTick(time);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    setReady(true);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, ready }}>
      {children}
    </LenisContext.Provider>
  );
}