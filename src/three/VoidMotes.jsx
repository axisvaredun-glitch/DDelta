import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANIMUS } from "../theme/animusPalette.js";
import { GRID } from "./world/gridConfig.js";
import { readFormation, scrollStore } from "./scrollStore.js";

const COUNT = 5200;

export function VoidMotes() {
  const points = useRef();

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const rand = new Float32Array(COUNT * 3);
    const color = new Float32Array(COUNT * 3);

    const cCore = new THREE.Color(ANIMUS.core);
    const cGlow = new THREE.Color(ANIMUS.glow);
    const cHi = new THREE.Color(ANIMUS.hi);

    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3;
      const spread = (GRID.particleSpread || 15) + Math.random() * 10;
      const x = (Math.random() - 0.5) * spread;
      const y = Math.random() * 14 + 0.25;
      const z = (Math.random() - 0.5) * spread;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      rand[i3] = Math.random() * Math.PI * 2;
      rand[i3 + 1] = 0.2 + Math.random() * 1.1;
      rand[i3 + 2] = Math.random();

      const mix = Math.random();
      const col = cCore.clone().lerp(mix > 0.78 ? cHi : cGlow, mix);
      color[i3] = col.r;
      color[i3 + 1] = col.g;
      color[i3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(color, 3));
    return { geometry: geo, seeds: rand };
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const attr = points.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    const scrollProgress = scrollStore.progress;
    const formation = readFormation();

    for (let i = 0; i < COUNT; i += 1) {
      const i3 = i * 3;
      const speed = seeds[i3 + 1];
      const baseY = seeds[i3 + 2] * 12 + 0.3;
      const drift = Math.sin(t * 0.4 + seeds[i3]) * 0.045;
      attr.array[i3 + 1] = baseY + formation * 1.4 + drift;
      attr.array[i3] += drift * 0.08;
      attr.array[i3 + 2] += Math.cos(t * 0.32 + seeds[i3]) * 0.012;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        vertexColors
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false} // Ini sudah Anda tulis, sangat bagus!
        depthTest={true} // Tambahkan ini agar tidak dirender tembus tembok (opsional)
        blending={THREE.AdditiveBlending}
        toneMapped={false} // Tambahkan ini agar warna partikel tidak berkedip karena efek kamera
      />
    </points>
  );
}
