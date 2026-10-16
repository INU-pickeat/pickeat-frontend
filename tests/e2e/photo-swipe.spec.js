import { test, expect } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true });
const touchClients = new WeakMap();

/** 브라우저 터치 입력으로 사진 밀기 */
async function swipe(page, target, dx, dy = 0) {
  const box = await target.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (!touchClients.has(page)) touchClients.set(page, await page.context().newCDPSession(page));
  const client = touchClients.get(page);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
  for (let step = 1; step <= 8; step++) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + (dx * step) / 8, y: y + (dy * step) / 8, id: 1 }],
    });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

for (const width of [360, 390, 430]) {
  test(`상세와 전체 보기 사진 터치 넘기기 (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/v1/restaurants/155", (route) =>
      route.fulfill({
        json: {
          id: 155,
          name: "테스트 식당",
          foodCategory: "KOREAN",
          oneLineReview: "기록이 없습니다.",
          imageUrls: ["http://localhost:5173/assets/dummy.png", "http://localhost:5173/assets/Sinsa.png"],
        },
      }),
    );
    await page.goto("/restaurant/155");
    const surface = page.getByRole("button", { name: "식당 사진 전체 보기", exact: true });
    await expect(surface).toBeVisible();
    await expect(page.locator("main > div").first()).toHaveCSS("opacity", "1");
    const region = page.getByRole("region", { name: "식당 사진", exact: true });
    await swipe(page, surface, -90);
    await expect(region.locator('img[aria-hidden="false"]')).toHaveAttribute("alt", "테스트 식당 사진 2");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await swipe(page, surface, 90);
    await expect(region.locator('img[aria-hidden="false"]')).toHaveAttribute("alt", "테스트 식당 사진 1");
    await swipe(page, surface, 5, 60);
    await expect(region.locator('img[aria-hidden="false"]')).toHaveAttribute("alt", "테스트 식당 사진 1");
    await surface.tap();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await swipe(page, viewer.locator("img"), -90);
    await expect(viewer.getByText("2 / 2", { exact: true })).toBeVisible();
    await swipe(page, viewer.locator("img"), -90);
    await expect(viewer.getByText("1 / 2", { exact: true })).toBeVisible();
    await swipe(page, viewer.locator("img"), 90);
    await expect(viewer.getByText("2 / 2", { exact: true })).toBeVisible();
    await viewer.getByRole("button", { name: "전체 보기 다음 사진" }).click();
    await expect(viewer.getByText("1 / 2", { exact: true })).toBeVisible();
    await viewer.getByRole("button", { name: "사진 전체 보기 닫기" }).click();
    await expect(viewer).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}
