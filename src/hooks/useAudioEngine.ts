import { useRef, useCallback, useEffect } from 'react';
import { Synthetizer, SoundFont2 } from 'spessasynth_lib';

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
      
      // Create a basic gain node for now (we'll load SoundFont later when user provides one)
      const gainNode = audioContextRef.current.createGain();
      gainNode.connect(audioContextRef.current.destination);
      
      // For now, we'll use simple oscillator sounds until SoundFont is loaded
      isInitializedRef.current = true;
      
      console.log('Audio engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  }, []);

  const loadSoundFont = useCallback(async (soundFontFile: File) => {
    try {
      if (!audioContextRef.current) {
        await initializeEngine();
      }

      const arrayBuffer = await soundFontFile.arrayBuffer();
      const soundFont = new SoundFont2(arrayBuffer);
      
      // Create synthetizer with the loaded SoundFont
      synthRef.current = new Synthetizer(
        audioContextRef.current!.destination,
        soundFont
      );
      
      console.log('SoundFont loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load SoundFont:', error);
      return false;
    }
  }, [initializeEngine]);

  const playNote = useCallback((note: number, velocity: number = 127, duration: number = 0.2) => {
    try {
      if (synthRef.current) {
        // Use SpessaSynth if available
        synthRef.current.noteOn(0, note, velocity);
        setTimeout(() => {
          synthRef.current?.noteOff(0, note);
        }, duration * 1000);
      } else if (audioContextRef.current) {
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
      console.error('Failed to play note:', error);
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