import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type FloatingAskBarContextValue = {
	isVisible: boolean;
	show: () => void;
	hide: () => void;
	toggle: () => void;
};

const FloatingAskBarContext = createContext<FloatingAskBarContextValue | undefined>(undefined);

export const FloatingAskBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isVisible, setIsVisible] = useState<boolean>(true);

	const show = useCallback(() => setIsVisible(true), []);
	const hide = useCallback(() => setIsVisible(false), []);
	const toggle = useCallback(() => setIsVisible(v => !v), []);

	const value = useMemo(() => ({ isVisible, show, hide, toggle }), [isVisible, show, hide, toggle]);

	return (
		<FloatingAskBarContext.Provider value={value}>{children}</FloatingAskBarContext.Provider>
	);
};

export function useFloatingAskBar() {
	const ctx = useContext(FloatingAskBarContext);
	if (!ctx) throw new Error('useFloatingAskBar must be used within FloatingAskBarProvider');
	return ctx;
}

// Helper component to hide the bar while mounted (use inside pages or sections)
export const HideFloatingAskBar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	const { hide, show } = useFloatingAskBar();
	React.useEffect(() => {
		hide();
		return () => {
			show();
		};
	}, [hide, show]);
	return <>{children}</>;
}; 