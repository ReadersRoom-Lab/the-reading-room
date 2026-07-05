document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status-container');

  // For local development, change this to http://localhost:3000
  // The Vercel build script overrides this with NEXT_PUBLIC_APP_URL automatically.
  const BACKEND_URL = 'https://the-reading-room-qwsz.vercel.app';

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Opening...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        throw new Error('Cannot save this type of page.');
      }

      // Open the Reading Room /save page — it handles auth and saving internally.
      // This avoids all SameSite cookie / CORS restrictions entirely.
      const saveUrl = BACKEND_URL + '/save?url=' + encodeURIComponent(tab.url);
      chrome.tabs.create({ url: saveUrl });

      statusEl.textContent = 'Opening The Reading Room\u2026';
      statusEl.className = 'status success';
      setTimeout(() => window.close(), 1200);

    } catch (err) {
      statusEl.textContent = err.message || 'An unexpected error occurred.';
      statusEl.className = 'status error';
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Try Again';
    }
  });
});
