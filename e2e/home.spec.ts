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
      broadcasts: [...channelIds.map((channelId, index) => ({
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
      })), {
        participant: {
          streamerName: "Offline Streamer",
          rpName: "Offline Role",
          channelId: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          affiliations: [{ type: "public", name: "병원", role: "간호사" }],
          groups: ["픽셀"],
          tags: [],
          aliases: ["Offline Alias"],
        },
        isLive: false,
        live: null,
        channelImageUrl: "https://cdn.example.com/offline-channel.jpg",
      }],
    },
  }));
}

test("shows the ChCTV discovery workspace", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");
  await expect(page.getByRole("img", { name: "ChCTV" })).toBeVisible();
  await expect(page.locator('[aria-live="polite"] [aria-label^="봉누도"]')).toBeVisible();
  await expect(page.getByText("8개 채널 방송 중", { exact: true })).toHaveCount(0);
  const wikiLink = page.getByRole("link", { name: "공식 위키" });
  await expect(wikiLink).toHaveAttribute("href", "https://www.bongnudo.site/");
  await expect(wikiLink).toHaveAttribute("target", "_blank");
  await expect(wikiLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("heading", { name: "봉누도 상황실" })).toHaveCount(0);

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole("img", { name: "ChCTV" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("opens the StreamCard CHZZK shortcut without selecting the stream", async ({ page, context }, testInfo) => {
  await mockParticipantBroadcasts(page);
  await context.route("https://chzzk.naver.com/live/**", (route) => route.fulfill({ body: "CHZZK LIVE" }));
  await page.goto("/");

  const card = page.getByRole("article", { name: "Streamer 1 방송", exact: true });
  const link = card.getByRole("link", { name: "Streamer 1 방송 치지직에서 보기 (새 탭)" });
  const add = card.getByRole("button", { name: "Streamer 1 선택에 추가" });
  const tooltip = card.getByRole("tooltip");
  await expect(link).toHaveAttribute("href", `https://chzzk.naver.com/live/${channelIds[0]}`);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(link).toHaveAttribute("draggable", "false");
  await expect(link.locator("img")).toHaveJSProperty("naturalWidth", 1024);
  await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(tooltip).toBeHidden();

  const initialBounds = await card.boundingBox();
  const linkBounds = (await link.boundingBox())!;
  const addBounds = (await add.boundingBox())!;
  expect(linkBounds.x + linkBounds.width).toBeLessThan(addBounds.x);
  expect(linkBounds.height).toBe(addBounds.height);
  expect(linkBounds.y).toBe(addBounds.y);

  await link.hover();
  await expect(tooltip).toHaveText("치지직에서 보기");
  await expect(tooltip).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("stream-card-tooltip.png") });
  await add.focus();
  await page.mouse.move(0, 0);
  await expect(tooltip).toBeHidden();
  await page.keyboard.press("Shift+Tab");
  await expect(link).toBeFocused();
  await expect(tooltip).toBeVisible();
  await link.press("Escape");
  await expect(tooltip).toBeHidden();

  for (const activate of [() => link.click(), () => link.press("Enter")]) {
    const popupPromise = page.waitForEvent("popup");
    await activate();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(`https://chzzk.naver.com/live/${channelIds[0]}`);
    expect(await popup.evaluate(() => window.opener)).toBeNull();
    await popup.close();
    await expect(add).toBeEnabled();
    await expect(page.locator("aside").getByText("Streamer 1", { exact: true })).toHaveCount(0);
    expect(await card.boundingBox()).toEqual(initialBounds);
  }

  await add.click();
  await expect(card.getByLabel("추가됨", { exact: true })).toBeVisible();
  await expect(page.locator("aside").getByText("Streamer 1", { exact: true })).toBeVisible();
  await expect(link).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(link).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("isolates StreamCard CHZZK shortcut dragging and preserves card drag and drop", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");
  const card = page.getByRole("article", { name: "Streamer 1 방송", exact: true });
  const link = card.getByRole("link", { name: "Streamer 1 방송 치지직에서 보기 (새 탭)" });
  const remote = page.locator("aside");
  const dropZone = remote.getByRole("region", { name: "현재 선택" });
  const target = (await dropZone.boundingBox())!;
  const dragToSelection = async (source: { x: number; y: number }) => {
    await page.mouse.move(source.x, source.y);
    await page.mouse.down();
    await page.mouse.move(source.x + 20, source.y, { steps: 5 });
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 15 });
    await page.mouse.up();
  };

  const linkBounds = (await link.boundingBox())!;
  await dragToSelection({ x: linkBounds.x + linkBounds.width / 2, y: linkBounds.y + linkBounds.height / 2 });
  await expect(remote.getByText("Streamer 1", { exact: true })).toHaveCount(0);
  await expect(card.getByRole("button", { name: "Streamer 1 선택에 추가" })).toBeEnabled();

  const cardBounds = (await card.boundingBox())!;
  await dragToSelection({ x: cardBounds.x + 30, y: cardBounds.y + 60 });
  await expect(remote.getByText("Streamer 1", { exact: true })).toBeVisible();
  await expect(card.getByLabel("추가됨", { exact: true })).toBeVisible();
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

test("shows offline participants automatically for active discovery filters", async ({ page }) => {
  await mockParticipantBroadcasts(page);
  await page.goto("/");

  const offlineCard = page.locator('article[aria-label="Offline Streamer 오프라인"]');
  await expect(offlineCard).toHaveCount(0);

  await page.getByPlaceholder("스트리머명, RP명 또는 별칭 검색...").fill("Offline Alias");
  await expect(offlineCard).toBeVisible();
  await expect(page.getByRole("heading", { name: "오프라인 참가자 1명" })).toBeVisible();
  await expect(offlineCard.getByText("OFFLINE", { exact: true })).toBeVisible();
  await expect(offlineCard.getByRole("img", { name: "Offline Streamer 채널 이미지" })).toHaveAttribute("src", "https://cdn.example.com/offline-channel.jpg");
  await expect(offlineCard.getByRole("button")).toHaveCount(0);
  await expect(page.locator("article").filter({ hasText: "Streamer 1" })).toHaveCount(0);

  await page.getByRole("region", { name: "봉누도 방송 탐색" }).getByRole("button", { name: "초기화" }).click();
  await expect(offlineCard).toHaveCount(0);

  await page.getByRole("button", { name: "그룹" }).click();
  await page.getByRole("option", { name: "픽셀" }).click();
  await expect(offlineCard).toBeVisible();

  await page.getByRole("button", { name: "봉누도 소속" }).click();
  await page.getByRole("option", { name: "병원" }).click();
  await expect(offlineCard).toBeVisible();
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
  const multiviewLink = page.getByRole("link", { name: "멀티뷰 시작" });
  await expect(multiviewLink).toHaveAttribute(
    "href",
    `/multiview?channel=${channelIds[0]}&channel=${channelIds[1]}`,
  );
  await expect(multiviewLink).toHaveAttribute("target", "_blank");
  await expect(multiviewLink).toHaveAttribute("rel", "noopener noreferrer");
  await multiviewLink.click();
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

test("uses the same empty state after removing the last multiview frame", async ({ page }) => {
  await page.route("https://chzzk.naver.com/live/**", (route) => route.fulfill({ body: "CHZZK LIVE" }));
  await page.goto(getMultiviewPath([channelIds[0]]));

  await page.getByRole("button", { name: "Main 제거" }).click();

  await expect(page.getByText("선택된 방송이 없습니다.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Discovery로 돌아가기" })).toHaveAttribute("href", "/");
  await expect(page).toHaveURL("/multiview");
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

test("uses Crown controls to identify and change the Main viewer", async ({ page }) => {
  await page.goto(getMultiviewPath(channelIds.slice(0, 2)));

  await expect(page.locator('[data-viewer-slot="main"] [aria-label="현재 메인"]')).toBeVisible();
  await expect(page.getByText("Main", { exact: true })).toHaveCount(0);

  const makeMainButton = page.getByRole("button", { name: "메인으로 지정" });
  await expect(makeMainButton).toBeVisible();
  await makeMainButton.click();

  await expect(page.locator('[data-viewer-slot="main"] [aria-label="현재 메인"]')).toBeVisible();
  await expect(page.locator('[data-viewer-slot="main"] iframe')).toHaveAttribute(
    "src",
    `https://chzzk.naver.com/live/${channelIds[1]}`,
  );
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
