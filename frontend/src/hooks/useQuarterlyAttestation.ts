"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getRestApiOrigin } from "@/lib/rest-api";

function currentQuarterId(): string {
	const d = new Date();
	return `${d.getFullYear()}-Q${String(Math.floor(d.getMonth() / 3) + 1)}`;
}

const STORAGE_KEY = "clara_ejection_quarterly_attest";

export function useQuarterlyAttestation() {
	const { getToken, isLoaded, userId } = useAuth();
	const [userHasEjections, setUserHasEjections] = useState(false);
	const [loading, setLoading] = useState(true);
	const quarter = useMemo(() => currentQuarterId(), []);

	useEffect(() => {
		if (!isLoaded || !userId) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		void (async () => {
			try {
				const t = await getToken();
				if (!t) {
					if (!cancelled) {
						setLoading(false);
					}
					return;
				}
				const r = await fetch(`${getRestApiOrigin()}/api/ejections`, {
					headers: { Authorization: `Bearer ${t}` },
				});
				const j = (await r.json().catch(() => ({}))) as { ejections?: unknown[] };
				if (!cancelled) {
					setUserHasEjections(Array.isArray(j.ejections) && j.ejections.length > 0);
				}
			} catch {
				if (!cancelled) {
					setUserHasEjections(false);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isLoaded, userId, getToken]);

	const [needsAttestation, setNeedsAttestation] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || !userHasEjections) {
			setNeedsAttestation(false);
			return;
		}
		const attested = window.localStorage.getItem(STORAGE_KEY) === quarter;
		setNeedsAttestation(!attested);
	}, [userHasEjections, quarter]);

	const confirm = useCallback(() => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(STORAGE_KEY, quarter);
		}
		setNeedsAttestation(false);
	}, [quarter]);

	return {
		userHasEjections,
		needsAttestation: !loading && needsAttestation,
		loading,
		confirm,
	};
}
