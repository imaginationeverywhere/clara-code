// @ts-nocheck — Ink vs @types/react JSX
import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { postVoiceConverse } from "@imaginationeverywhere/clara-voice-client";
import { Box, Text, useApp, useInput } from "ink";
import { playCanonicalGreeting } from "./lib/canonical-greeting.js";
import { playAudioFile } from "./lib/play-audio-file.js";
import { startCapture, type AudioCapture } from "./lib/audio-capture.js";

function voiceBase(): string {
	return process.env.CLARA_VOICE_URL?.trim() ?? "";
}

function voiceKey(): string | undefined {
	const k = process.env.CLARA_VOICE_API_KEY?.trim();
	return k && k.length > 0 ? k : undefined;
}

export function VoiceConverseApp(): React.ReactElement {
	const { exit } = useApp();
	const [greet, setGreet] = useState<"loading" | "ready" | "failed">("loading");
	const [greetErr, setGreetErr] = useState("");
	const [status, setStatus] = useState("Loading greeting…");
	const [line, setLine] = useState("");
	const sessionIdRef = useRef(randomBytes(12).toString("hex"));
	const capRef = useRef<AudioCapture | null>(null);
	const [listening, setListening] = useState(false);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		(async () => {
			const r = await playCanonicalGreeting();
			if (!r.ok) {
				setGreet("failed");
				setGreetErr(r.message);
				setStatus("Greeting failed. Fix env and re-run, or use `clara tui`.");
				return;
			}
			setGreet("ready");
			setStatus("Space: talk (twice) · send second Space · Esc: exit");
		})().catch(() => {});
	}, []);

	const runTurn = useCallback(async (wav: Buffer) => {
		const base = voiceBase();
		if (!base) {
			setGreet("failed");
			setGreetErr("CLARA_VOICE_URL is not set");
			return;
		}
		setBusy(true);
		setStatus("Sending to /voice/converse…");
		const b64 = wav.length > 0 ? wav.toString("base64") : undefined;
		const res = await postVoiceConverse(
			base,
			{
				session_id: sessionIdRef.current,
				audio_base64: b64,
				mime_type: "audio/wav",
			},
			{ apiKey: voiceKey() },
		);
		setBusy(false);
		if (!res.ok) {
			const msg = res.offline ? `offline: ${res.error}` : res.error;
			setStatus(`Converse: ${msg}`);
			setLine("");
			return;
		}
		if (typeof res.reply_text === "string" && res.reply_text.length > 0) {
			setLine(res.reply_text);
		} else {
			setLine("");
		}
		if (typeof res.reply_audio_base64 === "string" && res.reply_audio_base64.length > 0) {
			setStatus("Playing response…");
			const buf = Buffer.from(res.reply_audio_base64, "base64");
			const outPath = join(tmpdir(), `clara-reply-${randomBytes(8).toString("hex")}.bin`);
			await writeFile(outPath, buf);
			try {
				await playAudioFile(outPath);
			} finally {
				await unlink(outPath).catch(() => {});
			}
		}
		setStatus("Space: talk (twice) · send second Space · Esc: exit");
	}, []);

	useInput(
		(_input, key) => {
			if (key.escape) {
				exit();
				return;
			}
			if (greet === "loading" || busy) {
				return;
			}
			if (greet === "failed" || !key.space) {
				return;
			}
			if (!listening) {
				if (!voiceBase()) {
					return;
				}
				capRef.current = startCapture();
				setListening(true);
				setStatus("Listening… (Space to send to /voice/converse)");
				return;
			}
			setListening(false);
			const c = capRef.current;
			capRef.current = null;
			(async () => {
				if (!c) {
					return;
				}
				const buf = await c.stop();
				await runTurn(buf);
			})().catch(() => {});
		},
		{ isActive: true },
	);

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
			<Text color="magenta" bold>
				Clara — voice
			</Text>
			<Text color="gray">
				{status}
			</Text>
			{greet === "failed" && greetErr.length > 0 ? <Text color="red">{`  ${greetErr}`}</Text> : null}
			{line.length > 0 ? <Text>Clara: {line}</Text> : null}
		</Box>
	);
}
