import { PianoTilesGame } from '@/components/game/PianoTilesGame';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  return (
    <ErrorBoundary>
      <PianoTilesGame />
    </ErrorBoundary>
  );
};

export default Index;
