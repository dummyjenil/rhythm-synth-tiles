import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Tile } from '@/hooks/useGameState';

interface GameTileProps {
  tile: Tile;
  onTileClick: (tileId: string) => void;
  columnWidth: number;
}

export const GameTile = ({ tile, onTileClick, columnWidth }: GameTileProps) => {
  const handleClick = () => {
    if (!tile.isHit && !tile.isMissed) {
      onTileClick(tile.id);
    }
  };

  return (
    <motion.div
      className={cn(
        "absolute cursor-pointer select-none",
        "piano-tile transition-all duration-150",
        {
          "piano-tile-black": tile.isBlack && !tile.isHit && !tile.isMissed,
          "piano-tile-white": !tile.isBlack && !tile.isHit && !tile.isMissed,
          "piano-tile-active": tile.isHit,
          "piano-tile-miss": tile.isMissed,
        }
      )}
      style={{
        left: `${tile.column * columnWidth}px`,
        top: `${tile.position}px`,
        width: `${columnWidth - 4}px`,
        height: '120px',
      }}
      onClick={handleClick}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleClick();
      }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        scale: tile.isHit ? 0.9 : 1,
        opacity: tile.isHit ? 0 : 1,
      }}
      transition={{
        duration: tile.isHit ? 0.3 : 0.1,
        ease: "easeOut"
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Tile glow effect for black tiles */}
      {tile.isBlack && !tile.isHit && !tile.isMissed && (
        <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-90" />
      )}
      
      {/* Hit effect */}
      {tile.isHit && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-success"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      )}
      
      {/* Miss effect */}
      {tile.isMissed && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-destructive"
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
};