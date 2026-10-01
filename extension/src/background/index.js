const HELPER_PING = "CHCTV_HELPER_PING";
const REGISTER_CHCTV_TAB = "CHCTV_HELPER_REGISTER_TAB";
const SESSION_RULE_ID_START = 10_000;
const CHZZK_LIVE_URL_FILTER = "|https://chzzk.naver.com/live/";
const CHZZK_LIVE_URL_PATTERN = /^https:\/\/chzzk\.naver\.com\/live\/[0-9a-f]{32}\/?$/i;
const CHCTV_INITIATOR_DOMAINS = ["localhost", "127.0.0.1", "chctv.vercel.app"];
const managedChctvTabIds = new Set();

function isHelperSessionRule(rule) {
  return rule.id >= SESSION_RULE_ID_START;
}

function createSessionRule(id, tabId) {
  return {
    id,
    priority: 1,
    action: {
      type: "modifyHeaders",
      responseHeaders: [{ header: "content-security-policy", operation: "remove" }],
    },
    condition: {
      tabIds: [tabId],
      urlFilter: CHZZK_LIVE_URL_FILTER,
      resourceTypes: ["sub_frame"],
      initiatorDomains: CHCTV_INITIATOR_DOMAINS,
    },
  };
}

async function ensureChctvTabRule(tabId) {
  const rules = await chrome.declarativeNetRequest.getSessionRules();
  const existingRule = rules.find((rule) => isHelperSessionRule(rule) && rule.condition.tabIds?.includes(tabId));
  if (existingRule) {
    managedChctvTabIds.add(tabId);
    return existingRule.id;
  }

  const usedRuleIds = new Set(rules.map((rule) => rule.id));
  let ruleId = SESSION_RULE_ID_START;
  while (usedRuleIds.has(ruleId)) ruleId += 1;

  await chrome.declarativeNetRequest.updateSessionRules({
    addRules: [createSessionRule(ruleId, tabId)],
  });
  managedChctvTabIds.add(tabId);
  return ruleId;
}

async function removeChctvTabRule(tabId) {
  const rules = await chrome.declarativeNetRequest.getSessionRules();
  const ruleIds = rules
    .filter((rule) => isHelperSessionRule(rule) && rule.condition.tabIds?.includes(tabId))
    .map((rule) => rule.id);
  if (ruleIds.length === 0) {
    managedChctvTabIds.delete(tabId);
    return;
  }

  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: ruleIds });
  managedChctvTabIds.delete(tabId);
}

async function removeStaleSessionRules() {
  const [rules, tabs] = await Promise.all([
    chrome.declarativeNetRequest.getSessionRules(),
    chrome.tabs.query({}),
  ]);
  const activeTabIds = new Set(tabs.map((tab) => tab.id));
  const staleRuleIds = rules
    .filter((rule) => isHelperSessionRule(rule) && rule.condition.tabIds?.some((tabId) => !activeTabIds.has(tabId)))
    .map((rule) => rule.id);
  if (staleRuleIds.length === 0) return;

  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: staleRuleIds });
}

async function isManagedChctvTab(tabId) {
  if (managedChctvTabIds.has(tabId)) return true;

  const rules = await chrome.declarativeNetRequest.getSessionRules();
  const isManaged = rules.some(
    (rule) => isHelperSessionRule(rule) && rule.condition.tabIds?.includes(tabId),
  );
  if (isManaged) managedChctvTabIds.add(tabId);
  return isManaged;
}

function registerTabFromSender(sender, sendResponse) {
  if (typeof sender.tab?.id !== "number") {
    sendResponse({ ok: false });
    return;
  }

  ensureChctvTabRule(sender.tab.id)
    .then((ruleId) => sendResponse({ ok: true, ruleId }))
    .catch((error) => {
      console.warn("[ChCTV Helper] session rule registration failed", error);
      sendResponse({ ok: false });
    });
}

chrome.runtime.onStartup.addListener(() => {
  removeStaleSessionRules().catch((error) => {
    console.warn("[ChCTV Helper] stale session rule cleanup failed", error);
  });
});

