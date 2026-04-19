declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
	}
}

export function useAnalytics() {
	const track = (eventName: string, params?: Record<string, unknown>) => {
		if (typeof window !== "undefined" && typeof window.gtag === "function") {
			window.gtag("event", eventName, params);
		}
	};

	return { track };
}
