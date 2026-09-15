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

function getMultiviewPath(channelIds: readonly string[]): string {
  const params = new URLSearchParams();

  channelIds.forEach((channelId) => {
    params.append("channel", channelId);
  });

  return `/multiview?${params.toString()}`;
}

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
          rpName: `Role ${index + 1}`,
          channelId,
          affiliations: index < 2 ? [{ type: "public", name: "병원", role: "간호사" }] : [],
          groups: index === 0 ? ["픽셀", "인챈트", "플라네타"] : index === 1 ? ["스텔라이브"] : [],
          tags: index === 0 ? ["ignored-json-tag"] : [],
          aliases: index === 0 ? ["별칭 1"] : [],
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

test("shows participant groups and restores the RP name preference", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");

  const firstCard = page.locator("article").filter({ hasText: "Streamer 1" });
  await expect(firstCard.getByText("픽셀", { exact: true })).toBeVisible();
  await expect(firstCard.getByText("+1", { exact: true })).toBeVisible();
  await expect(firstCard.getByRole("list", { name: "Participant groups" })).toBeVisible();
  await expect(firstCard.getByText("ignored-json-tag", { exact: true })).toHaveCount(0);
  await expect(page.locator("article").filter({ hasText: "Streamer 3" }).getByRole("list", { name: "Participant groups" })).toHaveCount(0);
  await expect(firstCard.getByText("Role 1", { exact: true })).toHaveCount(0);

  const rpNameSwitch = page.getByRole("switch", { name: /RP 이름/ });
  await expect(rpNameSwitch).toHaveAttribute("aria-checked", "false");
  await rpNameSwitch.click();
  await expect(firstCard.getByText("Role 1", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("switch", { name: /RP 이름/ })).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("article").filter({ hasText: "Streamer 1" }).getByText("Role 1", { exact: true })).toBeVisible();
});

test("keeps stable facet controls and applies group OR with affiliation AND", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");

  await expect(page.getByRole("button", { name: "그룹" })).toBeVisible();
  await expect(page.getByRole("button", { name: "봉누도 소속" })).toBeVisible();
  await expect(page.getByRole("button", { name: "태그" })).toHaveCount(0);

  await page.getByRole("button", { name: "그룹" }).click();
  await expect(page.getByText("소속 / MCN", { exact: true })).toBeVisible();
  await expect(page.getByText("버튜버 / 프로젝트", { exact: true })).toBeVisible();
  await page.getByRole("option", { name: "픽셀" }).click();
  await expect(page.locator("article").filter({ hasText: "Streamer 1" })).toBeVisible();
  await expect(page.locator("article").filter({ hasText: "Streamer 2" })).toHaveCount(0);

  await page.getByRole("option", { name: "스텔라이브" }).click();
  await expect(page.locator("article").filter({ hasText: "Streamer 1" })).toBeVisible();
  await expect(page.locator("article").filter({ hasText: "Streamer 2" })).toBeVisible();

  await page.getByRole("button", { name: "봉누도 소속" }).click();
  await page.getByRole("option", { name: "병원" }).click();
  await expect(page.locator("article").filter({ hasText: "Streamer 1" })).toBeVisible();
  await expect(page.locator("article").filter({ hasText: "Streamer 2" })).toBeVisible();

  await page.getByRole("option", { name: "시청" }).click();
  await expect(page.locator("article").filter({ hasText: "Streamer 1" })).toBeVisible();
  await page.getByRole("option", { name: "병원" }).click();
  await expect(page.getByText("조건에 맞는 방송이 없습니다.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /그룹 2/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /봉누도 소속 1/ })).toBeVisible();
  await page.getByRole("button", { name: "필터 초기화" }).click();
  await expect(page.locator("article").filter({ hasText: "Streamer 1" })).toBeVisible();
  await expect(page.locator("article").filter({ hasText: "Streamer 2" })).toBeVisible();

  await page.getByPlaceholder("스트리머명, RP명 또는 별칭 검색...").fill("별칭 1");
  await expect(page.locator("article").filter({ hasText: "Streamer 1" })).toBeVisible();
  await expect(page.locator("article").filter({ hasText: "Streamer 2" })).toHaveCount(0);
});

test("keeps the Discovery utility within the viewport on desktop widths", async ({ page }) => {
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    await mockParticipantBroadcasts(page);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "그룹" })).toBeVisible();
    await expect(page.getByRole("button", { name: "봉누도 소속" })).toBeVisible();
    await expect(page.getByRole("button", { name: "태그" })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("keeps RP names out of the remote and saves unnamed multiviews", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");

  await page.getByRole("switch", { name: /RP 이름/ }).click();
  await page.locator('button[aria-label$="선택에 추가"]').first().click();

  const remote = page.locator("aside");
  await expect(remote.getByText("Role 1", { exact: true })).toHaveCount(0);

  await remote.getByRole("button", { name: "저장" }).click();
  await expect(remote.getByText("멀티뷰 1", { exact: true })).toBeVisible();

  await remote.getByLabel("묶음 이름").fill("직접 입력한 이름");
  await remote.getByRole("button", { name: "저장" }).click();
  await expect(remote.getByText("직접 입력한 이름", { exact: true })).toBeVisible();

  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("chctv.saved-multiviews"))).toContain("멀티뷰 1");
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
  await expect(multiviewWindow).toHaveURL(
    `/multiview?channel=${channelIds[0]}&channel=${channelIds[1]}`,
  );
  const viewers = multiviewWindow.locator("iframe");
  await expect(viewers).toHaveCount(3);

  await multiviewWindow.reload();
  await expect(multiviewWindow.locator("iframe")).toHaveCount(3);
  await expect(viewers.nth(0)).toHaveAttribute("src", `https://chzzk.naver.com/live/${channelIds[0]}`);
  await expect(viewers.nth(0)).toHaveAttribute("allow", "autoplay; fullscreen; encrypted-media; local-network-access; loopback-network");
  await expect(viewers.nth(0)).toHaveAttribute("scrolling", "no");
  await expect(viewers.nth(1)).toHaveAttribute("src", `https://chzzk.naver.com/live/${channelIds[1]}`);
  await expect(viewers.nth(2)).toHaveAttribute("src", `https://chzzk.naver.com/live/${channelIds[0]}/chat`);
});

