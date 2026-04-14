import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardTabs } from "./DashboardTabs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const user = await currentUser();
	if (!user) redirect("/sign-in");

	const displayName =
		user.firstName ||
		user.username ||
		user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
		"there";

	return <DashboardTabs userId={user.id} displayName={displayName} />;
}
