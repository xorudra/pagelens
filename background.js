chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    // User-origin !important rules outrank page styles that hide the toolbar.
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["host.css"],
        origin: "USER"
      });
    } catch (error) {
      // Keep the regular inline-style fallback available on restricted pages.
      console.debug("PageLens host protection stylesheet was unavailable.", error);
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (error) {
    console.warn("PageLens could not open on this page.", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !sender.tab?.id) return;

  if (message.type === "pagelens:capture-visible") {
    (async () => {
      const tabId = sender.tab.id;
      try {
        await chrome.tabs.sendMessage(tabId, { type: "pagelens:hide-for-capture" });
        await new Promise((resolve) => setTimeout(resolve, 100));
        const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, {
          format: "png"
        });
        await chrome.tabs.sendMessage(tabId, { type: "pagelens:restore-after-capture" });
        await chrome.downloads.download({
          url: dataUrl,
          filename: `pagelens-capture-${new Date().toISOString().replace(/[:.]/g, "-")}.png`,
          saveAs: true
        });
        sendResponse({ ok: true });
      } catch (error) {
        try {
          await chrome.tabs.sendMessage(tabId, { type: "pagelens:restore-after-capture" });
        } catch (_) {}
        sendResponse({ ok: false, error: error.message || "Capture failed." });
      }
    })();
    return true;
  }

  if (message.type === "pagelens:capture-frame") {
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" })
      .then((dataUrl) => sendResponse({ ok: true, dataUrl }))
      .catch((error) => sendResponse({ ok: false, error: error.message || "Capture failed." }));
    return true;
  }

  if (message.type === "pagelens:download-url") {
    chrome.downloads.download({
      url: message.url,
      filename: message.filename || "pagelens-asset",
      saveAs: true
    }).then((downloadId) => sendResponse({ ok: true, downloadId }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});
