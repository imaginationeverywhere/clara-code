"use client";

import { useCallback, useState } from "react";

export function useVoiceMute() {
	const [isMuted, setIsMuted] = useState(() => {
		if (typeof window === "undefined") return false;
		return sessionStorage.getItem("clara-muted") === "1";
	});

	const toggle = useCallback(() => {
		setIsMuted((prev) => {
			const next = !prev;
			sessionStorage.setItem("clara-muted", next ? "1" : "0");
			if (typeof window !== "undefined") {
				window.dispatchEvent(new Event("clara-muted-change"));
			}
			return next;
		});
	}, []);

	return { isMuted, toggle };
}
