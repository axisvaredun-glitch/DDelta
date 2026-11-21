import * as THREE from 'three';
import {
  createHoloSubjectGeometry,
  gridSpawnPosition,
} from '../geometry/holoSubject.js';
import { GRID } from '../world/gridConfig.js';

/**
 * Maps object vertices onto the Animus floor grid so the floor itself
 * lifts, breaks away, and becomes the hologram.
 */
export function buildGridFormation({
  floorSize = GRID.floorSize,
  floorSegments = GRID.segments,
  claimRadius = GRID.claimRadius,
} = {}) {
  const floor = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments);
  floor.rotateX(-Math.PI / 2);
  const floorPos = floor.attributes.position;
  const floorCount = floorPos.count;

  const base = new Float32Array(floorCount * 3);
  const target = new Float32Array(floorCount * 3);
  const claimed = new Float32Array(floorCount);
  const detach = new Float32Array(floorCount);

  for (let i = 0; i < floorCount; i += 1) {
    base[i * 3] = floorPos.getX(i);
    base[i * 3 + 1] = floorPos.getY(i);
    base[i * 3 + 2] = floorPos.getZ(i);
  }

  const object = createHoloSubjectGeometry();
  const objCount = object.attributes.position.count;
  const objectToFloor = new Int32Array(objCount);

  for (let o = 0; o < objCount; o += 1) {
    const ox = object.attributes.position.getX(o);
    const oy = object.attributes.position.getY(o);
    const oz = object.attributes.position.getZ(o);

    let best = -1;
    let bestD = claimRadius;

    for (let f = 0; f < floorCount; f += 1) {
      if (claimed[f] > 0.5) continue;
      const dx = floorPos.getX(f) - ox;
      const dz = floorPos.getZ(f) - oz;
      const d = Math.hypot(dx, dz);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }

    if (best < 0) {
      for (let f = 0; f < floorCount; f += 1) {
        const dx = floorPos.getX(f) - ox;
        const dz = floorPos.getZ(f) - oz;
        const d = Math.hypot(dx, dz);
        if (d < bestD) {
          bestD = d;
          best = f;
        }
      }
    }

    objectToFloor[o] = best;
    if (best >= 0) {
      claimed[best] = 1;
      target[best * 3] = ox;
      target[best * 3 + 1] = oy;
      target[best * 3 + 2] = oz;
    }
  }

  floor.setAttribute('aBase', new THREE.BufferAttribute(base, 3));
  floor.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
  floor.setAttribute('aClaimed', new THREE.BufferAttribute(claimed, 1));
  floor.setAttribute('aDetach', new THREE.BufferAttribute(detach, 1));

  const objectDynamic = object.clone();
  const objPos = new Float32Array(objCount * 3);
  const objTarget = new Float32Array(objCount * 3);
  const objSpawn = new Float32Array(objCount * 3);

  for (let o = 0; o < objCount; o += 1) {
    const ox = object.attributes.position.getX(o);
    const oy = object.attributes.position.getY(o);
    const oz = object.attributes.position.getZ(o);
    objTarget[o * 3] = ox;
    objTarget[o * 3 + 1] = oy;
    objTarget[o * 3 + 2] = oz;
    const spawn = gridSpawnPosition(ox, oz);
    objSpawn[o * 3] = spawn.x;
    objSpawn[o * 3 + 1] = spawn.y;
    objSpawn[o * 3 + 2] = spawn.z;
  }

  objectDynamic.setAttribute('position', new THREE.BufferAttribute(objPos, 3));
  objectDynamic.setAttribute(
    'aTarget',
    new THREE.BufferAttribute(objTarget, 3),
  );
  objectDynamic.setAttribute('aSpawn', new THREE.BufferAttribute(objSpawn, 3));
  objectDynamic.computeVertexNormals();

  return {
    floorGeo: floor,
    objectGeo: objectDynamic,
    objectToFloor,
    floorCount,
    objCount,
  };
}