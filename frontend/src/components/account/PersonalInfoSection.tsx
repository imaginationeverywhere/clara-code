"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

export function PersonalInfoSection() {
	const { user, isLoaded } = useUser();
	const [first, setFirst] = useState("");
	const [last, setLast] = useState("");
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;
		setFirst(user.firstName ?? "");
		setLast(user.lastName ?? "");
	}, [user]);

	const email = user?.primaryEmailAddress?.emailAddress ?? "";

	const onSave = useCallback(async () => {
		if (!user) return;
		setSaving(true);
		setMsg(null);
		try {
			await user.update({ firstName: first.trim() || undefined, lastName: last.trim() || undefined });
			setMsg("Saved.");
		} catch {
			setMsg("Could not update profile.");
		} finally {
			setSaving(false);
		}
	}, [first, last, user]);

	if (!isLoaded) {
		return <p className="text-sm text-white/45">Loading…</p>;
	}

	return (
		<section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
			<h2 className="text-lg font-semibold text-white">Personal info</h2>
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label htmlFor="acct-first" className="text-xs text-white/45">
						First name
					</label>
					<input
						id="acct-first"
						value={first}
						onChange={(e) => setFirst(e.target.value)}
						className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-clara/30 focus:ring-2"
					/>
				</div>
				<div>
					<label htmlFor="acct-last" className="text-xs text-white/45">
						Last name
					</label>
					<input
						id="acct-last"
						value={last}
						onChange={(e) => setLast(e.target.value)}
						className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-clara/30 focus:ring-2"
					/>
				</div>
			</div>
			<div>
				<label className="text-xs text-white/45">Email</label>
				<p className="mt-1 text-sm text-white/70">{email || "—"}</p>
				<p className="mt-1 text-xs text-white/35">Email changes use Clerk account settings.</p>
			</div>
			<button
				type="button"
				onClick={() => void onSave()}
				disabled={saving}
				className="rounded-lg bg-clara px-4 py-2 text-sm font-medium text-white hover:bg-clara/90 disabled:opacity-50"
			>
				{saving ? "Saving…" : "Save name"}
			</button>
			{msg && <p className="text-sm text-white/55">{msg}</p>}
		</section>
	);
}
