chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === 'getHtml') {
    chrome.storage.local.get('lastSavedArticle', (result) => {
      const data = result.lastSavedArticle || {};
      if (data.url === message.url) {
        sendResponse({ html: data.html });
        // Clean up storage
        chrome.storage.local.remove('lastSavedArticle');
      } else {
        sendResponse({ html: null });
      }
    });
    return true; // Keep channel open for async response
  }
});
