"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth() {
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const key = localStorage.getItem("clara_api_key");
		if (!key) {
			router.replace(
				`https://claracode.ai/sign-in?redirect=${encodeURIComponent(window.location.href)}`,
			);
			return;
		}
		setApiKey(key);
		setLoading(false);
	}, [router]);

	return { apiKey, loading };
}
