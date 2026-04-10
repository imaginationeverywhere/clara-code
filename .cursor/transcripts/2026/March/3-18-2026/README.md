# Video transcripts — March 18, 2026

Plain-text transcripts for 19 YouTube videos. Captions were fetched with `yt-dlp` and converted from VTT to text.

## Index

| # | Label | Video ID | URL | Transcript file |
|---|-------|----------|-----|------------------|
| 1 | **Discuss** | uEit1oOJK0w | [Watch](https://youtu.be/uEit1oOJK0w) | `uEit1oOJK0w-Discuss.txt` |
| 2 | — | ZgfybHGxzJU | [Watch](https://youtu.be/ZgfybHGxzJU) | `ZgfybHGxzJU.txt` |
| 3 | **Must-have** | dzvwAnwDUZo | [Watch](https://youtu.be/dzvwAnwDUZo) | `dzvwAnwDUZo-Must-have.txt` |
| 4 | — | eA9Zf2-qYYM | [Watch](https://youtu.be/eA9Zf2-qYYM) | `eA9Zf2-qYYM.txt` |
| 5 | — | PQE5UKHGOMQ | [Watch](https://youtu.be/PQE5UKHGOMQ) | `PQE5UKHGOMQ.txt` |
| 6 | — | z_rXNjNnx7s | [Watch](https://youtu.be/z_rXNjNnx7s) | `z_rXNjNnx7s.txt` |
| 7 | — | EJyuu6zlQCg | [Watch](https://youtu.be/EJyuu6zlQCg) | `EJyuu6zlQCg.txt` |
| 8 | — | fBsHZcyUZG8 | [Watch](https://youtu.be/fBsHZcyUZG8) | `fBsHZcyUZG8.txt` |
| 9 | — | MVUXuaSoEKI | [Watch](https://youtu.be/MVUXuaSoEKI) | `MVUXuaSoEKI.txt` |
| 10 | — | zjcjT6BukQA | [Watch](https://youtu.be/zjcjT6BukQA) | `zjcjT6BukQA.txt` |
| 11 | — | 4Zaoo0YbYaw | [Watch](https://youtu.be/4Zaoo0YbYaw) | `4Zaoo0YbYaw.txt` |
| 12 | — | nJ-uRyqZFFg | [Watch](https://youtu.be/nJ-uRyqZFFg) | `nJ-uRyqZFFg.txt` |
| 13 | — | eorc3jLBqIA | [Watch](https://youtu.be/eorc3jLBqIA) | `eorc3jLBqIA.txt` |
| 14 | — | zY1_lc23Y80 | [Watch](https://youtu.be/zY1_lc23Y80) | `zY1_lc23Y80.txt` |
| 15 | — | pr9fsrK8nmQ | [Watch](https://youtu.be/pr9fsrK8nmQ) | `pr9fsrK8nmQ.txt` |
| 16 | — | gmbW_lXXIkc | [Watch](https://youtu.be/gmbW_lXXIkc) | `gmbW_lXXIkc.txt` |
| 17 | — | wQ0duoTeAAU | [Watch](https://youtu.be/wQ0duoTeAAU) | `wQ0duoTeAAU.txt` |
| 18 | **Definitely need** | vpyllOeLhs4 | [Watch](https://youtu.be/vpyllOeLhs4) | `vpyllOeLhs4-Definitely-need.txt` |
| 19 | — | oC3F2SFaF9w | [Watch](https://youtu.be/oC3F2SFaF9w) | `oC3F2SFaF9w.txt` |

## Files in this folder

- **`*.txt`** — Plain-text transcripts (with `# Transcript:` and `# URL:` header).
- **`*.en.vtt`** — Original VTT captions (English) from YouTube.
- **`local/`** — Transcripts from local videos (e.g. Whisper output).
- **`videos.txt`** — List of source URLs used for download.
- **`vtt-to-txt.js`** — Script that converts VTT → plain text (Node.js).

## Regenerating transcripts

```bash
cd .cursor/transcripts/3-18-2026
yt-dlp --write-subs --write-auto-subs --skip-download --sub-format "vtt" -o "%(id)s" -a videos.txt
node vtt-to-txt.js
```
