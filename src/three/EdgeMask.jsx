import { useMemo } from 'react';
import * as THREE from 'three';
import { GRID } from './world/gridConfig.js'; // Sesuaikan path jika berbeda

export function EdgeMask() {
  const shaderArgs = useMemo(() => {
    return {
      uniforms: {
        // Samakan persis dengan warna background di Experience.jsx
        uColor: { value: new THREE.Color('#041328') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          // Menghitung jarak dari titik tengah (0.5, 0.5)
          float dist = distance(vUv, vec2(0.5));
          
          // Mulai memudar (0.0) di radius 30%, dan menjadi pekat total (1.0) di 48%
          float alpha = smoothstep(0.30, 0.48, dist);
          
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    };
  }, []);

  // Ukuran bidang dibuat sedikit lebih besar dari lantai grid
  const size = (GRID?.floorSize || 40) * 1.2;

  return (
    // Diletakkan sangat tipis di atas lantai (Y = 0.05) untuk menutupi garis shader
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
}