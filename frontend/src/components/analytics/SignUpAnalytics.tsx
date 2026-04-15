"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function SignUpAnalytics() {
	const { user, isLoaded } = useUser();
	const { track } = useAnalytics();
	const done = useRef(false);

	useEffect(() => {
		if (!isLoaded || !user || done.current) return;
		const key = `ga_signup_${user.id}`;
		try {
			if (sessionStorage.getItem(key)) return;
		} catch {
			return;
		}
		const createdAt = user.createdAt;
		if (!createdAt) return;
		const created = new Date(createdAt).getTime();
		if (Number.isFinite(created) && Date.now() - created < 120_000) {
			const hasOAuth = (user.externalAccounts?.length ?? 0) > 0;
			track("sign_up", { method: hasOAuth ? "oauth" : "email" });
			try {
				sessionStorage.setItem(key, "1");
			} catch {
				/* ignore */
			}
			done.current = true;
		}
	}, [isLoaded, user, track]);

	return null;
}
