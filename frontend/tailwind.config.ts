import type { Config } from "tailwindcss";

// Clara Code — tokens from `mockups/app/src/index.css` (:root)
const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "Fira Code", "monospace"],
			},
			colors: {
				clara: {
					DEFAULT: "#7BCDD8",
					teal: "#7BCDD8",
					"teal-glow": "#A8DDE5",
					"teal-accent": "#4DDDFF",
					500: "#3B82F6",
				},
				brand: {
					purple: "#7C3AED",
					"purple-hover": "#6D28D9",
					blue: "#4F8EF7",
					green: "#10B981",
				},
				bg: {
					base: "#0D1117",
					raised: "#0F1318",
					overlay: "#0A0E14",
					sunken: "#070A0F",
					terminal: "#09090F",
				},
				chrome: {
					titlebar: "#13141A",
					dock: "#050509",
				},
				mac: {
					red: "#FF5F57",
					yellow: "#FEBC2E",
					green: "#28C840",
				},
				sculpt: {
					900: "#150E08",
					800: "#1E1410",
					700: "#2B1810",
					600: "#3D2518",
					500: "#52341F",
				},
				text: {
					primary: "#FFFFFF",
					body: "#D9D9D9",
					secondary: "#B3B3B3",
					muted: "#8C8C8C",
					caption: "#737373",
					label: "#4D4D4D",
					ghost: "#333333",
				},
				border: {
					DEFAULT: "#141414",
					hover: "#1F1F1F",
					focus: "#333333",
					strong: "#4D4D4D",
				},
				syntax: {
					keyword: "#7C3AED",
					type: "#4F8EF7",
					string: "#10B981",
					function: "#A8DDE5",
					jsx: "#7BCDD8",
					attribute: "#FBBF24",
					number: "#FB923C",
					comment: "#4D4D4D",
					operator: "#8C8C8C",
				},
			},
			width: {
				sidebar: "13rem",
				"ai-panel": "18rem",
			},
			height: {
				topbar: "2.75rem",
				voicebar: "5rem",
				tabbar: "2.25rem",
			},
			boxShadow: {
				cta: "0 0 30px rgba(124,58,237,0.35)",
				card: "0 40px 80px rgba(0,0,0,0.50)",
				mic: "0 0 24px rgba(124,58,237,0.60)",
				purple: "0 0 32px rgba(124,58,237,0.40)",
			},
			keyframes: {
				waveform: {
					"0%, 100%": { height: "4px" },
					"20%": { height: "20px" },
					"40%": { height: "8px" },
					"60%": { height: "24px" },
					"80%": { height: "12px" },
				},
				fadeIn: {
					from: { opacity: "0", transform: "translateY(4px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
			},
			animation: {
				waveform: "waveform 1.2s infinite ease-in-out",
				fadeIn: "fadeIn 0.2s ease-out",
			},
		},
	},
	plugins: [],
};

export default config;
