import { useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { AnimusVoid } from './AnimusVoid.jsx';
import { AnimusGridFormation } from './AnimusGridFormation.jsx';
import { EdgeMask } from './EdgeMask.jsx';
import { GridLightField } from './GridLightField.jsx';
import { scrollStore } from './scrollStore.js';
import { SoundController } from './SoundController.jsx';

export function Experience() {
  const gl = useThree((state) => state.gl);

  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
  }, [gl]);

  useFrame(() => {
    const lift = THREE.MathUtils.smoothstep(scrollStore.progress, 0.30, 0.40);
    gl.toneMappingExposure = 1.08 + lift * 1.35;
  });

  return (
    <>
      <color attach="background" args={['#041328']} />
      <fog attach="fog" args={['#041328', 12, 34]} />

      <SoundController />

      <ambientLight intensity={0.38} color="#071833" />
      <hemisphereLight intensity={0.22} color="#12355F" groundColor="#020610" />
      <directionalLight position={[-14, 9, -12]} intensity={2.4} color="#7AF0FF" />
      <directionalLight position={[10, 5, 16]} intensity={0.4} color="#0A2748" />

      <AnimusGridFormation sculpt={false} />
      <EdgeMask />
      <GridLightField />
      <AnimusVoid />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.42}
          luminanceThreshold={0.72}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}