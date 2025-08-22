// Secure localStorage utilities with validation

/**
 * Safely gets a numeric value from localStorage with validation
 */
export function getStoredNumber(key: string, defaultValue: number = 0): number {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    const parsed = parseInt(stored, 10);
    if (isNaN(parsed) || !isFinite(parsed)) {
      console.warn(`Invalid stored value for ${key}, using default`);
      return defaultValue;
    }
    
    // Sanity check for reasonable score values
    if (key.includes('Score') && (parsed < 0 || parsed > 10000000)) {
      console.warn(`Suspicious score value for ${key}, using default`);
      return defaultValue;
    }
    
    return parsed;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely sets a numeric value in localStorage
 */
export function setStoredNumber(key: string, value: number): boolean {
  try {
    if (!isFinite(value) || isNaN(value)) {
      console.warn(`Invalid value for ${key}: ${value}`);
      return false;
    }
    
    localStorage.setItem(key, value.toString());
    return true;
  } catch (error) {
    console.warn(`Failed to write ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Safely gets a string value from localStorage with validation
 */
export function getStoredString(key: string, defaultValue: string = ''): string {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    // Basic sanitization - remove any null bytes or control characters
    const sanitized = stored.replace(/[\x00-\x1F\x7F]/g, '');
    return sanitized;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely sets a string value in localStorage
 */
export function setStoredString(key: string, value: string): boolean {
  try {
    // Sanitize the value before storing
    const sanitized = value.replace(/[\x00-\x1F\x7F]/g, '');
    localStorage.setItem(key, sanitized);
    return true;
  } catch (error) {
    console.warn(`Failed to write ${key} to localStorage:`, error);
    return false;
  }
}