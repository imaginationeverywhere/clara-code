import { AppHeader } from "@/components/app/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<AppHeader />
			<div className="pt-14">{children}</div>
		</>
	);
}
