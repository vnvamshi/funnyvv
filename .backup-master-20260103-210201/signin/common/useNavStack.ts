// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - useNavStack Hook
// Navigation breadcrumb tracking for voice "go back" commands
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

interface NavItem {
  id: string;
  label: string;
  data?: any;
}

export const useNavStack = (initial: NavItem) => {
  const [stack, setStack] = useState<NavItem[]>([initial]);

  const push = useCallback((item: NavItem) => {
    setStack(prev => [...prev, item]);
  }, []);

  const pop = useCallback(() => {
    setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    return stack[stack.length - 2] || null;
  }, [stack]);

  const reset = useCallback(() => {
    setStack([initial]);
  }, [initial]);

  const current = stack[stack.length - 1];
  const canGoBack = stack.length > 1;
  const breadcrumbs = stack.map(s => s.label);

  return { stack, current, canGoBack, breadcrumbs, push, pop, reset };
};

export default useNavStack;
