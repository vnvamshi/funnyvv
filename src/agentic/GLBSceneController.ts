// ═══════════════════════════════════════════════════════════════════════════════
// GLB SCENE CONTROLLER - Voice control for 3D building viewer
// "Go to floor 44", "show me the lobby", etc.
// ═══════════════════════════════════════════════════════════════════════════════

import { voiceBrain } from './VoiceBrain';

interface SceneState {
  currentFloor: number;
  totalFloors: number;
  currentHotspot: string | null;
  cameraPreset: string;
}

class GLBSceneControllerClass {
  private static instance: GLBSceneControllerClass;
  
  private state: SceneState = {
    currentFloor: 1,
    totalFloors: 50,
    currentHotspot: null,
    cameraPreset: 'exterior'
  };
  
  private viewerAPI: any = null;
  private listeners = new Set<(state: SceneState) => void>();
  
  private constructor() {}
  
  static getInstance(): GLBSceneControllerClass {
    if (!GLBSceneControllerClass.instance) {
      GLBSceneControllerClass.instance = new GLBSceneControllerClass();
    }
    return GLBSceneControllerClass.instance;
  }
  
  // Register GLB viewer API
  registerViewer(api: any): void {
    this.viewerAPI = api;
    console.log('[GLBScene] Viewer registered');
  }
  
  // Get current state
  getState(): SceneState {
    return { ...this.state };
  }
  
  // Subscribe to state changes
  subscribe(listener: (state: SceneState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
  
  private updateState(partial: Partial<SceneState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => l(this.state));
    
    // Dispatch DOM event for non-React listeners
    window.dispatchEvent(new CustomEvent('glb-state-change', { 
      detail: this.state 
    }));
  }
  
  // Go to specific floor
  async goToFloor(floorNumber: number): Promise<boolean> {
    if (floorNumber < 1 || floorNumber > this.state.totalFloors) {
      voiceBrain.speak(`Floor ${floorNumber} doesn't exist. This building has floors 1 to ${this.state.totalFloors}.`);
      return false;
    }
    
    console.log('[GLBScene] Going to floor:', floorNumber);
    
    // Call viewer API if available
    if (this.viewerAPI?.focusFloor) {
      this.viewerAPI.focusFloor(floorNumber);
    }
    
    this.updateState({ currentFloor: floorNumber, currentHotspot: null });
    voiceBrain.speak(`Going to floor ${floorNumber}.`);
    
    return true;
  }
  
  // Go to hotspot
  async goToHotspot(hotspotId: string): Promise<boolean> {
    const hotspots = ['lobby', 'amenities', 'rooftop', 'pool', 'gym', 'parking', 'entrance'];
    
    if (!hotspots.includes(hotspotId.toLowerCase())) {
      voiceBrain.speak(`I don't know where ${hotspotId} is in this building.`);
      return false;
    }
    
    console.log('[GLBScene] Going to hotspot:', hotspotId);
    
    if (this.viewerAPI?.focusHotspot) {
      this.viewerAPI.focusHotspot(hotspotId);
    }
    
    this.updateState({ currentHotspot: hotspotId });
    voiceBrain.speak(`Going to the ${hotspotId}.`);
    
    return true;
  }
  
  // Set camera preset
  async setCameraPreset(preset: string): Promise<boolean> {
    const presets = ['exterior', 'interior', 'aerial', 'street', 'birds-eye'];
    
    if (!presets.includes(preset.toLowerCase())) {
      voiceBrain.speak(`Unknown camera view: ${preset}.`);
      return false;
    }
    
    console.log('[GLBScene] Setting camera:', preset);
    
    if (this.viewerAPI?.setCameraPreset) {
      this.viewerAPI.setCameraPreset(preset);
    }
    
    this.updateState({ cameraPreset: preset });
    voiceBrain.speak(`Switching to ${preset} view.`);
    
    return true;
  }
  
  // Process voice command
  processCommand(cmd: string): boolean {
    const lower = cmd.toLowerCase();
    
    // Floor navigation: "go to floor 44", "floor 12", "44th floor"
    const floorMatch = lower.match(/(?:go to |take me to |show me |floor |)(\d+)(?:st|nd|rd|th)?\s*(?:floor)?/);
    if (floorMatch) {
      const floorNum = parseInt(floorMatch[1]);
      if (floorNum >= 1 && floorNum <= 100) {
        this.goToFloor(floorNum);
        return true;
      }
    }
    
    // Hotspots
    const hotspots = [
      { keywords: ['lobby', 'entrance', 'front'], id: 'lobby' },
      { keywords: ['amenities', 'amenity'], id: 'amenities' },
      { keywords: ['rooftop', 'roof', 'top'], id: 'rooftop' },
      { keywords: ['pool', 'swimming'], id: 'pool' },
      { keywords: ['gym', 'fitness', 'workout'], id: 'gym' },
      { keywords: ['parking', 'garage'], id: 'parking' }
    ];
    
    for (const { keywords, id } of hotspots) {
      if (keywords.some(k => lower.includes(k))) {
        this.goToHotspot(id);
        return true;
      }
    }
    
    // Camera presets
    if (lower.includes('exterior') || lower.includes('outside')) {
      this.setCameraPreset('exterior');
      return true;
    }
    if (lower.includes('interior') || lower.includes('inside')) {
      this.setCameraPreset('interior');
      return true;
    }
    if (lower.includes('aerial') || lower.includes("bird's eye") || lower.includes('birds eye')) {
      this.setCameraPreset('aerial');
      return true;
    }
    if (lower.includes('street') || lower.includes('ground level')) {
      this.setCameraPreset('street');
      return true;
    }
    
    // Floor shortcuts
    if (lower.includes('top floor') || lower.includes('penthouse') || lower.includes('highest')) {
      this.goToFloor(this.state.totalFloors);
      return true;
    }
    if (lower.includes('ground') || lower.includes('first floor') || lower.includes('bottom')) {
      this.goToFloor(1);
      return true;
    }
    if (lower.includes('go up') || lower.includes('next floor') || lower.includes('floor up')) {
      this.goToFloor(Math.min(this.state.currentFloor + 1, this.state.totalFloors));
      return true;
    }
    if (lower.includes('go down') || lower.includes('previous floor') || lower.includes('floor down')) {
      this.goToFloor(Math.max(this.state.currentFloor - 1, 1));
      return true;
    }
    
    return false;
  }
}

export const glbSceneController = GLBSceneControllerClass.getInstance();

// Initialize GLB voice control
export function initGLBVoiceControl(): void {
  voiceBrain.onCommand((cmd: string) => {
    // Only process if on GLB viewer page
    const isGLBPage = 
      window.location.pathname.includes('skyven') || 
      window.location.pathname.includes('glb') ||
      window.location.pathname.includes('building') ||
      document.querySelector('[data-glb-viewer]') !== null;
    
    if (isGLBPage) {
      glbSceneController.processCommand(cmd);
    }
  });
  
  console.log('[GLBScene] ✅ Voice control initialized');
}

export default glbSceneController;
