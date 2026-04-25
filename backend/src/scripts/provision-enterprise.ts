/**
 * Manual Enterprise tier provision (invoiced outside self-serve Stripe checkout).
 * Usage: npm run provision:enterprise -- --user=<clerk user id> --seats=500
 */
import "reflect-metadata";
import "../load-env";
import { Subscription } from "@/models/Subscription";
import { syncClerkMetadata } from "@/services/clerk-sync.service";

function parseArg(name: string): string | null {
	const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
	if (!hit) return null;
	return hit.split("=", 2)[1] ?? null;
}

async function main(): Promise<void> {
	const user = parseArg("user");
	if (!user) {
		console.error("Usage: --user=<clerk_id> [--seats=N] [--builds-cap=unlimited] [--monthly=6000] [--eject-cap=N]");
		process.exit(1);
	}
	const seats = parseArg("seats") ? Number(parseArg("seats")) : null;
	const buildsCap = parseArg("builds-cap");
	const ejectCap = parseArg("eject-cap");
	const monthly = parseArg("monthly");

	const enterpriseContract: Record<string, unknown> = {};
	if (seats != null) enterpriseContract.seats = seats;
	if (buildsCap) enterpriseContract.builds_cap = buildsCap;
	if (ejectCap) enterpriseContract.eject_cap = ejectCap;
	if (monthly) enterpriseContract.monthly = monthly;

	const [row] = await Subscription.findOrCreate({
		where: { userId: user },
		defaults: {
			userId: user,
			tier: "enterprise",
			status: "active",
			stripeCustomerId: null,
			stripeSubscriptionId: null,
			enterpriseContract: Object.keys(enterpriseContract).length > 0 ? enterpriseContract : null,
		},
	});
	await row.update({
		tier: "enterprise",
		status: "active",
		stripeSubscriptionId: null,
		enterpriseContract: Object.keys(enterpriseContract).length > 0 ? enterpriseContract : row.enterpriseContract,
	});
	await syncClerkMetadata(user, "enterprise");
	console.log(`OK: user ${user} tier=enterprise`, enterpriseContract);
}

void main().catch((e) => {
	console.error(e);
	process.exit(1);
});
