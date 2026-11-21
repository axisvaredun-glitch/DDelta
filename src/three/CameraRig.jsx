import { useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_BEATS } from '../data/chapters.js';
import { scrollStore } from './scrollStore.js';

const lookTarget = new THREE.Vector3();
const camPos = new THREE.Vector3();
const dampPos = new THREE.Vector3();
const dampLook = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);

let dampFov = 46;
let dampBank = 0;
let targetBank = 0;
const LAMBDA = 3.4;

const MAX_DOLLY_DISTANCE = 20;

// Titik awal & jalur lurus yang disamakan dengan koordinat awal Animus Void (X_OFFSET = 1.7, LOW = 1.42, radius awal = 15)
const START_X = 1.7;
const START_Y = 1.42;
const START_Z = 15;
const STRAIGHT_TRAVEL_DISTANCE = 28;

// Sudut 355 deg -> melewati 360 deg (0 deg) -> perlahan ke 10 deg
// Dalam sudut kontinu: 355 deg = -5 deg, 360 deg = 0 deg, 10 deg = +10 deg
const BANK_START_DEG = -5; // 355 deg
const BANK_END_DEG = 10;   // 10 deg (melewati 360 deg / 0 deg)

// Ketinggian tambahan di atas lantai Animus Void pada fase Loading 2
const LOADING2_HEIGHT_BOOST = 1.35;

function lerp(a, b, t) {
  return THREE.MathUtils.lerp(a, b, t);
}

function sample(progress, mode, elapsed = 0) {
  // ====================================================
  // JALUR 1: FASE LOADING (Mulai dari koordinat awal Animus Void, jalan lurus tanpa tengok)
  // ====================================================
  if (mode === 'loading') {
    const travel = progress * STRAIGHT_TRAVEL_DISTANCE;

    // Posisi awal di X = 1.7, Y = 1.42, Z = 15, lalu meluncur lurus ke Z negatif
    camPos.set(START_X, START_Y, START_Z - travel);

    // Pandangan lurus ke depan sejajar jalur X & Y (tanpa menoleh kiri/kanan)
    lookTarget.set(START_X, START_Y, START_Z - travel - 15);

    targetBank = 0;
    return 46;
  }

  // ====================================================
  // JALUR 3: FASE LOADING 2 (355 -> 360 -> 10 deg, lebih tinggi dari lantai, maju lurus sambil menstabilkan badan)
  // ====================================================
  if (mode === 'loading2') {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    const smoothP = THREE.MathUtils.smoothstep(p, 0, 1);

    // 1. Maju lurus ke depan sepanjang Z
    const forwardTravel = p * STRAIGHT_TRAVEL_DISTANCE;

    // 2. Bengkok-bengkok halus (S-curve) saat melaju untuk menyeimbangkan arah
    const weaveX =
      Math.sin(p * Math.PI * 2.5 + elapsed * 1.1) * 0.42 +
      Math.cos(elapsed * 1.7) * 0.14;

    // 3. Ketinggian lebih tinggi dari lantai Animus Void + koreksi stabilisasi naik-turun
    const elevatedBaseY = START_Y + LOADING2_HEIGHT_BOOST;
    const rawAltitudeWave = Math.sin(p * Math.PI * 3 + elapsed * 1.4) * 0.2;
    const altitudeCorrection = Math.cos(p * Math.PI * 3 + elapsed * 1.4 + 0.7) * 0.08;

    const posX = START_X + weaveX;
    const posY = elevatedBaseY + rawAltitudeWave + altitudeCorrection;
    const posZ = START_Z - forwardTravel;

    camPos.set(posX, posY, posZ);

    // 4. Pandangan mengikuti ketinggian baru dan mengoreksi belokan halus
    lookTarget.set(
      START_X + weaveX * 0.55,
      elevatedBaseY + (rawAltitudeWave + altitudeCorrection) * 0.45 - 0.1,
      posZ - 15,
    );

    // 5. Sudut perlahan dari 355 deg (-5 deg) -> melewati 360 deg (0 deg) -> ke 10 deg (+10 deg)
    // Ditambah mikro-koreksi stabilisasi sayap yang mengecil saat mendekati 10 deg
    const baseSweepDeg = THREE.MathUtils.lerp(BANK_START_DEG, BANK_END_DEG, smoothP);
    const stabilizeTrimDeg =
      -Math.cos(p * Math.PI * 2.5 + elapsed * 1.1) * (2.2 * (1 - smoothP * 0.5)) +
      Math.sin(elapsed * 2.0) * 0.9;

    targetBank = THREE.MathUtils.degToRad(baseSweepDeg + stabilizeTrimDeg);
    return 46;
  }

  // ====================================================
  // JALUR 2: FASE INTRO (Koreografi Asli)
  // ====================================================
  const beats = CAMERA_BEATS;
  let index = 0;
  while (index < beats.length - 1 && progress >= beats[index + 1].at) index += 1;
  const from = beats[index];
  const to = beats[Math.min(index + 1, beats.length - 1)];
  const span = Math.max(0.0001, to.at - from.at);
  const raw = THREE.MathUtils.clamp((progress - from.at) / span, 0, 1);
  const t = to.linear ? raw : THREE.MathUtils.smoothstep(raw, 0, 1);
  const angle = lerp(from.angle, to.angle, t);
  const radius = lerp(from.radius, to.radius, t);
  const height = lerp(from.height, to.height, t);

  const center = [
    lerp(from.center[0], to.center[0], t),
    lerp(from.center[1], to.center[1], t),
    lerp(from.center[2], to.center[2], t),
  ];

  const zDollyOffset = progress * -MAX_DOLLY_DISTANCE;

  camPos.set(
    center[0] + Math.sin(angle) * radius,
    center[1] + height,
    center[2] + Math.cos(angle) * radius + zDollyOffset,
  );

  lookTarget.set(
    lerp(from.lookAt[0], to.lookAt[0], t),
    lerp(from.lookAt[1], to.lookAt[1], t),
    lerp(from.lookAt[2], to.lookAt[2], t) + zDollyOffset,
  );

  targetBank = lerp(from.bank ?? 0, to.bank ?? 0, t);
  return lerp(from.fov, to.fov, t);
}

