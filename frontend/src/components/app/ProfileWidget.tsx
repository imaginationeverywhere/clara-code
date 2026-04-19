"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TIER_BADGE: Record<string, string> = {
	pro: "bg-clara text-white",
	business: "bg-brand-purple text-white",
	free: "bg-sculpt-700 text-text-muted",
};

function tierLabel(user: NonNullable<ReturnType<typeof useUser>["user"]>): string {
	const raw = user.publicMetadata?.tier;
	if (raw === "pro" || raw === "business" || raw === "free") {
		return raw;
	}
	const plan = user.publicMetadata?.plan;
	if (plan === "PRO") return "pro";
	if (plan === "BUSINESS") return "business";
	if (plan === "FREE") return "free";
	return "free";
}

export function ProfileWidget() {
	const { user } = useUser();
	const { signOut } = useClerk();
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function handleOutside(e: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, [open]);

	if (!user) return null;

	const tier = tierLabel(user);
	const displayName = user.firstName
		? `${user.firstName} ${user.lastName ?? ""}`.trim()
		: user.username ?? user.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "User";

	return (
		<div className="relative" ref={rootRef}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-sculpt-800"
				aria-label="Profile menu"
				aria-expanded={open}
				aria-haspopup="true"
			>
				<Image src={user.imageUrl} alt={displayName} width={32} height={32} className="rounded-full" />
				<span className="hidden text-sm text-text-body sm:block">{displayName}</span>
				<span
					className={`hidden rounded px-1.5 py-0.5 text-xs font-medium capitalize sm:block ${TIER_BADGE[tier] ?? TIER_BADGE.free}`}
				>
					{tier}
				</span>
			</button>

			{open ? (
				<div
					className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-border bg-sculpt-900 py-1 shadow-lg"
					role="menu"
				>
					<Link
						href="/account"
						className="block px-4 py-2 text-sm text-text-body hover:bg-sculpt-800"
						role="menuitem"
						onClick={() => setOpen(false)}
					>
						Account settings
					</Link>
					<Link
						href="/dashboard"
						className="block px-4 py-2 text-sm text-text-body hover:bg-sculpt-800"
						role="menuitem"
						onClick={() => setOpen(false)}
					>
						Dashboard
					</Link>
					<hr className="my-1 border-border" />
					<button
						type="button"
						className="w-full px-4 py-2 text-left text-sm text-text-muted hover:bg-sculpt-800"
						role="menuitem"
						onClick={() => {
							void signOut();
							setOpen(false);
						}}
					>
						Sign out
					</button>
				</div>
			) : null}
		</div>
	);
}
