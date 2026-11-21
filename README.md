# DDelta

Scroll storytelling dengan **Three.js (R3F)**, **React + Vite**, **Tailwind CSS**, **GSAP ScrollTrigger**, dan **Lenis**.

## Stack

| Layer | Package |
|-------|---------|
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` |
| UI | `react`, Tailwind v4 (`@tailwindcss/vite`) |
| Scroll / motion | `gsap`, `lenis` |
| DCC | Blender → export **glTF / GLB** ke `public/models/` |

## Run

```bash
cd DDelta
npm install
npm run dev
```

## Blender workflow

1. Model + **clay** material (principled: high roughness, low metalness).
2. Rig + animasi loop (opsional).
3. Export **glTF Binary (.glb)** → `public/models/character.glb`.
4. Ganti `PlaceholderCharacter` dengan `useGLTF` / `<Model />` dari drei.

## Customize story

Edit `src/data/chapters.js` — tiap chapter punya copy UI + target `camera.position` / `camera.lookAt`. ScrollTrigger menginterpolasi kamera antar chapter.

## Struktur

```
src/
  components/StoryStage.jsx   # Tailwind sections + scroll root
  providers/LenisProvider.jsx # Lenis ↔ GSAP ticker
  three/                      # Canvas, scene, camera rig
  data/chapters.js
```