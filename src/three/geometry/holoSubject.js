import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GRID } from '../world/gridConfig.js';

/** Procedural rabbit silhouette — swap with imported GLB when ready. */
export function createHoloSubjectGeometry() {
  const body = new THREE.SphereGeometry(0.52, 32, 32);
  body.scale(1, 0.88, 1.15);

  const head = new THREE.SphereGeometry(0.3, 22, 22);
  head.translate(0.42, 0.48, 0);

  const earL = new THREE.ConeGeometry(0.09, 0.42, 10);
  earL.rotateZ(0.35);
  earL.translate(0.34, 0.88, 0.12);

  const earR = earL.clone();
  earR.translate(0, 0, -0.24);

  const tail = new THREE.SphereGeometry(0.12, 12, 12);
  tail.translate(-0.58, 0.22, 0);

  const merged = mergeGeometries([body, head, earL, earR, tail], false);
  merged.computeVertexNormals();
  merged.center();
  merged.translate(0, 0.55, 0);
  return merged;
}

export function gridSpawnPosition(x, z, cell = GRID.cell) {
  const gx = Math.round(x / cell) * cell;
  const gz = Math.round(z / cell) * cell;
  const wave =
    Math.sin(gx * 2.1) * 0.04 + Math.cos(gz * 1.8) * 0.04;
  return new THREE.Vector3(gx, wave, gz);
}