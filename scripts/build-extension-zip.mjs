#!/usr/bin/env node
/**
 * Generates public/extension.zip at build time with the app's URL baked into popup.js.
 * Runs as a prebuild script on Vercel where VERCEL_URL or NEXT_PUBLIC_APP_URL is available.
 * Uses only Node.js built-ins — no npm packages.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Read the binary icon images
const icon16 = readFileSync(join(ROOT, 'chrome-extension', 'icon-16.png'))
const icon48 = readFileSync(join(ROOT, 'chrome-extension', 'icon-48.png'))
const icon128 = readFileSync(join(ROOT, 'chrome-extension', 'icon-128.png'))

// Resolve the app URL — NEXT_PUBLIC_APP_URL must be set in Vercel dashboard.
// VERCEL_URL is intentionally NOT used as a fallback because it returns the
// internal team URL (the-reading-room.qwsz.vercel.app) which is unreachable.
const PRODUCTION_URL = 'https://the-reading-room-qwsz.vercel.app'
let baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  : PRODUCTION_URL

const displayBaseUrl = baseUrl.replace(/^https?:\/\//, '')

console.log(`[build-extension] Baking URL into extension: ${baseUrl}`)

// --- Extension file contents ---

const manifestJson = JSON.stringify({
  manifest_version: 3,
  name: "Send to Reading Room",
  description: "Save web pages directly to your Reading Room.",
  version: "1.4",
  permissions: ["activeTab", "storage", "scripting"],
  icons: {
    "16": "icon-16.png",
    "48": "icon-48.png",
    "128": "icon-128.png"
  },
  action: {
    default_popup: "popup.html",
    default_title: "Save to Reading Room",
    default_icon: {
      "16": "icon-16.png",
      "48": "icon-48.png",
      "128": "icon-128.png"
    }
  },
  background: {
    service_worker: "background.js"
  },
  externally_connectable: {
    matches: [
      "http://localhost:3000/*",
      "https://*.vercel.app/*",
      baseUrl.endsWith('/') ? baseUrl + '*' : baseUrl + '/*'
    ]
  }
}, null, 2)

const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>The Reading Room</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1 class="title">The Reading Room</h1>
    <!-- Save View -->
    <div id="save-view" class="view-section">
      <p class="subtitle">Save this article to your library.</p>
      <div id="status-container" class="status hidden"></div>
      <button id="save-btn" class="btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Save to Library
      </button>
      <div id="connection-info" class="connection-info"></div>
    </div>

    <!-- Connect View -->
    <div id="connect-view" class="view-section hidden">
      <p class="subtitle">Connect this site to enable saving.</p>
      <div class="connect-box">
        <span id="connect-url" class="connect-url"></span>
      </div>
      <button id="connect-btn" class="btn btn-secondary">
        Connect Workspace
      </button>
    </div>

    <!-- No Connection View -->
    <div id="no-connection-view" class="view-section hidden">
      <p class="subtitle error-text">No connected workspace found.</p>
      <p class="info-text">
        To start saving, open your Reading Room dashboard (e.g. <code>localhost:3000</code> or your deployed website) and click this extension icon to connect.
      </p>
      <div class="help-link-container">
        <a id="help-link" href="#" class="help-link">View Setup Guide</a>
      </div>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`

const popupCss = `
:root { --bg:#FCFBF8;--fg:#1a1a1a;--border:#E5E5E5;--primary:#1A1A1A;--primary-fg:#F9F7F2;--muted:#52525B }
@media(prefers-color-scheme:dark){:root{--bg:#1a1a1a;--fg:#F9F7F2;--border:#333333;--primary:#F9F7F2;--primary-fg:#1A1A1A;--muted:#A1A1AA}}
body{width:320px;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--fg)}
.container{padding:24px;display:flex;flex-direction:column;gap:16px}
.title{margin:0;font-size:20px;font-weight:700;font-family:ui-serif,Georgia,serif}
.subtitle{margin:0;font-size:13px;color:var(--muted)}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:10px 16px;background:var(--primary);color:var(--primary-fg);border:none;border-radius:0;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .2s}
.btn:hover{opacity:.9}.btn:disabled{opacity:.5;cursor:not-allowed}
.status{padding:12px;border-radius:4px;font-size:13px;line-height:1.4}
.status.success{background:rgba(74,222,128,.1);color:#15803d;border:1px solid rgba(74,222,128,.2)}
.status.error{background:rgba(248,113,113,.1);color:#b91c1c;border:1px solid rgba(248,113,113,.2)}
.hidden{display:none!important}
.view-section {display: flex;flex-direction: column;gap: 16px;}
.connection-info {margin-top: 4px;font-size: 10px;text-align: center;color: var(--muted);text-transform: uppercase;letter-spacing: 0.05em;}
.connect-box {padding: 12px;border: 1px dashed var(--border);background-color: rgba(26, 26, 26, 0.02);text-align: center;margin: 4px 0;}
.connect-url {font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-size: 12px;font-weight: 600;color: var(--fg);}
.btn-secondary {background-color: transparent;color: var(--fg);border: 1px solid var(--fg);}
.btn-secondary:hover {background-color: rgba(26, 26, 26, 0.05);opacity: 1;}
.info-text {font-size: 12px;line-height: 1.5;color: var(--muted);margin: 0;}
.info-text code {font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;background-color: rgba(26, 26, 26, 0.05);padding: 2px 4px;font-size: 11px;}
.error-text {color: #dc2626 !important;font-weight: 600;}
.help-link-container {text-align: center;margin-top: 4px;}
.help-link {font-size: 11px;color: var(--muted);text-decoration: underline;cursor: pointer;font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;font-weight: 500;}
.help-link:hover {color: var(--fg);}
`

// No more direct API calls — opens a tab in the authenticated Reading Room instead.
// This bypasses all SameSite cookie restrictions and CORS issues entirely.
const popupJs = `document.addEventListener('DOMContentLoaded', async () => {
  const saveView = document.getElementById('save-view');
  const connectView = document.getElementById('connect-view');
  const noConnectionView = document.getElementById('no-connection-view');

  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status-container');
  const connectionInfoEl = document.getElementById('connection-info');

  const connectBtn = document.getElementById('connect-btn');
  const connectUrlEl = document.getElementById('connect-url');

  // Default fallback built into the script
  const DEFAULT_BACKEND_URL = '${baseUrl}';

  // Get active tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const currentUrl = tab.url || '';
  const currentTitle = tab.title || '';

  // Parse current page origin
  let currentOrigin = '';
  try {
    if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
      currentOrigin = new URL(currentUrl).origin;
    }
  } catch (e) {
    console.warn('Could not parse URL origin:', e);
  }

  // Detect if active tab is the Reading Room app
  const isAppUrl = currentOrigin && (
    currentUrl.includes('/home') ||
    currentUrl.includes('/library') ||
    currentUrl.includes('/rooms') ||
    currentUrl.includes('/vault') ||
    currentUrl.includes('/insights') ||
    currentUrl.includes('/save') ||
    currentUrl.includes('/profile') ||
    currentUrl.includes('/onboarding')
  );
  
  const isReadingRoomApp = currentOrigin && (
    isAppUrl || 
    currentTitle.includes('The Reading Rooms') || 
    currentOrigin.includes('localhost:3000') ||
    currentOrigin.includes('${displayBaseUrl}')
  );

  if (isReadingRoomApp) {
    // Show Connect view
    saveView.classList.add('hidden');
    noConnectionView.classList.add('hidden');
    connectView.classList.remove('hidden');

    connectUrlEl.textContent = currentOrigin.replace(/^https?:\\/\\//, '');

    connectBtn.addEventListener('click', async () => {
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting...';
      
      try {
        await chrome.storage.local.set({ backendUrl: currentOrigin });
        
        // Show success
        connectView.innerHTML = \`
          <div class="status success" style="margin-top: 8px;">
            Successfully connected to this workspace! You can now save articles here.
          </div>
        \`;
        setTimeout(() => window.close(), 1500);
      } catch (err) {
        connectBtn.disabled = false;
        connectBtn.textContent = 'Try Again';
        alert('Failed to connect: ' + err.message);
      }
    });
  } else {
    // Show Save view or No Connection view
    // Check if we have a saved backendUrl in chrome storage
    const data = await chrome.storage.local.get('backendUrl');
    let backendUrl = data.backendUrl;

    if (!backendUrl) {
      // Fallback to default backend URL
      backendUrl = DEFAULT_BACKEND_URL;
    }

    if (backendUrl) {
      saveView.classList.remove('hidden');
      connectView.classList.add('hidden');
      noConnectionView.classList.add('hidden');

      // Display the connected backend URL domain
      const displayDomain = backendUrl.replace(/^https?:\\/\\//, '');
      connectionInfoEl.textContent = \`Connected to: \${displayDomain}\`;

      saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = 'Opening...';

        try {
          if (!currentUrl || currentUrl.startsWith('chrome://') || currentUrl.startsWith('chrome-extension://')) {
            throw new Error('Cannot save this type of page.');
          }

          // Extract HTML using scripting API
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.documentElement.outerHTML
          });
          const html = results[0] ? results[0].result : '';

          // Store temporarily in chrome storage
          await chrome.storage.local.set({
            lastSavedArticle: {
              url: currentUrl,
              html: html
            }
          });

          // Open the Reading Room save page — it handles auth and saving internally.
          const saveUrl = \`\${backendUrl}/save?url=\${encodeURIComponent(currentUrl)}&extId=\${chrome.runtime.id}\`;
          await chrome.tabs.create({ url: saveUrl });

          statusEl.textContent = 'Opening The Reading Room\\\\u2026';
          statusEl.className = 'status success';
          statusEl.classList.remove('hidden');
          setTimeout(() => window.close(), 1200);

        } catch (err) {
          statusEl.textContent = err.message || 'An unexpected error occurred.';
          statusEl.className = 'status error';
          statusEl.classList.remove('hidden');
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Try Again';
        }
      });
    } else {
      // Show No Connection view
      saveView.classList.add('hidden');
      connectView.classList.add('hidden');
      noConnectionView.classList.remove('hidden');
    }
  }

  const helpLink = document.getElementById('help-link');
  if (helpLink) {
    helpLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = await chrome.storage.local.get('backendUrl');
      const targetUrl = \`\${data.backendUrl || DEFAULT_BACKEND_URL}/extension\`;
      await chrome.tabs.create({ url: targetUrl });
      window.close();
    });
  }
});`

// --- Pure Node.js ZIP builder (DEFLATE-STORE, no compression) ---

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
      t[i] = c
    }
    return t
  })()
  let crc = 0xFFFFFFFF
  for (const b of buf) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function writeUint16LE(buf, offset, val) { buf[offset] = val & 0xFF; buf[offset + 1] = (val >> 8) & 0xFF }
function writeUint32LE(buf, offset, val) {
  buf[offset] = val & 0xFF; buf[offset + 1] = (val >> 8) & 0xFF
  buf[offset + 2] = (val >> 16) & 0xFF; buf[offset + 3] = (val >> 24) & 0xFF
}

function buildZip(files) {
  const entries = []
  const localHeaders = []
  let offset = 0

  for (const [name, content] of files) {
    const nameBytes = Buffer.from(name, 'utf8')
    const dataBytes = Buffer.from(content)
    const crc = crc32(dataBytes)
    const size = dataBytes.length

    // Local file header (30 bytes + name)
    const local = Buffer.alloc(30 + nameBytes.length)
    writeUint32LE(local, 0, 0x04034B50)  // signature
    writeUint16LE(local, 4, 20)           // version needed
    writeUint16LE(local, 6, 0)            // flags
    writeUint16LE(local, 8, 0)            // compression: STORE
    writeUint16LE(local, 10, 0)           // mod time
    writeUint16LE(local, 12, 0)           // mod date
    writeUint32LE(local, 14, crc)         // crc32
    writeUint32LE(local, 18, size)        // compressed size
    writeUint32LE(local, 22, size)        // uncompressed size
    writeUint16LE(local, 26, nameBytes.length)
    writeUint16LE(local, 28, 0)           // extra field length
    nameBytes.copy(local, 30)

    entries.push({ nameBytes, crc, size, offset })
    localHeaders.push(local, dataBytes)
    offset += local.length + size
  }

  // Central directory
  const centralDir = []
  let cdSize = 0
  for (const { nameBytes, crc, size, offset: localOffset } of entries) {
    const cd = Buffer.alloc(46 + nameBytes.length)
    writeUint32LE(cd, 0, 0x02014B50)     // signature
    writeUint16LE(cd, 4, 20)              // version made by
    writeUint16LE(cd, 6, 20)              // version needed
    writeUint16LE(cd, 8, 0)               // flags
    writeUint16LE(cd, 10, 0)              // compression
    writeUint16LE(cd, 12, 0)              // mod time
    writeUint16LE(cd, 14, 0)              // mod date
    writeUint32LE(cd, 16, crc)
    writeUint32LE(cd, 20, size)           // compressed size
    writeUint32LE(cd, 24, size)           // uncompressed size
    writeUint16LE(cd, 28, nameBytes.length)
    writeUint16LE(cd, 30, 0)              // extra field length
    writeUint16LE(cd, 32, 0)              // comment length
    writeUint16LE(cd, 34, 0)              // disk number
    writeUint16LE(cd, 36, 0)              // internal attrs
    writeUint32LE(cd, 38, 0)              // external attrs
    writeUint32LE(cd, 42, localOffset)    // local header offset
    nameBytes.copy(cd, 46)
    centralDir.push(cd)
    cdSize += cd.length
  }

  // End of central directory record
  const eocd = Buffer.alloc(22)
  writeUint32LE(eocd, 0, 0x06054B50)
  writeUint16LE(eocd, 4, 0)
  writeUint16LE(eocd, 6, 0)
  writeUint16LE(eocd, 8, entries.length)
  writeUint16LE(eocd, 10, entries.length)
  writeUint32LE(eocd, 12, cdSize)
  writeUint32LE(eocd, 16, offset)
  writeUint16LE(eocd, 20, 0)

  return Buffer.concat([...localHeaders, ...centralDir, eocd])
}

// --- Build the zip ---
const backgroundJs = `chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === 'getHtml') {
    chrome.storage.local.get('lastSavedArticle', (result) => {
      const data = result.lastSavedArticle || {};
      if (data.url === message.url) {
        sendResponse({ html: data.html });
        chrome.storage.local.remove('lastSavedArticle');
      } else {
        sendResponse({ html: null });
      }
    });
    return true;
  }
});`

const files = [
  ['reading-room-extension/manifest.json', manifestJson],
  ['reading-room-extension/popup.html', popupHtml],
  ['reading-room-extension/popup.css', popupCss],
  ['reading-room-extension/popup.js', popupJs],
  ['reading-room-extension/background.js', backgroundJs],
  ['reading-room-extension/icon-16.png', icon16],
  ['reading-room-extension/icon-48.png', icon48],
  ['reading-room-extension/icon-128.png', icon128],
]

const zipBuffer = buildZip(files)

mkdirSync(join(ROOT, 'public'), { recursive: true })
writeFileSync(join(ROOT, 'public', 'extension.zip'), zipBuffer)

console.log(`[build-extension] Generated public/extension.zip (${zipBuffer.length} bytes) with URL: ${baseUrl}`)
