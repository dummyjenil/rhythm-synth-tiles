import { useState, useCallback, useRef, useEffect } from 'react';

export interface Tile {
  id: string;
  column: number;
  position: number;
  isBlack: boolean;
  isHit: boolean;
  isMissed: boolean;
  note?: number;
  createdAt: number;
}

export interface GameState {
  isPlaying: boolean;
  score: number;
  combo: number;
  maxCombo: number;
  tiles: Tile[];
  gameSpeed: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface GameStats {
  totalTiles: number;
  hitTiles: number;
  missedTiles: number;
  accuracy: number;
  finalScore: number;
  maxCombo: number;
}

const INITIAL_STATE: GameState = {
  isPlaying: false,
  score: 0,
  combo: 0,
  maxCombo: 0,
  tiles: [],
  gameSpeed: 1,
  lives: 3,
  isGameOver: false,
  isPaused: false,
};

const COLUMN_NOTES = [60, 64, 67, 72]; // C4, E4, G4, C5

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastTileTimeRef = useRef<number>(0);
  const tileIntervalRef = useRef<number>(1500); // ms between tiles
  const statsRef = useRef<GameStats>({
    totalTiles: 0,
    hitTiles: 0,
    missedTiles: 0,
    accuracy: 0,
    finalScore: 0,
    maxCombo: 0,
  });

  const generateTile = useCallback((): Tile => {
    const column = Math.floor(Math.random() * 4);
    return {
      id: `tile-${Date.now()}-${Math.random()}`,
      column,
      position: 0,
      isBlack: Math.random() > 0.3, // 70% chance for black tiles
      isHit: false,
      isMissed: false,
      note: COLUMN_NOTES[column],
      createdAt: Date.now(),
    };
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...INITIAL_STATE,
      isPlaying: true,
      tiles: [generateTile()],
    }));
    lastTileTimeRef.current = Date.now();
    statsRef.current = {
      totalTiles: 0,
      hitTiles: 0,
      missedTiles: 0,
      accuracy: 0,
      finalScore: 0,
      maxCombo: 0,
    };
  }, [generateTile]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => {
      const finalStats = {
        ...statsRef.current,
        finalScore: prev.score,
        maxCombo: prev.maxCombo,
        accuracy: statsRef.current.totalTiles > 0 
          ? (statsRef.current.hitTiles / statsRef.current.totalTiles) * 100 
          : 0,
      };
      
      // Save high score to localStorage
      const highScore = parseInt(localStorage.getItem('pianoTilesHighScore') || '0');
      if (prev.score > highScore) {
        localStorage.setItem('pianoTilesHighScore', prev.score.toString());
      }
      
      return {
        ...prev,
        isPlaying: false,
        isGameOver: true,
      };
    });
  }, []);

  const hitTile = useCallback((tileId: string) => {
    setGameState(prev => {
      const updatedTiles = prev.tiles.map(tile => 
        tile.id === tileId ? { ...tile, isHit: true } : tile
      );
      
      const hitTile = prev.tiles.find(tile => tile.id === tileId);
      if (!hitTile || hitTile.isHit || hitTile.isMissed) return prev;

      const newCombo = prev.combo + 1;
      const scoreIncrease = hitTile.isBlack ? 100 : 50;
      const comboBonus = Math.floor(newCombo / 10) * 25;
      
      statsRef.current.hitTiles++;
      
      return {
        ...prev,
        tiles: updatedTiles,
        score: prev.score + scoreIncrease + comboBonus,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        gameSpeed: Math.min(3, 1 + newCombo / 50), // Increase speed with combo
      };
    });
  }, []);

  const missTile = useCallback((tileId?: string) => {
    setGameState(prev => {
      const updatedTiles = tileId 
        ? prev.tiles.map(tile => 
            tile.id === tileId ? { ...tile, isMissed: true } : tile
          )
        : prev.tiles;
      
      statsRef.current.missedTiles++;
      
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        setTimeout(endGame, 500);
        return {
          ...prev,
          tiles: updatedTiles,
          combo: 0,
          lives: 0,
        };
      }
      
      return {
        ...prev,
        tiles: updatedTiles,
        combo: 0,
        lives: newLives,
      };
    });
  }, [endGame]);

  const updateTilePositions = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isPaused) return prev;
      
      const now = Date.now();
      const deltaTime = 16; // ~60fps
      const moveSpeed = 200 * prev.gameSpeed; // pixels per second
      const movement = (moveSpeed * deltaTime) / 1000;
      
      // Update tile positions
      let updatedTiles = prev.tiles.map(tile => ({
        ...tile,
        position: tile.position + movement,
      }));
      
      // Remove tiles that went off screen or were hit
      const tilesToRemove: string[] = [];
      updatedTiles.forEach(tile => {
        if (tile.position > window.innerHeight + 100) {
          if (!tile.isHit && !tile.isMissed && tile.isBlack) {
            // Missed a black tile
            missTile(tile.id);
          }
          tilesToRemove.push(tile.id);
        } else if (tile.isHit && Date.now() - tile.createdAt > 300) {
          // Remove hit tiles after animation delay
          tilesToRemove.push(tile.id);
        }
      });
      
      updatedTiles = updatedTiles.filter(tile => !tilesToRemove.includes(tile.id));
      
      // Generate new tiles
      if (now - lastTileTimeRef.current > tileIntervalRef.current / prev.gameSpeed) {
        const newTile = generateTile();
        updatedTiles.push(newTile);
        lastTileTimeRef.current = now;
        statsRef.current.totalTiles++;
        
        // Gradually decrease interval between tiles
        tileIntervalRef.current = Math.max(800, tileIntervalRef.current - 5);
      }
      
      return {
        ...prev,
        tiles: updatedTiles,
      };
    });
  }, [generateTile, missTile]);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE);
    tileIntervalRef.current = 1500;
    lastTileTimeRef.current = 0;
    statsRef.current = {
      totalTiles: 0,
      hitTiles: 0,
      missedTiles: 0,
      accuracy: 0,
      finalScore: 0,
      maxCombo: 0,
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver && !gameState.isPaused) {
      gameLoopRef.current = setInterval(updateTilePositions, 16);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isGameOver, gameState.isPaused, updateTilePositions]);

  const getHighScore = useCallback(() => {
    return parseInt(localStorage.getItem('pianoTilesHighScore') || '0');
  }, []);

  const getCurrentStats = useCallback((): GameStats => {
    return {
      ...statsRef.current,
      finalScore: gameState.score,
      maxCombo: gameState.maxCombo,
      accuracy: statsRef.current.totalTiles > 0 
        ? (statsRef.current.hitTiles / statsRef.current.totalTiles) * 100 
        : 0,
    };
  }, [gameState.score, gameState.maxCombo]);

  return {
    gameState,
    startGame,
    pauseGame,
    endGame,
    resetGame,
    hitTile,
    missTile,
    getHighScore,
    getCurrentStats,
  };
};