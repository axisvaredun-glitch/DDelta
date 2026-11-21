import * as THREE from 'three';

export const scrollStore = {
  progress: 0,
  listeners: new Set(),
};

export function publishProgress(progress) {
  scrollStore.progress = progress;
  scrollStore.listeners.forEach((listener) => listener(progress));
}

export function readSequenceProgress(sequence) {
  const el = sequence || document.getElementById('entrance-sequence');
  if (!el) return scrollStore.progress;
  const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
  const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), scrollable);
  return scrolled / scrollable;
}

export function readFormation() {
  return THREE.MathUtils.smoothstep(scrollStore.progress, 0.02, 0.2);
}