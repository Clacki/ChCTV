import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const extensionRoot = resolve(process.cwd(), "extension");
const extensionFile = (path: string) => readFileSync(resolve(extensionRoot, path), "utf8");

describe("ChCTV Helper", () => {
  it("uses the minimum production manifest scope", () => {
    const manifest = JSON.parse(extensionFile("manifest.json"));

    expect(manifest.name).toBe("ChCTV Helper");
    expect(manifest.permissions).toEqual(["declarativeNetRequest", "scripting", "webNavigation"]);
    expect(manifest.host_permissions).toEqual([
      "http://localhost/*",
      "http://127.0.0.1/*",
      "https://chctv.vercel.app/*",
      "https://chzzk.naver.com/live/*",
    ]);
    expect(manifest.content_scripts).toEqual([
      {
        matches: ["http://localhost/*", "http://127.0.0.1/*", "https://chctv.vercel.app/*"],
        js: ["src/content/index.js"],
        run_at: "document_start",
      },
    ]);
    expect(manifest.host_permissions).not.toContain("https://*.vercel.app/*");
  });

  it("uses the existing ChCTV favicon through required extension icon sizes", () => {
    const manifest = JSON.parse(extensionFile("manifest.json"));

    expect(manifest.icons).toEqual({
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    });
    expect(existsSync(resolve(process.cwd(), "public/favicon.png"))).toBe(true);
    for (const iconPath of Object.values(manifest.icons) as string[]) {
      expect(existsSync(resolve(extensionRoot, iconPath))).toBe(true);
    }
  });

  it("keeps DNR scoped to local ChCTV subframes", () => {
    const rules = JSON.parse(extensionFile("rules/chctv-live-iframe.json"));

    expect(rules).toEqual([
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [{ header: "content-security-policy", operation: "remove" }],
        },
        condition: {
          urlFilter: "|https://chzzk.naver.com/live/",
          resourceTypes: ["sub_frame"],
          initiatorDomains: ["localhost", "127.0.0.1", "chctv.vercel.app"],
        },
      },
    ]);
  });

  it("registers one tab-scoped session rule and initializes only exact LIVE subframes", () => {
    const backgroundSource = extensionFile("src/background/index.js");

    expect(backgroundSource).toContain("tabIds: [tabId]");
    expect(backgroundSource).toContain("CHCTV_INITIATOR_DOMAINS");
    expect(backgroundSource).toContain(
      'const CHCTV_INITIATOR_DOMAINS = ["localhost", "127.0.0.1", "chctv.vercel.app"]',
    );
    expect(backgroundSource).toContain("chrome.webNavigation.onCompleted.addListener");
    expect(backgroundSource).toContain("CHZZK_LIVE_URL_PATTERN");
    expect(backgroundSource).toContain("frameId === 0");
    expect(backgroundSource).toContain("target: { tabId, frameIds: [frameId] }");
    expect(backgroundSource).toContain('button[aria-label="음소거"]');
    expect(backgroundSource).toContain('button[aria-label="음소거 해제"]');
    expect(backgroundSource).toContain('button[aria-label="넓은 화면"]');
    expect(backgroundSource).toContain('button[aria-label="채팅 접기"]');
    expect(backgroundSource).toContain("wideAttempts >= 3");
    expect(backgroundSource).toContain("}, 500);");
    expect(backgroundSource).toContain("10_000");
    expect(backgroundSource).toContain("chrome.tabs.onRemoved.addListener");
    expect(backgroundSource).not.toContain("allFrames: true");
    expect(backgroundSource).not.toContain("chrome.windows.create");
    expect(backgroundSource).not.toContain("chrome.tabs.create");
    expect(backgroundSource).not.toContain("console.debug");
    expect(backgroundSource).not.toContain("console.log");
    expect(backgroundSource).not.toContain("already-muted");
    expect(backgroundSource).not.toContain("not-applied");
  });

  it("keeps the bridge local and removes PoC artifacts", () => {
    const bridgeSource = extensionFile("src/content/index.js");

    expect(bridgeSource).toContain("CHCTV_HELPER_REGISTER_TAB");
    expect(bridgeSource).toContain("ALLOWED_CHCTV_ORIGINS");
    expect(bridgeSource).toContain('"http://localhost",');
    expect(bridgeSource).toContain('"http://127.0.0.1",');
    expect(bridgeSource).toContain('"https://chctv.vercel.app",');
    expect(bridgeSource).toContain("ALLOWED_CHCTV_ORIGINS.has(window.location.origin)");
    expect(bridgeSource).toContain("event.origin !== window.location.origin");
    expect(bridgeSource).not.toContain("console.");
    expect(existsSync(resolve(extensionRoot, "package.json"))).toBe(false);
    expect(existsSync(resolve(extensionRoot, "src/chzzk-iframe-init"))).toBe(false);
    expect(existsSync(resolve(extensionRoot, "src/chzzk-multiview"))).toBe(false);
    expect(readFileSync(resolve(process.cwd(), ".gitignore"), "utf8")).toContain("extension/_metadata/");
    expect(readFileSync(resolve(process.cwd(), ".gitignore"), "utf8")).toContain("extension/dist/");
    expect(bridgeSource).not.toContain("vercel.app/*");
  });

  it("keeps Store submission materials alongside the extension", () => {
    expect(existsSync(resolve(extensionRoot, "PRIVACY.md"))).toBe(true);
    expect(existsSync(resolve(extensionRoot, "store/STORE_LISTING.md"))).toBe(true);
    expect(existsSync(resolve(extensionRoot, "store/SUBMISSION_CHECKLIST.md"))).toBe(true);
    expect(extensionFile("README.md")).toContain("chctv-helper-0.1.0.zip");
  });

  it("contains no remotely hosted or dynamically evaluated runtime code", () => {
    const runtimeSource = [
      extensionFile("src/background/index.js"),
      extensionFile("src/content/index.js"),
    ].join("\n");

    expect(runtimeSource).not.toMatch(/\beval\s*\(/);
    expect(runtimeSource).not.toMatch(/\bnew\s+Function\s*\(/);
    expect(runtimeSource).not.toMatch(/\bfetch\s*\(/);
    expect(runtimeSource).not.toMatch(/\bimport\s*\(/);
  });
});
