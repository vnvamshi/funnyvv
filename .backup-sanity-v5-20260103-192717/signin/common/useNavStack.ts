// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - NAVIGATION STACK HOOK
// Enables "go back" to work everywhere
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

export interface NavEntry {
  id: string;
  label: string;
  data?: any;
}

export const useNavStack = (initialEntry?: NavEntry) => {
  const [stack, setStack] = useState<NavEntry[]>(initialEntry ? [initialEntry] : []);
  const [current, setCurrent] = useState<NavEntry | null>(initialEntry || null);

  const push = useCallback((entry: NavEntry) => {
    if (current) {
      setStack(prev => [...prev, current]);
    }
    setCurrent(entry);
  }, [current]);

  const pop = useCallback((): NavEntry | null => {
    if (stack.length === 0) return null;
    const newStack = [...stack];
    const previous = newStack.pop()!;
    setStack(newStack);
    setCurrent(previous);
    return previous;
  }, [stack]);

  const reset = useCallback((entry?: NavEntry) => {
    setStack([]);
    setCurrent(entry || null);
  }, []);

  const canGoBack = stack.length > 0;

  return { current, stack, push, pop, reset, canGoBack };
};

export default useNavStack;
