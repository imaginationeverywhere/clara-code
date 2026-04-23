/**
 * Contract tests: /session-start command doc must keep stable session-prep behavior.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionStartPath = path.join(__dirname, '..', 'session-start.md');

test('session-start.md documents auset-brain vault and usage', () => {
	const md = fs.readFileSync(sessionStartPath, 'utf8');
	assert.match(md, /\/session-start/);
	assert.match(md, /auset-brain\//i);
	assert.match(md, /MOC\.md/);
	assert.match(md, /memory\/MEMORY\.md/);
	assert.match(md, /session-checkpoint/);
});

test('session-start.md states what the command does not do', () => {
	const md = fs.readFileSync(sessionStartPath, 'utf8');
	assert.match(md, /What This Command Does NOT Do/i);
	assert.match(md, /Does NOT (run|start|create|write)/i);
});
