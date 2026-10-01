const PING_TYPE = "CHCTV_HELPER_PING";
const READY_TYPE = "CHCTV_HELPER_READY";
const REGISTER_CHCTV_TAB = "CHCTV_HELPER_REGISTER_TAB";
const ALLOWED_CHCTV_ORIGINS = new Set([
  "http://localhost",
  "http://127.0.0.1",
  "https://chctv.vercel.app",
]);

if (ALLOWED_CHCTV_ORIGINS.has(window.location.origin)) {
  chrome.runtime.sendMessage({ type: REGISTER_CHCTV_TAB });

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    if (event.data?.type !== PING_TYPE || typeof event.data.requestId !== "string") return;

    chrome.runtime.sendMessage({ type: PING_TYPE }, (result) => {
      const error = chrome.runtime.lastError;
      window.postMessage(
        {
          type: READY_TYPE,
          requestId: event.data.requestId,
          ready: !error && result?.ready === true,
        },
        window.location.origin,
      );
    });
  });
}
