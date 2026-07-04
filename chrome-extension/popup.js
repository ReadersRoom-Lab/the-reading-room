document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status-container');

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Saving...';
    statusEl.className = 'status hidden';

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url || tab.url.startsWith('chrome://')) {
        throw new Error('Cannot save this type of page.');
      }

      // Execute script in the active tab to get the HTML
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML
      });

      const html = results[0].result;

      const items = await new Promise(resolve => {
        chrome.storage.sync.get({ backendUrl: 'http://localhost:3000' }, resolve);
      });
      const backendUrl = items.backendUrl;

      // Send to API
      const response = await fetch(`${backendUrl}/api/articles/extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          url: tab.url,
          html: html,
          roomId: null // MVP: save to Main Library
        })
      });

      const data = await response.json().catch(() => ({ error: 'Invalid response from server' }));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article.');
      }

      statusEl.textContent = 'Successfully saved to The Reading Room!';
      statusEl.className = 'status success';
      saveBtn.innerHTML = 'Saved';
      
      // Close popup after 2 seconds
      setTimeout(() => window.close(), 2000);

    } catch (error) {
      console.error(error);
      let errorMsg = error.message || 'An unexpected error occurred.';
      if (errorMsg === 'Failed to fetch' || errorMsg.includes('NetworkError')) {
        errorMsg = 'Could not connect. Did you set your App URL in the extension options?';
      }
      statusEl.textContent = errorMsg;
      statusEl.className = 'status error';
      saveBtn.disabled = false;
      saveBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Try Again
      `;
    }
  });
});
