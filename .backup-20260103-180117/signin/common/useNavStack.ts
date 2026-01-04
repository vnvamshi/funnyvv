// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - NAVIGATION STACK HOOK v2.0
// Enables "go back" to work everywhere with full history
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from 'react';

export interface NavEntry {
  id: string;
  label: string;
  type?: 'modal' | 'page' | 'step' | 'subpage';
  data?: any;
  timestamp?: number;
}

interface UseNavStackOptions {
  maxHistory?: number;
  onNavigate?: (entry: NavEntry, direction: 'push' | 'pop') => void;
}

export const useNavStack = (initialEntry?: NavEntry, options: UseNavStackOptions = {}) => {
  const { maxHistory = 50, onNavigate } = options;
  
  const [stack, setStack] = useState<NavEntry[]>([]);
  const [current, setCurrent] = useState<NavEntry | null>(
    initialEntry ? { ...initialEntry, timestamp: Date.now() } : null
  );

  // Push a new entry onto the stack
  const push = useCallback((entry: NavEntry) => {
    const newEntry = { ...entry, timestamp: Date.now() };
    
    if (current) {
      setStack(prev => {
        const newStack = [...prev, current];
        // Limit history size
        if (newStack.length > maxHistory) {
          return newStack.slice(-maxHistory);
        }
        return newStack;
      });
    }
    
    setCurrent(newEntry);
    onNavigate?.(newEntry, 'push');
  }, [current, maxHistory, onNavigate]);

  // Pop and return to the previous entry
  const pop = useCallback((): NavEntry | null => {
    if (stack.length === 0) return null;
    
    const newStack = [...stack];
    const previous = newStack.pop()!;
    
    setStack(newStack);
    setCurrent(previous);
    onNavigate?.(previous, 'pop');
    
    return previous;
  }, [stack, onNavigate]);

  // Reset the stack to initial state
  const reset = useCallback((entry?: NavEntry) => {
    setStack([]);
    setCurrent(entry ? { ...entry, timestamp: Date.now() } : null);
  }, []);

  // Replace current entry without affecting history
  const replace = useCallback((entry: NavEntry) => {
    setCurrent({ ...entry, timestamp: Date.now() });
  }, []);

  // Go back multiple steps
  const goBackSteps = useCallback((steps: number): NavEntry | null => {
    if (steps <= 0 || steps > stack.length) return null;
    
    const newStack = stack.slice(0, -steps);
    const target = stack[stack.length - steps];
    
    setStack(newStack);
    setCurrent(target);
    onNavigate?.(target, 'pop');
    
    return target;
  }, [stack, onNavigate]);

  // Find an entry in history by id
  const findInHistory = useCallback((id: string): NavEntry | null => {
    if (current?.id === id) return current;
    return stack.find(entry => entry.id === id) || null;
  }, [current, stack]);

  // Get breadcrumb trail
  const breadcrumbs = useMemo(() => {
    const trail = [...stack];
    if (current) trail.push(current);
    return trail;
  }, [stack, current]);

  // Check if we can go back
  const canGoBack = stack.length > 0;

  // Get history depth
  const depth = stack.length + (current ? 1 : 0);

  // Get the previous entry without popping
  const previous = stack.length > 0 ? stack[stack.length - 1] : null;

  return {
    // State
    current,
    stack,
    breadcrumbs,
    previous,
    depth,
    canGoBack,
    
    // Actions
    push,
    pop,
    reset,
    replace,
    goBackSteps,
    findInHistory
  };
};

export default useNavStack;
