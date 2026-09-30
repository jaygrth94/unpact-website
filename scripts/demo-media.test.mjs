import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { updateDemoMarkup, validateDemo } from './sync-demo-media.mjs';

// Unit fixtures exercise metadata/markup contracts only. Browser playback is
// checked separately with a real encoded test clip, never with these bytes.
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'unpact-demo-test-'));
  t.after(async () => {
    const target = resolve(dir);
    assert.ok(target.startsWith(resolve(tmpdir()) + sep));
    await rm(target, { recursive: true, force: true });
  });
  await Promise.all([
    writeFile(join(dir, 'test.mp4'), 'unit fixture, not a recording'),
    writeFile(join(dir, 'test.webp'), 'unit fixture, not a poster'),
    writeFile(join(dir, 'test.vtt'), 'WEBVTT\n\n00:00.000 --> 00:02.000\nA synthetic test action.\n'),
  ]);
  const demo = {
    video: 'test.mp4', poster: 'test.webp', captions: 'test.vtt',
    width: 360, height: 780, durationSeconds: 3,
    title: 'Test recording', posterAlt: 'Test still', description: 'Test description',
    steps: ['First action', 'Second action', 'Third action'],
    recording: {
      platform: 'Android', build: 'unit-test-only', recordedAt: '2026-09-27',
      releaseUrl: 'https://example.com/test-build', edits: 'Test fixture only',
    },
  };
  return { dir, demo };
}

const HTML = `Keep this unrelated local edit.
  <!-- demo:capture:media:start -->
  <!-- demo:capture:media:end -->
Keep this capture illustration.
  <!-- demo:plan:media:start -->
  <!-- demo:plan:media:end -->
Keep this planning explanation.`;

test('pending recordings leave content intact and create no media requests', async () => {
  const result = await updateDemoMarkup(HTML, { schemaVersion: 1, capture: null, plan: null }, '/unused');
  assert.equal(result, HTML);
  assert.doesNotMatch(result, /<video|<source|<track/);
});

test('one ready recording is integrated without removing the other fallback or local edits', async (t) => {
  const { dir, demo } = await fixture(t);
  const manifest = { schemaVersion: 1, capture: demo, plan: null };
  const result = await updateDemoMarkup(HTML, manifest, dir);
  assert.ok(result.startsWith('Keep this unrelated local edit.'));
  assert.ok(result.includes('Keep this capture illustration.'));
  assert.ok(result.endsWith('Keep this planning explanation.'));
  assert.equal((result.match(/<video /g) || []).length, 1);
  assert.match(result, /controls playsinline preload="none"/);
  assert.match(result, /kind="captions"[^>]* default/);
  assert.match(result, /data-demo-transcript/);
  assert.doesNotMatch(result, /autoplay|loop=/);
  assert.equal(await updateDemoMarkup(result, manifest, dir), result);
  assert.equal(await updateDemoMarkup(result, { ...manifest, capture: null }, dir), HTML);
});

test('missing video prevents integration rather than publishing a broken player', async (t) => {
  const { dir, demo } = await fixture(t);
  await assert.rejects(validateDemo('capture', { ...demo, video: 'missing.mp4' }, dir), /ENOENT/);
});

test('asset paths must stay local to the public demo directory', async (t) => {
  const { dir, demo } = await fixture(t);
  for (const video of ['../private.mp4', 'https://example.com/video.mp4', 'test.mp4?token=secret']) {
    await assert.rejects(validateDemo('capture', { ...demo, video }, dir), /local/);
  }
});

test('requires build provenance, real calendar dates, and portrait dimensions', async (t) => {
  const { dir, demo } = await fixture(t);
  for (const recording of [
    { ...demo.recording, platform: 'browser mock' },
    { ...demo.recording, build: '' },
    { ...demo.recording, recordedAt: '2026-02-30' },
  ]) {
    await assert.rejects(validateDemo('capture', { ...demo, recording }, dir));
  }
  await assert.rejects(validateDemo('capture', { ...demo, width: 1000, height: 500 }, dir), /portrait/);
});

test('caption cues must be nonempty, valid, and within the recording', async (t) => {
  const { dir, demo } = await fixture(t);
  for (const captions of [
    'WEBVTT\n',
    'WEBVTT\n\n00:00.000 --> 00:04.000\nToo long.\n',
    'WEBVTT\n\n00:00.000 --> 00:01.000\nValid.\n\n00:00.000 --> 00:99.000\nInvalid.\n',
    'WEBVTT\n\n00:02.000 --> 00:01.000\nReversed.\n',
  ]) {
    await writeFile(join(dir, 'test.vtt'), captions);
    await assert.rejects(validateDemo('capture', demo, dir), /caption/);
  }
});

test('source text is escaped in HTML, including titles, descriptions and steps', async (t) => {
  const { dir, demo } = await fixture(t);
  demo.title = '"><script>alert(1)</script>';
  demo.steps[0] = '<img src=x onerror=alert(1)>';
  const result = await updateDemoMarkup(HTML, { schemaVersion: 1, capture: demo, plan: null }, dir);
  assert.doesNotMatch(result, /<script>|<img src=x/);
  assert.match(result, /&lt;script&gt;/);
  assert.match(result, /&lt;img src=x/);
});

test('missing or duplicate slots are rejected instead of changing arbitrary page content', async () => {
  const manifest = { schemaVersion: 1, capture: null, plan: null };
  await assert.rejects(updateDemoMarkup('Unrelated page', manifest, '/unused'), /slot/);
  await assert.rejects(updateDemoMarkup(HTML + HTML, manifest, '/unused'), /slot/);
});

test('the checked-in homepage and manifest agree', async () => {
  const root = new URL('../', import.meta.url);
  const html = (await readFile(new URL('index.html', root), 'utf8')).replace(/\r\n/g, '\n');
  const manifest = JSON.parse(await readFile(new URL('assets/demo/manifest.json', root), 'utf8'));
  assert.equal(await updateDemoMarkup(html, manifest, new URL('assets/demo/', root)), html);
});
