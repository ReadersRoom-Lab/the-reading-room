import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { zipSync, strToU8 } from 'fflate'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const reqUrl = new URL(req.url)
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`

  // --- manifest.json ---
  const manifest = {
    manifest_version: 3,
    name: "Send to Reading Room",
    description: "Save web pages directly to your Reading Room.",
    version: "1.0",
    permissions: ["activeTab", "scripting"],
    host_permissions: [`${baseUrl}/*`],
    action: {
      default_popup: "popup.html",
      default_title: "Save to Reading Room"
    }
  }

  // --- popup.html ---
  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1 class="title">The Reading Room</h1>
    <p class="subtitle">Save this article to your library.</p>
    <div id="status-container" class="status hidden"></div>
    <button id="save-btn" class="btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Save to Library
    </button>
  </div>
  <script src="popup.js"></script>
</body>
</html>`

  // --- popup.css ---
  const popupCss = `:root {
  --bg: #FCFBF8;
  --fg: #1a1a1a;
  --border: #E5E5E5;
  --primary: #1A1A1A;
  --primary-fg: #F9F7F2;
  --muted: #52525B;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a1a;
    --fg: #F9F7F2;
    --border: #333333;
    --primary: #F9F7F2;
    --primary-fg: #1A1A1A;
    --muted: #A1A1AA;
  }
}
body { width: 320px; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: var(--bg); color: var(--fg); }
.container { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.title { margin: 0; font-size: 20px; font-weight: 700; font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
.subtitle { margin: 0; font-size: 13px; color: var(--muted); }
.btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px 16px; background-color: var(--primary); color: var(--primary-fg); border: none; border-radius: 0; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.btn:hover { opacity: 0.9; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.status { padding: 12px; border-radius: 4px; font-size: 13px; line-height: 1.4; }
.status.success { background-color: rgba(74,222,128,0.1); color: #16a34a; border: 1px solid rgba(74,222,128,0.2); }
.status.error { background-color: rgba(248,113,113,0.1); color: #dc2626; border: 1px solid rgba(248,113,113,0.2); }
.hidden { display: none; }`

  // --- popup.js (URL pre-baked, no options page needed) ---
  const popupJs = `document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status-container');
  const BACKEND_URL = '${baseUrl}';

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Saving...';
    statusEl.className = 'status hidden';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url || tab.url.startsWith('chrome://')) {
        throw new Error('Cannot save this type of page.');
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML
      });

      const html = results[0].result;

      const response = await fetch(BACKEND_URL + '/api/articles/extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: tab.url, html: html, roomId: null })
      });

      const data = await response.json().catch(() => ({ error: 'Invalid response from server' }));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article.');
      }

      statusEl.textContent = 'Successfully saved to The Reading Room!';
      statusEl.className = 'status success';
      saveBtn.innerHTML = 'Saved';
      setTimeout(() => window.close(), 2000);

    } catch (error) {
      console.error(error);
      let errorMsg = error.message || 'An unexpected error occurred.';
      if (errorMsg === 'Failed to fetch' || errorMsg.includes('NetworkError')) {
        errorMsg = 'Could not connect to The Reading Room. Make sure you are logged in.';
      }
      statusEl.textContent = errorMsg;
      statusEl.className = 'status error';
      saveBtn.disabled = false;
      saveBtn.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Try Again\`;
    }
  });
});`

  // Build zip entirely in memory — no filesystem access
  const zipped = zipSync({
    'reading-room-extension/manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
    'reading-room-extension/popup.html': strToU8(popupHtml),
    'reading-room-extension/popup.css': strToU8(popupCss),
    'reading-room-extension/popup.js': strToU8(popupJs),
  }, { level: 6 })

  return new NextResponse(zipped, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="reading-room-extension.zip"',
      'Cache-Control': 'no-store',
    },
  })
}
