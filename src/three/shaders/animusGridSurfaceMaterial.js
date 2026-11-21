import * as THREE from 'three';
import { ANIMUS } from '../../theme/animusPalette.js';
import { GRID } from '../world/gridConfig.js';

const vertexShader = /* glsl */ `
  attribute float aDetach;
  varying vec2 vXZ;
  varying float vDetach;
  void main() {
    vDetach = aDetach;
    vXZ = position.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uFormation;
  uniform float uGridPulse;
  uniform float uMinorScale;
  uniform float uMajorScale;
  uniform float uHorizonStart;
  uniform float uHorizonEnd;
  uniform vec3 uDeep;
  uniform vec3 uVoid;
  uniform vec3 uCore;
  uniform vec3 uGlow;
  uniform vec3 uHi;
  varying vec2 vXZ;
  varying float vDetach;

  float gridLine(vec2 uv, float scale) {
    vec2 g = abs(fract(uv * scale - 0.5) - 0.5);
    return smoothstep(0.045, 0.0, min(g.x, g.y));
  }

  void main() {
    float detachMask = clamp(vDetach * uFormation, 0.0, 1.0);

    float minor = gridLine(vXZ, uMinorScale) * 0.42;
    float major = gridLine(vXZ, uMajorScale);
    float cross = max(major, minor);

    float dist = length(vXZ);
    float horizon = smoothstep(uHorizonStart, uHorizonEnd, dist);
    float pulse = 0.6 + 0.4 * sin(uTime * 1.1 + dist * 0.28);
    float bloomPulse = 1.0 + uGridPulse * 1.85;

    vec3 base = mix(uVoid, mix(uDeep, uCore, horizon * 0.4), 0.55);
    base = mix(base, uDeep, detachMask * 0.18);

    vec3 color = base;
    color += mix(uCore, uGlow, cross) * (0.48 + cross * 0.38) * pulse * bloomPulse;
    color = mix(color, uHi, cross * (0.14 + detachMask * 0.08 + uGridPulse * 0.35));
    color = max(color, uVoid * 0.65);

    float alpha = 0.52 + cross * 0.38;
    alpha = mix(alpha, 0.45 + cross * 0.42, detachMask);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function createAnimusGridSurfaceMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uFormation: { value: 0 },
      uGridPulse: { value: 0 },
      uMinorScale: { value: GRID.minorLineScale },
      uMajorScale: { value: GRID.majorLineScale },
      uHorizonStart: { value: GRID.horizonFadeStart },
      uHorizonEnd: { value: GRID.horizonFadeEnd },
      uVoid: { value: new THREE.Color(ANIMUS.void) },
      uDeep: { value: new THREE.Color(ANIMUS.deep) },
      uCore: { value: new THREE.Color(ANIMUS.core) },
      uGlow: { value: new THREE.Color(ANIMUS.glow) },
      uHi: { value: new THREE.Color(ANIMUS.hi) },
    },
    vertexShader,
    fragmentShader,
  });
}