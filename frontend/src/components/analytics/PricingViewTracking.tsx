"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function PricingViewTracking() {
	const { track } = useAnalytics();
	useEffect(() => {
		track("view_item_list", { item_list_name: "pricing_plans" });
	}, [track]);
	return null;
}
