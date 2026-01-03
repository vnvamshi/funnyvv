const STORAGE_KEY = 'vistaview:selectedPropertyId';

export const persistSelectedPropertyId = (propertyId: string) => {
	try {
		sessionStorage.setItem(STORAGE_KEY, propertyId);
	} catch {
		// sessionStorage might be unavailable (SSR or privacy mode)
	}
	try {
		localStorage.setItem(STORAGE_KEY, propertyId);
	} catch {
		// localStorage might be unavailable (SSR or privacy mode)
	}
};

export const readSelectedPropertyId = (): string | null => {
	try {
		return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
	} catch {
		try {
			return localStorage.getItem(STORAGE_KEY);
		} catch {
			return null;
		}
	}
};

export const clearSelectedPropertyId = () => {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {}
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {}
};

export const SELECTED_PROPERTY_STORAGE_KEY = STORAGE_KEY;

