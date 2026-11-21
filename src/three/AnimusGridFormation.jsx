import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ANIMUS } from '../theme/animusPalette.js';
import { buildGridFormation } from './formation/buildGridFormation.js';
import { createAnimusGridSurfaceMaterial } from './shaders/animusGridSurfaceMaterial.js';

export function AnimusGridFormation({ sculpt: _sculpt = true }) {
  const gridWireRef = useRef();
  const data = useMemo(() => buildGridFormation(), []);
  const floorMat = useMemo(() => createAnimusGridSurfaceMaterial(), []);

  useLayoutEffect(
    () => () => {
      data.floorGeo.dispose();
      data.objectGeo.dispose();
      floorMat.dispose();
    },
    [data, floorMat],
  );

  useFrame((state) => {
    floorMat.uniforms.uTime.value = state.clock.elapsedTime;
    floorMat.uniforms.uFormation.value = 0;
    if (floorMat.uniforms.uGridPulse) {
      floorMat.uniforms.uGridPulse.value = 0;
    }
  });

  return (
    <group>
      <mesh geometry={data.floorGeo} material={floorMat} />
      <mesh ref={gridWireRef} geometry={data.floorGeo} position={[0, 0.03, 0]}>
        <meshBasicMaterial
          wireframe
          color={ANIMUS.glow}
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}