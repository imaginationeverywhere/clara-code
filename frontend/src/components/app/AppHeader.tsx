"use client";

import Link from "next/link";
import { ProfileWidget } from "./ProfileWidget";

export function AppHeader() {
	return (
		<header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center border-b border-border bg-bg-base px-6">
			<Link href="/" className="flex items-center gap-0.5">
				<span className="text-sm font-bold tracking-tight text-text-primary">Clara</span>
				<span className="font-mono text-sm font-bold tracking-tight text-brand-blue">Code</span>
			</Link>
			<div className="ml-auto">
				<ProfileWidget />
			</div>
		</header>
	);
}
