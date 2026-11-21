/**
 * Straight-Line Choreography (Off-Center)
 * Kamera digeser ke X = 0.5 agar meluncur di antara garis grid (tidak menabrak partikel poros).
 */
const LOW = 1.42;

// Kita buat variabel offset agar mudah diubah jika celahnya kurang pas
// 0.5 biasanya berarti pas di tengah-tengah antara garis 0 dan garis 1
const X_OFFSET = 1.7; 

export const CAMERA_BEATS = [
  // Phase 1: Start. Kamera di radius 15, digeser ke X = 0.5
  { 
    at: 0.0, 
    angle: 0, 
    radius: 15, 
    height: LOW, 
    center: [X_OFFSET, 0, 0], 
    lookAt: [X_OFFSET, 0.42, 2], // Memandang lurus di jalur offset yang sama
    fov: 46, 
    bank: 0 
  },
  
  // Bergerak maju perlahan
  { 
    at: 0.15, 
    angle: 0, 
    radius: 14, 
    height: LOW, 
    center: [X_OFFSET, 0, 0], 
    lookAt: [X_OFFSET, 0.42, 0], 
    fov: 46, 
    bank: 0,
    linear: true 
  },
  
  // Phase 2: Tengok Kiri (Text 1) 
  // Target lookAt sedikit disesuaikan (-5 + 0.5) agar tolehan tetap terasa natural
  { 
    at: 0.3, 
    angle: 0, 
    radius: 13, 
    height: LOW, 
    center: [X_OFFSET, 0, 0], 
    lookAt: [-8, 0.42, 2], 
    fov: 46, 
    bank: -0.04,
    linear: true 
  },
  
  // Phase 3: Langsung lurus kembali ke depan di celah grid
  { 
    at: 0.5, 
    angle: 0, 
    radius: 12, 
    height: LOW, 
    center: [X_OFFSET, 0, 0], 
    lookAt: [X_OFFSET, 0.42, -2], 
    fov: 46, 
    bank: 0,
    linear: true 
  },
  
  // Phase 4: Tengok Kanan (Text 2)
  { 
    at: 0.7, 
    angle: 0, 
    radius: 11, 
    height: LOW, 
    center: [X_OFFSET, 0, 0], 
    lookAt: [10, 0.42, -2], 
    fov: 46, 
    bank: 0.04,
    linear: true 
  },
  
  // Phase 5: Lurus kembali ke depan, bersiap untuk blinding light
  { 
    at: 0.85, 
    angle: 0, 
    radius: 10, 
    height: LOW, 
    center: [X_OFFSET, 0, 0], 
    lookAt: [X_OFFSET, 0.42, -8], 
    fov: 46, 
    bank: 0,
    linear: true 
  },
  
  // End: Berhenti di radius 9
  { 
    at: 1.0, 
    angle: 0, 
    radius: 9, 
    height: LOW, 
    center: [X_OFFSET, 0, 0], 
    lookAt: [X_OFFSET, 0.42, -10], 
    fov: 46, 
    bank: 0 
  }
];

export const CHAPTERS = [
  {
    at: 0.3,
    title: "Phase 2 Trigger",
    text: "Text 1: Panning Left at the Midpoint",
  },
  {
    at: 0.7,
    title: "Phase 4 Trigger",
    text: "Text 2: Panning Right at the Center",
  }
];