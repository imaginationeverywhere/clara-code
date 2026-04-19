"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
	{ href: "/", label: "Dashboard" },
	{ href: "/talents/new", label: "Submit Talent" },
	{ href: "/program", label: "Developer Program" },
	{ href: "/docs", label: "Documentation" },
];

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-56 bg-bg-surface border-r border-border flex flex-col shrink-0">
			<div className="px-6 py-5 border-b border-border">
				<span className="text-lg font-bold">Developer Portal</span>
			</div>
			<nav className="flex-1 px-3 py-4 space-y-1">
				{NAV.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={`block px-3 py-2 rounded-lg text-sm transition ${
							pathname === item.href
								? "bg-purple text-white"
								: "text-muted hover:text-white hover:bg-bg-elevated"
						}`}
					>
						{item.label}
					</Link>
				))}
			</nav>
			<div className="px-6 py-4 border-t border-border text-xs text-muted">
				<a href="https://claracode.ai" className="hover:text-white transition">
					← Clara Code
				</a>
			</div>
		</aside>
	);
}
