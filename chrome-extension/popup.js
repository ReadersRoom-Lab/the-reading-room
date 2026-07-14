document.addEventListener("DOMContentLoaded", async () => {
  const saveView = document.getElementById("save-view");
  const connectView = document.getElementById("connect-view");
  const noConnectionView = document.getElementById("no-connection-view");

  const saveBtn = document.getElementById("save-btn");
  const statusEl = document.getElementById("status-container");
  const connectionInfoEl = document.getElementById("connection-info");

  const connectBtn = document.getElementById("connect-btn");
  const connectUrlEl = document.getElementById("connect-url");

  // Default fallback built into the script
  const DEFAULT_BACKEND_URL = "https://the-reading-room-qwsz.vercel.app";

  // Get active tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const currentUrl = tab.url || "";
  const currentTitle = tab.title || "";

  // Parse current page origin
  let currentOrigin = "";
  try {
    if (currentUrl.startsWith("http://") || currentUrl.startsWith("https://")) {
      currentOrigin = new URL(currentUrl).origin;
    }
  } catch (e) {
    console.warn("Could not parse URL origin:", e);
  }

  // Detect if active tab is the ReadrSpace app
  const isAppUrl =
    currentOrigin &&
    (currentUrl.includes("/home") ||
      currentUrl.includes("/library") ||
      currentUrl.includes("/rooms") ||
      currentUrl.includes("/vault") ||
      currentUrl.includes("/insights") ||
      currentUrl.includes("/save") ||
      currentUrl.includes("/profile") ||
      currentUrl.includes("/onboarding"));

  const isReadingRoomApp =
    currentOrigin &&
    (isAppUrl ||
      currentTitle.includes("ReadrSpace") ||
      currentOrigin.includes("localhost:3000") ||
      currentOrigin.includes("the-reading-room-qwsz.vercel.app"));

  if (isReadingRoomApp) {
    // Show Connect view
    saveView.classList.add("hidden");
    noConnectionView.classList.add("hidden");
    connectView.classList.remove("hidden");

    connectUrlEl.textContent = currentOrigin.replace(/^https?:\/\//, "");

    connectBtn.addEventListener("click", async () => {
      connectBtn.disabled = true;
      connectBtn.textContent = "Connecting...";

      try {
        await chrome.storage.local.set({ backendUrl: currentOrigin });

        // Show success
        connectView.innerHTML = `
          <div class="status success" style="margin-top: 8px;">
            Successfully connected to this workspace! You can now save articles here.
          </div>
        `;
        setTimeout(() => window.close(), 1500);
      } catch (err) {
        connectBtn.disabled = false;
        connectBtn.textContent = "Try Again";
        alert("Failed to connect: " + err.message);
      }
    });
  } else {
    // Show Save view or No Connection view
    // Check if we have a saved backendUrl in chrome storage
    const data = await chrome.storage.local.get("backendUrl");
    let backendUrl = data.backendUrl;

    if (!backendUrl) {
      // Fallback to default backend URL
      backendUrl = DEFAULT_BACKEND_URL;
    }

    if (backendUrl) {
      saveView.classList.remove("hidden");
      connectView.classList.add("hidden");
      noConnectionView.classList.add("hidden");

      // Display the connected backend URL domain
      const displayDomain = backendUrl.replace(/^https?:\/\//, "");
      connectionInfoEl.textContent = `Connected to: ${displayDomain}`;

      saveBtn.addEventListener("click", async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = "Opening...";

        try {
          if (
            !currentUrl ||
            currentUrl.startsWith("chrome://") ||
            currentUrl.startsWith("chrome-extension://")
          ) {
            throw new Error("Cannot save this type of page.");
          }

          // Extract HTML using scripting API
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.documentElement.outerHTML,
          });
          const html = results[0] ? results[0].result : "";

          // Store temporarily in chrome storage
          await chrome.storage.local.set({
            lastSavedArticle: {
              url: currentUrl,
              html: html,
            },
          });

          // Open the ReadrSpace save page — it handles auth and saving internally.
          const saveUrl = `${backendUrl}/save?url=${encodeURIComponent(currentUrl)}&extId=${chrome.runtime.id}`;
          await chrome.tabs.create({ url: saveUrl });

          statusEl.textContent = "Opening ReadrSpace\u2026";
          statusEl.className = "status success";
          statusEl.classList.remove("hidden");
          setTimeout(() => window.close(), 1200);
        } catch (err) {
          statusEl.textContent = err.message || "An unexpected error occurred.";
          statusEl.className = "status error";
          statusEl.classList.remove("hidden");
          saveBtn.disabled = false;
          saveBtn.innerHTML = "Try Again";
        }
      });
    } else {
      // Show No Connection view
      saveView.classList.add("hidden");
      connectView.classList.add("hidden");
      noConnectionView.classList.remove("hidden");
    }
  }

  const helpLink = document.getElementById("help-link");
  if (helpLink) {
    helpLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const data = await chrome.storage.local.get("backendUrl");
      const targetUrl = `${data.backendUrl || DEFAULT_BACKEND_URL}/extension`;
      await chrome.tabs.create({ url: targetUrl });
      window.close();
    });
  }
});
