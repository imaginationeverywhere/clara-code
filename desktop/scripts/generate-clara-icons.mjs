/**
 * Generates placeholder Clara Code brand icons (32x32 tray + 1024x1024 app source).
 * Replace app-icon-source.png with the official claracode.ai logo when available.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "src-tauri", "icons");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function pngRgb(width, height, pixel) {
  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0);
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      raw.push(r, g, b);
    }
  }
  const rawBuf = Buffer.from(raw);
  const idat = deflateSync(rawBuf, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(iconsDir, { recursive: true });

const purple = [0x2d, 0x1b, 0x4e];
const accent = [0x8b, 0x5c, 0xf6];

function appIconPixel(x, y) {
  const cx = 512;
  const cy = 512;
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 380 && r > 280) return accent;
  if (r <= 380) return purple;
  return [0x12, 0x0a, 0x24];
}

const tray32 = pngRgb(32, 32, (x, y) => {
  const cx = 16;
  const cy = 16;
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 14 && r > 8) return accent;
  if (r <= 14) return purple;
  return [0x12, 0x0a, 0x24];
});

const app1024 = pngRgb(1024, 1024, appIconPixel);

writeFileSync(join(iconsDir, "tray-icon.png"), tray32);
writeFileSync(join(iconsDir, "app-icon-source.png"), app1024);

const hash = createHash("sha256").update(tray32).digest("hex").slice(0, 12);
console.log(`Wrote tray-icon.png (32x32) and app-icon-source.png (1024x1024). tray hash: ${hash}`);
