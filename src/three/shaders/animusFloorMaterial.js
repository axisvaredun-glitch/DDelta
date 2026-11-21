import * as THREE from 'three';
import { ANIMUS } from '../../theme/animusPalette.js';

const vertexShader = /* glsl */ `
  uniform float uFormation;
  uniform vec2 uPulse;
  varying vec2 vWorldXZ;
  varying float vLift;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec2 xz = world.xz;

    float dist = length(xz - uPulse);
    float bend = exp(-dist * dist * 0.22) * uFormation * 1.1;
    float ripple = sin(dist * 6.0 - uFormation * 8.0) * 0.06 * uFormation;
    world.y += bend + ripple;

    vWorldXZ = xz;
    vLift = bend;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uFormation;
  uniform vec3 uDeep;
  uniform vec3 uCore;
  uniform vec3 uGlow;
  uniform vec3 uHi;
  varying vec2 vWorldXZ;
  varying float vLift;

  float gridLine(vec2 uv, float scale) {
    vec2 g = abs(fract(uv * scale - 0.5) - 0.5);
    float line = min(g.x, g.y);
    return smoothstep(0.035, 0.0, line);
  }

  void main() {
    vec2 uv = vWorldXZ;

    float major = gridLine(uv, 0.35);
    float minor = gridLine(uv, 1.75) * 0.45;
    float cross = max(major, minor);

    float dist = length(uv);
    float horizon = smoothstep(18.0, 2.5, dist);
    float pulse = 0.55 + 0.45 * sin(uTime * 1.2 + dist * 0.35);

    vec3 base = mix(uDeep, uCore, horizon * 0.35);
    vec3 glow = mix(uCore, uGlow, cross);
    vec3 color = base + glow * (cross * 0.75 + vLift * 0.9) * pulse;
    color = mix(color, uHi, cross * vLift * 0.35 * uFormation);

  float alpha = 0.55 + cross * 0.4 + vLift * 0.25;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function createAnimusFloorMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uFormation: { value: 0 },
      uPulse: { value: new THREE.Vector2(0, 0) },
      uDeep: { value: new THREE.Color(ANIMUS.deep) },
      uCore: { value: new THREE.Color(ANIMUS.core) },
      uGlow: { value: new THREE.Color(ANIMUS.glow) },
      uHi: { value: new THREE.Color(ANIMUS.hi) },
    },
    vertexShader,
    fragmentShader,
  });
}