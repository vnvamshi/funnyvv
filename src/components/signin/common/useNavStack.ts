import { useState, useCallback } from 'react';
interface NavItem { id: string; label: string; }
export const useNavStack = (initial: NavItem) => {
  const [stack, setStack] = useState<NavItem[]>([initial]);
  const push = useCallback((item: NavItem) => setStack(prev => [...prev, item]), []);
  const pop = useCallback(() => setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev), []);
  return { stack, current: stack[stack.length - 1], canGoBack: stack.length > 1, push, pop };
};
export default useNavStack;
