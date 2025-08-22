import { useRef, useCallback, useEffect } from 'react';
import { Synthetizer } from 'spessasynth_lib';
import { logger } from '@/lib/logger';

interface AudioEngineConfig {
  soundFontUrl?: string;
  enableMidi?: boolean;
  enableAudio?: boolean;
}

export const useAudioEngine = (config: AudioEngineConfig = {}) => {
  const synthRef = useRef<Synthetizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef(false);

  const initializeEngine = useCallback(async () => {
    try {
      if (isInitializedRef.current) return;

      // Create AudioContext
      audioContextRef.current = new AudioContext();
      
      // Try to add the worklet processor (this might fail if file not available)
      try {
        // Note: In production, you would need to serve the worklet_processor.min.js file
        // For now, we'll continue without it and use fallback audio
        await audioContextRef.current.audioWorklet.addModule('/worklet_processor.min.js');
      } catch (error) {
        logger.warn('AudioWorklet not available, using fallback audio:', error);
      }
      
      // Create a basic gain node for now
      const gainNode = audioContextRef.current.createGain();
      gainNode.connect(audioContextRef.current.destination);
      
      isInitializedRef.current = true;
      logger.info('Audio engine initialized');
    } catch (error) {
      logger.error('Failed to initialize audio engine:', error);
    }
  }, []);

  const loadSoundFont = useCallback(async (soundFontFile: File) => {
    try {
      if (!audioContextRef.current) {
        await initializeEngine();
      }

      // Resume audio context if needed
      if (audioContextRef.current!.state === 'suspended') {
        await audioContextRef.current!.resume();
      }

      const arrayBuffer = await soundFontFile.arrayBuffer();
      
      // Create synthetizer with the loaded SoundFont ArrayBuffer
      synthRef.current = new Synthetizer(
        audioContextRef.current!.destination,
        arrayBuffer
      );
      
      logger.info('SoundFont loaded successfully');
      return true;
    } catch (error) {
      logger.error('Failed to load SoundFont:', error);
      return false;
    }
  }, [initializeEngine]);

  const playNote = useCallback((note: number, velocity: number = 127, duration: number = 0.2) => {
    try {
      if (!audioContextRef.current) return;

      // Resume audio context if needed
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      if (synthRef.current) {
        // Use SpessaSynth if available
        synthRef.current.noteOn(0, note, velocity);
        setTimeout(() => {
          synthRef.current?.noteOff(0, note);
        }, duration * 1000);
      } else {
        // Fallback to simple oscillator
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        // Convert MIDI note to frequency
        const frequency = 440 * Math.pow(2, (note - 69) / 12);
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(velocity / 127 * 0.3, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + duration);
      }
    } catch (error) {
      logger.error('Failed to play note:', error);
    }
  }, []);

  const playSuccessSound = useCallback(() => {
    playNote(72, 100, 0.1); // C5
  }, [playNote]);

  const playErrorSound = useCallback(() => {
    playNote(36, 127, 0.3); // C2
  }, [playNote]);

  const playComboSound = useCallback((comboCount: number) => {
    // Play ascending notes for combo
    const baseNote = 60 + Math.min(comboCount, 12);
    playNote(baseNote, 80, 0.15);
  }, [playNote]);

  useEffect(() => {
    initializeEngine();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initializeEngine]);

  return {
    initializeEngine,
    loadSoundFont,
    playNote,
    playSuccessSound,
    playErrorSound,
    playComboSound,
    isInitialized: isInitializedRef.current,
    hasSpessaSynth: !!synthRef.current
  };
};