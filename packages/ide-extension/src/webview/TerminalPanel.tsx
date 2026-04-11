/**
 * IDE-integrated terminal panel mock (VRD Surface D companion, prompt 14-ide-terminal-panel).
 * Inline styles only — webview has no Tailwind.
 */
import type { CSSProperties, ReactElement, ReactNode } from "react";

const font: CSSProperties = {
	fontFamily: "var(--vscode-font-family, 'JetBrains Mono', ui-monospace, monospace)",
	fontSize: 12,
};

function IconPlus(): ReactElement {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
			<title>plus</title>
			<path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function IconTrash(): ReactElement {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
			<title>clear</title>
			<path
				d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function IconChevron(): ReactElement {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
			<title>minimize</title>
			<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function IconClose(): ReactElement {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
			<title>close</title>
			<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

function IconMic(): ReactElement {
	return (
		<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
			<title>mic</title>
			<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
		</svg>
	);
}

function IconLink(): ReactElement {
	return (
		<svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
			<title>link</title>
			<path
				d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

function IconKeyboard(): ReactElement {
	return (
		<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
			<title>keyboard</title>
			<path d="M4 6h16v12H4V6zm2 2v2h2V8H6zm3 0v2h2V8H9zm3 0v2h2V8h-2zm3 0v2h2V8h-2zm3 0v2h2V8h-2zM6 8v2h2V8H6zm0 3v2h12v-2H6zm0 3v2h8v-2H6z" />
		</svg>
	);
}

function PanelChrome({
	activeTab,
	children,
	voiceStrip,
}: {
	activeTab: "terminal" | "clara";
	children: ReactNode;
	voiceStrip: ReactNode | null;
}): ReactElement {
	const tabBase: CSSProperties = {
		display: "flex",
		height: 36,
		alignItems: "center",
		paddingLeft: 16,
		paddingRight: 16,
		fontSize: 12,
		borderBottomWidth: 2,
		borderBottomStyle: "solid",
		background: "none",
		cursor: "pointer",
		fontFamily: "inherit",
	};
	return (
		<div
			style={{
				...font,
				display: "flex",
				width: "100%",
				maxWidth: 896,
				flexDirection: "column",
				borderTop: "1px solid rgba(255,255,255,0.06)",
				background: "#09090F",
				color: "#e2e8f0",
				height: 280,
			}}
		>
			<div
				style={{
					display: "flex",
					height: 36,
					flexShrink: 0,
					alignItems: "center",
					borderBottom: "1px solid rgba(255,255,255,0.06)",
					background: "#0A0E14",
					paddingLeft: 12,
					paddingRight: 12,
				}}
			>
				<div style={{ display: "flex" }}>
					<button
						type="button"
						style={{
							...tabBase,
							borderBottomColor: activeTab === "terminal" ? "#7C3AED" : "transparent",
							color: activeTab === "terminal" ? "#fff" : "rgba(255,255,255,0.35)",
						}}
					>
						TERMINAL
					</button>
					<button
						type="button"
						style={{
							...tabBase,
							borderBottomColor: activeTab === "clara" ? "#7C3AED" : "transparent",
							color: activeTab === "clara" ? "#fff" : "rgba(255,255,255,0.35)",
							gap: 6,
						}}
					>
						CLARA
						{activeTab === "clara" ? (
							<span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.5)" }}>
								<span
									style={{
										width: 6,
										height: 6,
										borderRadius: "50%",
										background: "#7C3AED",
									}}
								/>
								voice
							</span>
						) : null}
					</button>
				</div>
				<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.25)" }}>
					<button type="button" style={{ padding: 4, background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
						<IconPlus />
					</button>
					<button type="button" style={{ padding: 4, background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
						<IconTrash />
					</button>
					<button type="button" style={{ padding: 4, background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
						<IconChevron />
					</button>
					<button type="button" style={{ padding: 4, background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
						<IconClose />
					</button>
				</div>
			</div>
			{voiceStrip}
			<div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 16px", lineHeight: 1.5 }}>{children}</div>
			<div
				style={{
					display: "flex",
					height: 24,
					flexShrink: 0,
					alignItems: "center",
					gap: 16,
					borderTop: "1px solid rgba(255,255,255,0.05)",
					background: "#070A0F",
					padding: "0 16px",
					fontSize: 10,
					color: "rgba(255,255,255,0.25)",
				}}
			>
				<span
					style={{
						borderRadius: 2,
						background: "rgba(124,58,237,0.1)",
						padding: "2px 6px",
						fontSize: 9,
						textTransform: "uppercase",
						letterSpacing: "0.05em",
						color: "#7C3AED",
					}}
				>
					CLARA
				</span>
				<span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
				<span>zsh — ~/projects/my-app</span>
				<span style={{ marginLeft: "auto" }}>⌃`</span>
				<span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
				<span style={{ cursor: "pointer" }}>Split</span>
			</div>
		</div>
	);
}

export function ClaraTerminalPanelMock(): ReactElement {
	const bars = [2, 4, 6, 8, 10, 12, 10, 8];
	return (
		<PanelChrome
			activeTab="clara"
			voiceStrip={
				<div
					style={{
						display: "flex",
						height: 28,
						flexShrink: 0,
						alignItems: "center",
						gap: 12,
						borderBottom: "1px solid rgba(255,255,255,0.05)",
						background: "#070A0F",
						padding: "0 16px",
					}}
				>
					<div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
						{bars.map((h, i) => (
							<div
								key={i}
								style={{
									width: 2,
									height: h,
									borderRadius: 2,
									background: "#7C3AED",
								}}
							/>
						))}
					</div>
					<span style={{ marginLeft: 8, fontSize: 11, color: "#7C3AED" }}>Listening</span>
					<div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
						Hold{" "}
						<kbd
							style={{
								marginLeft: 4,
								marginRight: 4,
								borderRadius: 4,
								border: "1px solid rgba(255,255,255,0.1)",
								background: "rgba(255,255,255,0.06)",
								padding: "2px 6px",
								color: "rgba(255,255,255,0.35)",
							}}
						>
							Ctrl+Space
						</kbd>{" "}
						to speak
					</div>
					<button
						type="button"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 4,
							fontSize: 11,
							color: "rgba(255,255,255,0.25)",
							background: "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						<IconKeyboard />
						Text mode →
					</button>
				</div>
			}
		>
			<div style={{ color: "rgba(255,255,255,0.3)" }}>
				<div style={{ display: "flex", gap: 8 }}>
					<span style={{ marginTop: 2, color: "rgba(124,58,237,0.4)" }}>
						<IconMic />
					</span>
					<div>
						<p style={{ fontStyle: "italic" }}>&apos;Add auth middleware to /api/orders&apos;</p>
						<p style={{ marginTop: 4, color: "rgba(255,255,255,0.25)" }}>
							<span style={{ color: "rgba(16,185,129,0.6)" }}>✓ </span>middleware/auth.ts updated
						</p>
					</div>
				</div>
				<div style={{ marginTop: 12 }}>
					<p>
						<span style={{ color: "rgba(255,255,255,0.2)" }}>$ </span>
						<span style={{ color: "rgba(255,255,255,0.4)" }}>npm run dev</span>
					</p>
					<p style={{ color: "rgba(255,255,255,0.2)" }}>▶ Local: http://localhost:3000</p>
				</div>
				<div style={{ marginTop: 12, marginBottom: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }} />
				<div style={{ display: "flex", gap: 8 }}>
					<span style={{ marginTop: 2, color: "#7C3AED" }}>
						<IconMic />
					</span>
					<div>
						<p style={{ color: "#10B981" }}>&apos;Create a loading skeleton for the dashboard&apos;</p>
						<p style={{ color: "rgba(255,255,255,0.5)" }}>
							<span style={{ color: "#7C3AED" }}>● </span>
							Analyzing src/components/dashboard/...
						</p>
						<p>
							<span style={{ color: "#10B981" }}>✓ </span>
							<span style={{ color: "rgba(255,255,255,0.7)" }}> DashboardSkeleton.tsx</span>
							<span style={{ color: "rgba(255,255,255,0.4)" }}> created</span>
						</p>
						<p style={{ fontSize: 11, color: "#7BCDD8" }}>→ src/components/dashboard/DashboardSkeleton.tsx</p>
						<div style={{ marginTop: 6, marginLeft: 4, display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11 }}>
							<button
								type="button"
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 4,
									color: "#7BCDD8",
									background: "none",
									border: "none",
									cursor: "pointer",
									textDecoration: "underline",
								}}
							>
								<IconLink />
								Open file
							</button>
							<span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
							<button type="button" style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}>
								View diff
							</button>
							<span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
							<button type="button" style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}>
								Undo
							</button>
						</div>
						<p style={{ marginTop: 4, color: "#7C3AED" }}>▌</p>
					</div>
				</div>
			</div>
		</PanelChrome>
	);
}

export function PlainTerminalPanelMock(): ReactElement {
	return (
		<PanelChrome activeTab="terminal" voiceStrip={null}>
			<div style={{ color: "rgba(255,255,255,0.4)" }}>
				<p>
					<span style={{ color: "rgba(255,255,255,0.3)" }}>amenray@macbook my-app % </span>
					<span style={{ color: "rgba(255,255,255,0.7)" }}>git status</span>
				</p>
				<p>On branch main</p>
				<p>Changes not staged:</p>
				<p style={{ color: "rgba(16,185,129,0.7)" }}> modified: src/components/dashboard/DashboardSkeleton.tsx</p>
				<p style={{ marginTop: 8 }}>
					<span style={{ color: "rgba(255,255,255,0.3)" }}>amenray@macbook my-app % </span>
					<span style={{ color: "#fff" }}>█</span>
				</p>
			</div>
		</PanelChrome>
	);
}
