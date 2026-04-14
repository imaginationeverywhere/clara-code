import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Clara Developer Portal",
	description: "Build Talents for the Clara Talent Agency",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-bg text-white flex min-h-screen`}>
				<Sidebar />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</body>
		</html>
	);
}
