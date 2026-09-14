import { expect, test, type Page } from "@playwright/test";

const channelIds = [
  "29f20622463916fa48ad735057b145ce",
  "17f0cfcba4ff608de5eabb5110d134d0",
  "64e2f6440548a60d06bcdb24b8c0d322",
  "0a3db4721b5539b127ef1f3e5bf821f6",
  "1034d1e64635d2ef3cd6e6e3442c1df8",
  "b3a72d0d6bd05d69103ac87d9f9785a5",
  "7d53537599f09a5f86f829771a6af16a",
  "5c0189583ea8b1788e401f5d5d89e8b8",
];

async function mockParticipantBroadcasts(page: Page) {
  await page.route("**/api/chzzk/participant-broadcasts", (route) => route.fulfill({
    json: {
      status: "fresh",
      cacheAgeSeconds: 0,
      fetchedAt: "2026-09-14T00:00:00.000Z",
      ambiguousMatches: [],
      broadcasts: channelIds.map((channelId, index) => ({
        participant: {
          streamerName: `Streamer ${index + 1}`,
          rpName: null,
          channelId,
          affiliations: [],
          groups: [],
          tags: [],
          aliases: [],
        },
        isLive: true,
        live: {
          channelId,
          channelName: `Channel ${index + 1}`,
          liveTitle: `LIVE ${index + 1}`,
          viewerCount: 100 - index,
          thumbnailUrl: null,
          channelImageUrl: null,
          tags: [],
          categoryType: null,
          liveCategory: null,
          liveCategoryValue: null,
        },
      })),
    },
  }));
}

test("shows the ChCTV discovery workspace", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "봉누도 상황실" })).toBeVisible();
});

test("starts multiview with ordered channel query parameters", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");

  const addButtons = page.locator('button[aria-label$="선택에 추가"]');
  await expect(addButtons).toHaveCount(8);
  await addButtons.nth(0).press("Enter");
  await addButtons.nth(0).press("Enter");

  await expect(page.getByText("Main", { exact: true })).toBeVisible();
  await expect(page.getByText("Sub 1", { exact: true })).toBeVisible();

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "멀티뷰 시작" }).click();
  const multiviewWindow = await popupPromise;

  await expect(page).toHaveURL("/");
  await expect(multiviewWindow).toHaveURL(`/multiview?channels=${channelIds[0]}%2C${channelIds[1]}`);
  const viewers = multiviewWindow.locator("iframe");
  await expect(viewers).toHaveCount(3);
  await expect(viewers.nth(0)).toHaveAttribute("src", `https://chzzk.naver.com/live/${channelIds[0]}`);
  await expect(viewers.nth(1)).toHaveAttribute("src", `https://chzzk.naver.com/live/${channelIds[1]}`);
  await expect(viewers.nth(2)).toHaveAttribute("src", `https://chzzk.naver.com/live/${channelIds[0]}/chat`);
});

test("handles direct multiview access without channel parameters", async ({ page }) => {
  await page.goto("/multiview");

  await expect(page.getByText("선택된 방송이 없습니다.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Discovery로 돌아가기" })).toHaveAttribute("href", "/");
});
