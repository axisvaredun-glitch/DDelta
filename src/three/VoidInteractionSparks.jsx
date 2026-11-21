import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ANIMUS } from '../theme/animusPalette.js';
import { GRID, SUBJECT_ANCHOR_Y } from './world/gridConfig.js';

const COUNT = 1600;
const CORE_RADIUS = 2.8;

export function VoidInteractionSparks({ formation = 0 }) {
  const points = useRef();
  const sim = useRef(null);
  const lastFormation = useRef(formation);
  const interact = useRef(0);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const data = new Float32Array(COUNT * 5);

    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3;
      const i5 = i * 5;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * CORE_RADIUS;
      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = 0.02 + Math.random() * 0.15;
      positions[i3 + 2] = Math.sin(angle) * r;

      data[i5] = 0.015 + Math.random() * 0.055;
      data[i5 + 1] = 0.35 + Math.random() * 0.65;
      data[i5 + 2] = Math.random() * Math.PI * 2;
      data[i5 + 3] = 0.4 + Math.random() * 0.55;
      data[i5 + 4] = r;
    }

    sim.current = data;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!points.current || !sim.current) return;

    const df = Math.abs(formation - lastFormation.current);
    lastFormation.current = formation;
    interact.current = THREE.MathUtils.damp(
      interact.current,
      Math.min(2.8, df * 16 + formation * 0.35),
      5,
      delta,
    );

    const attr = points.current.geometry.attributes.position;
    const data = sim.current;
    const t = state.clock.elapsedTime;
    const boost = interact.current;

    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3;
      const i5 = i * 5;
      const hop = data[i5];
      let y = attr.array[i3 + 1];
      let vy = data[i5 + 1];
      const dist = data[i5 + 4];

      const localBoost = boost * (1.35 - dist / CORE_RADIUS);
      vy -= delta * (3.1 + localBoost * 0.4);
      y += vy * delta;

      if (y <= 0.012) {
        y = 0.012;
        const kick = hop * data[i5 + 3] * (0.75 + Math.random() * 0.35);
        vy = kick + localBoost * 0.22;
        data[i5 + 2] = t;
      }

      if (localBoost > 0.15) {
        vy += localBoost * delta * 0.35;
      }

      data[i5 + 1] = vy;
      attr.array[i3 + 1] = y;

      const wobble =
        Math.sin(t * 4.2 + data[i5 + 2]) * 0.006 * (1 + localBoost * 0.5);
      attr.array[i3] += wobble;
      attr.array[i3 + 2] += wobble * 0.8;
    }
    attr.needsUpdate = true;

    const mat = points.current.material;
    mat.size = 0.011 + formation * 0.006 + interact.current * 0.005;
    mat.opacity = THREE.MathUtils.clamp(0.5 + formation * 0.35 + interact.current * 0.15, 0.45, 0.95);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} position={[0, SUBJECT_ANCHOR_Y * 0.05, 0]}>
      <pointsMaterial
        color={ANIMUS.hi}
        size={0.014}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}