chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
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
