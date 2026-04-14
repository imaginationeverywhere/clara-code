import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				bg: "#09090F",
				"bg-surface": "#111118",
				"bg-elevated": "#1A1A24",
				purple: "#7C3AED",
				"purple-light": "#9F67FF",
				teal: "#7BCDD8",
				"teal-light": "#A8E6EE",
				green: "#10B981",
				muted: "#6B7280",
				border: "#2A2A3A",
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "monospace"],
			},
		},
	},
	plugins: [],
};
export default config;
