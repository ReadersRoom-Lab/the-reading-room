document.addEventListener('DOMContentLoaded', () => {
  const backendUrlInput = document.getElementById('backendUrl');
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');

  // Load saved URL or default to localhost
  chrome.storage.sync.get({
    backendUrl: 'http://localhost:3000'
  }, (items) => {
    backendUrlInput.value = items.backendUrl;
  });

  saveBtn.addEventListener('click', () => {
    let url = backendUrlInput.value.trim();
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    chrome.storage.sync.set({
      backendUrl: url
    }, () => {
      backendUrlInput.value = url;
      statusEl.style.display = 'block';
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 2000);
    });
  });
});
