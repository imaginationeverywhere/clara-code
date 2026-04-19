"use client";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
			<div className="h-1 bg-bg-sunken" aria-hidden />
			<main className="flex flex-1 flex-col items-center justify-center px-4 py-8">{children}</main>
		</div>
	);
}
