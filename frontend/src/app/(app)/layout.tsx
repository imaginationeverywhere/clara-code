import { AppHeader } from "@/components/app/AppHeader";
import { QuarterlyAttestation } from "@/components/app/QuarterlyAttestation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<AppHeader />
			<QuarterlyAttestation />
			<div className="pt-14">{children}</div>
		</>
	);
}
