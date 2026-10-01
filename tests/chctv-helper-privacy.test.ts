import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { chctvHelperPrivacy } from "@/lib/chctv-helper-privacy";

const privacyDocument = readFileSync(resolve(process.cwd(), "extension/PRIVACY.md"), "utf8");
const storeListing = readFileSync(resolve(process.cwd(), "extension/store/STORE_LISTING.md"), "utf8");
const privacyPage = readFileSync(resolve(process.cwd(), "src/app/privacy/chctv-helper/page.tsx"), "utf8");

describe("ChCTV Helper public privacy policy", () => {
  it("keeps the public page backed by the shared privacy content", () => {
    expect(privacyPage).toContain('import { chctvHelperPrivacy } from "@/lib/chctv-helper-privacy"');
    expect(privacyPage).toContain("chctvHelperPrivacy.notCollected");
    expect(privacyPage).toContain("chctvHelperPrivacy.permissions");
  });

  it("keeps the extension privacy document aligned with the public policy claims", () => {
    expect(privacyDocument).toContain(chctvHelperPrivacy.purpose);
    expect(privacyDocument).toContain(chctvHelperPrivacy.processing);
    expect(privacyDocument).toContain(chctvHelperPrivacy.dataTransfer);
    expect(privacyDocument).toContain(chctvHelperPrivacy.storage);
    for (const item of chctvHelperPrivacy.notCollected) {
      expect(privacyDocument).toContain(item);
    }
  });

  it("uses the deployed public privacy route in Store materials", () => {
    expect(storeListing).toContain("https://chctv.vercel.app/privacy/chctv-helper");
    expect(storeListing).toContain(chctvHelperPrivacy.supportUrl);
    expect(storeListing).toContain("Chrome Web Store URL | TODO");
  });
});