function seed(camera, mode, elapsed = 0) {
  const fov = sample(scrollStore.progress, mode, elapsed);
  dampPos.copy(camPos);
  dampLook.copy(lookTarget);
  dampFov = fov;
  dampBank = targetBank;
  camera.position.copy(dampPos);
  up.set(Math.sin(dampBank), Math.cos(dampBank), 0);
  camera.up.copy(up);
  camera.lookAt(dampLook);
  camera.fov = fov;
  camera.updateProjectionMatrix();
}

export function CameraRig({ mode = 'intro' }) {
  const { camera, clock } = useThree();

  useLayoutEffect(() => {
    seed(camera, mode, clock.elapsedTime);
  }, [camera, clock, mode]);

  useFrame((state, delta) => {
    const fov = sample(scrollStore.progress, mode, state.clock.elapsedTime);
    const step = Math.min(delta, 0.05);

    dampPos.x = THREE.MathUtils.damp(dampPos.x, camPos.x, LAMBDA, step);
    dampPos.y = THREE.MathUtils.damp(dampPos.y, camPos.y, LAMBDA, step);
    dampPos.z = THREE.MathUtils.damp(dampPos.z, camPos.z, LAMBDA, step);
    dampLook.x = THREE.MathUtils.damp(dampLook.x, lookTarget.x, LAMBDA, step);
    dampLook.y = THREE.MathUtils.damp(dampLook.y, lookTarget.y, LAMBDA, step);
    dampLook.z = THREE.MathUtils.damp(dampLook.z, lookTarget.z, LAMBDA, step);
    dampFov = THREE.MathUtils.damp(dampFov, fov, LAMBDA, step);
    dampBank = THREE.MathUtils.damp(dampBank, targetBank, LAMBDA, step);

    up.set(Math.sin(dampBank), Math.cos(dampBank), 0);
    camera.up.copy(up);
    camera.position.copy(dampPos);
    camera.lookAt(dampLook);

    if (Math.abs(camera.fov - dampFov) > 0.02) {
      camera.fov = dampFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}