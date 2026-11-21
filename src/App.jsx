import { LenisProvider } from './providers/LenisProvider.jsx';
import { StoryStage } from './components/StoryStage.jsx';

export default function App() {
  return (
    <LenisProvider>
      <StoryStage />
    </LenisProvider>
  );
}