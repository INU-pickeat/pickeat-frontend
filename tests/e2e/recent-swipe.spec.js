import { test, expect } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true });

async function drag(page, row, dx, dy = 0) {
  const box = await row.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 12 });
  await page.mouse.up();
}

for (const width of [360, 390, 430]) {
  test(`최근 pick 슬라이드 삭제 UI (${width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    let deletions = 0;
    let queries = 0;
    await page.route("**/v1/me/picks/restaurants/10", async (route) => {
      expect(route.request().method()).toBe("DELETE");
      expect(route.request().postData()).toBeNull();
      expect(new URL(route.request().url()).search).toBe("");
      deletions++;
      await route.fulfill({ status: 204 });
    });
    await page.route("**/v1/me/picks?*", (route) => {
      queries++;
      return route.fulfill({
        json: {
          restaurants: [
            {
              restaurantId: 10,
              restaurantName: "야스노야지로 본점",
              foodCategory: "JAPANESE",
              pickCount: deletions ? 1 : 3,
              latestPickedAt: "2026-10-13T00:00:00Z",
              representativeImageUrl: "http://localhost:5173/assets/dummy.png",
            },
            {
              restaurantId: 11,
              restaurantName: "초원",
              foodCategory: "KOREAN",
              pickCount: 1,
              latestPickedAt: "2026-10-12T00:00:00Z",
            },
            ...Array.from({ length: 6 }, (_, index) => ({
              restaurantId: 20 + index,
              restaurantName: `다른 식당 ${index}`,
              foodCategory: "KOREAN",
              pickCount: 1,
              latestPickedAt: "2026-10-11T00:00:00Z",
            })),
          ],
        },
      });
    });
    await page.goto("/recent");
    const first = page.getByRole("group", { name: "야스노야지로 본점 최근 pick", exact: true, includeHidden: true });
    const second = page.getByRole("group", { name: "초원 최근 pick", exact: true, includeHidden: true });
    const card = first.locator(":scope > div").last();
    await expect(first).toBeVisible();
    await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
    await drag(page, first, -100);
    const modal = page.getByRole("dialog", { name: "정말 삭제하시겠습니까?" });
    await expect(modal).toBeVisible();
    await expect(first.getByRole("button")).toHaveCount(0);
    await expect(first.locator(':scope > div[aria-hidden="true"] img')).toHaveJSProperty("naturalWidth", 18);
    await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, -88, 0)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("recent-swipe.png") });
    await modal.getByRole("button", { name: "아니요", exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(card).toHaveCSS("transform", "none");
    expect(deletions).toBe(0);
    await drag(page, first, -100);
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "네", exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(first).toBeVisible();
    await expect(first.getByText("1번째 방문", { exact: true })).toBeVisible();
    expect(deletions).toBe(1);
    expect(queries).toBe(2);
    await expect(card).toHaveCSS("transform", "none");
    await first.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    await second.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    const session = await page.context().newCDPSession(page);
    const box = await first.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 8; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - step * 12, y }] });
      await page.evaluate(() => new Promise(requestAnimationFrame));
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(card).toHaveCSS("transform", "none");
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 8; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - step * 15 }] });
      await page.evaluate(() => new Promise(requestAnimationFrame));
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect
      .poll(() =>
        page
          .locator("main .overflow-y-auto")
          .first()
          .evaluate((element) => element.scrollTop),
      )
      .toBeGreaterThan(0);
    await expect(modal).toHaveCount(0);
  });
}