test("handles direct multiview access without channel parameters", async ({ page }) => {
  await page.goto("/multiview");

  await expect(page.getByText("선택된 방송이 없습니다.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Discovery로 돌아가기" })).toHaveAttribute("href", "/");
});

test("uses two layouts for two channels without reloading viewer iframes", async ({ page }) => {
  await page.goto(getMultiviewPath(channelIds.slice(0, 2)));
  await expect(page.locator("[data-viewer-slot]")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Focus Right" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Focus Bottom" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Balanced" })).toHaveCount(0);

  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const iframes = [...document.querySelectorAll<HTMLIFrameElement>("[data-viewer-slot] iframe")];
    const state = { iframes, loadCount: 0 };

    iframes.forEach((iframe) => iframe.addEventListener("load", () => {
      state.loadCount += 1;
    }));
    Object.assign(window, { __twoChannelViewerState: state });
  });

  await page.getByRole("button", { name: "Focus Bottom" }).click();
  await page.getByRole("button", { name: "Focus Right" }).click();
  await page.waitForTimeout(1000);

  expect(await page.evaluate(() => {
    const state = (window as Window & {
      __twoChannelViewerState: { iframes: HTMLIFrameElement[]; loadCount: number };
    }).__twoChannelViewerState;
    const currentIframes = [...document.querySelectorAll<HTMLIFrameElement>("[data-viewer-slot] iframe")];

    return {
      identitiesMatch: state.iframes.every((iframe, index) => iframe === currentIframes[index]),
      loadCount: state.loadCount,
    };
  })).toEqual({ identitiesMatch: true, loadCount: 0 });
});

test("keeps every multiview slot at 16:9 across layouts and desktop widths", async ({ page }) => {
  const layouts = ["Focus Right", "Focus Bottom", "Balanced"];

  for (const [width, height] of [[1280, 800], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });

    for (let count = 1; count <= 6; count += 1) {
      await page.goto(getMultiviewPath(channelIds.slice(0, count)));
      await expect(page.locator("[data-viewer-slot]")).toHaveCount(count);

      if (count === 1) {
        await expect(page.getByText("채팅을 접고 T 키를 누르면 더 깔끔하게 시청할 수 있습니다.", { exact: true })).toBeVisible();
      }

      const availableLayouts = count === 2 ? layouts.filter((layout) => layout !== "Balanced") : layouts;
      await expect(page.getByRole("button", { name: "Balanced" })).toHaveCount(count === 2 ? 0 : 1);

      for (const layout of availableLayouts) {
        await page.getByRole("button", { name: layout }).click();
        const slotMeasurements = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>("[data-viewer-slot]")].map((slot) => {
            const { width: slotWidth, height: slotHeight } = slot.getBoundingClientRect();

            return { width: slotWidth, height: slotHeight };
          }),
        );

        expect(slotMeasurements).toHaveLength(count);
        expect(slotMeasurements.every(({ width: slotWidth, height: slotHeight }) => Math.abs((slotWidth / slotHeight) - (16 / 9)) < 0.02)).toBe(true);
        expect(await page.evaluate(() => (
          document.documentElement.scrollWidth <= window.innerWidth
          && document.documentElement.scrollHeight <= window.innerHeight
        ))).toBe(true);
      }
    }
  }
});
