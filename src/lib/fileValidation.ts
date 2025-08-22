// File validation utilities for enhanced security

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  SOUNDFONT: 50 * 1024 * 1024, // 50MB
  AUDIO: 100 * 1024 * 1024,    // 100MB
} as const;

// Magic bytes for file type validation
const MAGIC_BYTES = {
  SF2: [0x52, 0x49, 0x46, 0x46], // RIFF
  SF3: [0x52, 0x49, 0x46, 0x46], // RIFF (same as SF2)
  DLS: [0x52, 0x49, 0x46, 0x46], // RIFF
  MP3: [0x49, 0x44, 0x33], // ID3 or [0xFF, 0xFB] for MPEG
  WAV: [0x52, 0x49, 0x46, 0x46], // RIFF
  OGG: [0x4F, 0x67, 0x67, 0x53], // OggS
} as const;

/**
 * Validates file size against limits
 */
export function validateFileSize(file: File, type: 'SOUNDFONT' | 'AUDIO'): FileValidationResult {
  const limit = FILE_SIZE_LIMITS[type];
  
  if (file.size > limit) {
    const limitMB = Math.round(limit / (1024 * 1024));
    const sizeMB = Math.round(file.size / (1024 * 1024));
    return {
      isValid: false,
      error: `File size (${sizeMB}MB) exceeds limit of ${limitMB}MB`
    };
  }
  
  return { isValid: true };
}

/**
 * Reads the first few bytes of a file to check magic bytes
 */
async function readFileHeader(file: File, bytesToRead: number = 16): Promise<Uint8Array> {
  const slice = file.slice(0, bytesToRead);
  const arrayBuffer = await slice.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Validates file type using magic bytes
 */
export async function validateFileType(file: File, expectedTypes: string[]): Promise<FileValidationResult> {
  try {
    const header = await readFileHeader(file);
    
    // Check against expected magic bytes
    for (const type of expectedTypes) {
      const magicBytes = MAGIC_BYTES[type as keyof typeof MAGIC_BYTES];
      if (magicBytes && header.length >= magicBytes.length) {
        const matches = magicBytes.every((byte, index) => header[index] === byte);
        if (matches) {
          return { isValid: true };
        }
      }
    }
    
    // Special case for MP3 - can start with different headers
    if (expectedTypes.includes('MP3')) {
      // Check for MPEG frame sync (0xFF, 0xFB/0xFA/0xF3/0xF2)
      if (header[0] === 0xFF && (header[1] & 0xE0) === 0xE0) {
        return { isValid: true };
      }
    }
    
    return {
      isValid: false,
      error: `Invalid file type. Expected: ${expectedTypes.join(', ')}`
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to read file header'
    };
  }
}

/**
 * Comprehensive file validation
 */
export async function validateSoundFont(file: File): Promise<FileValidationResult> {
  // Check file size
  const sizeCheck = validateFileSize(file, 'SOUNDFONT');
  if (!sizeCheck.isValid) return sizeCheck;
  
  // Check file extension
  const validExtensions = ['.sf2', '.sf3', '.dls'];
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file extension. Expected: ${validExtensions.join(', ')}`
    };
  }
  
  // Check magic bytes
  const typeCheck = await validateFileType(file, ['SF2', 'SF3', 'DLS']);
  if (!typeCheck.isValid) return typeCheck;
  
  return { isValid: true };
}

/**
 * Comprehensive audio file validation
 */
export async function validateAudioFile(file: File): Promise<FileValidationResult> {
  // Check file size
  const sizeCheck = validateFileSize(file, 'AUDIO');
  if (!sizeCheck.isValid) return sizeCheck;
  
  // Check MIME type
  if (!file.type.startsWith('audio/')) {
    return {
      isValid: false,
      error: 'Invalid MIME type. Expected audio file'
    };
  }
  
  // Check magic bytes for common audio formats
  const typeCheck = await validateFileType(file, ['MP3', 'WAV', 'OGG']);
  if (!typeCheck.isValid) {
    // Fallback to MIME type check for other audio formats
    const audioMimeTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/aac'];
    if (!audioMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Unsupported audio format'
      };
    }
  }
  
  return { isValid: true };
}