import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ANIMUS } from '../theme/animusPalette.js';
import { GRID } from './world/gridConfig.js';
import { readFormation, scrollStore } from './scrollStore.js';

function BounceLayer({
  count,
  spread,
  heightMul,
  pointSize,
  opacity,
  color,
  formation,
  scrollProgress,
  reactMul = 1,
}) {
  const points = useRef();
  const sim = useRef(null);
  const lastF = useRef(formation);
  const lastS = useRef(scrollProgress);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const data = new Float32Array(count * 4);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const i4 = i * 4;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = 0.02 + Math.random() * 0.08;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;

      data[i4] = (0.02 + Math.random() * 0.06) * heightMul;
      data[i4 + 1] = 0.5 + Math.random() * 1.4;
      data[i4 + 2] = Math.random() * Math.PI * 2;
      data[i4 + 3] = 0.3 + Math.random() * 0.65;
    }

    sim.current = data;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, spread, heightMul]);

  useFrame((state, delta) => {
    if (!points.current || !sim.current) return;
    const attr = points.current.geometry.attributes.position;
    const data = sim.current;
    const t = state.clock.elapsedTime;
    const f = formation ?? readFormation();
    const s = scrollProgress ?? scrollStore.progress;
    const react = Math.min(
      2.5,
      (Math.abs(f - lastF.current) * 14 + Math.abs(s - lastS.current) * 10) * reactMul,
    );
    lastF.current = f;
    lastS.current = s;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const i4 = i * 4;
      const hop = data[i4];
      let y = attr.array[i3 + 1];
      let vy = data[i4 + 1];

      vy -= delta * 3.4;
      y += vy * delta;

      if (y <= 0.015) {
        y = 0.015;
        vy = hop * data[i4 + 3] * (0.7 + Math.random() * 0.28) + react * 0.045;
        data[i4 + 2] = t;
      }

      if (react > 0.08) {
        vy += react * delta * 0.08;
      }

      data[i4 + 1] = vy;
      attr.array[i3 + 1] = y;

      const wobble = Math.sin(t * 3 + data[i4 + 2]) * 0.004;
      attr.array[i3] += wobble;
      attr.array[i3 + 2] += wobble * 0.65;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color={color}
        size={pointSize}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BounceMotes({ formation = 0, scrollProgress = 0 }) {
  const spread = GRID.particleSpread * 0.88;

  return (
    <group>
      <BounceLayer
        count={1800}
        spread={spread}
        heightMul={1}
        pointSize={0.022}
        opacity={0.55}
        color={ANIMUS.glow}
        formation={formation}
        scrollProgress={scrollProgress}
        reactMul={1}
      />
      <BounceLayer
        count={1200}
        spread={spread * 0.72}
        heightMul={0.55}
        pointSize={0.012}
        opacity={0.82}
        color={ANIMUS.hi}
        formation={formation}
        scrollProgress={scrollProgress}
        reactMul={1.4}
      />
    </group>
  );
}