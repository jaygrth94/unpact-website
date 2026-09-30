import { readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WEBSITE_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DEMO_IDS = ['capture', 'plan'];
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`);
}

function cueSeconds(value) {
  const parts = value.split(':').map(Number);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

export async function validateDemo(id, demo, assetRoot) {
  if (!demo || typeof demo !== 'object') throw new Error(`${id}: expected recording metadata.`);
  for (const key of ['title', 'posterAlt', 'description']) requireText(demo[key], `${id}.${key}`);
  const recording = demo.recording || {};
  if (!['iOS', 'Android'].includes(recording.platform)) {
    throw new Error(`${id}: identify the actual iOS or Android recording.`);
  }
  for (const key of ['build', 'recordedAt', 'releaseUrl', 'edits']) {
    requireText(recording[key], `${id}.recording.${key}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recording.recordedAt)
      || !Number.isFinite(Date.parse(recording.recordedAt))
      || new Date(recording.recordedAt).toISOString().slice(0, 10) !== recording.recordedAt) {
    throw new Error(`${id}: recordedAt must be an ISO date.`);
  }
  if (new URL(recording.releaseUrl).protocol !== 'https:') throw new Error(`${id}: use an HTTPS release URL.`);
  if (![demo.width, demo.height].every((value) => Number.isInteger(value) && value > 0)
      || demo.width >= demo.height) {
    throw new Error(`${id}: provide the portrait recording's actual width and height.`);
  }
  if (!Number.isFinite(demo.durationSeconds) || demo.durationSeconds <= 0 || demo.durationSeconds > 120) {
    throw new Error(`${id}: provide a duration between 0 and 120 seconds.`);
  }
  if (!Array.isArray(demo.steps) || demo.steps.length < 3) throw new Error(`${id}: describe the recorded steps.`);
  demo.steps.forEach((step, index) => requireText(step, `${id}.steps[${index}]`));

  const root = await realpath(assetRoot);
  const types = [
    ['video', ['.mp4'], 15 * 1024 * 1024],
    ['poster', ['.webp', '.jpg', '.png'], 400 * 1024],
    ['captions', ['.vtt'], 32 * 1024],
  ];
  for (const [key, extensions, maxBytes] of types) {
    const filename = demo[key];
    if (typeof filename !== 'string' || !/^[a-z0-9][a-z0-9._-]+$/.test(filename)
        || !extensions.includes(extname(filename))) {
      throw new Error(`${id}.${key}: use a local ${extensions.join('/')} filename in assets/demo.`);
    }
    const path = await realpath(join(root, filename));
    if (!path.startsWith(root + sep)) throw new Error(`${id}.${key}: asset leaves the demo directory.`);
    const info = await stat(path);
    if (!info.isFile() || info.size === 0 || info.size > maxBytes) {
      throw new Error(`${id}.${key}: empty, non-file, or exceeds ${maxBytes} bytes.`);
    }
  }
  const captions = await readFile(join(root, demo.captions), 'utf8');
  if (!/^WEBVTT(?:\r?\n|\s)/.test(captions)) throw new Error(`${id}: captions must be WebVTT.`);
  const timestamp = '(?:\\d{2}:)?[0-5]\\d:[0-5]\\d\\.\\d{3}';
  const cues = [...captions.matchAll(new RegExp(`^(${timestamp}) --> (${timestamp})[^\\r\\n]*\\r?\\n([^\\r\\n]+)`, 'gm'))];
  if (!cues.length) throw new Error(`${id}: captions need timed, nonempty cues.`);
  if (captions.split(/\r?\n/).filter((line) => line.includes('-->')).length !== cues.length) {
    throw new Error(`${id}: malformed or empty caption cue.`);
  }
  let previousStart = -1;
  for (const [, start, end] of cues) {
    const from = cueSeconds(start);
    const to = cueSeconds(end);
    if (from < previousStart || to <= from || to > demo.durationSeconds + 0.1) {
      throw new Error(`${id}: caption timing must match the edited recording.`);
    }
    previousStart = from;
  }
}

export function renderDemo(id, demo) {
  if (demo == null) return '';
  const asset = (filename) => `assets/demo/${escape(filename)}`;
  return `<div class="demo-recording">
  <video class="demo-video" controls playsinline preload="none" width="${demo.width}" height="${demo.height}" poster="${asset(demo.poster)}" aria-label="${escape(demo.title)}" aria-describedby="${id}-video-description">
    <source src="${asset(demo.video)}" type="video/mp4" />
    <track kind="captions" src="${asset(demo.captions)}" srclang="en" label="English" default />
    <p><a href="${asset(demo.video)}">Download the video</a>, or read the steps below.</p>
  </video>
  <img class="demo-still" data-demo-still hidden loading="lazy" src="${asset(demo.poster)}" width="${demo.width}" height="${demo.height}" alt="${escape(demo.posterAlt)}" />
  <p class="demo-media-error" data-demo-error role="status" hidden>The video couldn&rsquo;t load. You can follow the steps below.</p>
  <p class="demo-caption">${escape(demo.recording.platform)} app &middot; ${escape(demo.title)}</p>
  <p class="demo-description" id="${id}-video-description">${escape(demo.description)}</p>
  <details class="demo-transcript" data-demo-transcript>
    <summary>Read the steps</summary>
    <ol>${demo.steps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol>
  </details>
</div>`;
}

export async function updateDemoMarkup(html, manifest, assetRoot) {
  if (manifest?.schemaVersion !== 1) throw new Error('Unsupported demo manifest version.');
  let updated = html;
  for (const id of DEMO_IDS) {
    if (!(id in manifest)) throw new Error(`Missing ${id} entry; use null until its recording is available.`);
    const demo = manifest[id];
    if (demo != null) await validateDemo(id, demo, assetRoot);
    const expression = new RegExp(`(^[ \\t]*)<!-- demo:${id}:media:start -->[\\s\\S]*?<!-- demo:${id}:media:end -->`, 'gm');
    if ([...updated.matchAll(expression)].length !== 1) throw new Error(`Expected one ${id} media slot.`);
    updated = updated.replace(expression, (_, indent) => {
      const content = renderDemo(id, demo);
      return `${indent}<!-- demo:${id}:media:start -->\n`
        + (content ? content.split('\n').map((line) => indent + line).join('\n') + '\n' : '')
        + `${indent}<!-- demo:${id}:media:end -->`;
    });
  }
  return updated;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--check')) throw new Error('Usage: node website/scripts/sync-demo-media.mjs [--check]');
  const assetRoot = join(WEBSITE_ROOT, 'assets', 'demo');
  const htmlPath = join(WEBSITE_ROOT, 'index.html');
  const original = await readFile(htmlPath, 'utf8');
  const manifest = JSON.parse(await readFile(join(assetRoot, 'manifest.json'), 'utf8'));
  const updated = await updateDemoMarkup(original.replace(/\r\n/g, '\n'), manifest, assetRoot);
  if (args.includes('--check')) {
    if (updated !== original.replace(/\r\n/g, '\n')) throw new Error('Demo markup is stale. Run sync-demo-media.mjs.');
  } else if (updated !== original.replace(/\r\n/g, '\n')) {
    if (await readFile(htmlPath, 'utf8') !== original) throw new Error('The homepage changed during validation; rerun.');
    await writeFile(htmlPath, updated);
  }
  const ready = DEMO_IDS.filter((id) => manifest[id] != null);
  console.log(`Demo markup verified. Recordings integrated: ${ready.join(', ') || 'none; text examples active'}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
