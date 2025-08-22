import { motion } from 'framer-motion';
import { Pause, Play, Volume2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameHUDProps {
  score: number;
  combo: number;
  lives: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onSoundToggle: () => void;
  isSoundEnabled: boolean;
}

export const GameHUD = ({ 
  score, 
  combo, 
  lives, 
  isPaused, 
  onPauseToggle, 
  onSoundToggle,
  isSoundEnabled 
}: GameHUDProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 p-4">
      <div className="flex justify-between items-start">
        {/* Left side - Score and Combo */}
        <div className="space-y-2">
          <motion.div 
            className="score-display text-foreground"
            animate={{ scale: 1 }}
            key={score}
            initial={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {score.toLocaleString()}
          </motion.div>
          
          {combo > 0 && (
            <motion.div
              className={cn(
                "combo-display px-3 py-1 rounded-full",
                "bg-gradient-success text-success-foreground text-sm font-bold",
                combo > 10 && "animate-glow-pulse"
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={combo}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
            >
              {combo}x COMBO
            </motion.div>
          )}
        </div>
        
        {/* Right side - Controls and Lives */}
        <div className="flex items-center gap-2">
          {/* Lives display */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: i < lives ? 1 : 0.7,
                  opacity: i < lives ? 1 : 0.3 
                }}
                transition={{ duration: 0.2 }}
              >
                <Heart 
                  className={cn(
                    "w-5 h-5",
                    i < lives ? "text-destructive fill-destructive" : "text-muted-foreground"
                  )}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSoundToggle}
            className={cn(
              "w-10 h-10 p-0 rounded-full",
              isSoundEnabled ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          
          {/* Pause button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onPauseToggle}
            className="w-10 h-10 p-0 rounded-full text-foreground hover:bg-accent/20"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Pause overlay */}
      {isPaused && (
        <motion.div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Game Paused</h2>
            <Button
              onClick={onPauseToggle}
              className="btn-game text-primary-foreground"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};