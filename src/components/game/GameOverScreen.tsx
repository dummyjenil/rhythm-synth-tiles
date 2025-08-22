import { motion } from 'framer-motion';
import { RotateCcw, Home, Trophy, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameStats } from '@/hooks/useGameState';

interface GameOverScreenProps {
  stats: GameStats;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const GameOverScreen = ({ 
  stats, 
  highScore, 
  isNewHighScore, 
  onRestart, 
  onBackToMenu 
}: GameOverScreenProps) => {
  return (
    <div className="min-h-screen game-container flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md space-y-6"
      >
        {/* Game Over Title */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Game Over
          </h1>
          {isNewHighScore && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", damping: 15 }}
              className="flex items-center justify-center gap-2 text-success mb-2"
            >
              <Trophy className="w-6 h-6" />
              <span className="font-bold">New High Score!</span>
            </motion.div>
          )}
        </motion.div>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className={`${isNewHighScore ? 'bg-gradient-success border-success/20' : 'bg-card/50 backdrop-blur-sm border-border/50'}`}>
            <CardContent className="pt-6 pb-4">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${isNewHighScore ? 'text-success-foreground' : 'text-foreground'}`}>
                  {stats.finalScore.toLocaleString()}
                </div>
                <div className={`text-sm ${isNewHighScore ? 'text-success-foreground/80' : 'text-muted-foreground'}`}>
                  Final Score
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Max Combo */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-4 h-4 text-accent mr-1" />
                  <span className="text-lg font-bold text-foreground">
                    {stats.maxCombo}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Max Combo
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accuracy */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-4 h-4 text-success mr-1" />
                  <span className="text-lg font-bold text-foreground">
                    {stats.accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Accuracy
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tiles Hit */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground mb-1">
                  {stats.hitTiles}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tiles Hit
                </div>
              </div>
            </CardContent>
          </Card>

          {/* High Score */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="w-4 h-4 text-warning mr-1" />
                  <span className="text-lg font-bold text-foreground">
                    {highScore.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Best Score
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={onRestart}
            className="w-full btn-game text-primary-foreground h-12"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          
          <Button
            onClick={onBackToMenu}
            variant="outline"
            className="w-full h-10"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};