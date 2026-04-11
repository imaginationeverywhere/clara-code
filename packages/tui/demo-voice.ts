#!/usr/bin/env node
/**
 * Demo: Clara TUI Voice Bar
 * Run: npx tsx packages/tui/demo-voice.ts
 */
import { VoiceBar } from "./src/components/voice-bar.js";

const bar = new VoiceBar();

process.stdout.write("\x1b[2J\x1b[H");

console.log("Clara Code — Voice TUI Demo\n");
console.log("Press Ctrl+C to exit\n");

console.log("State: idle");
console.log(bar.render(60).join("\n"));
console.log();

setTimeout(() => {
	console.log("State: listening (simulated)");
	bar.setState("listening");
	let frames = 0;
	const timer = setInterval(() => {
		bar.tick();
		process.stdout.write("\x1b[1A\x1b[2K");
		console.log(bar.render(60).join("\n"));
		frames += 1;
		if (frames > 30) {
			clearInterval(timer);
			bar.setState("processing");
			console.log("\nState: processing (sending to Clara...)");
			setTimeout(() => {
				bar.setState("idle");
				console.log("\nState: idle (response complete)");
				console.log(bar.render(60).join("\n"));
				process.exit(0);
			}, 2000);
		}
	}, 100);
}, 1000);
