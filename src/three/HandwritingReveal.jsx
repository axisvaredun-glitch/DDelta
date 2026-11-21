import { useRef, useMemo } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

export function HandwritingReveal({ text = "The next section\ngotta be good", isTriggered = true }) {
  const handGroupRef = useRef();
  const textRef = useRef();
  const camera = useThree((state) => state.camera);
  
  // Pastikan hand-pen.png ada di dalam folder "public"
  const handTexture = useTexture('/hand-pen.png');

  // Karena dirender di depan lensa kamera, ukurannya kita sesuaikan agar lebih kecil dan pas di layar
  const config = useMemo(() => ({
    startX: -1.2,        
    endX: 1.2,           
    duration: 3.0,       
    baseY: 0,            
    handScale: 0.8,      
  }), []);

  const state = useRef({
    progress: 0,
    isWriting: false,
    hasFinished: false,
  });

  useFrame((_, delta) => {
    if (!isTriggered) return;

    const s = state.current;
    
    if (s.progress < 1.0 && !s.hasFinished) {
      s.progress += delta / config.duration;
      s.isWriting = true;
      if (s.progress >= 1.0) {
        s.progress = 1.0;
        s.isWriting = false;
        s.hasFinished = true;
      }
    }

    const currentX = THREE.MathUtils.lerp(config.startX, config.endX, s.progress);

    // Update Text Masking (Reveal dari kiri ke kanan)
    if (textRef.current) {
      textRef.current.clipRect = [-5, -5, currentX, 5];
    }

    // Gerakan Tangan & Pena
    if (handGroupRef.current) {
      const time = performance.now() * 0.001;
      const hand = handGroupRef.current;

      if (s.isWriting) {
        // Efek getaran tangan menulis (Micro-motions)
        const jitterY = Math.sin(time * 25) * 0.015 + Math.cos(time * 15) * 0.01;
        const jitterZ = Math.sin(time * 18) * 0.01;
        const wristTilt = Math.sin(time * 12) * 0.03;

        hand.position.x = THREE.MathUtils.lerp(hand.position.x, currentX, 0.2);
        hand.position.y = THREE.MathUtils.lerp(hand.position.y, config.baseY + jitterY, 0.2);
        hand.position.z = THREE.MathUtils.lerp(hand.position.z, jitterZ, 0.2);
        hand.rotation.z = THREE.MathUtils.lerp(hand.rotation.z, wristTilt, 0.2);
      } 
      else if (s.hasFinished) {
        // Tangan mundur dan turun ke luar layar setelah selesai
        hand.position.x = THREE.MathUtils.lerp(hand.position.x, config.endX + 2, 0.05);
        hand.position.y = THREE.MathUtils.lerp(hand.position.y, -3, 0.05);
        hand.rotation.z = THREE.MathUtils.lerp(hand.rotation.z, -0.3, 0.05);
      } 
      else {
        // Posisi awal ngumpet di kanan bawah
        hand.position.set(config.startX, -3, 0);
      }
    }
  });

  // Render paksa ke dalam kamera menggunakan createPortal
  return createPortal(
    <group position={[0.5, -0.2, -2.5]}> {/* Posisi geser ke kanan layar (X: 0.5) dan jarak di depan lensa (Z: -2.5) */}
      
      {/* Teks tanpa param "font" agar tidak error 404 */}
      <Text
        ref={textRef}
        position={[0, config.baseY, -0.05]}
        fontSize={0.25}
        color="#ffffff" // Diubah ke putih sementara agar kontras
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        lineHeight={1.2}
        textAlign="left"
      >
        {text}
      </Text>

      <group ref={handGroupRef}>
        <mesh 
          // Offset ujung pena agar 0,0,0 tepat berada di ujung nib
          position={[config.handScale * 0.15, -config.handScale * 0.25, 0]} 
          scale={config.handScale}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial 
            map={handTexture} 
            transparent={true} 
            depthWrite={false} 
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      
    </group>,
    camera
  );
}