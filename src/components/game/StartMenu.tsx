import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Upload, Trophy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import heroImage from '@/assets/piano-tiles-hero.jpg';

interface StartMenuProps {
  onStartGame: () => void;
  onLoadSoundFont: (file: File) => void;
  onLoadAudio: (file: File) => void;
  highScore: number;
  hasSpessaSynth: boolean;
}

export const StartMenu = ({ 
  onStartGame, 
  onLoadSoundFont, 
  onLoadAudio, 
  highScore,
  hasSpessaSynth 
}: StartMenuProps) => {
  const [soundFontFile, setSoundFontFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleSoundFontUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.sf2') || file.name.endsWith('.sf3') || file.name.endsWith('.dls'))) {
      setSoundFontFile(file);
      onLoadSoundFont(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      onLoadAudio(file);
    }
  };

  return (
    <div className="min-h-screen game-container flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(1px)'
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md space-y-6"
      >
        {/* Title */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Piano Tiles
          </h1>
          <p className="text-muted-foreground text-lg">
            Tap the rhythm, feel the beat
          </p>
        </motion.div>

        {/* High Score */}
        {highScore > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center"
          >
            <Card className="bg-gradient-success border-success/20">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-success-foreground" />
                  <span className="text-success-foreground font-semibold">
                    Best Score: {highScore.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="space-y-4"
        >
          {/* Start Game Button */}
          <Button
            onClick={onStartGame}
            className="w-full btn-game text-primary-foreground h-14 text-lg"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Game
          </Button>

          {/* Audio Setup */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Audio Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SoundFont Upload */}
              <div className="space-y-2">
                <Label htmlFor="soundfont" className="text-sm font-medium">
                  SoundFont File (.sf2, .sf3, .dls)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="soundfont"
                    type="file"
                    accept=".sf2,.sf3,.dls"
                    onChange={handleSoundFontUpload}
                    className="flex-1"
                  />
                  {soundFontFile && (
                    <div className="flex items-center text-success text-xs">
                      ✓
                    </div>
                  )}
                </div>
                {soundFontFile && (
                  <p className="text-xs text-success">
                    Loaded: {soundFontFile.name}
                  </p>
                )}
              </div>

              {/* Background Music Upload */}
              <div className="space-y-2">
                <Label htmlFor="audio" className="text-sm font-medium">
                  Background Music (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="flex-1"
                  />
                  {audioFile && (
                    <div className="flex items-center text-success text-xs">
                      ✓
                    </div>
                  )}
                </div>
                {audioFile && (
                  <p className="text-xs text-success">
                    Loaded: {audioFile.name}
                  </p>
                )}
              </div>

              {/* Audio Status */}
              <div className="text-xs text-muted-foreground">
                {hasSpessaSynth ? (
                  <span className="text-success">✓ SpessaSynth Ready</span>
                ) : (
                  <span>Using fallback audio (load SoundFont for better quality)</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>Tap the black tiles as they fall down</p>
          <p>Don't let them reach the bottom!</p>
        </motion.div>
      </motion.div>
    </div>
  );
};