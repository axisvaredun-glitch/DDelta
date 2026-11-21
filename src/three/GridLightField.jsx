import { useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ANIMUS } from '../theme/animusPalette.js';
import { GRID } from './world/gridConfig.js';

// KITA GUNAKAN INSTANCED MESH ASLI ANDA KARENA SANGAT OPTIMAL (ANTI LAG)
const shaftVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aFade;
  varying float vH;
  varying float vSeed;
  varying float vFade;
  void main() {
    vH = uv.y;
    vSeed = aSeed;
    vFade = aFade;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

// SHADER BARU: Efek Data Shimmering Vertikal (Lebih redup dan berkerlip)
const shaftFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uGlow;
  uniform vec3 uHi;
  varying float vH;
  varying float vSeed;
  varying float vFade;

  void main() {
    // Efek garis data yang mengalir naik
    float speed = 2.0;
    float dataFlow = sin(vH * 15.0 - uTime * speed + vSeed * 10.0) * 0.5 + 0.5;
    
    // Kerlip digital / glitch tipis
    float digitalFlicker = fract(sin(vH * 50.0 + uTime * 2.0 + vSeed) * 43758.5453);
    dataFlow = mix(dataFlow, dataFlow * digitalFlicker, 0.4);

    // Fade out di bagian bawah (lantai) dan atas agar menyatu natural
    float edgeFade = smoothstep(0.0, 0.1, vH) * (1.0 - smoothstep(0.6, 1.0, vH));

    // Base opacity diturunkan drastis agar tembus pandang (hologram)
    float baseOpacity = 0.12; 
    
    float alpha = dataFlow * edgeFade * vFade * baseOpacity;
    
    // Warna dicampur sedikit dengan warna cyan terang saat data kerlip
    vec3 col = mix(uGlow, uHi, dataFlow * 0.5);

    if (alpha < 0.005) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const discVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const discFragment = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uGlow;
  varying vec2 vUv;

  void main() {
    float r = length(vUv * 2.0 - 1.0);
    float body = pow(1.0 - smoothstep(0.0, 1.0, r), 1.7);
    float ring = smoothstep(0.22, 0.4, r) * (1.0 - smoothstep(0.4, 0.72, r));
    vec3 col = mix(uGlow, uCore, smoothstep(0.0, 0.85, r));
    float alpha = body * 0.1 + ring * 0.045;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

function collectNodes() {
  const half = GRID.floorSize * 0.5;
  const step = GRID.majorCell;
  const nodes = [];
  for (let x = -half; x <= half; x += step) {
    for (let z = -half; z <= half; z += step) {
      const dist = Math.hypot(x, z);
      if (dist < 2.1 || dist > half * 0.94) continue;
      const edge = THREE.MathUtils.smoothstep(half * 0.4, half * 0.94, dist);
      if (Math.random() > (edge > 0.4 ? 0.42 : 0.7)) continue;
      const fade = 1 - THREE.MathUtils.smoothstep(half * 0.62, half * 0.94, dist);
      nodes.push({
        x: x + (Math.random() - 0.5) * 0.05,
        z: z + (Math.random() - 0.5) * 0.05,
        seed: Math.random(),
        height: 4.0 + edge * 6.5 + Math.pow(Math.random(), 0.45) * 3.2,
        fade: 0.25 + fade * 0.75,
      });
    }
  }
  return nodes;
}

export function GridLightField() {
  const field = useMemo(() => {
    const src = collectNodes();
    
    // Geometry diubah menjadi garis vertikal tipis, bukan pilar lebar
    const geo = new THREE.PlaneGeometry(0.04, 1, 1, 1); 
    geo.translate(0, 0.5, 0);

    const seeds = new Float32Array(src.length * 2);
    const fades = new Float32Array(src.length * 2);
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    geo.setAttribute('aFade', new THREE.InstancedBufferAttribute(fades, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uGlow: { value: new THREE.Color(ANIMUS.glow) },
        uHi: { value: new THREE.Color(ANIMUS.hi) },
      },
      vertexShader: shaftVertex,
      fragmentShader: shaftFragment,
    });

    const mesh = new THREE.InstancedMesh(geo, material, src.length * 2);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const yAxis = new THREE.Vector3(0, 1, 0);

    const pointPositions = new Float32Array(src.length * 3);
    const pointColors = new Float32Array(src.length * 3);
    const cyan = new THREE.Color(ANIMUS.hi);

    src.forEach((node, i) => {
      // Skala X (lebar) dikecilkan agar terlihat seperti garis grid vertikal
      const width = 0.08 + node.seed * 0.05; 
      
      for (let k = 0; k < 2; k += 1) {
        const idx = i * 2 + k;
        position.set(node.x, 0.02, node.z);
        // Menyilang (Cross) agar garis vertikal bisa dilihat dari berbagai sudut
        quaternion.setFromAxisAngle(yAxis, k * Math.PI * 0.5); 
        scale.set(width, node.height, 1);
        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(idx, matrix);
        seeds[idx] = node.seed;
        fades[idx] = node.fade;
      }
      pointPositions[i * 3] = node.x;
      pointPositions[i * 3 + 1] = 0.05 + node.seed * 0.4;
      pointPositions[i * 3 + 2] = node.z;
      
      const col = cyan.clone().multiplyScalar(node.fade);
      pointColors[i * 3] = col.r;
      pointColors[i * 3 + 1] = col.g;
      pointColors[i * 3 + 2] = col.b;
    });

    geo.getAttribute('aSeed').needsUpdate = true;
    geo.getAttribute('aFade').needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;

    // Titik cahaya kecil di pangkal garis
    const points = new THREE.BufferGeometry();
    points.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    points.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

    const discMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      uniforms: {
        uCore: { value: new THREE.Color(ANIMUS.core) },
        uGlow: { value: new THREE.Color(ANIMUS.glow) },
      },
      vertexShader: discVertex,
      fragmentShader: discFragment,
    });

    return { mesh, material, points, discMaterial };
  }, []);

  useLayoutEffect(
    () => () => {
      field.mesh.geometry.dispose();
      field.material.dispose();
      field.points.dispose();
      field.discMaterial.dispose();
    },
    [field],
  );

  useFrame((state) => {
    field.material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <primitive object={field.mesh} />
      <points geometry={field.points} frustumCulled={false}>
        <pointsMaterial
          vertexColors
          size={0.06}
          sizeAttenuation
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]} material={field.discMaterial}>
        <circleGeometry args={[GRID.floorSize * 0.52, 96]} />
      </mesh>
    </group>
  );
}