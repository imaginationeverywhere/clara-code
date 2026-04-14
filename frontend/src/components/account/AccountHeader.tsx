export function AccountHeader({
	imageUrl,
	firstName,
	lastName,
	email,
	planLabel,
}: {
	imageUrl: string | null;
	firstName: string | null;
	lastName: string | null;
	email: string;
	planLabel: string;
}) {
	const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0] || "Account";

	return (
		<div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center">
			<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/10">
				{imageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element -- Clerk avatar URLs use dynamic hosts
					<img src={imageUrl} alt="" width={80} height={80} className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white/70">
						{name.slice(0, 1).toUpperCase()}
					</div>
				)}
			</div>
			<div className="min-w-0 flex-1">
				<h1 className="text-2xl font-semibold text-white">{name}</h1>
				<p className="mt-1 truncate text-sm text-white/55">{email}</p>
				<span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/85">
					{planLabel}
				</span>
			</div>
		</div>
	);
}
