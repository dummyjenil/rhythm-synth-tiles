import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { StartMenu } from './StartMenu';
import { GameBoard } from './GameBoard';
import { GameHUD } from './GameHUD';
import { GameOverScreen } from './GameOverScreen';
import { useToast } from '@/hooks/use-toast';

type GameScreen = 'menu' | 'playing' | 'gameOver';

export const PianoTilesGame = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [backgroundAudio, setBackgroundAudio] = useState<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();
  const gameState = useGameState();
  const audioEngine = useAudioEngine();

  const handleStartGame = useCallback(() => {
    gameState.startGame();
    setCurrentScreen('playing');
    
    // Start background music if available
    if (backgroundAudio && isSoundEnabled) {
      backgroundAudio.currentTime = 0;
      backgroundAudio.play().catch(console.error);
    }
    
    toast({
      title: "Game Started!",
      description: "Tap the black tiles to score points",
      duration: 2000,
    });
  }, [gameState, backgroundAudio, isSoundEnabled, toast]);

  const handleTileClick = useCallback((tileId: string) => {
    const tile = gameState.gameState.tiles.find(t => t.id === tileId);
    if (tile && !tile.isHit && !tile.isMissed) {
      gameState.hitTile(tileId);
      
      if (isSoundEnabled) {
        if (tile.note) {
          audioEngine.playNote(tile.note, 100, 0.2);
        } else {
          audioEngine.playSuccessSound();
        }
        
        // Play combo sound for every 5th combo
        if ((gameState.gameState.combo + 1) % 5 === 0) {
          setTimeout(() => {
            audioEngine.playComboSound(gameState.gameState.combo + 1);
          }, 100);
        }
      }
    }
  }, [gameState, audioEngine, isSoundEnabled]);

  const handleColumnClick = useCallback((column: number) => {
    // This handles when user clicks on empty space - play error sound
    if (isSoundEnabled) {
      audioEngine.playErrorSound();
    }
  }, [audioEngine, isSoundEnabled]);

  const handlePauseToggle = useCallback(() => {
    gameState.pauseGame();
    
    if (backgroundAudio) {
      if (gameState.gameState.isPaused) {
        backgroundAudio.play().catch(console.error);
      } else {
        backgroundAudio.pause();
      }
    }
  }, [gameState, backgroundAudio]);

  const handleGameRestart = useCallback(() => {
    gameState.resetGame();
    setCurrentScreen('menu');
    
    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
    }
  }, [gameState, backgroundAudio]);

  const handleLoadSoundFont = useCallback(async (file: File) => {
    const success = await audioEngine.loadSoundFont(file);
    if (success) {
      toast({
        title: "SoundFont Loaded!",
        description: `${file.name} loaded successfully`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Failed to Load SoundFont",
        description: "Please check the file format",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [audioEngine, toast]);

  const handleLoadAudio = useCallback((file: File) => {
    if (backgroundAudio) {
      backgroundAudio.pause();
      URL.revokeObjectURL(backgroundAudio.src);
    }
    
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.loop = true;
    audio.volume = 0.3;
    setBackgroundAudio(audio);
    
    toast({
      title: "Background Music Loaded!",
      description: `${file.name} will play during games`,
      duration: 3000,
    });
  }, [backgroundAudio, toast]);

  // Handle game over
  useEffect(() => {
    if (gameState.gameState.isGameOver && currentScreen === 'playing') {
      setCurrentScreen('gameOver');
      
      if (backgroundAudio) {
        backgroundAudio.pause();
      }
      
      if (isSoundEnabled) {
        audioEngine.playErrorSound();
      }
    }
  }, [gameState.gameState.isGameOver, currentScreen, backgroundAudio, audioEngine, isSoundEnabled]);

  // Initialize audio engine
  useEffect(() => {
    audioEngine.initializeEngine();
  }, [audioEngine]);

  const currentStats = gameState.getCurrentStats();
  const highScore = gameState.getHighScore();
  const isNewHighScore = currentStats.finalScore > highScore;

  return (
    <div className="w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StartMenu
              onStartGame={handleStartGame}
              onLoadSoundFont={handleLoadSoundFont}
              onLoadAudio={handleLoadAudio}
              highScore={highScore}
              hasSpessaSynth={audioEngine.hasSpessaSynth}
            />
          </motion.div>
        )}

        {currentScreen === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <GameBoard
              tiles={gameState.gameState.tiles}
              onTileClick={handleTileClick}
              onColumnClick={handleColumnClick}
              isPlaying={gameState.gameState.isPlaying}
            />
            <GameHUD
              score={gameState.gameState.score}
              combo={gameState.gameState.combo}
              lives={gameState.gameState.lives}
              isPaused={gameState.gameState.isPaused}
              onPauseToggle={handlePauseToggle}
              onSoundToggle={() => setIsSoundEnabled(!isSoundEnabled)}
              isSoundEnabled={isSoundEnabled}
            />
          </motion.div>
        )}

        {currentScreen === 'gameOver' && (
          <motion.div
            key="gameOver"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameOverScreen
              stats={currentStats}
              highScore={Math.max(highScore, currentStats.finalScore)}
              isNewHighScore={isNewHighScore}
              onRestart={handleStartGame}
              onBackToMenu={handleGameRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};