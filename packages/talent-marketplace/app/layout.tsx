import type { Metadata } from "next";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Clara Talent Agency",
	description: "Voice-native capabilities for your Clara agents.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="font-sans antialiased">{children}</body>
		</html>
	);
}
