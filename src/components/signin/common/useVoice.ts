/**
 * BACKWARD COMPATIBILITY FILE
 * Voice hook is now in src/hooks/useVoice.ts
 * Utility functions are in ./utils.ts
 */

// Re-export voice hook
export { useVoice, default } from '../../../hooks/useVoice';

// Re-export utilities
export {
    formatPhoneNumber,
    speakablePhone,
    validatePhoneNumber,
    validateEmail,
    formatCurrency,
    debounce,
    sleep
} from './utils';
