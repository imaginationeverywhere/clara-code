"use client";

import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";

export function HeroPrimaryCta() {
	const { track } = useAnalytics();
	return (
		<Link
			href="#install"
			onClick={() => track("select_content", { content_type: "cta", item_id: "hero_cta" })}
			className="rounded-full bg-[#7C3AED] px-8 py-4 text-[15px] font-semibold text-white shadow-[0_4px_30px_rgba(124,58,237,0.4)] transition hover:bg-[#6D28D9]"
		>
			Get started
		</Link>
	);
}
