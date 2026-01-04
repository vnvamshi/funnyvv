// ═══════════════════════════════════════════════════════════════════════════════
// AGENTIC MODULE - ALL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// VoiceBrain
export { voiceBrain, extractDigits, formatPhone } from './VoiceBrain';
export type { AudioState, VoiceMode } from './VoiceBrain';

// AgenticBar - import default, re-export as both named and default
import AgenticBarComponent from './AgenticBar';
export const AgenticBar = AgenticBarComponent;
export default AgenticBarComponent;

// Re-export the helper functions from AgenticBar
export { 
  useVoice,
  speak,
  onDigits,
  onCommand,
  startListening,
  stopListening,
  setContext,
  setMode
} from './AgenticBar';

// WalkAndClick - only if it exports something
export { initWalkAndClick } from './WalkAndClick';
