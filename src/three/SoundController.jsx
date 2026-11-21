import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { scrollStore } from './scrollStore.js';

export function SoundController() {
  const audioRef = useRef(null);
  const isPlaying = useRef(false);

  useEffect(() => {
    // Memanggil file dari folder public/sounds/
    const base = import.meta.env.BASE_URL || '/';
    audioRef.current = new Audio(`${base}sounds/animus-ambient.mp3`);
    audioRef.current.loop = true;  // Mengulang audio terus menerus
    audioRef.current.volume = 0.5; // Mengatur volume (0.0 sampai 1.0)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useFrame(() => {
    if (!audioRef.current) return;

    // Mengambil posisi scroll saat ini (0.0 - 1.0)
    const progress = scrollStore.progress;

    // ==========================================
    // PENGATURAN TITIK TRIGGER SCROLL
    // ==========================================
    // Misalnya: 
    // - Mulai bunyi saat scroll mencapai 5% (0.05)
    // - Berhenti berbunyi saat scroll mencapai 85% (0.85 - fase blinding light)
    
    const startThreshold = 0.05; 
    const stopThreshold = 0.85;  

    // Kondisi 1: Berada di area aktif (di antara start dan stop) DAN belum play
    if (progress >= startThreshold && progress < stopThreshold && !isPlaying.current) {
      audioRef.current.play().then(() => {
        isPlaying.current = true;
      }).catch(() => {
        // Abaikan error jika browser memblokir autoplay sebelum user interaksi
      });
    } 
    // Kondisi 2: Berada di luar area aktif (di bawah start atau di atas stop) DAN sedang play
    else if ((progress < startThreshold || progress >= stopThreshold) && isPlaying.current) {
      audioRef.current.pause();
      isPlaying.current = false;
    }
  });

  return null; 
}