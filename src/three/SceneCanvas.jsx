import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { Experience } from './Experience.jsx';
import { CameraRig } from './CameraRig.jsx';

const COLOR_FLASH = new THREE.Color('#D6F1FF');
const COLOR_DARK = new THREE.Color('#06152B');
const REVEAL_START = 0.92;

function TransitionFog() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });
  const fogRef = useRef(null);

  useFrame(() => {
    if (!fogRef.current) return;
    const progress = smoothProgress.get();

    if (progress < REVEAL_START) {
      fogRef.current.color.copy(COLOR_FLASH);
      fogRef.current.near = 0;
      fogRef.current.far = 1;
    } else {
      const fadeProgress = (progress - REVEAL_START) / (1.0 - REVEAL_START);
      fogRef.current.color.lerpColors(COLOR_FLASH, COLOR_DARK, fadeProgress);
      fogRef.current.near = THREE.MathUtils.lerp(0, 5, fadeProgress);
      fogRef.current.far = THREE.MathUtils.lerp(1, 18, fadeProgress);
    }
  });

  return <fog ref={fogRef} attach="fog" args={['#D6F1FF', 0, 1]} />;
}

export function SceneCanvas({ mode = 'intro' }) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  const vignetteOpacity = useTransform(smoothProgress, [REVEAL_START, 1.0], [0, 1]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 46, position: [0, 1.42, 1.35], near: 0.2, far: 70 }}
        gl={{ powerPreference: 'high-performance' }}
      >
        <TransitionFog />

        <Suspense fallback={null}>
          <CameraRig mode={mode} />
          <Experience />
        </Suspense>
      </Canvas>

      <motion.div
        style={{ opacity: vignetteOpacity }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06152B]/40 via-transparent to-[#06152B]/88"
        aria-hidden
      />
    </div>
  );
}