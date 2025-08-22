import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GameTile } from './GameTile';
import type { Tile } from '@/hooks/useGameState';

interface GameBoardProps {
  tiles: Tile[];
  onTileClick: (tileId: string) => void;
  onColumnClick: (column: number) => void;
  isPlaying: boolean;
}

export const GameBoard = ({ tiles, onTileClick, onColumnClick, isPlaying }: GameBoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);
  
  const COLUMNS = 4;
  const getColumnWidth = () => {
    return boardRef.current ? boardRef.current.offsetWidth / COLUMNS : 100;
  };

  useEffect(() => {
    // Update column width based on container size
    const updateSize = () => {
      if (boardRef.current) {
        const boardWidth = boardRef.current.offsetWidth;
        const newColumnWidth = boardWidth / COLUMNS;
        columnsRef.current.forEach((col, index) => {
          if (col) {
            col.style.width = `${newColumnWidth}px`;
            col.style.left = `${index * newColumnWidth}px`;
          }
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleColumnClick = (column: number) => {
    if (!isPlaying) return;
    
    // Find the bottommost black tile in this column
    const columnTiles = tiles
      .filter(tile => tile.column === column && tile.isBlack && !tile.isHit && !tile.isMissed)
      .sort((a, b) => b.position - a.position);
    
    if (columnTiles.length > 0) {
      const bottomTile = columnTiles[0];
      // Only allow hitting tiles that are in the bottom section
      if (bottomTile.position > window.innerHeight * 0.6) {
        onTileClick(bottomTile.id);
      }
    }
    
    onColumnClick(column);
  };

  return (
    <div 
      ref={boardRef}
      className="relative w-full h-full overflow-hidden game-container"
    >
      {/* Column separators */}
      {Array.from({ length: COLUMNS - 1 }, (_, i) => (
        <div
          key={`separator-${i}`}
          className="absolute top-0 bottom-0 w-px bg-border/20"
          style={{ left: `${((i + 1) / COLUMNS) * 100}%` }}
        />
      ))}
      
      {/* Touch zones for each column */}
      {Array.from({ length: COLUMNS }, (_, i) => (
        <div
          key={`column-${i}`}
          ref={(el) => {
            if (el) columnsRef.current[i] = el;
          }}
          className="absolute top-0 bottom-0 cursor-pointer"
          style={{
            left: `${(i / COLUMNS) * 100}%`,
            width: `${100 / COLUMNS}%`,
          }}
          onClick={() => handleColumnClick(i)}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleColumnClick(i);
          }}
        />
      ))}
      
      {/* Hit zone indicator at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-8 left-0 right-0 h-1 bg-accent/30 pointer-events-none" />
      
      {/* Render tiles */}
      {tiles.map(tile => (
        <GameTile
          key={tile.id}
          tile={tile}
          onTileClick={onTileClick}
          columnWidth={getColumnWidth()}
        />
      ))}
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      </div>
    </div>
  );
};