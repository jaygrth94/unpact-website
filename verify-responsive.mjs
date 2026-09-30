import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WEBSITE_ROOT = fileURLToPath(new URL('.', import.meta.url));

const VIEWPORTS = [
  [320, 568],
  [320, 800],
  [360, 800],
  [390, 844],
  [430, 900],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
];
const PAGES = ['index.html', 'privacy.html', 'terms.html', 'delete-account.html',
  'calendar-android.html'];

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const chromePath = chromeCandidates.find(existsSync);
if (!chromePath) {
  throw new Error('Chrome or Edge was not found. Set CHROME_PATH and try again.');
}

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function waitForDebugger(port) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const pages = await response.json();
      const page = pages.find((entry) => entry.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error('Chrome DevTools did not become ready.');
}

function createClient(url) {
  const socket = new WebSocket(url);
  let sequence = 0;
  const pending = new Map();
  const listeners = new Map();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request?.reject(new Error(message.error.message));
      else request?.resolve(message.result);
      return;
    }
    const handlers = listeners.get(message.method) || [];
    handlers.splice(0).forEach((handler) => handler(message.params));
  });

  const opened = new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener('open', resolveOpen, { once: true });
    socket.addEventListener('error', rejectOpen, { once: true });
  });

  return {
    opened,
    send(method, params = {}) {
      sequence += 1;
      const id = sequence;
      return new Promise((resolveRequest, rejectRequest) => {
        pending.set(id, { resolve: resolveRequest, reject: rejectRequest });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    once(method) {
      return new Promise((resolveEvent) => {
        const handlers = listeners.get(method) || [];
        handlers.push(resolveEvent);
        listeners.set(method, handlers);
      });
    },
    close() {
      socket.close();
    },
  };
}

const profileDir = await mkdtemp(join(tmpdir(), 'unpact-responsive-'));
const port = 10000 + Math.floor(Math.random() * 20000);
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  'about:blank',
], {
  stdio: 'ignore',
  windowsHide: true,
});

let client;
let failed = false;
try {
  const debuggerURL = await waitForDebugger(port);
  client = createClient(debuggerURL);
  await client.opened;
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  for (const page of PAGES) {
    const pagePath = resolve(WEBSITE_ROOT, page);
    if (!existsSync(pagePath)) throw new Error(`Missing page: ${pagePath}`);
    const pageURL = pathToFileURL(pagePath).href;
    for (const [width, height] of VIEWPORTS) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      const loaded = client.once('Page.loadEventFired');
      await client.send('Page.navigate', { url: pageURL });
      await loaded;

      const result = await client.send('Runtime.evaluate', {
        expression: `(async () => {
          await document.fonts.ready;
          const centerDelta = (selector) => {
            const node = document.querySelector(selector);
            if (!node) return null;
            const rect = node.getBoundingClientRect();
            if (!rect.width || !rect.height) return null;
            return Math.abs(((rect.left + rect.right) / 2) - (document.documentElement.clientWidth / 2));
          };
          return JSON.stringify({
            innerWidth,
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            heroCenterDelta: centerDelta('.hero-copy'),
            previewCenterDelta: centerDelta('[data-demo="capture"]'),
            planExamplePresent: centerDelta('[data-demo="plan"]') != null
          });
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });
      const metrics = JSON.parse(result.result.value);
      const overflow = Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) - metrics.clientWidth;
      const problems = [];
      if (overflow > 1) {
        problems.push(`horizontal overflow of ${overflow}px`);
      }
      if (
        page === 'index.html'
        && (
          metrics.heroCenterDelta == null
          || metrics.previewCenterDelta == null
          || !metrics.planExamplePresent
        )
      ) {
        problems.push('required hero, capture example, or mobile planning example is missing or hidden');
      } else if (
        page === 'index.html'
        && width <= 430
        && (metrics.heroCenterDelta > 2 || metrics.previewCenterDelta > 2)
      ) {
        problems.push('mobile hero is not centered');
      }
      if (problems.length) {
        failed = true;
        console.error(`${page} ${width}x${height}: ${problems.join('; ')}`, metrics);
      } else {
        console.log(`${page} ${width}x${height}: OK`);
      }
    }
  }
} finally {
  client?.close();
  const exited = once(chrome, 'exit').catch(() => {});
  chrome.kill();
  await Promise.race([exited, delay(2000)]);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(profileDir, { recursive: true, force: true });
      break;
    } catch (error) {
      if (attempt === 4) throw error;
      await delay(150);
    }
  }
}

if (failed) process.exitCode = 1;