chrome.runtime.onInstalled.addListener(() => {
  removeStaleSessionRules().catch((error) => {
    console.warn("[ChCTV Helper] stale session rule cleanup failed", error);
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  removeChctvTabRule(tabId).catch((error) => {
    console.warn("[ChCTV Helper] session rule removal failed", error);
  });
});

async function initializeChzzkLiveFrame({ tabId, frameId, url }) {
  if (frameId === 0 || !CHZZK_LIVE_URL_PATTERN.test(url) || !(await isManagedChctvTab(tabId))) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      func: async () => {
        const unresolved = new Set(["muted", "wide", "chat"]);
        const muteSelector = 'button[aria-label="음소거"]';
        const unmuteSelector = 'button[aria-label="음소거 해제"]';
        const wideScreenSelector = 'button[aria-label="넓은 화면"]';
        const chatCollapseSelector = 'button[aria-label="채팅 접기"]';
        let observer;
        let timeoutId;
        let resolveResult;
        let wideAttempts = 0;
        let wideClickPending = false;

        const finish = () => {
          if (unresolved.size !== 0 || !resolveResult) return;

          observer?.disconnect();
          window.clearTimeout(timeoutId);
          resolveResult();
        };

        const isRenderableButton = (button) => {
          if (!(button instanceof HTMLButtonElement) || button.disabled) return false;

          const rect = button.getBoundingClientRect();
          return button.getClientRects().length > 0 && rect.width > 0 && rect.height > 0;
        };

        const scheduleWideScreen = () => {
          if (!unresolved.has("wide") || wideClickPending) return;

          const wideScreenButton = document.querySelector(wideScreenSelector);
          if (!isRenderableButton(wideScreenButton)) return;

          wideClickPending = true;
          const before = {
            button: wideScreenButton,
            ariaLabel: wideScreenButton.getAttribute("aria-label"),
            ariaPressed: wideScreenButton.getAttribute("aria-pressed"),
            ariaExpanded: wideScreenButton.getAttribute("aria-expanded"),
            className: wideScreenButton.className,
            parentClassName: wideScreenButton.parentElement?.className,
          };

          window.setTimeout(() => {
            const buttonToClick = document.querySelector(wideScreenSelector);
            if (!isRenderableButton(buttonToClick)) {
              wideClickPending = false;
              return;
            }

            buttonToClick.click();
            window.setTimeout(() => {
              const after = document.querySelector(wideScreenSelector);
              const viewModeChanged = !isRenderableButton(after)
                || after !== before.button
                || after.getAttribute("aria-label") !== before.ariaLabel
                || after.getAttribute("aria-pressed") !== before.ariaPressed
                || after.getAttribute("aria-expanded") !== before.ariaExpanded
                || after.className !== before.className
                || after.parentElement?.className !== before.parentClassName;
              wideClickPending = false;

              if (viewModeChanged) {
                unresolved.delete("wide");
                finish();
                return;
              }

              wideAttempts += 1;
              if (wideAttempts >= 3) {
                unresolved.delete("wide");
                finish();
                return;
              }

              scheduleWideScreen();
            }, 500);
          }, 500);
        };

        const applyViewingMode = () => {
          if (unresolved.has("muted")) {
            if (document.querySelector(unmuteSelector)) {
              unresolved.delete("muted");
            } else {
              const muteButton = document.querySelector(muteSelector);
              if (muteButton instanceof HTMLButtonElement && !muteButton.disabled) {
                muteButton.click();
                unresolved.delete("muted");
              }
            }
          }

          if (unresolved.has("wide")) {
            scheduleWideScreen();
          }

          if (unresolved.has("chat")) {
            const chatCollapseButton = document.querySelector(chatCollapseSelector);
            if (chatCollapseButton instanceof HTMLButtonElement && !chatCollapseButton.disabled) {
              chatCollapseButton.click();
              unresolved.delete("chat");
            }
          }
        };

        applyViewingMode();
        if (unresolved.size === 0) return;

        return new Promise((resolve) => {
          resolveResult = resolve;
          observer = new MutationObserver(() => {
            applyViewingMode();
            finish();
          });
          timeoutId = window.setTimeout(() => {
            unresolved.clear();
            finish();
          }, 10_000);

          observer.observe(document.documentElement, { childList: true, subtree: true });
          finish();
        });
      },
    });
  } catch (error) {
    console.warn("[ChCTV Helper] iframe viewing initialization failed", error);
  }
}

chrome.webNavigation.onCompleted.addListener((details) => {
  initializeChzzkLiveFrame(details).catch((error) => {
    console.warn("[ChCTV Helper] CHZZK live frame handling failed", error);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === HELPER_PING || message?.type === REGISTER_CHCTV_TAB) {
    registerTabFromSender(sender, (result) => {
      sendResponse(message.type === HELPER_PING ? { ready: result.ok } : result);
    });
    return true;
  }
});
