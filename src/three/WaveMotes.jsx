import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function WaveMotes({ count = 30000 }) {
  const pointsRef = useRef();

  // 1. SETUP GEOMETRI & WARNA BIRU
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Disebar luas
      pos[i3] = (Math.random() - 0.5) * 50;     // X (Kiri-Kanan)
      pos[i3 + 1] = 0;                          // Y (Atas-Bawah)
      pos[i3 + 2] = (Math.random() - 0.5) * 40; // Z (Depan-Belakang)

      // Warna BIRU/CYAN murni menggunakan HSL
      tempColor.setHSL(0.55 + Math.random() * 0.1, 1.0, 0.5 + Math.random() * 0.2);
      col[i3] = tempColor.r;
      col[i3 + 1] = tempColor.g;
      col[i3 + 2] = tempColor.b;
    }

    return { positions: pos, colors: col };
  }, [count]);

  // 2. RENDER LOOP (OMBAK MULTI-ARAH)
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const elapsedTime = state.clock.elapsedTime;
    const attrPos = pointsRef.current.geometry.attributes.position;
    const mat = pointsRef.current.material;

    const amplitude = 0.8; // Turunkan sedikit agar elegan dan tidak terlalu menabrak grid

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = attrPos.array[i3];
      const z = attrPos.array[i3 + 2];
      
      // ==========================================
      // KOREOGRAFI OMBAK BERBAGAI ARAH
      // ==========================================
      // 1. Ombak utama dari depan ke belakang (Sumbu Z)
      const wave1 = Math.sin(z * 0.3 + elapsedTime * 1.5);
      
      // 2. Ombak menyilang diagonal (Sumbu X & Z maju)
      const wave2 = Math.sin(x * 0.4 + z * 0.2 + elapsedTime * 1.2) * 0.5;
      
      // 3. Ombak menyilang berlawanan (Sumbu X mundur & Z maju)
      const wave3 = Math.sin(x * -0.2 + z * 0.3 + elapsedTime * 2.0) * 0.3;
      
      // DITAMBAHKAN (+), bukan dikalikan (*). 
      // Ini menciptakan tabrakan ombak alami dari 3 arah tanpa membentuk lembah/grid kotak-kotak.
      attrPos.array[i3 + 1] = (wave1 + wave2 + wave3) * amplitude;
    }
    
    attrPos.needsUpdate = true;

    // Efek ukuran membesar-mengecil berkerlip (Pulse)
    const pulseValue = (Math.sin(elapsedTime * 2.0) + 1) * 0.5;
    mat.size = 0.12 * (0.5 + pulseValue);
  });

  return (
    // Ditaruh sedikit di bawah lantai (-2)
    <points ref={pointsRef} position={[0, -2, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        sizeAttenuation={true}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
      />
    </points>
  );
}