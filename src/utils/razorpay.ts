// Utility to load Razorpay script and open checkout in sandbox

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src: string): Promise<boolean> {
	return new Promise((resolve) => {
		if (document.querySelector(`script[src="${src}"]`)) {
			resolve(true);
			return;
		}
		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

export type RazorpayCheckoutOptions = {
	key?: string;
	amount: number; // amount in paise
	currency?: string;
	name?: string;
	description?: string;
	image?: string;
	order_id?: string;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	notes?: Record<string, string>;
	theme?: { color?: string };
	handler?: (response: any) => void;
};

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
	const loaded = await loadScript(RAZORPAY_SCRIPT_SRC);
	if (!loaded) {
		throw new Error("Failed to load Razorpay SDK. Please check your network.");
	}

	const key = options.key || (import.meta as any).env?.VITE_RAZORPAY_KEY;
	if (!key) {
		throw new Error("Missing Razorpay key. Set VITE_RAZORPAY_KEY in your environment.");
	}

	const rzpOptions: any = {
		key,
		amount: options.amount,
		currency: options.currency || "INR",
		name: options.name || "VistaView",
		description: options.description || "Cart payment",
		image: options.image,
		order_id: options.order_id,
		prefill: options.prefill,
		notes: options.notes,
		theme: options.theme || { color: "#007E67" },
		handler: options.handler,
	};

	if (!(window as any).Razorpay) {
		throw new Error("Razorpay SDK not available on window after loading.");
	}
	const rzp = new (window as any).Razorpay(rzpOptions);
	rzp.open();
}


