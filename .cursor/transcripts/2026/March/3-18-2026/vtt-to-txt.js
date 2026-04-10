#!/usr/bin/env node
/**
 * Converts YouTube VTT subtitle files to plain-text transcripts.
 * Strips timestamps and duplicate lines, outputs one transcript per video.
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const labels = {
  'uEit1oOJK0w': 'Discuss',
  'ZgfybHGxzJU': null,
  'dzvwAnwDUZo': 'Must-have',
  'eA9Zf2-qYYM': null,
  'PQE5UKHGOMQ': null,
  'z_rXNjNnx7s': null,
  'EJyuu6zlQCg': null,
  'fBsHZcyUZG8': null,
  'MVUXuaSoEKI': null,
  'zjcjT6BukQA': null,
  '4Zaoo0YbYaw': null,
  'nJ-uRyqZFFg': null,
  'eorc3jLBqIA': null,
  'zY1_lc23Y80': null,
  'pr9fsrK8nmQ': null,
  'gmbW_lXXIkc': null,
  'wQ0duoTeAAU': null,
  'vpyllOeLhs4': 'Definitely-need',
  'oC3F2SFaF9w': null,
};

function vttToPlainText(vttContent) {
  const lines = vttContent.split(/\r?\n/);
  const textLines = [];
  let i = 0;
  while (i < lines.length && (lines[i].startsWith('WEBVTT') || lines[i].startsWith('Kind:') || lines[i].startsWith('Language:') || lines[i].trim() === '')) i++;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/.test(line) || /^align:start/.test(line)) {
      i++;
      continue;
    }
    if (/^position:.*%$/.test(line) || line.trim() === '') {
      i++;
      continue;
    }
    let text = line.replace(/<[^>]+>/g, '').trim();
    if (text && !text.match(/^\d+%$/)) textLines.push(text);
    i++;
  }
  const deduped = [];
  for (const t of textLines) {
    if (deduped[deduped.length - 1] !== t) deduped.push(t);
  }
  return deduped.join(' ').replace(/\s+/g, ' ').trim();
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.vtt'));
for (const f of files) {
  const id = f.replace(/\.(en|[\w-]+)?\.vtt$/, '');
  const vttPath = path.join(DIR, f);
  const raw = fs.readFileSync(vttPath, 'utf8');
  const text = vttToPlainText(raw);
  const label = labels[id];
  const baseName = label ? `${id}-${label.replace(/\s+/g, '-')}` : id;
  const txtPath = path.join(DIR, `${baseName}.txt`);
  const header = `# Transcript: ${id}${label ? ` (${label})` : ''}\n# URL: https://youtu.be/${id}\n\n`;
  fs.writeFileSync(txtPath, header + text, 'utf8');
  console.log('Wrote', path.basename(txtPath));
}
