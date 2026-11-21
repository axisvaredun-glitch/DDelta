import { BounceMotes } from './BounceMotes.jsx';
import { VoidInteractionSparks } from './VoidInteractionSparks.jsx';
import { VoidMotes } from './VoidMotes.jsx';
import { WaveMotes } from './WaveMotes.jsx'; // Import file baru lu

export function AnimusVoid() {
  return (
    <group>
      {/* Lautan partikel ombak warna-warni yang baru lu buat */}
      <WaveMotes count={30000} /> 
      
      <VoidMotes />
      <BounceMotes />
      <VoidInteractionSparks />
    </group>
  );
}